import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavBarProps {
  currentTab?: 'home' | 'explore' | 'orders' | 'messages' | 'profile';
}

export function BottomNavBar({ currentTab }: BottomNavBarProps) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (currentTab) return currentTab;
    if (pathname === '/' || pathname === '/index') return 'home';
    if (pathname.includes('/explore')) return 'explore';
    if (pathname.includes('/orders')) return 'orders';
    if (pathname.includes('/messages') || pathname.includes('/chat')) return 'messages';
    if (pathname.includes('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      id: 'home',
      name: 'Home',
      iconOutline: 'home-outline' as const,
      iconFilled: 'home' as const,
      route: '/',
    },
    {
      id: 'explore',
      name: 'Explore',
      iconOutline: 'search-outline' as const,
      iconFilled: 'search' as const,
      route: '/explore',
    },
    {
      id: 'orders',
      name: 'Orders',
      iconOutline: 'receipt-outline' as const,
      iconFilled: 'receipt' as const,
      route: '/orders',
      badgeDot: true,
    },
    {
      id: 'messages',
      name: 'Messages',
      iconOutline: 'chatbubble-ellipses-outline' as const,
      iconFilled: 'chatbubble-ellipses' as const,
      route: '/messages',
      badgeCount: 2,
    },
    {
      id: 'profile',
      name: 'Profile',
      iconOutline: 'person-outline' as const,
      iconFilled: 'person' as const,
      route: '/profile',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabPressed]}
              onPress={() => {
                if (!isActive) {
                  router.push(tab.route as any);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={tab.name}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={isActive ? tab.iconOutline : tab.iconOutline}
                  size={24}
                  color={isActive ? '#15803D' : '#64748B'}
                />

                {tab.badgeCount && tab.badgeCount > 0 ? (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{tab.badgeCount}</Text>
                  </View>
                ) : null}

                {tab.badgeDot ? <View style={styles.dotBadge} /> : null}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}>
                {tab.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 99,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#15803D',
    fontWeight: '600',
  },
  inactiveTabLabel: {
    color: '#64748B',
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  dotBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: '#EA580C',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
