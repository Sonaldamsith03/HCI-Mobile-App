import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { OrderStatus } from '../types';

// ─────────────────────────────────────────────
// Shimmer skeleton loader (for image placeholders / card skeletons)
// ─────────────────────────────────────────────
export const AnimatedShimmer: React.FC<{
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}> = ({ width = '100%', height, borderRadius = 12, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: '#E8ECF0' }, style]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(255,255,255,0.55)',
            transform: [{ translateX }, { skewX: '-15deg' }],
          },
        ]}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// Organic Badge
// ─────────────────────────────────────────────
export const OrganicBadge: React.FC = () => {
  return (
    <View style={styles.organicBadge}>
      <MaterialCommunityIcons name="leaf" size={12} color={colors.forestGreenPrimary} />
      <Text style={styles.organicText}>100% Organic</Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// Middleman Savings Pill
// ─────────────────────────────────────────────
export const MiddlemanSavingsPill: React.FC<{
  directPrice: number;
  middlemanPrice: number;
}> = ({ directPrice, middlemanPrice }) => {
  if (!middlemanPrice || middlemanPrice <= directPrice) return null;
  const savingsPct = Math.round(((middlemanPrice - directPrice) / middlemanPrice) * 100);

  return (
    <View style={styles.savingsPill}>
      <Ionicons name="trending-down" size={12} color="#FFFFFF" />
      <Text style={styles.savingsText}>Save {savingsPct}% vs Supermarket</Text>
    </View>
  );
};

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  let bg = colors.statusConfirmedBg;
  let textCol = colors.statusConfirmed;
  let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'time-outline';

  switch (status) {
    case 'Packed at Farm':
      bg = colors.statusPackedBg;
      textCol = colors.statusPacked;
      iconName = 'cube-outline';
      break;
    case 'In Transit':
      bg = colors.statusTransitBg;
      textCol = colors.statusTransit;
      iconName = 'car-outline';
      break;
    case 'Delivered':
      bg = colors.statusDeliveredBg;
      textCol = colors.statusDelivered;
      iconName = 'checkmark-circle-outline';
      break;
    case 'Confirmed':
    default:
      bg = colors.statusConfirmedBg;
      textCol = colors.statusConfirmed;
      iconName = 'shield-checkmark-outline';
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Ionicons name={iconName} size={13} color={textCol} />
      <Text style={[styles.statusText, { color: textCol }]}>{status}</Text>
    </View>
  );
};

import { useApp } from '../context/AppContext';

// ─────────────────────────────────────────────
// Category Chip — animated press scale
// ─────────────────────────────────────────────
export const CategoryChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}> = ({ label, selected, onPress, count }) => {
  const scale = useRef(new Animated.Value(1)).current;

  let themeMode = 'light';
  try {
    const app = useApp();
    if (app?.themeMode) themeMode = app.themeMode;
  } catch {}
  const isDark = themeMode === 'dark';

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.90,
        useNativeDriver: true,
        damping: 12,
        stiffness: 500,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 300,
      }),
    ]).start();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View
        style={[
          styles.chip,
          selected
            ? (isDark ? styles.chipSelectedDark : styles.chipSelected)
            : (isDark ? styles.chipUnselectedDark : styles.chipUnselected),
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            selected
              ? styles.chipTextSelected
              : (isDark ? styles.chipTextUnselectedDark : styles.chipTextUnselected),
          ]}
        >
          {label}
        </Text>
        {count !== undefined && (
          <View
            style={[
              styles.chipBadge,
              selected ? styles.chipBadgeSelected : styles.chipBadgeUnselected,
            ]}
          >
            <Text
              style={[
                styles.chipBadgeText,
                selected ? styles.chipBadgeTextSelected : styles.chipBadgeTextUnselected,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  organicText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: -0.1,
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: -0.1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  chipSelected: {
    backgroundColor: '#1C1C1E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelectedDark: {
    backgroundColor: colors.forestGreenPrimary,
    shadowColor: colors.forestGreenPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  chipUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chipUnselectedDark: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: { fontSize: 12 },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  chipTextUnselected: { color: '#1C1C1E', fontWeight: '600' },
  chipTextUnselectedDark: { color: '#E5E7EB', fontWeight: '600' },
  chipBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  chipBadgeSelected: { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
  chipBadgeUnselected: { backgroundColor: 'rgba(0, 0, 0, 0.06)' },
  chipBadgeText: { fontSize: 11 },
  chipBadgeTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  chipBadgeTextUnselected: { color: '#636366', fontWeight: '600' },
} as any);
