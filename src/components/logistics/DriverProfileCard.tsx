import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Driver } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface DriverProfileCardProps {
  driver: Driver;
  onEditProfile?: () => void;
  showContact?: boolean;
  isDark?: boolean;
}

export const DriverProfileCard: React.FC<DriverProfileCardProps> = ({
  driver,
  onEditProfile,
  showContact = false,
  isDark = true,
}) => {
  const handleCall = () => {
    if (!driver.phone) return;
    const url = `tel:${driver.phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Driver Contact', driver.phone);
    });
  };

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Top Profile Row */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: driver.profileImage }} style={styles.avatar} />
          <View style={styles.onlineBadge} />
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.driverName, isDark && styles.textWhite]}>{driver.name}</Text>
            {driver.verificationStatus === 'active' && (
              <Ionicons name="checkmark-circle" size={16} color="#06C167" />
            )}
          </View>

          <Text style={styles.phoneText}>{driver.phone}</Text>
          <Text style={styles.operatingSub}>{driver.operatingArea}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starPill}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.starText}>{driver.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.tripsCount}>• {driver.completedTrips} Trips</Text>
          </View>
        </View>

        {showContact ? (
          <TouchableOpacity style={styles.callIconBtn} onPress={handleCall}>
            <Ionicons name="call" size={18} color="#06C167" />
          </TouchableOpacity>
        ) : onEditProfile ? (
          <TouchableOpacity style={styles.editBtn} onPress={onEditProfile}>
            <Ionicons name="create-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Vehicle Summary Bar */}
      <View style={[styles.vehicleBar, isDark ? styles.vehicleBarDark : styles.vehicleBarLight]}>
        <View style={styles.vehicleTypeCol}>
          <Text style={styles.barLabel}>VEHICLE</Text>
          <Text style={[styles.barVal, isDark && styles.textWhite]}>{driver.vehicle.model}</Text>
        </View>

        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{driver.vehicle.registrationNumber}</Text>
        </View>

        <View style={styles.capacityCol}>
          <Text style={styles.barLabel}>PAYLOAD</Text>
          <Text style={[styles.barVal, isDark && styles.textWhite]}>{driver.vehicle.capacityLabel}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{driver.totalTrips}</Text>
          <Text style={styles.statLabel}>Lifetime Runs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: '#06C167' }]}>99.2%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{driver.deliveryRadiusKm} km</Text>
          <Text style={styles.statLabel}>Coverage Radius</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginVertical: 8,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#06C167',
    borderWidth: 2,
    borderColor: '#161616',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  phoneText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  operatingSub: {
    fontSize: 11,
    color: '#06C167',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  starText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB800',
  },
  tripsCount: {
    fontSize: 11,
    color: '#8E8E93',
  },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  vehicleBarDark: {
    backgroundColor: '#202020',
  },
  vehicleBarLight: {
    backgroundColor: '#F3F4F6',
  },
  vehicleTypeCol: {
    flex: 1,
  },
  capacityCol: {
    alignItems: 'flex-end',
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  barVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginTop: 1,
  },
  plateBox: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  plateText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#06C167',
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
