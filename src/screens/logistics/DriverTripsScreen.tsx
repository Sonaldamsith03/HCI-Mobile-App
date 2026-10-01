import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Delivery, Driver } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { TripCard } from '../../components/logistics/TripCard';
import { colors } from '../../theme/colors';

export const DriverTripsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode } = useApp();
  const isDark = themeMode === 'dark';

  const [currentDriver, setCurrentDriver] = useState<Driver | null>(logisticsService.getCurrentDriver());
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'history'>('current');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const unsubDel = logisticsService.subscribeToDeliveries(list => setDeliveries(list));
    const unsubDrv = logisticsService.subscribeToCurrentDriver(d => setCurrentDriver(d));
    return () => {
      unsubDel();
      unsubDrv();
    };
  }, []);

  const driverId = currentDriver?.id;
  const activeTrip = logisticsService.getActiveTripForDriver(driverId);
  const upcomingTrips = deliveries.filter(
    d => d.assignedDriverId === driverId && d.status === 'Driver Assigned'
  );

  const historyTrips = deliveries.filter(d => {
    if (d.assignedDriverId !== driverId) return false;
    if (historyFilter === 'completed') return d.status === 'Delivery Completed';
    if (historyFilter === 'cancelled') return d.status === 'Cancelled' || d.status === 'Failed Delivery';
    return d.status === 'Delivery Completed' || d.status === 'Cancelled' || d.status === 'Failed Delivery';
  });

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <Text style={[styles.title, isDark && styles.textWhite]}>Trips & Dispatches</Text>
        <View style={styles.driverPill}>
          <Text style={styles.driverPillText}>{currentDriver?.vehicle.registrationNumber}</Text>
        </View>
      </View>

      {/* Top Main Tabs */}
      <View style={[styles.tabsContainer, isDark ? styles.tabsDark : styles.tabsLight]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'current' && styles.tabBtnActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text
            style={[
              styles.tabText,
              isDark && styles.textWhite,
              activeTab === 'current' && styles.tabTextActive,
            ]}
          >
            Active ({activeTrip ? 1 : 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              isDark && styles.textWhite,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Upcoming ({upcomingTrips.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              isDark && styles.textWhite,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* History Sub-Filters */}
      {activeTab === 'history' && (
        <View style={styles.filterPillsRow}>
          {(['all', 'completed', 'cancelled'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                isDark ? styles.chipDark : styles.chipLight,
                historyFilter === filter && styles.chipActive,
              ]}
              onPress={() => setHistoryFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isDark && styles.textWhite,
                  historyFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Tab */}
        {activeTab === 'current' && (
          <View>
            {activeTrip ? (
              <TripCard
                delivery={activeTrip}
                onPress={() => navigation.navigate('DriverTripDetail', { deliveryId: activeTrip.id })}
                isDark={isDark}
              />
            ) : (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="trail-sign-outline" size={48} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>
                  You don't have an active delivery right now
                </Text>
                <Text style={styles.emptySub}>
                  When you accept an incoming request from the dashboard, it will appear here.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <View>
            {upcomingTrips.length === 0 ? (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="calendar-outline" size={48} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>
                  No upcoming scheduled cargo runs
                </Text>
                <Text style={styles.emptySub}>
                  Scheduled farm gate collections will appear here for advance planning.
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

        {/* History Tab */}
        {activeTab === 'history' && (
          <View>
            {historyTrips.length === 0 ? (
              <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
                <Ionicons name="folder-open-outline" size={48} color="#8E8E93" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>
                  Your completed trips will appear here
                </Text>
                <Text style={styles.emptySub}>
                  Past cargo hauls, verified PIN confirmations, and payouts are logged here.
                </Text>
              </View>
            ) : (
              historyTrips.map(trip => (
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  driverPill: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  driverPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    padding: 4,
  },
  tabsDark: {
    backgroundColor: '#161616',
  },
  tabsLight: {
    backgroundColor: '#F3F4F6',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#06C167',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipLight: {
    backgroundColor: '#F3F4F6',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  chipActive: {
    borderColor: '#06C167',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  filterChipTextActive: {
    color: '#06C167',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    padding: 36,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyDark: {
    backgroundColor: '#161616',
  },
  emptyLight: {
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginTop: 14,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
