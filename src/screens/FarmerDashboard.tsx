import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Animated,
  Easing,
} from 'react-native';

// ─── Count-up number animation ────────────────────────────────────────
const CountUpText: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  style?: object;
  decimals?: number;
  duration?: number;
}> = ({ value, prefix = '', suffix = '', style, decimals = 0, duration = 900 }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = React.useState(prefix + '0' + suffix);

  useEffect(() => {
    animVal.setValue(0);
    const listener = animVal.addListener(({ value: v }) => {
      setDisplayVal(prefix + v.toFixed(decimals) + suffix);
    });
    Animated.timing(animVal, {
      toValue: value,
      duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
    return () => animVal.removeListener(listener);
  }, [value]);

  return <Text style={style}>{displayVal}</Text>;
};

// ─── Animated horizontal fill bar ──────────────────────────────────────
const AnimatedFillBar: React.FC<{
  fillPct: number;
  color: string;
  trackColor?: string;
  height?: number;
}> = ({ fillPct, color, trackColor = '#E5E7EB', height = 6 }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: fillPct,
      useNativeDriver: false,
      damping: 22,
      stiffness: 160,
      mass: 1,
    }).start();
  }, [fillPct]);

  const widthInterp = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden', marginTop: 6 }}>
      <Animated.View style={{ height, borderRadius: height / 2, backgroundColor: color, width: widthInterp }} />
    </View>
  );
};
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Produce, RootStackParamList, Transaction } from '../types';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';
import { AgriCard } from '../components/AgriCard';
import { StatusBadge } from '../components/Badges';
import { ForestPrimaryButton, HarvestAccentButton } from '../components/Buttons';
import { CropFormModal, UpdateOrderStatusModal } from '../components/Modals';
import { IOSSegmentedControl } from '../components/IOSSegmentedControl';
import { UberBottomNavBar } from '../components/UberBottomNavBar';

