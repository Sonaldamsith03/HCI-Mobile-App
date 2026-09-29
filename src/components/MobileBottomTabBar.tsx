import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export type BuyerTab = 'marketplace' | 'saved' | 'cart' | 'orders' | 'profile';

interface TabConfig {
  id: BuyerTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  badge?: number;
  accentColor?: string;
}

interface MobileBottomTabBarProps {
  activeTab: BuyerTab;
  onTabChange: (tab: BuyerTab) => void;
  cartCount: number;
  savedCount: number;
  ordersCount: number;
}

// Single animated tab item — isolated so each has its own Animated.Values
const TabItem: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  isDark: boolean;
  onPress: () => void;
}> = ({ tab, isActive, isDark, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(isActive ? 1.08 : 0.9)).current;
  const badgeScaleAnim = useRef(new Animated.Value(tab.badge ? 1 : 0)).current;
  const prevBadge = useRef(tab.badge);

  // Spring bounce on active change
  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.spring(iconScaleAnim, {
          toValue: 1.22,
          useNativeDriver: true,
          damping: 10,
          stiffness: 300,
          mass: 0.7,
        }),
        Animated.spring(iconScaleAnim, {
          toValue: 1.06,
          useNativeDriver: true,
          damping: 14,
          stiffness: 260,
        }),
      ]).start();
    } else {
      Animated.spring(iconScaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        damping: 16,
        stiffness: 200,
      }).start();
    }
  }, [isActive]);

  // Badge pop-in when badge count changes
  useEffect(() => {
    if (tab.badge && tab.badge !== prevBadge.current) {
      Animated.sequence([
        Animated.spring(badgeScaleAnim, {
          toValue: 1.4,
          useNativeDriver: true,
          damping: 8,
          stiffness: 400,
        }),
        Animated.spring(badgeScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 300,
        }),
      ]).start();
    } else if (tab.badge) {
      Animated.spring(badgeScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 300,
      }).start();
    } else {
      Animated.spring(badgeScaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 300,
      }).start();
    }
    prevBadge.current = tab.badge;
  }, [tab.badge]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        useNativeDriver: true,
        damping: 12,
        stiffness: 500,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 300,
      }),
    ]).start();
    onPress();
  }, [onPress]);

  const accentColor = tab.accentColor || colors.forestGreenPrimary;
  const inactiveIconColor = isDark ? '#9CA3AF' : '#8E8E93';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
        {/* Active glow bubble behind icon */}
        {isActive && (
          <View
            style={[
              styles.activeGlowBubble,
              { backgroundColor: isDark ? `${accentColor}30` : `${accentColor}16` },
            ]}
          />
        )}

        <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={23}
            color={isActive ? accentColor : inactiveIconColor}
          />
        </Animated.View>

        {/* Badge — only rendered if tab has a count */}
        {!!tab.badge && tab.badge > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.badgePill,
              tab.id === 'cart' && styles.cartBadgePill,
              tab.id === 'saved' && styles.savedBadgePill,
              tab.id === 'orders' && styles.ordersBadgePill,
              { transform: [{ scale: badgeScaleAnim }] },
            ]}
          >
            <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
          </Animated.View>
        )}
      </Animated.View>

      <Text
        style={[
          styles.tabLabel,
          isDark && { color: '#9CA3AF' },
          isActive ? [styles.tabLabelActive, { color: accentColor }] : null,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>

      {/* Centered Active Indicator Dot under the tab */}
      {isActive ? (
        <View style={[styles.activeIndicatorDot, { backgroundColor: accentColor }]} />
      ) : (
        <View style={styles.inactiveIndicatorSpacer} />
      )}
    </TouchableOpacity>
  );
};

export const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  savedCount,
  ordersCount,
}) => {
  const insets = useSafeAreaInsets();
  let themeMode = 'light';
  try {
    const app = useApp();
    if (app?.themeMode) themeMode = app.themeMode;
  } catch {}
  const isDark = themeMode === 'dark';

  // Exact bottom inset calculation to align with device navigation pill / safe area
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 14 : 8);

  const tabs: TabConfig[] = [
    { id: 'marketplace', label: 'Market', icon: 'storefront-outline', activeIcon: 'storefront' },
    { id: 'saved', label: 'Saved', icon: 'heart-outline', activeIcon: 'heart', badge: savedCount > 0 ? savedCount : undefined, accentColor: '#EF4444' },
    { id: 'cart', label: 'Cart', icon: 'cart-outline', activeIcon: 'cart', badge: cartCount > 0 ? cartCount : undefined, accentColor: '#D97706' },
    { id: 'orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt', badge: ordersCount > 0 ? ordersCount : undefined, accentColor: '#06C167' },
    { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: bottomInset },
        isDark && styles.tabBarContainerDark,
      ]}
    >
      <View style={styles.tabBarInner}>
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            isDark={isDark}
            onPress={() => onTabChange(tab.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 20,
    width: '100%',
  },
  tabBarContainerDark: {
    backgroundColor: '#121212',
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 30,
  },
  activeGlowBubble: {
    position: 'absolute',
    width: 44,
    height: 28,
    borderRadius: 14,
  },
  badgePill: {
    position: 'absolute',
    top: -3,
    right: 2,
    backgroundColor: colors.forestGreenPrimary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgePill: {
    backgroundColor: '#D97706',
  },
  savedBadgePill: {
    backgroundColor: '#EF4444',
  },
  ordersBadgePill: {
    backgroundColor: '#06C167',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  inactiveIndicatorSpacer: {
    width: 4,
    height: 4,
    marginTop: 3,
  },
});
