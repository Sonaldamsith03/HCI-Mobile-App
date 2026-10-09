import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REGIONAL_STALLS } from '@/data/farmData';
import { useFarm } from '@/context/FarmContext';

export default function MapViewScreen() {
  const { setRadiusText, showToast } = useFarm();
  const [selectedStallId, setSelectedStallId] = useState(REGIONAL_STALLS[0].id);
  const [selectedRadius, setSelectedRadius] = useState('15 mi');

  const selectedStall =
    REGIONAL_STALLS.find((s) => s.id === selectedStallId) || REGIONAL_STALLS[0];

  const RADIUS_OPTIONS = ['5 mi', '15 mi', '30 mi'];

  const PINS = [
    { id: 'meadowview-homestead', name: 'Meadowview', top: '35%', left: '42%', active: selectedStallId === 'meadowview-homestead' },
    { id: 'oakridge-farm', name: 'Oakridge', top: '55%', left: '60%', active: selectedStallId === 'oakridge-farm' },
    { id: 'green-acres-eco', name: 'Green Acres', top: '25%', left: '72%', active: selectedStallId === 'green-acres-eco' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <Text style={styles.headerTitle}>Regional Farm Map</Text>

        <Pressable
          style={styles.circleBtn}
          onPress={() => showToast('Recalibrating GPS location in Kaluthara...')}>
          <Ionicons name="locate" size={19} color="#15803D" />
        </Pressable>
      </View>

      {/* Radius Selector Pills */}
      <View style={styles.radiusBar}>
        <Text style={styles.radiusLabel}>Search Radius:</Text>
        <View style={styles.radiusPills}>
          {RADIUS_OPTIONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.rPill, selectedRadius === r && styles.rPillActive]}
              onPress={() => {
                setSelectedRadius(r);
                setRadiusText(`Green Valley • Within ${r}`);
                showToast(`Radius set to ${r}`);
              }}>
              <Text style={[styles.rPillText, selectedRadius === r && styles.rPillTextActive]}>
                Within {r}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Visual Map Canvas */}
      <View style={styles.mapContainer}>
        {/* Decorative Map Features */}
        <View style={styles.riverPath} />
        <View style={styles.plotArea1}>
          <Text style={styles.plotText}>Plot 1-4 • Organic Belt</Text>
        </View>
        <View style={styles.plotArea2}>
          <Text style={styles.plotText}>Plot 8-12 • Valley Basin</Text>
        </View>

        {/* User Location Marker */}
        <View style={styles.userMarker}>
          <View style={styles.userPulse} />
          <View style={styles.userCenterDot} />
          <View style={styles.userLabelBubble}>
            <Text style={styles.userLabelText}>You (Kaluthara)</Text>
          </View>
        </View>

        {/* Stall Pins */}
        {PINS.map((pin) => (
          <Pressable
            key={pin.id}
            style={[styles.pinWrapper, { top: pin.top as any, left: pin.left as any }]}
            onPress={() => setSelectedStallId(pin.id)}>
            <View style={[styles.pinBubble, pin.active && styles.pinBubbleActive]}>
              <MaterialCommunityIcons
                name="tractor"
                size={14}
                color={pin.active ? '#FFFFFF' : '#15803D'}
              />
              <Text style={[styles.pinText, pin.active && styles.pinTextActive]}>
                {pin.name}
              </Text>
            </View>
            <View style={[styles.pinArrow, pin.active && styles.pinArrowActive]} />
          </Pressable>
        ))}
      </View>

      {/* Bottom Floating Stall Card */}
      <View style={styles.bottomCardContainer}>
        <View style={styles.stallCard}>
          <Image
            source={selectedStall.image}
            style={styles.stallImage}
            contentFit="cover"
          />

          <View style={styles.stallInfo}>
            <View style={styles.stallTopRow}>
              <Text style={styles.stallName}>{selectedStall.name}</Text>
              <Ionicons name="checkmark-circle" size={15} color="#15803D" />
            </View>

            <Text style={styles.stallDistance}>
              ★ {selectedStall.rating.toFixed(1)} • {selectedStall.distance} away
            </Text>

            <Text style={styles.stallLots}>
              {selectedStall.activeLots} active lots ready for pickup
            </Text>

            <View style={styles.actionBtnRow}>
              <Pressable
                style={styles.visitBtn}
                onPress={() => router.push(`/farm/${selectedStall.id}` as any)}>
                <Text style={styles.visitBtnText}>Visit Farm Stall</Text>
              </Pressable>

              <Pressable
                style={styles.chatMiniBtn}
                onPress={() => router.push(`/chat/${selectedStall.id}` as any)}>
                <Ionicons name="chatbubble-outline" size={15} color="#15803D" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  radiusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAFAF9',
    gap: 8,
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  radiusPills: {
    flexDirection: 'row',
    gap: 6,
  },
  rPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  rPillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  rPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  rPillTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  riverPath: {
    position: 'absolute',
    top: -50,
    right: 80,
    width: 90,
    height: 800,
    backgroundColor: '#BAE6FD',
    transform: [{ rotate: '25deg' }],
    opacity: 0.7,
  },
  plotArea1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
  },
  plotArea2: {
    position: 'absolute',
    bottom: '25%',
    right: '8%',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
  },
  plotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  userMarker: {
    position: 'absolute',
    top: '68%',
    left: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    position: 'absolute',
  },
  userCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  userLabelBubble: {
    position: 'absolute',
    top: 20,
    backgroundColor: '#1E293B',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  userLabelText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#15803D',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pinBubbleActive: {
    backgroundColor: '#15803D',
    borderColor: '#14532D',
  },
  pinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  pinTextActive: {
    color: '#FFFFFF',
  },
  pinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#15803D',
    marginTop: -1,
  },
  pinArrowActive: {
    borderTopColor: '#14532D',
  },
  bottomCardContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  stallCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  stallImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  stallInfo: {
    flex: 1,
  },
  stallTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stallName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  stallDistance: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
    marginVertical: 2,
  },
  stallLots: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  visitBtn: {
    flex: 1,
    backgroundColor: '#15803D',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chatMiniBtn: {
    width: 36,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
