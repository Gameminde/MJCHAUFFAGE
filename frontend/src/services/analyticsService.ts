import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/client';

// Types for analytics events
export interface PageViewEvent {
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

export interface EcommerceEvent {
  sessionId: string;
  userId?: string;
  eventType: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase' | 'view_category' | 'search';
  productId?: string;
  categoryId?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  metadata?: Record<string, any>;
}

export interface TrafficSourceData {
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

export interface SessionData {
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

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: Date;
  private pageStartTime: Date;
  private isInitialized = false;
  private eventQueue: any[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private backoffUntil: number | null = null;
  private disabled: boolean = process.env.NODE_ENV !== 'production';
  private supabase = createClient();

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = new Date();
    this.pageStartTime = new Date();

    if (typeof window !== 'undefined') {
      // Initialize asynchronously to avoid blocking auth
      this.init().catch(error => {
        console.debug('Analytics init failed:', error instanceof Error ? error.message : String(error));
      });
    }
  }

  private async init() {
    if (this.isInitialized) return;

    if (this.disabled) {
      // Do not initialize analytics network calls in development
      this.isInitialized = true;
      return;
    }

    try {
      // Initialize session tracking (non-blocking)
      this.initializeSession().catch(error => {
        console.debug('Analytics session initialization failed (backend not available):', error instanceof Error ? error.message : String(error));
      });
    } catch (error) {
      console.debug('Analytics initialization error:', error instanceof Error ? error.message : String(error));
    }

    // Track page visibility changes
    this.setupVisibilityTracking();

    // Track page unload
    this.setupUnloadTracking();

    // Start periodic event flushing
    this.startEventFlushing();

    this.isInitialized = true;
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return uuidv4();

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async initializeSession() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const sessionData: SessionData = {
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      startedAt: this.sessionStartTime
    };

    // Get location data (optional, non-blocking)
    this.getLocationData().then(locationData => {
      sessionData.country = locationData.country;
      sessionData.city = locationData.city;
      this.queueEvent('session_start', sessionData);
    }).catch(error => {
      console.debug('Location data unavailable:', error instanceof Error ? error.message : String(error));
      this.queueEvent('session_start', sessionData);
    });
  }

