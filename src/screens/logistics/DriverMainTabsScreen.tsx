import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { DriverDashboardScreen } from './DriverDashboardScreen';
import { DriverTripsScreen } from './DriverTripsScreen';
import { DriverEarningsScreen } from './DriverEarningsScreen';
import { DriverNotificationsScreen } from './DriverNotificationsScreen';
import { DriverProfileScreen } from './DriverProfileScreen';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

export type DriverNavTab = 'home' | 'trips' | 'earnings' | 'notifications' | 'profile';

export const DriverMainTabsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'DriverDashboard'>>();
  const { themeMode } = useApp();
  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState<DriverNavTab>(
    (route.params?.initialTab as DriverNavTab) || 'home'
  );

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab as DriverNavTab);
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    const unsub = logisticsService.subscribeToNotifications(list => {
      setUnreadCount(list.filter(n => !n.isRead).length);
    });
    return unsub;
  }, []);

  // Smooth fade transition between tabs
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleTabChange = (tab: DriverNavTab) => {
    if (tab === activeTab) return;
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.88,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* Tab Screen Content */}
      <Animated.View style={[styles.screenContent, { opacity: fadeAnim }]}>
        {activeTab === 'home' && <DriverDashboardScreen />}
        {activeTab === 'trips' && <DriverTripsScreen />}
        {activeTab === 'earnings' && <DriverEarningsScreen />}
        {activeTab === 'notifications' && <DriverNotificationsScreen />}
        {activeTab === 'profile' && <DriverProfileScreen />}
      </Animated.View>

      {/* Driver Bottom Navigation Bar */}
      <View style={[styles.bottomBar, isDark ? styles.bottomBarDark : styles.bottomBarLight]}>
        {/* Home */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('home')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'home' ? 'speedometer' : 'speedometer-outline'}
            size={22}
            color={activeTab === 'home' ? '#06C167' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home' ? styles.labelActive : isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Trips */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('trips')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'trips' ? 'car-sport' : 'car-sport-outline'}
            size={22}
            color={activeTab === 'trips' ? '#06C167' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'trips' ? styles.labelActive : isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Trips
          </Text>
        </TouchableOpacity>

        {/* Earnings */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('earnings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'earnings' ? 'wallet' : 'wallet-outline'}
            size={22}
            color={activeTab === 'earnings' ? '#06C167' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'earnings' ? styles.labelActive : isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Earnings
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('notifications')}
          activeOpacity={0.7}
        >
          <View style={styles.notifIconWrapper}>
            <Ionicons
              name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
              size={22}
              color={activeTab === 'notifications' ? '#06C167' : '#8E8E93'}
            />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'notifications' ? styles.labelActive : isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Alerts
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabChange('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#06C167' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'profile' ? styles.labelActive : isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  screenContent: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  bottomBarDark: {
    backgroundColor: '#0A0A0A',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomBarLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  labelActive: {
    color: '#06C167',
    fontWeight: '800',
  },
  labelDark: {
    color: '#8E8E93',
  },
  labelLight: {
    color: '#6B7280',
  },
  notifIconWrapper: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: '#FF3B30',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
});
