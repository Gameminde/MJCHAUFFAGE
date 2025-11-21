import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { testUser, testProduct, testOrder, testService, testAppointment } from '../e2e/fixtures/test-data';

// Mock server setup for integration testing
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

describe('API Integration Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testProductId: string;
  let testOrderId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup test environment
    console.log('Setting up API integration tests...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up API integration tests...');
  });

  describe('Authentication API', () => {
    test('should register a new user', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const userData = {
        ...testUser,
        email: uniqueEmail
      };

      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(uniqueEmail);
      
      testUserId = response.body.user.id;
      authToken = response.body.token;
    });

    test('should login with valid credentials', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate JWT token', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUserId);
    });

    test('should refresh JWT token', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(authToken);
    });
  });

  describe('Products API', () => {
    test('should get all products', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    test('should get products with filters', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/products')
        .query({
          category: 'Heating Systems',
          minPrice: 10000,
          maxPrice: 50000,
          inStock: true
        })
        .expect(200);

      expect(Array.isArray(response.body.products)).toBe(true);
      
      // Verify filtering worked
      response.body.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(10000);
        expect(product.price).toBeLessThanOrEqual(50000);
        expect(product.inStock).toBe(true);
      });
    });

    test('should search products', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/products/search')
        .query({ q: 'heating' })
        .expect(200);

      expect(Array.isArray(response.body.products)).toBe(true);
      
      // Verify search results contain the search term
      response.body.products.forEach((product: any) => {
        const searchableText = `${product.name} ${product.description}`.toLowerCase();
        expect(searchableText).toContain('heating');
      });
    });

    test('should get product by ID', async () => {
      // First get a product ID
      const productsResponse = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      const productId = productsResponse.body.products[0].id;

      const response = await request(API_BASE_URL)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', productId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    test('should return 404 for non-existent product', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/products/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cart API', () => {
    beforeEach(async () => {
      // Clear cart before each test
      await request(API_BASE_URL)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);
    });

    test('should add item to cart', async () => {
      // Get a product to add to cart
      const productsResponse = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      const product = productsResponse.body.products[0];

      const response = await request(API_BASE_URL)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: product.id,
          quantity: 2
        })
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(2);
      expect(response.body.cart.items[0].productId).toBe(product.id);
    });

    test('should get cart contents', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('items');
      expect(response.body.cart).toHaveProperty('total');
    });

    test('should update cart item quantity', async () => {
      // First add an item
      const productsResponse = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      const product = productsResponse.body.products[0];

      await request(API_BASE_URL)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: product.id,
          quantity: 1
        });

      // Update quantity
      const response = await request(API_BASE_URL)
        .put(`/api/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.cart.items[0].quantity).toBe(3);
    });

    test('should remove item from cart', async () => {
      // First add an item
      const productsResponse = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      const product = productsResponse.body.products[0];

      await request(API_BASE_URL)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: product.id,
          quantity: 1
        });

      // Remove item
      const response = await request(API_BASE_URL)
        .delete(`/api/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cart.items).toHaveLength(0);
    });

    test('should clear entire cart', async () => {
      // Add multiple items
      const productsResponse = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      const products = productsResponse.body.products.slice(0, 2);

      for (const product of products) {
        await request(API_BASE_URL)
          .post('/api/cart/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: product.id,
            quantity: 1
          });
      }

      // Clear cart
      const response = await request(API_BASE_URL)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cart.items).toHaveLength(0);
    });
  });

  describe('Orders API', () => {
    test('should create a new order', async () => {
      // First add items to cart
      const productsResponse = await request(API_BASE_URL)
        .get('/api/products')
        .expect(200);

      const product = productsResponse.body.products[0];

      await request(API_BASE_URL)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: product.id,
          quantity: 1
        });

      // Create order
      const orderData = {
        shippingAddress: testOrder.shippingAddress,
        paymentMethod: 'cod',
        notes: testOrder.notes
      };

      const response = await request(API_BASE_URL)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('orderNumber');
      expect(response.body.order.status).toBe('pending');
      
      testOrderId = response.body.order.id;
    });

    test('should get user orders', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    test('should get order by ID', async () => {
      const response = await request(API_BASE_URL)
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testOrderId);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
    });

    test('should track order status', async () => {
      const response = await request(API_BASE_URL)
        .get(`/api/orders/${testOrderId}/tracking`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('statusHistory');
      expect(Array.isArray(response.body.statusHistory)).toBe(true);
    });
  });

  describe('Services API', () => {
    test('should get all services', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/services')
        .expect(200);

      expect(Array.isArray(response.body.services)).toBe(true);
      response.body.services.forEach((service: any) => {
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('price');
      });
    });

    test('should book a service appointment', async () => {
      // Get available services
      const servicesResponse = await request(API_BASE_URL)
        .get('/api/services')
        .expect(200);

      const service = servicesResponse.body.services[0];

      const appointmentData = {
        serviceId: service.id,
        date: testAppointment.date.toISOString(),
        time: testAppointment.time,
        customerInfo: testAppointment.customerInfo,
        notes: testAppointment.notes
      };

      const response = await request(API_BASE_URL)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('appointment');
      expect(response.body.appointment).toHaveProperty('id');
      expect(response.body.appointment).toHaveProperty('appointmentNumber');
      expect(response.body.appointment.status).toBe('pending');
    });

    test('should get available time slots', async () => {
      const servicesResponse = await request(API_BASE_URL)
        .get('/api/services')
        .expect(200);

      const service = servicesResponse.body.services[0];
      const date = new Date();
      date.setDate(date.getDate() + 7); // 7 days from now

      const response = await request(API_BASE_URL)
        .get(`/api/services/${service.id}/availability`)
        .query({ date: date.toISOString().split('T')[0] })
        .expect(200);

      expect(response.body).toHaveProperty('availableSlots');
      expect(Array.isArray(response.body.availableSlots)).toBe(true);
    });
  });

  describe('Analytics API', () => {
    test('should track page view', async () => {
      const analyticsData = {
        event_type: 'page_view',
        page_path: '/products',
        page_title: 'Products - MJ CHAUFFAGE',
        referrer: 'https://google.com',
        user_agent: 'Mozilla/5.0 Test Browser'
      };

      const response = await request(API_BASE_URL)
        .post('/api/analytics/track')
        .send(analyticsData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should track ecommerce event', async () => {
      const ecommerceData = {
        event_type: 'purchase',
        value: 25000,
        currency: 'DZD',
        items: [
          {
            product_id: 'test-product-1',
            quantity: 1,
            price: 25000
          }
        ]
      };

      const response = await request(API_BASE_URL)
        .post('/api/analytics/ecommerce')
        .send(ecommerceData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should get analytics dashboard data', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        })
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('pageViews');
      expect(response.body.metrics).toHaveProperty('sessions');
      expect(response.body.metrics).toHaveProperty('conversions');
    });

    test('should get traffic sources data', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/analytics/traffic-sources')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sources');
      expect(Array.isArray(response.body.sources)).toBe(true);
    });

    test('should get conversion funnel data', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/analytics/conversions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('funnel');
      expect(response.body.funnel).toHaveProperty('steps');
      expect(Array.isArray(response.body.funnel.steps)).toBe(true);
    });
  });

  describe('Admin API', () => {
    beforeAll(async () => {
      // Login as admin
      const response = await request(API_BASE_URL)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@mjchauffage.com',
          password: 'AdminPassword123!'
        })
        .expect(200);

      adminToken = response.body.token;
    });

    test('should create a new product', async () => {
      const productData = {
        ...testProduct,
        name: `Test Product ${Date.now()}`
      };

      const response = await request(API_BASE_URL)
        .post('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(productData.name);
      
      testProductId = response.body.product.id;
    });

    test('should update product', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 20000
      };

      const response = await request(API_BASE_URL)
        .put(`/api/admin/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.product.name).toBe(updateData.name);
      expect(response.body.product.price).toBe(updateData.price);
    });

    test('should get all orders for admin', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    test('should update order status', async () => {
      const updateData = {
        status: 'processing',
        notes: 'Order is being processed'
      };

      const response = await request(API_BASE_URL)
        .put(`/api/admin/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.order.status).toBe(updateData.status);
    });

    test('should get dashboard statistics', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalCustomers');
      expect(response.body).toHaveProperty('totalProducts');
    });

    test('should delete test product', async () => {
      const response = await request(API_BASE_URL)
        .delete(`/api/admin/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Real-time API', () => {
    test('should establish WebSocket connection', async () => {
      // This would require WebSocket testing setup
      // For now, we'll test the HTTP endpoints that support real-time features
      
      const response = await request(API_BASE_URL)
        .get('/api/realtime/status')
        .expect(200);

      expect(response.body).toHaveProperty('connected');
      expect(response.body).toHaveProperty('activeConnections');
    });

    test('should get real-time metrics', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/realtime/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('activeVisitors');
      expect(response.body).toHaveProperty('currentSessions');
      expect(response.body).toHaveProperty('recentOrders');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle missing required fields', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle unauthorized access', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/admin/products')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(10).fill(null).map(() =>
        request(API_BASE_URL)
          .post('/api/auth/login')
          .send({
            email: 'wrong@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});