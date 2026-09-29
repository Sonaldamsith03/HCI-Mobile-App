import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { RootStackParamList, SystemUser, ProduceCategory } from '../types';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';
import { AgriCard } from '../components/AgriCard';
import { StatusBadge } from '../components/Badges';
import { SecondaryButton } from '../components/Buttons';
import { UberBottomNavBar } from '../components/UberBottomNavBar';

type AdminTab = 'users' | 'crops' | 'escrow' | 'kyc' | 'disputes' | 'system';

export const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    produceList,
    transactions,
    resetSeedData,
    themeMode,
    toggleThemeMode,
    showToast,
    systemUsers,
    updateSystemUser,
    toggleBanUser,
    toggleVerifyUser,
    cropTypes,
    addCropType,
    deleteCropType,
    setCurrentBottomTab,
    userProfile,
  } = useApp();
  const isDark = themeMode === 'dark';
  const isAdmin = userProfile.isLoggedIn === true && userProfile.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Search & Filter state for Users
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'BUYER' | 'FARMER' | 'COURIER' | 'ADMIN'>('ALL');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Add Crop Modal State
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [cropName, setCropName] = useState('');
  const [cropCategory, setCropCategory] = useState<ProduceCategory>('Vegetables');
  const [cropPrice, setCropPrice] = useState('2.50');
  const [cropSeason, setCropSeason] = useState('Year-round');

  // Existing Governance States
  const [kycQueue, setKycQueue] = useState([
    {
      id: 1,
      farmName: 'Ceylon Organic Tea & Herbs',
      growerName: 'Bandara Ranasinghe',
      location: 'Kandy Highlands',
      acres: '12.5 Acres',
      status: 'Pending Review',
      doc: 'GAP Certificate #2026-LK',
    },
    {
      id: 2,
      farmName: 'Ruhuna Wild Apiaries',
      growerName: 'Saman Kumara',
      location: 'Matara Lowlands',
      acres: '45 Hives',
      status: 'Pending Review',
      doc: 'Pure Honey Lab Assay',
    },
  ]);

  const [disputeTickets, setDisputeTickets] = useState([
    {
      id: 101,
      orderCode: 'AGRI-7821-VE',
      buyer: 'Sonal Perera',
      farmer: 'Green Valley Organics',
      issue: '2kg Carrots bruised during cold transit',
      claimAmount: '$4.80',
      status: 'Under Review',
    },
  ]);

  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // User Actions
  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword(user.password || 'demo1234');
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
  };

  const handleSaveUserChanges = () => {
    if (!editingUser) return;
    if (!editName.trim()) {
      showToast('Name cannot be empty', 'warn');
      return;
    }
    updateSystemUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim(),
      phone: editPhone.trim(),
    });
    setEditingUser(null);
  };

  // Crop Type Add
  const handleCreateCropType = () => {
    if (!cropName.trim()) {
      showToast('Please enter a crop name', 'warn');
      return;
    }
    const numPrice = parseFloat(cropPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast('Please enter a valid price per kg', 'warn');
      return;
    }

    addCropType({
      name: cropName.trim(),
      category: cropCategory,
      basePriceKg: numPrice,
      season: cropSeason.trim() || 'Year-round',
    });

    setCropName('');
    setCropPrice('2.50');
    setShowAddCropModal(false);
  };

  const handleApproveKyc = (id: number, farmName: string) => {
    setKycQueue(prev => prev.filter(k => k.id !== id));
    Alert.alert('Farm Approved! 🌿', `${farmName} is now verified on FarmBy Marketplace.`);
  };

  const handleResolveDispute = (id: number, decision: 'refund' | 'dismiss') => {
    setDisputeTickets(prev => prev.filter(d => d.id !== id));
    Alert.alert(
      'Dispute Resolved',
      decision === 'refund'
        ? 'Escrow arbiter approved partial refund to buyer.'
        : 'Dispute closed after produce inspection review.'
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Database',
      'This will reset crops, transactions, and messages to initial seed state. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            await resetSeedData();
            Alert.alert('Reset Complete', 'Default demo database restored.');
          },
        },
      ]
    );
  };

  // Filtered Users
  const filteredUsers = systemUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(userSearchQuery));
    const matchesRole = userRoleFilter === 'ALL' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#FFFFFF'}
        />
        <View style={{ alignItems: 'center', maxWidth: 320 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="lock-closed" size={32} color="#EF4444" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: isDark ? '#FFFFFF' : '#000000', marginBottom: 8, textAlign: 'center' }}>
            Access Restricted
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#A1A1AA' : '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            The Admin Console is strictly reserved for platform administrators. Please sign in with an authorized admin account.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.forestGreenPrimary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 }}
            onPress={() => {
              setCurrentBottomTab('account');
              navigation.navigate('MainTabs', { tab: 'account' });
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Go to Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 10 }}
            onPress={() => {
              setCurrentBottomTab('services');
              navigation.navigate('MainTabs', { tab: 'services' });
            }}
          >
            <Text style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: '600', fontSize: 14 }}>Return to Services</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />

      {/* Top Header */}
      <View style={[styles.navHeader, isDark && styles.navHeaderDark]}>
        <TouchableOpacity
          onPress={() => {
            setCurrentBottomTab('account');
            navigation.navigate('MainTabs', { tab: 'account' });
          }}
          style={styles.backChevron}
        >
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.backLabel, isDark && styles.textWhite]}>Account</Text>
        </TouchableOpacity>

        <View style={styles.staffPill}>
          <Ionicons name="shield-checkmark" size={13} color="#000000" />
          <Text style={styles.staffPillText}>ADMIN CONSOLE</Text>
        </View>

        <TouchableOpacity
          onPress={toggleThemeMode}
          style={[styles.themeBtn, isDark && styles.themeBtnDark]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={16}
            color={isDark ? '#FBBF24' : '#111827'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Hero Section */}
        <View style={styles.largeTitleSection}>
          <Text style={[styles.largeTitle, isDark && styles.textWhite]}>Platform Admin</Text>
          <Text style={styles.subTitle}>
            Full governance suite: user security, password resets, crop registry, and escrow oversight.
          </Text>
        </View>

        {/* Admin Metric Cards Bento Grid */}
        <View style={styles.kpiGrid}>
          <AgriCard variant="mint" style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>Total Users</Text>
              <Ionicons name="people-outline" size={18} color={colors.forestGreenPrimary} />
            </View>
            <Text style={styles.kpiValue}>{systemUsers.length}</Text>
            <Text style={styles.kpiSub}>
              {systemUsers.filter(u => u.status === 'active').length} active • {systemUsers.filter(u => u.status === 'banned').length} banned
            </Text>
          </AgriCard>

          <AgriCard variant="gold" style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>Crop Categories</Text>
              <MaterialCommunityIcons name="seed-outline" size={18} color={colors.harvestGoldText} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.harvestGoldText }]}>{cropTypes.length}</Text>
            <Text style={styles.kpiSub}>Across 5 classifications</Text>
          </AgriCard>

          <AgriCard style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>Escrow Volume</Text>
              <Ionicons name="lock-closed-outline" size={18} color={colors.forestGreenLight} />
            </View>
            <Text style={[styles.kpiValue, isDark && styles.textWhite]}>${totalVolume.toFixed(2)}</Text>
            <Text style={styles.kpiSub}>{transactions.length} total orders</Text>
          </AgriCard>

          <AgriCard style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiLabel}>Pending Disputes</Text>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.kpiValue, { color: '#EF4444' }]}>{disputeTickets.length}</Text>
            <Text style={styles.kpiSub}>Needs arbiter review</Text>
          </AgriCard>
        </View>

        {/* Modern Admin Horizontal Scroll Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.adminTabScroll}
        >
          <TouchableOpacity
            style={[styles.adminTabItem, activeTab === 'users' && (isDark ? styles.adminTabActiveDark : styles.adminTabActiveLight)]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons
              name="people"
              size={15}
              color={activeTab === 'users' ? (isDark ? '#000000' : '#FFFFFF') : '#71717A'}
            />
            <Text
              style={[
                styles.adminTabText,
                activeTab === 'users' && (isDark ? styles.adminTabTextActiveDark : styles.adminTabTextActiveLight),
              ]}
            >
              Users ({systemUsers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminTabItem, activeTab === 'crops' && (isDark ? styles.adminTabActiveDark : styles.adminTabActiveLight)]}
            onPress={() => setActiveTab('crops')}
          >
            <Ionicons
              name="leaf"
              size={15}
              color={activeTab === 'crops' ? (isDark ? '#000000' : '#FFFFFF') : '#71717A'}
            />
            <Text
              style={[
                styles.adminTabText,
                activeTab === 'crops' && (isDark ? styles.adminTabTextActiveDark : styles.adminTabTextActiveLight),
              ]}
            >
              Crop Types ({cropTypes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminTabItem, activeTab === 'escrow' && (isDark ? styles.adminTabActiveDark : styles.adminTabActiveLight)]}
            onPress={() => setActiveTab('escrow')}
          >
            <Ionicons
              name="wallet"
              size={15}
              color={activeTab === 'escrow' ? (isDark ? '#000000' : '#FFFFFF') : '#71717A'}
            />
            <Text
              style={[
                styles.adminTabText,
                activeTab === 'escrow' && (isDark ? styles.adminTabTextActiveDark : styles.adminTabTextActiveLight),
              ]}
            >
              Escrow ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminTabItem, activeTab === 'kyc' && (isDark ? styles.adminTabActiveDark : styles.adminTabActiveLight)]}
            onPress={() => setActiveTab('kyc')}
          >
            <Ionicons
              name="shield-checkmark"
              size={15}
              color={activeTab === 'kyc' ? (isDark ? '#000000' : '#FFFFFF') : '#71717A'}
            />
            <Text
              style={[
                styles.adminTabText,
                activeTab === 'kyc' && (isDark ? styles.adminTabTextActiveDark : styles.adminTabTextActiveLight),
              ]}
            >
              KYC Queue ({kycQueue.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminTabItem, activeTab === 'disputes' && (isDark ? styles.adminTabActiveDark : styles.adminTabActiveLight)]}
            onPress={() => setActiveTab('disputes')}
          >
            <Ionicons
              name="warning"
              size={15}
              color={activeTab === 'disputes' ? (isDark ? '#000000' : '#FFFFFF') : '#71717A'}
            />
            <Text
              style={[
                styles.adminTabText,
                activeTab === 'disputes' && (isDark ? styles.adminTabTextActiveDark : styles.adminTabTextActiveLight),
              ]}
            >
              Disputes ({disputeTickets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminTabItem, activeTab === 'system' && (isDark ? styles.adminTabActiveDark : styles.adminTabActiveLight)]}
            onPress={() => setActiveTab('system')}
          >
            <Ionicons
              name="settings-outline"
              size={15}
              color={activeTab === 'system' ? (isDark ? '#000000' : '#FFFFFF') : '#71717A'}
            />
            <Text
              style={[
                styles.adminTabText,
                activeTab === 'system' && (isDark ? styles.adminTabTextActiveDark : styles.adminTabTextActiveLight),
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ============================================================== */}
        {/* TAB 1: USERS MANAGEMENT (View, Ban, Verify, Reset Password)     */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <View style={styles.sectionWrap}>
            {/* Search and Filters */}
            <View style={[styles.searchBox, isDark ? styles.inputDark : styles.inputLight]}>
              <Ionicons name="search-outline" size={18} color="#71717A" />
              <TextInput
                style={[styles.searchInput, isDark ? styles.textWhite : styles.textBlack]}
                placeholder="Search user by name, email, or phone..."
                placeholderTextColor="#71717A"
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
              />
              {userSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setUserSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#71717A" />
                </TouchableOpacity>
              )}
            </View>

            {/* Role Filter Chips */}
            <View style={styles.filterChipsRow}>
              {(['ALL', 'BUYER', 'FARMER', 'COURIER', 'ADMIN'] as const).map(role => (
                <TouchableOpacity
                  key={role}
                  onPress={() => setUserRoleFilter(role)}
                  style={[
                    styles.filterChip,
                    isDark ? styles.filterChipDark : styles.filterChipLight,
                    userRoleFilter === role && (isDark ? styles.filterChipActiveDark : styles.filterChipActiveLight),
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isDark ? styles.textMutedDark : styles.textMutedLight,
                      userRoleFilter === role && (isDark ? styles.filterChipTextActiveDark : styles.filterChipTextActiveLight),
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* User Cards List */}
            <View style={{ gap: 12 }}>
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <Ionicons name="person-circle-outline" size={44} color="#71717A" />
                  <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>No matching users found</Text>
                  <Text style={styles.emptySubtitle}>Try adjusting your search query or role filter.</Text>
                </View>
              ) : (
                filteredUsers.map(u => {
                  const isBanned = u.status === 'banned';
                  return (
                    <View
                      key={u.id}
                      style={[
                        styles.userCard,
                        isDark ? styles.cardDark : styles.cardLight,
                        isBanned && styles.userCardBanned,
                      ]}
                    >
                      {/* Top Row: Avatar & Basic Info */}
                      <View style={styles.userCardTop}>
                        {u.avatarUrl ? (
                          <Image source={{ uri: u.avatarUrl }} style={styles.userAvatar} />
                        ) : (
                          <View style={[styles.userAvatarPlaceholder, isDark ? styles.avatarDark : styles.avatarLight]}>
                            <Ionicons name="person" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                          </View>
                        )}

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={[styles.userName, isDark && styles.textWhite]}>{u.name}</Text>
                            {u.isVerified && (
                              <Ionicons name="checkmark-circle" size={15} color="#06C167" />
                            )}
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(u.role) }]}>
                              <Text style={styles.roleBadgeText}>{u.role}</Text>
                            </View>
                            {isBanned && (
                              <View style={styles.bannedBadge}>
                                <Text style={styles.bannedBadgeText}>BANNED</Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.userEmail}>{u.email}</Text>
                          {u.phone && <Text style={styles.userPhone}>{u.phone}</Text>}
                        </View>
                      </View>

                      {/* Middle Details: Password & Meta */}
                      <View style={[styles.userMetaBox, isDark ? styles.metaBoxDark : styles.metaBoxLight]}>
                        <View style={styles.userMetaItem}>
                          <Text style={styles.metaLabel}>PASSWORD</Text>
                          <Text style={[styles.metaValue, isDark && styles.textWhite]}>
                            {u.password || 'demo1234'}
                          </Text>
                        </View>
                        <View style={styles.userMetaItem}>
                          <Text style={styles.metaLabel}>JOINED</Text>
                          <Text style={[styles.metaValue, isDark && styles.textWhite]}>{u.joinedDate}</Text>
                        </View>
                        <View style={styles.userMetaItem}>
                          <Text style={styles.metaLabel}>LAST LOGIN</Text>
                          <Text style={[styles.metaValue, isDark && styles.textWhite]}>{u.lastLogin}</Text>
                        </View>
                      </View>

                      {/* Bottom Action Buttons (Uber Minimalist) */}
                      <View style={styles.userActionsRow}>
                        {/* Edit Credentials */}
                        <TouchableOpacity
                          style={[styles.userActionBtn, isDark ? styles.btnDark : styles.btnLight]}
                          onPress={() => handleOpenEditUser(u)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="create-outline" size={14} color={isDark ? '#FFFFFF' : '#000000'} />
                          <Text style={[styles.userActionText, isDark && styles.textWhite]}>Edit Details</Text>
                        </TouchableOpacity>

                        {/* Toggle Verify */}
                        <TouchableOpacity
                          style={[styles.userActionBtn, isDark ? styles.btnDark : styles.btnLight]}
                          onPress={() => toggleVerifyUser(u.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={u.isVerified ? 'close-circle-outline' : 'shield-checkmark-outline'}
                            size={14}
                            color={u.isVerified ? '#F59E0B' : '#06C167'}
                          />
                          <Text
                            style={[
                              styles.userActionText,
                              { color: u.isVerified ? '#F59E0B' : '#06C167' },
                            ]}
                          >
                            {u.isVerified ? 'Unverify' : 'Verify User'}
                          </Text>
                        </TouchableOpacity>

                        {/* Ban / Restore Button */}
                        <TouchableOpacity
                          style={[
                            styles.userActionBtn,
                            isBanned ? styles.restoreBtn : styles.banBtn,
                          ]}
                          onPress={() => toggleBanUser(u.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isBanned ? 'checkmark-circle-outline' : 'ban-outline'}
                            size={14}
                            color={isBanned ? '#06C167' : '#EF4444'}
                          />
                          <Text style={[styles.userActionText, { color: isBanned ? '#06C167' : '#EF4444' }]}>
                            {isBanned ? 'Restore' : 'Ban'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CROP TYPES & REGISTRY MANAGEMENT                        */}
        {/* ============================================================== */}
        {activeTab === 'crops' && (
          <View style={styles.sectionWrap}>
            <View style={styles.cropsHeaderRow}>
              <View>
                <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Master Crop Registry</Text>
                <Text style={styles.sectionSubtitle}>Define allowable crop species, benchmark pricing & seasons.</Text>
              </View>

              <TouchableOpacity
                style={[styles.addCropBtn, isDark ? styles.btnWhite : styles.btnBlack]}
                onPress={() => setShowAddCropModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={17} color={isDark ? '#000000' : '#FFFFFF'} />
                <Text style={[styles.addCropBtnText, isDark ? styles.textBlack : styles.textWhite]}>Add Crop</Text>
              </TouchableOpacity>
            </View>

            {/* Crop Registry List */}
            <View style={{ gap: 10, marginTop: 12 }}>
              {cropTypes.map(c => (
                <View key={c.id} style={[styles.cropCard, isDark ? styles.cardDark : styles.cardLight]}>
                  <View style={[styles.cropIconWrap, isDark ? styles.cropIconDark : styles.cropIconLight]}>
                    <Ionicons name="leaf-outline" size={20} color="#06C167" />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.cropName, isDark && styles.textWhite]}>{c.name}</Text>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{c.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.cropMeta}>
                      Base Price: ${c.basePriceKg.toFixed(2)}/kg • Season: {c.season}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Remove Crop Type', `Are you sure you want to delete ${c.name}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteCropType(c.id) },
                      ]);
                    }}
                    style={styles.deleteCropBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 3: TRANSACTIONS & ESCROW                                   */}
        {/* ============================================================== */}
        {activeTab === 'escrow' && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Settled & Active Escrow Holdings</Text>
            {transactions.map(tx => {
              const matched = produceList.find(p => p.id === tx.produceId);
              const txPhoto = matched?.imageUrl || DEFAULT_CATEGORY_IMAGES.Vegetables;

              return (
                <AgriCard key={tx.id} style={styles.txCard}>
                  <View style={styles.txHeader}>
                    <Image source={{ uri: txPhoto }} style={styles.txThumb} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.txTitle, isDark && styles.textWhite]}>
                        {tx.produceName}
                      </Text>
                      <Text style={styles.txCode}>{tx.trackingCode}</Text>
                    </View>
                    <StatusBadge status={tx.status} />
                  </View>

                  <View style={styles.txMetaGrid}>
                    <View>
                      <Text style={styles.txMetaLabel}>Buyer</Text>
                      <Text style={[styles.txMetaVal, isDark && styles.textWhite]}>
                        {tx.buyerName}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.txMetaLabel}>Grower</Text>
                      <Text style={[styles.txMetaVal, isDark && styles.textWhite]}>
                        {tx.farmerName}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.txMetaLabel}>Order Total</Text>
                      <Text style={[styles.txMetaVal, { color: colors.forestGreenPrimary }]}>
                        ${tx.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.txFooter}>
                    <Text style={styles.handoverPin}>
                      PIN: <Text style={{ fontFamily: 'monospace', fontWeight: '700' }}>{tx.handoverPin || '7824'}</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => showToast(`Escrow status: Verified for ${tx.trackingCode}`, 'success')}
                      style={[styles.auditBtn, isDark && styles.auditBtnDark]}
                    >
                      <Ionicons name="document-text-outline" size={13} color="#06C167" />
                      <Text style={styles.auditBtnText}>Audit Escrow</Text>
                    </TouchableOpacity>
                  </View>
                </AgriCard>
              );
            })}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 4: KYC VERIFICATION QUEUE                                 */}
        {/* ============================================================== */}
        {activeTab === 'kyc' && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Grower & Courier Onboarding Verification</Text>
            {kycQueue.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="checkmark-circle" size={44} color="#06C167" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>KYC Queue Clear</Text>
                <Text style={styles.emptySubtitle}>All registered farms have been certified.</Text>
              </View>
            ) : (
              kycQueue.map(item => (
                <AgriCard key={item.id} style={styles.kycCard}>
                  <View style={styles.kycTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.farmName, isDark && styles.textWhite]}>
                        {item.farmName}
                      </Text>
                      <Text style={styles.growerName}>
                        {item.growerName} • {item.location}
                      </Text>
                    </View>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending Review</Text>
                    </View>
                  </View>

                  <View style={styles.docRow}>
                    <Ionicons name="document-attach-outline" size={16} color={colors.harvestGoldText} />
                    <Text style={[styles.docName, isDark && styles.textWhite]}>{item.doc}</Text>
                    <Text style={styles.acresText}>{item.acres}</Text>
                  </View>

                  <View style={styles.kycActionRow}>
                    <TouchableOpacity
                      style={styles.inspectBtn}
                      onPress={() => Alert.alert('Inspection Record', `Audited ${item.farmName} remote soil telemetry: 99.4% purity score.`)}
                    >
                      <Text style={styles.inspectBtnText}>Inspect Certificate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveKyc(item.id, item.farmName)}
                    >
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Certify Farm</Text>
                    </TouchableOpacity>
                  </View>
                </AgriCard>
              ))
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 5: DISPUTE TICKETS                                         */}
        {/* ============================================================== */}
        {activeTab === 'disputes' && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionHeading, isDark && styles.textWhite]}>Active Buyer & Courier Dispute Claims</Text>
            {disputeTickets.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Ionicons name="shield-checkmark" size={44} color="#06C167" />
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>Zero Active Disputes</Text>
                <Text style={styles.emptySubtitle}>All escrow shipments settled with 100% satisfaction.</Text>
              </View>
            ) : (
              disputeTickets.map(d => (
                <AgriCard key={d.id} style={styles.disputeCard}>
                  <View style={styles.disputeHeader}>
                    <Text style={styles.disputeCode}>{d.orderCode}</Text>
                    <Text style={styles.disputeClaim}>{d.claimAmount}</Text>
                  </View>

                  <Text style={[styles.disputeIssue, isDark && styles.textWhite]}>{d.issue}</Text>
                  <Text style={styles.disputeParties}>
                    Buyer: {d.buyer} • Farmer: {d.farmer}
                  </Text>

                  <View style={styles.disputeActions}>
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => handleResolveDispute(d.id, 'dismiss')}
                    >
                      <Text style={styles.dismissBtnText}>Dismiss Claim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.refundBtn}
                      onPress={() => handleResolveDispute(d.id, 'refund')}
                    >
                      <Text style={styles.refundBtnText}>Authorize Refund</Text>
                    </TouchableOpacity>
                  </View>
                </AgriCard>
              ))
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 6: SYSTEM UTILITIES & DEMO RESET                           */}
        {/* ============================================================== */}
        {activeTab === 'system' && (
          <View style={styles.sectionWrap}>
            <AgriCard>
              <Text style={[styles.settingsTitle, isDark && styles.textWhite]}>System Utilities</Text>
              <Text style={styles.settingsDesc}>
                Manage demo state, inspect telemetry metrics, and reset database back to initial state.
              </Text>

              <View style={{ gap: 10, marginTop: 14 }}>
                <SecondaryButton
                  title="Switch to Account View"
                  icon={<Ionicons name="person-outline" size={16} color="#06C167" />}
                  onPress={() => {
                    setCurrentBottomTab('account');
                    navigation.navigate('MainTabs', { tab: 'account' });
                  }}
                  textStyle={{ color: '#06C167' }}
                />

                <SecondaryButton
                  title="Reset Database to Default Seed Data"
                  icon={<Ionicons name="refresh" size={16} color={colors.harvestTerracotta} />}
                  onPress={handleResetData}
                  textStyle={{ color: colors.harvestTerracotta }}
                  style={{ borderColor: colors.harvestTerracotta }}
                />
              </View>
            </AgriCard>
          </View>
        )}
      </ScrollView>

      {/* ============================================================== */}
      {/* EDIT USER MODAL (Change Name, Password, Email, Phone)          */}
      {/* ============================================================== */}
      <Modal visible={!!editingUser} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, isDark && styles.textWhite]}>Edit User Credentials</Text>
                <Text style={styles.modalSubtitle}>Change password or profile details as Administrator</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingUser(null)}>
                <Ionicons name="close" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full Name"
                  placeholderTextColor="#71717A"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email"
                  placeholderTextColor="#71717A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>RESET PASSWORD</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholder="New Password"
                  placeholderTextColor="#71717A"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#71717A"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, isDark ? styles.btnDark : styles.btnLight]}
                onPress={() => setEditingUser(null)}
              >
                <Text style={[styles.modalBtnText, isDark && styles.textWhite]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isDark ? styles.btnWhite : styles.btnBlack]}
                onPress={handleSaveUserChanges}
              >
                <Text style={[styles.modalBtnText, isDark ? styles.textBlack : styles.textWhite]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* ADD CROP TYPE MODAL                                            */}
      {/* ============================================================== */}
      <Modal visible={showAddCropModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, isDark ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, isDark && styles.textWhite]}>Add Crop Type</Text>
                <Text style={styles.modalSubtitle}>Register a new crop category to the platform registry</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddCropModal(false)}>
                <Ionicons name="close" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CROP NAME</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={cropName}
                  onChangeText={setCropName}
                  placeholder="e.g. Heirloom Purple Carrots"
                  placeholderTextColor="#71717A"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <View style={styles.categoryPillsWrap}>
                  {(['Vegetables', 'Fruits', 'Grains', 'Tubers', 'Honey & Dairy'] as ProduceCategory[]).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCropCategory(cat)}
                      style={[
                        styles.catChoicePill,
                        isDark ? styles.filterChipDark : styles.filterChipLight,
                        cropCategory === cat && (isDark ? styles.filterChipActiveDark : styles.filterChipActiveLight),
                      ]}
                    >
                      <Text
                        style={[
                          styles.catChoiceText,
                          isDark ? styles.textMutedDark : styles.textMutedLight,
                          cropCategory === cat && (isDark ? styles.filterChipTextActiveDark : styles.filterChipTextActiveLight),
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>BASE BENCHMARK PRICE (USD / KG)</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={cropPrice}
                  onChangeText={setCropPrice}
                  placeholder="2.50"
                  placeholderTextColor="#71717A"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PEAK HARVEST SEASON</Text>
                <TextInput
                  style={[styles.modalInput, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
                  value={cropSeason}
                  onChangeText={setCropSeason}
                  placeholder="e.g. Summer / Monsoon"
                  placeholderTextColor="#71717A"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, isDark ? styles.btnDark : styles.btnLight]}
                onPress={() => setShowAddCropModal(false)}
              >
                <Text style={[styles.modalBtnText, isDark && styles.textWhite]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, isDark ? styles.btnWhite : styles.btnBlack]}
                onPress={handleCreateCropType}
              >
                <Text style={[styles.modalBtnText, isDark ? styles.textBlack : styles.textWhite]}>Register Crop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Static Floating Uber Navigation Bar */}
      <UberBottomNavBar activeTab="services" />
    </SafeAreaView>
  );
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '#F59E0B';
    case 'FARMER':
      return '#10B981';
    case 'COURIER':
      return '#3B82F6';
    case 'BUYER':
    default:
      return '#8B5CF6';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#000000',
  },
  textMutedDark: {
    color: '#A1A1AA',
  },
  textMutedLight: {
    color: '#71717A',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  navHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#222222',
  },
  backChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  staffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
  },
  staffPillText: {
    color: '#000000',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtnDark: {
    backgroundColor: '#262626',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  largeTitleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },
  subTitle: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 4,
    lineHeight: 18,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    padding: 14,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
    letterSpacing: -0.4,
  },
  kpiSub: {
    fontSize: 10.5,
    color: '#71717A',
  },

  /* Horizontal Admin Tab Switcher */
  adminTabScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  adminTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#EAEAEA',
  },
  adminTabActiveLight: {
    backgroundColor: '#000000',
  },
  adminTabActiveDark: {
    backgroundColor: '#FFFFFF',
  },
  adminTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#71717A',
  },
  adminTabTextActiveLight: {
    color: '#FFFFFF',
  },
  adminTabTextActiveDark: {
    color: '#000000',
  },

  sectionWrap: {
    paddingHorizontal: 20,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: '#71717A',
  },

  /* Search and filters */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
  },
  inputDark: {
    backgroundColor: '#171717',
    borderColor: '#2A2A2A',
  },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipDark: {
    backgroundColor: '#171717',
    borderColor: '#2A2A2A',
  },
  filterChipLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  filterChipActiveDark: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterChipActiveLight: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActiveDark: {
    color: '#000000',
  },
  filterChipTextActiveLight: {
    color: '#FFFFFF',
  },

  /* User Card */
  userCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  userCardBanned: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  cardDark: {
    backgroundColor: '#141414',
    borderColor: '#262626',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAEAEA',
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDark: {
    backgroundColor: '#262626',
  },
  avatarLight: {
    backgroundColor: '#EAEAEA',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 1,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannedBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bannedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userMetaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  metaBoxDark: {
    backgroundColor: '#1E1E1E',
  },
  metaBoxLight: {
    backgroundColor: '#F7F7F7',
  },
  userMetaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  userActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  userActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnDark: {
    backgroundColor: '#1F1F1F',
    borderColor: '#2F2F2F',
  },
  btnLight: {
    backgroundColor: '#F7F7F7',
    borderColor: '#E5E5E5',
  },
  banBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  restoreBtn: {
    backgroundColor: 'rgba(6, 193, 103, 0.08)',
    borderColor: 'rgba(6, 193, 103, 0.25)',
  },
  userActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Crop registry styling */
  cropsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addCropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  btnWhite: {
    backgroundColor: '#FFFFFF',
  },
  btnBlack: {
    backgroundColor: '#000000',
  },
  addCropBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  cropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  cropIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropIconDark: {
    backgroundColor: '#1F1F1F',
  },
  cropIconLight: {
    backgroundColor: '#EAEAEA',
  },
  cropName: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryPill: {
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#06C167',
  },
  cropMeta: {
    fontSize: 11.5,
    color: '#71717A',
    marginTop: 2,
  },
  deleteCropBtn: {
    padding: 8,
  },

  /* Empty state */
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Escrow tab */
  txCard: {
    marginBottom: 10,
    padding: 14,
  },
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  txCode: {
    fontSize: 11,
    color: '#71717A',
  },
  txMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  txMetaLabel: {
    fontSize: 10,
    color: '#71717A',
  },
  txMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  handoverPin: {
    fontSize: 11,
    color: '#71717A',
  },
  auditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  auditBtnDark: {
    backgroundColor: '#1E1E1E',
  },
  auditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },

  /* KYC Tab */
  kycCard: {
    marginBottom: 10,
    padding: 14,
  },
  kycTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmName: {
    fontSize: 15,
    fontWeight: '700',
  },
  growerName: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
  },
  docName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  acresText: {
    fontSize: 11,
    color: '#71717A',
  },
  kycActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inspectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#06C167',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Disputes tab */
  disputeCard: {
    marginBottom: 10,
    padding: 14,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disputeCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  disputeClaim: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
  disputeIssue: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 6,
  },
  disputeParties: {
    fontSize: 11,
    color: '#71717A',
    marginBottom: 10,
  },
  disputeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  dismissBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  refundBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  refundBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* System utilities */
  settingsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingsDesc: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 4,
  },

  /* Modal Backdrop & Card */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  modalDark: {
    backgroundColor: '#171717',
    borderColor: '#282828',
  },
  modalLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#71717A',
    marginTop: 2,
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13.5,
    fontWeight: '500',
  },
  categoryPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  catChoicePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  catChoiceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalSaveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});
