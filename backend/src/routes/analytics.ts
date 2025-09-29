import { Router, Request, Response } from 'express';

const router = Router();

// Mock data for development
const getMockDashboardData = () => ({
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
        { date: '2024-06', value: 260000 }
      ],
      orders: [
        { date: '2024-01', value: 22 },
        { date: '2024-02', value: 25 },
        { date: '2024-03', value: 28 },
        { date: '2024-04', value: 24 },
        { date: '2024-05', value: 27 },
        { date: '2024-06', value: 30 }
      ]
    }
  }
});

const getMockSalesData = () => ({
  success: true,
  data: {
    totalSales: 2450000,
    salesByCategory: [
      { category: 'Boilers', sales: 1200000, percentage: 49 },
      { category: 'Installation', sales: 750000, percentage: 31 },
      { category: 'Maintenance', sales: 500000, percentage: 20 }
    ],
    topProducts: [
      { name: 'Premium Boiler X200', sales: 450000, units: 15 },
      { name: 'EcoHeat 3000', sales: 380000, units: 19 },
      { name: 'CompactHeat Pro', sales: 320000, units: 22 }
    ]
  }
});

const getMockCustomerData = () => ({
  success: true,
  data: {
    totalCustomers: 89,
    newCustomersThisMonth: 12,
    customersByWilaya: [
      { wilaya: 'Algiers', count: 34, percentage: 38 },
      { wilaya: 'Oran', count: 22, percentage: 25 },
      { wilaya: 'Constantine', count: 18, percentage: 20 },
      { wilaya: 'Others', count: 15, percentage: 17 }
    ],
    customerRetention: 78.5
  }
});

const getMockProductData = () => ({
  success: true,
  data: {
    totalProducts: 45,
    topPerformers: [
      { id: '1', name: 'Premium Boiler X200', stock: 12, sales: 45 },
      { id: '2', name: 'EcoHeat 3000', stock: 8, sales: 38 },
      { id: '3', name: 'CompactHeat Pro', stock: 15, sales: 32 }
    ],
    lowStock: [
      { id: '4', name: 'ThermoValve Pro', stock: 2, reorderPoint: 10 },
      { id: '5', name: 'PipeConnector XL', stock: 5, reorderPoint: 20 }
    ]
  }
});

const getMockServiceData = () => ({
  success: true,
  data: {
    totalServices: 234,
    completedThisMonth: 42,
    avgCompletionTime: 2.5,
    servicesByType: [
      { type: 'Installation', count: 89, revenue: 750000 },
      { type: 'Maintenance', count: 145, revenue: 500000 }
    ]
  }
});

const getMockAlgeriaMarketData = () => ({
  success: true,
  data: {
    marketSize: 45000000,
    growthRate: 8.5,
    competitorAnalysis: [
      { company: 'MJ Chauffage', marketShare: 15 },
      { company: 'Competitor A', marketShare: 22 },
      { company: 'Competitor B', marketShare: 18 },
      { company: 'Others', marketShare: 45 }
    ],
    trends: [
      'Increased demand for eco-friendly heating solutions',
      'Growing preference for smart thermostats',
      'Rising energy efficiency awareness'
    ]
  }
});

const getMockRevenueByWilaya = () => ({
  success: true,
  data: {
    revenues: [
      { wilaya: 'Algiers', revenue: 850000, orders: 68 },
      { wilaya: 'Oran', revenue: 620000, orders: 45 },
      { wilaya: 'Constantine', revenue: 480000, orders: 32 },
      { wilaya: 'Annaba', revenue: 250000, orders: 18 },
      { wilaya: 'Others', revenue: 250000, orders: 23 }
    ]
  }
});

const getMockPaymentMethodData = () => ({
  success: true,
  data: {
    methods: [
      { method: 'Cash', transactions: 89, amount: 1225000, percentage: 50 },
      { method: 'Bank Transfer', transactions: 45, amount: 735000, percentage: 30 },
      { method: 'Check', transactions: 22, amount: 490000, percentage: 20 }
    ]
  }
});

// Development mode - no authentication required
if (process.env.NODE_ENV !== 'production') {
  console.log('📊 Analytics routes running in DEVELOPMENT mode - no auth required');
  
  // Dashboard KPIs
  router.get('/dashboard', (_req: Request, res: Response) => {
    res.json(getMockDashboardData());
  });
  
  router.get('/kpis', (_req: Request, res: Response) => {
    res.json(getMockDashboardData());
  });
  
  // Sales Analytics
  router.get('/sales', (_req: Request, res: Response) => {
    res.json(getMockSalesData());
  });
  
  // Customer Analytics
  router.get('/customers', (_req: Request, res: Response) => {
    res.json(getMockCustomerData());
  });
  
  // Product Analytics
  router.get('/products', (_req: Request, res: Response) => {
    res.json(getMockProductData());
  });
  
  // Service Analytics
  router.get('/services', (_req: Request, res: Response) => {
    res.json(getMockServiceData());
  });
  
  // Algeria Market Insights
  router.get('/market/algeria', (_req: Request, res: Response) => {
    res.json(getMockAlgeriaMarketData());
  });
  
  // Revenue by Wilaya
  router.get('/revenue/wilaya', (_req: Request, res: Response) => {
    res.json(getMockRevenueByWilaya());
  });
  
  // Payment Method Analytics
  router.get('/payments/methods', (_req: Request, res: Response) => {
    res.json(getMockPaymentMethodData());
  });
} else {
  // Production mode - authentication required
  console.log('🔐 Analytics routes running in PRODUCTION mode - auth required');
  
  // Import middleware only in production
  const { authenticateToken, requireRole } = require('../middleware/auth');
  const { AnalyticsController } = require('../controllers/analyticsController');
  
  router.use(authenticateToken);
  router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));
  
  // Dashboard KPIs
  router.get('/dashboard', AnalyticsController.getDashboardKPIs);
  router.get('/kpis', AnalyticsController.getDashboardKPIs);
  
  // Sales Analytics
  router.get('/sales', AnalyticsController.getSalesAnalytics);
  
  // Customer Analytics
  router.get('/customers', AnalyticsController.getCustomerAnalytics);
  
  // Product Analytics
  router.get('/products', AnalyticsController.getProductAnalytics);
  
  // Service Analytics
  router.get('/services', AnalyticsController.getServiceAnalytics);
  
  // Algeria Market Insights
  router.get('/market/algeria', AnalyticsController.getAlgeriaMarketInsights);
  
  // Revenue by Wilaya
  router.get('/revenue/wilaya', AnalyticsController.getRevenueByWilaya);
  
  // Payment Method Analytics
  router.get('/payments/methods', AnalyticsController.getPaymentMethodAnalytics);
}

export default router;