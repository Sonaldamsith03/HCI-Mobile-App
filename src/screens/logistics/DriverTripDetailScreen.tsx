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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Delivery, DeliveryProof, ProblemReport } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { DeliveryStatusTimeline } from '../../components/logistics/DeliveryStatusTimeline';
import {
  PickupConfirmationModal,
  DeliveryConfirmationModal,
  ProblemReportModal,
} from '../../components/logistics/DeliveryActionModals';
import { InteractiveLiveMap } from '../../components/InteractiveLiveMap';
import { colors } from '../../theme/colors';

export const DriverTripDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'DriverTripDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, toggleThemeMode, showToast, releaseEscrow } = useApp();
  const isDark = themeMode === 'dark';

  const deliveryId = route.params.deliveryId;
  const [delivery, setDelivery] = useState<Delivery | undefined>(logisticsService.getDeliveryById(deliveryId));

  // Modals state
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [problemModalVisible, setProblemModalVisible] = useState(false);
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
        <View style={styles.notFoundCenter}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={[styles.notFoundTitle, isDark && styles.textWhite]}>Delivery Not Found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Contact', phone);
    });
  };

  const handleExternalNavigation = (address: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else setLiveMapVisible(true);
    });
  };

  // State machine handlers
  const handleArriveAtPickup = async () => {
    await logisticsService.updateDeliveryStatus(
      delivery.id,
      'Arrived at Pickup',
      'Driver reached farm gate for inspection'
    );
    showToast('Arrived at Farm Gate! Ready for cargo inspection.', 'success');
  };

  const handleGoodsCollected = async (proof: DeliveryProof) => {
    setPickupModalVisible(false);
    await logisticsService.updateDeliveryStatus(
      delivery.id,
      'Goods Collected',
      `Inspected and loaded ${proof.packageCountVerified} crates. Condition: ${proof.condition}`,
      proof
    );
    showToast('Goods collected! You are now in transit to the buyer.', 'success');
  };

  const handleArriveAtDelivery = async () => {
    await logisticsService.updateDeliveryStatus(
      delivery.id,
      'Arrived at Delivery',
      'Courier reached buyer destination'
    );
    showToast('Arrived at Buyer Destination! Collect 4-digit PIN for handover.', 'success');
  };

  const handleCompleteDelivery = async (proof: DeliveryProof) => {
    setDeliveryModalVisible(false);
    await logisticsService.updateDeliveryStatus(
      delivery.id,
      'Delivery Completed',
      `PIN validated by ${proof.signatureName}. Handover confirmed.`,
      proof
    );
    // Also trigger Escrow release if orderId exists
    if (delivery.orderId) {
      await releaseEscrow(delivery.orderId);
    }
    showToast(`Delivery completed! LKR ${delivery.driverEarnings.toLocaleString()} credited to your wallet 💰`, 'success');
  };

  const handleReportProblem = async (report: ProblemReport) => {
    setProblemModalVisible(false);
    await logisticsService.reportProblem(delivery.id, report);
    showToast('Problem reported to dispatch operations', 'warn');
  };

  const handleCancelDelivery = () => {
    Alert.alert(
      'Cancel Delivery?',
      'Are you sure you want to cancel this delivery assignment? It will return to dispatch pool.',
      [
        { text: 'Keep Assignment', style: 'cancel' },
        {
          text: 'Cancel Assignment',
          style: 'destructive',
          onPress: async () => {
            await logisticsService.cancelDelivery(delivery.id, 'Driver', 'Driver requested cancellation');
            showToast('Delivery assignment cancelled', 'info');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnRow}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.backTitle, isDark && styles.textWhite]}>Trip #{delivery.id}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => setLiveMapVisible(true)} style={styles.mapHeaderBtn}>
            <Ionicons name="map-outline" size={18} color="#06C167" />
            <Text style={styles.mapHeaderText}>Live Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleThemeMode}
            style={[styles.mapHeaderBtn, { paddingHorizontal: 10 }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#F59E0B' : '#4B5563'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status & Payout Header Banner */}
        <View style={[styles.heroBanner, isDark ? styles.heroDark : styles.heroLight]}>
          <View>
            <Text style={styles.heroStatusLabel}>CURRENT STATUS</Text>
            <Text style={[styles.heroStatusVal, isDark && styles.textWhite]}>{delivery.status}</Text>
            <Text style={styles.heroTracking}>Code: {delivery.trackingCode}</Text>
          </View>

          <View style={styles.heroPayoutCol}>
            <Text style={styles.heroPayoutLabel}>NET EARNINGS</Text>
            <Text style={styles.heroPayoutVal}>LKR {delivery.driverEarnings.toLocaleString()}</Text>
            <Text style={styles.heroFeeSub}>Customer: LKR {delivery.customerDeliveryFee.toLocaleString()}</Text>
          </View>
        </View>

        {/* Embedded Interactive Route Preview */}
        <TouchableOpacity
          style={[styles.mapPreviewCard, isDark ? styles.cardDark : styles.cardLight]}
          onPress={() => setLiveMapVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.mapVisualHeader}>
            <View style={styles.routePill}>
              <Ionicons name="navigate-outline" size={13} color="#FFFFFF" />
              <Text style={styles.routePillText}>
                {delivery.distanceKm} km • ~{delivery.estimatedMinutes} mins
              </Text>
            </View>

            <View style={styles.vehicleBadge}>
              <Text style={styles.vehicleBadgeText}>{delivery.vehicleRequired}</Text>
            </View>
          </View>

          {/* Graphical Route Flow */}
          <View style={styles.routePinsContainer}>
            <View style={styles.pinStopItem}>
              <View style={styles.pickupCircle}>
                <Ionicons name="leaf" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.pinDetails}>
                <Text style={styles.pinType}>PICKUP (FARM GATE)</Text>
                <Text style={[styles.pinAddress, isDark && styles.textWhite]} numberOfLines={1}>
                  {delivery.pickup.address}
                </Text>
              </View>
            </View>

            <View style={styles.pinRouteDottedLine} />

            <View style={styles.pinStopItem}>
              <View style={styles.dropoffCircle}>
                <Ionicons name="home" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.pinDetails}>
                <Text style={styles.pinType}>DROP-OFF (BUYER DOOR)</Text>
                <Text style={[styles.pinAddress, isDark && styles.textWhite]} numberOfLines={1}>
                  {delivery.dropoff.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mapTapHint}>
            <Ionicons name="expand-outline" size={14} color="#06C167" />
            <Text style={styles.mapTapHintText}>Tap to open full interactive telemetry GPS map</Text>
          </View>
        </TouchableOpacity>

        {/* Goods Cargo Information */}
        <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={[styles.sectionCardTitle, isDark && styles.textWhite]}>Cargo Specifications</Text>

          <View style={styles.cargoRow}>
            {delivery.goods.imageUrl && (
              <Image source={{ uri: delivery.goods.imageUrl }} style={styles.cargoThumb} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.cargoName, isDark && styles.textWhite]}>{delivery.goods.name}</Text>
              <Text style={styles.cargoQuantity}>
                {delivery.goods.quantity} ({delivery.goods.weightKg} kg payload)
              </Text>
              <Text style={styles.packageSub}>{delivery.goods.packageCount} Crates / Sacks</Text>
            </View>
          </View>

          {delivery.goods.specialHandling ? (
            <View style={styles.handlingBox}>
              <Ionicons name="snow" size={16} color="#276EF1" />
              <View style={{ flex: 1 }}>
                <Text style={styles.handlingTitle}>Special Cold-Chain / Handling Instructions</Text>
                <Text style={styles.handlingBody}>{delivery.goods.specialHandling}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Pickup Contact Information */}
        <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.contactHeader}>
            <View>
              <Text style={styles.contactType}>FARMER / SUPPLIER</Text>
              <Text style={[styles.contactName, isDark && styles.textWhite]}>{delivery.farmerName}</Text>
              <Text style={styles.contactPhone}>{delivery.farmerPhone}</Text>
            </View>

            <View style={styles.contactBtnGroup}>
              <TouchableOpacity
                style={[styles.callIconBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => {
                  navigation.navigate('ChatConversation', {
                    farmerName: delivery.farmerName,
                    buyerName: delivery.assignedDriver?.name || 'Logistics Driver',
                    produceName: `Trip #${delivery.trackingCode} - ${delivery.goods.name}`,
                    conversationId: `Driver_${delivery.assignedDriver?.id || 'd1'}_Farmer_${delivery.farmerName}_${delivery.id}`,
                  });
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={17} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callIconBtn}
                onPress={() => handleCall(delivery.farmerPhone)}
              >
                <Ionicons name="call" size={18} color="#06C167" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navIconBtn}
                onPress={() => handleExternalNavigation(delivery.pickup.address)}
              >
                <Ionicons name="navigate" size={18} color="#276EF1" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsLabel}>Pickup Gate Instructions:</Text>
            <Text style={styles.instructionsText}>
              {delivery.pickup.instructions || 'Contact farmer 10 mins before arrival at farm entrance.'}
            </Text>
          </View>
        </View>

        {/* Delivery Destination Contact Information */}
        <View style={[styles.sectionCard, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.contactHeader}>
            <View>
              <Text style={styles.contactType}>BUYER / RECIPIENT</Text>
              <Text style={[styles.contactName, isDark && styles.textWhite]}>{delivery.buyerName}</Text>
              <Text style={styles.contactPhone}>{delivery.buyerPhone}</Text>
            </View>

            <View style={styles.contactBtnGroup}>
              <TouchableOpacity
                style={[styles.callIconBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => {
                  navigation.navigate('ChatConversation', {
                    farmerName: delivery.assignedDriver?.name || 'Driver Courier',
                    buyerName: delivery.buyerName,
                    produceName: `Trip #${delivery.trackingCode} - ${delivery.goods.name}`,
                    conversationId: `Driver_${delivery.assignedDriver?.id || 'd1'}_${delivery.buyerName}_${delivery.id}`,
                  });
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={17} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callIconBtn}
                onPress={() => handleCall(delivery.buyerPhone)}
              >
                <Ionicons name="call" size={18} color="#06C167" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navIconBtn}
                onPress={() => handleExternalNavigation(delivery.dropoff.address)}
              >
                <Ionicons name="navigate" size={18} color="#276EF1" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsLabel}>Delivery Doorstep Instructions:</Text>
            <Text style={styles.instructionsText}>
              {delivery.dropoff.instructions || 'Inspect produce and verify 4-digit handover PIN upon unloading.'}
            </Text>
          </View>

          {/* Handover PIN Prompt */}
          <View style={styles.pinReminderBanner}>
            <Ionicons name="shield-checkmark" size={18} color="#06C167" />
            <Text style={styles.pinReminderText}>
              Recipient holds 4-digit PIN: <Text style={{ fontWeight: '900' }}>{delivery.handoverPin}</Text>
            </Text>
          </View>
        </View>

        {/* Status Lifecycle Timeline */}
        <DeliveryStatusTimeline
          currentStatus={delivery.status}
          history={delivery.statusHistory}
          isDark={isDark}
        />

        {/* Problem and Cancel Links */}
        {delivery.status !== 'Delivery Completed' && delivery.status !== 'Cancelled' && (
          <View style={styles.issueLinksRow}>
            <TouchableOpacity style={styles.issueBtn} onPress={() => setProblemModalVisible(true)}>
              <Ionicons name="warning-outline" size={16} color="#FF9500" />
              <Text style={styles.issueBtnText}>REPORT A PROBLEM</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelDelivery}>
              <Ionicons name="close-circle-outline" size={16} color="#FF3B30" />
              <Text style={styles.cancelBtnText}>CANCEL ASSIGNMENT</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar based on Delivery State */}
      <View style={[styles.bottomActionBar, isDark ? styles.bottomDark : styles.bottomLight]}>
        {delivery.status === 'Searching for Driver' || delivery.status === 'Delivery Requested' ? (
          <View style={styles.doubleActionRow}>
            <TouchableOpacity
              style={styles.declineBigBtn}
              onPress={() => {
                showToast('Request declined', 'info');
                navigation.goBack();
              }}
            >
              <Text style={styles.declineBigText}>DECLINE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBigBtn}
              onPress={() => logisticsService.acceptDelivery(delivery.id)}
            >
              <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
              <Text style={styles.acceptBigText}>ACCEPT DELIVERY</Text>
            </TouchableOpacity>
          </View>
        ) : delivery.status === 'Driver Assigned' || delivery.status === 'Driver En Route to Pickup' ? (
          <View style={styles.doubleActionRow}>
            <TouchableOpacity
              style={styles.navBigBtn}
              onPress={() => handleExternalNavigation(delivery.pickup.address)}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.navBigText}>NAVIGATE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBigBtn} onPress={handleArriveAtPickup}>
              <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
              <Text style={styles.confirmBigText}>ARRIVED AT PICKUP</Text>
            </TouchableOpacity>
          </View>
        ) : delivery.status === 'Arrived at Pickup' ? (
          <TouchableOpacity
            style={styles.confirmBigBtn}
            onPress={() => setPickupModalVisible(true)}
          >
            <Ionicons name="checkbox" size={20} color="#FFFFFF" />
            <Text style={styles.confirmBigText}>CONFIRM GOODS COLLECTED</Text>
          </TouchableOpacity>
        ) : delivery.status === 'Goods Collected' || delivery.status === 'In Transit' ? (
          <View style={styles.doubleActionRow}>
            <TouchableOpacity
              style={styles.navBigBtn}
              onPress={() => handleExternalNavigation(delivery.dropoff.address)}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.navBigText}>NAVIGATE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBigBtn} onPress={handleArriveAtDelivery}>
              <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
              <Text style={styles.confirmBigText}>ARRIVED AT BUYER</Text>
            </TouchableOpacity>
          </View>
        ) : delivery.status === 'Arrived at Delivery' ? (
          <TouchableOpacity
            style={styles.confirmBigBtn}
            onPress={() => setDeliveryModalVisible(true)}
          >
            <Ionicons name="key" size={20} color="#FFFFFF" />
            <Text style={styles.confirmBigText}>CONFIRM HANDOVER (ENTER PIN)</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={22} color="#06C167" />
            <Text style={styles.completedBannerText}>TRIP COMPLETED & DISBURSED</Text>
          </View>
        )}
      </View>

      {/* Action Modals */}
      <PickupConfirmationModal
        visible={pickupModalVisible}
        delivery={delivery}
        onClose={() => setPickupModalVisible(false)}
        onConfirm={handleGoodsCollected}
        isDark={isDark}
      />

      <DeliveryConfirmationModal
        visible={deliveryModalVisible}
        delivery={delivery}
        onClose={() => setDeliveryModalVisible(false)}
        onConfirm={handleCompleteDelivery}
        isDark={isDark}
      />

      <ProblemReportModal
        visible={problemModalVisible}
        delivery={delivery}
        onClose={() => setProblemModalVisible(false)}
        onSubmit={handleReportProblem}
        isDark={isDark}
      />

      {/* In-app Interactive Telemetry Live Map */}
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
  backTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  mapHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  mapHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  heroBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  heroDark: {
    backgroundColor: '#161616',
  },
  heroLight: {
    backgroundColor: '#F3F4F6',
  },
  heroStatusLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  heroStatusVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000000',
    marginTop: 2,
  },
  heroTracking: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  heroPayoutCol: {
    alignItems: 'flex-end',
  },
  heroPayoutLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.4,
  },
  heroPayoutVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#06C167',
    marginTop: 2,
  },
  heroFeeSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  mapPreviewCard: {
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
  mapVisualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  routePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleBadge: {
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vehicleBadgeText: {
    color: '#06C167',
    fontSize: 11,
    fontWeight: '700',
  },
  routePinsContainer: {
    position: 'relative',
    paddingVertical: 6,
  },
  pinStopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  pickupCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  dropoffCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  pinRouteDottedLine: {
    position: 'absolute',
    left: 10,
    top: 26,
    bottom: 26,
    width: 2,
    backgroundColor: '#06C167',
    opacity: 0.3,
  },
  pinDetails: {
    flex: 1,
  },
  pinType: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  pinAddress: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginTop: 1,
  },
  mapTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  mapTapHintText: {
    color: '#06C167',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
  },
  cargoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cargoThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  cargoName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  cargoQuantity: {
    fontSize: 13,
    color: '#06C167',
    fontWeight: '700',
    marginTop: 2,
  },
  packageSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  handlingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(39, 110, 241, 0.1)',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  handlingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#276EF1',
  },
  handlingBody: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactType: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#06C167',
    fontWeight: '600',
    marginTop: 1,
  },
  contactBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  callIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(39, 110, 241, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  instructionsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  instructionsText: {
    fontSize: 12,
    color: '#000000',
    marginTop: 2,
  },
  pinReminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  pinReminderText: {
    fontSize: 12,
    color: '#06C167',
  },
  issueLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
    gap: 10,
  },
  issueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  issueBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF9500',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF3B30',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomDark: {
    backgroundColor: '#000000',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  doubleActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navBigBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#276EF1',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  navBigText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  confirmBigBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#06C167',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  confirmBigText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  declineBigBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBigText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 13,
  },
  acceptBigBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#06C167',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptBigText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  completedBannerText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  notFoundCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  notFoundTitle: {
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
