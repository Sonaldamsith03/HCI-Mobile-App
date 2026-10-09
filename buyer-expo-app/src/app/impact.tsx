import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INITIAL_USER } from '@/data/farmData';

export default function EcoImpactScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <Text style={styles.headerTitle}>Your Eco & Farmer Impact</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Hero Impact Circle Card */}
        <View style={styles.heroImpactCard}>
          <View style={styles.co2Badge}>
            <Text style={styles.co2BadgeText}>CO₂</Text>
          </View>
          <Text style={styles.heroImpactNum}>{INITIAL_USER.co2SavedKg} kg</Text>
          <Text style={styles.heroImpactTitle}>Carbon Emissions Averted</Text>
          <Text style={styles.heroImpactSub}>
            By sourcing direct morning crops from Kaluthara smallholders instead of industrial supply chains.
          </Text>
        </View>

        {/* 4 Core Impact Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="bicycle-outline" size={24} color="#15803D" />
            <Text style={styles.metricVal}>380 km</Text>
            <Text style={styles.metricLabel}>Food Miles Saved</Text>
            <Text style={styles.metricSub}>Average farm distance 4.2 mi</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="cash-outline" size={24} color="#0D9488" />
            <Text style={styles.metricVal}>88%</Text>
            <Text style={styles.metricLabel}>Farmer Payout</Text>
            <Text style={styles.metricSub}>Vs 32% in supermarket retail</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="people-outline" size={24} color="#EA580C" />
            <Text style={styles.metricVal}>6 Farms</Text>
            <Text style={styles.metricLabel}>Directly Supported</Text>
            <Text style={styles.metricSub}>Fair family livelihood</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="leaf-outline" size={24} color="#16A34A" />
            <Text style={styles.metricVal}>18 Plots</Text>
            <Text style={styles.metricLabel}>Regenerative Soil</Text>
            <Text style={styles.metricSub}>Zero chemical pesticide runoff</Text>
          </View>
        </View>

        {/* Comparison: Supermarket vs FarmBy */}
        <View style={styles.comparisonCard}>
          <Text style={styles.compTitle}>Supply Chain Comparison</Text>

          <View style={styles.compRow}>
            <View style={styles.compCol}>
              <Text style={styles.compColTitle}>FarmBy Sunrise Dispatch</Text>
              <Text style={styles.compStatGood}>3.5 hours from soil</Text>
              <Text style={styles.compDesc}>Picked at 5:30 AM • Dew intact • 88% to grower</Text>
            </View>
            <View style={styles.compCol}>
              <Text style={styles.compColTitleGray}>Industrial Grocery</Text>
              <Text style={styles.compStatBad}>9-14 days transit</Text>
              <Text style={styles.compDesc}>Synthetic wax • Cold storage • 32% to grower</Text>
            </View>
          </View>
        </View>

        {/* Citizen Steward Pledge */}
        <View style={styles.stewardCard}>
          <Ionicons name="medal-outline" size={24} color="#15803D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.stewardTitle}>Community Harvest Steward</Text>
            <Text style={styles.stewardText}>
              Every order keeps fertile soil in the hands of independent Sri Lankan farming families.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    gap: 16,
  },
  heroImpactCard: {
    backgroundColor: '#14532D',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  co2Badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  co2BadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  heroImpactNum: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroImpactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BBF7D0',
    marginTop: 4,
  },
  heroImpactSub: {
    fontSize: 12.5,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  compRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compCol: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 4,
  },
  compColTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  compColTitleGray: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  compStatGood: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  compStatBad: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  compDesc: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 14,
  },
  stewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  stewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  stewardText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
});
