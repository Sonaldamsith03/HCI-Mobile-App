import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Delivery, Driver, LogisticsNotification } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { DriverStatusToggle } from '../../components/logistics/DriverStatusToggle';
import { DeliveryRequestCard } from '../../components/logistics/DeliveryRequestCard';
import { TripCard } from '../../components/logistics/TripCard';
import { IncomingRequestAlertModal } from '../../components/logistics/DeliveryActionModals';
import { colors } from '../../theme/colors';

export const DriverDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, toggleThemeMode, showToast, setCurrentRole } = useApp();
  const isDark = themeMode === 'dark';

  const [currentDriver, setCurrentDriver] = useState<Driver | null>(logisticsService.getCurrentDriver());
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [notifications, setNotifications] = useState<LogisticsNotification[]>([]);
  const [incomingAlert, setIncomingAlert] = useState<Delivery | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'upcoming' | 'recent'>('requests');

  useEffect(() => {
    const unsubDeliveries = logisticsService.subscribeToDeliveries(list => {
      setDeliveries(list);
    });

    const unsubDriver = logisticsService.subscribeToCurrentDriver(d => {
      setCurrentDriver(d);
    });

    const unsubNotifs = logisticsService.subscribeToNotifications(notifs => {
      setNotifications(notifs);
    });

    const unsubAlert = logisticsService.subscribeToIncomingRequestAlert(req => {
      setIncomingAlert(req);
    });

    return () => {
      unsubDeliveries();
      unsubDriver();
      unsubNotifs();
      unsubAlert();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Dispatch fleet data synchronized', 'info');
    }, 400);
  };

  const handleToggleOnline = (isOnline: boolean) => {
    logisticsService.toggleDriverAvailability(isOnline);
    showToast(isOnline ? 'You are now ONLINE. Ready for dispatches!' : 'You went OFFLINE. Requests paused.', isOnline ? 'success' : 'info');
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    setIncomingAlert(null);
    const res = await logisticsService.acceptDelivery(deliveryId);
    if (res.success) {
      showToast(res.message, 'success');
      navigation.navigate('DriverTripDetail', { deliveryId });
    } else {
      showToast(res.message, 'warn');
    }
  };

  const handleDeclineDelivery = (deliveryId: string) => {
    setIncomingAlert(null);
    showToast('Delivery request declined', 'info');
  };

  const handleViewRequestDetails = (deliveryId: string) => {
    setIncomingAlert(null);
    navigation.navigate('DriverTripDetail', { deliveryId });
  };

  // Filtered queries
  const isOnline = currentDriver?.availabilityStatus === 'ONLINE' || currentDriver?.availabilityStatus === 'BUSY';
  const availableRequests = logisticsService.getAvailableRequestsForCurrentDriver();
  const activeTrip = logisticsService.getActiveTripForDriver(currentDriver?.id);
  const completedTrips = logisticsService.getDriverTripHistory(currentDriver?.id);
  const upcomingTrips = deliveries.filter(
    d => d.assignedDriverId === currentDriver?.id && d.status === 'Driver Assigned'
  );

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MainTabs', { tab: 'services' });
          }}
          style={styles.portalSwitchBtn}
        >
          <Ionicons name="apps-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.portalSwitchText, isDark && styles.textWhite]}>All Portals</Text>
        </TouchableOpacity>

        <View style={styles.brandBadge}>
          <Text style={styles.brandTitle}>AgriFleet</Text>
          <View style={styles.fleetLiveDot} />
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.notifIconBtn}
            onPress={toggleThemeMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={19}
              color={isDark ? '#F59E0B' : '#4B5563'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifIconBtn}
            onPress={() => navigation.navigate('DriverDashboard', { initialTab: 'notifications' })}
          >
            <Ionicons name="notifications-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            {unreadNotifsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('DriverDashboard', { initialTab: 'profile' })}
          >
            <Image
              source={{
                uri:
                  currentDriver?.profileImage ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Driver Bar */}
        <View style={styles.driverWelcomeRow}>
          <View>
            <Text style={[styles.greetingText, isDark && styles.textWhite]}>
              Welcome, {currentDriver?.name || 'Captain'}
            </Text>
            <Text style={styles.vehicleSubText}>
              {currentDriver?.vehicle.model} •{' '}
              <Text style={{ color: '#06C167', fontWeight: '800' }}>
                {currentDriver?.vehicle.registrationNumber}
              </Text>
            </Text>
          </View>

          <View style={styles.ratingBox}>
            <Ionicons name="star" size={13} color="#FFB800" />
            <Text style={styles.ratingVal}>{currentDriver?.rating.toFixed(1) || '4.9'}</Text>
          </View>
        </View>

        {/* Prominent Online/Offline Toggle */}
        <DriverStatusToggle
          status={currentDriver?.availabilityStatus || 'ONLINE'}
          onToggle={handleToggleOnline}
          isDark={isDark}
        />

        {/* 4 Summary Cards */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Today's Trips */}
          <View style={[styles.metricCard, isDark ? styles.metricDark : styles.metricLight]}>
            <View style={styles.metricIconPill}>
              <Ionicons name="car-outline" size={16} color="#06C167" />
            </View>
            <Text style={[styles.metricNumber, isDark && styles.textWhite]}>
              {currentDriver?.todayTrips || 0} Trips
            </Text>
            <Text style={styles.metricLabel}>Today's Runs</Text>
          </View>

          {/* Card 2: Today's Earnings */}
          <View style={[styles.metricCard, isDark ? styles.metricDark : styles.metricLight]}>
            <View style={[styles.metricIconPill, { backgroundColor: 'rgba(6, 193, 103, 0.15)' }]}>
              <Ionicons name="wallet-outline" size={16} color="#06C167" />
            </View>
            <Text style={[styles.metricNumber, { color: '#06C167' }]}>
              LKR {(currentDriver?.todayEarnings || 0).toLocaleString()}
            </Text>
            <Text style={styles.metricLabel}>Today's Payout</Text>
          </View>

          {/* Card 3: Active Trip */}
          <View style={[styles.metricCard, isDark ? styles.metricDark : styles.metricLight]}>
            <View style={[styles.metricIconPill, { backgroundColor: 'rgba(39, 110, 241, 0.15)' }]}>
              <Ionicons name="navigate-outline" size={16} color="#276EF1" />
            </View>
            <Text style={[styles.metricNumber, isDark && styles.textWhite]}>
              {activeTrip ? '1 Active' : '0 Active'}
            </Text>
            <Text style={styles.metricLabel}>In Transit</Text>
          </View>

          {/* Card 4: Completed Trips */}
          <View style={[styles.metricCard, isDark ? styles.metricDark : styles.metricLight]}>
            <View style={[styles.metricIconPill, { backgroundColor: 'rgba(255, 184, 0, 0.15)' }]}>
              <Ionicons name="checkmark-done-outline" size={16} color="#FFB800" />
            </View>
            <Text style={[styles.metricNumber, isDark && styles.textWhite]}>
              {currentDriver?.completedTrips || 0} Done
            </Text>
            <Text style={styles.metricLabel}>Lifetime</Text>
          </View>
        </View>

        {/* Active Trip Banner if currently on a delivery */}
        {activeTrip && (
          <View style={styles.activeTripSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.pulseActiveRow}>
                <View style={styles.pulseActiveDot} />
                <Text style={styles.sectionHeading}>ACTIVE DELIVERY IN PROGRESS</Text>
              </View>
              <Text style={styles.tripIdSub}>#{activeTrip.id}</Text>
            </View>

            <TripCard
              delivery={activeTrip}
              onPress={() => navigation.navigate('DriverTripDetail', { deliveryId: activeTrip.id })}
              isDark={isDark}
            />
          </View>
        )}

        {/* Section Tabs */}
        <View style={[styles.sectionTabsBar, isDark ? styles.tabsDark : styles.tabsLight]}>
          <TouchableOpacity
            style={[styles.sectionTabItem, activeTab === 'requests' && styles.sectionTabItemActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={[
                styles.sectionTabText,
                isDark && styles.textWhite,
                activeTab === 'requests' && styles.sectionTabTextActive,
              ]}
            >
              Requests ({availableRequests.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sectionTabItem, activeTab === 'active' && styles.sectionTabItemActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.sectionTabText,
                isDark && styles.textWhite,
                activeTab === 'active' && styles.sectionTabTextActive,
              ]}
            >
              Active ({activeTrip ? 1 : 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sectionTabItem, activeTab === 'upcoming' && styles.sectionTabItemActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text
              style={[
                styles.sectionTabText,
                isDark && styles.textWhite,
                activeTab === 'upcoming' && styles.sectionTabTextActive,
              ]}
            >
              Upcoming ({upcomingTrips.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sectionTabItem, activeTab === 'recent' && styles.sectionTabItemActive]}
            onPress={() => setActiveTab('recent')}
          >
            <Text
              style={[
                styles.sectionTabText,
                isDark && styles.textWhite,
                activeTab === 'recent' && styles.sectionTabTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: Available Requests */}
        {activeTab === 'requests' && (
          <View>
            {!isOnline ? (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="moon-outline" size={42} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>You are currently offline</Text>
                <Text style={styles.emptySub}>
                  Toggle ONLINE above to start receiving direct farmer-to-door delivery requests.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => handleToggleOnline(true)}
                >
                  <Text style={styles.emptyActionText}>GO ONLINE NOW</Text>
                </TouchableOpacity>
              </View>
            ) : availableRequests.length === 0 ? (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="radio-outline" size={42} color="#06C167" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>
                  Searching for Farm Dispatches...
                </Text>
                <Text style={styles.emptySub}>
                  No delivery requests currently in your {currentDriver?.operatingArea}. New orders from farmers will appear here automatically.
                </Text>
              </View>
            ) : (
              availableRequests.map(req => (
                <DeliveryRequestCard
                  key={req.id}
                  delivery={req}
                  onAccept={handleAcceptDelivery}
                  onDecline={handleDeclineDelivery}
                  onViewDetails={handleViewRequestDetails}
                  isDark={isDark}
                />
              ))
            )}
          </View>
        )}

        {/* TAB 2: Active Delivery */}
        {activeTab === 'active' && (
          <View>
            {activeTrip ? (
              <TripCard
                delivery={activeTrip}
                onPress={() => navigation.navigate('DriverTripDetail', { deliveryId: activeTrip.id })}
                isDark={isDark}
              />
            ) : (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="trail-sign-outline" size={42} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>No Active Cargo Run</Text>
                <Text style={styles.emptySub}>
                  You don't have an active delivery right now. Check the "Requests" tab to accept a trip.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: Upcoming Deliveries */}
        {activeTab === 'upcoming' && (
          <View>
            {upcomingTrips.length === 0 ? (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="calendar-outline" size={42} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>No Upcoming Deliveries</Text>
                <Text style={styles.emptySub}>
                  Assigned deliveries scheduled for today will be displayed here.
                </Text>
              </View>
            ) : (
              upcomingTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  delivery={trip}
                  onPress={() => navigation.navigate('DriverTripDetail', { deliveryId: trip.id })}
                  isDark={isDark}
                />
              ))
            )}
          </View>
        )}

        {/* TAB 4: Recent Activity */}
        {activeTab === 'recent' && (
          <View>
            {completedTrips.length === 0 ? (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="time-outline" size={42} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>No Trip History Yet</Text>
                <Text style={styles.emptySub}>
                  Your completed and confirmed deliveries will be logged here.
                </Text>
              </View>
            ) : (
              completedTrips.slice(0, 5).map(trip => (
                <TripCard
                  key={trip.id}
                  delivery={trip}
                  onPress={() => navigation.navigate('DriverTripDetail', { deliveryId: trip.id })}
                  isDark={isDark}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* PickMe Flash style Modal for immediate attention */}
      <IncomingRequestAlertModal
        visible={!!incomingAlert}
        delivery={incomingAlert}
        onAccept={handleAcceptDelivery}
        onDecline={handleDeclineDelivery}
        onView={handleViewRequestDetails}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  safeAreaLight: {
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarDark: {
    backgroundColor: '#000000',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topBarLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  portalSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  portalSwitchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#06C167',
    letterSpacing: -0.3,
  },
  fleetLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06C167',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifIconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarBtn: {},
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#06C167',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  driverWelcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  vehicleSubText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  metricCard: {
    width: '48.3%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  metricDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  metricIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  metricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  activeTripSection: {
    marginVertical: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  tripIdSub: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  sectionTabsBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
  },
  tabsDark: {
    backgroundColor: '#161616',
  },
  tabsLight: {
    backgroundColor: '#F3F4F6',
  },
  sectionTabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  sectionTabItemActive: {
    backgroundColor: '#06C167',
  },
  sectionTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  sectionTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emptyBox: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyDark: {
    backgroundColor: '#161616',
  },
  emptyLight: {
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#06C167',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 16,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
