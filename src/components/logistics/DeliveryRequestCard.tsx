import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Delivery } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface DeliveryRequestCardProps {
  delivery: Delivery;
  onAccept: (deliveryId: string) => void;
  onDecline: (deliveryId: string) => void;
  onViewDetails: (deliveryId: string) => void;
  isDark?: boolean;
}

export const DeliveryRequestCard: React.FC<DeliveryRequestCardProps> = ({
  delivery,
  onAccept,
  onDecline,
  onViewDetails,
  isDark = true,
}) => {
  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Top Header Tag */}
      <View style={styles.topHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.requestBadge}>NEW CARGO REQUEST</Text>
        </View>
        <View style={styles.vehiclePill}>
          <Ionicons name="car-outline" size={13} color="#06C167" />
          <Text style={styles.vehicleText}>{delivery.vehicleRequired}</Text>
        </View>
      </View>

      {/* Cargo & Pricing Summary */}
      <View style={styles.cargoSummaryRow}>
        <View style={styles.cargoIconBox}>
          {delivery.goods.imageUrl ? (
            <Image source={{ uri: delivery.goods.imageUrl }} style={styles.produceThumb} />
          ) : (
            <Ionicons name="leaf" size={24} color="#06C167" />
          )}
        </View>
        <View style={styles.cargoInfoCol}>
          <Text style={[styles.goodsTitle, isDark && styles.textWhite]} numberOfLines={1}>
            {delivery.goods.name}
          </Text>
          <Text style={styles.goodsSub}>
            {delivery.goods.quantity} • {delivery.goods.packageCount} Crates/Sacks
          </Text>
          {delivery.goods.specialHandling ? (
            <View style={styles.handlingPill}>
              <Ionicons name="snow-outline" size={11} color="#276EF1" />
              <Text style={styles.handlingText} numberOfLines={1}>
                {delivery.goods.specialHandling}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.earningLabel}>YOUR PAYOUT</Text>
          <Text style={styles.earningVal}>LKR {delivery.driverEarnings.toLocaleString()}</Text>
          <Text style={styles.feeCustomer}>Fee: LKR {delivery.customerDeliveryFee.toLocaleString()}</Text>
        </View>
      </View>

      {/* Route Stops (Pickup -> Delivery) */}
      <View style={styles.routeContainer}>
        {/* Pickup */}
        <View style={styles.routeItem}>
          <View style={styles.pickupPin}>
            <View style={styles.pickupInner} />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeStopType}>PICKUP FARM GATE</Text>
            <Text style={[styles.routeAddress, isDark && styles.textWhite]} numberOfLines={1}>
              {delivery.pickup.address}
            </Text>
            <Text style={styles.contactSub}>Farmer: {delivery.farmerName}</Text>
          </View>
        </View>

        {/* Connecting dotted line */}
        <View style={styles.routeLine} />

        {/* Dropoff */}
        <View style={styles.routeItem}>
          <View style={styles.dropoffPin}>
            <Ionicons name="location" size={12} color="#FFFFFF" />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeStopType}>DELIVERY DESTINATION</Text>
            <Text style={[styles.routeAddress, isDark && styles.textWhite]} numberOfLines={1}>
              {delivery.dropoff.address}
            </Text>
            <Text style={styles.contactSub}>Buyer: {delivery.buyerName}</Text>
          </View>
        </View>
      </View>

      {/* Meta Specs: Distance & Time */}
      <View style={[styles.specsRow, isDark ? styles.specsDark : styles.specsLight]}>
        <View style={styles.specItem}>
          <Ionicons name="speedometer-outline" size={14} color="#8E8E93" />
          <Text style={[styles.specVal, isDark && styles.textWhite]}>{delivery.distanceKm} km</Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={[styles.specVal, isDark && styles.textWhite]}>~{delivery.estimatedMinutes} mins</Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Ionicons name="cube-outline" size={14} color="#8E8E93" />
          <Text style={[styles.specVal, isDark && styles.textWhite]}>{delivery.goods.weightKg} kg</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() => onDecline(delivery.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.declineBtnText}>DECLINE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => onViewDetails(delivery.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.detailsBtnText, isDark && styles.textWhite]}>VIEW</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => onAccept(delivery.id)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
          <Text style={styles.acceptBtnText}>ACCEPT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1.5,
  },
  cardDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  requestBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  vehicleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  cargoSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cargoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  produceThumb: {
    width: '100%',
    height: '100%',
  },
  cargoInfoCol: {
    flex: 1,
  },
  goodsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  goodsSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  handlingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 110, 241, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 3,
  },
  handlingText: {
    fontSize: 10,
    color: '#276EF1',
    fontWeight: '600',
  },
  priceCol: {
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  earningLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.4,
  },
  earningVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#06C167',
    marginTop: 1,
  },
  feeCustomer: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1,
  },
  routeContainer: {
    paddingVertical: 10,
    position: 'relative',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  pickupPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  pickupInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06C167',
  },
  dropoffPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  routeLine: {
    position: 'absolute',
    left: 8.5,
    top: 24,
    bottom: 24,
    width: 1.5,
    backgroundColor: '#06C167',
    opacity: 0.4,
  },
  routeTextCol: {
    flex: 1,
  },
  routeStopType: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginTop: 1,
  },
  contactSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 10,
  },
  specsDark: {
    backgroundColor: '#1E1E1E',
  },
  specsLight: {
    backgroundColor: '#F3F4F6',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
  },
  declineBtnText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 12,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  detailsBtnText: {
    fontWeight: '700',
    fontSize: 12,
    color: '#000000',
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#06C167',
    gap: 6,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
