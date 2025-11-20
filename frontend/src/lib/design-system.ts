/**
 * SYSTÈME DE DESIGN BASÉ SUR LE NOMBRE D'OR (φ = 1.618)
 *
 * Principe: Chaque dimension est 1.618x la précédente
 * Résultat: Harmonie visuelle naturelle
 */

export const GOLDEN_RATIO = 1.618;
export const GOLDEN_RATIO_INVERSE = 0.618; // 1/φ

// ✅ ÉCHELLE D'ESPACEMENT (Golden Ratio)
export const spacing = {
  xs: 4,              // Base
  sm: 6,              // 4 × 1.5
  md: 10,             // 6 × 1.618 ≈ 10
  lg: 16,             // 10 × 1.618 ≈ 16
  xl: 26,             // 16 × 1.618 ≈ 26
  '2xl': 42,          // 26 × 1.618 ≈ 42
  '3xl': 68,          // 42 × 1.618 ≈ 68
  '4xl': 110,         // 68 × 1.618 ≈ 110
} as const;

// ✅ ÉCHELLE TYPOGRAPHIQUE (Golden Ratio)
export const typography = {
  xs: 10,             // 10px
  sm: 12,             // 10 × 1.2
  base: 16,           // 12 × 1.333 (ratio mineur)
  md: 18,             // 16 × 1.125
  lg: 20,             // 18 × 1.111
  xl: 24,             // 20 × 1.2
  '2xl': 30,          // 24 × 1.25
  '3xl': 36,          // 30 × 1.2
  '4xl': 48,          // 36 × 1.333
  '5xl': 60,          // 48 × 1.25
  '6xl': 72,          // 60 × 1.2
} as const;

// ✅ LAYOUT: Grille basée sur Golden Ratio
export const layout = {
  // Sidebar: 38.2% (Golden Ratio inverse)
  sidebarWidth: '38.2%',
  sidebarWidthPx: 280, // Pour mobile

  // Content: 61.8% (Golden Ratio)
  contentWidth: '61.8%',

  // Container max-width basé sur Golden Ratio
  containerSm: 640,    // Mobile
  containerMd: 1036,   // 640 × 1.618 ≈ 1036
  containerLg: 1440,   // Desktop
  containerXl: 1920,   // Large desktop
} as const;

// ✅ PROPORTIONS CARTES PRODUITS
export const productCard = {
  // Image: hauteur = largeur × Golden Ratio
  imageRatio: GOLDEN_RATIO, // 1.618:1

  // Dimensions recommandées
  imageHeight: 320,  // pixels
  imageWidth: 198,   // 320 / 1.618 ≈ 198

  // Padding interne selon Golden Ratio
  padding: spacing.lg,
  gap: spacing.md,
} as const;

// ✅ HELPER: Calculer dimension selon Golden Ratio
export function goldenScale(base: number, multiplier: number = 1): number {
  return Math.round(base * Math.pow(GOLDEN_RATIO, multiplier));
}

// ✅ HELPER: Calculer ratio inverse
export function goldenInverse(base: number): number {
  return Math.round(base * GOLDEN_RATIO_INVERSE);
}

// Exemples d'utilisation:
// goldenScale(16, 1) → 26px (16 × 1.618)
// goldenScale(16, 2) → 42px (16 × 1.618²)
// goldenInverse(100) → 62px (100 / 1.618)








