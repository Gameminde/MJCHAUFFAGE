'use client';

// API URL configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  navigationTiming?: PerformanceNavigationTiming;
}

class PerformanceService {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeNavigationTiming();
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('lcp', lastEntry.startTime);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('fid', this.metrics.fid);
        });
      });
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.reportMetric('cls', clsValue);
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.reportMetric('fcp', entry.startTime);
          }
        });
      });
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observer not supported:', error);
    }
  }

  private observeNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.metrics.navigationTiming = navigation;
            this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
            this.reportMetric('ttfb', this.metrics.ttfb);
            this.reportNavigationMetrics(navigation);
          }
        }, 0);
      });
    }
  }

  private reportMetric(name: string, value: number) {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    this.sendToAnalytics(name, value);
  }

  private reportNavigationMetrics(navigation: PerformanceNavigationTiming) {
    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connection: navigation.connectEnd - navigation.connectStart,
      server_response: navigation.responseEnd - navigation.responseStart,
      dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      page_load: navigation.loadEventEnd - navigation.fetchStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.sendToAnalytics(`navigation_${name}`, value);
    });
  }

  private async sendToAnalytics(metric: string, value: number) {
    try {
      await fetch(`${API_URL}/api/analytics/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric,
          value,
          timestamp: Date.now(),
          url: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      // Silently fail - endpoint may not exist yet
      console.debug('Performance metrics endpoint not available');
    }
  }

  // Public methods
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  measureCustomMetric(name: string, startTime: number, endTime?: number) {
    const duration = (endTime || performance.now()) - startTime;
    this.sendToAnalytics(`custom_${name}`, duration);
    return duration;
  }

  markStart(name: string) {
    performance.mark(`${name}_start`);
  }

  markEnd(name: string) {
    performance.mark(`${name}_end`);
    performance.measure(name, `${name}_start`, `${name}_end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      this.sendToAnalytics(`measure_${name}`, measure.duration);
    }
  }

  // Resource timing analysis
  analyzeResourceTiming() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const analysis = {
      totalResources: resources.length,
      slowResources: resources.filter(r => r.duration > 1000),
      largeResources: resources.filter(r => r.transferSize > 100000),
      blockedResources: resources.filter(r => r.requestStart > r.fetchStart + 50), // Approximation for blocked resources
    };

    this.sendToAnalytics('resource_analysis', analysis.totalResources);
    return analysis;
  }

  // Bundle size tracking
  trackBundleSize() {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    let totalSize = 0;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    [...scripts, ...styles].forEach(element => {
      const src = (element as HTMLScriptElement).src || (element as HTMLLinkElement).href;
      const resource = resources.find(r => r.name === src);
      if (resource && resource.transferSize) {
        totalSize += resource.transferSize;
      }
    });

    this.sendToAnalytics('bundle_size', totalSize);
    return totalSize;
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceService = new PerformanceService();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  return {
    markStart: performanceService.markStart.bind(performanceService),
    markEnd: performanceService.markEnd.bind(performanceService),
    measureCustomMetric: performanceService.measureCustomMetric.bind(performanceService),
    getMetrics: performanceService.getMetrics.bind(performanceService),
    analyzeResourceTiming: performanceService.analyzeResourceTiming.bind(performanceService),
  };
}