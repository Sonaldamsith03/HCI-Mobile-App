import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FloatingCartBar, FarmToast } from '@/components/FloatingCartBar';
import { useFarm } from '@/context/FarmContext';

export default function OrdersScreen() {
  const { showToast } = useFarm();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Farm Harvest Orders</Text>
        <Text style={styles.headerSubtitle}>Direct from regional farm plots to your door</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Active Order Card */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.activeDot} />
          <Text style={styles.sectionTitle}>Active Dispatch</Text>
        </View>

        <View style={styles.activeOrderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #FB-9021</Text>
              <Text style={styles.orderFarm}>Oakridge Farm • Picked Today</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>En Route</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIconCircle, styles.timelineIconDone]}>
                <Ionicons name="leaf" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextCol}>
                <Text style={styles.timelineTime}>5:30 AM</Text>
                <Text style={styles.timelineDesc}>Harvested at dawn (Dew intact)</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineIconCircle, styles.timelineIconDone]}>
                <Ionicons name="cube" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextCol}>
                <Text style={styles.timelineTime}>6:45 AM</Text>
                <Text style={styles.timelineDesc}>Sorted & packed in eco crates</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineIconCircle, styles.timelineIconActive]}>
                <Ionicons name="bicycle" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextCol}>
                <Text style={styles.timelineTimeNow}>8:15 AM (Live)</Text>
                <Text style={styles.timelineDescNow}>
                  Regional courier en route to Kaluthara (ETA: 35 mins)
                </Text>
              </View>
            </View>
          </View>

          {/* Items in order */}
          <View style={styles.orderItemsDivider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemQty}>2x</Text>
            <Text style={styles.itemName}>Heirloom Vine Tomatoes (1 kg)</Text>
            <Text style={styles.itemPrice}>RS. 400</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemQty}>1x</Text>
            <Text style={styles.itemName}>Sweet Bell Peppers (1 lb)</Text>
            <Text style={styles.itemPrice}>RS. 200</Text>
          </View>

          <View style={styles.cardFooter}>
            <Pressable
              style={styles.trackBtn}
              onPress={() => router.push('/map')}>
              <Ionicons name="navigate-outline" size={14} color="#FFFFFF" />
              <Text style={styles.trackBtnText}>Live Farm Courier Map</Text>
            </Pressable>

            <Pressable
              style={styles.chatFarmerBtn}
              onPress={() => router.push('/chat/oakridge-farm' as any)}>
              <Ionicons name="chatbubble-outline" size={14} color="#15803D" />
              <Text style={styles.chatFarmerBtnText}>Message Farmer</Text>
            </Pressable>
          </View>
        </View>

        {/* Past Orders */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
          Past Harvest Orders
        </Text>

        <View style={styles.pastOrderCard}>
          <View style={styles.pastOrderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #FB-8742</Text>
              <Text style={styles.orderFarm}>Meadowview Homestead • Delivered Oct 6</Text>
            </View>
            <View style={styles.deliveredBadge}>
              <Text style={styles.deliveredBadgeText}>Delivered</Text>
            </View>
          </View>

          <Text style={styles.pastItemsText}>
            1x Artisanal Strawberries, 1x Raw Multi-Flora Forest Honey
          </Text>

          <View style={styles.pastFooter}>
            <Text style={styles.pastTotal}>Total: RS. 1,300</Text>
            <Pressable
              style={styles.reorderBtn}
              onPress={() => showToast('Re-order added to basket!')}>
              <Ionicons name="repeat-outline" size={14} color="#15803D" />
              <Text style={styles.reorderBtnText}>Re-order Harvest</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingCartBar />
      <BottomNavBar currentTab="orders" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderFarm: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '700',
  },
  timeline: {
    paddingLeft: 4,
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconDone: {
    backgroundColor: '#15803D',
  },
  timelineIconActive: {
    backgroundColor: '#EA580C',
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#BBF7D0',
    marginLeft: 11,
    marginVertical: 2,
  },
  timelineTextCol: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 11,
    color: '#64748B',
  },
  timelineDesc: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
  },
  timelineTimeNow: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
  },
  timelineDescNow: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  orderItemsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    width: 28,
  },
  itemName: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
  },
  itemPrice: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  trackBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chatFarmerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  chatFarmerBtnText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  pastOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pastOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deliveredBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  deliveredBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  pastItemsText: {
    fontSize: 12.5,
    color: '#475569',
    marginBottom: 10,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  pastTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
});
