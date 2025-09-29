import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

// Import mock routes
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

// Core Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  process.env.FRONTEND_URL || 'http://localhost:3000'
];
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting (basic for development)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mock API Routes for Development
app.use('/api/analytics', analyticsRoutes);

// Mock Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock successful login
  if (email && password) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (email && password && firstName && lastName) {
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: '2',
          email,
          firstName,
          lastName,
          role: 'CUSTOMER'
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'All fields required'
    });
  }
});

// Mock Products Routes - Remove mock data as requested
let products: any[] = [];

app.get('/api/products', (_req, res) => {
  res.json({
    success: true,
    data: {
      products: products
    }
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, originalPrice, category, brand, stockQuantity, features, specifications } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'Name, price, and category are required'
    });
  }
  
  const newProduct = {
    id: Date.now().toString(),
    name,
    description: description || null,
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    category,
    brand: brand || null,
    stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
    features: features || [],
    specifications: specifications || {},
    images: [],
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.json({
    success: true,
    data: newProduct,
    message: 'Product created successfully'
  });
  return;
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      id,
      name: 'Premium Boiler X200',
      category: 'Boilers',
      price: 85000,
      stock: 12,
      description: 'High-efficiency condensing boiler with advanced features',
      specifications: {
        power: '24kW',
        efficiency: '94%',
        warranty: '10 years',
        dimensions: '70x40x30 cm'
      },
      imageUrl: '/images/products/boiler-x200.jpg'
    }
  });
});

// Mock Customers Routes
app.get('/api/customers', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        firstName: 'Ahmed',
        lastName: 'Benali',
        email: 'ahmed.benali@email.com',
        phone: '0555123456',
        wilaya: 'Algiers',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        firstName: 'Fatima',
        lastName: 'Khedim',
        email: 'fatima.khedim@email.com',
        phone: '0666234567',
        wilaya: 'Oran',
        createdAt: '2024-02-20T14:30:00Z'
      }
    ]
  });
});

// Mock Orders Routes
app.get('/api/orders', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'ORD-001',
        customerId: '1',
        customerName: 'Ahmed Benali',
        total: 95000,
        status: 'pending',
        items: [
          { productId: '1', productName: 'Premium Boiler X200', quantity: 1, price: 85000 }
        ],
        createdAt: '2024-06-01T09:00:00Z'
      },
      {
        id: 'ORD-002',
        customerId: '2',
        customerName: 'Fatima Khedim',
        total: 65000,
        status: 'completed',
        items: [
          { productId: '2', productName: 'EcoHeat 3000', quantity: 1, price: 65000 }
        ],
        createdAt: '2024-06-02T11:30:00Z'
      }
    ]
  });
});

// Mock Services Routes
app.get('/api/services', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Boiler Installation',
        category: 'Installation',
        price: 15000,
        duration: '4-6 hours',
        description: 'Professional boiler installation service'
      },
      {
        id: '2',
        name: 'Annual Maintenance',
        category: 'Maintenance',
        price: 8000,
        duration: '2-3 hours',
        description: 'Complete annual boiler maintenance'
      },
      {
        id: '3',
        name: 'Emergency Repair',
        category: 'Repair',
        price: 12000,
        duration: '1-3 hours',
        description: '24/7 emergency repair service'
      }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🚀 Development Server Started           ║
║   📍 Port: ${PORT}                           ║
║   🌍 URL: http://localhost:${PORT}          ║
║   📊 Analytics: http://localhost:${PORT}/api/analytics/dashboard
║   ❤️  Health: http://localhost:${PORT}/health ║
║                                           ║
║   Press Ctrl+C to stop                   ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app, server };
