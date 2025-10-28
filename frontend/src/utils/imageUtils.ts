// frontend/src/utils/imageUtils.ts
// Utility functions for handling product images

import { config } from '@/lib/config';

/**
 * Convert relative image URLs to absolute URLs
 * Backend returns URLs like '/files/image.jpg' which need the backend base URL
 * Backend serves static files at http://localhost:3001/files/ (NOT /api/v1/files/)
 */
export function getFullImageUrl(imageUrl: string | undefined | null): string {
  // Return placeholder if no image
  if (!imageUrl) {
    return '/screenshots/desktop.png';
  }

  // If already absolute URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Backend serves files at /files/, /images/ (NOT under /api/v1/)
  // So we need to use the base server URL without /api/v1
  const backendServerUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; // Base server, not API endpoint

  // For relative paths like '/files/image.jpg' or '/images/image.jpg'
  if (imageUrl.startsWith('/files/') || imageUrl.startsWith('/images/')) {
    return `${backendServerUrl}${imageUrl}`;
  }

  // For paths starting with /
  if (imageUrl.startsWith('/')) {
    return `${backendServerUrl}${imageUrl}`;
  }

  // For paths without leading slash, assume it's a filename
  return `${backendServerUrl}/files/${imageUrl}`;
}

/**
 * Extract image URL from various image object formats
 */
export function extractImageUrl(image: string | { url: string } | undefined | null): string {
  if (!image) {
    return '/screenshots/desktop.png';
  }

  if (typeof image === 'string') {
    return getFullImageUrl(image);
  }

  if (typeof image === 'object' && image.url) {
    return getFullImageUrl(image.url);
  }

  return '/screenshots/desktop.png';
}

/**
 * Get the first image from a product's images array
 */
export function getProductImage(images: any[] | undefined | null): string {
  if (!images || images.length === 0) {
    return '/screenshots/desktop.png';
  }

  return extractImageUrl(images[0]);
}

const imageUtils = {
  getFullImageUrl,
  extractImageUrl,
  getProductImage,
};

export default imageUtils;
