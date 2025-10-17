import 'dotenv/config';

console.log('🔍 Testing imports one by one...');

async function testImports() {
  try {
    console.log('1. Testing express...');
    const express = await import('express');
    console.log('✅ express OK');

    console.log('2. Testing compression...');
    const compression = await import('compression');
    console.log('✅ compression OK');

    console.log('3. Testing morgan...');
    const morgan = await import('morgan');
    console.log('✅ morgan OK');

    console.log('4. Testing express-session...');
    const session = await import('express-session');
    console.log('✅ express-session OK');

    console.log('5. Testing cookie-parser...');
    const cookieParser = await import('cookie-parser');
    console.log('✅ cookie-parser OK');

    console.log('6. Testing http...');
    const { createServer } = await import('http');
    console.log('✅ http OK');

    console.log('7. Testing socket.io...');
    const { Server } = await import('socket.io');
    console.log('✅ socket.io OK');

    console.log('8. Testing express-async-errors...');
    await import('express-async-errors');
    console.log('✅ express-async-errors OK');

    console.log('9. Testing config/environment...');
    const { config } = await import('./src/config/environment');
    console.log('✅ config/environment OK');

    console.log('10. Testing utils/logger...');
    const { logger } = await import('./src/utils/logger');
    console.log('✅ utils/logger OK');

    console.log('11. Testing middleware/errorHandler...');
    const { errorHandler } = await import('./src/middleware/errorHandler');
    console.log('✅ middleware/errorHandler OK');

    console.log('12. Testing middleware/notFoundHandler...');
    const { notFoundHandler } = await import('./src/middleware/notFoundHandler');
    console.log('✅ middleware/notFoundHandler OK');

    console.log('13. Testing middleware/security...');
    const security = await import('./src/middleware/security');
    console.log('✅ middleware/security OK');

    console.log('14. Testing middleware/validation...');
    const { sanitizeRequestBody } = await import('./src/middleware/validation');
    console.log('✅ middleware/validation OK');

    console.log('15. Testing config/redis...');
    const redis = await import('./src/config/redis');
    console.log('✅ config/redis OK');

    console.log('16. Testing lib/database...');
    const { prisma } = await import('./src/lib/database');
    console.log('✅ lib/database OK');

    console.log('17. Testing routes/auth...');
    const authRoutes = await import('./src/routes/auth');
    console.log('✅ routes/auth OK');

    console.log('18. Testing routes/products...');
    const productRoutes = await import('./src/routes/products');
    console.log('✅ routes/products OK');

    console.log('19. Testing routes/customers...');
    const customerRoutes = await import('./src/routes/customers');
    console.log('✅ routes/customers OK');

    console.log('20. Testing routes/orders...');
    const orderRoutes = await import('./src/routes/orders');
    console.log('✅ routes/orders OK');

    console.log('21. Testing routes/services...');
    const serviceRoutes = await import('./src/routes/services');
    console.log('✅ routes/services OK');

    console.log('22. Testing routes/analytics...');
    const analyticsRoutes = await import('./src/routes/analytics');
    console.log('✅ routes/analytics OK');

    console.log('23. Testing routes/admin...');
    const adminRoutes = await import('./src/routes/admin');
    console.log('✅ routes/admin OK');

    console.log('24. Testing routes/realtime...');
    const realtimeRoutes = await import('./src/routes/realtime');
    console.log('✅ routes/realtime OK');

    console.log('25. Testing routes/cart...');
    const cartRoutes = await import('./src/routes/cart');
    console.log('✅ routes/cart OK');

    console.log('26. Testing services/realtimeService...');
    const { RealtimeService } = await import('./src/services/realtimeService');
    console.log('✅ services/realtimeService OK');

    console.log('🎉 ALL IMPORTS SUCCESSFUL!');

  } catch (error: any) {
    console.error('❌ IMPORT FAILED:', error.message);
    console.error('❌ STACK:', error.stack);
    process.exit(1);
  }
}

testImports();