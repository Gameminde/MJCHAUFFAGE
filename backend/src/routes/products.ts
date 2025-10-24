import { Router } from 'express';
import { ProductController } from '@/controllers/productController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { body } from 'express-validator';

const router = Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  
  body('slug')
    .trim()
    .isLength({ min: 2, max: 255 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('sku')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
];

const inventoryValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  
  body('type')
    .isIn(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'DAMAGE', 'RETURN'])
    .withMessage('Invalid inventory log type'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Reason cannot exceed 255 characters'),
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comment cannot exceed 1000 characters'),
];

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: manufacturer
 *         schema:
 *           type: string
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of category IDs (e.g., categories=uuid&categories=uuid) or comma-separated string
 *       - in: query
 *         name: manufacturers
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of manufacturer IDs (e.g., manufacturers=uuid&manufacturers=uuid) or comma-separated string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', ProductController.getProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured', ProductController.getFeaturedProducts);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get product categories
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: includeProducts
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', ProductController.getCategories);

/**
 * @swagger
 * /api/products/manufacturers:
 *   get:
 *     summary: Get manufacturers
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Manufacturers retrieved successfully
 */
router.get('/manufacturers', ProductController.getManufacturers);

/**
 * @swagger
 * /api/products/batch:
 *   post:
 *     summary: Get multiple products by IDs
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.post('/batch', [
  body('productIds').isArray().withMessage('Product IDs must be an array'),
  body('productIds.*').isUUID().withMessage('Each product ID must be a valid UUID'),
], ProductController.getBatchProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - sku
 *               - categoryId
 *               - price
 *               - stockQuantity
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               manufacturerId:
 *                 type: string
 *               price:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               minStock:
 *                 type: integer
 *               maxStock:
 *                 type: integer
 *               weight:
 *                 type: number
 *               dimensions:
 *                 type: object
 *               specifications:
 *                 type: object
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               isDigital:
 *                 type: boolean
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticateToken, requireAdmin, productValidation, ProductController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID or slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeRelated
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', ProductController.getProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.put('/:id', authenticateToken, requireAdmin, ProductController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/inventory:
 *   post:
 *     summary: Update product inventory (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - type
 *             properties:
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE, RETURN]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.post('/:id/inventory', authenticateToken, requireAdmin, inventoryValidation, ProductController.updateInventory);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 */
router.get('/:id/reviews', ProductController.getProductReviews);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     summary: Add product review (Authenticated users only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       409:
 *         description: User has already reviewed this product
 */
router.post('/:id/reviews', authenticateToken, reviewValidation, ProductController.addProductReview);

export default router;