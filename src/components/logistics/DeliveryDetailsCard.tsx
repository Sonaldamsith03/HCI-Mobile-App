import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Delivery } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface DeliveryDetailsCardProps {
  delivery: Delivery;
  viewerRole: 'BUYER' | 'FARMER' | 'DRIVER';
  onTrackLive?: () => void;
  onOpenDetails?: () => void;
  isDark?: boolean;
}

export const DeliveryDetailsCard: React.FC<DeliveryDetailsCardProps> = ({
  delivery,
  viewerRole,
  onTrackLive,
  onOpenDetails,
  isDark = true,
}) => {
  const driver = delivery.assignedDriver;

  const handleCall = (phone?: string) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Phone Call', `Call ${phone}`);
      }
    });
  };

  const getStatusColor = () => {
    switch (delivery.status) {
      case 'Searching for Driver':
        return '#FFB800';
      case 'Driver Assigned':
      case 'Driver En Route to Pickup':
        return '#276EF1';
      case 'Arrived at Pickup':
      case 'Goods Collected':
      case 'In Transit':
      case 'Arrived at Delivery':
        return '#06C167';
      case 'Delivery Completed':
        return '#06C167';
      case 'Cancelled':
      case 'Failed Delivery':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Header with Tracking Code and Status Badge */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.tripId}>{delivery.id}</Text>
          <Text style={styles.trackingSub}>{delivery.trackingCode}</Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: `${getStatusColor()}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{delivery.status}</Text>
        </View>
      </View>

      {/* Driver Information (if assigned) */}
      {driver ? (
        <View style={[styles.driverSection, isDark ? styles.driverDark : styles.driverLight]}>
          <Image source={{ uri: driver.profileImage }} style={styles.driverAvatar} />

          <View style={styles.driverInfoCol}>
            <View style={styles.driverNameRow}>
              <Text style={[styles.driverName, isDark && styles.textWhite]}>{driver.name}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={11} color="#FFB800" />
                <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
              </View>
            </View>

            <Text style={styles.vehicleSub}>
              {driver.vehicle.model} • {driver.vehicle.type}
            </Text>

            {/* Registration number plate mini */}
            <View style={styles.plateMini}>
              <Text style={styles.plateText}>{driver.vehicle.registrationNumber}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCall(driver.phone)}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={16} color="#06C167" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.searchingBox, isDark ? styles.searchingDark : styles.searchingLight]}>
          <Ionicons name="radio" size={18} color="#FFB800" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.searchingTitle, isDark && styles.textWhite]}>
              Finding Nearby Driver...
            </Text>
            <Text style={styles.searchingSub}>
              Dispatching to eligible {delivery.vehicleRequired}s near farm gate
            </Text>
          </View>
        </View>
      )}

      {/* Cargo & Goods Summary */}
      <View style={styles.goodsRow}>
        <View style={styles.goodsIconCol}>
          <Ionicons name="leaf-outline" size={20} color="#06C167" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.goodsName, isDark && styles.textWhite]}>
            {delivery.goods.name}
          </Text>
          <Text style={styles.goodsDetails}>
            {delivery.goods.quantity} ({delivery.goods.weightKg} kg) • {delivery.goods.packageCount} Crates
          </Text>
        </View>
        <View style={styles.feeCol}>
          <Text style={styles.feeLabel}>DELIVERY FEE</Text>
          <Text style={styles.feeVal}>LKR {delivery.customerDeliveryFee.toLocaleString()}</Text>
        </View>
      </View>

      {/* Addresses */}
      <View style={styles.routeBox}>
        <View style={styles.stopLine}>
          <View style={styles.fromDot} />
          <Text style={[styles.stopText, isDark && styles.textWhite]} numberOfLines={1}>
            <Text style={styles.stopLabel}>From: </Text>
            {delivery.pickup.address}
          </Text>
        </View>
        <View style={styles.stopLine}>
          <View style={styles.toDot} />
          <Text style={[styles.stopText, isDark && styles.textWhite]} numberOfLines={1}>
            <Text style={styles.stopLabel}>To: </Text>
            {delivery.dropoff.address}
          </Text>
        </View>
      </View>

      {/* Buyer Handover PIN verification notice */}
      {viewerRole === 'BUYER' && delivery.status !== 'Delivery Completed' && (
        <View style={styles.pinReminderBox}>
          <Ionicons name="key-outline" size={16} color="#06C167" />
          <Text style={styles.pinReminderText}>
            Handover PIN: <Text style={styles.pinCode}>{delivery.handoverPin}</Text> (Share upon arrival)
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {onTrackLive && delivery.status !== 'Searching for Driver' && (
          <TouchableOpacity
            style={styles.trackLiveBtn}
            onPress={onTrackLive}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
            <Text style={styles.trackLiveText}>TRACK DRIVER LIVE</Text>
          </TouchableOpacity>
        )}

        {onOpenDetails && (
          <TouchableOpacity
            style={[styles.detailsBtn, !onTrackLive && { flex: 1 }]}
            onPress={onOpenDetails}
            activeOpacity={0.7}
          >
            <Text style={[styles.detailsText, isDark && styles.textWhite]}>VIEW FULL DETAILS</Text>
            <Ionicons name="chevron-forward" size={14} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
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
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.4,
  },
  trackingSub: {
    fontSize: 11,
    color: '#8E8E93',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  driverDark: {
    backgroundColor: '#202020',
  },
  driverLight: {
    backgroundColor: '#F3F4F6',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  driverInfoCol: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB800',
  },
  vehicleSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  plateMini: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  plateText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    gap: 10,
  },
  searchingDark: {
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
  },
  searchingLight: {
    backgroundColor: '#FEF3C7',
  },
  searchingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  searchingSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  goodsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  goodsIconCol: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 193, 103, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goodsName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  goodsDetails: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  feeCol: {
    alignItems: 'flex-end',
  },
  feeLabel: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '700',
  },
  feeVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
  },
  routeBox: {
    paddingVertical: 8,
    gap: 6,
  },
  stopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fromDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06C167',
  },
  toDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#276EF1',
  },
  stopText: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
  },
  stopLabel: {
    fontWeight: '700',
    color: '#8E8E93',
  },
  pinReminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.1)',
    padding: 8,
    borderRadius: 10,
    marginTop: 6,
    gap: 6,
  },
  pinReminderText: {
    fontSize: 11,
    color: '#06C167',
  },
  pinCode: {
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  trackLiveBtn: {
    flex: 1.3,
    flexDirection: 'row',
    backgroundColor: '#06C167',
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  trackLiveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
