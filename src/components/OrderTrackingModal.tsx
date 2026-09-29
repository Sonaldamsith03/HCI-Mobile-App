import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Transaction, OrderStatus } from '../types';
import { StatusBadge } from './Badges';
import { SecondaryButton } from './Buttons';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';
import { useApp } from '../context/AppContext';

interface OrderTrackingModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  cropImage?: string;
}

// Pulsing ring for the active step
const PulseRing: React.FC<{ color: string }> = ({ color }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.85, duration: 900, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// Animated step row — slides in from left with fade
const AnimatedStep: React.FC<{
  delay: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  currentIdx: number;
  stepIdx: number;
  isDark?: boolean;
}> = ({ delay, isCompleted, isCurrent, isLast, icon, label, desc, currentIdx, stepIdx, isDark }) => {
  const translateX = useRef(new Animated.Value(-28)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        delay,
        damping: 18,
        stiffness: 260,
        mass: 0.9,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const circleColor = isCurrent ? '#D97706' : isCompleted ? colors.forestGreenPrimary : (isDark ? '#2C2C2E' : '#E5E7EB');
  const lineCompleted = stepIdx < currentIdx;

  return (
    <Animated.View style={[styles.timelineStep, { opacity: fadeAnim, transform: [{ translateX }] }]}>
      <View style={styles.stepLeft}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {isCurrent && <PulseRing color="#D97706" />}
          <View style={[styles.stepIconCircle, { backgroundColor: circleColor }]}>
            <Ionicons name={icon} size={13} color={isCompleted ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#8E8E93')} />
          </View>
        </View>
        {!isLast && (
          <View
            style={[
              styles.stepLine,
              isDark && { backgroundColor: 'rgba(255,255,255,0.1)' },
              lineCompleted && styles.stepLineCompleted,
            ]}
          />
        )}
      </View>

      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepTitle,
            isCompleted && !isCurrent && [styles.stepTitleCompleted, isDark && { color: '#FFFFFF' }],
            isCurrent && styles.stepTitleCurrent,
            !isCompleted && !isCurrent && isDark && { color: '#6B7280' },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.stepDesc, isDark && { color: '#9CA3AF' }]}>{desc}</Text>
      </View>
    </Animated.View>
  );
};

// Animated PIN digit
const AnimatedPinDigit: React.FC<{ char: string; delay: number }> = ({ char, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        delay,
        damping: 10,
        stiffness: 340,
        mass: 0.7,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        delay,
        damping: 14,
        stiffness: 280,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.pinDigitBox,
        { transform: [{ scale }, { translateY }] },
      ]}
    >
      <Text style={styles.pinDigitText}>{char}</Text>
    </Animated.View>
  );
};

