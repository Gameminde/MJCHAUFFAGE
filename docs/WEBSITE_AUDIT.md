# MJ CHAUFFAGE Website Audit & Unification Plan

## 🔍 Current State Analysis

### Pages Identified
1. **Home** (`page.tsx` → `ModernHomePage.tsx`) ✅ Modern design
2. **About** (`about/page.tsx`) ❓ Needs check
3. **Services** (`services/page.tsx` → `ModernServicesPage.tsx`) ✅ Modern design
4. **Products** (`products/page.tsx` → `ModernProductsPage.tsx`) ❓ Needs check
5. **Product Detail** (`products/[id]/page.tsx`) ⚠️ Has image issues
6. **Contact** (`contact/page.tsx`) ❓ Needs check
7. **Cart** (`cart/page.tsx`) ❓ Needs check
8. **Checkout** (`checkout/page.tsx`) ❓ Needs check
9. **Wishlist** (`wishlist/page.tsx`) ❓ Needs check
10. **Auth** (login/register) ❓ Needs check

---

## 🎨 Color Palette Issues

### Current State
**Tailwind Config defines:**
- `primary`: Blue (#0ea5e9 - sky-500)
- `accent`: Orange (#f3761a)
- `neutral`: Grays

**Problem:**
- **ModernHomePage**: Uses blue primary ✅
- **ModernServicesPage**: Uses orange-500/600 directly ❌
- **Need unification**: Should all use accent (orange) as brand color

### Recommended Fix
**Decision:** Orange is the MJ CHAUFFAGE brand color

**Update:**
1. Swap primary and accent in Tailwind config
2. Make orange the primary brand color
3. Use blue as secondary/accent
4. Update all components to use new scheme

```typescript
// Recommended Palette
primary: Orange #f3761a (main brand)
secondary: Blue #0ea5e9 (accents, links)
neutral: Grays (text, backgrounds)
semantic: Success/Warning/Error unchanged
```

---

## 🖼️ Product Image Issues

### Problem
**File:** `frontend/src/utils/imageUtils.ts`
```typescript
const backendServerUrl = 'http://localhost:3001'; // ❌ Hardcoded
```

**Impact:**
- Images won't load in production
- No flexibility for different environments

### Fix Required
```typescript
const backendServerUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
```

**Also update `.env.local`:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 🗂️ Sidebar Issues

### Current State
**File:** `@sidebar/default.tsx`
```typescript
export default function SidebarDefault() {
  return null; // ❌ Returns nothing
}
```

**Problem:**
- Sidebar parallel route is defined but not used
- Layout expects sidebar slot but it's empty
- May cause layout shifts or empty space

### Recommended Action
Either:
1. **Remove sidebar** from layout if not needed
2. **Implement sidebar** for product filtering, navigation
3. **Use sidebar** for mobile menu

**Decision needed:** What should the sidebar do?

---

## 📐 Design System Inconsistencies

### Typography
**Issues:**
- Some pages use `text-5xl`, others use `text-display-2xl`
- Inconsistent heading hierarchies
- Mixed font weights

**Fix:**
Standardize using design system:
```typescript
H1: text-display-2xl (hero)
H2: text-display-lg (section titles)
H3: text-heading-xl (subsections)
H4: text-heading-lg (card titles)
Body: text-body-md
Small: text-body-sm
```

### Spacing
**Issues:**
- Some use `py-16`, others use `section-padding`
- Inconsistent gaps between sections
- Mixed padding values

**Fix:**
```typescript
Section padding: py-16 lg:py-24 (or section-padding utility)
Card padding: p-6 lg:p-8
Element gap: gap-6 (golden-lg)
Section gap: mb-16 lg:mb-24
```

### Shadows
**Issues:**
- Mix of `shadow-lg`, `shadow-2xl`, `shadow-card`
- Inconsistent hover states

**Fix:**
```typescript
Cards: shadow-card hover:shadow-card-hover
Modals: shadow-elevated
Buttons: shadow-sm hover:shadow-md
```

---

## 🎯 Component Analysis

### Header & Navigation
**Status:** ✅ Exists
**Issues:** Need to check for color consistency

### Footer
**Status:** ✅ Exists
**Issues:** Need to check for color consistency

### Buttons
**Location:** `@/components/ui/Button`
**Issues:** Should use unified color scheme

### Cards
**Location:** `@/components/ui/Card`
**Issues:** Should use unified shadows and borders

---

## 🔧 Unification Plan

### Phase 1: Color Palette Fix (Priority: HIGH)
1. ✅ Update Tailwind config - swap primary/accent
2. ✅ Update ModernHomePage to use new scheme
3. ✅ Update ModernServicesPage to use new scheme  
4. ✅ Update Button component variants
5. ✅ Update Header/Footer colors
6. ✅ Test across all pages

### Phase 2: Image Fix (Priority: HIGH)
1. ✅ Update imageUtils.ts to use env variable
2. ✅ Add NEXT_PUBLIC_BACKEND_URL to .env.local
3. ✅ Test product images loading
4. ✅ Add better fallback/placeholder image

### Phase 3: Design System Application (Priority: MEDIUM)
1. ✅ Create reusable section wrapper component
2. ✅ Standardize typography across pages
3. ✅ Unify spacing and gaps
4. ✅ Consistent shadows and borders
5. ✅ Update all pages to use new components

### Phase 4: Page-by-Page Update (Priority: MEDIUM)
1. ✅ About page
2. ✅ Contact page
3. ✅ Products page
4. ✅ Product detail page
5. ✅ Cart page
6. ✅ Checkout page
7. ✅ Auth pages

### Phase 5: Sidebar Resolution (Priority: LOW)
1. ✅ Decide on sidebar purpose
2. ✅ Implement or remove
3. ✅ Update layout if needed

### Phase 6: Testing & Polish (Priority: LOW)
1. ✅ Test all pages in both locales (FR/AR)
2. ✅ Test responsive design
3. ✅ Check color contrast (accessibility)
4. ✅ Verify all images load
5. ✅ Cross-browser testing

---

## 📊 Design System Specification

### Brand Colors
```typescript
// PRIMARY BRAND: Orange
primary-50: #fef7ee
primary-100: #fdedd6
primary-200: #fbd7ac
primary-300: #f8bb77
primary-400: #f59440
primary-500: #f3761a  // MAIN BRAND COLOR
primary-600: #e45a10
primary-700: #bd440f
primary-800: #973714
primary-900: #7c2f14
primary-950: #431507

// SECONDARY: Blue
secondary-50: #f0f9ff
secondary-100: #e0f2fe
secondary-200: #bae6fd
secondary-300: #7dd3fc
secondary-400: #38bdf8
secondary-500: #0ea5e9  // ACCENT/LINKS
secondary-600: #0284c7
secondary-700: #0369a1
secondary-800: #075985
secondary-900: #0c4a6e
```

### Golden Ratio Values
```typescript
// Fibonacci sequence for spacing
spacing: [5, 8, 13, 21, 34, 55, 89, 144]px

// Animation timings
fast: 247ms (400 / φ)
base: 400ms
slow: 647ms (400 × φ)

// Layout proportions
hero-height: 61.8vh
content-width: 61.8%
sidebar-width: 38.2%
```

### Typography Scale
```typescript
Display (Hero):
- 2xl: 72px / 4.5rem
- xl: 60px / 3.75rem
- lg: 48px / 3rem

Heading:
- xl: 36px / 2.25rem
- lg: 30px / 1.875rem
- md: 24px / 1.5rem
- sm: 20px / 1.25rem

Body:
- xl: 20px / 1.25rem
- lg: 18px / 1.125rem
- md: 16px / 1rem
- sm: 14px / 0.875rem
- xs: 12px / 0.75rem
```

### Component Variants

#### Buttons
```typescript
Primary: Orange gradient, white text
Secondary: White bg, orange border
Outline: Transparent, orange border
Ghost: Transparent, orange text
```

#### Cards
```typescript
Default: White bg, card shadow
Elevated: White bg, elevated shadow
Glass: Translucent, backdrop blur
Gradient: Gradient bg, white text
```

---

## 🎨 Page-Specific Guidelines

### Home Page
- Hero: Orange gradient background
- Features: White cards with colored icons
- Categories: Gradient card borders
- CTA sections: Orange background

### Services Page
- Hero: Orange gradient (matching home)
- Service cards: White with orange accents
- Process steps: Colored icons (not all orange)
- Booking button: Orange primary

### Products Page
- Filters: Sidebar or top filters
- Product cards: White, consistent layout
- Images: Aspect ratio maintained
- Price: Orange color

### About Page
- Team section: Card grid
- Timeline: Vertical layout with icons
- Values: Icon grid

### Contact Page
- Form: Modern inputs with orange focus
- Map: Integrated
- Info cards: Orange icons

---

## ✅ Success Criteria

### Visual Consistency
- [ ] Same color palette across all pages
- [ ] Consistent typography hierarchy
- [ ] Uniform spacing and padding
- [ ] Matching shadows and borders
- [ ] Same button styles everywhere

### Functionality
- [ ] All images load correctly
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Responsive on all devices
- [ ] RTL works perfectly

### Performance
- [ ] Fast page loads (<2s)
- [ ] Optimized images
- [ ] Minimal bundle size
- [ ] No console errors

### Accessibility
- [ ] Color contrast AAA
- [ ] Keyboard navigation
- [ ] Screen reader friendly
- [ ] Focus indicators
- [ ] Alt text on images

---

## 🚀 Implementation Order

1. **Color system update** (1-2 hours)
2. **Image fix** (30 mins)
3. **Component standardization** (2-3 hours)
4. **Page updates** (4-6 hours)
5. **Testing** (2-3 hours)

**Total estimated time:** 10-14 hours

---

**Status:** 📝 Planning Complete - Ready for Implementation  
**Priority:** HIGH  
**Date:** 2025-01-28
