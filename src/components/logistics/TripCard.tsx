import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Delivery } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface TripCardProps {
  delivery: Delivery;
  onPress: () => void;
  isDark?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ delivery, onPress, isDark = true }) => {
  const isCompleted = delivery.status === 'Delivery Completed';
  const isCancelled = delivery.status === 'Cancelled' || delivery.status === 'Failed Delivery';
  const isInTransit = delivery.status === 'In Transit';

  const getStatusColor = () => {
    if (isCompleted) return '#06C167';
    if (isCancelled) return '#FF3B30';
    if (isInTransit) return '#FFB800';
    return '#276EF1';
  };

  return (
    <TouchableOpacity
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.idCol}>
          <Text style={styles.tripId}>#{delivery.id}</Text>
          <Text style={styles.vehicleType}>{delivery.vehicleRequired}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{delivery.status}</Text>
        </View>
      </View>

      {/* Cargo Title */}
      <View style={styles.cargoSection}>
        <Text style={[styles.cargoTitle, isDark && styles.textWhite]}>
          {delivery.goods.name} — {delivery.goods.quantity}
        </Text>
        <Text style={styles.cargoSub}>
          {delivery.goods.packageCount} Crates ({delivery.goods.weightKg} kg)
        </Text>
      </View>

      {/* Route Stops */}
      <View style={styles.routeBox}>
        <View style={styles.routeRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.routeLabel}>Farmer:</Text>
          <Text style={[styles.routeValue, isDark && styles.textWhite]} numberOfLines={1}>
            {delivery.farmerName} • {delivery.pickup.address}
          </Text>
        </View>

        <View style={styles.connector} />

        <View style={styles.routeRow}>
          <View style={styles.dropoffDot} />
          <Text style={styles.routeLabel}>Buyer:</Text>
          <Text style={[styles.routeValue, isDark && styles.textWhite]} numberOfLines={1}>
            {delivery.buyerName} • {delivery.dropoff.address}
          </Text>
        </View>
      </View>

      {/* Footer: Payout & View button */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.payoutLabel}>DRIVER PAYOUT</Text>
          <Text style={styles.payoutAmount}>LKR {delivery.driverEarnings.toLocaleString()}</Text>
        </View>

        <View style={styles.viewBtn}>
          <Text style={[styles.viewBtnText, isDark && styles.textWhite]}>VIEW TRIP</Text>
          <Ionicons name="arrow-forward" size={14} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 7,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  idCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
  },
  vehicleType: {
    fontSize: 11,
    color: '#8E8E93',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cargoSection: {
    marginBottom: 10,
  },
  cargoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  cargoSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  routeBox: {
    paddingVertical: 6,
    position: 'relative',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06C167',
  },
  dropoffDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#276EF1',
  },
  connector: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 2.5,
    marginVertical: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  routeValue: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  payoutLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.4,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#06C167',
    marginTop: 1,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
