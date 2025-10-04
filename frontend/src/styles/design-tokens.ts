/**
 * Design Tokens for MJ CHAUFFAGE 2025 Design System
 * Centralized design tokens for consistent styling across the application
 */

export const designTokens = {
  // Color System
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    
    // Accent colors
    accent: {
      50: '#fef7ee',
      100: '#fdedd6',
      200: '#fbd7ac',
      300: '#f8bb77',
      400: '#f59440',
      500: '#f3761a', // Modern orange
      600: '#e45a10',
      700: '#bd440f',
      800: '#973714',
      900: '#7c2f14',
      950: '#431507',
    },
    
    // Enhanced neutral scale
    neutral: {
      50: '#fafbfc',
      100: '#f4f6f8',
      200: '#e5e9f0',
      300: '#d1d8e4',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#0f172a',
      950: '#030712',
    },
    
    // Semantic colors
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Glass morphism
    glass: {
      white: 'rgba(255, 255, 255, 0.1)',
      black: 'rgba(0, 0, 0, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
  },
  
  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      display: ['Cal Sans', 'Inter Variable', 'Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    
    fontSize: {
      // Display sizes
      'display-2xl': { size: '4.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' },
      'display-xl': { size: '3.75rem', lineHeight: '1.2', letterSpacing: '-0.02em' },
      'display-lg': { size: '3rem', lineHeight: '1.2', letterSpacing: '-0.01em' },
      'display-md': { size: '2.25rem', lineHeight: '1.3', letterSpacing: '-0.01em' },
      
      // Headings
      'heading-xl': { size: '2.25rem', lineHeight: '1.3', letterSpacing: '-0.01em' },
      'heading-lg': { size: '1.875rem', lineHeight: '1.4' },
      'heading-md': { size: '1.5rem', lineHeight: '1.4' },
      'heading-sm': { size: '1.25rem', lineHeight: '1.5' },
      
      // Body text
      'body-xl': { size: '1.25rem', lineHeight: '1.6' },
      'body-lg': { size: '1.125rem', lineHeight: '1.6' },
      'body-md': { size: '1rem', lineHeight: '1.6' },
      'body-sm': { size: '0.875rem', lineHeight: '1.5' },
      'body-xs': { size: '0.75rem', lineHeight: '1.4' },
      
      // Utility
      caption: { size: '0.75rem', lineHeight: '1.4' },
      overline: { size: '0.75rem', lineHeight: '1.4', letterSpacing: '0.1em', textTransform: 'uppercase' },
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing System
  spacing: {
    // Base spacing scale
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    
    // Extended spacing
    18: '4.5rem',   // 72px
    22: '5.5rem',   // 88px
    26: '6.5rem',   // 104px
    30: '7.5rem',   // 120px
    88: '22rem',    // 352px
    112: '28rem',   // 448px
    128: '32rem',   // 512px
    144: '36rem',   // 576px
    160: '40rem',   // 640px
  },
  
  // Shadow System
  shadows: {
    // Subtle shadows
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    
    // Card shadows
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    cardLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    
    // Elevated shadows
    elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    elevatedLg: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    
    // Glow effects
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    glowAccent: '0 0 20px rgba(243, 118, 26, 0.3)',
    
    // Inner shadows
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    innerLg: 'inset 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  
  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Animation System
  animations: {
    // Durations
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    // Easing functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1680px',
    '4xl': '1920px',
  },
  
  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Type definitions for better TypeScript support
export type ColorScale = keyof typeof designTokens.colors.primary;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type Spacing = keyof typeof designTokens.spacing;
export type Shadow = keyof typeof designTokens.shadows;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type Breakpoint = keyof typeof designTokens.breakpoints;

// Utility functions for accessing design tokens
export const getColor = (color: string, scale?: ColorScale) => {
  const colorPath = color.split('.');
  let value: any = designTokens.colors;
  
  for (const path of colorPath) {
    value = value[path];
  }
  
  if (scale && typeof value === 'object') {
    return value[scale];
  }
  
  return value;
};

export const getFontSize = (size: FontSize) => {
  return designTokens.typography.fontSize[size];
};

export const getSpacing = (space: Spacing) => {
  return designTokens.spacing[space];
};

export const getShadow = (shadow: Shadow) => {
  return designTokens.shadows[shadow];
};

// CSS Custom Properties for runtime theming
export const cssVariables = {
  '--color-primary-50': designTokens.colors.primary[50],
  '--color-primary-500': designTokens.colors.primary[500],
  '--color-primary-900': designTokens.colors.primary[900],
  '--color-accent-500': designTokens.colors.accent[500],
  '--color-neutral-50': designTokens.colors.neutral[50],
  '--color-neutral-500': designTokens.colors.neutral[500],
  '--color-neutral-900': designTokens.colors.neutral[900],
  '--font-family-sans': designTokens.typography.fontFamily.sans.join(', '),
  '--font-family-display': designTokens.typography.fontFamily.display.join(', '),
  '--shadow-card': designTokens.shadows.card,
  '--shadow-card-hover': designTokens.shadows.cardHover,
  '--border-radius-lg': designTokens.borderRadius.lg,
  '--border-radius-xl': designTokens.borderRadius.xl,
} as const;