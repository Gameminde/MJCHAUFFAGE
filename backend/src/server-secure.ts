import express from 'express';
import cors from 'cors';
import { globalSecurityMiddleware, secureAuthMiddleware, requireAdminRole } from '@/middleware/securityEnhanced';
import { AuthControllerSecure } from '@/controllers/authControllerSecure';
import { ProductController } from '@/controllers/productController';
import { AdminController } from '@/controllers/adminController';

const app = express();
const PORT = process.env.PORT || 3001;

// ==============================================================================
// CONFIGURATION DE SÉCURITÉ GLOBALE
// ==============================================================================

// Middleware de sécurité global (helmet, rate limiting, etc.)
app.use(globalSecurityMiddleware);

// CORS sécurisé
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Parsing JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy pour obtenir les vraies IP derrière un reverse proxy
app.set('trust proxy', 1);

// ==============================================================================
// ROUTES D'AUTHENTIFICATION SÉCURISÉES
// ==============================================================================

// Routes publiques d'authentification
app.post('/api/auth/login', AuthControllerSecure.login);
app.post('/api/auth/register', AuthControllerSecure.register);
app.post('/api/auth/refresh', AuthControllerSecure.refreshToken);

// Routes protégées d'authentification
app.post('/api/auth/logout', secureAuthMiddleware, AuthControllerSecure.logout);
app.get('/api/auth/profile', secureAuthMiddleware, AuthControllerSecure.getProfile);
app.put('/api/auth/change-password', secureAuthMiddleware, AuthControllerSecure.changePassword);

// ==============================================================================
// ROUTES PUBLIQUES (CATALOGUE)
// ==============================================================================

// Catalogue produits (accessible sans authentification)
app.get('/api/products', ProductController.getProducts);
app.get('/api/products/:id', ProductController.getProduct);
app.get('/api/categories', ProductController.getCategories);
app.get('/api/manufacturers', ProductController.getManufacturers);
app.get('/api/products/featured', ProductController.getFeaturedProducts);

// ==============================================================================
// ROUTES ADMIN PROTÉGÉES
// ==============================================================================

// Toutes les routes admin nécessitent authentification + rôle admin
const adminAuth = [secureAuthMiddleware, requireAdminRole];

// Gestion des produits (Admin)
app.post('/api/admin/products', ...adminAuth, ProductController.createProduct);
app.put('/api/admin/products/:id', ...adminAuth, ProductController.updateProduct);
app.delete('/api/admin/products/:id', ...adminAuth, ProductController.deleteProduct);
app.put('/api/admin/products/:id/inventory', ...adminAuth, ProductController.updateInventory);

// Dashboard admin
app.get('/api/admin/dashboard/stats', ...adminAuth, AdminController.getDashboardStats);
app.get('/api/admin/dashboard/activities', ...adminAuth, AdminController.getRecentActivities);

// Gestion des commandes (Admin)
app.get('/api/admin/orders', ...adminAuth, AdminController.getOrders);
app.put('/api/admin/orders/:orderId/status', ...adminAuth, AdminController.updateOrderStatus);

// Gestion des clients (Admin)
app.get('/api/admin/customers', ...adminAuth, AdminController.getCustomers);
app.get('/api/admin/customers/:customerId', ...adminAuth, AdminController.getCustomerDetails);

// Gestion des techniciens (Admin)
app.get('/api/admin/technicians', ...adminAuth, AdminController.getTechnicians);
app.post('/api/admin/technicians', ...adminAuth, AdminController.createTechnician);
app.put('/api/admin/technicians/:technicianId', ...adminAuth, AdminController.updateTechnician);

// Demandes de service (Admin)
app.get('/api/admin/service-requests', ...adminAuth, AdminController.getServiceRequests);
app.put('/api/admin/service-requests/:serviceId/assign', ...adminAuth, AdminController.assignTechnician);

// Analytics (Admin)
app.get('/api/admin/analytics/sales', ...adminAuth, AdminController.getSalesAnalytics);
app.get('/api/admin/inventory/alerts', ...adminAuth, AdminController.getInventoryAlerts);

// Export de données (Admin)
app.get('/api/admin/export/:type', ...adminAuth, AdminController.exportData);

// Paramètres système (Admin)
app.get('/api/admin/settings', ...adminAuth, AdminController.getSystemSettings);
app.put('/api/admin/settings', ...adminAuth, AdminController.updateSystemSettings);

// ==============================================================================
// ROUTES DE SANTÉ ET MONITORING
// ==============================================================================

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Version de l'API
app.get('/api/version', (_req, res) => {
  res.json({
    version: '1.0.0',
    name: 'MJ Chauffage API',
    description: 'API sécurisée pour la gestion de MJ Chauffage',
    security: 'Enhanced'
  });
});

// ==============================================================================
// GESTION DES ERREURS GLOBALE
// ==============================================================================

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion des erreurs globales
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Ne pas exposer les détails des erreurs en production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: error.message || 'Erreur serveur interne',
    code: error.code || 'SERVER_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
});

// ==============================================================================
// DÉMARRAGE DU SERVEUR
// ==============================================================================

app.listen(PORT, () => {
});

export default app;
