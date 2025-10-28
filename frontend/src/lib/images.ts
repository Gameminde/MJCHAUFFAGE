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
    return '/placeholder-product.png' // Fallback to local placeholder
  }

  // Decode HTML entities if present (e.g., &#x2F; -> /)
  let decodedPath = path
  if (path.includes('&#x')) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = path
      decodedPath = textarea.value
    } else {
      // Basic server-side decode for common entity &#x2F; -> '/'
      decodedPath = path.replace(/&#x2F;/g, '/')
    }
  }

  // If already absolute URL, return as-is
  if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
    // Fix known backend URL case where images are served under /files (not /api/v1/files)
    if (/^https?:\/\/[^/]+\/api\/v1\/files\//.test(decodedPath)) {
      return decodedPath.replace('/api/v1', '')
    }
    return decodedPath
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
