import { productService } from '../productService';
import { vi } from 'vitest';

// Mock jest with vi
global.jest = vi;

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock config
vi.mock('@/lib/config', () => ({
  config: {
    api: {
      baseURL: 'http://localhost:3001/api/v1',
    }
  }
}));

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('getProducts', () => {
    it('fetches products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 1000,
          images: [{ url: '/test.jpg' }],
        },
      ];

      const mockResponse = {
        success: true,
        data: {
          products: mockProducts,
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.getProducts({ page: 1, limit: 20 });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products?page=1&limit=20', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockProducts.map(product => expect.objectContaining({
        id: product.id,
        name: product.name,
        price: product.price,
        images: expect.any(Array)
      })));
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(productService.getProducts()).rejects.toThrow();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(productService.getProducts()).rejects.toThrow('Network error');
    });
  });

  describe('getProduct', () => {
    it('fetches single product successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 1000,
        images: [{ url: '/test.jpg' }],
      };

      const mockResponse = {
        success: true,
        data: { product: mockProduct },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.getProduct('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(expect.objectContaining({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        images: expect.any(Array)
      }));
    });

    it('handles product not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await productService.getProduct('999');
      expect(result).toBeNull();
    });
  });


  describe('getCategories', () => {
    it('fetches categories successfully', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1', slug: 'category-1' },
        { id: '2', name: 'Category 2', slug: 'category-2' },
      ];

      const mockResponse = {
        success: true,
        data: { categories: mockCategories },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.getCategories();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockCategories.map(cat => expect.objectContaining({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })));
    });
  });

  describe('getManufacturers', () => {
    it('fetches manufacturers successfully', async () => {
      const mockManufacturers = [
        { id: '1', name: 'Manufacturer 1', slug: 'manufacturer-1' },
        { id: '2', name: 'Manufacturer 2', slug: 'manufacturer-2' },
      ];

      const mockResponse = {
        success: true,
        data: { manufacturers: mockManufacturers },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.getManufacturers();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products/manufacturers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockManufacturers.map(mfg => expect.objectContaining({
        id: mfg.id,
        name: mfg.name,
        slug: mfg.slug
      })));
    });
  });

  describe('getFeaturedProducts', () => {
    it('fetches featured products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Featured Product',
          price: 1000,
          isFeatured: true,
        },
      ];

      const mockResponse = {
        success: true,
        data: { products: mockProducts },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.getFeaturedProducts();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products/featured', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockProducts.map(product => expect.objectContaining({
        id: product.id,
        name: product.name,
        price: product.price,
        isFeatured: true
      })));
    });
  });


  describe('createProduct', () => {
    it('creates product successfully', async () => {
      const productData = {
        name: 'New Product',
        price: 1500,
        categoryId: 'cat1',
      };

      const mockResponse = {
        success: true,
        data: { product: { id: 'new-id', ...productData } },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.createProduct(productData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      expect(result).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: productData.name,
        price: productData.price
      }));
    });
  });

  describe('updateProduct', () => {
    it('updates product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 2000,
      };

      const mockResponse = {
        success: true,
        data: { product: { id: '1', ...updateData } },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.updateProduct('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(expect.objectContaining({
        id: '1',
        name: updateData.name,
        price: updateData.price
      }));
    });
  });

  describe('deleteProduct', () => {
    it('deletes product successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Product deleted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productService.deleteProduct('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/products/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toBeUndefined();
    });
  });
});
