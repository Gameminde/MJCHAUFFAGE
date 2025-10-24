.cursor/environment.json‎
+2
-17
Lines changed: 2 additions & 17 deletions
Original file line number	Diff line number	Diff line change
@@ -1,19 +1,4 @@
{
  "agentCanUpdateSnapshot": true,
  "agentCanRunBackgroundTasks": true,
  "agentCanAccessFileSystem": true,
  "agentCanExecuteCommands": true,
  "agentCanManageProcesses": true,
  "backgroundMode": "enabled",
  "autoSave": true,
  "continuousMode": true,
  "githubIntegration": {
    "enabled": true,
    "usePersonalAccessToken": true,
    "fallbackToSSH": true
  },
  "authentication": {
    "timeoutSeconds": 300,
    "retryAttempts": 3
  }
  "snapshot": "snapshot-20251020-eb01a867-ef71-4fb1-99fd-672980954146",
  "terminals": []
}
‎API_ARCHITECTURE_SCHEMATIC.md‎
+155
Lines changed: 155 additions & 0 deletions


Original file line number	Diff line number	Diff line change
@@ -0,0 +1,155 @@
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
‎API_FLOW_DIAGRAM.txt‎
+119
Lines changed: 119 additions & 0 deletions
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,119 @@
MJ CHAUFFAGE - API Flow Diagram
=====================================
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Port 3000)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Product List Page          Product Detail Page          Product Card          │
│  /fr/products              /fr/products/:id            Component              │
│         │                           │                         │                │
│         └───────────────────────────┼─────────────────────────┘                │
│                                     │                                          │
│  ┌──────────────────────────────────┴─────────────────────────────────────┐    │
│  │                    SSR API Functions                                  │    │
│  │  fetchProductsSSR()    fetchProductDetailSSR()                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP Requests
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API (Port 3001)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │  Products Routes│    │  Upload Routes  │    │ Static Files    │            │
│  │  /api/v1/products│    │  /api/v1/uploads│    │  /uploads/*     │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│         │                           │                         │                │
│         └───────────────────────────┼─────────────────────────┘                │
│                                     │                                          │
│  ┌──────────────────────────────────┴─────────────────────────────────────┐    │
│  │                    Controllers                                        │    │
│  │  ProductController    UploadController                               │    │
│  │  - getProducts()      - handleImageUpload()                         │    │
│  │  - getProduct()                                                      │    │
│  │  - createProduct()                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                          │
│  ┌──────────────────────────────────┴─────────────────────────────────────┐    │
│  │                    Services                                          │    │
│  │  ProductService                                                     │    │
│  │  - getProducts()                                                    │    │
│  │  - getProductById()                                                 │    │
│  │  - createProduct()                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ Database Queries
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │  Products Table │    │ Categories Table│    │  Images Table   │            │
│  │  - id           │    │ - id            │    │ - id            │            │
│  │  - name         │    │ - name          │    │ - url           │            │
│  │  - description  │    │ - slug          │    │ - altText       │            │
│  │  - price        │    │ - description   │    │ - productId     │            │
│  │  - images       │    │                 │    │                 │            │
│  │  - categoryId   │    │                 │    │                 │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ File Storage
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FILE STORAGE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    Local Uploads Directory                             │    │
│  │  /uploads/                                                             │    │
│  │  ├── product-image-1234567890.jpg                                     │    │
│  │  ├── product-image-1234567891.png                                     │    │
│  │  └── ...                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ADMIN DASHBOARD (Port 3002)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │ Products List   │    │ New Product     │    │ Product API     │            │
│  │ /dashboard/     │    │ /dashboard/     │    │ productsApi     │            │
│  │ products        │    │ products/new    │    │ - getAll()      │            │
│  └─────────────────┘    └─────────────────┘    │ - create()      │            │
│         │                           │          │ - update()      │            │
│         └───────────────────────────┼──────────│ - delete()      │            │
│                                     │          └─────────────────┘            │
│                                     │                                        │
│  ┌──────────────────────────────────┴─────────────────────────────────────┐    │
│  │                    Upload API                                        │    │
│  │  uploadsApi.uploadImage()                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP Requests to Backend
                                     ▼
                                     (Same Backend API as above)
API CALL FLOWS:
===============
1. PRODUCT DISPLAY FLOW:
   Frontend → SSR API → Backend API → Database → Response
2. PRODUCT CREATION FLOW:
   Admin Dashboard → Product API → Backend API → Database
   Admin Dashboard → Upload API → Backend API → File Storage
3. IMAGE DISPLAY FLOW:
   Frontend/Admin → Backend Static Server → File Storage
FIXES APPLIED:
==============
✅ Fixed product detail routing (removed /details/ from URL)
✅ Fixed image display in admin dashboard
✅ Fixed API configuration (admin dashboard now uses port 3001)
✅ Fixed text display issues
✅ Created comprehensive API documentation
‎admin-v2/admin-frontend/src/app/dashboard/products/page.tsx‎
+12
-4
Lines changed: 12 additions & 4 deletions
Original file line number	Diff line number	Diff line change
@@ -128,10 +128,18 @@ export default function ProductsPage() {
                  <tr key={product.id} className="border-b">
                    <td className="h-12 px-4 align-middle">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
‎admin-v2/admin-frontend/src/lib/api.ts‎
+1
-1
Lines changed: 1 addition & 1 deletion
Original file line number	Diff line number	Diff line change
@@ -1,7 +1,7 @@
import axios, { AxiosError, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Configuration du client API
export const apiClient = axios.create({
‎backend/src/services/productService.ts‎
+10
-7
Lines changed: 10 additions & 7 deletions
Original file line number	Diff line number	Diff line change
@@ -214,7 +214,16 @@ export class ProductService {

    return {
      ...productDto,
      averageRating: Math.round(averageRating * 10)    const product = await prisma.product.create({
      averageRating: Math.round(averageRating * 10) / 10,
      relatedProducts: relatedDtos,
    };
  }
  /**
   * Create product
   */
  static async createProduct(data: ProductCreateData) {
    const product = await prisma.product.create({
      data: {
        ...data,
        // features is already a string from frontend, or convert array to string
@@ -225,12 +234,6 @@ export class ProductService {
        costPrice: data.costPrice || null,
        salePrice: data.salePrice || null,
        weight: data.weight || null,
      },       ...data,
        features: JSON.stringify(data.features || []),
        price: data.price,
        costPrice: data.costPrice || null,
        salePrice: data.salePrice || null,
        weight: data.weight || null,
      },
      include: {
        category: true,
‎cursor_install.sh‎
-183
Lines changed: 0 additions & 183 deletions
This file was deleted.
‎frontend/src/app/[locale]/products/ClientProductsPage.tsx‎
+1
-1
Lines changed: 1 addition & 1 deletion
Original file line number	Diff line number	Diff line change
@@ -355,7 +355,7 @@ export default function ClientProductsPage({
                        className="flex-1"
                      />
                      <Link
                        href={`/${locale}/products/details/${product.id}`}
                        href={`/${locale}/products/${product.id}`}
                        className="px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
