'use client';

import { createClient } from '@/lib/supabase/client';

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  [key: string]: number;
}

class PerformanceService {
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  };
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Observers initialization can be added here if needed
    }
  }

  // Disabled to prevent errors when analytics_events table doesn't exist
  private async sendToAnalytics(metric: string, value: number) {
    // Analytics event tracking is disabled until analytics_events table is created
    // This prevents errors when the table doesn't exist yet
    return;
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