// frontend/src/lib/images.ts
// ✅ Image URL utilities for consistent image loading

import { config } from './config'

/**
 * Get backend base URL without /api/v1 suffix
 */
function getBackendBaseUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  return backendUrl
}

/**
 * Convert a database image path to a full URL
 * Handles paths like:
 * - "/files/image.jpg" -> "http://localhost:3001/files/image.jpg"
 * - "http://..." -> "http://..." (already absolute)
 * - "image.jpg" -> "http://localhost:3001/files/image.jpg"
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '/placeholder-product.svg' // Fallback to local placeholder (bundled SVG)
  }

  // Decode HTML entities if present (e.g., &#x2F; -> /, &amp; -> &)
  let decodedPath = path
  if (path.includes('&')) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = path
      decodedPath = textarea.value
    } else {
      // Basic server-side decode for common HTML entities
      decodedPath = path
        .replace(/&#x2F;/g, '/')  // &#x2F; -> /
        .replace(/&amp;/g, '&')  // &amp; -> &
        .replace(/&lt;/g, '<')   // &lt; -> <
        .replace(/&gt;/g, '>')   // &gt; -> >
        .replace(/&quot;/g, '"') // &quot; -> "
        .replace(/&#39;/g, "'")  // &#39; -> '
    }
  }

  // Repair common malformed absolute URLs like "http:/" or "https:/"
  if (/^https?:\/(?!\/)/.test(decodedPath)) {
    decodedPath = decodedPath
      .replace(/^http:\/(?!\/)/, 'http://')
      .replace(/^https:\/(?!\/)/, 'https://')
  }

  // If already absolute URL, return as-is (but normalize common issues)
  if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
    // Parse absolute URL to detect backend origin and convert to relative when applicable
    try {
      const u = new URL(decodedPath)
      const backendOrigin = new URL(getBackendBaseUrl()).origin
      if (u.origin === backendOrigin) {
        // Convert backend absolute to relative for Next.js rewrite compatibility
        let relPath = u.pathname
        // Fix known backend URL case where images are served under /files (not /api/v1/files)
        if (relPath.startsWith('/api/v1/')) {
          relPath = relPath.replace('/api/v1', '')
        }
        // Normalize accidental repeated /files segments or extra slashes
        relPath = normalizeFilePath(relPath)
        return relPath
      }
    } catch {
      // ignore URL parse errors, fallback to normalization below
    }
    // If different origin (e.g., CDN) → keep absolute but normalize common issues
    decodedPath = normalizeFilePath(decodedPath)
    return decodedPath
  }

  // Normalize accidental repeated /files segments or extra slashes
  decodedPath = normalizeFilePath(decodedPath)

  // If path is like "files/xyz.jpg" (missing leading slash), normalize to "/files/xyz.jpg"
  if (/^files\//.test(decodedPath)) {
    decodedPath = `/${decodedPath}`
    // Normalize after adding leading slash
    decodedPath = decodedPath
      .replace(/\/files\/+/g, '/files/')
      .replace(/\/files\/(?:files\/)+/g, '/files/')
      .replace(/\/files\/+/g, '/files/')
  }

  // If path starts with /files, return as-is (Next.js will proxy it)
  if (decodedPath.startsWith('/files/')) {
    return decodedPath
  }

  // If path starts with /, return as-is
  if (decodedPath.startsWith('/')) {
    return decodedPath
  }

  // Otherwise, assume it's a filename and add /files/ prefix
  return `/files/${decodedPath}`
}

/**
 * Get product image URL with fallback
 */
export function getProductImageUrl(
  product: { images?: Array<{ url: string }> } | null | undefined
): string {
  const firstImage = product?.images?.[0]?.url
  return getImageUrl(firstImage)
}

/**
 * Get multiple product image URLs
 */
export function getProductImageUrls(
  product: { images?: Array<{ url: string }> } | null | undefined
): string[] {
  if (!product?.images || product.images.length === 0) {
    return [getImageUrl(null)]
  }

  return product.images.map((img) => getImageUrl(img.url))
}

const images = {
  getImageUrl,
  getProductImageUrl,
  getProductImageUrls,
};

export default images;

// Helper function to normalize file paths and remove duplicates
function normalizeFilePath(path: string): string {
  return path
    // First collapse any extra slashes after /files/
    .replace(/\/files\/+/g, '/files/')
    // Then collapse duplicated segments like /files/files/... -> /files/...
    .replace(/\/files\/(?:files\/)+/g, '/files/')
    // Finally ensure no residual double slashes remain
    .replace(/\/files\/+/g, '/files/')
}
