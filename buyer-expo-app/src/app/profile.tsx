import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FarmToast } from '@/components/FloatingCartBar';
import { useFarm, BuyerRequirement } from '@/context/FarmContext';
import { ReverseMarketplaceCard } from '@/components/ReverseMarketplaceCard';
import { PostRequirementModal } from '@/components/PostRequirementModal';
import { MyPostsModal } from '@/components/MyPostsModal';

const USER = {
  name: 'Heshani Wickramasinghe',
  email: 'heshani.w@gmail.com',
  phone: '+94 77 982 4310',
  avatarUrl: 'https://i.pravatar.cc/150?img=47',
  role: 'Restaurant Buyer',
  location: 'Kaluthara, Sri Lanka',
  walletBalance: 2450,
};

const STAPLES = ['Heirloom Tomatoes', 'Rainbow Chard', 'Sweet Bell Peppers', 'Gotu Kola & Herbs'];

const ADDRESSES = [
  {
    id: '1',
    label: 'Home - Kaluthara Villa',
    isPrimary: true,
    address: 'No. 42 Riverside Road, Kaluthara South',
    note: 'Leave at front porch inside shaded wicker basket',
  },
];

const SAVED_STALLS = [
  {
    id: 'maliths-family-farm',
    name: "Malith's Farm",
    distance: '4.2 mi - Kaluthara East',
    rating: 4.9,
    reviews: 184,
    specialty: 'Famous for soil-ripened Roma Vine tomatoes & bell peppers.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80',
  },
  {
    id: 'meadowview-farm',
    name: 'Meadowview',
    distance: '3.1 mi',
    rating: 4.9,
    specialty: 'Specialises in fresh baby greens.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80',
  },
];

