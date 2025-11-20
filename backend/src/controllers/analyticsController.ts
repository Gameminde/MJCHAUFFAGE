import { Request, Response } from 'express'
import { AnalyticsService } from '../services/analyticsService'

export class AnalyticsController {
  static async getDashboardKPIs(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, timeframe = '30d' } = req.query

      let start: Date
      let end: Date = new Date()

      if (startDate && endDate) {
        start = new Date(startDate as string)
        end = new Date(endDate as string)
      } else {
        // Default timeframes
        const days = parseInt(timeframe as string) || 30
        start = new Date()
        start.setDate(start.getDate() - days)
      }

      const kpis = await AnalyticsService.getDashboardKPIs(start, end)

      res.json({
        success: true,
        data: kpis,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      })
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard KPIs'
      })
    }
  }

  static async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      const salesMetrics = await AnalyticsService.getSalesMetrics(start, end, true)

      res.json({
        success: true,
        data: salesMetrics,
        groupBy
      })
    } catch (error) {
      console.error('Error fetching sales analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sales analytics'
      })
    }
  }

  static async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      const customerMetrics = await AnalyticsService.getCustomerMetrics(start, end)

      res.json({
        success: true,
        data: customerMetrics
      })
    } catch (error) {
      console.error('Error fetching customer analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer analytics'
      })
    }
  }

  static async getProductAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      const productMetrics = await AnalyticsService.getProductMetrics(start, end)

      res.json({
        success: true,
        data: productMetrics
      })
    } catch (error) {
      console.error('Error fetching product analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product analytics'
      })
    }
  }

  static async getServiceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      const serviceMetrics = await AnalyticsService.getServiceMetrics(start, end)

      res.json({
        success: true,
        data: serviceMetrics
      })
    } catch (error) {
      console.error('Error fetching service analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service analytics'
      })
    }
  }

  static async getAlgeriaMarketInsights(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      const insights = await AnalyticsService.getAlgeriaMarketInsights(start, end)

      res.json({
        success: true,
        data: insights
      })
    } catch (error) {
      console.error('Error fetching Algeria market insights:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch market insights'
      })
    }
  }

  static async getRevenueByWilaya(_req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implement date filtering
      // const { startDate, endDate } = req.query
      // const start = new Date(startDate as string)
      // const end = new Date(endDate as string)

      // This would be implemented in AnalyticsService
      const revenueByWilaya: any[] = [] // TODO: Implement

      res.json({
        success: true,
        data: revenueByWilaya
      })
    } catch (error) {
      console.error('Error fetching revenue by wilaya:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue by wilaya'
      })
    }
  }

  static async getPaymentMethodAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implement date filtering
      // const { startDate, endDate } = req.query
      // const start = new Date(startDate as string)
      // const end = new Date(endDate as string)

      // This would get payment method distribution
      const paymentAnalytics: any[] = [] // TODO: Implement

      res.json({
        success: true,
        data: paymentAnalytics
      })
    } catch (error) {
      console.error('Error fetching payment method analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment method analytics'
      })
    }
  }

  static async getSalesByCategories(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d' } = req.query

      let start: Date
      const end: Date = new Date()

      // Calculate date range based on timeframe
      const days = parseInt(timeframe as string) || 30
      start = new Date()
      start.setDate(start.getDate() - days)

      const categoryAnalytics = await AnalyticsService.getSalesByCategories(start, end)

      res.json({
        success: true,
        data: categoryAnalytics
      })
    } catch (error) {
      console.error('Error fetching sales by categories:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sales by categories'
      })
    }
  }

  static async getTrafficSources(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d' } = req.query

      let start: Date
      const end: Date = new Date()

      // Calculate date range based on timeframe
      const days = parseInt(timeframe as string) || 30
      start = new Date()
      start.setDate(start.getDate() - days)

      const trafficAnalytics = await AnalyticsService.getTrafficSources(start, end)

      res.json({
        success: true,
        data: trafficAnalytics
      })
    } catch (error) {
      console.error('Error fetching traffic sources:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch traffic sources'
      })
    }
  }
}