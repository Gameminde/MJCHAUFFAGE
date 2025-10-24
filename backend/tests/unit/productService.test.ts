/// <reference types="jest" />
/// <reference types="jest" />
import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { ProductService } from '@/services/productService';

const prisma = new PrismaClient();

describe('ProductService', () => {
  beforeAll(async () => {
    // You can seed initial data here if needed for all tests in this file
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.manufacturer.deleteMany({});
  });

  describe('getFeaturedProducts', () => {
    it('should return an empty array when no featured products exist', async () => {
      const featuredProducts = await ProductService.getFeaturedProducts(5);
      expect(featuredProducts).toEqual([]);
      expect(featuredProducts.length).toBe(0);
    });

    it('should return only featured products', async () => {
      // Arrange: Create a category first
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category',
        },
      });

      // Arrange: Create some products
      await prisma.product.createMany({
        data: [
          {
            name: 'Featured Product 1',
            slug: 'featured-1',
            sku: 'FP001',
            price: 100,
            isFeatured: true,
            categoryId: category.id,
            stockQuantity: 10,
          },
          {
            name: 'Regular Product',
            slug: 'regular-1',
            sku: 'RP001',
            price: 50,
            isFeatured: false,
            categoryId: category.id,
            stockQuantity: 10,
          },
          {
            name: 'Featured Product 2',
            slug: 'featured-2',
            sku: 'FP002',
            price: 120,
            isFeatured: true,
            categoryId: category.id,
            stockQuantity: 10,
          },
        ],
      });

      // Act
      const featuredProducts = await ProductService.getFeaturedProducts(5);

      // Assert
      expect(featuredProducts).toHaveLength(2);
      expect(featuredProducts.every((p) => p.isFeatured)).toBe(true);
      expect(featuredProducts.map(p => p.name)).toEqual(
        expect.arrayContaining(['Featured Product 1', 'Featured Product 2'])
      );
    });

    it('should respect the limit parameter', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category Limit',
          slug: 'test-category-limit',
        },
      });

      await prisma.product.createMany({
        data: [
          { name: 'FP1', slug: 'fp1', sku: 'FP001-L', price: 100, isFeatured: true, categoryId: category.id, stockQuantity: 10 },
          { name: 'FP2', slug: 'fp2', sku: 'FP002-L', price: 100, isFeatured: true, categoryId: category.id, stockQuantity: 10 },
          { name: 'FP3', slug: 'fp3', sku: 'FP003-L', price: 100, isFeatured: true, categoryId: category.id, stockQuantity: 10 },
        ],
      });

      const featuredProducts = await ProductService.getFeaturedProducts(2);

      expect(featuredProducts).toHaveLength(2);
    });
  });
});
