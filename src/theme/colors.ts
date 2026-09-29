/**
 * AgriConnect Uber-Inspired Design System Color Tokens
 * 
 * Aesthetic Philosophy:
 * - High-contrast minimalist foundation (Pure Black #000000, Carbon #121212, White #FFFFFF)
 * - Signature Electric Emerald (#06C167) inspired by Uber Eats & modern fintech
 * - Clean translucent micro-borders and glass surfaces
 * - Backward-compatible aliases for seamless integration across all app views
 */

export const colors = {
  // ── Uber Modern Foundation ──────────────────────────────────────────
  uberBlack: '#000000',
  uberCarbon: '#0A0A0A',
  uberSurfaceDark: '#141414',
  uberSurfaceCard: '#1A1A1A',
  uberSurfaceElevated: '#222222',
  uberBorderDark: 'rgba(255, 255, 255, 0.09)',
  uberBorderSubtle: 'rgba(255, 255, 255, 0.05)',

  uberWhite: '#FFFFFF',
  uberGrayLight: '#F6F6F6',
  uberGrayMedium: '#E5E7EB',
  uberTextMutedDark: '#8E8E93',
  uberTextMutedLight: '#71717A',

  // ── High-Impact Accents ─────────────────────────────────────────────
  uberGreen: '#06C167', // Signature Electric Emerald
  uberGreenDark: '#049751',
  uberGreenLight: '#10D978',
  uberGreenSoft: 'rgba(6, 193, 103, 0.12)',

  uberAmber: '#FFB800',
  uberAmberSoft: 'rgba(255, 184, 0, 0.14)',
  uberRed: '#FF3B30',
  uberRedSoft: 'rgba(255, 59, 48, 0.12)',
  uberBlue: '#276EF1', // Uber Ride Blue
  uberBlueSoft: 'rgba(39, 110, 241, 0.12)',

  // ── Theme Aliases (Canvas & Surfaces) ───────────────────────────────
  canvasBackground: '#FFFFFF', // Pure Uber white canvas
  canvasBackgroundDark: '#000000', // Pure Uber black canvas
  canvasBackgroundGradient: ['#FFFFFF', '#F8F8F8', '#FFFFFF'] as const,
  canvasSurface: '#FFFFFF',
  canvasSurfaceSolid: '#FFFFFF',
  canvasSurfaceVariant: '#F3F3F3', // Uber tile surface
  canvasBorder: 'rgba(0, 0, 0, 0.07)',
  canvasBorderSubtle: 'rgba(0, 0, 0, 0.04)',

  // ── Typography ──────────────────────────────────────────────────────
  appleDark: '#000000', // Pure Uber black title label
  appleSecondary: '#545454',
  appleTertiary: '#8E8E93',
  applePillFill: 'rgba(0, 0, 0, 0.05)',
  appleGlassHighlight: 'rgba(255, 255, 255, 0.95)',

  // ── Signature Brand Colors ──────────────────────────────────────────
  forestGreenPrimary: '#06C167', // Updated to Uber's vibrant signature emerald
  forestGreenMedium: '#049751',
  forestGreenLight: '#10D978',
  mintContainer: 'rgba(6, 193, 103, 0.10)',
  mintText: '#047840',

  // ── Warm & Escrow Accents ───────────────────────────────────────────
  harvestGold: '#FFB800',
  harvestGoldContainer: 'rgba(255, 184, 0, 0.14)',
  harvestGoldText: '#B45309',
  harvestTerracotta: '#FF3B30',
  terracottaContainer: 'rgba(255, 59, 48, 0.12)',

  // ── Modern Carbon Hero Gradients ────────────────────────────────────
  heroCanopyStart: '#000000',
  heroCanopyMid: '#121212',
  heroCanopyEnd: '#1A1A1A',
  heroGradient: ['#000000', '#111111', '#1A1A1A'] as const,
  heroTextPrimary: '#FFFFFF',
  heroTextSecondary: 'rgba(255, 255, 255, 0.88)',
  heroTextMuted: 'rgba(255, 255, 255, 0.60)',

  // ── Body & Neutral Text ─────────────────────────────────────────────
  earthTextPrimary: '#000000',
  earthTextSecondary: '#545454',
  earthTextMuted: '#8E8E93',

  // ── Status Tokens ───────────────────────────────────────────────────
  statusConfirmed: '#276EF1',
  statusConfirmedBg: 'rgba(39, 110, 241, 0.10)',
  statusPacked: '#7C3AED',
  statusPackedBg: 'rgba(124, 58, 237, 0.10)',
  statusTransit: '#FFB800',
  statusTransitBg: 'rgba(255, 184, 0, 0.12)',
  statusDelivered: '#06C167',
  statusDeliveredBg: 'rgba(6, 193, 103, 0.12)',

  // ── Overlays ────────────────────────────────────────────────────────
  glassOverlay: 'rgba(255, 255, 255, 0.90)',
  modalBackdrop: 'rgba(0, 0, 0, 0.65)',
};

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  navBackground: string;
  navBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabInactive: string;
  tabActive: string;
  accent: string;
  accentLight: string;
  accentSoft: string;
}

export const getThemeColors = (mode: 'light' | 'dark'): ThemeColors => {
  const isDark = mode === 'dark';
  return {
    isDark,
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#121212' : '#FFFFFF',
    surfaceVariant: isDark ? '#1E1E1E' : '#F3F3F3',
    surfaceElevated: isDark ? '#242426' : '#FFFFFF',
    card: isDark ? '#141414' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    textPrimary: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#A1A1AA' : '#545454',
    textMuted: isDark ? '#71717A' : '#8E8E93',
    border: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    borderSubtle: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    navBackground: isDark ? '#121212' : '#FFFFFF',
    navBorder: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)',
    inputBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
    inputText: isDark ? '#FFFFFF' : '#000000',
    inputPlaceholder: isDark ? '#71717A' : '#8E8E93',
    tabBarBackground: isDark ? '#121212' : 'rgba(255, 255, 255, 0.97)',
    tabBarBorder: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
    tabInactive: isDark ? '#71717A' : '#8E8E93',
    tabActive: colors.forestGreenPrimary, // #06C167
    accent: colors.forestGreenPrimary,
    accentLight: '#10D978',
    accentSoft: 'rgba(6, 193, 103, 0.14)',
  };
};

