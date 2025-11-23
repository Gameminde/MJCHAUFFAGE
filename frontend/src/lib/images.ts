// frontend/src/lib/images.ts
// ✅ Image URL utilities for consistent image loading

/**
 * Convert a database image path to a full URL
 * Handles paths like:
 * - "http://..." -> "http://..." (already absolute)
 * - "/files/image.jpg" -> "/files/image.jpg" (relative)
 * - "image.jpg" -> "/files/image.jpg" (legacy fallback)
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '/placeholder-product.svg' // Fallback to local placeholder (bundled SVG)
  }

  // If path is just a placeholder or empty, return the local placeholder
  if (path === '/placeholder-product.svg' || path === 'placeholder-product.svg' || path.trim() === '') {
    return '/placeholder-product.svg'
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

  // If already absolute URL, return as-is
  if (decodedPath.startsWith('http://') || decodedPath.startsWith('https://')) {
    return decodedPath
  }

  // Normalize accidental repeated /files segments or extra slashes
  decodedPath = normalizeFilePath(decodedPath)

  // If path is like "files/xyz.jpg" (missing leading slash), normalize to "/files/xyz.jpg"
  if (/^files\//.test(decodedPath)) {
    decodedPath = `/${decodedPath}`
    // Normalize after adding leading slash
    decodedPath = normalizeFilePath(decodedPath)
  }

  // If path starts with /files, return as-is
  if (decodedPath.startsWith('/files/')) {
    return decodedPath
  }

  // If path starts with /, return as-is
  if (decodedPath.startsWith('/')) {
    return decodedPath
  }

  // Otherwise, assume it's a filename and add /files/ prefix (legacy compatibility)
  return `/files/${decodedPath}`
}

/**
 * Get localized placeholder image based on category and locale
 */
function getLocalizedPlaceholder(categoryName: string, categorySlug: string, locale: string = 'fr'): string {
  const isArabic = locale === 'ar'

  // Category-specific fallbacks with localization
  if (categoryName.includes('chaudière') || categorySlug.includes('boiler')) {
    return '/chaudiere-a-gaz-1024x683-removebg-preview.png'
  }
  if (categoryName.includes('radiateur') || categorySlug.includes('radiator')) {
    return '/placeholder-radiator.svg'
  }
  if (categoryName.includes('brûleur') || categorySlug.includes('burner')) {
    return '/placeholder-burner.svg'
  }
  if (categoryName.includes('chauffe') || categorySlug.includes('heating')) {
    return '/chaudiere-a-gaz-1024x683-removebg-preview.png'
  }
  if (categoryName.includes('climatisation') || categorySlug.includes('air-conditioning')) {
    return isArabic ? '/placeholder-ac-ar.svg' : '/placeholder-ac.svg'
  }

  // Default fallback - could be localized in the future
  return '/placeholder-product.svg'
}

/**
 * Get product image URL with fallback based on category and locale
 */
export function getProductImageUrl(
  product: { images?: Array<{ url: string }>; category?: { name?: string; slug?: string } } | null | undefined,
  locale: string = 'fr'
): string {
  const firstImage = product?.images?.[0]?.url

  // If product has images, use them
  if (firstImage) {
    return getImageUrl(firstImage)
  }

  // Fallback based on category and locale
  const categoryName = product?.category?.name?.toLowerCase() || ''
  const categorySlug = product?.category?.slug?.toLowerCase() || ''

  return getLocalizedPlaceholder(categoryName, categorySlug, locale)
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
