import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFarm } from '@/context/FarmContext';
import { REGIONAL_STALLS, ALL_CROPS } from '@/data/farmData';
import { FarmToast } from '@/components/FloatingCartBar';

export default function FarmStallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, showToast } = useFarm();

  const stall = REGIONAL_STALLS.find((s) => s.id === id) || REGIONAL_STALLS[0];
  const stallCrops = ALL_CROPS.filter(
    (c) => c.farmId === stall.id || c.farm.includes(stall.name.split(' ')[0])
  );

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
          {stall.name}
        </Text>

        <Pressable
          style={styles.circleBtn}
          onPress={() => showToast('Farm stall link shared!')}>
          <Ionicons name="share-outline" size={19} color="#0F172A" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Farm Hero Image */}
        <View style={styles.heroWrapper}>
          <Image source={stall.image} style={styles.heroImage} contentFit="cover" />
          <View style={styles.openBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.openBadgeText}>Farmgate Open Today</Text>
          </View>
        </View>

        {/* Stall Header Details */}
        <View style={styles.stallCard}>
          <View style={styles.nameRow}>
            <Text style={styles.stallName}>{stall.name}</Text>
            <Ionicons name="checkmark-circle" size={18} color="#15803D" />
          </View>

          <Text style={styles.farmerNameSub}>Operated by {stall.farmerName}</Text>

          <View style={styles.statsRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {stall.rating.toFixed(1)} ({stall.reviews} reviews)
              </Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.distanceText}>{stall.distance}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.lotsText}>{stall.activeLots} active lots</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color="#64748B" />
            <Text style={styles.locationText}>{stall.locationName}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <Pressable
              style={styles.msgBtn}
              onPress={() => router.push(`/chat/${stall.id}` as any)}>
              <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
              <Text style={styles.msgBtnText}>Message Farmer</Text>
            </Pressable>

            <Pressable
              style={styles.callBtn}
              onPress={() => showToast(`Calling ${stall.phone}...`)}>
              <Ionicons name="call-outline" size={16} color="#15803D" />
              <Text style={styles.callBtnText}>Call</Text>
            </Pressable>

            <Pressable
              style={styles.mapBtn}
              onPress={() => router.push('/map')}>
              <Ionicons name="map-outline" size={16} color="#334155" />
            </Pressable>
          </View>
        </View>

        {/* Farmer Story & Agroecology */}
        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>About the Homestead</Text>
          <Text style={styles.storyText}>{stall.story}</Text>

          <View style={styles.tagsRow}>
            <View style={styles.ecoTag}>
              <Ionicons name="leaf-outline" size={13} color="#15803D" />
              <Text style={styles.ecoTagText}>Regenerative Soil</Text>
            </View>
            <View style={styles.ecoTag}>
              <Ionicons name="water-outline" size={13} color="#0284C7" />
              <Text style={styles.ecoTagText}>Rainwater Fed</Text>
            </View>
            <View style={styles.ecoTag}>
              <Ionicons name="heart-outline" size={13} color="#E11D48" />
              <Text style={styles.ecoTagText}>Family Operated</Text>
            </View>
          </View>
        </View>

        {/* Active Produce Lots Ready */}
        <Text style={styles.sectionHeader}>
          Fresh Harvest Lots ({stallCrops.length > 0 ? stallCrops.length : '3'} Available)
        </Text>

        <View style={styles.cropsList}>
          {(stallCrops.length > 0 ? stallCrops : ALL_CROPS.slice(0, 3)).map((crop) => (
            <Pressable
              key={crop.id}
              style={styles.cropRowCard}
              onPress={() => router.push(`/product/${crop.id}` as any)}>
              <Image source={crop.image} style={styles.cropThumb} contentFit="cover" />

              <View style={styles.cropDetails}>
                <Text style={styles.cropTitle}>{crop.title}</Text>
                <Text style={styles.cropSub}>{crop.stock} remaining • {crop.category}</Text>
                <Text style={styles.cropPrice}>
                  RS. {crop.price} <Text style={styles.cropUnit}>/{crop.unit}</Text>
                </Text>
              </View>

              <Pressable
                style={styles.addMiniBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(crop, 1);
                }}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 10,
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
    gap: 14,
  },
  heroWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  openBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  openBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  stallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  stallName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  farmerNameSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
  distanceText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  lotsText: {
    fontSize: 12,
    color: '#64748B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  msgBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  msgBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  callBtnText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  storyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ecoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ecoTagText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  cropsList: {
    gap: 10,
  },
  cropRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cropThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cropDetails: {
    flex: 1,
  },
  cropTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cropSub: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 2,
  },
  cropPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#15803D',
  },
  cropUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  addMiniBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
