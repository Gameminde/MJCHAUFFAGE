'use client';

import React, { useEffect, useState } from 'react';
import { useMobile } from '@/hooks/useMobile';

interface MobileAccessibilityProps {
  children: React.ReactNode;
  skipToContent?: boolean;
  reduceMotion?: boolean;
  highContrast?: boolean;
}

export const MobileAccessibility: React.FC<MobileAccessibilityProps> = ({
  children,
  skipToContent = true,
  reduceMotion: forceReduceMotion,
  highContrast: forceHighContrast,
}) => {
  const { isMobile } = useMobile();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Check for accessibility preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    setPrefersReducedMotion(motionQuery.matches);
    setPrefersHighContrast(contrastQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const shouldReduceMotion = forceReduceMotion || prefersReducedMotion;
  const shouldUseHighContrast = forceHighContrast || prefersHighContrast;

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement;

    if (shouldReduceMotion) {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.2s');
    }

    if (shouldUseHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [shouldReduceMotion, shouldUseHighContrast]);

  return (
    <>
      {/* Skip to main content link for screen readers */}
      {skipToContent && isMobile && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          style={{ marginTop: '1rem' }}
        >
          Aller au contenu principal
        </a>
      )}

      {/* High contrast toggle for mobile users */}
      {isMobile && (
        <div className="sr-only" aria-live="polite">
          {shouldUseHighContrast && "Mode contraste élevé activé"}
          {shouldReduceMotion && "Animations réduites activées"}
        </div>
      )}

      {/* Apply accessibility attributes */}
      <div
        data-mobile={isMobile ? 'true' : 'false'}
        data-reduced-motion={shouldReduceMotion ? 'true' : 'false'}
        data-high-contrast={shouldUseHighContrast ? 'true' : 'false'}
      >
        {children}
      </div>
    </>
  );
};

// Hook to get current accessibility preferences
export const useAccessibility = () => {
  const { isMobile } = useMobile();
  const [accessibility, setAccessibility] = useState({
    reducedMotion: false,
    highContrast: false,
    isMobile,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateAccessibility = () => {
      setAccessibility({
        reducedMotion: motionQuery.matches,
        highContrast: contrastQuery.matches,
        isMobile,
      });
    };

    updateAccessibility();

    motionQuery.addEventListener('change', updateAccessibility);
    contrastQuery.addEventListener('change', updateAccessibility);

    return () => {
      motionQuery.removeEventListener('change', updateAccessibility);
      contrastQuery.removeEventListener('change', updateAccessibility);
    };
  }, [isMobile]);

  return accessibility;
};

export default MobileAccessibility;
