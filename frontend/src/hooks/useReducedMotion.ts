'use client';

import { useEffect, useState } from 'react';
import { useMobile } from './useMobile';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { isMobile } = useMobile();

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Reduce animations on mobile or when user prefers reduced motion
  const shouldReduceMotion = prefersReducedMotion || isMobile;

  const getAnimationConfig = (baseConfig: {
    duration?: number;
    delay?: number;
    ease?: string;
    type?: string;
  }) => {
    if (shouldReduceMotion) {
      return {
        ...baseConfig,
        duration: Math.min(baseConfig.duration || 0.8, 0.3),
        delay: Math.min(baseConfig.delay || 0, 0.1),
      };
    }
    return baseConfig;
  };

  return {
    shouldReduceMotion,
    getAnimationConfig,
    prefersReducedMotion,
  };
}
