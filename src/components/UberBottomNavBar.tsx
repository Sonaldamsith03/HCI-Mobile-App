import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';

export type AppNavTab = 'home' | 'services' | 'activity' | 'account';

interface UberNavBarProps {
  activeTab?: AppNavTab;
  onTabSelect?: (tab: AppNavTab) => void;
}

const TAB_CONFIG: {
  id: AppNavTab;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  params?: any;
}[] = [
  {
    id: 'home',
    label: 'Home',
    iconOutline: 'home-outline',
    iconFilled: 'home',
    route: 'Landing',
  },
  {
    id: 'services',
    label: 'Services',
    iconOutline: 'grid-outline',
    iconFilled: 'grid',
    route: 'RoleSelection',
  },
  {
    id: 'activity',
    label: 'Activity',
    iconOutline: 'receipt-outline',
    iconFilled: 'receipt',
    route: 'BuyerDashboard',
    params: { initialTab: 'orders' },
  },
  {
    id: 'account',
    label: 'Account',
    iconOutline: 'person-outline',
    iconFilled: 'person',
    route: 'Onboarding',
  },
];

// Interactive Tab Button with individual spring press animation
const InteractiveTabButton: React.FC<{
  tab: typeof TAB_CONFIG[number];
  isActive: boolean;
  isDark: boolean;
  onPress: () => void;
}> = ({ tab, isActive, isDark, onPress }) => {
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.9,
      useNativeDriver: true,
      damping: 14,
      stiffness: 350,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 300,
    }).start();
  };

  // Active state: Pill is completely black in light mode, completely white in dark mode
  // The icon and text inside active tab invert: white in light mode, black in dark mode
  const activeIconColor = isDark ? '#000000' : '#FFFFFF';
  const inactiveIconColor = isDark ? '#71717A' : '#71717A';

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
    >
      <Animated.View style={[styles.tabContentWrap, { transform: [{ scale: pressScale }] }]}>
        <Ionicons
          name={isActive ? tab.iconFilled : tab.iconOutline}
          size={21}
          color={isActive ? activeIconColor : inactiveIconColor}
        />
        <Text
          style={[
            styles.tabLabel,
            isDark ? styles.tabLabelDark : styles.tabLabelLight,
            isActive && (isDark ? styles.tabLabelActiveDark : styles.tabLabelActiveLight),
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const UberBottomNavBar: React.FC<UberNavBarProps> = ({ activeTab, onTabSelect }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { themeMode, setCurrentRole, setNavTransitionDirection, setCurrentBottomTab } = useApp();
  const isDark = themeMode === 'dark';

  // Determine active tab automatically from route name if not explicitly passed
  let resolvedTab: AppNavTab = activeTab || 'home';
  if (!activeTab) {
    if (route.name === 'Landing') resolvedTab = 'home';
    else if (route.name === 'RoleSelection') resolvedTab = 'services';
    else if (route.name === 'BuyerDashboard') resolvedTab = 'activity';
    else if (route.name === 'Onboarding') resolvedTab = 'account';
    else if (route.name === 'LogisticsDashboard' || route.name === 'FarmerDashboard' || route.name === 'AdminDashboard') {
      resolvedTab = 'services';
    }
  }

  // Find index of current tab (0 to 3)
  const activeIndex = TAB_CONFIG.findIndex(t => t.id === resolvedTab);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // Animated sliding pill position (0 to 3)
  const slideAnim = useRef(new Animated.Value(safeActiveIndex)).current;

  // Interactive pulse on tab transition
  const squashAnim = useRef(new Animated.Value(1)).current;

  // Dynamic layout measurement to guarantee 100% pixel-perfect centering
  const [containerWidth, setContainerWidth] = React.useState(0);

  useEffect(() => {
    // Animate sliding pill to new tab index with Uber spring physics
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: safeActiveIndex,
        damping: 18,
        stiffness: 240,
        mass: 0.75,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(squashAnim, {
          toValue: 0.93,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(squashAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 280,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [safeActiveIndex]);

  const handleTabPress = (tab: typeof TAB_CONFIG[number]) => {
    if (tab.id === 'activity') {
      setCurrentRole('BUYER');
    }

    if (onTabSelect) {
      onTabSelect(tab.id);
      return;
    }

    // Always navigate via MainTabs container so the bottom navigation bar never slides or transitions with screen stacks!
    setCurrentBottomTab(tab.id);
    navigation.navigate('MainTabs', { tab: tab.id });
  };

  // Measured width or fallback to screenWidth - 32
  const measuredWidth = containerWidth || (Dimensions.get('window').width - 32);
  const tabWidth = measuredWidth / 4;
  const pillHorizontalPadding = 4;
  const pillWidth = tabWidth - (pillHorizontalPadding * 2);

  const bubbleTranslateX = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      0 * tabWidth + pillHorizontalPadding,
      1 * tabWidth + pillHorizontalPadding,
      2 * tabWidth + pillHorizontalPadding,
      3 * tabWidth + pillHorizontalPadding,
    ],
  });

  return (
    <View pointerEvents="box-none" style={styles.floatingDockWrapper}>
      <View
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          if (width > 0 && width !== containerWidth) {
            setContainerWidth(width);
          }
        }}
        style={[styles.floatingBar, isDark ? styles.floatingBarDark : styles.floatingBarLight]}
      >
        {/* Completely Black in Light Mode / Completely White in Dark Mode */}
        <Animated.View
          style={[
            styles.bubbleIndicator,
            isDark ? styles.bubbleIndicatorDark : styles.bubbleIndicatorLight,
            {
              width: pillWidth,
              transform: [
                { translateX: bubbleTranslateX },
                { scale: squashAnim },
              ],
            },
          ]}
        />

        {/* Tab Items */}
        {TAB_CONFIG.map((tab) => (
          <InteractiveTabButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === resolvedTab}
            isDark={isDark}
            onPress={() => handleTabPress(tab)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingDockWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 14,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 56,
    borderRadius: 28,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  floatingBarLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
  },
  floatingBarDark: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    shadowColor: '#000000',
    shadowOpacity: 0.7,
  },
  // Pill indicator: Completely Black in light mode, completely White in dark mode
  bubbleIndicator: {
    position: 'absolute',
    top: 4,
    left: 0,
    height: 48,
    borderRadius: 24,
    zIndex: 0,
  },
  bubbleIndicatorLight: {
    backgroundColor: '#000000',
  },
  bubbleIndicatorDark: {
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  tabContentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  tabLabelLight: {
    color: '#71717A',
  },
  tabLabelDark: {
    color: '#A1A1AA',
  },
  tabLabelActiveLight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabLabelActiveDark: {
    color: '#000000',
    fontWeight: '800',
  },
});