  private setupVisibilityTracking() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageEnd();
      } else {
        this.pageStartTime = new Date();
      }
    });
  }

  private setupUnloadTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      this.trackPageEnd();
      this.flushEvents(true); // Synchronous flush on unload
    });

    // Also track on page navigation for SPAs
    window.addEventListener('popstate', () => {
      this.trackPageEnd();
    });
  }

  private startEventFlushing() {
    if (this.disabled) return;
    // Flush events every 30 seconds in production
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  private trackPageEnd() {
    const duration = Math.round((Date.now() - this.pageStartTime.getTime()) / 1000);

    if (duration > 0) {
      this.queueEvent('page_duration', {
        sessionId: this.sessionId,
        pagePath: window.location.pathname,
        duration
      });
    }
  }

  private queueEvent(type: string, data: any) {
    this.eventQueue.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    // Flush immediately for critical events
    if (type === 'purchase' || type === 'session_start') {
      this.flushEvents();
    }
  }

  private async flushEvents(synchronous = false) {
    if (this.eventQueue.length === 0) return;

    // Skip if disabled (development)
    if (this.disabled) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Respect backoff window if set
    if (this.backoffUntil && Date.now() < this.backoffUntil) {
      this.eventQueue.unshift(...events);
      return;
    }

    try {
      // Map events to database schema
      const dbEvents = events.map(event => ({
        session_id: event.data.sessionId,
        user_id: event.data.userId,
        event_type: event.type,
        page_path: event.data.pagePath,
        event_data: event.data, // Store full data JSON
        created_at: event.timestamp
      }));

      const { error } = await this.supabase
        .from('analytics_events')
        .insert(dbEvents);

      if (error) {
        console.warn('Supabase analytics insert failed:', error);
        // Re-queue events if failed
        this.eventQueue.unshift(...events);
        // Back off
        this.backoffUntil = Date.now() + 60_000;
      }
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events if failed
      this.eventQueue.unshift(...events);
    }
  }

  // Public methods for tracking

  setUserId(userId: string) {
    this.userId = userId;
  }

  trackPageView(pagePath?: string, pageTitle?: string) {
    const path = pagePath || window.location.pathname;
    const title = pageTitle || document.title;

    // Track end of previous page
    this.trackPageEnd();

    // Start tracking new page
    this.pageStartTime = new Date();

    const pageViewData: PageViewEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      pagePath: path,
      pageTitle: title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS()
    };

    this.queueEvent('page_view', pageViewData);

    // Track traffic source for new sessions
    if (this.isNewSession()) {
      this.trackTrafficSource();
    }
  }

  trackEcommerceEvent(event: Omit<EcommerceEvent, 'sessionId'>) {
    const ecommerceData: EcommerceEvent = {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
      currency: event.currency || 'DZD'
    };

    this.queueEvent('ecommerce_event', ecommerceData);
  }

  trackProductView(productId: string, categoryId?: string, value?: number) {
    this.trackEcommerceEvent({
      eventType: 'view_item',
      productId,
      categoryId,
      value,
      quantity: 1
    });
  }

  trackAddToCart(productId: string, quantity: number, value: number, categoryId?: string) {
    this.trackEcommerceEvent({
      eventType: 'add_to_cart',
      productId,
      categoryId,
      value,
      quantity
    });
  }

  trackRemoveFromCart(productId: string, quantity: number, value: number) {
    this.trackEcommerceEvent({
      eventType: 'remove_from_cart',
      productId,
      value,
      quantity
    });
  }

  trackBeginCheckout(value: number, items: Array<{ productId: string, quantity: number, value: number }>) {
    this.trackEcommerceEvent({
      eventType: 'begin_checkout',
      value,
      metadata: { items }
    });
  }

  trackPurchase(orderId: string, value: number, items: Array<{ productId: string, quantity: number, value: number }>) {
    this.trackEcommerceEvent({
      eventType: 'purchase',
      value,
      metadata: {
        orderId,
        items,
        transactionId: orderId
      }
    });
  }

  trackCategoryView(categoryId: string, categoryName?: string) {
    this.trackEcommerceEvent({
      eventType: 'view_category',
      categoryId,
      metadata: { categoryName }
    });
  }

  trackSearch(searchTerm: string, resultsCount?: number) {
    this.trackEcommerceEvent({
      eventType: 'search',
      metadata: {
        searchTerm,
        resultsCount
      }
    });
  }

  trackError(error: Error, errorInfo?: any) {
    this.queueEvent('error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });
  }

  private trackTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;

    const trafficData: TrafficSourceData = {
      sessionId: this.sessionId,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined
    };

    // Determine source and medium from referrer if UTM params not present
    if (!trafficData.utmSource && referrer) {
      const { source, medium } = this.parseReferrer(referrer);
      trafficData.source = source;
      trafficData.medium = medium;
    } else if (!trafficData.utmSource) {
      trafficData.source = 'direct';
      trafficData.medium = 'none';
    }

    this.queueEvent('traffic_source', trafficData);
  }

  private parseReferrer(referrer: string): { source: string; medium: string } {
    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();

      // Search engines
      if (hostname.includes('google')) return { source: 'google', medium: 'organic' };
      if (hostname.includes('bing')) return { source: 'bing', medium: 'organic' };
      if (hostname.includes('yahoo')) return { source: 'yahoo', medium: 'organic' };
      if (hostname.includes('duckduckgo')) return { source: 'duckduckgo', medium: 'organic' };

      // Social media
      if (hostname.includes('facebook')) return { source: 'facebook', medium: 'social' };
      if (hostname.includes('twitter') || hostname.includes('t.co')) return { source: 'twitter', medium: 'social' };
      if (hostname.includes('linkedin')) return { source: 'linkedin', medium: 'social' };
      if (hostname.includes('instagram')) return { source: 'instagram', medium: 'social' };
      if (hostname.includes('youtube')) return { source: 'youtube', medium: 'social' };

      // Default to referral
      return { source: hostname, medium: 'referral' };
    } catch {
      return { source: 'unknown', medium: 'referral' };
    }
  }

  private isNewSession(): boolean {
    const lastActivity = sessionStorage.getItem('last_activity');
    if (!lastActivity) return true;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity > 30 * 60 * 1000; // 30 minutes
  }

  private getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  }

  private getOS(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Unknown';
  }

  private async getLocationData(): Promise<{ country?: string; city?: string }> {
    if (typeof window === 'undefined') return {};

    try {
      // Resolve via frontend API route to avoid browser CORS issues
      const response = await fetch(`/api/geolocation`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      if (!response.ok) {
        return {};
      }
      const data = await response.json();

      return {
        country: data.country || data.country_name,
        city: data.city
      };
    } catch {
      return {};
    }
  }

  // Cleanup method
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents(true);
  }
}

// Create singleton instance - only on client side
export const analyticsService = typeof window !== 'undefined' ? new AnalyticsService() : null;

// Export for use in components
export default analyticsService;
