import { prisma } from '../lib/database';
// Remove unused import

interface RequestMetadata {
  clientIP?: string;
  userAgent?: string;
  timestamp?: string;
  headers?: {
    referer?: string | undefined;
    origin?: string | undefined;
    acceptLanguage?: string | undefined;
  };
}

interface PageViewData {
  sessionId: string;
  userId?: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
}

interface EcommerceEventData {
  sessionId: string;
  userId?: string;
  eventType: string;
  productId?: string | null;
  categoryId?: string | null;
  value?: number;
  currency?: string;
  quantity?: number;
  metadata?: any;
}

interface TrafficSourceData {
  sessionId: string;
  source?: string;
  medium?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

interface SessionData {
  sessionId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  startedAt: Date;
}

export class AnalyticsTrackingService {
  
  static async trackPageView(data: PageViewData, metadata: RequestMetadata) {
    try {
      // Create or update analytics session
      await this.upsertAnalyticsSession(data.sessionId, data.userId, metadata);

      // Track page view
      const pageAnalytics = await prisma.pageAnalytics.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId || null,
          pagePath: data.pagePath,
          pageTitle: data.pageTitle || null,
          referrer: data.referrer || metadata.headers?.referer || null,
          userAgent: data.userAgent || metadata.userAgent || null,
          deviceType: data.deviceType || null,
          browser: data.browser || null,
          os: data.os || null,
          country: data.country || null,
          city: data.city || null,
          bounce: false // Will be updated later if needed
        }
      });

      // Note: SQLite schema doesn't have per-session pageViews/lastActivity fields.
      // Page view totals are derived from PageAnalytics records.

