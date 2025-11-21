import request from 'supertest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../server';
import { prisma } from '../../lib/database';

// Mock prisma
vi.mock('../../lib/database', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    manufacturer: {
      findMany: vi.fn(),
    },
    productImage: {
      findMany: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('Products API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/products', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 1000,
          images: [{ url: '/test.jpg' }],
          category: { name: 'Test Category' },
          manufacturer: { name: 'Test Manufacturer' },
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/products?page=1&limit=20')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Category Product',
          categoryId: 'cat1',
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/products?category=cat1')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat1',
          }),
        })
      );
    });

    it('should filter products by manufacturer', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Manufacturer Product',
          manufacturerId: 'man1',
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/products?manufacturer=man1')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            manufacturerId: 'man1',
          }),
        })
      );
    });

    it('should filter featured products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Featured Product',
          isFeatured: true,
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/products?featured=true')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isFeatured: true,
          }),
        })
      );
    });

    it('should filter products by price range', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Price Range Product',
          price: 1500,
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/products?minPrice=1000&maxPrice=2000')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 1000,
              lte: 2000,
            },
          }),
        })
      );
    });

    it('should search products by query', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Search Result Product',
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/products?search=test+query')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test query', mode: 'insensitive' } },
              { description: { contains: 'test query', mode: 'insensitive' } },
              { shortDescription: { contains: 'test query', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should sort products by price ascending', async () => {
      const mockProducts = [
        { id: '1', name: 'Cheap Product', price: 500 },
        { id: '2', name: 'Expensive Product', price: 2000 },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/products?sortBy=price&sortOrder=asc')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/products')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erreur interne du serveur');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        name: 'Single Product',
        price: 1000,
        images: [{ url: '/test.jpg' }],
        category: { name: 'Test Category' },
        manufacturer: { name: 'Test Manufacturer' },
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.productImage.findMany.mockResolvedValue([{ url: '/test.jpg' }]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.name).toBe('Single Product');
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/products/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Produit non trouvé');
    });
  });

  describe('GET /api/v1/products/featured', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Featured Product',
          isFeatured: true,
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/v1/products/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isFeatured: true, isActive: true },
        })
      );
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1', slug: 'category-1' },
        { id: '2', name: 'Category 2', slug: 'category-2' },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCategories);
    });
  });

  describe('GET /api/v1/manufacturers', () => {
    it('should return all manufacturers', async () => {
      const mockManufacturers = [
        { id: '1', name: 'Manufacturer 1', slug: 'manufacturer-1' },
        { id: '2', name: 'Manufacturer 2', slug: 'manufacturer-2' },
      ];

      mockPrisma.manufacturer.findMany.mockResolvedValue(mockManufacturers);

      const response = await request(app)
        .get('/api/v1/manufacturers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockManufacturers);
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should search products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Search Result',
          price: 1000,
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.manufacturer.findMany.mockResolvedValue([]);
      mockPrisma.productImage.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/products/search?q=test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
              { shortDescription: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should return error for empty search query', async () => {
      const response = await request(app)
        .get('/api/v1/products/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Query parameter "q" is required');
    });
  });

  describe('POST /api/v1/admin/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        price: 1500,
        categoryId: 'cat1',
        manufacturerId: 'man1',
        stockQuantity: 10,
      };

      const createdProduct = {
        id: 'new-id',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post('/api/v1/admin/products')
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('new-id');
      expect(response.body.data.name).toBe('New Product');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/admin/products')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation error');
    });
  });

  describe('PUT /api/v1/admin/products/:id', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 2000,
      };

      const updatedProduct = {
        id: '1',
        name: 'Updated Product',
        price: 2000,
        updatedAt: new Date(),
      };

      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put('/api/v1/admin/products/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Product');
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.update.mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .put('/api/v1/admin/products/999')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Produit non trouvé');
    });
  });

  describe('DELETE /api/v1/admin/products/:id', () => {
    it('should delete a product', async () => {
      mockPrisma.product.delete.mockResolvedValue({
        id: '1',
        name: 'Deleted Product',
      });

      const response = await request(app)
        .delete('/api/v1/admin/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Produit supprimé avec succès');
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.delete.mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .delete('/api/v1/admin/products/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Produit non trouvé');
    });
  });
});

