import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFarm } from '@/context/FarmContext';

interface Hub {
  id: string;
  name: string;
  region: string;
  plots: number;
  distance: string;
}

const HUBS: Hub[] = [
  { id: 'kaluthara', name: 'Kaluthara', region: 'Western Province', plots: 18, distance: 'Current Location' },
  { id: 'green-valley', name: 'Green Valley', region: 'Kaluthara Basin', plots: 12, distance: '3.4 mi' },
  { id: 'panadura', name: 'Panadura', region: 'Coastline Hub', plots: 14, distance: '8.2 mi' },
  { id: 'bentota', name: 'Bentota Valley', region: 'Southern Gateway', plots: 16, distance: '14.5 mi' },
  { id: 'colombo-south', name: 'Colombo South', region: 'Urban Peri-farms', plots: 22, distance: '21.0 mi' },
];

export default function LocationModalScreen() {
  const { location, setLocation, setRadiusText, showToast } = useFarm();

  const [selectedHub, setSelectedHub] = useState(location);
  const [selectedRadius, setSelectedRadius] = useState('15 miles');

  const handleSave = () => {
    setLocation(selectedHub);
    setRadiusText(`${selectedHub === 'Kaluthara' ? 'Green Valley' : selectedHub} • Within ${selectedRadius}`);
    showToast(`Regional hub updated to ${selectedHub} (Within ${selectedRadius})`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Ionicons name="close" size={20} color="#0F172A" />
        </Pressable>

        <Text style={styles.headerTitle}>Select Regional Hub</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Available Regional Hubs</Text>
        <Text style={styles.sectionSub}>
          Crops are dispatched within 2 hours of sunrise harvest from plots in these hubs.
        </Text>

        <View style={styles.hubsList}>
          {HUBS.map((hub) => {
            const isSelected = selectedHub === hub.name;
            return (
              <Pressable
                key={hub.id}
                style={[styles.hubCard, isSelected && styles.hubCardSelected]}
                onPress={() => setSelectedHub(hub.name)}>
                <View style={styles.hubIcon}>
                  <Ionicons
                    name="location-sharp"
                    size={20}
                    color={isSelected ? '#15803D' : '#64748B'}
                  />
                </View>

                <View style={styles.hubInfo}>
                  <Text style={[styles.hubName, isSelected && styles.hubNameSelected]}>
                    {hub.name}
                  </Text>
                  <Text style={styles.hubRegion}>
                    {hub.region} • {hub.plots} regional plots
                  </Text>
                </View>

                <View style={styles.hubRight}>
                  <Text style={styles.hubDist}>{hub.distance}</Text>
                  <View
                    style={[styles.radioCircle, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Search Radius */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
          Harvest Search Radius
        </Text>

        <View style={styles.radiusRow}>
          {['5 miles', '15 miles', '25 miles', '50 miles'].map((r) => {
            const isSelected = selectedRadius === r;
            return (
              <Pressable
                key={r}
                style={[styles.radiusBtn, isSelected && styles.radiusBtnActive]}
                onPress={() => setSelectedRadius(r)}>
                <Text
                  style={[
                    styles.radiusBtnText,
                    isSelected && styles.radiusBtnTextActive,
                  ]}>
                  Within {r}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable
          style={styles.saveBtn}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save location">
          <Text style={styles.saveBtnText}>Save Regional Hub</Text>
        </Pressable>
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  contentContainer: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 17,
  },
  hubsList: {
    gap: 10,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  hubCardSelected: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  hubIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubInfo: {
    flex: 1,
  },
  hubName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  hubNameSelected: {
    color: '#15803D',
  },
  hubRegion: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  hubRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  hubDist: {
    fontSize: 11,
    color: '#64748B',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#15803D',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#15803D',
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  radiusBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radiusBtnActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  radiusBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  radiusBtnTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
