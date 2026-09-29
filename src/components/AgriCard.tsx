import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { IOSAnimatedPressable } from './IOSAnimatedPressable';
import { useApp } from '../context/AppContext';

interface AgriCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'surface' | 'variant' | 'mint' | 'gold';
}

export const AgriCard: React.FC<AgriCardProps> = ({
  children,
  style,
  onPress,
  variant = 'surface',
}) => {
  let themeMode = 'light';
  try {
    const app = useApp();
    if (app?.themeMode) themeMode = app.themeMode;
  } catch {
    // fallback
  }
  const isDark = themeMode === 'dark';

  const getBackgroundColor = () => {
    if (isDark) {
      switch (variant) {
        case 'variant':
          return '#1E1E20';
        case 'mint':
          return 'rgba(6, 193, 103, 0.15)';
        case 'gold':
          return 'rgba(255, 184, 0, 0.15)';
        case 'surface':
        default:
          return '#141414';
      }
    }
    switch (variant) {
      case 'variant':
        return colors.canvasSurfaceVariant;
      case 'mint':
        return colors.mintContainer;
      case 'gold':
        return colors.harvestGoldContainer;
      case 'surface':
      default:
        return colors.canvasSurface;
    }
  };

  const cardStyle = [
    styles.iosCard,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)',
    },
    style,
  ];

  if (onPress) {
    return (
      <IOSAnimatedPressable onPress={onPress} style={cardStyle} scaleTo={0.97}>
        {children}
      </IOSAnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  iosCard: {
    borderRadius: 20, // Apple continuous squircle
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
} as any);

