import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import 'express-async-errors';

import { config } from './config/environment';
import { logger } from './utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: config.frontend.url,
    methods: ['GET', 'POST'],
  },
});

// Trust proxy for production
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

// CORS configuration
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.env,
    message: 'MJ CHAUFFAGE Backend is running'
  });
});

// Basic API test route
app.get('/api/test', (_req, res) => {
  res.json({
    message: 'API is working!',
    features: [
      'Authentication with Google OAuth',
      'Multi-language support (Arabic/French)',
      'Algeria-specific payment methods',
      'Product catalog management',
      'Order processing',
      'Service booking system'
    ]
  });
});

// Real products API endpoint
app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        manufacturer: true,
        images: true
      },
      where: {
        isActive: true
      },
      take: 20
    });

    // Transform products for frontend
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      price: parseFloat(product.price.toString()),
      salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
      stockQuantity: product.stockQuantity,
      weight: product.weight ? parseFloat(product.weight.toString()) : null,
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      features: product.features ? product.features.split(',') : [],
      images: product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText
      })),
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      },
      manufacturer: product.manufacturer ? {
        id: product.manufacturer.id,
        name: product.manufacturer.name,
        slug: product.manufacturer.slug
      } : null,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    res.json({
      success: true,
      data: {
        products: transformedProducts,
        total: transformedProducts.length,
        hasMore: false
      }
    });
  } catch (error) {
    logger.error('Products API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Single product API endpoint
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        category: true,
        manufacturer: true,
        images: true
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
      return;
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      price: parseFloat(product.price.toString()),
      salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : null,
      stockQuantity: product.stockQuantity,
      weight: product.weight ? parseFloat(product.weight.toString()) : null,
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      features: product.features ? product.features.split(',') : [],
      images: product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText
      })),
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      },
      manufacturer: product.manufacturer ? {
        id: product.manufacturer.id,
        name: product.manufacturer.name,
        slug: product.manufacturer.slug
      } : null,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.json({
      success: true,
      data: { product: transformedProduct }
    });
  } catch (error) {
    logger.error('Single product API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Categories API endpoint
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    const transformedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      productCount: category._count.products,
      sortOrder: category.sortOrder
    }));

    res.json({
      success: true,
      data: { categories: transformedCategories }
    });
  } catch (error) {
    logger.error('Categories API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.API_PORT || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 MJ CHAUFFAGE Backend running on port ${PORT}`);
  logger.info(`📖 Environment: ${config.env}`);
  logger.info(`🔗 Frontend URL: ${config.frontend.url}`);
  logger.info(`✅ Basic server is ready for testing`);
});

export { app, io };