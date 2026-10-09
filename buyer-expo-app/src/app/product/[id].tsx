import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFarm } from '@/context/FarmContext';
import { ALL_CROPS, HERO_DEAL } from '@/data/farmData';
import { FarmToast } from '@/components/FloatingCartBar';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, isFavorite, toggleFavorite, showToast } = useFarm();

  const [quantity, setQuantity] = useState(1);

  const crop = ALL_CROPS.find((c) => c.id === id) || HERO_DEAL;
  const favorited = isFavorite(crop.id);

  const handleAddToCart = () => {
    addToCart(crop, quantity);
  };

  const handleMakeOffer = () => {
    router.push(`/offer/${crop.id}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {crop.title}
        </Text>

        <View style={styles.headerRightBtns}>
          <Pressable
            style={styles.circleBtn}
            onPress={() => showToast('Share link copied to clipboard!')}>
            <Ionicons name="share-outline" size={19} color="#0F172A" />
          </Pressable>

          <Pressable
            style={[styles.circleBtn, favorited && styles.favBtnActive]}
            onPress={() => toggleFavorite(crop.id)}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={19}
              color={favorited ? '#EF4444' : '#0F172A'}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Main Crop Image */}
        <View style={styles.imageContainer}>
          <Image source={crop.image} style={styles.image} contentFit="cover" />
          {crop.badge ? (
            <View style={styles.floatingBadge}>
              <Text style={styles.floatingBadgeText}>{crop.badge}</Text>
            </View>
          ) : null}
          <View style={styles.harvestLiveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.harvestLiveText}>
              {crop.harvestTime || 'Sunrise harvest • Dew intact'}
            </Text>
          </View>
        </View>

        {/* Farmer Info Bar */}
        <Pressable
          style={styles.farmerCard}
          onPress={() => router.push(`/farm/${crop.farmId}` as any)}>
          <View style={styles.farmerCardLeft}>
            <View style={styles.farmerIcon}>
              <Ionicons name="leaf" size={16} color="#FFFFFF" />
            </View>
            <View>
              <View style={styles.farmerNameRow}>
                <Text style={styles.farmerName}>{crop.farm}</Text>
                <Ionicons name="checkmark-circle" size={14} color="#15803D" />
              </View>
              <Text style={styles.farmerLocation}>{crop.distance} away • Verified Regional Stall</Text>
            </View>
          </View>

          <Pressable
            style={styles.msgFarmerPill}
            onPress={() => router.push({ pathname: `/chat/${crop.farmId}` as any, params: { productId: crop.id } })}>
            <Ionicons name="chatbubble-outline" size={14} color="#15803D" />
            <Text style={styles.msgFarmerText}>Message</Text>
          </Pressable>
        </Pressable>

        {/* Title & Price Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.title}>{crop.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{crop.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.stockBadge}>{crop.stock}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.categoryBadge}>{crop.category}</Text>
          </View>

          <View style={styles.priceRow}>
            {crop.originalPrice ? (
              <Text style={styles.originalPrice}>RS. {crop.originalPrice}</Text>
            ) : null}
            <Text style={styles.currentPrice}>RS. {crop.price}</Text>
            <Text style={styles.unitText}> /{crop.unit}</Text>
          </View>

          <Text style={styles.description}>{crop.description}</Text>
        </View>

        {/* Farm Direct Provenance */}
        <View style={styles.provenanceCard}>
          <Text style={styles.provenanceTitle}>Farm Direct Standards</Text>
          <View style={styles.provenanceGrid}>
            <View style={styles.provItem}>
              <Ionicons name="sunny-outline" size={18} color="#D97706" />
              <Text style={styles.provLabel}>Sunrise Picked</Text>
              <Text style={styles.provSub}>Less than 4 hours from soil</Text>
            </View>
            <View style={styles.provItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#15803D" />
              <Text style={styles.provLabel}>Zero Synthetic Sprays</Text>
              <Text style={styles.provSub}>Ecologically certified soil</Text>
            </View>
            <View style={styles.provItem}>
              <Ionicons name="cash-outline" size={18} color="#0D9488" />
              <Text style={styles.provLabel}>88% Farmer Cut</Text>
              <Text style={styles.provSub}>Zero middleman commission</Text>
            </View>
            <View style={styles.provItem}>
              <Ionicons name="cube-outline" size={18} color="#6366F1" />
              <Text style={styles.provLabel}>Eco Packaging</Text>
              <Text style={styles.provSub}>Biodegradable banana bark wrap</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityPicker}>
          <Pressable
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={16} color="#0F172A" />
          </Pressable>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <Pressable
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}>
            <Ionicons name="add" size={16} color="#0F172A" />
          </Pressable>
        </View>

        <Pressable
          style={styles.offerBtn}
          onPress={handleMakeOffer}
          accessibilityRole="button"
          accessibilityLabel="Make an offer">
          <Text style={styles.offerBtnText}>Offer</Text>
        </Pressable>

        <Pressable
          style={styles.addCartBtn}
          onPress={handleAddToCart}
          accessibilityRole="button"
          accessibilityLabel="Add to Basket">
          <Ionicons name="cart" size={16} color="#FFFFFF" />
          <Text style={styles.addCartBtnText}>
            Add • RS. {crop.price * quantity}
          </Text>
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
  favBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  scrollContent: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  floatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EA580C',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  floatingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  harvestLiveTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  harvestLiveText: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '600',
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  farmerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  farmerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  farmerLocation: {
    fontSize: 11.5,
    color: '#64748B',
  },
  msgFarmerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  msgFarmerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  dot: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  stockBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  categoryBadge: {
    fontSize: 12,
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  unitText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#334155',
  },
  provenanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  provenanceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  provenanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  provItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    gap: 2,
  },
  provLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  provSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  offerBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  offerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
