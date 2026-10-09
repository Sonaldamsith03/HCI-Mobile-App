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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FarmByLogo } from '@/components/FarmByLogo';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FloatingCartBar, FarmToast } from '@/components/FloatingCartBar';
import { useFarm } from '@/context/FarmContext';
import {
  HERO_DEAL,
  PICKED_TODAY_ITEMS,
  REGIONAL_STALLS,
  RECOMMENDED_ITEMS,
  CATEGORIES,
  QUICK_FILTERS,
  INITIAL_USER,
} from '@/data/farmData';

export default function HomeScreen() {
  const {
    location,
    radiusText,
    selectedCategory,
    setSelectedCategory,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
    addToCart,
    isFavorite,
    toggleFavorite,
    showToast,
  } = useFarm();

  const [activeFilterId, setActiveFilterId] = useState(selectedFilter || 'all');
  const [activeCat, setActiveCat] = useState<string | null>(selectedCategory);

  const handleFilterPress = (filterId: string) => {
    setActiveFilterId(filterId);
    setSelectedFilter(filterId);
    if (filterId === 'organic') {
      showToast('Showing 100% Certified Organic crops');
    } else if (filterId === 'today') {
      showToast('Showing crops picked at sunrise today');
    }
  };

  const handleCategoryPress = (catId: string) => {
    if (activeCat === catId) {
      setActiveCat(null);
      setSelectedCategory(null);
    } else {
      setActiveCat(catId);
      setSelectedCategory(catId);
      showToast(`Filtered by ${catId}`);
    }
  };

  // Filter picked today items if active filter applies
  const displayedPickedItems = useMemo(() => {
    return PICKED_TODAY_ITEMS.filter((item) => {
      if (activeFilterId === 'organic' && !item.organic) return false;
      if (activeFilterId === 'today' && !item.harvestedToday) return false;
      if (activeCat && item.category !== activeCat) return false;
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.farm.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeFilterId, activeCat, searchQuery]);

  const meadowviewStall = REGIONAL_STALLS[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ================= TOP HEADER ================= */}
        <View style={styles.topHeader}>
          <Pressable
            style={styles.logoWrapper}
            onPress={() => router.push('/')}
            accessibilityRole="button"
            accessibilityLabel="FarmBy Home">
            <FarmByLogo />
          </Pressable>

          <View style={styles.topRightControls}>
            <Pressable
              style={({ pressed }) => [styles.locationPill, pressed && styles.pressed]}
              onPress={() => router.push('/location')}
              accessibilityRole="button"
              accessibilityLabel="Select location">
              <Ionicons name="location-outline" size={14} color="#15803D" />
              <Text style={styles.locationText}>{location}</Text>
              <Ionicons name="chevron-down" size={12} color="#64748B" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
              onPress={() => router.push('/profile')}
              accessibilityRole="button"
              accessibilityLabel="User profile">
              <Image
                source={{ uri: INITIAL_USER.avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            </Pressable>
          </View>
        </View>

        {/* ================= SUB-HEADER ROW ================= */}
        <View style={styles.subHeaderRow}>
          <Pressable
            style={({ pressed }) => [styles.radiusChip, pressed && styles.pressed]}
            onPress={() => router.push('/location')}
            accessibilityRole="button"
            accessibilityLabel="Filter radius">
            <Ionicons name="navigate-outline" size={13} color="#15803D" />
            <Text style={styles.radiusText}>{radiusText}</Text>
            <Ionicons name="chevron-down" size={12} color="#64748B" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.liveBadge, pressed && styles.pressed]}
            onPress={() => showToast('Farm Hub: 18 active plots harvesting right now!')}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveBadgeText}>Farm Hub Live</Text>
          </Pressable>
        </View>

        {/* ================= GREETING SECTION ================= */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            Good morning, {INITIAL_USER.name}! 🌾
          </Text>
          <Text style={styles.greetingSubtitle}>
            Discover fresh regional crops picked at sunrise across {INITIAL_USER.regionalPlotsCount} regional plots.
          </Text>
        </View>

        {/* ================= SEARCH & FILTER ROW ================= */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={17} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search heirloom crops, raw honey,"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            <Pressable
              onPress={() => showToast('Listening for voice search...')}
              style={({ pressed }) => [styles.micButton, pressed && styles.pressed]}>
              <Ionicons name="mic-outline" size={18} color="#64748B" />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
            onPress={() => router.push('/filter')}
            accessibilityRole="button"
            accessibilityLabel="Filter produce">
            <Ionicons name="options-outline" size={20} color="#15803D" />
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        {/* ================= QUICK FILTER CHIPS ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsScroll}>
          {QUICK_FILTERS.map((f) => {
            const isSelected = activeFilterId === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => handleFilterPress(f.id)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                  f.id === 'organic' && !isSelected && styles.filterChipOrganic,
                  f.id === 'today' && !isSelected && styles.filterChipToday,
                  pressed && styles.pressed,
                ]}>
                {f.id === 'organic' ? (
                  <Ionicons name="leaf-outline" size={14} color={isSelected ? '#FFFFFF' : '#15803D'} />
                ) : f.id === 'today' ? (
                  <Ionicons name="flash-outline" size={14} color={isSelected ? '#FFFFFF' : '#EA580C'} />
                ) : null}
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                    f.id === 'organic' && !isSelected && styles.filterChipTextOrganic,
                    f.id === 'today' && !isSelected && styles.filterChipTextToday,
                  ]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ================= 6 CIRCULAR CATEGORY BUTTONS ================= */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCat === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [styles.catItem, pressed && styles.pressed]}
                onPress={() => handleCategoryPress(cat.id)}>
                <View
                  style={[
                    styles.catCircle,
                    { backgroundColor: cat.bg, borderColor: cat.border },
                    isSelected && styles.catCircleActive,
                  ]}>
                  <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text
                  style={[
                    styles.catLabel,
                    isSelected && { color: cat.color, fontWeight: '700' },
                  ]}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ================= HERO FEATURE CARD ================= */}
        <Pressable
          style={({ pressed }) => [styles.heroCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/product/sweet-bell-peppers-roma-tomatoes' as any)}>
          <View style={styles.heroLeft}>
            {/* Top row of hero card */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroTagOrange}>
                <Text style={styles.heroTagOrangeText}>✦ DAWN DISPATCH • 25% OFF</Text>
              </View>
              <Pressable
                style={styles.heroFarmPill}
                onPress={() => router.push('/farm/oakridge-farm' as any)}>
                <Text style={styles.heroFarmPillText}>{"Malith's Family Farm"}</Text>
              </Pressable>
            </View>

            {/* Title & description */}
            <Text style={styles.heroTitle}>Sweet Bell Peppers & Roma Vine Tomatoes</Text>
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              Plucked at 5:30 AM with morning dew intact. Crisp, soil-fed, and ready for...
            </Text>

            {/* Price & Claim button row */}
            <View style={styles.heroBottomRow}>
              <View style={styles.heroPriceCol}>
                <Text style={styles.heroOriginalPrice}>RS. {HERO_DEAL.originalPrice}</Text>
                <View style={styles.heroPriceRow}>
                  <Text style={styles.heroPriceText}>RS.{HERO_DEAL.price}</Text>
                  <Text style={styles.heroUnitText}> /lb</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.claimBtn, pressed && styles.pressed]}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(HERO_DEAL, 1);
                  router.push('/product/sweet-bell-peppers-roma-tomatoes' as any);
                }}
                accessibilityRole="button"
                accessibilityLabel="Claim Batch">
                <Text style={styles.claimBtnText}>Claim Batch</Text>
                <Ionicons name="arrow-forward" size={14} color="#15803D" />
              </Pressable>
            </View>
          </View>

          {/* Right image */}
          <View style={styles.heroRight}>
            <Image
              source={HERO_DEAL.image}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
        </Pressable>

        {/* ================= PICKED TODAY SECTION ================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flash" size={18} color="#EA580C" />
            <Text style={styles.sectionTitle}>Picked Today</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.viewAllRow, pressed && styles.pressed]}
            onPress={() => router.push('/explore')}>
            <Text style={styles.viewAllText}>View all (24)</Text>
            <Ionicons name="chevron-forward" size={14} color="#15803D" />
          </Pressable>
        </View>

        {/* 2 Product Cards Grid */}
        <View style={styles.productGrid}>
          {displayedPickedItems.map((crop) => {
            const favorited = isFavorite(crop.id);
            return (
              <Pressable
                key={crop.id}
                style={({ pressed }) => [styles.productCard, pressed && styles.cardPressed]}
                onPress={() => router.push(`/product/${crop.id}` as any)}>
                {/* Image Container with Badges */}
                <View style={styles.productImageWrapper}>
                  <Image source={crop.image} style={styles.productImage} contentFit="cover" />
                  {crop.badge ? (
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{crop.badge}</Text>
                    </View>
                  ) : null}

                  {/* Favorite Heart Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.favoriteBtn,
                      favorited && styles.favoriteBtnActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(crop.id);
                    }}>
                    <Ionicons
                      name={favorited ? 'heart' : 'heart-outline'}
                      size={16}
                      color={favorited ? '#EF4444' : '#1F2937'}
                    />
                  </Pressable>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                  {/* Farmer Info */}
                  <Pressable
                    style={styles.farmerRow}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/farm/${crop.farmId}` as any);
                    }}>
                    <Ionicons name="checkmark-circle" size={13} color="#15803D" />
                    <Text style={styles.farmerName}>{crop.farm}</Text>
                  </Pressable>

                  {/* Title */}
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {crop.title}
                  </Text>

                  {/* Rating & Distance & Stock */}
                  <View style={styles.statsRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{crop.rating.toFixed(1)}</Text>
                    <Text style={styles.statsDot}>•</Text>
                    <Text style={styles.distanceText}>{crop.distance}</Text>
                    <Text style={styles.statsDot}>•</Text>
                    <Text style={styles.stockBadgeText}>{crop.stock}</Text>
                  </View>

                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>RS. {crop.price}</Text>
                    <Text style={styles.priceUnit}> /{crop.unit}</Text>
                  </View>

                  {/* Actions: Add & Offer buttons */}
                  <View style={styles.cardActionRow}>
                    <Pressable
                      style={({ pressed }) => [styles.addCartBtn, pressed && styles.pressed]}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(crop, 1);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${crop.title} to cart`}>
                      <Ionicons name="cart" size={14} color="#FFFFFF" />
                      <Text style={styles.addCartBtnText}>Add</Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [styles.offerBtn, pressed && styles.pressed]}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/offer/${crop.id}` as any);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Make offer on ${crop.title}`}>
                      <Text style={styles.offerBtnText}>Offer</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ================= VERIFIED REGIONAL STALLS ================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="tractor" size={20} color="#15803D" />
            <Text style={styles.sectionTitle}>Verified Regional Stalls</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.viewAllRow, pressed && styles.pressed]}
            onPress={() => router.push('/map')}>
            <Text style={styles.viewAllText}>Map view</Text>
            <Ionicons name="map-outline" size={14} color="#15803D" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        {/* Stall Card */}
        <Pressable
          style={({ pressed }) => [styles.stallCard, pressed && styles.cardPressed]}
          onPress={() => router.push(`/farm/${meadowviewStall.id}` as any)}>
          <View style={styles.stallTopRow}>
            <Image
              source={meadowviewStall.image}
              style={styles.stallImage}
              contentFit="cover"
            />
            <View style={styles.stallInfo}>
              <View style={styles.stallTitleRow}>
                <Text style={styles.stallName}>{meadowviewStall.name}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              </View>

              <View style={styles.stallStatsRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.stallRatingText}>
                  {meadowviewStall.rating.toFixed(1)} ({meadowviewStall.reviews} reviews)
                </Text>
                <Text style={styles.statsDot}>•</Text>
                <Text style={styles.stallDistanceText}>{meadowviewStall.distance}</Text>
              </View>

              <Text style={styles.stallSpecialties} numberOfLines={1}>
                Specialties: {meadowviewStall.specialties}
              </Text>
            </View>
          </View>

          {/* Status strip */}
          <View style={styles.stallStatusRow}>
            <View style={styles.stallStatusLeft}>
              <View style={styles.stallDotGreen} />
              <Text style={styles.stallStatusText}>
                {meadowviewStall.activeLots} active lots ready • {meadowviewStall.delivery}
              </Text>
            </View>
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>{meadowviewStall.status}</Text>
            </View>
          </View>

          {/* Bottom Stall Buttons */}
          <View style={styles.stallBtnRow}>
            <Pressable
              style={({ pressed }) => [styles.visitStallBtn, pressed && styles.pressed]}
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/farm/${meadowviewStall.id}` as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Visit Farm Stall">
              <Ionicons name="storefront-outline" size={16} color="#FFFFFF" />
              <Text style={styles.visitStallBtnText}>Visit Farm Stall</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.messageStallBtn, pressed && styles.pressed]}
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/chat/${meadowviewStall.id}` as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Message Farmer">
              <Ionicons name="chatbubble-outline" size={15} color="#1F2937" />
              <Text style={styles.messageStallBtnText}>Message</Text>
            </Pressable>
          </View>
        </Pressable>

        {/* ================= RECOMMENDED FOR YOU ================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="radio-button-on-outline" size={18} color="#15803D" />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          <Text style={styles.sectionSubLabel}>Based on recent purchases</Text>
        </View>

        {/* Recommended List */}
        <View style={styles.recommendedList}>
          {RECOMMENDED_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.recCard, pressed && styles.cardPressed]}
              onPress={() => router.push(`/product/${item.id}` as any)}>
              <Image source={item.image} style={styles.recImage} contentFit="cover" />

              <View style={styles.recDetails}>
                <View style={styles.recMetaRow}>
                  <Text style={styles.recFarmText}>{item.farm} • {item.distance}</Text>
                  {item.badge ? (
                    <View style={styles.recBadgeOrange}>
                      <Text style={styles.recBadgeOrangeText}>{item.badge}</Text>
                    </View>
                  ) : item.stock ? (
                    <View style={styles.recBadgeGreen}>
                      <Text style={styles.recBadgeGreenText}>{item.stock}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.recTitle}>{item.title}</Text>
                <Text style={styles.recSubtitle} numberOfLines={1}>
                  {item.description}
                </Text>

                <View style={styles.recBottomRow}>
                  <View style={styles.recPriceRow}>
                    <Text style={styles.recPriceValue}>RS. {item.price}</Text>
                    <Text style={styles.recPriceUnit}> /{item.unit}</Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [styles.quickAddBtn, pressed && styles.pressed]}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(item, 1);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Quick add ${item.title}`}>
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.quickAddBtnText}>Quick Add</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ================= ECO IMPACT BANNER ================= */}
        <Pressable
          style={({ pressed }) => [styles.ecoCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/impact')}
          accessibilityRole="button"
          accessibilityLabel="View Eco Impact Details">
          <View style={styles.ecoIconCircle}>
            <Text style={styles.ecoIconText}>CO₂</Text>
          </View>
          <View style={styles.ecoContent}>
            <Text style={styles.ecoTitle}>{INITIAL_USER.co2SavedKg} kg CO₂ Saved</Text>
            <Text style={styles.ecoSubtitle}>By buying regional harvests this month</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        {/* Padding for bottom nav */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating cart bar if items are added */}
      <FloatingCartBar />

      {/* Sticky Bottom Navigation Bar */}
      <BottomNavBar currentTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },

  /* Top Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  /* Sub Header Row */
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  radiusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 5,
  },
  radiusText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  livePulseDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },

  /* Greeting Section */
  greetingSection: {
    marginTop: 4,
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },

  /* Search & Filter Row */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  micButton: {
    padding: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EA580C',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Quick Filters */
  filterChipsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  filterChipOrganic: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  filterChipToday: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  filterChipTextOrganic: {
    color: '#15803D',
  },
  filterChipTextToday: {
    color: '#C2410C',
  },

  /* 6 Circular Categories */
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 16,
  },
  catItem: {
    alignItems: 'center',
    gap: 5,
  },
  catCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  catCircleActive: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2,
    borderColor: '#15803D',
  },
  catLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#334155',
  },

  /* Hero Featured Banner */
  heroCard: {
    backgroundColor: '#15803D',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  heroTagOrange: {
    backgroundColor: '#EA580C',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  heroTagOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroFarmPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  heroFarmPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#DCFCE7',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroPriceCol: {},
  heroOriginalPrice: {
    color: '#86EFAC',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroPriceText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  heroUnitText: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '600',
  },
  claimBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  claimBtnText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroRight: {
    width: 105,
    height: 105,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  /* Section Headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  sectionSubLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },

  /* Product Grid: 2 columns */
  productGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  productImageWrapper: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  timeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  favoriteBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  cardContent: {
    padding: 10,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  farmerName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  statsDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  distanceText: {
    fontSize: 11,
    color: '#64748B',
  },
  stockBadgeText: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceUnit: {
    fontSize: 11,
    color: '#64748B',
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  addCartBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  offerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  offerBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Verified Regional Stall Card */
  stallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  stallTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  stallImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  stallInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  stallTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  stallName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  stallStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  stallRatingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },
  stallDistanceText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
  },
  stallSpecialties: {
    fontSize: 11.5,
    color: '#64748B',
  },
  stallStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  stallStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  stallDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  stallStatusText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  openBadge: {
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  openBadgeText: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '700',
  },
  stallBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visitStallBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  visitStallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  messageStallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageStallBtnText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Recommended For You Section */
  recommendedList: {
    gap: 12,
    marginBottom: 20,
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  recImage: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  recDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recFarmText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  recBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  recBadgeGreenText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '700',
  },
  recBadgeOrange: {
    backgroundColor: '#FFEDD5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  recBadgeOrangeText: {
    fontSize: 10,
    color: '#C2410C',
    fontWeight: '700',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  recSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 4,
  },
  recBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recPriceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  recPriceUnit: {
    fontSize: 11,
    color: '#64748B',
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Eco Impact Banner */
  ecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  ecoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#14532D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ecoIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ecoContent: {
    flex: 1,
  },
  ecoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  ecoSubtitle: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
});
