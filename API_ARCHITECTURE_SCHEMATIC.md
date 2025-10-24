# MJ CHAUFFAGE - API Architecture Schematic

## Overview
This document provides a visual representation of the API calls between the frontend, admin dashboard, and backend services.

## Architecture Components

### 1. Frontend (Next.js - Port 3000)
- **Product List Page**: `/fr/products`
- **Product Detail Page**: `/fr/products/:id`
- **Product Card Component**: Displays product information
- **Add to Cart Button**: Handles cart operations
- **SSR API Functions**: 
  - `fetchProductsSSR()` - Server-side product fetching
  - `fetchProductDetailSSR()` - Server-side product detail fetching

### 2. Admin Dashboard (Next.js - Port 3002)
- **Products List Page**: `/dashboard/products`
- **New Product Page**: `/dashboard/products/new`
- **Product Management API**:
  - `productsApi.getAll()` - Fetch all products
  - `productsApi.create()` - Create new product
  - `productsApi.update()` - Update existing product
  - `productsApi.delete()` - Delete product
- **Image Upload API**:
  - `uploadsApi.uploadImage()` - Upload product images

### 3. Backend API (Express.js - Port 3001)
- **Products Routes**: `/api/v1/products`
  - `GET /` - Get all products with filtering/pagination
  - `GET /:id` - Get product by ID
  - `POST /` - Create new product (Admin only)
  - `PUT /:id` - Update product (Admin only)
  - `DELETE /:id` - Delete product (Admin only)
- **Upload Routes**: `/api/v1/uploads`
  - `POST /` - Upload image file (Admin only)
- **Static File Server**: `/uploads/*` - Serve uploaded images

### 4. Database (PostgreSQL)
- **Products Table**: Store product information
- **Categories Table**: Store product categories
- **Images Table**: Store image metadata

### 5. File Storage
- **Local Uploads Directory**: `/uploads/` - Store uploaded files

## API Call Flow

### Frontend Product Display Flow
```
1. User visits /fr/products
2. ClientProductsPage component loads
3. fetchProductsSSR() called (server-side)
4. API call to GET /api/v1/products
5. ProductController.getProducts() processes request
6. ProductService.getProducts() queries database
7. Response sent back through API layers
8. Products displayed in ProductCard components
```

### Product Detail Flow
```
1. User clicks product link
2. Navigate to /fr/products/:id
3. fetchProductDetailSSR() called (server-side)
4. API call to GET /api/v1/products/:id
5. ProductController.getProduct() processes request
6. ProductService.getProductById() queries database
7. Product detail page rendered with data
```

### Admin Product Creation Flow
```
1. Admin visits /dashboard/products/new
2. Form submission with product data
3. Image upload via uploadsApi.uploadImage()
4. API call to POST /api/v1/uploads
5. UploadController handles file upload
6. File saved to /uploads/ directory
7. Product creation via productsApi.create()
8. API call to POST /api/v1/products
9. ProductController.createProduct() processes request
10. ProductService.createProduct() saves to database
11. Success response and redirect to products list
```

### Image Display Flow
```
1. Product has image URL from database
2. Image URL points to /uploads/filename.jpg
3. Backend static file server serves image
4. Frontend displays image in ProductCard
5. Admin dashboard displays image in product list
```

## Environment Configuration

### Frontend (.env.development)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretkey
```

### Admin Dashboard (api.ts)
```
API_BASE_URL=http://localhost:3001/api/v1
```

### Backend (server.ts)
```
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Key Fixes Applied

1. **Fixed Product Detail Routing**: Removed `/details/` from URL pattern
2. **Fixed Image Display**: Updated admin dashboard to show actual product images
3. **Fixed API Configuration**: Corrected admin dashboard API URL to use port 3001
4. **Fixed Text Display**: Ensured proper text rendering in all components

## API Endpoints Summary

### Public Endpoints (No Auth Required)
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/categories` - Get categories
- `GET /api/v1/products/featured` - Get featured products
- `GET /uploads/*` - Serve static files

### Admin Endpoints (Auth Required)
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `POST /api/v1/uploads` - Upload image
- `POST /api/v1/products/:id/inventory` - Update inventory

## Security Considerations

1. **Authentication**: JWT tokens for admin operations
2. **File Upload**: Multer with file type validation
3. **Rate Limiting**: Applied to prevent abuse
4. **Input Validation**: Express-validator for data sanitization
5. **CORS**: Configured for allowed origins

## Performance Optimizations

1. **SSR Caching**: React cache for server-side rendering
2. **Image Optimization**: Next.js Image component
3. **Database Indexing**: Optimized queries
4. **Static File Serving**: Efficient file delivery
5. **Pagination**: Implemented for large datasets

This schematic provides a complete overview of the API architecture and can be used as a reference when making changes to the system.
