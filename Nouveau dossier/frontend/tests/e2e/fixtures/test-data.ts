// Test data fixtures for E2E tests

export const testUser = {
  email: 'test@mjchauffage.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+213555123456',
  address: {
    street: '123 Test Street',
    city: 'Algiers',
    postalCode: '16000',
    country: 'Algeria'
  }
};

export const testAdmin = {
  email: 'admin@mjchauffage.com',
  password: 'AdminPassword123!',
  firstName: 'Admin',
  lastName: 'User'
};

export const testProduct = {
  name: 'Test Heating System',
  description: 'A test heating system for E2E testing',
  price: 15000,
  category: 'Heating Systems',
  brand: 'Test Brand',
  model: 'TEST-001',
  inStock: true,
  quantity: 10,
  images: ['test-product-1.jpg', 'test-product-2.jpg']
};

export const testService = {
  name: 'Test Installation Service',
  description: 'Test installation service for E2E testing',
  price: 5000,
  duration: 120, // minutes
  category: 'Installation'
};

export const testOrder = {
  items: [
    {
      productId: 'test-product-1',
      quantity: 2,
      price: 15000
    }
  ],
  shippingAddress: {
    street: '456 Delivery Street',
    city: 'Oran',
    postalCode: '31000',
    country: 'Algeria'
  },
  paymentMethod: 'stripe',
  notes: 'Test order for E2E testing'
};

export const testAppointment = {
  serviceId: 'test-service-1',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  time: '10:00',
  customerInfo: {
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '+213555987654',
    address: '789 Service Address, Algiers'
  },
  notes: 'Test appointment for E2E testing'
};

export const analyticsEvents = {
  pageView: {
    page: '/products',
    title: 'Products - MJ CHAUFFAGE',
    referrer: 'https://google.com'
  },
  productView: {
    productId: 'test-product-1',
    productName: 'Test Heating System',
    category: 'Heating Systems',
    price: 15000
  },
  addToCart: {
    productId: 'test-product-1',
    quantity: 1,
    price: 15000
  },
  purchase: {
    orderId: 'test-order-1',
    total: 30000,
    items: [
      {
        productId: 'test-product-1',
        quantity: 2,
        price: 15000
      }
    ]
  }
};