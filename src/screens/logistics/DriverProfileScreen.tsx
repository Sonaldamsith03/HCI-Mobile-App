import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Driver } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { DriverProfileCard } from '../../components/logistics/DriverProfileCard';
import { VehicleCard } from '../../components/logistics/VehicleCard';
import { colors } from '../../theme/colors';

export const DriverProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, showToast, setCurrentRole } = useApp();
  const isDark = themeMode === 'dark';

  const [currentDriver, setCurrentDriver] = useState<Driver | null>(logisticsService.getCurrentDriver());
  const allDrivers = logisticsService.getAllDrivers();

  useEffect(() => {
    const unsub = logisticsService.subscribeToCurrentDriver((d: Driver | null) => setCurrentDriver(d));
    return unsub;
  }, []);

  const handleSwitchDriver = (driverId: string) => {
    logisticsService.switchDriver(driverId);
    showToast('Switched driver profile', 'info');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out of driver partner account and return to Marketplace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          setCurrentRole('BUYER');
          showToast('Signed out of driver account', 'info');
          navigation.navigate('MainTabs', { tab: 'services' });
        },
      },
    ]);
  };

  if (!currentDriver) return null;

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <Text style={[styles.title, isDark && styles.textWhite]}>Driver Profile</Text>
        <TouchableOpacity style={styles.logoutTopBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Driver Profile Card */}
        <DriverProfileCard driver={currentDriver} isDark={isDark} />

        {/* Vehicle Management Card */}
        <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Assigned Fleet Vehicle</Text>
        <VehicleCard vehicle={currentDriver.vehicle} isDark={isDark} />

        {/* Operating Area & Preferences */}
        <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Logistics Dispatch Settings</Text>
        <View style={[styles.settingsCard, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="map-outline" size={18} color="#06C167" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Operating Territory</Text>
              <Text style={[styles.settingVal, isDark && styles.textWhite]}>
                {currentDriver.operatingArea}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="navigate-circle-outline" size={18} color="#276EF1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Maximum Delivery Radius</Text>
              <Text style={[styles.settingVal, isDark && styles.textWhite]}>
                {currentDriver.deliveryRadiusKm} km from hub
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="time-outline" size={18} color="#FFB800" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Operating Hours</Text>
              <Text style={[styles.settingVal, isDark && styles.textWhite]}>
                {currentDriver.preferredHours}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Driver Profile Switcher (Helpful for pair testing different vehicles) */}
        <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Switch Active Fleet Driver</Text>
        <View style={styles.switcherList}>
          {allDrivers.map(d => {
            const isSelected = d.id === currentDriver.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.driverPillItem,
                  isDark ? styles.cardDark : styles.cardLight,
                  isSelected && styles.driverPillSelected,
                ]}
                onPress={() => handleSwitchDriver(d.id)}
              >
                <View style={styles.driverPillLeft}>
                  <Text style={[styles.driverPillName, isDark && styles.textWhite]}>{d.name}</Text>
                  <Text style={styles.driverPillVehicle}>
                    {d.vehicle.type} ({d.vehicle.registrationNumber}) • {d.vehicle.capacityLabel}
                  </Text>
                </View>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={20} color="#06C167" />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Support & Logout Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() => Alert.alert('24/7 Dispatch Hotline', 'Call Fleet Ops Control at +94 11 234 5678')}
          >
            <Ionicons name="headset-outline" size={18} color="#06C167" />
            <Text style={styles.supportBtnText}>CALL DISPATCH SUPPORT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
            <Text style={styles.logoutBtnText}>SIGN OUT OF DRIVER ACCOUNT</Text>
          </TouchableOpacity>
        </View>
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
  logoutTopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  settingsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  settingVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  switcherList: {
    gap: 8,
  },
  driverPillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  driverPillSelected: {
    borderColor: '#06C167',
    borderWidth: 1.5,
  },
  driverPillLeft: {
    flex: 1,
  },
  driverPillName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  driverPillVehicle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  actionsRow: {
    marginTop: 24,
    gap: 10,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  supportBtnText: {
    color: '#06C167',
    fontWeight: '800',
    fontSize: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  logoutBtnText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 12,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