// Live GPS Courier Map Simulation (Uber-style)
const LiveCourierMap: React.FC<{
  farmerName: string;
  deliveryAddress: string;
  status: OrderStatus;
}> = ({ farmerName, deliveryAddress, status }) => {
  const truckProgress = useRef(new Animated.Value(0.18)).current;
  const radarWave = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;
  const [instruction, setInstruction] = React.useState<string | null>(null);

  useEffect(() => {
    // Truck movement animation loop
    const moveAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(truckProgress, {
          toValue: 0.82,
          duration: 3800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(900),
        Animated.timing(truckProgress, {
          toValue: 0.18,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    moveAnim.start();

    // Pulsing radar wave
    const radarAnim = Animated.loop(
      Animated.parallel([
        Animated.timing(radarWave, {
          toValue: 2.3,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(radarOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    radarAnim.start();

    return () => {
      moveAnim.stop();
      radarAnim.stop();
    };
  }, []);

  return (
    <View style={styles.mapCard}>
      {/* ETA Banner */}
      <View style={styles.mapEtaBanner}>
        <View style={styles.etaDotRow}>
          <View style={styles.liveGreenDot} />
          <Text style={styles.mapEtaText}>Arriving in 14 mins</Text>
        </View>
        <Text style={styles.mapDistanceText}>3.2 km away • Cold-Chain Direct</Text>
      </View>

      {/* Simulated Road Canvas */}
      <View style={styles.roadCanvas}>
        {/* Road grid pattern */}
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />

        {/* Route line */}
        <View style={styles.routePathBase} />
        <View style={styles.routePathHighlight} />

        {/* Origin Farm Pin */}
        <View style={styles.originPin}>
          <Ionicons name="leaf" size={12} color="#06C167" />
          <View style={styles.pinCallout}>
            <Text style={styles.pinCalloutText}>Farm Gate</Text>
          </View>
        </View>

        {/* Animated Moving Truck */}
        <Animated.View
          style={[
            styles.movingTruckWrapper,
            {
              left: truckProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['10%', '82%'],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.radarWave,
              {
                transform: [{ scale: radarWave }],
                opacity: radarOpacity,
              },
            ]}
          />
          <View style={styles.truckBubble}>
            <Ionicons name="car" size={14} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Destination Pin */}
        <View style={styles.destinationPin}>
          <Ionicons name="location" size={14} color="#FFFFFF" />
          <View style={[styles.pinCallout, { right: 0, left: undefined }]}>
            <Text style={styles.pinCalloutText}>Delivery</Text>
          </View>
        </View>
      </View>

      {/* Courier Driver & Vehicle Card */}
      <View style={styles.courierCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }}
          style={styles.courierAvatar}
        />
        <View style={styles.courierInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.courierName}>Nuwan K. (Courier)</Text>
            <View style={styles.courierRatingBadge}>
              <Ionicons name="star" size={10} color="#FFB800" />
              <Text style={styles.courierRatingText}>4.96</Text>
            </View>
          </View>
          <Text style={styles.courierVehicle}>Toyota Hilux Cold-Chain • #GA-8921</Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL('tel:+15552347890')}
          style={styles.courierCallBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={14} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Quick Drop-Off Instruction Chips */}
      <View style={styles.instructionChipsRow}>
        {['Leave at gate', 'Call on arrival', 'Ring doorbell'].map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setInstruction(item === instruction ? null : item)}
            style={[
              styles.instructionChip,
              instruction === item && styles.instructionChipActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.instructionChipText,
                instruction === item && styles.instructionChipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  visible,
  transaction,
  onClose,
  cropImage,
}) => {
  let isDark = false;
  try {
    const appContext = useApp();
    isDark = appContext?.themeMode === 'dark';
  } catch {
    isDark = false;
  }

  // Modal sheet slide-up
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  // Header fade
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (visible) {
      sheetTranslateY.setValue(300);
      sheetOpacity.setValue(0);
      headerFade.setValue(0);
      headerTranslateY.setValue(12);

      Animated.parallel([
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 300,
          mass: 1,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.spring(headerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 280,
          }),
          Animated.timing(headerFade, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [visible]);

  if (!transaction) return null;

  const steps: { key: OrderStatus; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Confirmed', label: 'Escrow Secured', desc: 'Payment held in institutional escrow vault', icon: 'shield-checkmark' },
    { key: 'Packed at Farm', label: 'Harvested & Packed', desc: 'Crates packed fresh at farm gate', icon: 'cube' },
    { key: 'In Transit', label: 'Courier in Transit', desc: 'Dispatched via Farm-to-Door courier', icon: 'car' },
    { key: 'Delivered', label: 'Delivered & Accepted', desc: 'Handover complete, escrow released to grower', icon: 'checkmark-circle' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed': return 0;
      case 'Packed at Farm': return 1;
      case 'In Transit': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(transaction.status);
  const pin = transaction.handoverPin || '7824';

  const handleCallGrower = () => {
    Linking.openURL(`tel:${transaction.farmerPhone}`).catch(() => {
      Alert.alert('Contact', `Phone: ${transaction.farmerPhone}`);
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            isDark && {
              backgroundColor: '#141414',
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
            },
            {
              transform: [{ translateY: sheetTranslateY }],
              opacity: sheetOpacity,
            },
          ]}
        >
          <View style={[styles.grabber, isDark && { backgroundColor: '#3A3A3C' }]} />

          {/* Animated Header */}
          <Animated.View
            style={[
              styles.modalHeader,
              { opacity: headerFade, transform: [{ translateY: headerTranslateY }] },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image
                source={{ uri: cropImage || DEFAULT_CATEGORY_IMAGES.Vegetables }}
                style={styles.cropThumb}
                resizeMode="cover"
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.orderTitle, isDark && { color: '#FFFFFF' }]}>{transaction.produceName}</Text>
                <Text style={[styles.trackingCode, isDark && { color: '#9CA3AF' }]}>{transaction.trackingCode}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, isDark && { backgroundColor: '#262626' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={isDark ? '#E5E7EB' : colors.earthTextSecondary} />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Escrow Banner */}
            <View style={styles.escrowBanner}>
              <Ionicons name="lock-closed" size={16} color="#059669" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.escrowBannerTitle}>100% Escrow Protected Handover</Text>
                <Text style={styles.escrowBannerSub}>
                  ${transaction.amount.toFixed(2)} is held securely. Funds release only after you provide your 4-digit PIN upon delivery inspection.
                </Text>
              </View>
            </View>

            {/* Live GPS Courier Route & Map View */}
            <LiveCourierMap
              farmerName={transaction.farmerName}
              deliveryAddress={transaction.deliveryAddress}
              status={transaction.status}
            />

            {/* PIN Card with animated digits */}
            <View style={styles.pinCard}>
              <View style={styles.pinCardTop}>
                <View>
                  <Text style={styles.pinLabel}>4-Digit Handover PIN</Text>
                  <Text style={styles.pinSub}>Share with driver after inspecting produce</Text>
                </View>
                <StatusBadge status={transaction.status} />
              </View>

              <View style={styles.pinDigitsRow}>
                {pin.split('').map((char, i) => (
                  <AnimatedPinDigit key={i} char={char} delay={visible ? 350 + i * 80 : 0} />
                ))}
              </View>
            </View>

            {/* Staggered Timeline */}
            <Text style={[styles.sectionHeader, isDark && { color: '#FFFFFF' }]}>Live Dispatch Progression</Text>
            <View style={[styles.timelineContainer, isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 }]}>
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <AnimatedStep
                    key={step.key}
                    delay={visible ? 200 + idx * 90 : 0}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isLast={idx === steps.length - 1}
                    icon={step.icon}
                    label={step.label}
                    desc={step.desc}
                    currentIdx={currentIdx}
                    stepIdx={idx}
                    isDark={isDark}
                  />
                );
              })}
            </View>

            {/* Logistics Card */}
            <View style={[styles.logisticsCard, isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' }]}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={isDark ? '#9CA3AF' : colors.earthTextMuted} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.infoLabel, isDark && { color: '#9CA3AF' }]}>Delivery Destination</Text>
                  <Text style={[styles.infoValue, isDark && { color: '#FFFFFF' }]}>{transaction.deliveryAddress}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <MaterialCommunityIcons name="account-cowboy-hat" size={16} color={colors.forestGreenPrimary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.infoLabel, isDark && { color: '#9CA3AF' }]}>Direct Grower</Text>
                  <Text style={[styles.infoValue, isDark && { color: '#FFFFFF' }]}>{transaction.farmerName} • {transaction.farmerPhone}</Text>
                </View>
                <TouchableOpacity onPress={handleCallGrower} style={styles.callIconBtn} activeOpacity={0.8}>
                  <Ionicons name="call" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <SecondaryButton title="Dismiss" onPress={onClose} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 24,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cropThumb: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  orderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.appleDark,
    letterSpacing: -0.3,
  },
  trackingCode: {
    fontSize: 12,
    color: colors.earthTextMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: 470,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  escrowBannerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#047857',
  },
  escrowBannerSub: {
    fontSize: 11,
    color: '#065F46',
    marginTop: 2,
    lineHeight: 15,
  },
  pinCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  pinCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pinSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  pinDigitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  pinDigitBox: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDigitText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: -0.5,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  timelineContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  timelineStep: {
    flexDirection: 'row',
  },
  stepLeft: {
    alignItems: 'center',
    width: 30,
  },
  stepIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    height: 36,
    backgroundColor: '#E5E7EB',
    marginTop: 3,
  },
  stepLineCompleted: {
    backgroundColor: colors.forestGreenPrimary,
  },
  stepContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 22,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.earthTextMuted,
  },
  stepTitleCompleted: {
    color: colors.appleDark,
    fontWeight: '700',
  },
  stepTitleCurrent: {
    color: '#D97706',
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 11,
    color: colors.earthTextSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  logisticsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12.5,
    color: colors.appleDark,
    fontWeight: '600',
    marginTop: 1,
  },
  callIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.forestGreenPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerRow: {
    marginTop: 10,
  },
  // Map Simulation Styles
  mapCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  mapEtaBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  etaDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  mapEtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  mapDistanceText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  roadCanvas: {
    width: '100%',
    height: 90,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  routePathBase: {
    position: 'absolute',
    top: 44,
    left: 24,
    right: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  routePathHighlight: {
    position: 'absolute',
    top: 44,
    left: 24,
    right: 50,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#06C167',
  },
  originPin: {
    position: 'absolute',
    left: 14,
    top: 32,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(6, 193, 103, 0.18)',
    borderWidth: 1.5,
    borderColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationPin: {
    position: 'absolute',
    right: 14,
    top: 32,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCallout: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinCalloutText: {
    color: '#D1D5DB',
    fontSize: 9,
    fontWeight: '700',
  },
  movingTruckWrapper: {
    position: 'absolute',
    top: 28,
    marginLeft: -16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarWave: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(39, 110, 241, 0.35)',
  },
  truckBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#276EF1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#276EF1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  courierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
  },
  courierInfo: {
    flex: 1,
    marginLeft: 10,
  },
  courierName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  courierRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  courierRatingText: {
    color: '#FFB800',
    fontSize: 10.5,
    fontWeight: '700',
  },
  courierVehicle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  courierCallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  instructionChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  instructionChipActive: {
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
    borderColor: '#06C167',
  },
  instructionChipText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  instructionChipTextActive: {
    color: '#06C167',
    fontWeight: '700',
  },
});
