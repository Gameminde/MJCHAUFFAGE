'use client';

// Mobile accessibility and performance audit utilities

interface MobileAuditResult {
  score: number;
  issues: string[];
  recommendations: string[];
  passed: boolean;
}

export const auditMobileAccessibility = (): MobileAuditResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for minimum touch target sizes (44px minimum)
  const touchTargets = document.querySelectorAll('button, a, [role="button"], input[type="submit"]');
  touchTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG minimum

    if (rect.width < minSize || rect.height < minSize) {
      issues.push(`Touch target trop petit: ${element.tagName} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
      recommendations.push(`Augmenter la taille minimale à ${minSize}px x ${minSize}px`);
    }
  });

  // Check for proper focus indicators
  const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
  focusableElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const hasFocusIndicator = computedStyle.outlineWidth !== '0px' ||
                             computedStyle.boxShadow !== 'none' ||
                             element.getAttribute('aria-label') ||
                             element.getAttribute('aria-labelledby');

    if (!hasFocusIndicator) {
      issues.push(`Élément focusable sans indicateur visuel: ${element.tagName}`);
      recommendations.push('Ajouter un indicateur de focus visible (outline, box-shadow, etc.)');
    }
  });

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level - lastLevel > 1 && lastLevel !== 0) {
      issues.push(`Hiérarchie de titres incorrecte: ${heading.tagName} après h${lastLevel}`);
      recommendations.push('Respecter la hiérarchie des titres (h1 → h2 → h3, etc.)');
    }
    lastLevel = level;
  });

  // Check for alt text on images
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
      issues.push(`Image sans texte alternatif: ${img.src}`);
      recommendations.push('Ajouter un attribut alt descriptif');
    }
  });

  // Check for proper color contrast (simplified check)
  const textElements = document.querySelectorAll('*');
  textElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const fontWeight = computedStyle.fontWeight;

    // Only check large text or bold text for contrast
    if (fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700)) {
      // Note: Full contrast checking would require color analysis
      recommendations.push('Vérifier le contraste des couleurs pour l\'accessibilité');
    }
  });

  // Calculate score
  const totalChecks = issues.length + recommendations.length;
  const score = Math.max(0, 100 - (issues.length * 10));

  return {
    score,
    issues,
    recommendations,
    passed: issues.length === 0,
  };
};

export const auditMobilePerformance = (): MobileAuditResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for large images without lazy loading
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('loading') || img.getAttribute('loading') !== 'lazy') {
      recommendations.push('Ajouter loading="lazy" aux images non-critiques');
    }
  });

  // Check for unused CSS/JS (simplified check)
  const scripts = document.querySelectorAll('script[src]');
  const styles = document.querySelectorAll('link[rel="stylesheet"]');

  if (scripts.length > 10) {
    issues.push(`Nombre élevé de scripts: ${scripts.length}`);
    recommendations.push('Optimiser le nombre de fichiers JavaScript');
  }

  if (styles.length > 5) {
    issues.push(`Nombre élevé de feuilles de style: ${styles.length}`);
    recommendations.push('Optimiser le nombre de fichiers CSS');
  }

  // Check for proper viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push('Meta viewport manquant');
    recommendations.push('Ajouter <meta name="viewport" content="width=device-width, initial-scale=1">');
  } else {
    const content = viewport.getAttribute('content');
    if (!content?.includes('width=device-width')) {
      issues.push('Meta viewport incorrect');
      recommendations.push('Corriger le meta viewport');
    }
  }

  // Check for touch-friendly interactions
  const clickableElements = document.querySelectorAll('a, button, [onclick], [role="button"]');
  clickableElements.forEach((element) => {
    const style = window.getComputedStyle(element);
    const touchAction = style.touchAction;

    if (touchAction === 'none' || touchAction === 'manipulation') {
      recommendations.push('Vérifier les interactions tactiles');
    }
  });

  const score = Math.max(0, 100 - (issues.length * 8));

  return {
    score,
    issues,
    recommendations,
    passed: issues.length === 0,
  };
};

// Utility function to run audits
export const runMobileAudits = () => {
  const accessibility = auditMobileAccessibility();
  const performance = auditMobilePerformance();

  console.group('🔍 Audit Mobile - Accessibilité');
  console.log(`Score: ${accessibility.score}/100`);
  if (accessibility.issues.length > 0) {
    console.log('❌ Problèmes:', accessibility.issues);
  }
  if (accessibility.recommendations.length > 0) {
    console.log('💡 Recommandations:', accessibility.recommendations);
  }
  console.groupEnd();

  console.group('⚡ Audit Mobile - Performance');
  console.log(`Score: ${performance.score}/100`);
  if (performance.issues.length > 0) {
    console.log('❌ Problèmes:', performance.issues);
  }
  if (performance.recommendations.length > 0) {
    console.log('💡 Recommandations:', performance.recommendations);
  }
  console.groupEnd();

  return {
    accessibility,
    performance,
    overallScore: Math.round((accessibility.score + performance.score) / 2),
  };
};

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add to window for easy access in dev tools
  (window as any).runMobileAudits = runMobileAudits;
}
