import { chatService } from "../services/chatService";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Staggered animated card wrapper ───────────────────────────────────────
const StaggeredCard: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(index * 60, 360); // cap at 360ms
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        delay,
        damping: 20,
        stiffness: 240,
        mass: 0.9,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Animated heart button ──────────────────────────────────────────────────
const HeartButton: React.FC<{ isFav: boolean; onPress: () => void }> = ({ isFav, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevFav = useRef(isFav);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.5,
        useNativeDriver: true,
        damping: 6,
        stiffness: 500,
        mass: 0.5,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 300,
      }),
    ]).start();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={[styles.favoriteButton]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isFav ? 'heart' : 'heart-outline'}
          size={19}
          color={isFav ? '#EF4444' : '#FFFFFF'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Animated Add to Cart button ────────────────────────────────────────────
const CartButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0.92,
          useNativeDriver: true,
          damping: 10,
          stiffness: 500,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 280,
        }),
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress} style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.cartBtn,
          { transform: [{ scale }] },
        ]}
      >
        <Ionicons name="cart-outline" size={16} color={colors.forestGreenPrimary} />
        <Text style={styles.cartBtnText}>Add to Cart</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Produce, RootStackParamList, Transaction } from '../types';
import { AgriCard } from '../components/AgriCard';
import { StatusBadge, CategoryChip } from '../components/Badges';
import { HarvestAccentButton, SecondaryButton } from '../components/Buttons';
import { BookingCheckoutModal, WalletTopUpModal, FairTradeReceiptModal, ContactFarmerModal } from '../components/Modals';
import { OrderTrackingModal } from '../components/OrderTrackingModal';
import { InteractiveLiveMap } from '../components/InteractiveLiveMap';
import { LiveChatNegotiationModal } from '../components/LiveChatNegotiationModal';
import { BuyerTab } from '../components/MobileBottomTabBar';
import { UberBottomNavBar } from '../components/UberBottomNavBar';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';

