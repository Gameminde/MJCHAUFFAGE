'use client'

import { useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
}

interface UsePerformanceOptions {
  reportToAnalytics?: boolean
  threshold?: {
    lcp?: number
    fid?: number
    cls?: number
  }
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    reportToAnalytics = true,
    threshold = {
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1   // 0.1
    }
  } = options

  const reportMetric = useCallback(async (metric: PerformanceMetrics) => {
    if (!reportToAnalytics) return

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType || 'unknown',
        }),
      })
    } catch (error) {
      console.error('Failed to report performance metric:', error)
    }
  }, [reportToAnalytics])

  const measureWebVitals = useCallback(() => {
    // Measure LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          const lcp = lastEntry.startTime
          
          reportMetric({ lcp })
          
          if (threshold.lcp && lcp > threshold.lcp) {
            console.warn(`LCP is ${lcp}ms, which exceeds the threshold of ${threshold.lcp}ms`)
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Measure FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime
            
            reportMetric({ fid })
            
            if (threshold.fid && fid > threshold.fid) {
              console.warn(`FID is ${fid}ms, which exceeds the threshold of ${threshold.fid}ms`)
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Measure CLS (Cumulative Layout Shift)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          reportMetric({ cls: clsValue })
          
          if (threshold.cls && clsValue > threshold.cls) {
            console.warn(`CLS is ${clsValue}, which exceeds the threshold of ${threshold.cls}`)
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Cleanup observers on page unload
        window.addEventListener('beforeunload', () => {
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
        })
      } catch (error) {
        console.error('Error setting up performance observers:', error)
      }
    }
  }, [reportMetric, threshold])

  const measureNavigationTiming = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const metrics = {
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: 0, // Will be measured separately
        }
        
        // Measure FCP (First Contentful Paint)
        const paintEntries = performance.getEntriesByType('paint')
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime
        }
        
        reportMetric(metrics)
      }
    }
  }, [reportMetric])

  const measureResourceTiming = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      // Analyze slow resources
      const slowResources = resources.filter(resource => 
        resource.duration > 1000 // Resources taking more than 1 second
      )
      
      if (slowResources.length > 0) {
        console.warn('Slow resources detected:', slowResources.map(r => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize
        })))
      }
      
      // Report bundle sizes
      const jsResources = resources.filter(r => r.name.includes('.js'))
      const cssResources = resources.filter(r => r.name.includes('.css'))
      
      const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      
      if (totalJSSize > 250000) { // 250KB
        console.warn(`Total JS bundle size is ${(totalJSSize / 1024).toFixed(2)}KB, consider code splitting`)
      }
      
      if (totalCSSSize > 50000) { // 50KB
        console.warn(`Total CSS size is ${(totalCSSSize / 1024).toFixed(2)}KB, consider optimization`)
      }
    }
  }, [])

  useEffect(() => {
    // Wait for page load to measure performance
    if (document.readyState === 'complete') {
      measureWebVitals()
      measureNavigationTiming()
      measureResourceTiming()
    } else {
      window.addEventListener('load', () => {
        measureWebVitals()
        measureNavigationTiming()
        measureResourceTiming()
      })
    }
  }, [measureWebVitals, measureNavigationTiming, measureResourceTiming])

  return {
    measureWebVitals,
    measureNavigationTiming,
    measureResourceTiming,
    reportMetric,
  }
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}

// Hook for measuring API call performance
export function useAPIPerformance() {
  const measureAPICall = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const startTime = performance.now()
    
    try {
      const response = await fetch(url, options)
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Report slow API calls
      if (duration > 2000) { // More than 2 seconds
        console.warn(`Slow API call to ${url}: ${duration.toFixed(2)}ms`)
        
        // Report to analytics
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'api_call',
            url,
            duration,
            status: response.status,
            timestamp: Date.now(),
          }),
        }).catch(console.error)
      }
      
      return response
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.error(`API call failed to ${url} after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }, [])

  return { measureAPICall }
}