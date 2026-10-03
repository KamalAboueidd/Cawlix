// ─────────────────────────────────────────────────────────────────────────────
// Cawlix Tracker — Design System Tokens
// Single source of truth for all color, typography, and spacing values.
// These map 1-to-1 to the Tailwind config extension.
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Canvas
  canvas: '#1C1C1C',
  surface: '#242424',
  surfaceElevated: '#2A2A2A',

  // Borders
  border: '#2E2E2E',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',

  // Brand
  brand: '#3ECF8E',
  brandHover: '#34B27B',
  brandTint: 'rgba(62, 207, 142, 0.10)',
  brandTintHover: 'rgba(62, 207, 142, 0.18)',

  // Typography
  textPrimary: '#EDEDED',
  textSecondary: '#A1A1A1',
  textMuted: '#6B6B6B',
  textInverse: '#1C1C1C',

  // Semantic
  success: '#3ECF8E',
  warn: '#F59E0B',
  danger: '#EF4444',
  dangerTint: 'rgba(239, 68, 68, 0.10)',
  warnTint: 'rgba(245, 158, 11, 0.10)',
  successTint: 'rgba(62, 207, 142, 0.10)',
} as const;

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
} as const;

export const fontSize = {
  '2xs': '0.625rem',  // 10px — micro labels
  xs: '0.75rem',      // 12px — badges, captions
  sm: '0.875rem',     // 14px — body small
  base: '1rem',       // 16px — body default
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
} as const;

export const spacing = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const transition = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

// ── Retailer metadata (shared between landing + app) ─────────────────────────
export const RETAILER_META: Record<string, { name: string; region: string; color: string }> = {
  amazon_eg:  { name: 'Amazon EG',   region: 'EG', color: '#FF9900' },
  btech:      { name: 'B.TECH',      region: 'EG', color: '#E60028' },
  noon_eg:    { name: 'Noon',        region: 'EG', color: '#FEEE00' },
  tradeline:  { name: 'TradeLine',   region: 'EG', color: '#0066CC' },
  carrefour_eg:{ name: 'Carrefour',  region: 'EG', color: '#004A96' },
  jumia_eg:   { name: 'Jumia',       region: 'EG', color: '#F68B1E' },
  raneen:     { name: 'Raneen',      region: 'EG', color: '#8B5CF6' },
  '2b':       { name: '2B',          region: 'EG', color: '#10B981' },
  hisense_eg: { name: 'Hisense',     region: 'EG', color: '#003399' },
  hyper_one:  { name: 'Hyper One',   region: 'EG', color: '#CC0000' },
  amazon_us:  { name: 'Amazon US',   region: 'US', color: '#FF9900' },
  newegg:     { name: 'Newegg',      region: 'US', color: '#FF6600' },
  bh_photo:   { name: 'B&H Photo',   region: 'US', color: '#FFCC00' },
} as const;

export type DesignTokens = typeof colors;
