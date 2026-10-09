import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFarm } from '@/context/FarmContext';
import { CATEGORIES } from '@/data/farmData';

export default function FilterModalScreen() {
  const { selectedCategory, setSelectedCategory, setSelectedFilter, showToast } =
    useFarm();

  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory);
  const [selectedRadius, setSelectedRadius] = useState('15 miles');
  const [selectedFreshness, setSelectedFreshness] = useState('Today at Dawn');
  const [organicOnly, setOrganicOnly] = useState(true);
  const [directDelivery, setDirectDelivery] = useState(true);

  const handleApply = () => {
    setSelectedCategory(activeCategory);
    if (organicOnly) {
      setSelectedFilter('organic');
    } else {
      setSelectedFilter('all');
    }
    showToast('Filters applied successfully!');
    router.back();
  };

  const handleReset = () => {
    setActiveCategory(null);
    setSelectedCategory(null);
    setSelectedFilter('all');
    setOrganicOnly(false);
    showToast('Filters reset to default.');
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

        <Text style={styles.headerTitle}>Filter Fresh Harvests</Text>

        <Pressable onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Categories</Text>
          <View style={styles.wrapGrid}>
            <Pressable
              style={[styles.pill, activeCategory === null && styles.pillActive]}
              onPress={() => setActiveCategory(null)}>
              <Text
                style={[styles.pillText, activeCategory === null && styles.pillTextActive]}>
                All Categories
              </Text>
            </Pressable>

            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.pill,
                  activeCategory === cat.id && styles.pillActive,
                ]}
                onPress={() => setActiveCategory(cat.id)}>
                <Text
                  style={[
                    styles.pillText,
                    activeCategory === cat.id && styles.pillTextActive,
                  ]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Harvest Freshness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Harvest Freshness</Text>
          <View style={styles.wrapGrid}>
            {['Today at Dawn', 'Last 4 Hours', 'Harvested Yesterday', 'Anytime'].map(
              (f) => (
                <Pressable
                  key={f}
                  style={[styles.pill, selectedFreshness === f && styles.pillActive]}
                  onPress={() => setSelectedFreshness(f)}>
                  <Text
                    style={[
                      styles.pillText,
                      selectedFreshness === f && styles.pillTextActive,
                    ]}>
                    {f}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </View>

        {/* Distance Radius */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Distance</Text>
          <View style={styles.wrapGrid}>
            {['5 miles', '15 miles', '25 miles', '50 miles'].map((r) => (
              <Pressable
                key={r}
                style={[styles.pill, selectedRadius === r && styles.pillActive]}
                onPress={() => setSelectedRadius(r)}>
                <Text
                  style={[
                    styles.pillText,
                    selectedRadius === r && styles.pillTextActive,
                  ]}>
                  Within {r}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Organic Certification Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farming Standards</Text>

          <Pressable
            style={styles.toggleRow}
            onPress={() => setOrganicOnly((prev) => !prev)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>100% Certified Organic Only</Text>
              <Text style={styles.toggleSub}>
                Strictly zero chemical pesticides or artificial fertilizers
              </Text>
            </View>
            <View
              style={[styles.checkbox, organicOnly && styles.checkboxActive]}>
              {organicOnly && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.toggleRow}
            onPress={() => setDirectDelivery((prev) => !prev)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Direct Farm Dispatch Ready</Text>
              <Text style={styles.toggleSub}>
                Crops packed immediately after morning cut
              </Text>
            </View>
            <View
              style={[styles.checkbox, directDelivery && styles.checkboxActive]}>
              {directDelivery && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer Submit Button */}
      <View style={styles.footer}>
        <Pressable
          style={styles.applyBtn}
          onPress={handleApply}
          accessibilityRole="button"
          accessibilityLabel="Apply filters">
          <Text style={styles.applyBtnText}>Apply Filters (18 Plots)</Text>
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
  resetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
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
    gap: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  wrapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  pillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  applyBtn: {
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
