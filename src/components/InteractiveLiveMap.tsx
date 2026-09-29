import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';

interface InteractiveLiveMapProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

interface Waypoint {
  id: string;
  name: string;
  type: 'farm' | 'hub' | 'delivery';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  time: string;
  status: 'passed' | 'current' | 'upcoming';
  desc: string;
}

export const InteractiveLiveMap: React.FC<InteractiveLiveMapProps> = ({
  visible,
  onClose,
  transaction,
}) => {
  const { themeMode, showToast } = useApp();
  const isDark = themeMode === 'dark';

  // Animation values
  const progressAnim = useRef(new Animated.Value(0.25)).current;
  const radarWave = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.7)).current;
  const pulseDot = useRef(new Animated.Value(1)).current;

  // State
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [tempCelsius, setTempCelsius] = useState<number>(3.6);
  const [speedKmh, setSpeedKmh] = useState<number>(42);
  const [batteryLevel, setBatteryLevel] = useState<number>(84);
  const [currentProgressVal, setCurrentProgressVal] = useState<number>(0.25);

  const waypoints: Waypoint[] = [
    {
      id: 'wp-1',
      name: transaction?.farmerName ? `${transaction.farmerName} Farm` : 'Highland Organics Farm Gate',
      type: 'farm',
      x: 12,
      y: 72,
      time: '08:15 AM',
      status: currentProgressVal >= 0.1 ? 'passed' : 'upcoming',
      desc: 'Quality inspection & sterile crate loading complete',
    },
    {
      id: 'wp-2',
      name: 'Regional Agri-Cold Hub #4',
      type: 'hub',
      x: 48,
      y: 38,
      time: '09:20 AM',
      status: currentProgressVal >= 0.5 ? 'passed' : currentProgressVal >= 0.25 ? 'current' : 'upcoming',
      desc: 'Refrigeration temp check (3.6°C) & route optimization',
    },
    {
      id: 'wp-3',
      name: transaction?.deliveryAddress || '144 Harvest Way, Apt 3B',
      type: 'delivery',
      x: 88,
      y: 22,
      time: '09:45 AM (Est)',
      status: currentProgressVal >= 0.9 ? 'passed' : 'upcoming',
      desc: 'Final doorstep delivery inspection & handover PIN validation',
    },
  ];

  useEffect(() => {
    if (!visible) return;

    // Track animated value for state
    const id = progressAnim.addListener(({ value }) => {
      setCurrentProgressVal(value);
      // Fluctuate telemetry values dynamically
      setSpeedKmh(Math.round(38 + Math.sin(value * 20) * 8));
      setTempCelsius(Number((3.4 + Math.sin(value * 15) * 0.4).toFixed(1)));
    });

    // Animate moving vehicle along route
    const baseDuration = 14000 / playbackSpeed;
    const moveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 0.95,
          duration: baseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(1200),
        Animated.timing(progressAnim, {
          toValue: 0.12,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    moveLoop.start();

    // Radar pulse wave
    const radarLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(radarWave, {
          toValue: 2.4,
          duration: 1400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(radarOpacity, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    radarLoop.start();

    // Live dot pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDot, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseDot, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      progressAnim.removeListener(id);
      moveLoop.stop();
      radarLoop.stop();
      pulseLoop.stop();
    };
  }, [visible, playbackSpeed]);

  const handleCallDriver = () => {
    Linking.openURL('tel:+15559876543').catch(() => {
      Alert.alert('Courier Contact', 'Driver: Nuwan K.\nPhone: +1 (555) 987-6543');
    });
  };

  const handleMessageDriver = () => {
    showToast('Driver notified: "Buyer is awaiting delivery"', 'info');
  };

  // Interpolated Coordinates for vehicle curve
  const truckX = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['10%', '50%', '88%'],
  });

  const truckY = progressAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: ['74%', '42%', '30%', '20%'],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#FFFFFF'}
        />

        {/* Top Control Header */}
        <View style={[styles.topHeader, isDark ? styles.borderDark : styles.borderLight]}>
          <TouchableOpacity onPress={onClose} style={[styles.backBtn, isDark && styles.backBtnDark]}>
            <Ionicons name="close" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.liveTagRow}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseDot }] }]} />
              <Text style={styles.liveTagText}>LIVE DISPATCH RADAR</Text>
            </View>
            <Text style={[styles.headerTitle, isDark && styles.textWhite]}>
              {transaction?.produceName || 'Active Farm Harvest'}
            </Text>
          </View>

          {/* Speed Multiplier Pill */}
          <TouchableOpacity
            style={[styles.speedToggleBtn, isDark && styles.speedToggleBtnDark]}
            onPress={() => {
              const nextSpeed = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 4 : 1;
              setPlaybackSpeed(nextSpeed);
              showToast(`Simulation speed: ${nextSpeed}x`, 'info');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="speedometer-outline" size={13} color="#06C167" />
            <Text style={styles.speedToggleText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
        </View>

        {/* Real-time Telemetry Status Ribbon */}
        <View style={[styles.telemetryBar, isDark ? styles.telemetryBarDark : styles.telemetryBarLight]}>
          <View style={styles.telemetryItem}>
            <Ionicons name="snow" size={14} color="#0284C7" />
            <Text style={[styles.telemetryVal, isDark && styles.textWhite]}>{tempCelsius}°C</Text>
            <Text style={styles.telemetrySub}>Cargo Chilled</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <MaterialCommunityIcons name="speedometer" size={15} color="#06C167" />
            <Text style={[styles.telemetryVal, isDark && styles.textWhite]}>{speedKmh} km/h</Text>
            <Text style={styles.telemetrySub}>Fleet Speed</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Ionicons name="battery-charging" size={15} color="#10B981" />
            <Text style={[styles.telemetryVal, isDark && styles.textWhite]}>{batteryLevel}%</Text>
            <Text style={styles.telemetrySub}>EV Battery</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Ionicons name="time-outline" size={15} color="#F59E0B" />
            <Text style={[styles.telemetryVal, { color: '#F59E0B' }]}>12 min</Text>
            <Text style={styles.telemetrySub}>Est. Arrival</Text>
          </View>
        </View>

        {/* Map Canvas */}
        <View style={[styles.mapViewport, isDark ? styles.mapViewportDark : styles.mapViewportLight]}>
          {/* Topographic and Road Grid lines */}
          <View style={styles.gridLineH1} />
          <View style={styles.gridLineH2} />
          <View style={styles.gridLineH3} />
          <View style={styles.gridLineV1} />
          <View style={styles.gridLineV2} />

          {/* Road Network Paths */}
          {/* Main Transit Highway */}
          <View style={styles.highwayBase} />
          <View style={styles.highwayActive} />

          {/* Secondary Arterial Roads */}
          <View style={styles.secondaryRoad1} />
          <View style={styles.secondaryRoad2} />

          {/* Waypoints */}
          {waypoints.map(wp => {
            const isSelected = selectedWaypoint?.id === wp.id;
            return (
              <TouchableOpacity
                key={wp.id}
                onPress={() => setSelectedWaypoint(wp)}
                style={[
                  styles.waypointMarker,
                  { left: `${wp.x}%`, top: `${wp.y}%` },
                  wp.type === 'farm' && styles.waypointFarm,
                  wp.type === 'hub' && styles.waypointHub,
                  wp.type === 'delivery' && styles.waypointDelivery,
                  isSelected && styles.waypointSelected,
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    wp.type === 'farm'
                      ? 'leaf'
                      : wp.type === 'hub'
                      ? 'business'
                      : 'home'
                  }
                  size={14}
                  color="#FFFFFF"
                />
                {/* Waypoint Label Bubble */}
                <View style={[styles.waypointTag, isDark && styles.waypointTagDark]}>
                  <Text style={[styles.waypointTagText, isDark && styles.textWhite]} numberOfLines={1}>
                    {wp.type === 'farm' ? 'Farm' : wp.type === 'hub' ? 'Hub #4' : 'Dest'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Moving Cold-Chain Van with Radar Pulse */}
          <Animated.View
            style={[
              styles.movingVehicleContainer,
              {
                left: truckX,
                top: truckY,
              },
            ]}
          >
            {/* Animated Pulsing Radar Ring */}
            <Animated.View
              style={[
                styles.radarPulseRing,
                {
                  transform: [{ scale: radarWave }],
                  opacity: radarOpacity,
                },
              ]}
            />

            {/* Vehicle Icon Badge */}
            <View style={styles.vehicleBubble}>
              <Ionicons name="car" size={16} color="#FFFFFF" />
            </View>

            {/* Vehicle Live Callout */}
            <View style={styles.vehicleCallout}>
              <View style={styles.calloutDot} />
              <Text style={styles.vehicleCalloutText}>Cold Van #EV-409</Text>
            </View>
          </Animated.View>

          {/* Selected Waypoint Info Callout (Floating on map) */}
          {selectedWaypoint && (
            <View style={[styles.waypointCardOverlay, isDark && styles.cardDark]}>
              <View style={styles.waypointCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Ionicons
                    name={
                      selectedWaypoint.type === 'farm'
                        ? 'leaf'
                        : selectedWaypoint.type === 'hub'
                        ? 'business'
                        : 'location'
                    }
                    size={16}
                    color="#06C167"
                  />
                  <Text style={[styles.waypointCardTitle, isDark && styles.textWhite]} numberOfLines={1}>
                    {selectedWaypoint.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedWaypoint(null)}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.waypointCardDesc}>{selectedWaypoint.desc}</Text>
              <View style={styles.waypointCardMeta}>
                <Text style={styles.waypointTimeText}>Scheduled: {selectedWaypoint.time}</Text>
                <View style={[styles.waypointStatusBadge, { backgroundColor: selectedWaypoint.status === 'passed' ? '#10B981' : '#F59E0B' }]}>
                  <Text style={styles.waypointStatusBadgeText}>
                    {selectedWaypoint.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Driver Profile & Action Card */}
        <View style={[styles.driverSheet, isDark ? styles.driverSheetDark : styles.driverSheetLight]}>
          <View style={styles.driverRow}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.driverAvatar}
            />

            <View style={styles.driverInfoCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.driverName, isDark && styles.textWhite]}>Nuwan K. (Courier)</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.96</Text>
                </View>
              </View>
              <Text style={styles.driverSubText}>
                Toyota Hilux EV Cold-Chain • <Text style={{ color: '#06C167', fontWeight: '700' }}>#GA-8921</Text>
              </Text>
              <Text style={styles.driverSafetyText}>
                ✓ Certified Agro-Logistics • Cold Insulated Sealed Cargo
              </Text>
            </View>

            {/* Quick Handover PIN Reminder */}
            {transaction?.handoverPin && (
              <View style={styles.pinReminderBox}>
                <Text style={styles.pinReminderLabel}>PIN CODE</Text>
                <Text style={styles.pinReminderCode}>{transaction.handoverPin}</Text>
              </View>
            )}
          </View>

          {/* Action Button Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.callBtn]}
              onPress={handleCallDriver}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.callBtnText}>Call Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, isDark ? styles.msgBtnDark : styles.msgBtnLight]}
              onPress={handleMessageDriver}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.msgBtnText, isDark && styles.textWhite]}>Direct Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, isDark ? styles.pinBtnDark : styles.pinBtnLight]}
              onPress={() => {
                showToast(
                  `Inspect harvest upon arrival and provide PIN ${transaction?.handoverPin || '7824'} to release escrow`,
                  'success'
                );
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark" size={16} color="#06C167" />
              <Text style={[styles.pinBtnText, { color: '#06C167' }]}>Escrow Safe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#0A0A0A',
  },
  bgLight: {
    backgroundColor: '#F9FAFB',
  },
  borderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderLight: {
    borderBottomColor: '#E5E7EB',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Top Bar
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: '#262626',
  },
  headerCenter: {
    alignItems: 'center',
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    marginTop: 2,
  },
  speedToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 193, 103, 0.25)',
  },
  speedToggleBtnDark: {
    backgroundColor: 'rgba(6, 193, 103, 0.18)',
  },
  speedToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06C167',
  },

  // Telemetry Bar
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  telemetryBarDark: {
    backgroundColor: '#121214',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  telemetryBarLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
    marginTop: 2,
  },
  telemetrySub: {
    fontSize: 9.5,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },

  // Map Canvas Viewport
  mapViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapViewportDark: {
    backgroundColor: '#0F172A',
  },
  mapViewportLight: {
    backgroundColor: '#E2E8F0',
  },

  // Road lines
  gridLineH1: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineH2: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineH3: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Highways
  highwayBase: {
    position: 'absolute',
    top: '45%',
    left: '8%',
    right: '8%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 5,
    transform: [{ rotate: '-18deg' }],
  },
  highwayActive: {
    position: 'absolute',
    top: '46%',
    left: '8%',
    right: '25%',
    height: 6,
    backgroundColor: '#06C167',
    borderRadius: 3,
    transform: [{ rotate: '-18deg' }],
  },
  secondaryRoad1: {
    position: 'absolute',
    top: '65%',
    left: '12%',
    width: 120,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    transform: [{ rotate: '42deg' }],
  },
  secondaryRoad2: {
    position: 'absolute',
    top: '28%',
    right: '15%',
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    transform: [{ rotate: '-35deg' }],
  },

  // Waypoints
  waypointMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  waypointFarm: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  waypointHub: {
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  waypointDelivery: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#06C167',
  },
  waypointSelected: {
    transform: [{ scale: 1.25 }],
  },
  waypointTag: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  waypointTagDark: {
    backgroundColor: '#1C1C1E',
  },
  waypointTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },

  // Moving Vehicle
  movingVehicleContainer: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(6, 193, 103, 0.35)',
    borderWidth: 1.5,
    borderColor: '#06C167',
  },
  vehicleBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  vehicleCallout: {
    position: 'absolute',
    top: -22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  calloutDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#06C167',
  },
  vehicleCalloutText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Overlay Card
  waypointCardOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  waypointCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  waypointCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  waypointCardDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  waypointCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waypointTimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  waypointStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  waypointStatusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Driver Sheet Bottom
  driverSheet: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  driverSheetDark: {
    backgroundColor: '#141414',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
  },
  driverSheetLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  driverInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#000000',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  driverSubText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  driverSafetyText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pinReminderBox: {
    backgroundColor: '#1E1E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pinReminderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  pinReminderCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34D399',
    marginTop: 2,
  },

  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callBtn: {
    backgroundColor: '#06C167',
  },
  callBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  msgBtnLight: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  msgBtnDark: {
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  msgBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#000000',
  },
  pinBtnLight: {
    backgroundColor: 'rgba(6, 193, 103, 0.1)',
  },
  pinBtnDark: {
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
  },
  pinBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
});
