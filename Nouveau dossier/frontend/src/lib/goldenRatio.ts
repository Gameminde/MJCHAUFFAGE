/**
 * Golden Ratio Design System
 * φ (phi) ≈ 1.618 - The Golden Number
 * 
 * Used throughout the design for harmonious proportions and spacing
 */

export const PHI = 1.618;
export const PHI_INVERSE = 0.618; // 1/φ

/**
 * Golden Ratio spacing scale
 * Each value is approximately φ times the previous
 */
export const goldenSpacing = {
  xs: 8,        // Base unit
  sm: 13,       // 8 × φ ≈ 13
  md: 21,       // 13 × φ ≈ 21
  lg: 34,       // 21 × φ ≈ 34
  xl: 55,       // 34 × φ ≈ 55
  '2xl': 89,    // 55 × φ ≈ 89
  '3xl': 144,   // 89 × φ ≈ 144
  '4xl': 233,   // 144 × φ ≈ 233
};

/**
 * Golden Ratio font sizes
 * Based on 16px base, scaled by φ
 */
export const goldenFontSizes = {
  xs: 10,       // Base / φ²
  sm: 13,       // Base / φ
  base: 16,     // Base
  md: 21,       // Base × φ / 1.25
  lg: 26,       // Base × φ
  xl: 34,       // Base × φ × 1.3
  '2xl': 42,    // Base × φ²
  '3xl': 55,    // Base × φ² × 1.3
  '4xl': 68,    // Base × φ³
};

/**
 * Golden Rectangle aspect ratios
 */
export const goldenRatios = {
  wide: PHI,              // 1.618:1 (φ:1)
  standard: PHI_INVERSE,  // 0.618:1 (1:φ)
  square: 1,              // 1:1
};

/**
 * Calculate golden section of a value
 * Returns the larger and smaller sections based on golden ratio
 */
export function goldenSection(total: number): { major: number; minor: number } {
  const major = total * PHI_INVERSE; // 61.8% of total
  const minor = total * (1 - PHI_INVERSE); // 38.2% of total
  return { major, minor };
}

/**
 * Scale a value by golden ratio
 */
export function scaleByPhi(value: number, times: number = 1): number {
  return value * Math.pow(PHI, times);
}

/**
 * Get Fibonacci sequence values (approximates golden ratio)
 * Useful for spacing and sizing
 */
export const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

/**
 * Tailwind-compatible spacing classes based on golden ratio
 */
export const goldenSpacingClasses = {
  xs: 'p-2',       // 8px
  sm: 'p-3',       // 12px (close to 13)
  md: 'p-5',       // 20px (close to 21)
  lg: 'p-8',       // 32px (close to 34)
  xl: 'p-14',      // 56px (close to 55)
  '2xl': 'p-22',   // 88px (close to 89)
};

/**
 * Golden Ratio margins and paddings for layouts
 */
export const goldenLayout = {
  // Container max widths based on fibonacci
  container: {
    sm: '610px',
    md: '768px',
    lg: '987px',   // Fibonacci number
    xl: '1597px',  // Fibonacci number
  },
  
  // Grid gaps
  gap: {
    tight: fibonacci[2],    // 3
    normal: fibonacci[3],   // 5
    loose: fibonacci[4],    // 8
    relaxed: fibonacci[5],  // 13
  },
  
  // Section spacing
  section: {
    small: fibonacci[5],    // 13 (3.25rem)
    medium: fibonacci[6],   // 21 (5.25rem)
    large: fibonacci[7],    // 34 (8.5rem)
    xlarge: fibonacci[8],   // 55 (13.75rem)
  },
};

/**
 * Golden Ratio color harmony
 * Primary color should occupy 61.8% of design
 * Secondary color should occupy 38.2%
 * Accent color should be used sparingly
 */
export const goldenColorDistribution = {
  primary: 0.618,    // 61.8% - Dominant color (orange)
  secondary: 0.382,  // 38.2% - Supporting color (gray)
  accent: 0.05,      // 5% - Highlights (white, black)
};

/**
 * Typography line height based on golden ratio
 */
export function goldenLineHeight(fontSize: number): number {
  return fontSize * PHI;
}

/**
 * Card and component proportions
 */
export const goldenComponents = {
  card: {
    // Width to height ratio = φ:1
    aspectWide: `aspect-[${PHI.toFixed(2)}/1]`,
    aspectTall: `aspect-[1/${PHI.toFixed(2)}]`,
  },
  
  button: {
    // Padding ratio: horizontal should be φ × vertical
    paddingRatio: PHI,
  },
  
  hero: {
    // Hero section height: use major golden section of viewport
    heightRatio: PHI_INVERSE, // 61.8vh
  },
};

const golden = {
  PHI,
  PHI_INVERSE,
  goldenSpacing,
  goldenFontSizes,
  goldenRatios,
  goldenSection,
  scaleByPhi,
  fibonacci,
  goldenLayout,
  goldenColorDistribution,
  goldenLineHeight,
  goldenComponents,
};

export default golden;