      return pageAnalytics;

    } catch (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
  }

  static async trackEcommerceEvent(data: EcommerceEventData, _metadata: RequestMetadata) {
    try {
      // Validate product and category IDs if provided
      if (data.productId) {
        const productExists = await prisma.product.findUnique({
          where: { id: data.productId }
        });
        if (!productExists) {
          console.warn(`Product ${data.productId} not found for analytics event`);
          data.productId = null;
        }
      }

      if (data.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId }
        });
        if (!categoryExists) {
          console.warn(`Category ${data.categoryId} not found for analytics event`);
          data.categoryId = null;
        }
      }

      const ecommerceEvent = await prisma.ecommerceEvent.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId || null,
          eventType: data.eventType,
          productId: data.productId || null,
          categoryId: data.categoryId || null,
          value: data.value ? parseFloat(data.value.toString()) : null,
          currency: data.currency || 'DZD',
          metadata: data.metadata || null
        }
      });

      // Update session activity
      await this.updateSessionActivity();

      return ecommerceEvent;

    } catch (error) {
      console.error('Error tracking ecommerce event:', error);
      throw error;
    }
  }

  static async trackTrafficSource(data: TrafficSourceData, _metadata: RequestMetadata) {
    try {
      const trafficSource = await prisma.trafficSource.create({
        data: {
          sessionId: data.sessionId,
          source: data.source || null,
          medium: data.medium || null,
          campaign: data.campaign || null,
          utmSource: data.utmSource || null,
          utmMedium: data.utmMedium || null,
          utmCampaign: data.utmCampaign || null,
          utmTerm: data.utmTerm || null,
          utmContent: data.utmContent || null
        }
      });

      return trafficSource;

    } catch (error) {
      console.error('Error tracking traffic source:', error);
      throw error;
    }
  }

  static async trackSessionStart(data: SessionData, metadata: RequestMetadata) {
    try {
      const session = await prisma.analyticsSession.upsert({
        where: { id: data.sessionId },
        update: {
          userId: data.userId || null,
          ipAddress: data.ipAddress || metadata.clientIP || null,
          userAgent: data.userAgent || metadata.userAgent || null,
          deviceType: data.deviceType || null,
          browser: data.browser || null,
          os: data.os || null,
          country: data.country || null,
          city: data.city || null
        },
        create: {
          sessionId: data.sessionId,
          userId: data.userId || null,
          ipAddress: data.ipAddress || metadata.clientIP || null,
          userAgent: data.userAgent || metadata.userAgent || null,
          deviceType: data.deviceType || null,
          browser: data.browser || null,
          os: data.os || null,
          country: data.country || null,
          city: data.city || null,
          startedAt: data.startedAt || new Date(),
          endedAt: null
        }
      });

      return session;

    } catch (error) {
      console.error('Error tracking session start:', error);
      throw error;
    }
  }

  static async trackPageDuration(data: { sessionId: string; pagePath: string; duration: number }, _metadata: RequestMetadata) {
    try {
      // Find the most recent page view for this session and path
      const pageView = await prisma.pageAnalytics.findFirst({
        where: {
          sessionId: data.sessionId,
          pagePath: data.pagePath
        },
        orderBy: { createdAt: 'desc' }
      });

      if (pageView) {
        await prisma.pageAnalytics.update({
          where: { id: pageView.id },
          data: {
            durationSeconds: data.duration,
            bounce: data.duration < 10 // Consider < 10 seconds as bounce
          }
        });
      }

      // Update session activity
      await this.updateSessionActivity();

      return { success: true };

    } catch (error) {
      console.error('Error tracking page duration:', error);
      throw error;
    }
  }

  static async getSessionAnalytics(sessionId: string, startDate?: string, endDate?: string) {
    try {
      const whereClause: any = { sessionId };
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const [session, pageViews, ecommerceEvents, trafficSources] = await Promise.all([
        prisma.analyticsSession.findUnique({
          where: { sessionId }
        }),
        prisma.pageAnalytics.findMany({
          where: whereClause,
          orderBy: { createdAt: 'asc' }
        }),
        prisma.ecommerceEvent.findMany({
          where: whereClause,
          orderBy: { createdAt: 'asc' }
        }),
        prisma.trafficSource.findMany({
          where: { sessionId },
          orderBy: { createdAt: 'asc' }
        })
      ]);

      return {
        session,
        pageViews,
        ecommerceEvents,
        trafficSources,
        summary: {
          totalPageViews: pageViews.length,
          totalEvents: ecommerceEvents.length,
          sessionDuration:
            session && session.startedAt
              ? Math.max(
                  0,
                  Math.floor(
                    (((session.endedAt || new Date()) as Date).getTime() -
                      (session.startedAt as Date).getTime()) / 1000
                  )
                )
              : 0,
          bounceRate: this.calculateBounceRate(pageViews)
        }
      };

    } catch (error) {
      console.error('Error getting session analytics:', error);
      throw error;
    }
  }

  static async getRealTimeMetrics() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        activeSessionsCount,
        hourlyPageViews,
        dailyPageViews,
        recentEcommerceEvents,
        topPages
      ] = await Promise.all([
        // Active sessions (last 30 minutes)
        prisma.analyticsSession.count({
          where: {
            OR: [
              { endedAt: null },
              { endedAt: { gte: new Date(now.getTime() - 30 * 60 * 1000) } }
            ]
          }
        }),

        // Page views in last hour
        prisma.pageAnalytics.count({
          where: {
            createdAt: { gte: oneHourAgo }
          }
        }),

        // Page views in last 24 hours
        prisma.pageAnalytics.count({
          where: {
            createdAt: { gte: oneDayAgo }
          }
        }),

        // Recent ecommerce events
        prisma.ecommerceEvent.findMany({
          where: {
            createdAt: { gte: oneHourAgo }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),

        // Top pages in last hour
        prisma.pageAnalytics.groupBy({
          by: ['pagePath'],
          where: {
            createdAt: { gte: oneHourAgo }
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ]);

      return {
        activeSessions: activeSessionsCount,
        pageViews: {
          lastHour: hourlyPageViews,
          last24Hours: dailyPageViews
        },
        recentEvents: recentEcommerceEvents,
        topPages: topPages.map((page: any) => ({
          path: page.pagePath,
          views: page._count.id
        }))
      };

    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      throw error;
    }
  }

  // Helper methods

  private static async upsertAnalyticsSession(sessionId: string, userId?: string, metadata?: RequestMetadata) {
    await prisma.analyticsSession.upsert({
      where: { sessionId },
      update: {
        ...(userId && { userId }),
        ipAddress: metadata?.clientIP || null,
        userAgent: metadata?.userAgent || null
      },
      create: {
        sessionId,
        userId: userId || null,
        ipAddress: metadata?.clientIP || null,
        userAgent: metadata?.userAgent || null,
        startedAt: new Date(),
        endedAt: null
      }
    });
  }

  private static async updateSessionActivity() {
    // No-op for SQLite schema (no lastActivity field). Page views/events track activity.
    return;
  }



  private static calculateBounceRate(pageViews: Array<{ bounce: boolean }>): number {
    if (pageViews.length === 0) return 0;
    
    const bounces = pageViews.filter(pv => pv.bounce).length;
    return (bounces / pageViews.length) * 100;
  }
}