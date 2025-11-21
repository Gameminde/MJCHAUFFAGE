# Fix: Image Loading Issue

## Problem
Images were not displaying in the website or admin dashboard because:
1. Database stores relative paths like `/files/image.jpg`
2. Backend serves images at `http://localhost:3001/files/` 
3. Frontend wasn't constructing full URLs correctly

## Database Image Storage
Images are stored in the `product_images` table with paths like:
```
/files/e30364e261ba3fde336e690736491cac-1760736869492.jpg
/files/img_6764-aa2533ce-2c50-4478-8329-68ed661219a8.jpg
```

## Backend Configuration
- **Storage location**: `backend/uploads/` directory (local filesystem)
- **Upload route**: `POST /api/uploads` (admin only)
- **Static file serving**: `GET /files/*` (served at line 100 in `backend/src/server.ts`)
- **CORS**: Properly configured with `Access-Control-Allow-Origin: *` for images

## Solution Implemented

### 1. Created Image URL Utility (`frontend/src/lib/images.ts`)
```typescript
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '/placeholder-product.png'
  }

  // If already absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

  // If path starts with /files, use it directly
  if (path.startsWith('/files/')) {
    return `${backendUrl}${path}`
  }

  // Otherwise, assume it's a filename and add /files/ prefix
  return `${backendUrl}/files/${path}`
}
```

This utility:
- Handles null/undefined paths → returns placeholder
- Preserves absolute URLs (e.g., from external CDN)
- Converts relative paths to full URLs using backend base URL
- Works with paths starting with `/files/` or just filenames

### 2. Updated Components

#### Frontend (Public Site)
- ✅ `ModernProductCard.tsx` - Uses `getImageUrl()` for product images
- ✅ `ProductCard.tsx` - Uses `getImageUrl()` for product images
- ✅ `ProductImage.tsx` - Uses `getImageUrl()` for image rendering

#### Admin Dashboard
- ✅ `ProductsManagement.tsx`:
  - Image preview during upload
  - Product table thumbnail display
  - Fallback to placeholder icon when no image

### 3. Environment Variables
Already configured in `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## How It Works

### Image Upload Flow
1. Admin selects image in dashboard
2. Image uploaded to `POST /api/uploads`
3. Backend saves to `backend/uploads/`
4. Returns relative path: `/files/filename.jpg`
5. Database stores this relative path
6. Frontend converts to full URL when displaying

### Image Display Flow
1. Component receives product with `images: [{ url: "/files/xyz.jpg" }]`
2. `getImageUrl("/files/xyz.jpg")` → `"http://localhost:3001/files/xyz.jpg"`
3. Browser fetches image from backend
4. Backend serves from `uploads/` directory with proper CORS headers

## Testing

### Check if images load:
1. Open browser DevTools → Network tab
2. Navigate to products page
3. Look for requests to `http://localhost:3001/files/*`
4. Should return 200 status with image

### If images still don't load:
1. **Check backend is running**: `http://localhost:3001/health`
2. **Verify image exists**: Check `backend/uploads/` directory
3. **Test direct URL**: Visit `http://localhost:3001/files/[filename]` in browser
4. **Check CORS**: Look for CORS errors in console

## Future: Cloudflare R2 Setup

For production, migrate to Cloudflare R2:

### 1. Add environment variables:
```bash
# backend/.env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
CLOUDFLARE_R2_BUCKET_NAME=mjchauffage-images
CLOUDFLARE_R2_PUBLIC_URL=https://images.mjchauffage.dz
```

### 2. Update upload service:
- Install `@aws-sdk/client-s3` (R2 is S3-compatible)
- Modify `backend/src/routes/uploads.ts` to upload to R2
- Store R2 URL in database instead of local path

### 3. Update image utility:
- No changes needed! Utility already handles absolute URLs
- R2 URLs will be like `https://images.mjchauffage.dz/file.jpg`

## Files Modified
- ✅ `frontend/src/lib/images.ts` (created)
- ✅ `frontend/src/components/products/ModernProductCard.tsx`
- ✅ `frontend/src/components/products/ProductCard.tsx`
- ✅ `frontend/src/components/common/ProductImage.tsx`
- ✅ `frontend/src/components/admin/ProductsManagement.tsx`

## Next Steps
1. Test image loading on all pages
2. Add placeholder images to `public/` folder
3. Consider image optimization (WebP, responsive sizes)
4. Set up Cloudflare R2 for production