export default function ProfileScreen() {
  const {
    showToast,
    offers,
    buyerRequirements,
    addBuyerRequirement,
    updateBuyerRequirement,
    deleteBuyerRequirement,
  } = useFarm();
  const [organicToggle, setOrganicToggle] = useState(true);
  const [dawnToggle, setDawnToggle] = useState(true);

  // Reverse Marketplace Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMyPostsModalOpen, setIsMyPostsModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<BuyerRequirement | null>(null);

  const acceptedOffer = offers.find((o) => o.status === 'Accepted') ?? offers[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark}>
            <Ionicons name="leaf" size={14} color="#fff" />
          </View>
          <View>
            <Text style={styles.logoText}>FARMBY</Text>
            <Text style={styles.headerSub}>Profile</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} onPress={() => showToast('No new notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </Pressable>
          <Pressable style={[styles.iconBtn, styles.avatarBtn]}>
            <Ionicons name="person" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Location bar */}
      <View style={styles.locationBar}>
        <Ionicons name="location-sharp" size={14} color="#15803D" />
        <Text style={styles.locationText}>{USER.location}</Text>
        <Pressable
          style={styles.settingsChip}
          onPress={() => showToast('Settings coming soon!')}>
          <Ionicons name="settings-outline" size={12} color="#EA580C" />
          <Text style={styles.settingsChipText}>SETTINGS</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>

        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={{ uri: USER.avatarUrl }} style={styles.avatar} contentFit="cover" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{USER.name}</Text>
            <Text style={styles.userEmail}>{USER.email} {'\u2022'} {USER.phone}</Text>
            <View style={styles.userBadgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Restaurant Buyer</Text>
              </View>
              <Pressable
                style={styles.switchModeBtn}
                onPress={() => showToast('Mode switch coming soon!')}>
                <Text style={styles.switchModeBtnText}>Switch Mode</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="leaf" size={14} color="#15803D" />
            <Text style={styles.statValue}>14.2 kg</Text>
            <Text style={styles.statLabel}>CO{'\u2082'} Offset</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable style={styles.statItem} onPress={() => showToast('24 Dawn Drops earned!')}>
            <Ionicons name="sunny-outline" size={14} color="#EA580C" />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Dawn Drops</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable style={styles.statItem} onPress={() => router.push('/impact' as any)}>
            <Ionicons name="trending-up" size={14} color="#15803D" />
            <Text style={styles.statValue}>18.4k</Text>
            <Text style={styles.statLabel}>Direct to Farm</Text>
          </Pressable>
        </View>

        {/* Active Notification Banner */}
        {acceptedOffer && (
          <View style={styles.activeOfferBanner}>
            <View style={styles.activeOfferLeft}>
              <View style={styles.activeDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activePill}>ACTIVE</Text>
                <Text style={styles.activeOfferTitle} numberOfLines={1}>
                  Farmer Malith accepted offer for {acceptedOffer.cropTitle}...
                </Text>
                <Text style={styles.activeOfferSub}>
                  Rs. {acceptedOffer.offeredPrice}/{acceptedOffer.unit} {'\u2022'} Ready for sunrise harvest
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.reviewBtn}
              onPress={() => router.push(`/offer/${acceptedOffer.id}` as any)}>
              <Text style={styles.reviewBtnText}>Review</Text>
            </Pressable>
          </View>
        )}

        {/* Reverse Marketplace Card (Custom Produce Requirements) */}
        <ReverseMarketplaceCard
          onPostRequirement={() => {
            setEditingRequirement(null);
            setIsPostModalOpen(true);
          }}
          onViewMyPosts={() => setIsMyPostsModalOpen(true)}
          postCount={buyerRequirements.length}
        />

        {/* Kitchen & Harvest Tastes */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Kitchen &amp; Harvest Tastes</Text>
            <Pressable onPress={() => showToast('Edit preferences saved!')}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>100% Organic &amp; Residue-Free</Text>
                <Text style={styles.toggleSub}>Prioritise chemical-free certified plots</Text>
              </View>
            </View>
            <Switch
              value={organicToggle}
              onValueChange={setOrganicToggle}
              trackColor={{ false: '#E2E8F0', true: '#15803D' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Ionicons name="time-outline" size={16} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Dawn Dispatch Only</Text>
                <Text style={styles.toggleSub}>Picked before 6:00 AM with dew intact</Text>
              </View>
            </View>
            <Switch
              value={dawnToggle}
              onValueChange={setDawnToggle}
              trackColor={{ false: '#E2E8F0', true: '#15803D' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.stapleHeading}>PRIORITY PANTRY STAPLES</Text>
          <View style={styles.stapleGrid}>
            {STAPLES.map((s) => (
              <View key={s} style={styles.stapleChip}>
                <View style={styles.stapleDot} />
                <Text style={styles.stapleText}>{s}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={styles.addCropBtn}
            onPress={() => router.push('/explore' as any)}>
            <Ionicons name="add-circle" size={16} color="#15803D" />
            <Text style={styles.addCropText}>Add Crop</Text>
          </Pressable>
        </View>

        {/* Fresh Drop Addresses */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Fresh Drop Addresses</Text>
            <Pressable onPress={() => showToast('New address form coming soon!')}>
              <Text style={styles.editLink}>+ Add New</Text>
            </Pressable>
          </View>
          {ADDRESSES.map((addr) => (
            <View key={addr.id} style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <Ionicons name="home-outline" size={18} color="#15803D" />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressLabelRow}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                    </View>
                  )}
                  <Pressable onPress={() => showToast('Edit address coming soon!')}>
                    <Ionicons name="pencil-outline" size={14} color="#94A3B8" />
                  </Pressable>
                </View>
                <Text style={styles.addressText}>{addr.address}</Text>
                <View style={styles.addressNoteRow}>
                  <Ionicons name="information-circle-outline" size={12} color="#EA580C" />
                  <Text style={styles.addressNote}>{addr.note}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Saved Farm Stalls */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Saved Farm Stalls</Text>
            <Pressable onPress={() => router.push('/map' as any)}>
              <Text style={styles.editLink}>View All (6) &gt;</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stallsScroll}>
            {SAVED_STALLS.map((stall) => (
              <View key={stall.id} style={styles.stallCard}>
                <Image source={{ uri: stall.image }} style={styles.stallImage} contentFit="cover" />
                <Text style={styles.stallName}>{stall.name}</Text>
                <Text style={styles.stallDist}>{stall.distance}</Text>
                <View style={styles.stallRatingRow}>
                  <Ionicons name="star" size={11} color="#FBBF24" />
                  <Text style={styles.stallRating}>{stall.rating}</Text>
                </View>
                <Text style={styles.stallSpecialty} numberOfLines={2}>{stall.specialty}</Text>
                <View style={styles.stallActions}>
                  <Pressable
                    style={styles.visitBtn}
                    onPress={() => router.push(`/farm/${stall.id}` as any)}>
                    <Text style={styles.visitBtnText}>Visit Stall</Text>
                  </Pressable>
                  <Pressable
                    style={styles.chatStallBtn}
                    onPress={() => router.push(`/chat/${stall.id}` as any)}>
                    <Ionicons name="chatbubble-outline" size={16} color="#15803D" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Account & Preferences */}
        <View style={styles.card}>
          <Text style={styles.acctHeading}>ACCOUNT &amp; PREFERENCES</Text>
          {[
            {
              icon: 'card-outline' as const,
              label: 'Payment & Farm Escrow',
              sub: 'Direct farmer bank transfer, Card, UPI',
              value: `Rs. ${USER.walletBalance.toLocaleString()} Bal`,
              onPress: () => showToast('Payment settings coming soon!'),
            },
            {
              icon: 'notifications-outline' as const,
              label: 'Dawn Harvest Alerts',
              sub: 'Get pinged when Kaluthara plots finish cuts',
              value: '',
              onPress: () => showToast('Alert settings saved!'),
            },
            {
              icon: 'help-circle-outline' as const,
              label: 'FarmBy Help & Fair Trade Care',
              sub: 'Contact local coordinator in Kaluthara',
              value: '',
              onPress: () => showToast('Connecting you to support...'),
            },
            {
              icon: 'shield-checkmark-outline' as const,
              label: 'Household Sustainability Badge',
              sub: 'Level 3 Local Sustainer',
              value: '',
              onPress: () => router.push('/impact' as any),
            },
          ].map((item) => (
            <Pressable key={item.label} style={styles.acctRow} onPress={item.onPress}>
              <View style={styles.acctIconWrap}>
                <Ionicons name={item.icon} size={18} color="#15803D" />
              </View>
              <View style={styles.acctInfo}>
                <Text style={styles.acctLabel}>{item.label}</Text>
                <Text style={styles.acctSub}>{item.sub}</Text>
              </View>
              {item.value ? (
                <Text style={styles.acctValue}>{item.value}</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </Pressable>
          ))}
        </View>

        {/* Log Out */}
        <Pressable
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: () => showToast('Logged out!') },
            ])
          }>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out from FarmBy</Text>
        </Pressable>

        <Text style={styles.footer}>FarmBy Sri Lanka {'\u2022'} Direct From Farms v2.4.1</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Post a Requirement Modal (Create / Edit) */}
      <PostRequirementModal
        visible={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingRequirement(null);
        }}
        onSubmit={(data) => {
          if (editingRequirement) {
            updateBuyerRequirement(editingRequirement.id, data);
          } else {
            addBuyerRequirement(data);
          }
        }}
        initialData={editingRequirement}
      />

      {/* My Posts Modal (View, Edit, Delete, Farmer Bids & Chat) */}
      <MyPostsModal
        visible={isMyPostsModalOpen}
        onClose={() => setIsMyPostsModalOpen(false)}
        posts={buyerRequirements}
        onEdit={(post) => {
          setEditingRequirement(post);
          setIsMyPostsModalOpen(false);
          setIsPostModalOpen(true);
        }}
        onDelete={(postId) => deleteBuyerRequirement(postId)}
        onOpenCreate={() => {
          setEditingRequirement(null);
          setIsPostModalOpen(true);
        }}
      />

      <BottomNavBar currentTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 13, fontWeight: '900', color: '#15803D', letterSpacing: 1 },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4 },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    backgroundColor: '#FAFAF9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  locationText: { flex: 1, fontSize: 12.5, color: '#334155', fontWeight: '600' },
  settingsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settingsChipText: { fontSize: 10, fontWeight: '800', color: '#EA580C', letterSpacing: 0.5 },

  scrollView: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 14, gap: 12 },

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1F5F9' },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  userEmail: { fontSize: 10.5, color: '#64748B' },
  userBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roleBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#854D0E' },
  switchModeBtn: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  switchModeBtnText: { fontSize: 11, fontWeight: '700', color: '#15803D' },

  statsRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#64748B', fontWeight: '500' },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },

  activeOfferBanner: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 8,
  },
  activeOfferLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginTop: 4,
  },
  activePill: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  activeOfferTitle: { fontSize: 12.5, fontWeight: '700', color: '#1E293B' },
  activeOfferSub: { fontSize: 10.5, color: '#92400E', marginTop: 1 },
  reviewBtn: {
    backgroundColor: '#15803D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reviewBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  editLink: { fontSize: 12, fontWeight: '700', color: '#15803D' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  toggleIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: { fontSize: 12.5, fontWeight: '700', color: '#1E293B' },
  toggleSub: { fontSize: 10.5, color: '#64748B', marginTop: 1 },

  stapleHeading: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  stapleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stapleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stapleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#15803D' },
  stapleText: { fontSize: 11.5, fontWeight: '600', color: '#15803D' },
  addCropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#15803D',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  addCropText: { fontSize: 12, fontWeight: '700', color: '#15803D' },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    padding: 10,
  },
  addressIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1, gap: 2 },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressLabel: { fontSize: 12.5, fontWeight: '700', color: '#1E293B', flex: 1 },
  primaryBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: { fontSize: 9, fontWeight: '800', color: '#15803D', letterSpacing: 0.5 },
  addressText: { fontSize: 11, color: '#64748B' },
  addressNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  addressNote: { fontSize: 10.5, color: '#EA580C', fontStyle: 'italic', flex: 1 },

  stallsScroll: { marginHorizontal: -4 },
  stallCard: {
    width: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stallImage: { width: '100%', height: 80, borderRadius: 10, backgroundColor: '#E2E8F0' },
  stallName: { fontSize: 12.5, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  stallDist: { fontSize: 10, color: '#64748B' },
  stallRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  stallRating: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  stallSpecialty: { fontSize: 10.5, color: '#64748B', lineHeight: 15 },
  stallActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  visitBtn: {
    flex: 1,
    backgroundColor: '#15803D',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  visitBtnText: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' },
  chatStallBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },

  acctHeading: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  acctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  acctIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acctInfo: { flex: 1 },
  acctLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  acctSub: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  acctValue: { fontSize: 11.5, fontWeight: '700', color: '#15803D', marginRight: 4 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },

  footer: { textAlign: 'center', fontSize: 10.5, color: '#94A3B8', marginTop: 4 },
});
