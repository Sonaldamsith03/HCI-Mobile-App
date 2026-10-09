import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { UberBottomNavBar } from '../components/UberBottomNavBar';

interface CategoryChip {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  role: 'BUYER';
}

const PRODUCE_CATEGORIES: CategoryChip[] = [
  { id: 'veg', name: 'Vegetables', icon: 'leaf-outline', role: 'BUYER' },
  { id: 'fruit', name: 'Fruits', icon: 'nutrition-outline', role: 'BUYER' },
  { id: 'grains', name: 'Grains & Rice', icon: 'flower-outline', role: 'BUYER' },
  { id: 'spices', name: 'Spices', icon: 'flame-outline', role: 'BUYER' },
  { id: 'organic', name: 'Organic', icon: 'shield-checkmark-outline', role: 'BUYER' },
];

export const RoleSelectionScreen: React.FC<{ hideBottomNav?: boolean }> = ({ hideBottomNav = false }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setCurrentRole, themeMode, toggleThemeMode, setCurrentBottomTab, userProfile } = useApp();
  const isDark = themeMode === 'dark';
  const isAdmin = userProfile.isLoggedIn === true && userProfile.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'services' | 'activity' | 'account'>('services');

  const handleSelectRole = (
    role: 'BUYER' | 'FARMER' | 'COURIER' | 'ADMIN',
    route: keyof RootStackParamList
  ) => {
    setCurrentRole(role);
    navigation.navigate(route as any);
  };

  const handleBottomTabPress = (tab: 'home' | 'services' | 'activity' | 'account') => {
    setActiveBottomTab(tab);
    if (tab === 'activity') {
      setCurrentRole('BUYER');
    }
    setCurrentBottomTab(tab);
    navigation.navigate('MainTabs', { tab });
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />

      {/* Uber Minimalist Top Bar */}
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <TouchableOpacity
          onPress={() => {
            setCurrentBottomTab('home');
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { tab: 'home' });
            }
          }}
          style={[styles.topIconBtn, isDark && styles.topIconBtnDark]}
          activeOpacity={0.7}
          accessibilityLabel="Back to Home"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>

        <View style={styles.topBrandPill}>
          <Text style={[styles.topBrandText, isDark && styles.textWhite]}>
            FarmBy
          </Text>
          <View style={styles.topVerifiedBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#06C167" />
            <Text style={styles.topVerifiedText}>Official</Text>
          </View>
        </View>

        {/* Theme Switcher in Uber Minimalist Style */}
        <TouchableOpacity
          onPress={toggleThemeMode}
          style={[styles.topIconBtn, isDark && styles.topIconBtnDark]}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Uber Move "Services" Heading */}
        <View style={styles.headingSection}>
          <Text style={[styles.screenTitle, isDark && styles.textWhite]}>
            Services
          </Text>
          <Text style={[styles.screenSubtitle, isDark && styles.textSecondaryDark]}>
            Go anywhere, trade anything direct from harvest
          </Text>
        </View>

        {/* Uber Search Bar */}
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Ionicons
            name="search"
            size={18}
            color={isDark ? '#A6A6A6' : '#545454'}
          />
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Search produce, trucks, escrow..."
            placeholderTextColor={isDark ? '#757575' : '#8A8A8A'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={16}
                color={isDark ? '#A6A6A6' : '#757575'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Signed In User Status Banner (if authenticated) */}
        {userProfile.isLoggedIn && (
          <TouchableOpacity
            style={[
              styles.userActiveCard,
              isDark ? styles.userActiveCardDark : styles.userActiveCardLight,
            ]}
            onPress={() => {
              const targetRole =
                userProfile.role === 'ADMIN'
                  ? 'ADMIN'
                  : userProfile.role === 'COURIER'
                  ? 'COURIER'
                  : userProfile.role === 'FARMER'
                  ? 'FARMER'
                  : 'BUYER';
              const targetRoute =
                targetRole === 'ADMIN'
                  ? 'AdminDashboard'
                  : targetRole === 'COURIER'
                  ? 'LogisticsDashboard'
                  : targetRole === 'FARMER'
                  ? 'FarmerDashboard'
                  : 'BuyerDashboard';
              handleSelectRole(targetRole, targetRoute as any);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.userActiveAvatarWrap}>
              <Ionicons name="person-circle" size={38} color="#06C167" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.userActiveName, isDark && styles.textWhite]}>
                  {userProfile.name}
                </Text>
                <View style={styles.signedInBadge}>
                  <Text style={styles.signedInBadgeText}>ACTIVE ACCOUNT</Text>
                </View>
              </View>
              <Text style={[styles.userActiveEmail, isDark && styles.textSecondaryDark]}>
                {userProfile.email} • {userProfile.role || 'BUYER'}
              </Text>
            </View>
            <View style={styles.userActiveAction}>
              <Text style={styles.userActiveActionText}>Go to App</Text>
              <Ionicons name="arrow-forward" size={15} color="#06C167" />
            </View>
          </TouchableOpacity>
        )}

        {/* SECTION 1: Core Portals (Uber 2x2 Bento Tile Grid) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
              Core Portals
            </Text>
            <Text style={[styles.sectionSubtitleTag, isDark && styles.textSecondaryDark]}>
              4 Project Workspaces
            </Text>
          </View>

          {/* 2-Column Bento Grid Row 1 */}
          <View style={styles.gridRow}>
            {/* Tile 1: Buyer Marketplace (Member 1) */}
            <TouchableOpacity
              style={[styles.heroTile, isDark && styles.heroTileDark]}
              onPress={() => handleSelectRole('BUYER', 'BuyerDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.tileBadgeRow}>
                <View style={[styles.uberPill, isDark && styles.uberPillDark]}>
                  <Text style={[styles.uberPillText, isDark && styles.textWhite]}>
                    Member 1
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={isDark ? '#A6A6A6' : '#545454'}
                />
              </View>

              <View style={styles.tileContent}>
                <Text style={[styles.tileTitle, isDark && styles.textWhite]}>
                  Buy Produce
                </Text>
                <Text style={[styles.tileSubtitle, isDark && styles.textSecondaryDark]}>
                  Direct farm gates
                </Text>
              </View>

              <View style={styles.tileIconCorner}>
                <Ionicons
                  name="cart"
                  size={36}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
              </View>
            </TouchableOpacity>

            {/* Tile 2: Farmer Hub (Member 2) */}
            <TouchableOpacity
              style={[styles.heroTile, isDark && styles.heroTileDark]}
              onPress={() => handleSelectRole('FARMER', 'FarmerDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.tileBadgeRow}>
                <View style={[styles.uberPill, isDark && styles.uberPillDark]}>
                  <Text style={[styles.uberPillText, isDark && styles.textWhite]}>
                    Member 2
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={isDark ? '#A6A6A6' : '#545454'}
                />
              </View>

              <View style={styles.tileContent}>
                <Text style={[styles.tileTitle, isDark && styles.textWhite]}>
                  Sell Harvest
                </Text>
                <Text style={[styles.tileSubtitle, isDark && styles.textSecondaryDark]}>
                  List & get paid
                </Text>
              </View>

              <View style={styles.tileIconCorner}>
                <MaterialCommunityIcons
                  name="tractor"
                  size={38}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* 2-Column Bento Grid Row 2 */}
          <View style={styles.gridRow}>
            {/* Tile 3: Logistics & Transport (Member 3) */}
            <TouchableOpacity
              style={[
                styles.heroTile,
                isDark && styles.heroTileDark,
                !isAdmin && { flex: 0, width: '48.3%' },
              ]}
              onPress={() => handleSelectRole('COURIER', 'LogisticsDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.tileBadgeRow}>
                <View style={[styles.uberPill, isDark && styles.uberPillDark]}>
                  <Text style={[styles.uberPillText, isDark && styles.textWhite]}>
                    Member 3
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={isDark ? '#A6A6A6' : '#545454'}
                />
              </View>

              <View style={styles.tileContent}>
                <Text style={[styles.tileTitle, isDark && styles.textWhite]}>
                  Transport
                </Text>
                <Text style={[styles.tileSubtitle, isDark && styles.textSecondaryDark]}>
                  Cold-chain fleet
                </Text>
              </View>

              <View style={styles.tileIconCorner}>
                <Ionicons
                  name="car"
                  size={36}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
              </View>
            </TouchableOpacity>

            {/* Tile 4: Admin Governance & Escrow (Member 4) - ONLY visible if logged in as Admin */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.heroTile, isDark && styles.heroTileDark]}
                onPress={() => handleSelectRole('ADMIN', 'AdminDashboard')}
                activeOpacity={0.8}
              >
                <View style={styles.tileBadgeRow}>
                  <View style={[styles.uberPill, isDark && styles.uberPillDark]}>
                    <Text style={[styles.uberPillText, isDark && styles.textWhite]}>
                      Member 4
                    </Text>
                  </View>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={isDark ? '#A6A6A6' : '#545454'}
                  />
                </View>

                <View style={styles.tileContent}>
                  <Text style={[styles.tileTitle, isDark && styles.textWhite]}>
                    Admin Desk
                  </Text>
                  <Text style={[styles.tileSubtitle, isDark && styles.textSecondaryDark]}>
                    Escrow & disputes
                  </Text>
                </View>

                <View style={styles.tileIconCorner}>
                  <Ionicons
                    name="shield-checkmark"
                    size={36}
                    color={isDark ? '#FFFFFF' : '#000000'}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SECTION: Supabase Cloud & Authentication */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
            Supabase Cloud & Database
          </Text>
          <View style={styles.cloudAccessRow}>
            <TouchableOpacity
              style={[styles.cloudAccessCard, isDark ? styles.cardDark : styles.cardLight]}
              onPress={() => navigation.navigate('Auth', { initialMode: 'login' })}
              activeOpacity={0.8}
            >
              <View style={[styles.cloudAccessIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="key" size={22} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cloudAccessTitle, isDark && styles.textWhite]}>Account Authentication</Text>
                <Text style={styles.cloudAccessDesc}>Sign in or create a Buyer, Farmer, or Driver account</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#3B82F6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cloudAccessCard, isDark ? styles.cardDark : styles.cardLight]}
              onPress={() => navigation.navigate('DatabaseExplorer')}
              activeOpacity={0.8}
            >
              <View style={[styles.cloudAccessIcon, { backgroundColor: 'rgba(6, 193, 103, 0.15)' }]}>
                <Ionicons name="server" size={22} color="#06C167" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cloudAccessTitle, isDark && styles.textWhite]}>Database Cloud Explorer</Text>
                <Text style={styles.cloudAccessDesc}>Inspect live tables: produce, orders, deliveries & queries</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#06C167" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 2: Get anything delivered (Uber Category Carousel) */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
            Explore Harvest Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {PRODUCE_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTile, isDark && styles.categoryTileDark]}
                onPress={() => handleSelectRole(cat.role, 'BuyerDashboard')}
                activeOpacity={0.75}
              >
                <View style={[styles.categoryIconWrap, isDark && styles.categoryIconWrapDark]}>
                  <Ionicons
                    name={cat.icon}
                    size={22}
                    color={isDark ? '#FFFFFF' : '#000000'}
                  />
                </View>
                <Text style={[styles.categoryText, isDark && styles.textWhite]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SECTION 3: Uber Style "Explore more" List */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>
            Agricultural Services
          </Text>

          {/* Service Row 1: Marketplace */}
          <TouchableOpacity
            style={[styles.serviceRow, isDark && styles.serviceRowDark]}
            onPress={() => handleSelectRole('BUYER', 'BuyerDashboard')}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconWrap, isDark && styles.serviceIconWrapDark]}>
              <Ionicons
                name="basket-outline"
                size={22}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>
            <View style={styles.serviceMeta}>
              <View style={styles.serviceTitleLine}>
                <Text style={[styles.serviceTitle, isDark && styles.textWhite]}>
                  Direct Farm Marketplace
                </Text>
                <View style={styles.servicePromoBadge}>
                  <Text style={styles.servicePromoBadgeText}>POPULAR</Text>
                </View>
              </View>
              <Text style={[styles.serviceDesc, isDark && styles.textSecondaryDark]}>
                Direct from Nuwara Eliya, Jaffna & Dambulla economic centers
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#545454' : '#C7C7C7'}
            />
          </TouchableOpacity>

          {/* Service Row 2: Cold-chain Courier */}
          <TouchableOpacity
            style={[styles.serviceRow, isDark && styles.serviceRowDark]}
            onPress={() => handleSelectRole('COURIER', 'LogisticsDashboard')}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconWrap, isDark && styles.serviceIconWrapDark]}>
              <Ionicons
                name="thermometer-outline"
                size={22}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>
            <View style={styles.serviceMeta}>
              <View style={styles.serviceTitleLine}>
                <Text style={[styles.serviceTitle, isDark && styles.textWhite]}>
                  Cold-Chain Dispatch
                </Text>
                <View style={styles.servicePromoBadge}>
                  <Text style={styles.servicePromoBadgeText}>LIVE 3.8°C</Text>
                </View>
              </View>
              <Text style={[styles.serviceDesc, isDark && styles.textSecondaryDark]}>
                GPS-tracked refrigerated fleet with 4-digit recipient PIN release
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#545454' : '#C7C7C7'}
            />
          </TouchableOpacity>

          {/* Service Row 3: Escrow Vault */}
          <TouchableOpacity
            style={[styles.serviceRow, isDark && styles.serviceRowDark]}
            onPress={() => {
              if (isAdmin) {
                handleSelectRole('ADMIN', 'AdminDashboard');
              } else {
                handleBottomTabPress('activity');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconWrap, isDark && styles.serviceIconWrapDark]}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>
            <View style={styles.serviceMeta}>
              <View style={styles.serviceTitleLine}>
                <Text style={[styles.serviceTitle, isDark && styles.textWhite]}>
                  Institutional Escrow Vault
                </Text>
                <View style={styles.servicePromoBadge}>
                  <Text style={styles.servicePromoBadgeText}>SECURED</Text>
                </View>
              </View>
              <Text style={[styles.serviceDesc, isDark && styles.textSecondaryDark]}>
                Funds held safely until buyer inspects weight and harvest quality
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#545454' : '#C7C7C7'}
            />
          </TouchableOpacity>

          {/* Service Row 4: Farmer KYC Certification */}
          <TouchableOpacity
            style={[styles.serviceRow, isDark && styles.serviceRowDark]}
            onPress={() => {
              if (isAdmin) {
                handleSelectRole('ADMIN', 'AdminDashboard');
              } else {
                handleSelectRole('FARMER', 'FarmerDashboard');
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconWrap, isDark && styles.serviceIconWrapDark]}>
              <Ionicons
                name="ribbon-outline"
                size={22}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>
            <View style={styles.serviceMeta}>
              <View style={styles.serviceTitleLine}>
                <Text style={[styles.serviceTitle, isDark && styles.textWhite]}>
                  Farmer KYC & Soil Certification
                </Text>
                <View style={styles.servicePromoBadge}>
                  <Text style={styles.servicePromoBadgeText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={[styles.serviceDesc, isDark && styles.textSecondaryDark]}>
                Government agricultural audit records and fair trade badges
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#545454' : '#C7C7C7'}
            />
          </TouchableOpacity>
        </View>

        {/* SECTION 4: Uber Style Banner (Promo / Guarantee) */}
        <View style={[styles.uberBanner, isDark && styles.uberBannerDark]}>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, isDark && styles.textWhite]}>
              Direct Farm Guarantee
            </Text>
            <Text style={[styles.bannerBody, isDark && styles.textSecondaryDark]}>
              0% broker deductions. Verified field sensors and institutional escrow on all trades.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bannerBtn, isDark && styles.bannerBtnDark]}
            onPress={() => {
              setCurrentBottomTab('account');
              navigation.navigate('MainTabs', { tab: 'account' });
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.bannerBtnText, isDark && styles.textWhite]}>
              Guide
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Official Uber Bottom Navigation Bar with Sliding Bubble Animation */}
      {!hideBottomNav && <UberBottomNavBar activeTab="services" />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textSecondaryDark: {
    color: '#A6A6A6',
  },

  /* ================== UBER TOP BAR ================== */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topBarDark: {
    backgroundColor: '#000000',
    borderBottomColor: '#1A1A1A',
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topIconBtnDark: {
    backgroundColor: '#1E1E1E',
  },
  topBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
  },
  topVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6, 193, 103, 0.10)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  topVerifiedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#06C167',
  },

  /* ================== SCROLL CONTENT ================== */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 84,
  },

  /* ================== HEADING SECTION ================== */
  headingSection: {
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -1,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#545454',
    marginTop: 2,
  },

  /* ================== UBER SEARCH BAR ================== */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
    marginBottom: 22,
    gap: 10,
  },
  searchBarDark: {
    backgroundColor: '#1E1E1E',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    paddingVertical: 0,
  },
  searchInputDark: {
    color: '#FFFFFF',
  },

  /* ================== SECTION BLOCK ================== */
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  sectionSubtitleTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 14,
  },

  /* ================== 2x2 BENTO GRID ================== */
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  heroTile: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 14,
    height: 124,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTileDark: {
    backgroundColor: '#1E1E1E',
  },
  tileBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uberPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uberPillDark: {
    backgroundColor: '#2C2C2E',
  },
  uberPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.2,
  },
  tileContent: {
    marginTop: 'auto',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  tileSubtitle: {
    fontSize: 11.5,
    color: '#757575',
    marginTop: 1,
  },
  tileIconCorner: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    opacity: 0.85,
  },

  /* ================== CATEGORY CAROUSEL ================== */
  categoryScroll: {
    gap: 10,
    paddingRight: 10,
  },
  categoryTile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 86,
    gap: 6,
  },
  categoryTileDark: {
    backgroundColor: '#1E1E1E',
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconWrapDark: {
    backgroundColor: '#2A2A2A',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },

  /* ================== SERVICES LIST ROWS ================== */
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceRowDark: {
    borderBottomColor: '#1E1E1E',
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  serviceIconWrapDark: {
    backgroundColor: '#1E1E1E',
  },
  serviceMeta: {
    flex: 1,
    paddingRight: 8,
  },
  serviceTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },
  servicePromoBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  servicePromoBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  serviceDesc: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 16,
    marginTop: 3,
  },

  /* ================== UBER PROMO BANNER ================== */
  uberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  uberBannerDark: {
    backgroundColor: '#1E1E1E',
  },
  bannerTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
  bannerBody: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 16,
    marginTop: 3,
  },
  bannerBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerBtnDark: {
    backgroundColor: '#FFFFFF',
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ================== UBER BOTTOM TAB BAR ================== */
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  bottomTabBarDark: {
    backgroundColor: '#000000',
    borderTopColor: '#1A1A1A',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#757575',
  },
  tabLabelActive: {
    fontWeight: '800',
    color: '#000000',
  },
  tabLabelDark: {
    color: '#757575',
  },
  tabLabelActiveDark: {
    color: '#FFFFFF',
  },
  cloudAccessRow: {
    gap: 10,
    marginTop: 6,
  },
  cloudAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardDark: {
    backgroundColor: '#121214',
    borderColor: '#27272A',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cloudAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudAccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  cloudAccessDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  userActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  userActiveCardDark: {
    backgroundColor: '#161618',
    borderColor: 'rgba(6, 193, 103, 0.35)',
  },
  userActiveCardLight: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(6, 193, 103, 0.4)',
  },
  userActiveAvatarWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userActiveName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  signedInBadge: {
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  signedInBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.3,
  },
  userActiveEmail: {
    fontSize: 12,
    color: '#545454',
    marginTop: 2,
  },
  userActiveAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  userActiveActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
});
