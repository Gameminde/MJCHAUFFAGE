import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ProductService, ProductFilters } from '@/services/productService';

export class ProductController {
  /**
   * Get all products with filtering, pagination, and search
   */
  static async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        manufacturer,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        featured,
        inStock
      } = req.query;

      const filters: ProductFilters = {};
      
      if (search) filters.search = search as string;
      if (category) filters.categoryId = category as string;
      if (manufacturer) filters.manufacturerId = manufacturer as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (featured !== undefined) filters.featured = featured === 'true';
      if (inStock !== undefined) filters.inStock = inStock === 'true';

      const pagination = {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 50) // Max 50 items per page
      };

      const sort = {
        field: sortBy as string,
        order: sortOrder as 'asc' | 'desc'
      };

      const result = await ProductService.getProducts(filters, pagination, sort);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product by ID or slug
   */
  static async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const includeRelated = req.query.includeRelated === 'true';

      const product = await ProductService.getProductById(id, includeRelated);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { product },
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create a new product (Admin only)
   */
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const productData = req.body;
      const product = await ProductService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product },
      });
    } catch (error) {
      console.error('Create product error:', error);
      if (error instanceof Error && error.message.includes('unique constraint')) {
        res.status(409).json({
          success: false,
          message: 'Product with this SKU or slug already exists',
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update product (Admin only)
   */
  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      const product = await ProductService.updateProduct(id, updateData);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete product (Admin only)
   */
  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await ProductService.deleteProduct(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product categories
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const includeProducts = req.query.includeProducts === 'true';
      const categories = await ProductService.getCategories(includeProducts);

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get manufacturers
   */
  static async getManufacturers(_req: Request, res: Response): Promise<void> {
    try {
      const manufacturers = await ProductService.getManufacturers();

      res.json({
        success: true,
        data: { manufacturers },
      });
    } catch (error) {
      console.error('Get manufacturers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update product inventory (Admin only)
   */
  static async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const { quantity, type, reason } = req.body;

      const result = await ProductService.updateInventory(id, quantity, type, reason);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const reviews = await ProductService.getProductReviews(id, pagination);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add product review (Authenticated users only)
   */
  static async addProductReview(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const { id } = req.params;
      const customerId = req.user?.id;
      const { rating, title, comment } = req.body;

      if (!customerId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const review = await ProductService.addProductReview(
        id,
        customerId,
        rating,
        title,
        comment
      );

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: { review },
      });
    } catch (error) {
      console.error('Add product review error:', error);
      if (error instanceof Error && error.message.includes('already reviewed')) {
        res.status(409).json({
          success: false,
          message: 'You have already reviewed this product',
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 8 } = req.query;
      const products = await ProductService.getFeaturedProducts(parseInt(limit as string));

      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}