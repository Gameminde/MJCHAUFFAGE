import { Router, Request, Response } from 'express';
import { CacheService } from '@/services/cacheService';
import { logger } from '@/utils/logger';

const router = Router();

const GEO_TTL_SECONDS = 3600; // 1 hour
const FALLBACK_TTL_SECONDS = 300; // 5 minutes
const GEO_TIMEOUT_MS = 1500;
const GEO_MAX_RETRIES = 2;

function getClientIp(req: Request): string {
  const xf = (req.headers['x-forwarded-for'] as string | undefined) || '';
  const first = xf ? xf.split(',')[0].trim() : '';
  const raw = first || req.ip || '';
  return raw.replace(/^::ffff:/, '');
}

async function fetchGeo(ip: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
  try {
    const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : 'https://ipapi.co/json/';
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`ipapi non-OK: ${response.status}`);
    const data = await response.json();
    return {
      country: data.country || data.country_name || null,
      city: data.city || null,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(ip: string) {
  let lastErr: any;
  for (let attempt = 0; attempt <= GEO_MAX_RETRIES; attempt++) {
    try {
      return await fetchGeo(ip);
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  throw lastErr;
}

router.get('/', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const cacheKey = `geo:${ip || 'unknown'}`;

  const cached = await CacheService.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const result = await fetchWithRetry(ip);
    await CacheService.set(cacheKey, result, GEO_TTL_SECONDS, ['geolocation']);
    return res.json(result);
  } catch (error: any) {
    logger.warn('Geolocation lookup failed', { ip, message: error?.message });
    const fallback = { country: null, city: null };
    await CacheService.set(cacheKey, fallback, FALLBACK_TTL_SECONDS, ['geolocation']);
    return res.json(fallback);
  }
});

export default router;
