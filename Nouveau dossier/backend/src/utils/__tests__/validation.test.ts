import { vi, describe, it, expect } from 'vitest';
import { validateProductData, validateUserData, sanitizeInput } from '../validation';

// Set up jest compatibility
(global as any).jest = vi;

describe('Validation Utils', () => {
  describe('validateProductData', () => {
    it('should validate valid product data', () => {
      const validData = {
        name: 'Test Product',
        price: 1000,
        categoryId: 'cat1',
        manufacturerId: 'man1',
        stockQuantity: 10,
        sku: 'TEST-001',
      };

      const result = validateProductData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid product name', () => {
      const invalidData = {
        name: '', // Empty name
        price: 1000,
        categoryId: 'cat1',
        manufacturerId: 'man1',
        stockQuantity: 10,
        sku: 'TEST-001',
      };

      const result = validateProductData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le nom du produit est requis');
    });

    it('should reject negative price', () => {
      const invalidData = {
        name: 'Test Product',
        price: -100, // Negative price
        categoryId: 'cat1',
        manufacturerId: 'man1',
        stockQuantity: 10,
        sku: 'TEST-001',
      };

      const result = validateProductData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le prix doit être positif');
    });

    it('should reject invalid SKU format', () => {
      const invalidData = {
        name: 'Test Product',
        price: 1000,
        categoryId: 'cat1',
        manufacturerId: 'man1',
        stockQuantity: 10,
        sku: 'invalid sku with spaces', // Invalid SKU
      };

      const result = validateProductData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le SKU doit contenir uniquement des lettres, chiffres et tirets');
    });

    it('should reject negative stock quantity', () => {
      const invalidData = {
        name: 'Test Product',
        price: 1000,
        categoryId: 'cat1',
        manufacturerId: 'man1',
        stockQuantity: -5, // Negative stock
        sku: 'TEST-001',
      };

      const result = validateProductData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La quantité en stock ne peut pas être négative');
    });
  });

  describe('validateUserData', () => {
    it('should validate valid user data', () => {
      const validData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'StrongPass123!',
      };

      const result = validateUserData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email
        firstName: 'John',
        lastName: 'Doe',
        password: 'StrongPass123!',
      };

      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Adresse email invalide');
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'weak', // Too short and weak
      };

      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
    });

    it('should reject empty first name', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: '', // Empty first name
        lastName: 'Doe',
        password: 'StrongPass123!',
      };

      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le prénom est requis');
    });

    it('should reject empty last name', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: '', // Empty last name
        password: 'StrongPass123!',
      };

      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le nom de famille est requis');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should handle null input', () => {
      const sanitized = sanitizeInput(null);
      expect(sanitized).toBe('');
    });

    it('should handle undefined input', () => {
      const sanitized = sanitizeInput(undefined);
      expect(sanitized).toBe('');
    });

    it('should handle empty string', () => {
      const sanitized = sanitizeInput('');
      expect(sanitized).toBe('');
    });

    it('should sanitize SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('DROP TABLE users');
    });

    it('should preserve normal text', () => {
      const input = 'Hello World! This is a normal message.';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World! This is a normal message.');
    });

    it('should handle special characters', () => {
      const input = 'Café & Restaurant - 50% off!';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Café & Restaurant - 50% off!');
    });
  });
});

