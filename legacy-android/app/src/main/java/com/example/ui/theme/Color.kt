package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// ============================================================================
// 60-30-10 PALETTE FOR AGRICONNECT
// ============================================================================

// --- 60% DOMINANT CANVAS (Natural, Clean, Warm Organic Light) ---
val CanvasBackgroundLight = Color(0xFFF8FAF7)
val CanvasSurfaceLight = Color(0xFFFFFFFF)
val CanvasSurfaceVariant = Color(0xFFF0F4EE)
val CanvasBorderLight = Color(0xFFE2E8DE)

val CanvasBackgroundDark = Color(0xFF0F1511)
val CanvasSurfaceDark = Color(0xFF18201B)
val CanvasSurfaceVariantDark = Color(0xFF222C25)
val CanvasBorderDark = Color(0xFF2D3830)

// --- 30% SECONDARY / STRUCTURAL (Deep Earth & Forest Evergreen) ---
val ForestGreenDark = Color(0xFF0A1F14)
val ForestGreenPrimary = Color(0xFF133E29)
val ForestGreenMedium = Color(0xFF1B5A3A)
val ForestGreenLight = Color(0xFF2E7D56)
val MintContainer = Color(0xFFE8F5EB)
val MintText = Color(0xFF0F3B22)

// --- 10% ACCENT POP (Warm Harvest Gold & Terracotta Amber) ---
val HarvestGold = Color(0xFFF59E0B)
val HarvestGoldDark = Color(0xFFD97706)
val HarvestGoldContainer = Color(0xFFFEF3C7)
val HarvestGoldText = Color(0xFF92400E)
val HarvestTerracotta = Color(0xFFDE6449)
val TerracottaContainer = Color(0xFFFDEEEA)

// --- HERO CANOPY TOKENS (Rich, Velvety, Eye-Safe Dark Forest) ---
val HeroCanopyStart = Color(0xFF0A1F14)
val HeroCanopyMid = Color(0xFF123522)
val HeroCanopyEnd = Color(0xFF18462D)
val HeroTextPrimary = Color(0xFFFFFFFF)
val HeroTextSecondary = Color(0xFFE2EFE7)
val HeroTextMuted = Color(0xFFC2D9CC)

// --- TEXT & HIGH-READABILITY CONTRAST TOKENS ---
val EarthTextPrimary = Color(0xFF111915) // Deep rich slate, maximum legibility
val EarthTextSecondary = Color(0xFF2C3E33) // High-contrast rich dark evergreen slate
val EarthTextMuted = Color(0xFF566B5E) // Solid, crisp medium contrast (WCAG AAA compliant)

// Legacy aliases for backwards compatibility
val PrimaryGreen = ForestGreenPrimary
val PrimaryGreenDark = ForestGreenDark
val AccentAmber = HarvestGold
val BackgroundLight = CanvasBackgroundLight
val SurfaceLight = CanvasSurfaceLight
val TextHighContrast = EarthTextPrimary
val TextMediumContrast = EarthTextSecondary


