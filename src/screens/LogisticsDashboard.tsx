import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Transaction } from '../types';
import { useApp } from '../context/AppContext';
import { UberBottomNavBar } from '../components/UberBottomNavBar';
import { InteractiveLiveMap } from '../components/InteractiveLiveMap';

export const LogisticsDashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { transactions, updateOrderStatus, releaseEscrow, themeMode, toggleThemeMode } = useApp();
  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);
  const [liveMapOrder, setLiveMapOrder] = useState<Transaction | null>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Filter transactions
  const activeOrders = transactions.filter(
    t => t.status === 'Packed at Farm' || t.status === 'In Transit' || t.status === 'Confirmed'
  );
  const completedOrders = transactions.filter(t => t.status === 'Delivered');

  // Available jobs are simulated pending pickups
  const availablePickups = [
    {
      id: 991,
      farmName: 'Highland Mist Tea & Honey',
      location: 'Ella Mountain Ridge',
      crop: 'Wild Forest Honey (8 Jars)',
      payout: '$18.20',
      distance: '4.2 km away',
      urgency: 'Cold Dispatch',
    },
    {
      id: 992,
      farmName: 'Sunset Organic Grove',
      location: 'Kandy Valley Basin',
      crop: 'Avocados & Papayas (15 kg)',
      payout: '$24.50',
      distance: '6.8 km away',
      urgency: 'Same-Day Priority',
    },
  ];

  const handleStartTransit = async (orderId: number) => {
    await updateOrderStatus(orderId, 'In Transit');
  };

  const handleOpenPinModal = (order: Transaction) => {
    setSelectedOrder(order);
    setEnteredPin('');
    setPinError(false);
    setPinModalVisible(true);
  };

  const handleVerifyPin = async () => {
    if (!selectedOrder) return;

    // Verify against handoverPin on the order or fallback demo PIN '1984'
    const expectedPin = selectedOrder.handoverPin || '1984';
    if (enteredPin.trim() === expectedPin || enteredPin.trim() === '1984') {
      setPinError(false);
      setPinModalVisible(false);
      await updateOrderStatus(selectedOrder.id, 'Delivered');
      await releaseEscrow(selectedOrder.id);
      Alert.alert(
        'Delivery Handover Confirmed! 🎉',
        `4-Digit PIN verified.\n$${selectedOrder.amount.toFixed(
          2
        )} has been released from Escrow to ${selectedOrder.farmerName}.\nCourier delivery payout credited to your wallet.`
      );
    } else {
      setPinError(true);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#121212' : '#FFFFFF'}
      />

      {/* Top Header */}
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('RoleSelection');
            }
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
          <Text style={[styles.backBtnText, isDark && styles.textWhite]}>Portals</Text>
        </TouchableOpacity>

        <View style={styles.statusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.statusPillText}>DISPATCH FLEET ACTIVE</Text>
        </View>

        <TouchableOpacity
          onPress={toggleThemeMode}
          style={[styles.themeBtn, isDark && styles.themeBtnDark]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={16}
            color={isDark ? '#FBBF24' : '#111827'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hub Title Banner */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.hubTitle, isDark && styles.textWhite]}>Logistics & Dispatch</Text>
              <Text style={styles.hubSubtitle}>Member 3: Cold-Chain Farm-to-Door Terminal</Text>
            </View>
            <View style={styles.vehicleBadge}>
              <Ionicons name="car" size={18} color="#06C167" />
              <Text style={styles.vehicleBadgeText}>Van #EV-409</Text>
            </View>
          </View>
        </View>

        {/* Telemetry KPI Cards */}
        <View style={styles.telemetryGrid}>
          <View style={[styles.telemetryCard, isDark && styles.cardDark]}>
            <View style={styles.telemetryTop}>
              <Text style={styles.telemetryLabel}>Refrigeration</Text>
              <Ionicons name="snow" size={15} color="#06C167" />
            </View>
            <Text style={styles.telemetryValueGreen}>3.8°C</Text>
            <Text style={styles.telemetrySub}>Optimal Cold-Chain</Text>
          </View>

          <View style={[styles.telemetryCard, isDark && styles.cardDark]}>
            <View style={styles.telemetryTop}>
              <Text style={styles.telemetryLabel}>Today's Payout</Text>
              <Ionicons name="wallet-outline" size={15} color="#F59E0B" />
            </View>
            <Text style={[styles.telemetryValue, isDark && styles.textWhite]}>$142.50</Text>
            <Text style={styles.telemetrySub}>7 Deliveries Logged</Text>
          </View>

          <View style={[styles.telemetryCard, isDark && styles.cardDark]}>
            <View style={styles.telemetryTop}>
              <Text style={styles.telemetryLabel}>Mileage</Text>
              <MaterialCommunityIcons name="speedometer" size={16} color="#3B82F6" />
            </View>
            <Text style={[styles.telemetryValue, isDark && styles.textWhite]}>46.2 km</Text>
            <Text style={styles.telemetrySub}>88% Battery Remaining</Text>
          </View>
        </View>

        {/* Segment Tabs */}
        <View style={[styles.tabBar, isDark && styles.tabBarDark]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'active' && styles.tabItemActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'active' && styles.tabItemTextActive,
                isDark && activeTab !== 'active' && styles.textMutedDark,
              ]}
            >
              Active ({activeOrders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'available' && styles.tabItemActive]}
            onPress={() => setActiveTab('available')}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'available' && styles.tabItemTextActive,
                isDark && activeTab !== 'active' && styles.textMutedDark,
              ]}
            >
              Pickups ({availablePickups.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'completed' && styles.tabItemActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'completed' && styles.tabItemTextActive,
                isDark && activeTab !== 'active' && styles.textMutedDark,
              ]}
            >
              Done ({completedOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: ACTIVE DELIVERIES */}
        {activeTab === 'active' && (
          <View style={styles.ordersList}>
            {activeOrders.length === 0 ? (
              <View style={[styles.emptyBox, isDark && styles.cardDark]}>
                <Ionicons name="checkmark-done-circle" size={42} color="#06C167" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>All Routes Clear</Text>
                <Text style={styles.emptySub}>No pending deliveries. Check the Pickups tab for incoming jobs.</Text>
              </View>
            ) : (
              activeOrders.map(order => (
                <View key={order.id} style={[styles.jobCard, isDark && styles.cardDark]}>
                  {/* Card Header */}
                  <View style={styles.jobHeader}>
                    <View>
                      <Text style={styles.trackingCode}>{order.trackingCode}</Text>
                      <Text style={[styles.produceTitle, isDark && styles.textWhite]}>
                        {order.produceName} ({order.quantityOrdered})
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusChip,
                        order.status === 'In Transit'
                          ? styles.statusChipTransit
                          : styles.statusChipPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          order.status === 'In Transit'
                            ? styles.statusTextTransit
                            : styles.statusTextPending,
                        ]}
                      >
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Route Timeline */}
                  <View style={styles.routeBox}>
                    <View style={styles.routeStop}>
                      <View style={styles.routeIconFarm}>
                        <Ionicons name="leaf" size={12} color="#06C167" />
                      </View>
                      <View style={styles.routeDetails}>
                        <Text style={styles.routeStopLabel}>FARM GATE ORIGIN</Text>
                        <Text style={[styles.routeStopName, isDark && styles.textWhite]}>
                          {order.farmerName}
                        </Text>
                        <Text style={styles.routeStopSub}>{order.farmerPhone}</Text>
                      </View>
                    </View>

                    <View style={styles.routeConnectorLine} />

                    <View style={styles.routeStop}>
                      <View style={styles.routeIconBuyer}>
                        <Ionicons name="location" size={12} color="#EF4444" />
                      </View>
                      <View style={styles.routeDetails}>
                        <Text style={styles.routeStopLabel}>DELIVERY ADDRESS</Text>
                        <Text style={[styles.routeStopName, isDark && styles.textWhite]}>
                          {order.buyerName}
                        </Text>
                        <Text style={styles.routeStopSub}>{order.deliveryAddress}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Escrow payout info */}
                  <View style={styles.escrowPayoutBar}>
                    <Ionicons name="shield-checkmark" size={14} color="#06C167" />
                    <Text style={styles.escrowPayoutText}>
                      Locked in Escrow: ${order.amount.toFixed(2)} • Handover PIN required
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.jobActionsRow}>
                    <TouchableOpacity
                      style={[styles.startTransitBtn, { backgroundColor: isDark ? '#262626' : '#E5E7EB', marginRight: 8, flex: 0.8 }]}
                      onPress={() => setLiveMapOrder(order)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="map" size={15} color={isDark ? '#FFFFFF' : '#000000'} />
                      <Text style={[styles.startTransitBtnText, isDark && styles.textWhite]}>GPS Map</Text>
                    </TouchableOpacity>

                    {order.status !== 'In Transit' ? (
                      <TouchableOpacity
                        style={[styles.startTransitBtn, { flex: 1.2 }]}
                        onPress={() => handleStartTransit(order.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="navigate" size={16} color="#000000" />
                        <Text style={styles.startTransitBtnText}>Start Transit</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.handoverPinBtn, { flex: 1.2 }]}
                        onPress={() => handleOpenPinModal(order)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="key" size={16} color="#000000" />
                        <Text style={styles.handoverPinBtnText}>Verify PIN</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: AVAILABLE PICKUPS */}
        {activeTab === 'available' && (
          <View style={styles.ordersList}>
            {availablePickups.map(pickup => (
              <View key={pickup.id} style={[styles.jobCard, isDark && styles.cardDark]}>
                <View style={styles.jobHeader}>
                  <View>
                    <View style={styles.pickupBadgeRow}>
                      <Ionicons name="flash" size={12} color="#06C167" />
                      <Text style={styles.pickupBadgeText}>{pickup.urgency.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.produceTitle, isDark && styles.textWhite]}>
                      {pickup.crop}
                    </Text>
                  </View>
                  <Text style={styles.pickupPayout}>{pickup.payout}</Text>
                </View>

                <View style={styles.pickupInfoRow}>
                  <Ionicons name="business-outline" size={14} color="#A1A1AA" />
                  <Text style={styles.pickupInfoText}>{pickup.farmName}</Text>
                </View>
                <View style={styles.pickupInfoRow}>
                  <Ionicons name="location-outline" size={14} color="#A1A1AA" />
                  <Text style={styles.pickupInfoText}>
                    {pickup.location} • {pickup.distance}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.acceptPickupBtn}
                  onPress={() => {
                    Alert.alert(
                      'Dispatch Job Accepted',
                      `Navigating to ${pickup.farmName}. Cold container pre-cooled to 3.8°C.`
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptPickupBtnText}>Accept Pickup Dispatch</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: COMPLETED */}
        {activeTab === 'completed' && (
          <View style={styles.ordersList}>
            {completedOrders.map(done => (
              <View key={done.id} style={[styles.jobCard, isDark && styles.cardDark]}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.trackingCode}>{done.trackingCode}</Text>
                    <Text style={[styles.produceTitle, isDark && styles.textWhite]}>
                      {done.produceName} ({done.quantityOrdered})
                    </Text>
                  </View>
                  <View style={styles.deliveredBadge}>
                    <Ionicons name="checkmark-done" size={13} color="#06C167" />
                    <Text style={styles.deliveredBadgeText}>ESCROW RELEASED</Text>
                  </View>
                </View>

                <Text style={styles.completedSub}>
                  Delivered to {done.buyerName} • {done.deliveryAddress}
                </Text>
                <Text style={styles.completedAmount}>
                  Grower Payout: ${done.amount.toFixed(2)} • Handover Verified
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 4-Digit Handover PIN Verification Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="shield-checkmark" size={20} color="#06C167" />
                <Text style={[styles.modalTitle, isDark && styles.textWhite]}>
                  Delivery Handover PIN
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPinModalVisible(false)}>
                <Ionicons name="close" size={20} color="#A1A1AA" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Ask the buyer ({selectedOrder?.buyerName}) for their 4-digit handover PIN shown in their FarmBy app.
            </Text>

            {selectedOrder?.handoverPin && (
              <View style={styles.demoPinHintBox}>
                <Text style={styles.demoPinHintText}>
                  Buyer PIN Code: <Text style={styles.demoPinBold}>{selectedOrder.handoverPin}</Text> (Demo PIN: 1984)
                </Text>
              </View>
            )}

            <TextInput
              style={[
                styles.pinInputField,
                pinError && styles.pinInputError,
                isDark && styles.pinInputFieldDark,
              ]}
              value={enteredPin}
              onChangeText={text => {
                setEnteredPin(text);
                setPinError(false);
              }}
              placeholder="••••"
              placeholderTextColor="#71717A"
              keyboardType="numeric"
              maxLength={4}
              textAlign="center"
            />

            {pinError && (
              <Text style={styles.errorText}>Invalid PIN code. Please verify with buyer.</Text>
            )}

            <TouchableOpacity
              style={styles.confirmPinBtn}
              onPress={handleVerifyPin}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#000000" />
              <Text style={styles.confirmPinBtnText}>Release Escrow & Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Live Interactive Logistics GPS Navigation Map */}
      <InteractiveLiveMap
        visible={!!liveMapOrder}
        onClose={() => setLiveMapOrder(null)}
        transaction={liveMapOrder}
      />

      {/* Official Uber Bottom Navigation Bar with Sliding Bubble Animation */}
      <UberBottomNavBar activeTab="services" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMutedDark: {
    color: '#A1A1AA',
  },
  cardDark: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
  },
  topBarDark: {
    backgroundColor: '#121212',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06C167',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtnDark: {
    backgroundColor: '#262626',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hubTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  hubSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 193, 103, 0.25)',
  },
  vehicleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  telemetryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  telemetryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  telemetryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  telemetryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  telemetryValueGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#06C167',
  },
  telemetrySub: {
    fontSize: 9.5,
    color: '#6B7280',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabBarDark: {
    backgroundColor: '#1E1E20',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#06C167',
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabItemTextActive: {
    color: '#000000',
  },
  ordersList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  trackingCode: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  produceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipTransit: {
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
  },
  statusChipPending: {
    backgroundColor: '#FEF3C7',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextTransit: {
    color: '#06C167',
  },
  statusTextPending: {
    color: '#D97706',
  },
  routeBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeIconFarm: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeIconBuyer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDetails: {
    flex: 1,
  },
  routeStopLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.4,
  },
  routeStopName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  routeStopSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  routeConnectorLine: {
    width: 2,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginLeft: 11,
    marginVertical: 2,
  },
  escrowPayoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  escrowPayoutText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  jobActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  startTransitBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#06C167',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  startTransitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  handoverPinBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#06C167',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  handoverPinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  pickupBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  pickupBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
  },
  pickupPayout: {
    fontSize: 18,
    fontWeight: '800',
    color: '#06C167',
  },
  pickupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pickupInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  acceptPickupBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111827',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptPickupBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveredBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#06C167',
  },
  completedSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  completedAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06C167',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalCardDark: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalDesc: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  demoPinHintBox: {
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  demoPinHintText: {
    fontSize: 12,
    color: '#06C167',
    textAlign: 'center',
  },
  demoPinBold: {
    fontWeight: '800',
  },
  pinInputField: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 10,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  pinInputFieldDark: {
    backgroundColor: '#27272A',
    color: '#FFFFFF',
  },
  pinInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmPinBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#06C167',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  confirmPinBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});
