import { Router, Request, Response } from 'express';
import { AnalyticsTrackingController } from '../controllers/analyticsTrackingController';

const router = Router();

// Helper function to return empty analytics data structure
const getEmptyAnalyticsResponse = (message: string = 'Analytics data temporarily unavailable') => ({
  success: true,
  data: {
    message,
    isEmpty: true
  }
});

// Helper function to handle analytics controller calls with proper error handling
const handleAnalyticsCall = async (req: Request, res: Response, controllerMethod: Function, fallbackMessage: string) => {
  try {
    await controllerMethod(req, res);
  } catch (error) {
    console.error(`Analytics error: ${fallbackMessage}`, error);
    
    // Return proper error response instead of mock data
    res.status(500).json({
      success: false,
      error: fallbackMessage,
      message: 'Please check your database connection and try again.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Development mode - no authentication required
if (process.env.NODE_ENV !== 'production') {
  try {
    const { AnalyticsController } = require('../controllers/analyticsController');
    
    // Dashboard KPIs
    router.get('/dashboard', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getDashboardKPIs, 'Failed to fetch dashboard analytics')
    );
    
    router.get('/kpis', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getDashboardKPIs, 'Failed to fetch KPI analytics')
    );
    
    // Sales Analytics
    router.get('/sales', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getSalesAnalytics, 'Failed to fetch sales analytics')
    );
    
    // Customer Analytics
    router.get('/customers', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getCustomerAnalytics, 'Failed to fetch customer analytics')
    );
    
    // Product Analytics
    router.get('/products', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getProductAnalytics, 'Failed to fetch product analytics')
    );
    
    // Service Analytics
    router.get('/services', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getServiceAnalytics, 'Failed to fetch service analytics')
    );
    
    // Algeria Market Insights
    router.get('/market/algeria', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getAlgeriaMarketInsights, 'Failed to fetch market insights')
    );
    
    // Revenue by Wilaya
    router.get('/revenue/wilaya', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getRevenueByWilaya, 'Failed to fetch revenue by wilaya')
    );
    
    // Payment Method Analytics
    router.get('/payments/methods', (req: Request, res: Response) => 
      handleAnalyticsCall(req, res, AnalyticsController.getPaymentMethodAnalytics, 'Failed to fetch payment method analytics')
    );

  } catch (importError) {
    console.warn('Analytics controller not available, using fallback routes');
    
    // Fallback routes that return empty data when controller is not available
    router.get('/dashboard', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Analytics controller not available'));
    });
    
    router.get('/kpis', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Analytics controller not available'));
    });
    
    router.get('/sales', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Sales analytics not available'));
    });
    
    router.get('/customers', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Customer analytics not available'));
    });
    
    router.get('/products', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Product analytics not available'));
    });
    
    router.get('/services', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Service analytics not available'));
    });
    
    router.get('/market/algeria', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Market insights not available'));
    });
    
    router.get('/revenue/wilaya', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Revenue analytics not available'));
    });
    
    router.get('/payments/methods', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Payment analytics not available'));
    });
  }

  // Analytics tracking endpoint (no auth required for tracking)
  try {
    router.post('/track', AnalyticsTrackingController.trackEvent);
    router.get('/realtime', AnalyticsTrackingController.getRealTimeMetrics);
    router.get('/session/:sessionId', AnalyticsTrackingController.getSessionAnalytics);
  } catch (trackingError) {
    console.warn('Analytics tracking controller not available');
    
    // Fallback tracking endpoints
    router.post('/track', (_req: Request, res: Response) => {
      res.json({ success: true, message: 'Tracking temporarily unavailable' });
    });
    
    router.get('/realtime', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Real-time metrics not available'));
    });
    
    router.get('/session/:sessionId', (_req: Request, res: Response) => {
      res.json(getEmptyAnalyticsResponse('Session analytics not available'));
    });
  }

} else {
  // Production mode - authentication required
  try {
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

    // Analytics tracking endpoint (no auth required for tracking)
    router.post('/track', AnalyticsTrackingController.trackEvent);

    // Real-time metrics (authentication required in production)
    router.get('/realtime', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), AnalyticsTrackingController.getRealTimeMetrics);

    // Session analytics (authentication required in production)
    router.get('/session/:sessionId', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), AnalyticsTrackingController.getSessionAnalytics);
    
  } catch (error) {
    console.error('Failed to set up production analytics routes:', error);
  }
}

export default router;