import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { UberBottomNavBar } from '../components/UberBottomNavBar';
import { InteractiveLiveMap } from '../components/InteractiveLiveMap';

interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
  iconName: string;
  role: 'BUYER' | 'FARMER' | 'COURIER';
  route: keyof RootStackParamList;
}

const RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    title: 'Nuwara Eliya Leeks (250 kg)',
    subtitle: 'Cold-Chain Van #EV-409 • En Route',
    time: '25 min ago',
    status: 'In Transit',
    iconName: 'car',
    role: 'COURIER',
    route: 'LogisticsDashboard',
  },
  {
    id: 'act-2',
    title: 'Dambulla Red Onions (500 kg)',
    subtitle: 'Escrow holding $680.00 • Harvest Verified',
    time: '2 hours ago',
    status: 'Escrow Locked',
    iconName: 'shield-checkmark',
    role: 'BUYER',
    route: 'BuyerDashboard',
  },
];

export const LandingScreen: React.FC<{ hideBottomNav?: boolean }> = ({ hideBottomNav = false }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, toggleThemeMode, setCurrentRole, userProfile, setCurrentBottomTab, transactions } = useApp();
  const isDark = themeMode === 'dark';
  const [showLiveMap, setShowLiveMap] = useState(false);

  const handleNavigatePortal = (role: 'BUYER' | 'FARMER' | 'COURIER' | 'ADMIN', route: keyof RootStackParamList) => {
    setCurrentRole(role);
    if (route === 'BuyerDashboard') {
      setCurrentBottomTab('activity');
    }
    navigation.navigate(route as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />

      {/* Uber Home Top Bar */}
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <View style={styles.brandRow}>
          <Logo size="sm" variant="mark" themeMode={isDark ? 'dark' : 'light'} />
          <Text style={[styles.brandTitle, isDark && styles.textWhite]}>
            FarmBy
          </Text>
        </View>

        <View style={styles.topRightControls}>
          <TouchableOpacity
            onPress={toggleThemeMode}
            style={[styles.circleBtn, isDark && styles.circleBtnDark]}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Theme"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setCurrentBottomTab('account');
              navigation.navigate('MainTabs', { tab: 'account' });
            }}
            style={[styles.circleBtn, isDark && styles.circleBtnDark]}
            activeOpacity={0.7}
            accessibilityLabel="About FarmBy"
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Uber Home "Where to?" Search Bar */}
        <TouchableOpacity
          style={[styles.whereToBar, isDark && styles.whereToBarDark]}
          onPress={() => handleNavigatePortal('BUYER', 'BuyerDashboard')}
          activeOpacity={0.85}
        >
          <View style={styles.whereToLeft}>
            <Ionicons name="search" size={19} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.whereToText, isDark && styles.whereToTextDark]}>
              Search farm harvest, wholesale yields...
            </Text>
          </View>
          <View style={[styles.nowChip, isDark && styles.nowChipDark]}>
            <Ionicons name="time" size={13} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.nowChipText, isDark && styles.textWhite]}>Now</Text>
          </View>
        </TouchableOpacity>

        {/* Live Escrow & Fleet Telemetry Status Pill (Click to open interactive map) */}
        <TouchableOpacity
          style={[styles.liveStatusCard, isDark && styles.liveStatusCardDark]}
          onPress={() => setShowLiveMap(true)}
          activeOpacity={0.88}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveStatusTitle}>ACTIVE HARVEST FLEET RADAR</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="map" size={13} color="#06C167" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#06C167' }}>Tap Map</Text>
            </View>
          </View>
          <View style={styles.liveMetricsRow}>
            <View style={styles.liveMetricCol}>
              <Text style={[styles.liveMetricVal, isDark && styles.textWhite]}>3.8°C</Text>
              <Text style={styles.liveMetricSub}>Cold-Chain Fleet</Text>
            </View>
            <View style={styles.liveMetricDivider} />
            <View style={styles.liveMetricCol}>
              <Text style={[styles.liveMetricVal, { color: '#06C167' }]}>$128.4k</Text>
              <Text style={styles.liveMetricSub}>Escrow Protected</Text>
            </View>
            <View style={styles.liveMetricDivider} />
            <View style={styles.liveMetricCol}>
              <Text style={[styles.liveMetricVal, isDark && styles.textWhite]}>0%</Text>
              <Text style={styles.liveMetricSub}>Middleman Cut</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section: Recent Live Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>
              Live Activity
            </Text>
            <TouchableOpacity
              onPress={() => {
                setCurrentRole('BUYER');
                navigation.navigate('BuyerDashboard', { initialTab: 'orders' });
              }}
            >
              <Text style={styles.sectionActionText}>View all</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ACTIVITIES.map(act => (
            <TouchableOpacity
              key={act.id}
              style={[styles.activityRow, isDark && styles.activityRowDark]}
              onPress={() => handleNavigatePortal(act.role, act.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.activityIconCircle, isDark && styles.activityIconCircleDark]}>
                <Ionicons
                  name={act.iconName as any}
                  size={19}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
              </View>
              <View style={styles.activityMeta}>
                <View style={styles.activityTitleLine}>
                  <Text style={[styles.activityTitle, isDark && styles.textWhite]}>
                    {act.title}
                  </Text>
                  <View style={styles.activityStatusChip}>
                    <Text style={styles.activityStatusChipText}>{act.status}</Text>
                  </View>
                </View>
                <Text style={styles.activitySub}>{act.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={isDark ? '#545454' : '#BDBDBD'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: Quick Portals Shortcut */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>
              Explore Workspaces
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
              <Text style={styles.sectionActionText}>All Services ➜</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.portalPillsGrid}>
            <TouchableOpacity
              style={[styles.portalPillCard, isDark && styles.portalPillCardDark]}
              onPress={() => handleNavigatePortal('BUYER', 'BuyerDashboard')}
              activeOpacity={0.8}
            >
              <Ionicons name="basket" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.portalPillTitle, isDark && styles.textWhite]}>Marketplace</Text>
              <Text style={styles.portalPillSub}>Member 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalPillCard, isDark && styles.portalPillCardDark]}
              onPress={() => handleNavigatePortal('FARMER', 'FarmerDashboard')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="tractor" size={26} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.portalPillTitle, isDark && styles.textWhite]}>Farmer Hub</Text>
              <Text style={styles.portalPillSub}>Member 2</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalPillCard, isDark && styles.portalPillCardDark]}
              onPress={() => handleNavigatePortal('COURIER', 'LogisticsDashboard')}
              activeOpacity={0.8}
            >
              <Ionicons name="car" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.portalPillTitle, isDark && styles.textWhite]}>Fleet Courier</Text>
              <Text style={styles.portalPillSub}>Member 3</Text>
            </TouchableOpacity>

            {userProfile.isLoggedIn === true && userProfile.role === 'ADMIN' && (
              <TouchableOpacity
                style={[styles.portalPillCard, isDark && styles.portalPillCardDark]}
                onPress={() => handleNavigatePortal('ADMIN', 'AdminDashboard')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={[styles.portalPillTitle, isDark && styles.textWhite]}>Escrow Admin</Text>
                <Text style={styles.portalPillSub}>Member 4</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Uber-Style Promo Guarantee Card */}
        <View style={[styles.homePromoCard, isDark && styles.homePromoCardDark]}>
          <View style={styles.homePromoTextGroup}>
            <Text style={[styles.homePromoHeading, isDark && styles.textWhite]}>
              100% Escrow Guarantee
            </Text>
            <Text style={styles.homePromoBody}>
              All buyer funds are held in institutional escrow until physical quality check at farm gate or doorstep.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.homePromoActionBtn, isDark && styles.homePromoActionBtnDark]}
            onPress={() => navigation.navigate('RoleSelection')}
            activeOpacity={0.85}
          >
            <Text style={[styles.homePromoActionBtnText, isDark && styles.textWhite]}>
              Portals
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Official Uber Bottom Navigation Bar with Sliding Bubble Animation */}
      {!hideBottomNav && <UberBottomNavBar activeTab="home" />}

      {/* Interactive Fullscreen Logistics Fleet Map */}
      <InteractiveLiveMap
        visible={showLiveMap}
        onClose={() => setShowLiveMap(false)}
        transaction={transactions.length > 0 ? transactions[0] : null}
      />
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

  /* ================== TOP BAR ================== */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 24 : 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  topBarDark: {
    backgroundColor: '#000000',
    borderBottomColor: '#1A1A1A',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnDark: {
    backgroundColor: '#1E1E1E',
  },

  /* ================== SCROLL CONTENT ================== */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 84,
  },

  /* ================== WHERE TO BAR ================== */
  whereToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F3F3',
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 52,
    marginBottom: 16,
  },
  whereToBarDark: {
    backgroundColor: '#1E1E1E',
  },
  whereToLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  whereToText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  whereToTextDark: {
    color: '#FFFFFF',
  },
  nowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  nowChipDark: {
    backgroundColor: '#2A2A2A',
  },
  nowChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },

  /* ================== LIVE STATUS CARD ================== */
  liveStatusCard: {
    backgroundColor: '#F3F3F3',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  liveStatusCardDark: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222222',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#06C167',
  },
  liveStatusTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#757575',
    letterSpacing: 0.8,
  },
  liveMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  liveMetricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
  },
  liveMetricSub: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  liveMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },

  /* ================== SECTION WRAPPER ================== */
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.4,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06C167',
  },

  /* ================== ACTIVITY ROWS ================== */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityRowDark: {
    borderBottomColor: '#1A1A1A',
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconCircleDark: {
    backgroundColor: '#1E1E1E',
  },
  activityMeta: {
    flex: 1,
    paddingRight: 8,
  },
  activityTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  activityStatusChip: {
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityStatusChipText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#06C167',
  },
  activitySub: {
    fontSize: 11.5,
    color: '#757575',
  },

  /* ================== PORTAL PILLS (4 SQUARES) ================== */
  portalPillsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  portalPillCard: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  portalPillCardDark: {
    backgroundColor: '#1E1E1E',
  },
  portalPillTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  portalPillSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#757575',
  },

  /* ================== PROMO CARD ================== */
  homePromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  homePromoCardDark: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222222',
  },
  homePromoTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  homePromoHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.2,
  },
  homePromoBody: {
    fontSize: 11.5,
    color: '#757575',
    lineHeight: 16,
    marginTop: 3,
  },
  homePromoActionBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  homePromoActionBtnDark: {
    backgroundColor: '#FFFFFF',
  },
  homePromoActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ================== BOTTOM TAB BAR ================== */
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
});