export const BuyerDashboard: React.FC<{ hideBottomNav?: boolean }> = ({ hideBottomNav = false }) => {
  const route = useRoute<RouteProp<RootStackParamList, 'BuyerDashboard'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    produceList,
    transactions,
    bookProduce,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    checkoutCart,
    favorites,
    toggleFavorite,
    isFavorite,
    userProfile,
    updateUserProfile,
    showToast,
    communityPools,
    joinPool,
    themeMode,
    toggleThemeMode,
    theme,
    topUpWallet,
    releaseEscrow,
    setCurrentBottomTab,
    getDeliveryForTransaction,
  } = useApp();

  const isDark = themeMode === 'dark';
  const t = theme;

  // Mobile Bottom Navigation Tab State
  const [activeTab, setActiveTab] = useState<BuyerTab>(route.params?.initialTab || 'marketplace');

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'savings'>('featured');

  // Modals & Sheets
  const [bookingProduce, setBookingProduce] = useState<Produce | null>(null);
  const [trackingTx, setTrackingTx] = useState<Transaction | null>(null);
  const [liveMapTx, setLiveMapTx] = useState<Transaction | null>(null);
  const [showWalletTopUp, setShowWalletTopUp] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [chatProduce, setChatProduce] = useState<Produce | null>(null);

  // Cart Checkout Form State
  const [deliveryMethod, setDeliveryMethod] = useState<'Hub Pickup' | 'Direct Farm Courier'>('Direct Farm Courier');
  const [deliveryAddress, setDeliveryAddress] = useState(
    userProfile.savedAddresses?.[0] || '144 Harvest Way, Apt 3B, Green Valley, CA'
  );
  const [paymentMethod, setPaymentMethod] = useState<'AgriPay Escrow' | 'Apple Pay' | 'Card'>('AgriPay Escrow');
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const [selectedGrower, setSelectedGrower] = useState<string | null>(null);

  // Unique verified growers list with counts for story circles
  const growers = React.useMemo(() => {
    const map = new Map<string, { name: string; location: string; avatar: string; count: number }>();
    produceList.forEach(p => {
      if (!map.has(p.farmerName)) {
        map.set(p.farmerName, {
          name: p.farmerName,
          location: p.location,
          avatar: p.imageUrl || DEFAULT_CATEGORY_IMAGES[p.category] || DEFAULT_CATEGORY_IMAGES.Vegetables,
          count: 1,
        });
      } else {
        map.get(p.farmerName)!.count++;
      }
    });
    return Array.from(map.values());
  }, [produceList]);

  const getCartQty = (produceId: number) => {
    const item = cart.find(c => c.produce.id === produceId);
    return item ? item.quantity : 0;
  };

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Tubers', 'Honey & Dairy'];

  // Calculations for Cart
  const cartSubtotal = cart.reduce((acc, item) => acc + item.produce.price * item.quantity, 0);
  const logisticsFee = deliveryMethod === 'Direct Farm Courier' ? 3.0 : 0.0;
  const cartGrandTotal = cartSubtotal + logisticsFee;
  const totalCartUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filtered & Sorted Produce
  const filteredProduce = produceList
    .filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesGrower = !selectedGrower || item.farmerName === selectedGrower;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesGrower && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'savings') {
        const savingsA = a.middlemanPrice - a.price;
        const savingsB = b.middlemanPrice - b.price;
        return savingsB - savingsA;
      }
      return 0; // featured default order
    });

  // Saved produce list
  const savedProduceList = produceList.filter(item => isFavorite(item.id));

  // Quick Wallet Top-up Handler
  const handleQuickTopUp = (amount: number) => {
    const newBalance = (userProfile.walletBalance || 240) + amount;
    updateUserProfile({ walletBalance: newBalance, escrowBalance: newBalance });
    showToast(`Top-Up Complete: +$${amount}.00 (New Escrow Balance: $${newBalance.toFixed(2)})`, 'success');
  };

  // Cart Checkout Handler
  const handleCartCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmittingCheckout(true);
    try {
      await checkoutCart(deliveryMethod, deliveryAddress, paymentMethod);
      setActiveTab('orders');
    } catch {
      Alert.alert('Checkout Error', 'Failed to place escrow order. Please try again.');
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, themeMode === 'dark' && styles.safeAreaDark]}>
      {/* Top Mobile Bar */}
      <View style={[styles.topBar, themeMode === 'dark' && styles.topBarDark]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              setCurrentBottomTab('services');
              navigation.navigate('MainTabs', { tab: 'services' });
            }
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={themeMode === 'dark' ? '#F9FAFB' : colors.appleDark} />
          <Text style={[styles.backText, themeMode === 'dark' && { color: '#F9FAFB' }]}>Portals</Text>
        </TouchableOpacity>

        {/* Action Pills */}
        <View style={styles.topRightActions}>
          {/* Theme Switcher Button */}
          <TouchableOpacity
            style={[styles.themeToggleBtn, themeMode === 'dark' && styles.themeToggleBtnDark]}
            onPress={toggleThemeMode}
            activeOpacity={0.8}
          >
            <Ionicons
              name={themeMode === 'dark' ? 'sunny' : 'moon'}
              size={17}
              color={themeMode === 'dark' ? '#FBBF24' : colors.appleDark}
            />
          </TouchableOpacity>

          {/* Escrow Wallet Pill */}
          <TouchableOpacity
            style={styles.walletPill}
            onPress={() => setShowWalletTopUp(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="wallet-outline" size={14} color="#047857" />
            <Text style={styles.walletBalanceText}>
              ${(userProfile.walletBalance ?? 240).toFixed(2)}
            </Text>
          </TouchableOpacity>

          {/* Live Chat Inbox Trigger */}
          <TouchableOpacity
            style={[styles.quickCartButton, themeMode === 'dark' && styles.quickCartButtonDark]}
            onPress={() => {
              const firstThread = chatService.getAllThreads()[0];
              navigation.navigate('ChatConversation', {
                farmerName: firstThread?.farmerName || produceList[0]?.farmerName || 'Local Farmer',
                produceName: firstThread?.produceName || produceList[0]?.name || 'Fresh Produce',
                produceId: firstThread?.produceId || produceList[0]?.id || 1,
                buyerName: userProfile.name || 'Buyer',
                conversationId: firstThread?.id,
              });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles-outline" size={19} color={themeMode === 'dark' ? '#F9FAFB' : colors.appleDark} />
            <View style={[styles.quickCartBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.quickCartBadgeText}>Live</Text>
            </View>
          </TouchableOpacity>

          {/* Quick Cart Trigger */}
          <TouchableOpacity
            style={[styles.quickCartButton, themeMode === 'dark' && styles.quickCartButtonDark]}
            onPress={() => setActiveTab('cart')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={19} color={themeMode === 'dark' ? '#F9FAFB' : colors.appleDark} />
            {totalCartUnits > 0 && (
              <View style={styles.quickCartBadge}>
                <Text style={styles.quickCartBadgeText}>
                  {totalCartUnits > 99 ? '99+' : totalCartUnits}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Slidable Top Sub-Segment Bar for Activity & Orders, Harvests, Cart, Saved */}
      <View style={[styles.uberSegmentContainerWrapper, themeMode === 'dark' && styles.uberSegmentContainerDark]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.uberSegmentScrollContent}
        >
          {(
            [
              { id: 'orders' as BuyerTab, label: 'Activity & Orders', icon: 'receipt-outline' },
              { id: 'marketplace' as BuyerTab, label: 'Harvests', icon: 'leaf-outline' },
              { id: 'cart' as BuyerTab, label: `Cart (${totalCartUnits})`, icon: 'cart-outline' },
              { id: 'saved' as BuyerTab, label: `Saved (${savedProduceList.length})`, icon: 'heart-outline' },
            ] as const
          ).map(seg => {
            const isSelected = activeTab === seg.id;
            return (
              <TouchableOpacity
                key={seg.id}
                onPress={() => setActiveTab(seg.id)}
                style={[
                  styles.uberSegmentPill,
                  themeMode === 'dark' && styles.uberSegmentPillDark,
                  isSelected && (themeMode === 'dark' ? styles.uberSegmentPillActiveDark : styles.uberSegmentPillActive),
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={seg.icon as any}
                  size={14}
                  color={
                    isSelected
                      ? themeMode === 'dark'
                        ? '#000000'
                        : '#FFFFFF'
                      : themeMode === 'dark'
                      ? '#A1A1AA'
                      : '#545454'
                  }
                />
                <Text
                  style={[
                    styles.uberSegmentText,
                    themeMode === 'dark' && styles.uberSegmentTextDark,
                    isSelected && (themeMode === 'dark' ? styles.uberSegmentTextActiveDark : styles.uberSegmentTextActive),
                  ]}
                >
                  {seg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Dynamic Content Views */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================================== */}
        {/* TAB 0: MARKETPLACE                                                  */}
        {/* =================================================================== */}
        {activeTab === 'marketplace' && (
          <View>
            {/* Title & Delivery Location Bar */}
            <View style={styles.cleanHeaderSection}>
              <View style={styles.cleanLocationRow}>
                <View style={styles.cleanLocationIconWrap}>
                  <Ionicons name="location" size={15} color="#06C167" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cleanLocationLabel, isDark && { color: '#A1A1AA' }]}>FARM DIRECT DISPATCH</Text>
                  <Text style={[styles.cleanLocationTitle, isDark && { color: '#FFFFFF' }]}>
                    Green Valley Hub #4 • <Text style={{ color: '#06C167', fontWeight: '700' }}>35m delivery</Text>
                  </Text>
                </View>
              </View>

              {/* Minimalist Floating Pill Search Bar */}
              <View style={[styles.cleanSearchBar, isDark && { backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.08)' }]}>
                <Ionicons name="search" size={17} color={isDark ? '#9CA3AF' : '#8E8E93'} />
                <TextInput
                  style={[styles.cleanSearchInput, isDark && { color: '#FFFFFF' }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search fresh harvest, farm, or region..."
                  placeholderTextColor={isDark ? '#9CA3AF' : '#8E8E93'}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={17} color={isDark ? '#9CA3AF' : '#8E8E93'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* "Verified Farm Stories" — Direct Human Connection (No Clunky Boxes!) */}
            <View style={styles.growersSection}>
              <View style={styles.cleanSectionRow}>
                <Text style={[styles.cleanSectionTitle, isDark && { color: '#FFFFFF' }]}>Local Farm Gate</Text>
                {selectedGrower && (
                  <TouchableOpacity onPress={() => setSelectedGrower(null)}>
                    <Text style={styles.cleanResetFilter}>Reset filter ({selectedGrower.split(' ')[0]})</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.growersScroll}
              >
                {growers.map(grower => {
                  const isSelected = selectedGrower === grower.name;
                  return (
                    <TouchableOpacity
                      key={grower.name}
                      onPress={() => setSelectedGrower(isSelected ? null : grower.name)}
                      style={styles.growerStoryItem}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.growerAvatarRing, isSelected && styles.growerAvatarRingActive]}>
                        <Image source={{ uri: grower.avatar }} style={styles.growerAvatar} />
                        <View style={styles.growerVerifiedDot}>
                          <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.growerStoryName,
                          isDark && { color: '#FFFFFF' },
                          isSelected && { color: '#06C167', fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {grower.name.split(' ')[0]}
                      </Text>
                      <Text style={styles.growerCropCount}>{grower.count} crops</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Category Filter Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContainer}
              style={{ marginBottom: 12 }}
            >
              {categories.map(cat => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  selected={selectedCategory === cat}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>

            {/* Wholesale Pools: Streamlined Minimalist Strip */}
            <View style={styles.poolsCompactSection}>
              <View style={styles.cleanSectionRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name="people" size={14} color="#059669" />
                  <Text style={[styles.cleanSectionTitle, isDark && { color: '#FFFFFF' }]}>Group Wholesale Pools</Text>
                </View>
                <Text style={styles.poolDiscountSub}>Up to 45% off retail</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.poolsCompactScroll}
              >
                {communityPools.map(pool => {
                  const discountPct = Math.round(((pool.retailPrice - pool.pricePerKg) / pool.retailPrice) * 100);
                  const progressPct = Math.min(100, Math.round((pool.joinedKg / pool.targetKg) * 100));

                  return (
                    <View key={pool.id} style={[styles.poolCompactCard, isDark && styles.poolCompactCardDark]}>
                      <Image source={{ uri: pool.imageUrl }} style={styles.poolCompactThumb} resizeMode="cover" />
                      <View style={{ flex: 1, justifyContent: 'space-between', paddingLeft: 10 }}>
                        <View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.poolCompactTitle, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                              {pool.produceName}
                            </Text>
                            <View style={styles.poolDiscountTag}>
                              <Text style={styles.poolDiscountTagText}>-{discountPct}%</Text>
                            </View>
                          </View>
                          <Text style={[styles.poolCompactFarm, isDark && { color: '#A1A1AA' }]}>
                            {pool.farmerName} • {pool.pickupHub}
                          </Text>
                        </View>

                        <View>
                          <View style={[styles.poolProgressBarMini, isDark && { backgroundColor: '#262626' }]}>
                            <View style={[styles.poolProgressFillMini, { width: `${progressPct}%` }]} />
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <Text style={[styles.poolPriceText, isDark && { color: '#FFFFFF' }]}>
                              ${pool.pricePerKg.toFixed(2)}/kg
                            </Text>
                            <TouchableOpacity
                              style={styles.poolJoinCompactBtn}
                              onPress={() => joinPool(pool.id, 5)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.poolJoinCompactBtnText}>Join (+5kg)</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick Sort / Filter Row */}
            <View style={styles.sortFilterRow}>
              <Text style={[styles.resultCountText, isDark && { color: '#A1A1AA' }]}>
                <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : colors.appleDark }}>{filteredProduce.length}</Text> Fresh Harvests
              </Text>
              <View style={styles.sortPills}>
                <TouchableOpacity
                  onPress={() => setSortBy('featured')}
                  style={[styles.sortPill, isDark && styles.sortPillDark, sortBy === 'featured' && styles.sortPillActive]}
                >
                  <Text style={[styles.sortPillText, isDark && { color: '#D1D5DB' }, sortBy === 'featured' && styles.sortPillTextActive]}>
                    Featured
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('priceAsc')}
                  style={[styles.sortPill, isDark && styles.sortPillDark, sortBy === 'priceAsc' && styles.sortPillActive]}
                >
                  <Text style={[styles.sortPillText, isDark && { color: '#D1D5DB' }, sortBy === 'priceAsc' && styles.sortPillTextActive]}>
                    Lowest Price
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('savings')}
                  style={[styles.sortPill, isDark && styles.sortPillDark, sortBy === 'savings' && styles.sortPillActive]}
                >
                  <Text style={[styles.sortPillText, isDark && { color: '#D1D5DB' }, sortBy === 'savings' && styles.sortPillTextActive]}>
                    Max Savings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Produce Cards List — ULTRA-CLEAN (No Box Clutter!) */}
            {filteredProduce.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="leaf-outline" size={44} color="#D1D5DB" />
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Harvests Found</Text>
                <Text style={[styles.emptySub, isDark && { color: '#A1A1AA' }]}>
                  Try clearing your search query or selecting a different category.
                </Text>
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedGrower(null);
                  }}
                >
                  <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredProduce.map((item, index) => {
                const itemImg =
                  item.imageUrl || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES.Vegetables;
                const isFav = isFavorite(item.id);
                const cartItemQty = getCartQty(item.id);
                const discountPct =
                  item.middlemanPrice > item.price
                    ? Math.round(((item.middlemanPrice - item.price) / item.middlemanPrice) * 100)
                    : 0;

                return (
                  <StaggeredCard key={item.id} index={index}>
                    <AgriCard
                      onPress={() => navigation.navigate('ProductDetail', { produceId: item.id })}
                      style={styles.cleanProduceCard}
                    >
                      {/* Full-width clean photo header */}
                      <View style={styles.cleanImageContainer}>
                        <Image source={{ uri: itemImg }} style={styles.cleanPhoto} resizeMode="cover" />
                        <LinearGradient
                          colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.2)']}
                          style={StyleSheet.absoluteFill}
                        />

                        {/* Top floating heart */}
                        <View style={styles.cleanFloatingTopRow}>
                          <HeartButton isFav={isFav} onPress={() => toggleFavorite(item.id)} />
                        </View>
                      </View>

                      {/* Clean Details — Zero nested boxes */}
                      <View style={styles.cleanCardDetails}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={[styles.cleanItemName, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={[styles.cleanFarmLocation, isDark && { color: '#A1A1AA' }]}>
                              {item.farmerName} • {item.location}
                            </Text>
                          </View>
                        </View>

                        {/* Inline Unified Pricing & Quick Action */}
                        <View style={styles.cleanPriceActionRow}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                              <Text style={[styles.cleanMainPrice, isDark && { color: '#FFFFFF' }]}>
                                ${item.price.toFixed(2)}
                              </Text>
                              <Text style={[styles.cleanPerUnit, isDark && { color: '#A1A1AA' }]}>/ {item.unit}</Text>
                              {item.middlemanPrice > item.price && (
                                <Text style={styles.cleanMiddlemanStrike}>
                                  ${item.middlemanPrice.toFixed(2)}
                                </Text>
                              )}
                            </View>
                          </View>

                          {/* Quick Interactive Add Stepper or Direct Button + Order Button */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {/* Prevent self-purchase / ordering on own harvest */}
                            {userProfile.name &&
                            item.farmerName &&
                            item.farmerName.trim().toLowerCase() === userProfile.name.trim().toLowerCase() ? (
                              <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#F59E0B' }}>Your Harvest</Text>
                              </View>
                            ) : (
                              <>
                                {cartItemQty > 0 ? (
                                  <View style={[styles.cleanMiniStepper, isDark && { backgroundColor: '#262626' }]}>
                                    <TouchableOpacity
                                      style={styles.cleanMiniStepBtn}
                                      onPress={() => updateCartQuantity(item.id, cartItemQty - 1)}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                      <Ionicons name="remove" size={13} color={isDark ? '#FFFFFF' : '#111827'} />
                                    </TouchableOpacity>
                                    <Text style={[styles.cleanMiniStepQty, isDark && { color: '#FFFFFF' }]}>
                                      {cartItemQty}
                                    </Text>
                                    <TouchableOpacity
                                      style={styles.cleanMiniStepBtn}
                                      onPress={() => updateCartQuantity(item.id, cartItemQty + 1)}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                      <Ionicons name="add" size={13} color={isDark ? '#FFFFFF' : '#111827'} />
                                    </TouchableOpacity>
                                  </View>
                                ) : (
                                  <TouchableOpacity
                                    style={[styles.cleanQuickAddBtn, isDark && { backgroundColor: '#2A2A2E' }]}
                                    onPress={() => addToCart(item, 1)}
                                    activeOpacity={0.85}
                                  >
                                    <Ionicons name="cart-outline" size={14} color="#FFFFFF" />
                                    <Text style={styles.cleanQuickAddText}>Add</Text>
                                  </TouchableOpacity>
                                )}

                                {/* Direct Instant Escrow Order Button */}
                                <TouchableOpacity
                                  style={styles.cleanQuickOrderBtn}
                                  onPress={() => setBookingProduce(item)}
                                  activeOpacity={0.85}
                                >
                                  <Ionicons name="flash" size={13} color="#FFFFFF" />
                                  <Text style={styles.cleanQuickOrderText}>Order</Text>
                                </TouchableOpacity>

                                {/* Direct Chat with Farmer Button */}
                                <TouchableOpacity
                                  style={[
                                    {
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      backgroundColor: isDark ? 'rgba(6, 193, 103, 0.15)' : '#E8F5E9',
                                      borderWidth: 1,
                                      borderColor: isDark ? 'rgba(6, 193, 103, 0.3)' : '#C8E6C9',
                                      paddingHorizontal: 8,
                                      paddingVertical: 6,
                                      borderRadius: 18,
                                      gap: 3,
                                    },
                                  ]}
                                  onPress={() => {
                                    navigation.navigate('ChatConversation', {
                                      farmerName: item.farmerName,
                                                                            produceName: item.name,
                                      produceId: item.id,
                                      buyerName: userProfile.name || 'Buyer',
                                    });
                                  }}
                                  activeOpacity={0.85}
                                >
                                  <Ionicons name="chatbubble-ellipses" size={13} color="#06C167" />
                                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#06C167' }}>Chat</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    </AgriCard>
                  </StaggeredCard>
                );
              })
            )}
          </View>
        )}

        {/* =================================================================== */}
        {/* TAB 1: SAVED / FAVORITES                                            */}
        {/* =================================================================== */}
        {activeTab === 'saved' && (
          <View>
            <View style={styles.largeTitleSection}>
              <Text style={[styles.largeTitle, isDark && { color: '#FFFFFF' }]}>Saved Harvests</Text>
              <Text style={[styles.subHeaderDesc, isDark && { color: '#A1A1AA' }]}>
                Quick access to crops and farms you have bookmarked
              </Text>
            </View>

            {savedProduceList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, isDark && { backgroundColor: '#262626' }]}>
                  <Ionicons name="heart-outline" size={38} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Saved Items Yet</Text>
                <Text style={[styles.emptySub, isDark && { color: '#A1A1AA' }]}>
                  Tap the heart icon on any fresh harvest in the marketplace to save it here for later.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBrowseBtn}
                  onPress={() => setActiveTab('marketplace')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBrowseBtnText}>Explore Fresh Harvests</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedProduceList.map(item => {
                const itemImg =
                  item.imageUrl || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES.Vegetables;

                return (
                  <AgriCard key={item.id} style={styles.savedCard}>
                    <View style={styles.savedCardRow}>
                      <Image
                        source={{ uri: itemImg }}
                        style={styles.savedThumb}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={[styles.savedItemName, isDark && { color: '#FFFFFF' }]}>{item.name}</Text>
                          <TouchableOpacity
                            onPress={() => toggleFavorite(item.id)}
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="heart" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.savedFarmName, isDark && { color: '#A1A1AA' }]}>{item.farmerName} • {item.location}</Text>
                        <Text style={styles.savedPriceText}>
                          ${item.price.toFixed(2)}{' '}
                          <Text style={{ fontSize: 11, color: isDark ? '#A1A1AA' : colors.earthTextSecondary }}>/ {item.unit}</Text>
                        </Text>
                      </View>
                    </View>

                    <View style={styles.savedActionsRow}>
                      <SecondaryButton
                        title="View Harvest"
                        onPress={() => navigation.navigate('ProductDetail', { produceId: item.id })}
                        style={{ flex: 1, height: 38 }}
                        textStyle={{ fontSize: 12 }}
                      />
                      <HarvestAccentButton
                        title="Add to Cart"
                        icon={<Ionicons name="cart" size={14} color="#FFFFFF" />}
                        onPress={() => addToCart(item, 1)}
                        style={{ flex: 1, height: 38 }}
                        textStyle={{ fontSize: 12 }}
                      />
                    </View>
                  </AgriCard>
                );
              })
            )}
          </View>
        )}

        {/* =================================================================== */}
        {/* TAB 2: CART & ESCROW CHECKOUT                                       */}
        {/* =================================================================== */}
        {activeTab === 'cart' && (
          <View>
            <View style={styles.largeTitleSection}>
              <Text style={[styles.largeTitle, isDark && { color: '#FFFFFF' }]}>My Basket</Text>
              <Text style={[styles.subHeaderDesc, isDark && { color: '#A1A1AA' }]}>
                {totalCartUnits} {totalCartUnits === 1 ? 'item' : 'items'} ready for escrow checkout
              </Text>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, isDark && { backgroundColor: '#262626' }]}>
                  <Ionicons name="cart-outline" size={38} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>Your Basket is Empty</Text>
                <Text style={[styles.emptySub, isDark && { color: '#A1A1AA' }]}>
                  Fill your basket with farm-fresh produce direct from growers, backed by escrow payment security.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBrowseBtn}
                  onPress={() => setActiveTab('marketplace')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBrowseBtnText}>Start Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Cart Items List */}
                {cart.map(cartItem => {
                  const prod = cartItem.produce;
                  const itemImg =
                    prod.imageUrl || DEFAULT_CATEGORY_IMAGES[prod.category] || DEFAULT_CATEGORY_IMAGES.Vegetables;
                  const itemTotal = prod.price * cartItem.quantity;

                  return (
                    <AgriCard key={prod.id} style={styles.cartCard}>
                      <View style={styles.cartCardRow}>
                        <Image
                          source={{ uri: itemImg }}
                          style={styles.cartItemThumb}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Text style={[styles.cartItemTitle, isDark && { color: '#FFFFFF' }]}>{prod.name}</Text>
                            <TouchableOpacity
                              onPress={() => removeFromCart(prod.id)}
                              style={{ padding: 4 }}
                            >
                              <Ionicons name="trash-outline" size={17} color="#EF4444" />
                            </TouchableOpacity>
                          </View>

                          <Text style={[styles.cartFarmSub, isDark && { color: '#A1A1AA' }]}>{prod.farmerName}</Text>
                          <Text style={styles.cartUnitPrice}>
                            ${prod.price.toFixed(2)} / {prod.unit}
                          </Text>

                          {/* Stepper + Item Total */}
                          <View style={styles.cartStepperRow}>
                            <View style={[styles.stepperContainer, isDark && { backgroundColor: '#262626' }]}>
                              <TouchableOpacity
                                style={[styles.stepperBtn, isDark && { backgroundColor: '#333333' }]}
                                onPress={() => updateCartQuantity(prod.id, cartItem.quantity - 1)}
                              >
                                <Ionicons name="remove" size={14} color={isDark ? '#FFFFFF' : colors.appleDark} />
                              </TouchableOpacity>
                              <Text style={[styles.stepperQty, isDark && { color: '#FFFFFF' }]}>{cartItem.quantity}</Text>
                              <TouchableOpacity
                                style={[styles.stepperBtn, isDark && { backgroundColor: '#333333' }]}
                                onPress={() => updateCartQuantity(prod.id, cartItem.quantity + 1)}
                              >
                                <Ionicons name="add" size={14} color={isDark ? '#FFFFFF' : colors.appleDark} />
                              </TouchableOpacity>
                            </View>

                            <Text style={[styles.cartItemTotalVal, isDark && { color: '#FFFFFF' }]}>
                              ${itemTotal.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </AgriCard>
                  );
                })}

                {/* Delivery Option Selector */}
                <Text style={[styles.sectionHeading, isDark && { color: '#FFFFFF' }]}>Delivery & Logistics Method</Text>
                <View style={styles.deliverySelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryOptionBox,
                      isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' },
                      deliveryMethod === 'Direct Farm Courier' && styles.deliveryOptionActive,
                    ]}
                    onPress={() => setDeliveryMethod('Direct Farm Courier')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="car-outline"
                      size={20}
                      color={deliveryMethod === 'Direct Farm Courier' ? colors.forestGreenPrimary : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.deliveryOptionTitle,
                        isDark && { color: '#FFFFFF' },
                        deliveryMethod === 'Direct Farm Courier' && styles.deliveryOptionTitleActive,
                      ]}
                    >
                      Farm Courier
                    </Text>
                    <Text style={[styles.deliveryOptionPrice, isDark && { color: '#FFFFFF' }]}>+$3.00</Text>
                    <Text style={[styles.deliveryOptionSub, isDark && { color: '#A1A1AA' }]}>Dispatched in chilled crates</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deliveryOptionBox,
                      isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' },
                      deliveryMethod === 'Hub Pickup' && styles.deliveryOptionActive,
                    ]}
                    onPress={() => setDeliveryMethod('Hub Pickup')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color={deliveryMethod === 'Hub Pickup' ? colors.forestGreenPrimary : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.deliveryOptionTitle,
                        isDark && { color: '#FFFFFF' },
                        deliveryMethod === 'Hub Pickup' && styles.deliveryOptionTitleActive,
                      ]}
                    >
                      Hub #4 Pickup
                    </Text>
                    <Text style={[styles.deliveryOptionPrice, { color: '#059669' }]}>FREE</Text>
                    <Text style={[styles.deliveryOptionSub, isDark && { color: '#A1A1AA' }]}>Ready within 4 hours</Text>
                  </TouchableOpacity>
                </View>

                {/* Delivery Address Field */}
                <Text style={[styles.sectionHeading, isDark && { color: '#FFFFFF' }]}>Delivery Destination</Text>
                <View style={[styles.addressInputCard, isDark && { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.12)' }]}>
                  <Ionicons name="location-outline" size={18} color={colors.forestGreenPrimary} />
                  <TextInput
                    style={[styles.addressInput, isDark && { color: '#FFFFFF' }]}
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Enter street address, city, zip..."
                    placeholderTextColor={isDark ? '#71717A' : colors.earthTextMuted}
                  />
                </View>

                {/* Payment & Escrow Guarantee Selector */}
                <Text style={[styles.sectionHeading, isDark && { color: '#FFFFFF' }]}>Payment Mechanism</Text>
                <View style={styles.paymentMethodsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodPill,
                      isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' },
                      paymentMethod === 'AgriPay Escrow' && styles.paymentMethodPillActive,
                    ]}
                    onPress={() => setPaymentMethod('AgriPay Escrow')}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={paymentMethod === 'AgriPay Escrow' ? '#FFFFFF' : colors.forestGreenPrimary}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        isDark && { color: '#FFFFFF' },
                        paymentMethod === 'AgriPay Escrow' && styles.paymentMethodTextActive,
                      ]}
                    >
                      AgriPay Escrow (${(userProfile.walletBalance ?? 240).toFixed(0)})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethodPill,
                      isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' },
                      paymentMethod === 'Apple Pay' && styles.paymentMethodPillActive,
                    ]}
                    onPress={() => setPaymentMethod('Apple Pay')}
                  >
                    <Ionicons
                      name="logo-apple"
                      size={16}
                      color={paymentMethod === 'Apple Pay' ? '#FFFFFF' : (isDark ? '#FFFFFF' : colors.appleDark)}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        isDark && { color: '#FFFFFF' },
                        paymentMethod === 'Apple Pay' && styles.paymentMethodTextActive,
                      ]}
                    >
                      Apple Pay
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethodPill,
                      isDark && { backgroundColor: '#1E1E20', borderColor: 'rgba(255,255,255,0.08)' },
                      paymentMethod === 'Card' && styles.paymentMethodPillActive,
                    ]}
                    onPress={() => setPaymentMethod('Card')}
                  >
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={paymentMethod === 'Card' ? '#FFFFFF' : (isDark ? '#FFFFFF' : colors.appleDark)}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        isDark && { color: '#FFFFFF' },
                        paymentMethod === 'Card' && styles.paymentMethodTextActive,
                      ]}
                    >
                      Card
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Order Summary & Pricing Breakdown */}
                <AgriCard style={styles.summaryCard}>
                  <Text style={[styles.summaryTitle, isDark && { color: '#FFFFFF' }]}>Escrow Payment Summary</Text>

                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDark && { color: '#A1A1AA' }]}>Fresh Produce Subtotal</Text>
                    <Text style={[styles.summaryVal, isDark && { color: '#FFFFFF' }]}>${cartSubtotal.toFixed(2)}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDark && { color: '#A1A1AA' }]}>Logistics & Dispatch</Text>
                    <Text style={[styles.summaryVal, isDark && { color: '#FFFFFF' }]}>
                      {logisticsFee === 0 ? 'FREE' : `$${logisticsFee.toFixed(2)}`}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDark && { color: '#A1A1AA' }]}>Smart Escrow Contract</Text>
                    <Text style={[styles.summaryVal, { color: '#059669', fontWeight: '700' }]}>
                      $0.00 (Free)
                    </Text>
                  </View>

                  <View style={[styles.summaryDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

                  <View style={styles.summaryTotalRow}>
                    <View>
                      <Text style={[styles.summaryTotalLabel, isDark && { color: '#FFFFFF' }]}>Total Escrow Held</Text>
                      <Text style={styles.summaryGuaranteeText}>Released only after your inspection</Text>
                    </View>
                    <Text style={styles.summaryTotalVal}>${cartGrandTotal.toFixed(2)}</Text>
                  </View>
                </AgriCard>

                {/* Trust & Guarantee Banner */}
                <View style={styles.cartEscrowTrustBanner}>
                  <Ionicons name="lock-closed" size={16} color="#059669" />
                  <Text style={styles.cartEscrowTrustText}>
                    100% Escrow Protection: Grower is paid only when you provide your 4-digit handover PIN upon delivery inspection.
                  </Text>
                </View>

                {/* Checkout Button */}
                <HarvestAccentButton
                  title={isSubmittingCheckout ? 'Securing Escrow Vault...' : `Place Escrow Order • $${cartGrandTotal.toFixed(2)}`}
                  icon={<Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />}
                  onPress={handleCartCheckout}
                  disabled={isSubmittingCheckout}
                  style={styles.checkoutBtn}
                />
              </View>
            )}
          </View>
        )}

        {/* =================================================================== */}
        {/* TAB 3: MY ORDERS & LIVE TRACKING                                    */}
        {/* =================================================================== */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.largeTitleSection}>
              <Text style={[styles.largeTitle, isDark && { color: '#FFFFFF' }]}>Orders & Escrow</Text>
              <Text style={[styles.subHeaderDesc, isDark && { color: '#A1A1AA' }]}>
                Real-time farm dispatch, delivery status, and handover PIN codes
              </Text>
            </View>

            {/* Live GPS Radar Floating Banner for Active Orders */}
            {transactions.length > 0 && (
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? '#141416' : '#0F172A',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(6, 193, 103, 0.3)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                onPress={() => setLiveMapTx(transactions[0])}
                activeOpacity={0.88}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#06C167' }} />
                    <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#06C167', letterSpacing: 0.5 }}>
                      ACTIVE GPS RADAR
                    </Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(6, 193, 103, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#06C167' }}>VAN #EV-409</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
                      {transactions[0].produceName} • En Route
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 3 }}>
                      Cold-Chain Chilled at 3.6°C • Arriving in ~14 mins
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#06C167', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="map" size={14} color="#FFFFFF" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Open Map</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, isDark && { backgroundColor: '#262626' }]}>
                  <Ionicons name="receipt-outline" size={38} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>No Orders Yet</Text>
                <Text style={[styles.emptySub, isDark && { color: '#A1A1AA' }]}>
                  When you purchase fresh harvests, your active tracking and handover codes will appear here.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBrowseBtn}
                  onPress={() => setActiveTab('marketplace')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyBrowseBtnText}>Explore Marketplace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              transactions.map(tx => {
                const matchedCrop = produceList.find(p => p.id === tx.produceId);
                const txImg =
                  matchedCrop?.imageUrl || DEFAULT_CATEGORY_IMAGES.Vegetables;
                const pin = tx.handoverPin || '7824';

                return (
                  <AgriCard key={tx.id} style={styles.orderCard}>
                    {/* Header: Thumbnail, Name, Status */}
                    <View style={styles.orderTop}>
                      <Image
                        source={{ uri: txImg }}
                        style={styles.orderThumbnail}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.orderProduce, isDark && { color: '#FFFFFF' }]}>{tx.produceName}</Text>
                        <Text style={[styles.orderCode, isDark && { color: '#A1A1AA' }]}>{tx.trackingCode}</Text>
                        <Text style={[styles.orderDate, isDark && { color: '#71717A' }]}>
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                      <StatusBadge status={tx.status} />
                    </View>

                    {/* Order Metrics Grid */}
                    <View style={[styles.orderGrid, isDark && { backgroundColor: '#1E1E20' }]}>
                      <View>
                        <Text style={[styles.orderGridLabel, isDark && { color: '#9CA3AF' }]}>Grower</Text>
                        <Text style={[styles.orderGridVal, isDark && { color: '#FFFFFF' }]}>{tx.farmerName}</Text>
                      </View>
                      <View>
                        <Text style={[styles.orderGridLabel, isDark && { color: '#9CA3AF' }]}>Quantity</Text>
                        <Text style={[styles.orderGridVal, isDark && { color: '#FFFFFF' }]}>{tx.quantityOrdered}</Text>
                      </View>
                      <View>
                        <Text style={[styles.orderGridLabel, isDark && { color: '#9CA3AF' }]}>Escrow Held</Text>
                        <Text style={[styles.orderGridVal, { color: colors.forestGreenPrimary }]}>
                          ${tx.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Dedicated Logistics Delivery Driver Card */}
                    {(() => {
                      const delivery = getDeliveryForTransaction(tx.id);
                      if (delivery && delivery.assignedDriver) {
                        return (
                          <View
                            style={{
                              backgroundColor: isDark ? '#121214' : '#F8FAFC',
                              borderRadius: 14,
                              padding: 12,
                              marginVertical: 10,
                              borderWidth: 1,
                              borderColor: isDark ? '#27272A' : '#E2E8F0',
                            }}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#06C167' }} />
                                <Text style={{ fontSize: 11, fontWeight: '800', color: isDark ? '#A1A1AA' : '#64748B', textTransform: 'uppercase' }}>
                                  Assigned Courier Driver
                                </Text>
                              </View>
                              <View style={{ backgroundColor: 'rgba(6, 193, 103, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#06C167' }}>
                                  {delivery.status}
                                </Text>
                              </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <Image
                                  source={{ uri: delivery.assignedDriver.profileImage }}
                                  style={{ width: 38, height: 38, borderRadius: 19 }}
                                />
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#FFFFFF' : '#0F172A' }} numberOfLines={1}>
                                    {delivery.assignedDriver.name}
                                  </Text>
                                  <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#64748B' }}>
                                    {delivery.assignedDriver.vehicle.model} • [ {delivery.assignedDriver.vehicle.registrationNumber} ]
                                  </Text>
                                </View>
                              </View>

                              <TouchableOpacity
                                style={{
                                  backgroundColor: '#06C167',
                                  paddingHorizontal: 12,
                                  paddingVertical: 7,
                                  borderRadius: 10,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                                onPress={() => navigation.navigate('DeliveryTracking', { deliveryId: delivery.id })}
                                activeOpacity={0.85}
                              >
                                <Ionicons name="navigate" size={13} color="#FFFFFF" />
                                <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Live Track</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      }
                      return null;
                    })()}

                    {/* Handover PIN & Action Buttons Row */}
                    <View style={styles.pinAndTrackRow}>
                      <View style={styles.pinBadge}>
                        <Ionicons name="key" size={13} color="#D97706" />
                        <Text style={styles.pinBadgeText}>PIN: {pin}</Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.receiptSheetBtn}
                          onPress={() => setReceiptTx(tx)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="receipt-outline" size={13} color={colors.forestGreenPrimary} />
                          <Text style={styles.receiptSheetBtnText}>Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.receiptSheetBtn, { borderColor: '#06C167', backgroundColor: 'rgba(6, 193, 103, 0.08)' }]}
                          onPress={() => setLiveMapTx(tx)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="map" size={13} color="#06C167" />
                          <Text style={[styles.receiptSheetBtnText, { color: '#06C167' }]}>Live Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.trackSheetBtn}
                          onPress={() => setTrackingTx(tx)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="navigate" size={13} color="#FFFFFF" />
                          <Text style={styles.trackSheetBtnText}>Track</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Order Sub-Actions: Chat Grower & Release Escrow */}
                    <View style={styles.orderSubActionsRow}>
                      <TouchableOpacity
                        style={styles.orderChatFarmerBtn}
                        onPress={() => {
                          const matched = produceList.find(p => p.id === tx.produceId) || ({
                            id: tx.produceId,
                            name: tx.produceName,
                            price: tx.amount,
                            unit: 'batch',
                            quantity: tx.quantityOrdered,
                            farmerName: tx.farmerName,
                            farmerPhone: '+1 555-FARM',
                            location: 'Local Farm',
                            imageUrl: txImg,
                            category: 'Vegetables',
                            harvestDate: 'Harvested recently',
                            middlemanPrice: tx.amount * 1.4,
                            description: `Order ${tx.trackingCode}`,
                            isOrganic: true,
                          } as Produce);
                          setChatProduce(matched);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color="#374151" />
                        <Text style={styles.orderChatFarmerText}>Message Farmer</Text>
                      </TouchableOpacity>

                      {tx.status === 'In Transit' && (
                        <TouchableOpacity
                          style={styles.orderReleaseEscrowBtn}
                          onPress={() => {
                            Alert.alert(
                              'Release Escrow Payout',
                              `Confirm satisfactory delivery of ${tx.produceName}? This will disburse $${tx.amount.toFixed(2)} to ${tx.farmerName}.`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Release Funds',
                                  style: 'default',
                                  onPress: () => releaseEscrow(tx.id),
                                },
                              ]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-circle-outline" size={13} color="#059669" />
                          <Text style={styles.orderReleaseEscrowText}>Release Escrow</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Delivery Destination */}
                    <View style={styles.destRow}>
                      <Ionicons name="location-outline" size={14} color={colors.earthTextMuted} />
                      <Text style={styles.destText}>
                        {tx.deliveryMethod} &rarr; {tx.deliveryAddress}
                      </Text>
                    </View>
                  </AgriCard>
                );
              })
            )}
          </View>
        )}

        {/* =================================================================== */}
        {/* TAB 4: PROFILE & WALLET                                             */}
        {/* =================================================================== */}
        {activeTab === 'profile' && (
          <View>
            <View style={styles.largeTitleSection}>
              <Text style={styles.largeTitle}>Buyer Account</Text>
              <Text style={styles.subHeaderDesc}>
                Manage your escrow wallet, delivery addresses, and preferences
              </Text>
            </View>

            {/* Profile Info Card */}
            <AgriCard style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Image
                  source={{ uri: userProfile.avatarUrl }}
                  style={styles.profileAvatar}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.profileName}>{userProfile.name}</Text>
                  <Text style={styles.profileEmail}>{userProfile.email}</Text>
                  <View style={styles.verifiedBuyerPill}>
                    <Ionicons name="shield-checkmark" size={12} color="#059669" />
                    <Text style={styles.verifiedBuyerText}>Verified Escrow Member</Text>
                  </View>
                </View>
              </View>
            </AgriCard>

            {/* Escrow Wallet Card */}
            <AgriCard style={styles.walletCard}>
              <View style={styles.walletTopRow}>
                <View>
                  <Text style={styles.walletCardLabel}>AGRIPAY ESCROW BALANCE</Text>
                  <Text style={styles.walletBalanceBig}>
                    ${(userProfile.walletBalance ?? 240).toFixed(2)}
                  </Text>
                  <Text style={styles.walletStatusSub}>
                    Institutional grade Multi-Sig vault
                  </Text>
                </View>
                <View style={styles.walletIconCircle}>
                  <Ionicons name="shield" size={26} color="#34D399" />
                </View>
              </View>

              {/* Quick Top-Up Steppers */}
              <View style={styles.topUpRow}>
                <TouchableOpacity
                  style={styles.topUpPill}
                  onPress={() => handleQuickTopUp(50)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.topUpPillText}>+$50</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.topUpPill}
                  onPress={() => handleQuickTopUp(100)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.topUpPillText}>+$100</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.topUpPill}
                  onPress={() => handleQuickTopUp(250)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.topUpPillText}>+$250</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.walletCustomTopUpBtn}
                onPress={() => setShowWalletTopUp(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                <Text style={styles.walletCustomTopUpText}>Custom Vault Deposit</Text>
              </TouchableOpacity>
            </AgriCard>

            {/* Display & Aesthetics Theme Switcher */}
            <Text style={[styles.sectionHeading, isDark && { color: '#FFFFFF' }]}>Appearance & Theme</Text>
            <AgriCard style={{ padding: 14, marginBottom: 14 }}>
              <View style={styles.themeRow}>
                <View style={styles.themeIconBox}>
                  <Ionicons
                    name={themeMode === 'dark' ? 'moon' : 'sunny'}
                    size={20}
                    color={themeMode === 'dark' ? '#FBBF24' : '#F59E0B'}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.themeTitle, isDark && { color: '#FFFFFF' }]}>
                    {themeMode === 'dark' ? 'Uber OLED Dark Mode' : 'Daylight Mode'}
                  </Text>
                  <Text style={[styles.themeSub, isDark && { color: '#A1A1AA' }]}>
                    {themeMode === 'dark'
                      ? 'Deep high-contrast blacks for battery saving'
                      : 'Crisp, natural daylight agricultural palette'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.themeSwitchToggle, themeMode === 'dark' && styles.themeSwitchToggleDark]}
                  onPress={toggleThemeMode}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.themeSwitchThumb,
                      themeMode === 'dark' && styles.themeSwitchThumbDark,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </AgriCard>

            {/* Saved Delivery Addresses */}
            <Text style={[styles.sectionHeading, isDark && { color: '#FFFFFF' }]}>Saved Delivery Addresses</Text>
            <AgriCard style={{ padding: 14, marginBottom: 14 }}>
              {(userProfile.savedAddresses || ['144 Harvest Way, Apt 3B, Green Valley, CA']).map((addr, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.addressItemRow,
                    idx < (userProfile.savedAddresses || []).length - 1 && styles.addressBorderBottom,
                    idx < (userProfile.savedAddresses || []).length - 1 && isDark && { borderBottomColor: 'rgba(255,255,255,0.08)' },
                  ]}
                >
                  <Ionicons name="home-outline" size={18} color={colors.forestGreenPrimary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.addressItemText, isDark && { color: '#FFFFFF' }]}>{addr}</Text>
                    <Text style={[styles.addressDefaultTag, isDark && { color: '#71717A' }]}>
                      {idx === 0 ? 'Default Address' : 'Secondary Address'}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                </View>
              ))}
            </AgriCard>

            {/* Portal Role Switcher Card */}
            <Text style={[styles.sectionHeading, isDark && { color: '#FFFFFF' }]}>Quick Role Switcher</Text>
            <AgriCard style={{ padding: 14, marginBottom: 14 }}>
              <TouchableOpacity
                style={styles.roleSwitchRow}
                onPress={() => navigation.navigate('FarmerDashboard')}
                activeOpacity={0.7}
              >
                <View style={styles.roleSwitchIconBox}>
                  <MaterialCommunityIcons name="tractor" size={20} color={colors.forestGreenPrimary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.roleSwitchTitle, isDark && { color: '#FFFFFF' }]}>Switch to Farmer Hub</Text>
                  <Text style={[styles.roleSwitchSub, isDark && { color: '#A1A1AA' }]}>List new harvests, manage crate dispatches</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDark ? '#71717A' : '#9CA3AF'} />
              </TouchableOpacity>

              {userProfile.isLoggedIn === true && userProfile.role === 'ADMIN' && (
                <>
                  <View style={[styles.roleDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

                  <TouchableOpacity
                    style={styles.roleSwitchRow}
                    onPress={() => navigation.navigate('AdminDashboard')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.roleSwitchIconBox, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                      <Ionicons name="hardware-chip-outline" size={20} color="#D97706" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.roleSwitchTitle, isDark && { color: '#FFFFFF' }]}>Switch to Admin Terminal</Text>
                      <Text style={[styles.roleSwitchSub, isDark && { color: '#A1A1AA' }]}>Audit escrow smart contracts & liquidity</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={isDark ? '#71717A' : '#9CA3AF'} />
                  </TouchableOpacity>
                </>
              )}
            </AgriCard>

            {/* Trust, Security & Dispute Center */}
            <AgriCard style={{ padding: 14, marginBottom: 20 }}>
              <View style={styles.safetyRow}>
                <Ionicons name="shield-half" size={18} color="#059669" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.safetyTitle}>AgriConnect Escrow Guarantee</Text>
                  <Text style={[styles.safetySub, isDark && { color: '#A1A1AA' }]}>
                    Zero risk purchasing. Every harvest order is secured in multi-sig cold storage until final delivery validation.
                  </Text>
                </View>
              </View>
            </AgriCard>
          </View>
        )}
      </ScrollView>

      {/* Official Uber Floating Bottom Navigation Bar with Interactive Sliding Bubble */}
      {!hideBottomNav && <UberBottomNavBar activeTab="activity" />}

      {/* Booking Direct Checkout Modal */}
      <BookingCheckoutModal
        visible={!!bookingProduce}
        produce={bookingProduce}
        onClose={() => setBookingProduce(null)}
        onConfirm={async (prod, qty, method, addr, pay) => {
          await bookProduce(prod, qty, method, addr, pay);
          setBookingProduce(null);
          setActiveTab('orders');
        }}
      />

      {/* Interactive 4-Stage Live Order Tracking Sheet */}
      <OrderTrackingModal
        visible={!!trackingTx}
        transaction={trackingTx}
        onClose={() => setTrackingTx(null)}
        cropImage={
          trackingTx
            ? produceList.find(p => p.id === trackingTx.produceId)?.imageUrl
            : undefined
        }
      />

      {/* Fullscreen Interactive GPS Dispatch Radar Map */}
      <InteractiveLiveMap
        visible={!!liveMapTx}
        transaction={liveMapTx}
        onClose={() => setLiveMapTx(null)}
      />

      {/* Digital Fair-Trade Receipt Modal */}
      <FairTradeReceiptModal
        visible={!!receiptTx}
        transaction={receiptTx}
        onClose={() => setReceiptTx(null)}
      />

      {/* Escrow Wallet Top-Up Modal */}
      <WalletTopUpModal
        visible={showWalletTopUp}
        onClose={() => setShowWalletTopUp(false)}
        onTopUp={(amount) => {
          topUpWallet(amount);
          setShowWalletTopUp(false);
        }}
        currentBalance={userProfile.walletBalance}
      />

      {/* Direct Smart Grower Inquiry Chat & Bargaining Modal */}
      {chatProduce && (
        <LiveChatNegotiationModal
          visible={!!chatProduce}
          produce={chatProduce}
          onClose={() => setChatProduce(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Clean Header & Location
  cleanHeaderSection: {
    marginBottom: 12,
  },
  cleanLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cleanLocationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanLocationLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#8E8E93',
  },
  cleanLocationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
    marginTop: 1,
  },
  cleanSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cleanSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.appleDark,
    height: '100%',
  },

  // Growers Story Section
  growersSection: {
    marginBottom: 14,
  },
  cleanSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  cleanSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.appleDark,
    letterSpacing: -0.2,
  },
  cleanResetFilter: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#06C167',
  },
  growersScroll: {
    paddingVertical: 4,
    gap: 14,
  },
  growerStoryItem: {
    alignItems: 'center',
    width: 64,
  },
  growerAvatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2.5,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  growerAvatarRingActive: {
    borderColor: '#06C167',
  },
  growerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  growerVerifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#06C167',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  growerStoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.appleDark,
    marginTop: 5,
    textAlign: 'center',
  },
  growerCropCount: {
    fontSize: 9.5,
    color: '#8E8E93',
    marginTop: 1,
  },
  categoriesScrollContainer: {
    gap: 6,
    paddingVertical: 2,
  },

  // Compact Pools Strip
  poolsCompactSection: {
    marginBottom: 14,
  },
  poolDiscountSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  poolsCompactScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  poolCompactCard: {
    flexDirection: 'row',
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  poolCompactCardDark: {
    backgroundColor: '#1E1E20',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  poolCompactThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  poolCompactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
    flex: 1,
  },
  poolDiscountTag: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 4,
  },
  poolDiscountTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  poolCompactFarm: {
    fontSize: 10.5,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  poolProgressBarMini: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 4,
  },
  poolProgressFillMini: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  poolPriceText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.appleDark,
  },
  poolJoinCompactBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  poolJoinCompactBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Ultra-Clean Produce Card (Zero container clutter!)
  cleanProduceCard: {
    marginBottom: 14,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cleanImageContainer: {
    width: '100%',
    height: 155,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  cleanPhoto: {
    width: '100%',
    height: '100%',
  },
  cleanFloatingTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cleanPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  cleanPillBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cleanCardDetails: {
    padding: 12,
  },
  cleanItemName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.appleDark,
    letterSpacing: -0.3,
  },
  cleanFarmLocation: {
    fontSize: 11.5,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  cleanPriceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  cleanMainPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.appleDark,
    letterSpacing: -0.4,
  },
  cleanPerUnit: {
    fontSize: 11.5,
    color: colors.earthTextSecondary,
    fontWeight: '500',
  },
  cleanMiddlemanStrike: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
    marginLeft: 2,
  },
  cleanSavingsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  cleanSavingsInlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  cleanQuickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.appleDark,
    paddingHorizontal: 11,
    height: 30,
    borderRadius: 15,
    gap: 4,
  },
  cleanQuickAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cleanQuickOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06C167',
    paddingHorizontal: 11,
    height: 30,
    borderRadius: 15,
    gap: 4,
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  cleanQuickOrderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cleanMiniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 6,
  },
  cleanMiniStepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanMiniStepQty: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.appleDark,
    minWidth: 16,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.appleDark,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  walletBalanceText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#047857',
  },
  quickCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  quickCartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.forestGreenPrimary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  quickCartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  uberSegmentContainerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  uberSegmentScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  uberSegmentContainerDark: {
    backgroundColor: '#000000',
    borderBottomColor: '#1F1F1F',
  },
  uberSegmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    flexShrink: 0,
  },
  uberSegmentPillDark: {
    backgroundColor: '#1E1E1E',
  },
  uberSegmentPillActive: {
    backgroundColor: '#000000',
  },
  uberSegmentPillActiveDark: {
    backgroundColor: '#FFFFFF',
  },
  uberSegmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#545454',
  },
  uberSegmentTextDark: {
    color: '#A1A1AA',
  },
  uberSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uberSegmentTextActiveDark: {
    color: '#000000',
    fontWeight: '700',
  },
  largeTitleSection: {
    marginBottom: 12,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.appleDark,
    letterSpacing: -0.5,
  },
  subHeaderDesc: {
    fontSize: 12.5,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  hubIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  hubText: {
    fontSize: 12,
    color: colors.earthTextSecondary,
    fontWeight: '500',
  },
  heroPromoBanner: {
    width: '100%',
    height: 135,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroPromoOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  heroTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  escrowBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  escrowBannerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroHeadline: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 19,
  },
  heroSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 3,
    lineHeight: 14.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.earthTextPrimary,
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  sortFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultCountText: {
    fontSize: 12,
    color: colors.earthTextSecondary,
  },
  sortPills: {
    flexDirection: 'row',
    gap: 6,
  },
  sortPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  sortPillDark: {
    backgroundColor: '#1E1E20',
  },
  sortPillActive: {
    backgroundColor: colors.forestGreenPrimary,
  },
  sortPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.earthTextSecondary,
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  produceCard: {
    marginBottom: 18,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  cropPhoto: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFill as any,
  },
  imageTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.appleDark,
  },
  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  harvestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  harvestTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stockQuantityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  stockQuantityText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.appleDark,
    letterSpacing: -0.3,
  },
  farmerLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  farmerSub: {
    fontSize: 12,
    color: colors.earthTextSecondary,
  },
  pricingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  priceMainCol: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
    marginTop: 1,
  },
  unitVal: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.earthTextSecondary,
  },
  retailCompare: {
    alignItems: 'flex-end',
  },
  retailVal: {
    fontSize: 13,
    color: colors.earthTextMuted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedCropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedCropText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  cropDescription: {
    fontSize: 12,
    color: '#636366',
    lineHeight: 17,
    marginBottom: 12,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  cartBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cartBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.forestGreenPrimary,
  },
  buyBtn: {
    width: '100%',
    height: 40,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.appleDark,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.earthTextSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.forestGreenPrimary,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBrowseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: colors.forestGreenPrimary,
    shadowColor: colors.forestGreenPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emptyBrowseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  savedCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
  },
  savedCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  savedItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.appleDark,
  },
  savedFarmName: {
    fontSize: 12,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  savedPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
    marginTop: 4,
  },
  savedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cartCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
  },
  cartCardRow: {
    flexDirection: 'row',
  },
  cartItemThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.appleDark,
  },
  cartFarmSub: {
    fontSize: 12,
    color: colors.earthTextSecondary,
    marginTop: 1,
  },
  cartUnitPrice: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.forestGreenPrimary,
    marginTop: 3,
  },
  cartStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperQty: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
    paddingHorizontal: 10,
  },
  cartItemTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.appleDark,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.appleDark,
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  deliverySelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  deliveryOptionBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  deliveryOptionActive: {
    borderColor: colors.forestGreenPrimary,
    backgroundColor: 'rgba(5, 150, 105, 0.04)',
  },
  deliveryOptionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.appleDark,
    marginTop: 6,
  },
  deliveryOptionTitleActive: {
    color: colors.forestGreenPrimary,
  },
  deliveryOptionPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.appleDark,
    marginTop: 2,
  },
  deliveryOptionSub: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    marginTop: 2,
  },
  addressInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 12,
  },
  addressInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.earthTextPrimary,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  paymentMethodPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  paymentMethodPillActive: {
    backgroundColor: colors.forestGreenPrimary,
    borderColor: colors.forestGreenPrimary,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.appleDark,
  },
  paymentMethodTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.appleDark,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: colors.earthTextSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.appleDark,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.appleDark,
  },
  summaryGuaranteeText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryTotalVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
  },
  cartEscrowTrustBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  cartEscrowTrustText: {
    flex: 1,
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
  },
  checkoutBtn: {
    height: 48,
    borderRadius: 16,
    marginBottom: 20,
  },
  orderCard: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 20,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  orderProduce: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.earthTextPrimary,
  },
  orderCode: {
    fontSize: 11.5,
    color: colors.earthTextMuted,
    marginTop: 2,
  },
  orderDate: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    marginTop: 1,
  },
  orderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  orderGridLabel: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    fontWeight: '600',
  },
  orderGridVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.earthTextPrimary,
    marginTop: 2,
  },
  pinAndTrackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  pinBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B45309',
  },
  trackSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forestGreenPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  trackSheetBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  destText: {
    fontSize: 12,
    color: colors.earthTextSecondary,
  },
  profileCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.appleDark,
  },
  profileEmail: {
    fontSize: 12.5,
    color: colors.earthTextSecondary,
    marginTop: 1,
  },
  verifiedBuyerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  verifiedBuyerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  walletCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  walletCardLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  walletBalanceBig: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 4,
  },
  walletStatusSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topUpRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topUpPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topUpPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addressItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addressBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  addressItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.appleDark,
  },
  addressDefaultTag: {
    fontSize: 10.5,
    color: colors.earthTextMuted,
    marginTop: 1,
  },
  roleSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  roleSwitchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSwitchTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.appleDark,
  },
  roleSwitchSub: {
    fontSize: 11,
    color: colors.earthTextSecondary,
    marginTop: 1,
  },
  roleDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 6,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  safetySub: {
    fontSize: 11.5,
    color: colors.earthTextSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  // Dark mode & theme switcher styles
  safeAreaDark: {
    backgroundColor: '#0A0A0A',
  },
  topBarDark: {
    backgroundColor: '#121212',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleBtnDark: {
    backgroundColor: '#262626',
  },
  quickCartButtonDark: {
    backgroundColor: '#262626',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.appleDark,
  },
  themeSub: {
    fontSize: 11.5,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  themeSwitchToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  themeSwitchToggleDark: {
    backgroundColor: '#059669',
  },
  themeSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  themeSwitchThumbDark: {
    alignSelf: 'flex-end',
  },
  // Wholesale Harvest Pools Styles
  poolSectionContainer: {
    marginBottom: 16,
  },
  poolSectionHeader: {
    marginBottom: 10,
  },
  poolSectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  poolSectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  poolSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.appleDark,
    letterSpacing: -0.3,
  },
  poolSectionSub: {
    fontSize: 12,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  poolScrollContainer: {
    paddingRight: 8,
    gap: 12,
  },
  poolCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  poolCardDark: {
    backgroundColor: '#171717',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  poolImageBg: {
    width: '100%',
    height: 120,
  },
  poolImageOverlay: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-end',
  },
  poolTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
  },
  poolDiscountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  poolDiscountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  poolTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  poolTimerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  poolCropName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  poolFarmName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  poolBody: {
    padding: 12,
  },
  poolPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  poolPriceLabel: {
    fontSize: 10,
    color: colors.earthTextSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  poolPriceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
  },
  poolUnitText: {
    fontSize: 11,
    color: colors.earthTextSecondary,
    fontWeight: '500',
  },
  poolRegLabel: {
    fontSize: 10,
    color: colors.earthTextMuted,
  },
  poolRegPrice: {
    fontSize: 12.5,
    color: colors.earthTextMuted,
    textDecorationLine: 'line-through',
  },
  poolProgressWrap: {
    marginBottom: 8,
  },
  poolProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  poolProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.appleDark,
  },
  poolProgressPct: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  poolProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  poolProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  poolMembersRow: {
    marginBottom: 10,
  },
  poolAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poolMembersText: {
    fontSize: 11,
    color: colors.earthTextSecondary,
    fontWeight: '500',
  },
  joinPoolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forestGreenPrimary,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  joinPoolBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Order actions & sub-actions
  receiptSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  receiptSheetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forestGreenPrimary,
  },
  orderSubActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  orderChatFarmerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  orderChatFarmerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#374151',
  },
  orderReleaseEscrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  orderReleaseEscrowText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  walletCustomTopUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  walletCustomTopUpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
