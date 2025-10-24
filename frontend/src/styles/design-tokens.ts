/**
 * MJ CHAUFFAGE - Design Tokens 2025
 * Tokens de design centralisés pour assurer la cohérence visuelle
 */

export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  accent: {
    50: '#fef7ee',
    100: '#fdedd6',
    200: '#fbd7ac',
    300: '#f8bb77',
    400: '#f59440',
    500: '#f3761a',
    600: '#e45a10',
    700: '#bd440f',
    800: '#973714',
    900: '#7c2f14',
    950: '#431507',
  },
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
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  accent: 'linear-gradient(135deg, #f3761a 0%, #e45a10 100%)',
  mesh: 'radial-gradient(at 40% 20%, #0ea5e9 0px, transparent 50%), radial-gradient(at 80% 0%, #f3761a 0px, transparent 50%), radial-gradient(at 0% 50%, #22c55e 0px, transparent 50%)',
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    display: ['Cal Sans', 'Inter Variable', 'Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  },
  fontSize: {
    // Display sizes
    'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-xl': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
    'display-md': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
    // Headings
    'heading-xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
    'heading-lg': ['1.875rem', { lineHeight: '1.4' }],
    'heading-md': ['1.5rem', { lineHeight: '1.4' }],
    'heading-sm': ['1.25rem', { lineHeight: '1.5' }],
    // Body
    'body-xl': ['1.25rem', { lineHeight: '1.6' }],
    'body-lg': ['1.125rem', { lineHeight: '1.6' }],
    'body-md': ['1rem', { lineHeight: '1.6' }],
    'body-sm': ['0.875rem', { lineHeight: '1.5' }],
    'body-xs': ['0.75rem', { lineHeight: '1.4' }],
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const boxShadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(14, 165, 233, 0.3)',
  'glow-accent': '0 0 20px rgba(243, 118, 26, 0.3)',
} as const;

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1680px',
} as const;

export const animations = {
  transition: {
    fast: 'all 0.2s ease-in-out',
    normal: 'all 0.3s ease-out',
    slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Type exports for TypeScript
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type TypographyToken = keyof typeof typography;