export const FarmerDashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    produceList,
    transactions,
    messages,
    conversationThreads,
    themeMode,
    addProduce,
    updateProduce,
    deleteProduce,
    updateOrderStatus,
    sendMessage,
    respondToOffer,
    userProfile,
  } = useApp();

  const isDark = themeMode === 'dark';

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [editingProduce, setEditingProduce] = useState<Produce | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [replyText, setReplyText] = useState('');

  const totalFarmValue = produceList.reduce((acc, p) => acc + p.price * parseFloat(p.quantity || '1'), 0);

  const handleDelete = (produce: Produce) => {
    Alert.alert(
      'Remove Crop Listing',
      `Are you sure you want to remove ${produce.name} from the marketplace?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteProduce(produce.id) },
      ]
    );
  };

  const handleSendFarmerReply = () => {
    if (!replyText.trim()) return;
    sendMessage('Mateo Gutierrez', 'General Farm Chat', replyText.trim(), 'Farmer');
    setReplyText('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#000000' }]}>
      {/* Clean Navigation Header */}
      <View style={[styles.navHeader, isDark && { backgroundColor: '#000000', borderBottomColor: 'rgba(255,255,255,0.08)' }]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('RoleSelection');
            }
          }}
          style={styles.backChevron}
        >
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.backLabel, isDark && { color: '#FFFFFF' }]}>Portals</Text>
        </TouchableOpacity>

        <View style={[styles.verifiedPill, isDark && { backgroundColor: 'rgba(6, 193, 103, 0.15)', borderColor: 'rgba(6, 193, 103, 0.3)' }]}>
          <Ionicons name="checkmark-circle" size={14} color="#06C167" />
          <Text style={[styles.verifiedText, isDark && { color: '#06C167' }]}>Verified Farm</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large Title */}
        <View style={styles.largeTitleSection}>
          <Text style={[styles.largeTitle, isDark && { color: '#FFFFFF' }]}>Farmer Hub</Text>
          <Text style={[styles.subTitle, isDark && { color: '#9CA3AF' }]}>Direct Harvest & Order Management</Text>
        </View>

        {/* Segmented Control */}
        <IOSSegmentedControl
          options={['My Crops', 'Orders', 'Messages']}
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
          badgeCounts={[produceList.length, transactions.length, undefined]}
        />

        {/* TAB 0: CROPS */}
        {selectedTabIndex === 0 && (
          <View style={{ marginTop: 8 }}>
            {/* Apple Liquid Glass Inventory Overview Card */}
            <AgriCard style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View>
                  <Text style={[styles.summaryLabel, isDark && { color: '#9CA3AF' }]}>Farm Inventory Value</Text>
                  <Text style={[styles.summaryBigVal, isDark && { color: '#FFFFFF' }]}>${totalFarmValue.toFixed(2)}</Text>
                </View>
                <View style={styles.advantagePill}>
                  <Text style={styles.advantagePillText}>+55% vs Broker</Text>
                </View>
              </View>
              <Text style={[styles.summarySub, isDark && { color: '#D1D5DB' }]}>
                Zero commission or broker cuts. Payouts arrive directly through AgriPay Escrow upon delivery inspection.
              </Text>
              <ForestPrimaryButton
                title="+ Add Harvest Listing"
                onPress={() => {
                  setEditingProduce(null);
                  setShowCropModal(true);
                }}
                style={{ marginTop: 14 }}
              />
            </AgriCard>

            {/* Live Microclimate & Soil Moisture Card */}
            <AgriCard style={styles.weatherCard}>
              <View style={styles.weatherHeaderRow}>
                <View style={styles.weatherTitleCol}>
                  <Text style={styles.weatherClusterText}>GREEN VALLEY FIELD SENSORS</Text>
                  <Text style={[styles.weatherMainTemp, isDark && { color: '#FFFFFF' }]}>
                    24°C <Text style={[styles.weatherConditionText, isDark && { color: '#9CA3AF' }]}>• Sunny & Clear</Text>
                  </Text>
                </View>
                <View style={styles.weatherSunCircle}>
                  <Ionicons name="sunny" size={26} color="#F59E0B" />
                </View>
              </View>

              <View style={styles.weatherMetricsRow}>
                <View style={styles.weatherMetricCol}>
                  <View style={styles.metricIconRow}>
                    <Ionicons name="water" size={13} color="#0284C7" />
                    <Text style={[styles.metricTitle, isDark && { color: '#9CA3AF' }]}>Soil Moisture</Text>
                  </View>
                  <Text style={[styles.metricValue, isDark && { color: '#FFFFFF' }]}>
                    74% <Text style={styles.metricStatusGood}>Good</Text>
                  </Text>
                  <AnimatedFillBar fillPct={74} color="#0284C7" trackColor={isDark ? 'rgba(2, 132, 199, 0.25)' : 'rgba(2, 132, 199, 0.15)'} height={5} />
                </View>

                <View style={[styles.metricColDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

                <View style={styles.weatherMetricCol}>
                  <View style={styles.metricIconRow}>
                    <Ionicons name="cloud-outline" size={13} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.metricTitle, isDark && { color: '#9CA3AF' }]}>Humidity</Text>
                  </View>
                  <Text style={[styles.metricValue, isDark && { color: '#FFFFFF' }]}>62%</Text>
                  <AnimatedFillBar fillPct={62} color={isDark ? '#9CA3AF' : '#6B7280'} trackColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(107, 114, 128, 0.15)'} height={5} />
                </View>

                <View style={[styles.metricColDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

                <View style={styles.weatherMetricCol}>
                  <View style={styles.metricIconRow}>
                    <Ionicons name="speedometer-outline" size={13} color="#059669" />
                    <Text style={[styles.metricTitle, isDark && { color: '#9CA3AF' }]}>Harvest</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: '#059669' }]}>48h Clear</Text>
                  <AnimatedFillBar fillPct={85} color="#059669" trackColor={isDark ? 'rgba(5, 150, 105, 0.25)' : 'rgba(5, 150, 105, 0.15)'} height={5} />
                </View>
              </View>
            </AgriCard>

            {/* Farm Fulfillment & Escrow Metrics */}
            <View style={styles.fulfillmentRow}>
              <View style={[styles.fulfillmentBox, isDark && { backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.08)' }]}>
                <CountUpText
                  value={transactions.filter(t => t.status === 'Delivered').length}
                  style={[styles.fulfillmentVal, isDark && { color: '#FFFFFF' }]}
                  duration={800}
                />
                <Text style={[styles.fulfillmentLabel, isDark && { color: '#9CA3AF' }]}>Delivered</Text>
              </View>
              <View style={[styles.fulfillmentBox, isDark && { backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.08)' }]}>
                <CountUpText
                  value={transactions.filter(t => t.status !== 'Delivered').length}
                  style={[styles.fulfillmentVal, { color: '#D97706' }]}
                  duration={900}
                />
                <Text style={[styles.fulfillmentLabel, isDark && { color: '#9CA3AF' }]}>In Dispatch</Text>
              </View>
              <View style={[styles.fulfillmentBox, isDark && { backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.08)' }]}>
                <CountUpText
                  value={transactions.reduce((acc, t) => acc + t.amount, 0)}
                  prefix="$"
                  decimals={0}
                  style={[styles.fulfillmentVal, { color: '#059669' }]}
                  duration={1100}
                />
                <Text style={[styles.fulfillmentLabel, isDark && { color: '#9CA3AF' }]}>Escrow Held</Text>
              </View>
            </View>

            <Text style={[styles.groupHeader, isDark && { color: '#9CA3AF' }]}>ACTIVE LISTINGS ({produceList.length})</Text>

            {produceList.map(item => {
              const cropImg = item.imageUrl || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES.Vegetables;

              return (
                <AgriCard key={item.id} style={styles.produceCard}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={{ uri: cropImg }}
                      style={styles.cropThumb}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.cropTitle, isDark && { color: '#FFFFFF' }]}>{item.name}</Text>
                      <Text style={[styles.cropCategory, isDark && { color: '#9CA3AF' }]}>{item.category} • {item.location}</Text>
                    </View>
                  </View>

                  {/* Price Metrics Bar */}
                  <View style={[styles.priceRow, isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' }]}>
                    <View>
                      <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>Your Direct Price</Text>
                      <Text style={styles.priceVal}>
                        ${item.price.toFixed(2)}{' '}
                        <Text style={[styles.unitVal, isDark && { color: '#9CA3AF' }]}>/ {item.unit}</Text>
                      </Text>
                    </View>
                    <View style={[styles.divider, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                    <View>
                      <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>Supermarket Retail</Text>
                      <Text style={styles.retailVal}>${item.middlemanPrice.toFixed(2)} / {item.unit}</Text>
                    </View>
                    <View style={[styles.divider, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                    <View>
                      <Text style={[styles.priceLabel, isDark && { color: '#9CA3AF' }]}>In Stock</Text>
                      <Text style={[styles.stockVal, isDark && { color: '#FFFFFF' }]}>{item.quantity}</Text>
                    </View>
                  </View>

                  <Text style={[styles.cropDesc, isDark && { color: '#D1D5DB' }]} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingProduce(item);
                        setShowCropModal(true);
                      }}
                      style={[styles.actionBtn, isDark && { backgroundColor: '#262626', borderColor: 'rgba(255,255,255,0.1)' }]}
                    >
                      <Ionicons name="create-outline" size={15} color={colors.forestGreenPrimary} />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(254, 226, 226, 0.70)',
                          borderColor: 'rgba(239, 68, 68, 0.25)',
                        },
                      ]}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.harvestTerracotta} />
                      <Text style={[styles.actionBtnText, { color: colors.harvestTerracotta }]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </AgriCard>
              );
            })}
          </View>
        )}

        {/* TAB 1: ORDERS */}
        {selectedTabIndex === 1 && (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.groupHeader, isDark && { color: '#9CA3AF' }]}>INCOMING FULFILLMENT ({transactions.length})</Text>

            {transactions.map(tx => {
              const matchedCrop = produceList.find(p => p.id === tx.produceId);
              const txImg = matchedCrop?.imageUrl || DEFAULT_CATEGORY_IMAGES.Vegetables;

              return (
                <AgriCard key={tx.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Image
                      source={{ uri: txImg }}
                      style={styles.orderThumb}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.orderTitle, isDark && { color: '#FFFFFF' }]}>{tx.produceName}</Text>
                      <Text style={[styles.orderCode, isDark && { color: '#9CA3AF' }]}>{tx.trackingCode}</Text>
                    </View>
                    <StatusBadge status={tx.status} />
                  </View>

                <View style={[styles.orderGrid, isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' }]}>
                  <View style={styles.orderGridItem}>
                    <Text style={[styles.gridLabel, isDark && { color: '#9CA3AF' }]}>Buyer</Text>
                    <Text style={[styles.gridVal, isDark && { color: '#FFFFFF' }]}>{tx.buyerName}</Text>
                  </View>
                  <View style={styles.orderGridItem}>
                    <Text style={[styles.gridLabel, isDark && { color: '#9CA3AF' }]}>Quantity</Text>
                    <Text style={[styles.gridVal, isDark && { color: '#FFFFFF' }]}>{tx.quantityOrdered}</Text>
                  </View>
                  <View style={styles.orderGridItem}>
                    <Text style={[styles.gridLabel, isDark && { color: '#9CA3AF' }]}>Escrow Payout</Text>
                    <Text style={[styles.gridVal, { color: colors.forestGreenPrimary }]}>
                      ${tx.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryLine}>
                  <Ionicons name="location-outline" size={14} color={isDark ? '#9CA3AF' : colors.earthTextMuted} />
                  <Text style={[styles.deliveryText, isDark && { color: '#D1D5DB' }]} numberOfLines={1}>
                    {tx.deliveryMethod}: {tx.deliveryAddress}
                  </Text>
                </View>

                <ForestPrimaryButton
                  title="Update Fulfillment Step"
                  icon={<Ionicons name="refresh" size={16} color="#FFFFFF" />}
                  onPress={() => setSelectedTx(tx)}
                  style={{ height: 44, marginTop: 4 }}
                />
              </AgriCard>
            );
          })}
          </View>
        )}

        {/* TAB 2: MESSAGES & LIVE INQUIRIES */}
        {selectedTabIndex === 2 && (
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[styles.groupHeader, isDark && { color: '#9CA3AF' }, { marginBottom: 0 }]}>
                LIVE BUYER INBOX ({conversationThreads.length})
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>Live Realtime Sync</Text>
              </View>
            </View>

            {/* Conversation Threads Cards */}
            {conversationThreads.map(thread => (
              <TouchableOpacity
                key={thread.id}
                onPress={() => {
                  navigation.navigate('ChatConversation', {
                    conversationId: thread.id,
                    farmerName: thread.farmerName,
                    buyerName: thread.buyerName,
                    produceName: thread.produceName,
                    produceId: thread.produceId,
                  });
                }}
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#10B981',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827' }}>
                      {thread.buyerName}
                    </Text>
                    <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      {new Date(thread.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 2 }}>
                    {thread.produceName}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 13, color: isDark ? '#D1D5DB' : '#4B5563', marginTop: 2 }}
                  >
                    {thread.lastMessage}
                  </Text>
                </View>

                {thread.activeOffer && thread.activeOffer.status === 'pending' && (
                  <View
                    style={{
                      backgroundColor: '#FEF3C7',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#B45309' }}>BID PENDING</Text>
                  </View>
                )}

                <Ionicons name="chevron-forward" size={18} color={isDark ? '#9CA3AF' : '#D1D5DB'} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ))}

            <Text style={[styles.groupHeader, isDark && { color: '#9CA3AF' }, { marginTop: 12 }]}>
              RECENT MESSAGE FEED
            </Text>
            <AgriCard>
              {messages.slice().sort((a, b) => a.timestamp - b.timestamp).map(msg => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'Farmer'
                      ? styles.bubbleFarmer
                      : [styles.bubbleBuyer, isDark && { backgroundColor: '#262626' }],
                  ]}
                >
                  <View style={styles.bubbleHeader}>
                    <Text style={styles.bubbleSender}>
                      {msg.sender === 'Farmer' ? 'You (Grower)' : msg.farmerName || 'Buyer'}
                    </Text>
                    <Text style={[styles.bubbleTime, isDark && { color: '#9CA3AF' }]}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={[styles.bubbleContent, isDark && { color: '#FFFFFF' }]}>{msg.content}</Text>

                  {/* Interactive Farmer Bargain Card */}
                  {msg.offer && (
                    <View
                      style={{
                        backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                        borderRadius: 14,
                        padding: 12,
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(6, 193, 103, 0.3)',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#06C167', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Ionicons name="pricetag" size={11} color="#000000" />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#000000' }}>BUYER BID</Text>
                        </View>
                        <View
                          style={{
                            backgroundColor:
                              msg.offer.status === 'accepted'
                                ? '#10B981'
                                : msg.offer.status === 'declined'
                                ? '#EF4444'
                                : '#F59E0B',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>
                            {msg.offer.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 4 }}>
                        <View>
                          <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700' }}>OFFER PRICE</Text>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#FFFFFF' : '#000000' }}>
                            ${msg.offer.offeredPrice.toFixed(2)}/{msg.offer.unit}
                          </Text>
                        </View>
                        <View style={{ width: 1, height: 28, backgroundColor: 'rgba(156, 163, 175, 0.2)' }} />
                        <View>
                          <Text style={{ fontSize: 9, color: '#9CA3AF', fontWeight: '700' }}>PROPOSED LOT</Text>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#06C167' }}>
                            ${(msg.offer.offeredPrice * msg.offer.quantity).toFixed(2)}
                          </Text>
                        </View>
                      </View>

                      {msg.offer.status === 'pending' && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              height: 34,
                              borderRadius: 10,
                              backgroundColor: '#06C167',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            onPress={() => respondToOffer(msg.id, 'accept')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark" size={14} color="#000000" />
                            <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#000000' }}>Accept Bid</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              flex: 1,
                              height: 34,
                              borderRadius: 10,
                              backgroundColor: '#DC2626',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            onPress={() => respondToOffer(msg.id, 'decline')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="close" size={14} color="#FFFFFF" />
                            <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#FFFFFF' }}>Decline</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}

              <View style={styles.replyRow}>
                <TextInput
                  style={[
                    styles.replyInput,
                    isDark && {
                      backgroundColor: '#262626',
                      color: '#FFFFFF',
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                  ]}
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Send direct reply to buyer..."
                  placeholderTextColor={isDark ? '#9CA3AF' : '#8E8E93'}
                />
                <TouchableOpacity onPress={handleSendFarmerReply} style={styles.sendBtn}>
                  <Ionicons name="send" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </AgriCard>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <CropFormModal
        visible={showCropModal}
        produceToEdit={editingProduce}
        onClose={() => {
          setShowCropModal(false);
          setEditingProduce(null);
        }}
        onSave={data => {
          if (editingProduce) {
            updateProduce({ ...data, id: editingProduce.id });
          } else {
            addProduce({
              ...data,
              farmerName: userProfile.name || 'Mateo Gutierrez',
              farmerPhone: userProfile.phone || '+1 (555) 234-7890',
            });
          }
        }}
      />

      <UpdateOrderStatusModal
        visible={selectedTx !== null}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdate={(id, status) => updateOrderStatus(id, status)}
      />

      {/* Official Uber Bottom Navigation Bar with Sliding Bubble Animation */}
      <UberBottomNavBar activeTab="services" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasBackground,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  backChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
  },
  backLabel: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.10)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  largeTitleSection: {
    marginVertical: 8,
  },
  largeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.earthTextPrimary,
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 12,
    color: colors.earthTextSecondary,
    marginTop: 1,
  },
  summaryCard: {
    padding: 14,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.earthTextSecondary,
    fontWeight: '500',
  },
  summaryBigVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.earthTextPrimary,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  advantagePill: {
    backgroundColor: colors.mintContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  advantagePillText: {
    color: colors.mintText,
    fontSize: 11,
    fontWeight: '700',
  },
  summarySub: {
    fontSize: 11.5,
    color: colors.earthTextSecondary,
    lineHeight: 16,
    marginTop: 6,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
    marginLeft: 2,
  },
  produceCard: {
    marginBottom: 10,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  orderThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.earthTextPrimary,
    letterSpacing: -0.2,
  },
  cropCategory: {
    fontSize: 11.5,
    color: colors.earthTextMuted,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.earthTextMuted,
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
  },
  unitVal: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.earthTextSecondary,
  },
  retailVal: {
    fontSize: 12,
    color: colors.earthTextMuted,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  stockVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.earthTextPrimary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.canvasBorder,
  },
  cropDesc: {
    fontSize: 11.5,
    color: colors.earthTextSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 30,
    borderRadius: 15,
    backdropFilter: 'blur(12px)' as any,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forestGreenPrimary,
  },
  orderCard: {
    marginBottom: 10,
    padding: 12,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.earthTextPrimary,
  },
  orderCode: {
    fontSize: 11,
    color: colors.earthTextMuted,
  },
  orderGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderGridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.earthTextMuted,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.earthTextPrimary,
    marginTop: 2,
  },
  deliveryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 13,
    color: colors.earthTextSecondary,
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '85%',
  },
  bubbleFarmer: {
    backgroundColor: colors.mintContainer,
    alignSelf: 'flex-end',
  },
  bubbleBuyer: {
    backgroundColor: '#F2F2F7',
    alignSelf: 'flex-start',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 12,
  },
  bubbleSender: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreenPrimary,
  },
  bubbleTime: {
    fontSize: 10,
    color: colors.earthTextMuted,
  },
  bubbleContent: {
    fontSize: 14,
    color: colors.earthTextPrimary,
    lineHeight: 19,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forestGreenPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherCard: {
    marginTop: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  weatherHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitleCol: {
    flex: 1,
  },
  weatherClusterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  weatherMainTemp: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.appleDark,
    marginTop: 2,
  },
  weatherConditionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.earthTextSecondary,
  },
  weatherSunCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 10,
  },
  weatherMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricTitle: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
  },
  metricStatusGood: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  metricColDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignSelf: 'center',
  },
  fulfillmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  fulfillmentBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  fulfillmentVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.appleDark,
  },
  fulfillmentLabel: {
    fontSize: 11,
    color: colors.earthTextSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
} as any);
