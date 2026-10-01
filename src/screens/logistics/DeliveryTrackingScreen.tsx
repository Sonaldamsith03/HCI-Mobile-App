import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Delivery } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { DeliveryStatusTimeline } from '../../components/logistics/DeliveryStatusTimeline';
import { InteractiveLiveMap } from '../../components/InteractiveLiveMap';
import { colors } from '../../theme/colors';

export const DeliveryTrackingScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'DeliveryTracking'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode } = useApp();
  const isDark = themeMode === 'dark';

  const { deliveryId, userRole = 'BUYER' } = route.params;
  const [delivery, setDelivery] = useState<Delivery | undefined>(logisticsService.getDeliveryById(deliveryId));
  const [liveMapVisible, setLiveMapVisible] = useState(false);

  useEffect(() => {
    const unsub = logisticsService.subscribeToDeliveries(list => {
      const match = list.find(d => d.id === deliveryId);
      if (match) setDelivery(match);
    });
    return unsub;
  }, [deliveryId]);

  if (!delivery) {
    return (
      <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={44} color="#FF3B30" />
          <Text style={[styles.title, isDark && styles.textWhite]}>Delivery Not Found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const driver = delivery.assignedDriver;

  const handleCallDriver = () => {
    if (!driver?.phone) return;
    const url = `tel:${driver.phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Contact Driver', driver.phone);
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnRow}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.topTitle, isDark && styles.textWhite]}>Delivery Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setLiveMapVisible(true)} style={styles.liveMapPill}>
          <Ionicons name="map-outline" size={16} color="#06C167" />
          <Text style={styles.liveMapText}>Open GPS Map</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header Banner */}
        <View style={[styles.statusBanner, isDark ? styles.bannerDark : styles.bannerLight]}>
          <View style={styles.statusDotRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusBannerTitle}>{delivery.status.toUpperCase()}</Text>
          </View>
          <Text style={[styles.etaText, isDark && styles.textWhite]}>
            {delivery.status === 'Delivery Completed'
              ? 'Delivered & Confirmed'
              : delivery.status === 'In Transit'
              ? `In Transit • ETA ~${delivery.estimatedMinutes} mins`
              : delivery.status === 'Goods Collected'
              ? 'Goods Loaded • Leaving Farm'
              : delivery.status === 'Driver En Route to Pickup'
              ? 'Courier Heading to Farm Gate'
              : 'Finding Best Fleet Courier'}
          </Text>
          <Text style={styles.trackingSubText}>
            Tracking ID: <Text style={{ fontWeight: '800', color: '#06C167' }}>{delivery.trackingCode}</Text>
          </Text>
        </View>

        {/* Assigned Driver Card */}
        {driver ? (
          <View style={[styles.driverCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={styles.sectionSmallLabel}>ASSIGNED LOGISTICS COURIER</Text>

            <View style={styles.driverMainRow}>
              <Image source={{ uri: driver.profileImage }} style={styles.driverImg} />

              <View style={styles.driverInfoCol}>
                <View style={styles.driverNameRow}>
                  <Text style={[styles.driverName, isDark && styles.textWhite]}>{driver.name}</Text>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.ratingVal}>{driver.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <Text style={styles.vehicleModel}>{driver.vehicle.model} • {driver.vehicle.type}</Text>

                {/* Number plate pill */}
                <View style={styles.plateContainer}>
                  <Text style={styles.plateText}>{driver.vehicle.registrationNumber}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.callDriverBtn} onPress={handleCallDriver} activeOpacity={0.8}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.driverCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={styles.sectionSmallLabel}>ASSIGNED LOGISTICS COURIER</Text>
            <View style={styles.searchingRow}>
              <Ionicons name="radio" size={24} color="#FFB800" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.driverName, isDark && styles.textWhite]}>
                  Searching Nearest Active Driver...
                </Text>
                <Text style={styles.vehicleModel}>
                  Matching available {delivery.vehicleRequired} near farm gate
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Buyer Handover PIN Verification Reminder */}
        {userRole === 'BUYER' && delivery.status !== 'Delivery Completed' && (
          <View style={styles.pinCard}>
            <View style={styles.pinIconBox}>
              <Ionicons name="key" size={20} color="#06C167" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pinTitle}>Your 4-Digit Handover PIN</Text>
              <Text style={styles.pinCodeText}>{delivery.handoverPin}</Text>
              <Text style={styles.pinDesc}>
                Provide this PIN to the driver only after inspecting your produce at delivery.
              </Text>
            </View>
          </View>
        )}

        {/* Cargo Summary */}
        <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.sectionSmallLabel}>CARGO DETAILS</Text>
          <View style={styles.cargoSummaryRow}>
            {delivery.goods.imageUrl && (
              <Image source={{ uri: delivery.goods.imageUrl }} style={styles.cargoThumb} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.cargoName, isDark && styles.textWhite]}>{delivery.goods.name}</Text>
              <Text style={styles.cargoQty}>
                {delivery.goods.quantity} ({delivery.goods.weightKg} kg) • {delivery.goods.packageCount} Crates
              </Text>
              <Text style={styles.cargoCategory}>Category: {delivery.goods.category}</Text>
            </View>
            <View style={styles.feeCol}>
              <Text style={styles.feeLabel}>DELIVERY FEE</Text>
              <Text style={styles.feeVal}>LKR {delivery.customerDeliveryFee.toLocaleString()}</Text>
            </View>
          </View>

          {delivery.goods.specialHandling ? (
            <View style={styles.handlingBox}>
              <Ionicons name="snow" size={15} color="#276EF1" />
              <Text style={styles.handlingText}>{delivery.goods.specialHandling}</Text>
            </View>
          ) : null}
        </View>

        {/* Route Stops */}
        <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.sectionSmallLabel}>DISPATCH ROUTE</Text>

          <View style={styles.routeItem}>
            <View style={styles.pickupDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stopType}>PICKUP (FARM GATE)</Text>
              <Text style={[styles.stopAddress, isDark && styles.textWhite]}>{delivery.pickup.address}</Text>
              <Text style={styles.stopContact}>Farmer: {delivery.farmerName} ({delivery.farmerPhone})</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeItem}>
            <View style={styles.dropoffDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stopType}>DELIVERY DESTINATION</Text>
              <Text style={[styles.stopAddress, isDark && styles.textWhite]}>{delivery.dropoff.address}</Text>
              <Text style={styles.stopContact}>Recipient: {delivery.buyerName} ({delivery.buyerPhone})</Text>
            </View>
          </View>
        </View>

        {/* Lifecycle Status Timeline */}
        <DeliveryStatusTimeline
          currentStatus={delivery.status}
          history={delivery.statusHistory}
          isDark={isDark}
        />
      </ScrollView>

      {/* Embedded Live Map Modal */}
      <InteractiveLiveMap
        visible={liveMapVisible}
        onClose={() => setLiveMapVisible(false)}
        transaction={{
          id: delivery.orderId,
          produceId: delivery.goods.produceId || 1,
          produceName: delivery.goods.name,
          amount: delivery.customerDeliveryFee,
          quantityOrdered: delivery.goods.quantity,
          buyerName: delivery.buyerName,
          farmerName: delivery.farmerName,
          farmerPhone: delivery.farmerPhone,
          deliveryMethod: 'Direct Farm Courier',
          deliveryAddress: delivery.dropoff.address,
          paymentMethod: 'AgriPay Escrow',
          status: 'In Transit',
          trackingCode: delivery.trackingCode,
          handoverPin: delivery.handoverPin,
          timestamp: delivery.requestedAt,
        }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  liveMapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  liveMapText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  bannerDark: {
    backgroundColor: '#161616',
  },
  bannerLight: {
    backgroundColor: '#F3F4F6',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  statusBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  etaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginTop: 2,
  },
  trackingSubText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  driverCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
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
    shadowRadius: 6,
    elevation: 2,
  },
  sectionSmallLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  driverMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB800',
  },
  vehicleModel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  plateContainer: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  plateText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  callDriverBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(6, 193, 103, 0.3)',
    marginBottom: 12,
    gap: 12,
  },
  pinIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 193, 103, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  pinCodeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#06C167',
    letterSpacing: 6,
    marginVertical: 2,
  },
  pinDesc: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cargoSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cargoThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  cargoName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  cargoQty: {
    fontSize: 12,
    color: '#06C167',
    fontWeight: '700',
    marginTop: 1,
  },
  cargoCategory: {
    fontSize: 10,
    color: '#8E8E93',
  },
  feeCol: {
    alignItems: 'flex-end',
  },
  feeLabel: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '800',
  },
  feeVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#06C167',
  },
  handlingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 110, 241, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  handlingText: {
    fontSize: 11,
    color: '#276EF1',
    fontWeight: '600',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 4,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06C167',
    marginTop: 4,
  },
  dropoffDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#276EF1',
    marginTop: 4,
  },
  routeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 8,
    marginLeft: 20,
  },
  stopType: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.4,
  },
  stopAddress: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginTop: 1,
  },
  stopContact: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  backBtn: {
    backgroundColor: '#06C167',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
