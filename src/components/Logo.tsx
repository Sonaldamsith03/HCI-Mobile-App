import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'mark' | 'horizontal';
  themeMode?: 'dark' | 'light';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  themeMode = 'dark',
  showTagline = false,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { markSize: 32, iconSize: 18, fontSize: 17, tagSize: 8.5, gap: 8 };
      case 'lg':
        return { markSize: 64, iconSize: 34, fontSize: 26, tagSize: 11, gap: 14 };
      case 'xl':
        return { markSize: 84, iconSize: 46, fontSize: 34, tagSize: 13, gap: 16 };
      case 'hero':
        return { markSize: 104, iconSize: 54, fontSize: 40, tagSize: 14, gap: 18 };
      case 'md':
      default:
        return { markSize: 44, iconSize: 24, fontSize: 21, tagSize: 10, gap: 10 };
    }
  };

  const { markSize, iconSize, fontSize, tagSize, gap } = getDimensions();
  const isDark = themeMode === 'dark';

  const markComponent = (
    <View
      style={[
        styles.markContainer,
        {
          width: markSize,
          height: markSize,
          borderRadius: markSize * 0.30,
          backgroundColor: isDark ? '#0A0F0D' : '#FFFFFF',
          borderColor: isDark ? 'rgba(6, 193, 103, 0.30)' : '#E5E7EB',
          borderWidth: 1.5,
          shadowColor: '#06C167',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.30 : 0.10,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(6, 193, 103, 0.20)', 'rgba(4, 120, 87, 0.05)']
            : ['rgba(6, 193, 103, 0.15)', 'rgba(255, 255, 255, 0.90)']
        }
        style={[
          styles.glowRing,
          {
            width: markSize * 0.82,
            height: markSize * 0.82,
            borderRadius: markSize * 0.24,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="sprout"
          size={iconSize}
          color="#06C167"
        />
      </LinearGradient>

      {/* Modern accent micro-dot representing direct connection */}
      <View
        style={[
          styles.nodeDot,
          {
            top: markSize * 0.14,
            right: markSize * 0.14,
            width: markSize * 0.18,
            height: markSize * 0.18,
            borderRadius: (markSize * 0.18) / 2,
            backgroundColor: '#06C167',
            borderColor: isDark ? '#0A0F0D' : '#FFFFFF',
          },
        ]}
      />
    </View>
  );

  if (variant === 'mark') {
    return markComponent;
  }

  const textColor = isDark ? '#FFFFFF' : '#111827';
  const taglineColor = isDark ? '#A1A1AA' : '#6B7280';

  return (
    <View
      style={[
        variant === 'full' ? styles.fullLayout : styles.horizontalLayout,
        { gap },
      ]}
    >
      {markComponent}
      <View style={variant === 'full' ? styles.centerAlign : styles.leftAlign}>
        <View style={styles.brandTextRow}>
          <Text style={[styles.brandTextMain, { fontSize, color: textColor }]}>
            Farm
          </Text>
          <Text style={[styles.brandTextAccent, { fontSize }]}>
            By
          </Text>
        </View>
        {showTagline && (
          <Text style={[styles.tagline, { fontSize: tagSize, color: taglineColor }]}>
            DIRECT FARM MARKETPLACE
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  markContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  glowRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeDot: {
    position: 'absolute',
    borderWidth: 2,
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  leftAlign: {
    justifyContent: 'center',
  },
  centerAlign: {
    alignItems: 'center',
    marginTop: 8,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextMain: {
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brandTextAccent: {
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: -0.6,
  },
  tagline: {
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 3,
    textTransform: 'uppercase',
  },
});
