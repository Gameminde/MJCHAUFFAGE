const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock admin user
const adminUser = {
  id: '1',
  email: 'admin@mjchauffage.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'SUPER_ADMIN',
  password: '$2a$12$Q69IUbXa13Et9SOj7LWyOeOK/DfZfSAVRb09tvEzm/FSQA7WqGhn2' // Admin123!
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password });
    
    if (email !== adminUser.email) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Return success with user data and token
    res.json({
      success: true,
      data: {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role
        },
        token: 'fake-jwt-token-for-testing',
        refreshToken: 'fake-refresh-token'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// In-memory products storage
let products = [
  {
    id: '1',
    name: 'Chaudière Test',
    slug: 'chaudiere-test',
    sku: 'TEST-001',
    description: 'Chaudière de test',
    price: 1500,
    stockQuantity: 10,
    isActive: true,
    isFeatured: false,
    category: 'Chaudières',
    brand: 'Test Manufacturer',
    images: [],
    features: ['Haute efficacité', 'Économique'],
    specifications: { power: '25kW', efficiency: '95%' },
    originalPrice: null,
    createdAt: new Date().toISOString()
  }
];

// GET products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: {
      products: products,
      pagination: {
        page: 1,
        limit: 20,
        total: products.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    }
  });
});

// POST products endpoint - Create new product
app.post('/api/products', (req, res) => {
  try {
    const productData = req.body;
    console.log('Creating product:', productData.name);
    console.log('Images received:', productData.images ? productData.images.length : 0);
    if (productData.images && productData.images.length > 0) {
      console.log('First image preview:', productData.images[0].substring(0, 50) + '...');
    }
    
    // Generate unique ID
    const newId = Date.now().toString();
    
    // Create new product
    const newProduct = {
      id: newId,
      name: productData.name,
      slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
      sku: `PROD-${newId}`,
      description: productData.description,
      price: productData.price,
      originalPrice: productData.originalPrice,
      stockQuantity: productData.stockQuantity,
      isActive: productData.isActive !== false,
      isFeatured: productData.isFeatured || false,
      category: productData.category,
      brand: productData.brand,
      images: productData.images || [],
      features: productData.features || [],
      specifications: productData.specifications || {},
      createdAt: new Date().toISOString()
    };
    
    // Add to products array
    products.push(newProduct);
    
    console.log('Product created successfully:', newProduct.id);
    console.log('Images in created product:', newProduct.images.length);
    console.log('Total products:', products.length);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Produit créé avec succès'
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit'
    });
  }
});

// Mock categories endpoint
app.get('/api/products/categories', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: [
        { id: '1', name: 'Chaudières', slug: 'chaudieres' },
        { id: '2', name: 'Radiateurs', slug: 'radiateurs' },
        { id: '3', name: 'Thermostats', slug: 'thermostats' }
      ]
    }
  });
});

// Mock manufacturers endpoint
app.get('/api/products/manufacturers', (req, res) => {
  res.json({
    success: true,
    data: {
      manufacturers: [
        { id: '1', name: 'Viessmann', slug: 'viessmann' },
        { id: '2', name: 'Bosch', slug: 'bosch' },
        { id: '3', name: 'Vaillant', slug: 'vaillant' }
      ]
    }
  });
});

// Analytics dashboard endpoint
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue: 2450000,
        totalOrders: 156,
        totalCustomers: 89,
        totalServices: 234,
        revenueGrowth: 12.5,
        customerGrowth: 8.3
      },
      charts: {
        revenue: [
          { date: '2024-01', value: 180000 },
          { date: '2024-02', value: 195000 },
          { date: '2024-03', value: 210000 },
          { date: '2024-04', value: 225000 },
          { date: '2024-05', value: 240000 },
          { date: '2024-06', value: 255000 }
        ],
        orders: [
          { date: '2024-01', value: 45 },
          { date: '2024-02', value: 52 },
          { date: '2024-03', value: 48 },
          { date: '2024-04', value: 61 },
          { date: '2024-05', value: 58 },
          { date: '2024-06', value: 67 }
        ],
        customers: [
          { date: '2024-01', value: 12 },
          { date: '2024-02', value: 15 },
          { date: '2024-03', value: 18 },
          { date: '2024-04', value: 22 },
          { date: '2024-05', value: 19 },
          { date: '2024-06', value: 25 }
        ]
      },
      topProducts: [
        { id: '1', name: 'Chaudière Viessmann Vitodens 100-W', sales: 45, revenue: 54000 },
        { id: '2', name: 'Radiateur Premium Steel 600x1200', sales: 89, revenue: 16020 },
        { id: '3', name: 'Thermostat Intelligent Nest', sales: 67, revenue: 13400 }
      ],
      recentOrders: [
        { id: '1', customer: 'Jean Dupont', amount: 1200, status: 'completed', date: '2024-06-15' },
        { id: '2', customer: 'Marie Martin', amount: 850, status: 'pending', date: '2024-06-14' },
        { id: '3', customer: 'Pierre Durand', amount: 2100, status: 'processing', date: '2024-06-13' }
      ]
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log('📧 Admin login: admin@mjchauffage.com / Admin123!');
});
