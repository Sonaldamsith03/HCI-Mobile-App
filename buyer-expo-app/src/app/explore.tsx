import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FloatingCartBar, FarmToast } from '@/components/FloatingCartBar';
import { useFarm } from '@/context/FarmContext';
import { ALL_CROPS, CATEGORIES } from '@/data/farmData';

export default function ExploreScreen() {
  const {
    addToCart,
    isFavorite,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useFarm();

  const [activeTab, setActiveTab] = useState<string>(selectedCategory || 'All');

  const filteredCrops = useMemo(() => {
    return ALL_CROPS.filter((item) => {
      if (activeTab !== 'All' && item.category !== activeTab) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.farm.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Explore Regional Harvests</Text>
          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
            onPress={() => router.push('/filter')}>
            <Ionicons name="options-outline" size={18} color="#15803D" />
          </Pressable>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops, farms, organic produce..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          <Pressable
            onPress={() => {
              setActiveTab('All');
              setSelectedCategory(null);
            }}
            style={[styles.catPill, activeTab === 'All' && styles.catPillActive]}>
            <Text
              style={[
                styles.catPillText,
                activeTab === 'All' && styles.catPillTextActive,
              ]}>
              All Produce ({ALL_CROPS.length})
            </Text>
          </Pressable>

          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                setActiveTab(cat.id);
                setSelectedCategory(cat.id);
              }}
              style={[styles.catPill, activeTab === cat.id && styles.catPillActive]}>
              <Text
                style={[
                  styles.catPillText,
                  activeTab === cat.id && styles.catPillTextActive,
                ]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          Showing {filteredCrops.length} freshly harvested crops
        </Text>

        <View style={styles.grid}>
          {filteredCrops.map((crop) => {
            const favorited = isFavorite(crop.id);
            return (
              <Pressable
                key={crop.id}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push(`/product/${crop.id}` as any)}>
                <View style={styles.imageWrapper}>
                  <Image source={crop.image} style={styles.image} contentFit="cover" />
                  {crop.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{crop.badge}</Text>
                    </View>
                  ) : null}
                  <Pressable
                    style={[styles.favoriteBtn, favorited && styles.favoriteBtnActive]}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(crop.id);
                    }}>
                    <Ionicons
                      name={favorited ? 'heart' : 'heart-outline'}
                      size={15}
                      color={favorited ? '#EF4444' : '#1F2937'}
                    />
                  </Pressable>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.farmRow}>
                    <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                    <Text style={styles.farmName} numberOfLines={1}>
                      {crop.farm}
                    </Text>
                  </View>

                  <Text style={styles.title} numberOfLines={1}>
                    {crop.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.metaText}>{crop.rating.toFixed(1)}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{crop.distance}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.stockText}>{crop.stock}</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>RS. {crop.price}</Text>
                    <Text style={styles.unit}> /{crop.unit}</Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={styles.addBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(crop, 1);
                      }}>
                      <Ionicons name="cart" size={13} color="#FFFFFF" />
                      <Text style={styles.addBtnText}>Add</Text>
                    </Pressable>

                    <Pressable
                      style={styles.offerBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/offer/${crop.id}` as any);
                      }}>
                      <Text style={styles.offerBtnText}>Offer</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingCartBar />
      <BottomNavBar currentTab="explore" />
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
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryScroll: {
    gap: 8,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  catPillActive: {
    backgroundColor: '#15803D',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#FFFFFF',
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
  resultsCount: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '600',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  cardBody: {
    padding: 9,
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  farmName: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 5,
  },
  metaText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  metaDot: {
    fontSize: 9,
    color: '#CBD5E1',
  },
  stockText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  unit: {
    fontSize: 10.5,
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  addBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 6,
    borderRadius: 10,
    gap: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  offerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    borderRadius: 10,
  },
  offerBtnText: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
