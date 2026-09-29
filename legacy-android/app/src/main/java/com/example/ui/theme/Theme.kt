package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

import androidx.compose.ui.graphics.Color

private val DarkColorScheme =
  darkColorScheme(
      primary = ForestGreenLight,
      onPrimary = Color.White,
      primaryContainer = ForestGreenMedium,
      onPrimaryContainer = MintContainer,
      secondary = HarvestGold,
      onSecondary = Color.Black,
      secondaryContainer = HarvestGoldDark,
      onSecondaryContainer = HarvestGoldContainer,
      tertiary = HarvestTerracotta,
      background = CanvasBackgroundDark,
      surface = CanvasSurfaceDark,
      surfaceVariant = CanvasSurfaceVariantDark,
      onBackground = Color(0xFFEDF2EC),
      onSurface = Color(0xFFEDF2EC),
      onSurfaceVariant = Color(0xFFB5C4B9),
      outline = CanvasBorderDark
  )

private val LightColorScheme =
  lightColorScheme(
      primary = ForestGreenPrimary,
      onPrimary = Color.White,
      primaryContainer = MintContainer,
      onPrimaryContainer = MintText,
      secondary = HarvestGold,
      onSecondary = Color.White,
      secondaryContainer = HarvestGoldContainer,
      onSecondaryContainer = HarvestGoldText,
      tertiary = HarvestTerracotta,
      onTertiary = Color.White,
      tertiaryContainer = TerracottaContainer,
      background = CanvasBackgroundLight,
      surface = CanvasSurfaceLight,
      surfaceVariant = CanvasSurfaceVariant,
      onBackground = EarthTextPrimary,
      onSurface = EarthTextPrimary,
      onSurfaceVariant = EarthTextSecondary,
      outline = CanvasBorderLight
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // Disable dynamic color by default so the curated 60-30-10 agricultural palette is strictly applied
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }

      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
