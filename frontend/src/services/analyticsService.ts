import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  eventType: string;
  pagePath?: string;
  productId?: string;
  categoryId?: string;
  eventData?: Record<string, any>;
}

const VISITOR_ID_KEY = 'mj_visitor_id';
const SESSION_ID_KEY = 'mj_session_id';
const SESSION_EXPIRY_MINUTES = 30;

class AnalyticsService {
  private supabase = createClient();

  /**
   * Get or create a persistent visitor ID
   */
  getVisitorId(): string {
    if (typeof window === 'undefined') return '';

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  }

  /**
   * Start a new analytics session
   */
  async startSession(): Promise<string | null> {
    try {
      const visitorId = this.getVisitorId();
      const { data: sessionId, error } = await this.supabase.rpc('start_analytics_session', {
        p_visitor_id: visitorId,
        p_device_type: this.getDeviceType(),
        p_browser: this.getBrowser(),
        p_os: this.getOS(),
        p_ip_address: null // IP will be handled by server/edge function if needed, or omitted for privacy
      });

      if (error) throw error;

      if (sessionId) {
        this.cacheSession(sessionId);
      }

      return sessionId;
    } catch (error) {
      console.error('Failed to start analytics session:', error);
      return null;
    }
  }

  /**
   * Log an analytics event
   */
  async logEvent(event: AnalyticsEvent): Promise<void> {
    try {
      let sessionId = this.getCachedSession();

      // If no active session, start one
      if (!sessionId) {
        sessionId = await this.startSession();
      }

      if (!sessionId) return; // Failed to start session

      const { error } = await this.supabase.rpc('log_analytics_event', {
        p_session_id: sessionId,
        p_event_type: event.eventType,
        p_page_path: event.pagePath || window.location.pathname,
        p_product_id: event.productId,
        p_category_id: event.categoryId,
        p_event_data: event.eventData
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  /**
   * Helper to cache session ID with expiry
   */
  private cacheSession(sessionId: string) {
    if (typeof window === 'undefined') return;

    const sessionData = {
      id: sessionId,
      expiresAt: Date.now() + (SESSION_EXPIRY_MINUTES * 60 * 1000)
    };
    localStorage.setItem(SESSION_ID_KEY, JSON.stringify(sessionData));
  }

  /**
   * Helper to get valid cached session
   */
  private getCachedSession(): string | null {
    if (typeof window === 'undefined') return null;

    const sessionDataStr = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionDataStr) return null;

    try {
      const sessionData = JSON.parse(sessionDataStr);
      if (Date.now() > sessionData.expiresAt) {
        localStorage.removeItem(SESSION_ID_KEY);
        return null;
      }

      // Extend expiry on activity
      this.cacheSession(sessionData.id);
      return sessionData.id;
    } catch {
      return null;
    }
  }

  // --- Simple Device Detection Helpers ---

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
    return 'desktop';
  }

  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.indexOf("Chrome") > -1) return "Chrome";
    if (ua.indexOf("Safari") > -1) return "Safari";
    if (ua.indexOf("Firefox") > -1) return "Firefox";
    if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1) return "IE";
    if (ua.indexOf("Edge") > -1) return "Edge";
    return "Unknown";
  }

  private getOS(): string {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.indexOf("Win") > -1) return "Windows";
    if (ua.indexOf("Mac") > -1) return "MacOS";
    if (ua.indexOf("Linux") > -1) return "Linux";
    if (ua.indexOf("Android") > -1) return "Android";
    if (ua.indexOf("like Mac") > -1) return "iOS";
    return "Unknown";
  }
}

export const analyticsService = new AnalyticsService();
