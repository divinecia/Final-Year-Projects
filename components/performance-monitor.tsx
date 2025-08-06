'use client';

import React, { useEffect } from 'react';

// Utility: Format bytes to MB with 2 decimals
const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Core Web Vitals observer
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'navigation': {
            const nav = entry as PerformanceNavigationTiming;
            console.log('Navigation Timing:', {
              DNS: nav.domainLookupEnd - nav.domainLookupStart,
              Connection: nav.connectEnd - nav.connectStart,
              Request: nav.responseStart - nav.requestStart,
              Response: nav.responseEnd - nav.responseStart,
              DOM: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
              Total: nav.loadEventEnd - nav.fetchStart,
            });
            break;
          }
          case 'paint':
            console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
            break;
          case 'largest-contentful-paint':
            console.log(`LCP: ${entry.startTime.toFixed(2)}ms`);
            break;
        }
      }
    });

    observer.observe({
      entryTypes: ['navigation', 'paint', 'largest-contentful-paint'],
    });

    // Memory usage monitor (Chrome only)
    const checkMemory = () => {
      const perf = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
      if (perf.memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = perf.memory;
        console.log('Memory Usage:', {
          used: formatMB(usedJSHeapSize),
          total: formatMB(totalJSHeapSize),
          limit: formatMB(jsHeapSizeLimit),
        });
      }
    };

    const memoryInterval = setInterval(checkMemory, 30000);
    checkMemory(); // Initial check

    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return null;
}

// HOC: React performance profiler
export function withPerformanceProfiler<P>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function ProfiledComponent(props: React.PropsWithChildren<P>) {
    return (
      <React.Profiler
        id={componentName}
        onRender={(_id, phase, actualDuration) => {
          if (actualDuration > 16) {
            // Consider logging to analytics endpoint in production
            console.warn(
              `Slow render in ${componentName} (${phase}): ${actualDuration.toFixed(2)}ms`
            );
          }
        }}
      >
        <Component {...props} />
      </React.Profiler>
    );
  };
}