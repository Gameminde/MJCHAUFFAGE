import { Request, Response } from 'express';
import { AnalyticsTrackingService } from '../services/analyticsTrackingService';

export class AnalyticsTrackingController {
  static async trackEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, eventData, timestamp, clientIP, userAgent, events } = req.body;

      // Handle batch events (from frontend queue)
      if (events && Array.isArray(events)) {
        // Process batch of events - for now just acknowledge receipt
        res.json({
          success: true,
          message: `${events.length} events tracked successfully`,
          eventsProcessed: events.length
        });
        return;
      }

      // Handle single event
      if (!eventType || !eventData) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: eventType and eventData'
        });
        return;
      }

      // Get additional request metadata
      const metadata = {
        clientIP: clientIP || req.ip || req.connection.remoteAddress,
        userAgent: userAgent || req.get('User-Agent'),
        timestamp: timestamp || new Date().toISOString(),
        headers: {
          referer: req.get('Referer') || undefined,
          origin: req.get('Origin') || undefined,
          acceptLanguage: req.get('Accept-Language') || undefined
        }
      };

      // Process the event based on type
      let result;
      switch (eventType) {
        case 'page_view':
          result = await AnalyticsTrackingService.trackPageView(eventData, metadata);
          break;
        case 'ecommerce_event':
          result = await AnalyticsTrackingService.trackEcommerceEvent(eventData, metadata);
          break;
        case 'traffic_source':
          result = await AnalyticsTrackingService.trackTrafficSource(eventData, metadata);
          break;
        case 'session_start':
          result = await AnalyticsTrackingService.trackSessionStart(eventData, metadata);
          break;
        case 'page_duration':
          result = await AnalyticsTrackingService.trackPageDuration(eventData, metadata);
          break;
        default:
          res.status(400).json({
            success: false,
            error: `Unknown event type: ${eventType}`
          });
          return;
      }

      res.json({
        success: true,
        eventId: result && typeof result === 'object' && 'id' in result ? result.id : 'unknown',
        message: 'Event tracked successfully'
      });

    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track analytics event'
      });
    }
  }

  static async getSessionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { startDate, endDate } = req.query;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }

      const analytics = await AnalyticsTrackingService.getSessionAnalytics(
        sessionId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Session analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve session analytics'
      });
    }
  }

  static async getRealTimeMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = await AnalyticsTrackingService.getRealTimeMetrics();

      res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      console.error('Real-time metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve real-time metrics'
      });
    }
  }
}
