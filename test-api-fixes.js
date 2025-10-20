#!/usr/bin/env node

/**
 * Test script to verify API fixes
 * Run with: node test-api-fixes.js
 */

const fetch = require('node-fetch');
const { io } = require('socket.io-client');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function testEndpoint(method, endpoint, body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => null);

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function runTests() {
  logSection('API ENDPOINT TESTS');

  // Test 1: Health Check
  log('Testing health endpoint...', 'yellow');
  const health = await testEndpoint('GET', '/health');
  if (health.ok) {
    log('✅ Health check passed', 'green');
  } else {
    log('❌ Health check failed', 'red');
  }

  // Test 2: API v1 Routes
  log('\nTesting /api/v1 routes...', 'yellow');
  
  // Test products endpoint
  const productsV1 = await testEndpoint('GET', '/api/v1/products');
  if (productsV1.ok) {
    log('✅ /api/v1/products accessible', 'green');
    log(`   Found ${productsV1.data?.data?.products?.length || 0} products`, 'cyan');
  } else {
    log('❌ /api/v1/products failed', 'red');
  }

  // Test categories
  const categories = await testEndpoint('GET', '/api/v1/products/categories');
  if (categories.ok) {
    log('✅ /api/v1/products/categories accessible', 'green');
    log(`   Found ${categories.data?.data?.categories?.length || 0} categories`, 'cyan');
  } else {
    log('❌ /api/v1/products/categories failed', 'red');
  }

  // Test manufacturers
  const manufacturers = await testEndpoint('GET', '/api/v1/products/manufacturers');
  if (manufacturers.ok) {
    log('✅ /api/v1/products/manufacturers accessible', 'green');
    log(`   Found ${manufacturers.data?.data?.manufacturers?.length || 0} manufacturers`, 'cyan');
  } else {
    log('❌ /api/v1/products/manufacturers failed', 'red');
  }

  // Test 3: Legacy /api Routes (should be removed)
  log('\nTesting legacy /api routes (should not exist)...', 'yellow');
  const productsLegacy = await testEndpoint('GET', '/api/products');
  if (productsLegacy.status === 404) {
    log('✅ Legacy /api/products properly removed', 'green');
  } else {
    log('⚠️  Legacy /api/products still exists (should be removed)', 'yellow');
  }

  // Test 4: WebSocket Connection
  logSection('WEBSOCKET CONNECTION TEST');
  
  return new Promise((resolve) => {
    log('Testing WebSocket connection...', 'yellow');
    
    const socket = io(API_BASE_URL, {
      transports: ['polling', 'websocket'],
      timeout: 5000
    });

    let connected = false;

    socket.on('connect', () => {
      connected = true;
      log('✅ WebSocket connected successfully', 'green');
      log(`   Socket ID: ${socket.id}`, 'cyan');
      
      // Test sending a message
      socket.emit('test', { message: 'Hello from test script' });
      
      setTimeout(() => {
        socket.disconnect();
      }, 1000);
    });

    socket.on('connect_error', (error) => {
      log(`❌ WebSocket connection failed: ${error.message}`, 'red');
    });

    socket.on('disconnect', () => {
      if (connected) {
        log('✅ WebSocket disconnected cleanly', 'green');
      }
      resolve();
    });

    setTimeout(() => {
      if (!connected) {
        log('❌ WebSocket connection timeout', 'red');
        socket.disconnect();
        resolve();
      }
    }, 6000);
  });
}

async function testProductCreation() {
  if (!ADMIN_TOKEN) {
    log('\n⚠️  Skipping product creation test (no admin token provided)', 'yellow');
    log('   Set ADMIN_TOKEN environment variable to test authenticated endpoints', 'cyan');
    return;
  }

  logSection('PRODUCT CREATION TEST');
  
  const testProduct = {
    name: 'Test Product ' + Date.now(),
    slug: 'test-product-' + Date.now(),
    sku: 'TEST-' + Date.now(),
    categoryId: 'e7218ed5-627e-4abb-9a18-0b360b918df3', // Example UUID
    price: 99.99,
    stockQuantity: 10,
    isActive: true,
    isFeatured: false,
    description: 'Test product from API test script',
    features: 'Feature 1,Feature 2',
    specifications: JSON.stringify({ color: 'Blue', size: 'Large' })
  };

  log('Creating test product...', 'yellow');
  const result = await testEndpoint('POST', '/api/v1/products', testProduct, {
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  });

  if (result.ok) {
    log('✅ Product created successfully', 'green');
    log(`   Product ID: ${result.data?.data?.product?.id}`, 'cyan');
    
    // Clean up - delete the test product
    if (result.data?.data?.product?.id) {
      const deleteResult = await testEndpoint(
        'DELETE', 
        `/api/v1/products/${result.data.data.product.id}`,
        null,
        { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      );
      
      if (deleteResult.ok) {
        log('✅ Test product cleaned up', 'green');
      }
    }
  } else {
    log('❌ Product creation failed', 'red');
    if (result.data?.errors) {
      log('   Validation errors:', 'red');
      result.data.errors.forEach(err => {
        log(`     - ${err.msg}`, 'red');
      });
    }
  }
}

async function testCORS() {
  logSection('CORS CONFIGURATION TEST');
  
  const origins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3005'
  ];

  for (const origin of origins) {
    log(`Testing CORS for ${origin}...`, 'yellow');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    }).catch(err => ({ ok: false, error: err.message }));

    if (response.ok) {
      const allowedOrigin = response.headers?.get('access-control-allow-origin');
      if (allowedOrigin === origin || allowedOrigin === '*') {
        log(`✅ CORS enabled for ${origin}`, 'green');
      } else {
        log(`⚠️  CORS partially configured for ${origin}`, 'yellow');
      }
    } else {
      log(`❌ CORS check failed for ${origin}`, 'red');
    }
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.magenta}🔧 API FIXES VERIFICATION SCRIPT${colors.reset}`);
  console.log(`${colors.cyan}Testing API at: ${API_BASE_URL}${colors.reset}\n`);

  try {
    // Basic API tests
    await runTests();
    
    // CORS tests
    await testCORS();
    
    // Product creation test (if token provided)
    await testProductCreation();
    
    logSection('TEST SUMMARY');
    log('✅ All basic tests completed', 'green');
    log('\nNote: Check the output above for any ❌ or ⚠️  indicators', 'cyan');
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests
main().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});