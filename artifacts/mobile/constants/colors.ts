// ── Brand constants (shared across both themes) ──────────────────
const brand = {
  midnight: '#0A1628',
  deep: '#111D32',
  navy: '#1A2942',
  teal: '#2EC4B6',
  tealLight: '#3DDFD0',
  gold: '#D4A843',
  goldLight: '#E8C76A',
  cream: '#F5F0E8',
  blue: '#4A90D9',
  error: '#E85D5D',
};

// ── Light theme ───────────────────────────────────────────────────
const light = {
  // Brand Colors — Nuve Palette
  midnight: brand.midnight,
  deep: brand.deep,
  navy: brand.navy,
  teal: brand.teal,
  tealLight: brand.tealLight,
  gold: brand.gold,
  goldLight: brand.goldLight,
  cream: brand.cream,
  white: '#FAFAF8',
  slate: '#8A95A5',
  grayLight: '#C4CCD6',
  blue: brand.blue,

  // Legacy aliases
  primary: brand.midnight,
  primaryLight: brand.navy,

  // Semantic Colors
  success: brand.teal,
  successLight: 'rgba(46,196,182,0.12)',
  warning: brand.gold,
  warningLight: 'rgba(212,168,67,0.12)',
  error: brand.error,
  errorLight: 'rgba(232,93,93,0.12)',
  info: brand.blue,
  infoLight: 'rgba(74,144,217,0.12)',

  // Neutrals
  black: '#000000',
  gray50: '#FAFAF8',
  gray100: '#F5F0E8',
  gray200: '#E5E7EB',
  gray300: '#C4CCD6',
  gray400: '#8A95A5',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background
  background: '#F0F0F0',
  backgroundDark: brand.midnight,
  surface: '#FAFAF8',
  surfaceDark: brand.navy,

  // Text
  textPrimary: brand.midnight,
  textSecondary: '#8A95A5',
  textMuted: '#8A95A5',
  textInverse: '#FAFAF8',

  // Chart Colors
  chart1: brand.midnight,
  chart2: brand.gold,
  chart3: brand.teal,
  chart4: brand.blue,
  chart5: brand.error,
  chart6: brand.tealLight,

  // Asset class colors
  equity: brand.midnight,
  bonds: brand.blue,
  assetGold: brand.gold,
  realestate: brand.teal,
  cash: '#8A95A5',
  crypto: brand.error,

  // Borders
  borderDark: 'rgba(255,255,255,0.06)',
  borderDarkStrong: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(10,22,40,0.06)',
  borderLightStrong: 'rgba(10,22,40,0.1)',
};

// ── Dark theme ────────────────────────────────────────────────────
const dark: typeof light = {
  // Brand Colors — Nuve Palette
  midnight: brand.midnight,
  deep: brand.deep,
  navy: brand.navy,
  teal: brand.teal,
  tealLight: brand.tealLight,
  gold: brand.gold,
  goldLight: brand.goldLight,
  cream: '#1A2942',
  white: '#1A2942',
  slate: '#8A95A5',
  grayLight: '#374151',
  blue: brand.blue,

  // Legacy aliases
  primary: brand.midnight,
  primaryLight: brand.navy,

  // Semantic Colors
  success: brand.teal,
  successLight: 'rgba(46,196,182,0.15)',
  warning: brand.gold,
  warningLight: 'rgba(212,168,67,0.15)',
  error: '#F06B6B',
  errorLight: 'rgba(240,107,107,0.15)',
  info: '#6AABF0',
  infoLight: 'rgba(106,171,240,0.15)',

  // Neutrals
  black: '#000000',
  gray50: '#111D32',
  gray100: '#1A2942',
  gray200: '#2A3A52',
  gray300: '#3D4F66',
  gray400: '#8A95A5',
  gray500: '#9CA3AF',
  gray600: '#C4CCD6',
  gray700: '#E5E7EB',
  gray800: '#F5F0E8',
  gray900: '#FAFAF8',

  // Background
  background: '#0A1628',
  backgroundDark: '#0A1628',
  surface: '#111D32',
  surfaceDark: '#1A2942',

  // Text
  textPrimary: '#F5F0E8',
  textSecondary: '#8A95A5',
  textMuted: '#6B7280',
  textInverse: brand.midnight,

  // Chart Colors
  chart1: '#F5F0E8',
  chart2: brand.gold,
  chart3: brand.teal,
  chart4: '#6AABF0',
  chart5: '#F06B6B',
  chart6: brand.tealLight,

  // Asset class colors
  equity: '#F5F0E8',
  bonds: '#6AABF0',
  assetGold: brand.gold,
  realestate: brand.teal,
  cash: '#8A95A5',
  crypto: '#F06B6B',

  // Borders (swapped — in dark mode "light" borders are the contextual ones)
  borderDark: 'rgba(255,255,255,0.06)',
  borderDarkStrong: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.08)',
  borderLightStrong: 'rgba(255,255,255,0.14)',
};

// ── Exports ───────────────────────────────────────────────────────

/** Get the full color palette for a theme */
export function getColors(isDark: boolean): typeof light {
  return isDark ? dark : light;
}

/** Default export — light theme for backward compatibility */
const Colors = light;
export default Colors;
