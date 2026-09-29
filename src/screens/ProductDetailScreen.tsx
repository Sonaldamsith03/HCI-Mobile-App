import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../types';
import { AgriCard } from '../components/AgriCard';
import { HarvestAccentButton, SecondaryButton } from '../components/Buttons';
import { BookingCheckoutModal, ContactFarmerModal } from '../components/Modals';
import { LiveChatNegotiationModal } from '../components/LiveChatNegotiationModal';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { produceList, bookProduce, sendMessage, addToCart, toggleFavorite, isFavorite, userProfile } = useApp();

  const produce = produceList.find(p => p.id === route.params.produceId);
  const [showBooking, setShowBooking] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);

  if (!produce) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backChevron}>
            <Ionicons name="chevron-back" size={26} color={colors.forestGreenPrimary} />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: colors.earthTextSecondary }}>Produce listing is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const savingsPct = Math.round(
    ((produce.middlemanPrice - produce.price) / produce.middlemanPrice) * 100
  );

  const handleCallFarmer = () => {
    Linking.openURL(`tel:${produce.farmerPhone}`).catch(() => {
      Alert.alert('Grower Contact', `Farmer Phone: ${produce.farmerPhone}`);
    });
  };

  const cropImageUri = produce.imageUrl || DEFAULT_CATEGORY_IMAGES[produce.category] || DEFAULT_CATEGORY_IMAGES.Vegetables;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full-Bleed Crop Photography Hero Header */}
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: cropImageUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Dual Gradient Overlay for legibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.80)']}
            style={styles.heroGradient}
          />

          {/* Floating Navigation Controls */}
          <View style={styles.heroTopBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircleBtn}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topActionGroup}>
              <TouchableOpacity onPress={() => toggleFavorite(produce.id)} style={styles.iconCircleBtn}>
                <Ionicons
                  name={isFavorite(produce.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite(produce.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCallFarmer} style={styles.iconCircleBtn}>
                <Ionicons name="call-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Content & Crop Title at Bottom of Photo */}
          <View style={styles.heroBottomContent}>
            <Text style={styles.cropTitleWhite}>{produce.name}</Text>

            <View style={styles.farmMetaWhiteRow}>
              <Ionicons name="location-sharp" size={14} color="#34D399" />
              <Text style={styles.farmLocWhite}>{produce.location}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.farmNameWhite}>{produce.farmerName}</Text>
            </View>
          </View>
        </View>

        {/* Main Content Body */}
        <View style={styles.bodyWrapper}>
          {/* Price Transparency Breakdown Card */}
          <AgriCard variant="mint" style={styles.priceCard}>
            <View style={styles.priceCardHeader}>
              <Ionicons name="pie-chart-outline" size={20} color={colors.forestGreenPrimary} />
              <Text style={styles.priceCardTitle}>Direct Farm Pricing Transparency</Text>
            </View>

            <View style={styles.comparisonGrid}>
              <View style={styles.col}>
                <Text style={styles.colLabel}>Direct Farm Price</Text>
                <Text style={styles.directPrice}>
                  ${produce.price.toFixed(2)}{' '}
                  <Text style={styles.unitText}>/ {produce.unit}</Text>
                </Text>
                <View style={styles.growerDirectTag}>
                  <Ionicons name="checkmark-done" size={12} color="#059669" />
                  <Text style={styles.directNote}>100% to grower</Text>
                </View>
              </View>

              <View style={styles.gridDivider} />

              <View style={styles.col}>
                <Text style={styles.colLabel}>Supermarket Retail</Text>
                <Text style={styles.retailPrice}>
                  ${produce.middlemanPrice.toFixed(2)}{' '}
                  <Text style={styles.unitText}>/ {produce.unit}</Text>
                </Text>
                <Text style={styles.retailNote}>Includes +55% broker fee</Text>
              </View>
            </View>

            {/* Savings Progress Bar */}
            <View style={styles.savingsBanner}>
              <View style={styles.savingsIconBox}>
                <Ionicons name="trending-down" size={16} color="#059669" />
              </View>
              <Text style={styles.savingsText}>
                You save {savingsPct}% while the grower earns +55% more than wholesale offers.
              </Text>
            </View>
          </AgriCard>

          {/* Harvest & Quality Specifications */}
          <AgriCard style={styles.specsCard}>
            <Text style={styles.sectionTitle}>Harvest & Quality Specifications</Text>

            <View style={styles.specGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Available Volume</Text>
                <Text style={styles.specVal}>{produce.quantity}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Harvest Timing</Text>
                <Text style={styles.specVal}>{produce.harvestDate}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Cultivation</Text>
                <Text style={styles.specVal}>{produce.isOrganic ? '100% Certified Organic' : 'Clean Conventional'}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Buyer Security</Text>
                <Text style={[styles.specVal, { color: colors.forestGreenPrimary }]}>AgriPay Protected</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>About This Harvest</Text>
            <Text style={styles.descText}>{produce.description}</Text>
          </AgriCard>

          {/* Verified Grower Profile Card */}
          <AgriCard style={styles.growerCard}>
            <View style={styles.growerHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }}
                style={styles.growerAvatar}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.growerName}>{produce.farmerName}</Text>
                  <Ionicons name="checkmark-circle" size={16} color={colors.forestGreenPrimary} />
                </View>
                <Text style={styles.growerLoc}>{produce.location}</Text>
                <Text style={styles.growerPhone}>{produce.farmerPhone}</Text>
              </View>
            </View>

            <View style={styles.growerActions}>
              <SecondaryButton
                title="Call Grower"
                icon={<Ionicons name="call-outline" size={16} color={colors.earthTextPrimary} />}
                onPress={handleCallFarmer}
                style={{ flex: 1, borderRadius: 14, height: 42 }}
              />
              <SecondaryButton
                title="Live Chat & Bargain"
                icon={<Ionicons name="chatbubbles-outline" size={16} color="#059669" />}
                onPress={() => {
                  navigation.navigate('ChatConversation', {
                    farmerName: produce.farmerName,
                    produceName: produce.name,
                    produceId: produce.id,
                  });
                }}
                style={{ flex: 1, borderRadius: 14, height: 42, borderColor: '#059669' }}
                textStyle={{ color: '#059669', fontWeight: '800' }}
              />
            </View>
          </AgriCard>
        </View>
      </ScrollView>

      {/* Sticky Bottom Dual-Action Checkout Bar with precise safe area insets */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Direct Farm Price</Text>
          <Text style={styles.bottomPriceVal} numberOfLines={1}>
            ${produce.price.toFixed(2)}{' '}
            <Text style={styles.bottomUnit}>/ {produce.unit}</Text>
          </Text>
        </View>

        {userProfile.name &&
        produce.farmerName &&
        produce.farmerName.trim().toLowerCase() === userProfile.name.trim().toLowerCase() ? (
          <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#F59E0B' }}>
              Your Harvest (Self-Orders Prohibited)
            </Text>
          </View>
        ) : (
          <View style={styles.bottomActionsRow}>
            <TouchableOpacity
              style={[styles.addToCartDetailBtn, { paddingHorizontal: 10 }]}
              onPress={() => setShowNegotiation(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="tag-outline" size={16} color="#059669" />
              <Text style={[styles.addToCartDetailText, { color: '#059669' }]}>Offer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addToCartDetailBtn}
              onPress={() => addToCart(produce, 1)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={16} color={colors.forestGreenPrimary} />
              <Text style={styles.addToCartDetailText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookNowDetailBtn}
              onPress={() => setShowBooking(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark" size={15} color="#FFFFFF" />
              <Text style={styles.bookNowDetailText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Booking Checkout Modal */}
      <BookingCheckoutModal
        visible={showBooking}
        produce={produce}
        onClose={() => setShowBooking(false)}
        onConfirm={async (prod, qty, method, address, payment) => {
          await bookProduce(prod, qty, method, address, payment);
          setShowBooking(false);
          navigation.navigate('BuyerDashboard', { initialTab: 'orders' });
        }}
      />

      {/* Direct Smart Grower Inquiry Chat & Bargaining Modal */}
      <LiveChatNegotiationModal
        visible={showNegotiation}
        produce={produce}
        onClose={() => setShowNegotiation(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  scrollContent: {
    paddingBottom: 130,
  },
  heroImageContainer: {
    width: '100%',
    height: 290,
    position: 'relative',
    backgroundColor: '#0F2C1D',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill as any,
  },
  heroTopBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroBottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  catPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.appleDark,
  },
  freshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  freshPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cropTitleWhite: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  farmMetaWhiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  farmLocWhite: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  dotSeparator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  farmNameWhite: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  bodyWrapper: {
    padding: 16,
  },
  priceCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
  },
  priceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreenPrimary,
  },
  comparisonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    color: colors.earthTextMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  directPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
    marginTop: 2,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.earthTextSecondary,
  },
  growerDirectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  directNote: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  gridDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 12,
  },
  retailPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.earthTextMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  retailNote: {
    fontSize: 11,
    color: colors.earthTextMuted,
    marginTop: 3,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  savingsIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsText: {
    flex: 1,
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    lineHeight: 16,
  },
  specsCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.appleDark,
    marginBottom: 12,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  specLabel: {
    fontSize: 11,
    color: colors.earthTextMuted,
    fontWeight: '500',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
    marginTop: 2,
  },
  descText: {
    fontSize: 13.5,
    color: colors.earthTextSecondary,
    lineHeight: 20,
  },
  growerCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
  },
  growerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  growerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
  },
  growerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.appleDark,
  },
  growerLoc: {
    fontSize: 12,
    color: colors.earthTextSecondary,
    marginTop: 1,
  },
  growerPhone: {
    fontSize: 11.5,
    color: colors.earthTextMuted,
    marginTop: 1,
  },
  growerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPriceContainer: {
    flexShrink: 1,
    marginRight: 10,
  },
  bottomPriceLabel: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bottomPriceVal: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
  },
  bottomUnit: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.earthTextSecondary,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToCartDetailBtn: {
    height: 42,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addToCartDetailText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.forestGreenPrimary,
  },
  bookNowDetailBtn: {
    height: 42,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: '#06C167',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bookNowDetailText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navHeader: {
    padding: 16,
  },
  backChevron: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.forestGreenPrimary,
    marginLeft: 4,
  },
});
