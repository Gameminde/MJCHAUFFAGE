import { v4 as uuidv4 } from 'uuid';

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

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = new Date();
    this.pageStartTime = new Date();
    
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    
    // Initialize session tracking
    this.initializeSession();
    
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
    const sessionData: SessionData = {
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      startedAt: this.sessionStartTime
    };

    // Get location data (optional)
    try {
      const locationData = await this.getLocationData();
      sessionData.country = locationData.country;
      sessionData.city = locationData.city;
    } catch (error) {
      console.warn('Failed to get location data:', error);
    }

    this.queueEvent('session_start', sessionData);
  }

  private setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageEnd();
      } else {
        this.pageStartTime = new Date();
      }
    });
  }

  private setupUnloadTracking() {
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
    // Flush events every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 10000);
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

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
        keepalive: synchronous
      });

      if (!response.ok) {
        // Re-queue events if failed
        this.eventQueue.unshift(...events);
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

  trackBeginCheckout(value: number, items: Array<{productId: string, quantity: number, value: number}>) {
    this.trackEcommerceEvent({
      eventType: 'begin_checkout',
      value,
      metadata: { items }
    });
  }

  trackPurchase(orderId: string, value: number, items: Array<{productId: string, quantity: number, value: number}>) {
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
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  private getOS(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  private async getLocationData(): Promise<{ country?: string; city?: string }> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name,
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

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export for use in components
export default analyticsService;