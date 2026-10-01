import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Logo } from '../components/Logo';
import { UberBottomNavBar } from '../components/UberBottomNavBar';
import { useApp } from '../context/AppContext';
import { supabaseService } from '../services/supabaseService';

export const OnboardingScreen: React.FC<{ hideBottomNav?: boolean }> = ({ hideBottomNav = false }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userProfile, updateUserProfile, themeMode, showToast } = useApp();
  const isDark = themeMode === 'dark';

  // Auth & UI States
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(userProfile.isLoggedIn || false);
  
  // Keep in sync with AppContext profile
  useEffect(() => {
    if (userProfile.isLoggedIn !== undefined) {
      setIsLoggedIn(userProfile.isLoggedIn);
    }
  }, [userProfile.isLoggedIn]);

  // First-time Role Questionnaire State: null | 'FARMER' | 'BUYER' | 'OTHER'
  const [selectedRoleType, setSelectedRoleType] = useState<'FARMER' | 'BUYER' | 'OTHER' | null>(null);

  // Form input states
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const tabToggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [isLoggedIn, authMode, selectedRoleType]);

  const handleTabSwitch = (mode: 'login' | 'signup') => {
    if (mode === authMode) return;
    setAuthMode(mode);
    Animated.spring(tabToggleAnim, {
      toValue: mode === 'login' ? 0 : 1,
      damping: 18,
      stiffness: 250,
      useNativeDriver: false,
    }).start();
  };

  // Select role to enter sign in/up
  const handlePickRole = (role: 'FARMER' | 'BUYER' | 'OTHER') => {
    setSelectedRoleType(role);
    if (role === 'FARMER') {
      setEmailOrPhone('mateo@greenvalleyfarms.com');
      setPassword('growerpass1');
      setFullName('Mateo Gutierrez');
    } else if (role === 'BUYER') {
      setEmailOrPhone('sonal.perera@gmail.com');
      setPassword('demo1234');
      setFullName('Sonal Perera');
    } else if (role === 'OTHER') {
      setEmailOrPhone('hybrid.partner@farmby.com');
      setPassword('dualpass123');
      setFullName('Sonal Hybrid Partner');
    }
  };

  // Cloud & Local Email/Password Login & Signup
  const handleSubmitAuth = async () => {
    if (!emailOrPhone.trim()) {
      showToast('Please enter your email or phone number', 'warn');
      return;
    }
    if (!password.trim()) {
      showToast('Please enter your password', 'warn');
      return;
    }

    setIsLoading(true);

    const cleanEmail = emailOrPhone.trim().toLowerCase();
    const isAdminLogin = cleanEmail === 'admin@farmby.com' || cleanEmail === 'admin';

    if (isAdminLogin) {
      setIsLoading(false);
      updateUserProfile({
        name: 'Administrator',
        email: 'admin@farmby.com',
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isLoggedIn: true,
      });
      setIsLoggedIn(true);
      showToast('Authenticated as Platform Administrator 🛡️', 'success');
      return;
    }

    const assignedRole = selectedRoleType || 'BUYER';
    const nameToSet =
      authMode === 'signup' && fullName.trim()
        ? fullName.trim()
        : userProfile.name || (assignedRole === 'FARMER' ? 'Mateo Gutierrez' : 'Sonal Perera');

    // Live Supabase Authentication
    if (supabaseService.isConfigured() && cleanEmail.includes('@')) {
      try {
        const validCloudRole: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' =
          assignedRole === 'FARMER' ? 'FARMER' : assignedRole === 'OTHER' ? 'BUYER' : 'BUYER';

        if (authMode === 'signup') {
          const { user, profile, error } = await supabaseService.signUp(cleanEmail, password, {
            name: nameToSet,
            role: validCloudRole,
            phone: !emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined,
          });

          if (error) {
            setIsLoading(false);
            showToast(error, 'warn');
            return;
          }

          setIsLoading(false);
          updateUserProfile({
            name: nameToSet,
            email: cleanEmail,
            role: assignedRole,
            isLoggedIn: true,
          });
          setIsLoggedIn(true);
          showToast(`Cloud account created for ${nameToSet}! 🚀`, 'success');
          return;
        } else {
          // Login
          const { user, profile, error } = await supabaseService.signIn(cleanEmail, password);
          if (error) {
            // Check if demo credentials for quick offline testing, otherwise report real error
            const isDemo =
              cleanEmail.includes('greenvalley') ||
              cleanEmail.includes('demo') ||
              cleanEmail.includes('sonal');
            if (!isDemo) {
              setIsLoading(false);
              showToast(error, 'warn');
              return;
            }
          }

          setIsLoading(false);
          const activeName = profile?.name || nameToSet;
          const activeRole = (profile?.role as any) || assignedRole;
          updateUserProfile({
            name: activeName,
            email: cleanEmail,
            role: activeRole,
            isLoggedIn: true,
          });
          setIsLoggedIn(true);
          showToast(`Welcome back, ${activeName}! (${activeRole})`, 'success');
          return;
        }
      } catch (err: any) {
        console.warn('Supabase auth flow error:', err);
      }
    }

    // Local / Offline fallback
    setIsLoading(false);
    updateUserProfile({
      name: nameToSet,
      email: emailOrPhone.includes('@') ? emailOrPhone.trim() : userProfile.email,
      phone: !emailOrPhone.includes('@') ? emailOrPhone.trim() : userProfile.phone,
      role: assignedRole,
      isLoggedIn: true,
    });
    setIsLoggedIn(true);
    showToast(
      authMode === 'login'
        ? `Welcome back, ${nameToSet} (${assignedRole})!`
        : `Account created! Welcome, ${nameToSet}!`,
      'success'
    );
  };

  // Google Login
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const assignedRole = selectedRoleType || 'BUYER';
      const defaultName =
        assignedRole === 'FARMER'
          ? 'Mateo Gutierrez'
          : assignedRole === 'OTHER'
          ? 'Sonal Hybrid Partner'
          : 'Sonal Perera';
      const defaultEmail =
        assignedRole === 'FARMER'
          ? 'mateo.google@greenvalley.com'
          : assignedRole === 'OTHER'
          ? 'sonal.hybrid@farmby.com'
          : 'sonal.perera@gmail.com';

      updateUserProfile({
        name: defaultName,
        email: defaultEmail,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: assignedRole,
        isLoggedIn: true,
      });
      setIsLoggedIn(true);
      showToast(`Logged in with Google as ${assignedRole}`, 'success');
    }, 700);
  };

  // Sign out handler
  const handleSignOut = () => {
    if (supabaseService.isConfigured()) {
      supabaseService.signOut().catch(() => {});
    }
    updateUserProfile({ isLoggedIn: false });
    setIsLoggedIn(false);
    setSelectedRoleType(null); // Return to role prompt on sign out
    setEmailOrPhone('');
    setPassword('');
    setFullName('');
    showToast('Signed out of account', 'info');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#000000' : '#FFFFFF'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, hideBottomNav ? { paddingBottom: 110 } : { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar / Header */}
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              <Logo size="sm" variant="mark" themeMode={themeMode} />
              <View>
                <Text style={[styles.brandTitle, isDark ? styles.textWhite : styles.textBlack]}>FarmBy</Text>
                <Text style={styles.brandSub}>ACCOUNT CENTER</Text>
              </View>
            </View>

            {isLoggedIn ? (
              <TouchableOpacity
                onPress={handleSignOut}
                style={[styles.smallActionBtn, isDark ? styles.actionBtnDark : styles.actionBtnLight]}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={[styles.smallActionBtnText, isDark ? styles.textWhite : styles.textBlack]}>Sign Out</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.demoBadge}>
                <View style={styles.demoDot} />
                <Text style={styles.demoBadgeText}>DEMO MODE</Text>
              </View>
            )}
          </View>

          {isLoggedIn ? (
            /* ================= LOGGED IN ACCOUNT PROFILE VIEW ================= */
            <Animated.View style={[styles.profileContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Profile Card */}
              <View style={[styles.profileHeroCard, isDark ? styles.cardDark : styles.cardLight]}>
                <View style={styles.profileHeroLeft}>
                  {userProfile.avatarUrl ? (
                    <Image source={{ uri: userProfile.avatarUrl }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, isDark ? styles.avatarPlaceholderDark : styles.avatarPlaceholderLight]}>
                      <Ionicons name="person" size={28} color={isDark ? '#FFFFFF' : '#000000'} />
                    </View>
                  )}
                  <View style={styles.profileHeroInfo}>
                    <Text style={[styles.profileName, isDark ? styles.textWhite : styles.textBlack]} numberOfLines={1}>
                      {userProfile.name || 'Sonal Perera'}
                    </Text>
                    <Text style={styles.profileEmail} numberOfLines={1}>
                      {userProfile.email || 'sonal.perera@gmail.com'}
                    </Text>
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={13} color="#06C167" />
                      <Text style={styles.verifiedTagText}>Verified Account</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.editIconBtn, isDark ? styles.borderDark : styles.borderLight]}
                  activeOpacity={0.7}
                  onPress={() => showToast('Edit Profile coming soon in full release', 'info')}
                >
                  <Ionicons name="create-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
                </TouchableOpacity>
              </View>

              {/* Quick Wallet Stats (Uber Style) */}
              <View style={styles.statsRow}>
                <View style={[styles.statBox, isDark ? styles.cardDark : styles.cardLight]}>
                  <Text style={styles.statLabel}>AGRIPAY WALLET</Text>
                  <Text style={[styles.statValue, isDark ? styles.textWhite : styles.textBlack]}>
                    ${(userProfile?.walletBalance ?? 240).toFixed(2)}
                  </Text>
                  <Text style={styles.statSub}>Instant checkout</Text>
                </View>
                <View style={[styles.statBox, isDark ? styles.cardDark : styles.cardLight]}>
                  <Text style={styles.statLabel}>ESCROW HELD</Text>
                  <Text style={[styles.statValue, { color: '#06C167' }]}>
                    ${(userProfile?.escrowBalance ?? 0).toFixed(2)}
                  </Text>
                  <Text style={styles.statSub}>Protected orders</Text>
                </View>
              </View>

              {/* Account Quick Options */}
              <View style={[styles.menuList, isDark ? styles.cardDark : styles.cardLight]}>
                {/* Admin Management Shortcut (Visible ONLY if logged in as Admin) */}
                {userProfile.isLoggedIn === true && userProfile.role === 'ADMIN' && (
                  <>
                    <TouchableOpacity
                      style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)' }]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('AdminDashboard')}
                    >
                      <View style={[styles.menuIconWrap, { backgroundColor: '#F59E0B' }]}>
                        <Ionicons name="shield-checkmark" size={19} color="#000000" />
                      </View>
                      <View style={styles.menuContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.menuTitle, { color: '#F59E0B', fontWeight: '800' }]}>Admin Governance Panel</Text>
                          <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: '#000000' }}>ADMIN</Text>
                          </View>
                        </View>
                        <Text style={styles.menuSubtitle}>User bans, password resets, crop types & escrow</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
                    </TouchableOpacity>

                    <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
                  </>
                )}

                {/* Farmer Portal Shortcut (Visible for Farmers or Dual OTHER role) */}
                {(userProfile.role === 'FARMER' || userProfile.role === 'OTHER') && (
                  <>
                    <TouchableOpacity
                      style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)' }]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('FarmerDashboard')}
                    >
                      <View style={[styles.menuIconWrap, { backgroundColor: '#10B981' }]}>
                        <MaterialCommunityIcons name="tractor" size={19} color="#FFFFFF" />
                      </View>
                      <View style={styles.menuContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.menuTitle, { color: '#10B981', fontWeight: '800' }]}>Farmer Hub & Harvest Listings</Text>
                          <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>UPLOAD CROPS</Text>
                          </View>
                        </View>
                        <Text style={styles.menuSubtitle}>List harvests, manage stock, view incoming bookings</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#10B981" />
                    </TouchableOpacity>

                    <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
                  </>
                )}

                {/* Buyer Marketplace Shortcut (Visible for Buyers or Dual OTHER role) */}
                {(userProfile.role === 'BUYER' || userProfile.role === 'OTHER') && (
                  <>
                    <TouchableOpacity
                      style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.06)' }]}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('BuyerDashboard', { initialTab: 'marketplace' })}
                    >
                      <View style={[styles.menuIconWrap, { backgroundColor: '#8B5CF6' }]}>
                        <Ionicons name="basket" size={19} color="#FFFFFF" />
                      </View>
                      <View style={styles.menuContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.menuTitle, { color: '#8B5CF6', fontWeight: '800' }]}>Fresh Harvest Marketplace</Text>
                          <View style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>BUY CROPS</Text>
                          </View>
                        </View>
                        <Text style={styles.menuSubtitle}>Order direct from certified growers with escrow</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
                    </TouchableOpacity>

                    <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
                  </>
                )}

                {/* Logistics Driver Portal Shortcut */}
                <TouchableOpacity
                  style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(6, 193, 103, 0.08)' : 'rgba(6, 193, 103, 0.06)' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('DriverAuth')}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: '#06C167' }]}>
                    <Ionicons name="car-sport" size={19} color="#FFFFFF" />
                  </View>
                  <View style={styles.menuContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.menuTitle, { color: '#06C167', fontWeight: '800' }]}>Logistics Driver Fleet</Text>
                      <View style={{ backgroundColor: '#06C167', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>DRIVER</Text>
                      </View>
                    </View>
                    <Text style={styles.menuSubtitle}>Accept farm dispatches, manage trips & view earnings</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#06C167" />
                </TouchableOpacity>

                <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('BuyerDashboard', { initialTab: 'orders' })}
                >
                  <View style={[styles.menuIconWrap, isDark ? styles.menuIconWrapDark : styles.menuIconWrapLight]}>
                    <Ionicons name="receipt-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, isDark ? styles.textWhite : styles.textBlack]}>Orders & Deliveries</Text>
                    <Text style={styles.menuSubtitle}>Live tracking & order history</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#71717A" />
                </TouchableOpacity>

                <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />


                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => showToast('Address: ' + (userProfile?.defaultAddress || 'Colombo 03, Western Province'), 'info')}
                >
                  <View style={[styles.menuIconWrap, isDark ? styles.menuIconWrapDark : styles.menuIconWrapLight]}>
                    <Ionicons name="location-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, isDark ? styles.textWhite : styles.textBlack]}>Saved Addresses</Text>
                    <Text style={styles.menuSubtitle} numberOfLines={1}>{userProfile?.defaultAddress || 'Colombo 03, Western Province'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#71717A" />
                </TouchableOpacity>

                <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => showToast('Security & Escrow PIN: 7824', 'info')}
                >
                  <View style={[styles.menuIconWrap, isDark ? styles.menuIconWrapDark : styles.menuIconWrapLight]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, isDark ? styles.textWhite : styles.textBlack]}>Security & Escrow</Text>
                    <Text style={styles.menuSubtitle}>2FA, Handover PIN protection</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#71717A" />
                </TouchableOpacity>

                <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

                {/* Cloud Database Explorer & Live Query Inspector */}
                <TouchableOpacity
                  style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(6, 193, 103, 0.08)' : 'rgba(6, 193, 103, 0.05)' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('DatabaseExplorer')}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: '#06C167' }]}>
                    <Ionicons name="server" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.menuContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.menuTitle, { color: '#06C167', fontWeight: '800' }]}>Database Cloud Explorer</Text>
                      <View style={{ backgroundColor: '#06C167', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>SQL / TABLES</Text>
                      </View>
                    </View>
                    <Text style={styles.menuSubtitle}>Inspect live Supabase tables, row counts & execute queries</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#06C167" />
                </TouchableOpacity>

                <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

                {/* Switch Account / Dedicated Cloud Auth Portal */}
                <TouchableOpacity
                  style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Auth', { initialMode: 'login' })}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="key" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.menuContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.menuTitle, { color: '#3B82F6', fontWeight: '800' }]}>Switch Cloud Account</Text>
                      <View style={{ backgroundColor: '#3B82F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>AUTH</Text>
                      </View>
                    </View>
                    <Text style={styles.menuSubtitle}>Log in with another email/role or test demo profiles</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                style={[styles.signOutBtn, isDark ? styles.signOutBtnDark : styles.signOutBtnLight]}
                onPress={handleSignOut}
                activeOpacity={0.85}
              >
                <Text style={styles.signOutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : !selectedRoleType ? (
            /* ================= STEP 1: INITIAL ROLE QUESTIONNAIRE ================= */
            <Animated.View style={[styles.authContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.authHeroTextWrap}>
                <Text style={[styles.authMainHeading, isDark ? styles.textWhite : styles.textBlack]}>
                  Who are you?
                </Text>
                <Text style={styles.authSubHeading}>
                  Select your role on the FarmBy decentralized agricultural network to get started.
                </Text>
              </View>

              <View style={styles.roleSelectionStack}>
                {/* Choice 1: Farmer */}
                <TouchableOpacity
                  style={[styles.roleOptionCard, isDark ? styles.cardDark : styles.cardLight]}
                  onPress={() => handlePickRole('FARMER')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <MaterialCommunityIcons name="tractor" size={28} color="#10B981" />
                  </View>
                  <View style={styles.roleCardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.roleCardTitle, isDark && styles.textWhite]}>I am a Farmer</Text>
                      <View style={[styles.rolePill, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                        <Text style={[styles.rolePillText, { color: '#10B981' }]}>GROWER</Text>
                      </View>
                    </View>
                    <Text style={styles.roleCardDesc}>
                      List and sell crops directly to regional buyers with 0% middleman cuts and escrow protection.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#71717A' : '#A1A1AA'} />
                </TouchableOpacity>

                {/* Choice 2: Buyer */}
                <TouchableOpacity
                  style={[styles.roleOptionCard, isDark ? styles.cardDark : styles.cardLight]}
                  onPress={() => handlePickRole('BUYER')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                    <Ionicons name="basket-outline" size={28} color="#8B5CF6" />
                  </View>
                  <View style={styles.roleCardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.roleCardTitle, isDark && styles.textWhite]}>I am a Buyer</Text>
                      <View style={[styles.rolePill, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                        <Text style={[styles.rolePillText, { color: '#8B5CF6' }]}>PURCHASER</Text>
                      </View>
                    </View>
                    <Text style={styles.roleCardDesc}>
                      Purchase fresh harvest directly from certified local growers with cold-chain tracking.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#71717A' : '#A1A1AA'} />
                </TouchableOpacity>

                {/* Choice 3: Other (Dual Role: Buy & Sell) */}
                <TouchableOpacity
                  style={[
                    styles.roleOptionCard,
                    isDark ? styles.cardDark : styles.cardLight,
                    { borderColor: isDark ? '#06C167' : '#06C167', borderWidth: 1.5 },
                  ]}
                  onPress={() => handlePickRole('OTHER')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(6, 193, 103, 0.18)' }]}>
                    <Ionicons name="sync" size={26} color="#06C167" />
                  </View>
                  <View style={styles.roleCardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.roleCardTitle, isDark && styles.textWhite]}>Other (Dual Access)</Text>
                      <View style={[styles.rolePill, { backgroundColor: '#06C167' }]}>
                        <Text style={[styles.rolePillText, { color: '#000000' }]}>BUY & SELL</Text>
                      </View>
                    </View>
                    <Text style={styles.roleCardDesc}>
                      Access both Grower and Buyer portals. Upload your own harvest, buy from others (self-orders prohibited).
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#06C167" />
                </TouchableOpacity>

                {/* Choice 4: Logistics Driver Partner */}
                <TouchableOpacity
                  style={[
                    styles.roleOptionCard,
                    isDark ? styles.cardDark : styles.cardLight,
                    { borderColor: isDark ? '#276EF1' : '#276EF1', borderWidth: 1.5 },
                  ]}
                  onPress={() => navigation.navigate('DriverAuth')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(39, 110, 241, 0.18)' }]}>
                    <Ionicons name="car-sport" size={26} color="#276EF1" />
                  </View>
                  <View style={styles.roleCardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.roleCardTitle, isDark && styles.textWhite]}>Logistics Driver</Text>
                      <View style={[styles.rolePill, { backgroundColor: '#276EF1' }]}>
                        <Text style={[styles.rolePillText, { color: '#FFFFFF' }]}>FLEET COURIER</Text>
                      </View>
                    </View>
                    <Text style={styles.roleCardDesc}>
                      Transport farm harvests via Motorbike, Tuk-Tuk, Van or Truck. On-demand dispatches with instant payouts.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#276EF1" />
                </TouchableOpacity>
              </View>

              {/* Admin quick access */}
              <TouchableOpacity
                style={styles.adminDirectLink}
                onPress={() => {
                  setSelectedRoleType('BUYER');
                  setAuthMode('login');
                  setEmailOrPhone('admin@farmby.com');
                  setPassword('admin123');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="shield-checkmark" size={14} color="#F59E0B" />
                <Text style={styles.adminDirectLinkText}>Platform Staff / Admin Sign In</Text>
              </TouchableOpacity>
            </Animated.View>

          ) : (
            /* ================= STEP 2: AUTH / LOGIN & SIGN UP VIEW ================= */
            <Animated.View style={[styles.authContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Back to Role Selection */}
              <TouchableOpacity
                style={styles.roleBackBtn}
                onPress={() => setSelectedRoleType(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color={isDark ? '#A1A1AA' : '#71717A'} />
                <Text style={styles.roleBackText}>Change Role ({selectedRoleType})</Text>
              </TouchableOpacity>

              {/* Uber-style Title Header */}
              <View style={styles.authHeroTextWrap}>
                <Text style={[styles.authMainHeading, isDark ? styles.textWhite : styles.textBlack]}>
                  {authMode === 'login'
                    ? selectedRoleType === 'FARMER'
                      ? 'Sign in as Farmer'
                      : selectedRoleType === 'OTHER'
                      ? 'Sign in (Dual Access)'
                      : 'Sign in as Buyer'
                    : selectedRoleType === 'FARMER'
                    ? 'Register as Farmer'
                    : selectedRoleType === 'OTHER'
                    ? 'Register (Dual Access)'
                    : 'Create Buyer Account'}
                </Text>
                <Text style={styles.authSubHeading}>
                  {selectedRoleType === 'FARMER'
                    ? 'Manage farm harvests, dispatch couriers, and collect escrow payouts'
                    : selectedRoleType === 'OTHER'
                    ? 'Enjoy full dual capabilities: list harvests and buy from local growers'
                    : 'Browse direct harvests and place escrow orders'}
                </Text>
              </View>

              {/* Uber Segmented Switcher (Login / Sign Up) */}
              <View style={[styles.switcherContainer, isDark ? styles.switcherBgDark : styles.switcherBgLight]}>
                <TouchableOpacity
                  style={[
                    styles.switcherTab,
                    authMode === 'login' && (isDark ? styles.switcherTabActiveDark : styles.switcherTabActiveLight),
                  ]}
                  onPress={() => handleTabSwitch('login')}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.switcherText,
                      isDark ? styles.textMutedDark : styles.textMutedLight,
                      authMode === 'login' && (isDark ? styles.switcherTextActiveDark : styles.switcherTextActiveLight),
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.switcherTab,
                    authMode === 'signup' && (isDark ? styles.switcherTabActiveDark : styles.switcherTabActiveLight),
                  ]}
                  onPress={() => handleTabSwitch('signup')}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.switcherText,
                      isDark ? styles.textMutedDark : styles.textMutedLight,
                      authMode === 'signup' && (isDark ? styles.switcherTextActiveDark : styles.switcherTextActiveLight),
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Google Continue Button (Prominent & Minimalist) */}
              <TouchableOpacity
                style={[styles.googleBtn, isDark ? styles.googleBtnDark : styles.googleBtnLight]}
                onPress={handleGoogleLogin}
                activeOpacity={0.85}
              >
                <View style={styles.googleIconContainer}>
                  <Ionicons name="logo-google" size={19} color={isDark ? '#FFFFFF' : '#4285F4'} />
                </View>
                <Text style={[styles.googleBtnText, isDark ? styles.textWhite : styles.textBlack]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Or Divider */}
              <View style={styles.orDividerContainer}>
                <View style={[styles.orLine, isDark ? styles.orLineDark : styles.orLineLight]} />
                <Text style={styles.orText}>or continue with email/phone</Text>
                <View style={[styles.orLine, isDark ? styles.orLineDark : styles.orLineLight]} />
              </View>

              {/* Input Fields */}
              <View style={styles.formFields}>
                {authMode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>FULL NAME</Text>
                    <View style={[styles.inputBox, isDark ? styles.inputBoxDark : styles.inputBoxLight]}>
                      <Ionicons name="person-outline" size={18} color="#71717A" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="e.g. Sonal Perera"
                        placeholderTextColor="#71717A"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL OR PHONE NUMBER</Text>
                  <View style={[styles.inputBox, isDark ? styles.inputBoxDark : styles.inputBoxLight]}>
                    <Ionicons name="mail-outline" size={18} color="#71717A" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="name@example.com or +1 (555)..."
                      placeholderTextColor="#71717A"
                      value={emailOrPhone}
                      onChangeText={setEmailOrPhone}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.inputLabel}>PASSWORD</Text>
                    {authMode === 'login' && (
                      <TouchableOpacity
                        onPress={() => showToast('Password reset link sent (demo)', 'info')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.forgotPasswordText}>Forgot?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={[styles.inputBox, isDark ? styles.inputBoxDark : styles.inputBoxLight]}>
                    <Ionicons name="lock-closed-outline" size={18} color="#71717A" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="Enter password"
                      placeholderTextColor="#71717A"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#71717A"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Primary Action Button (Pure Black in Light Mode / Pure White in Dark Mode) */}
              <TouchableOpacity
                style={[
                  styles.primaryAuthBtn,
                  isDark ? styles.primaryAuthBtnDark : styles.primaryAuthBtnLight,
                  isLoading && { opacity: 0.7 },
                ]}
                onPress={handleSubmitAuth}
                disabled={isLoading}
                activeOpacity={0.88}
              >
                <Text style={[styles.primaryAuthBtnText, isDark ? styles.textBlack : styles.textWhite]}>
                  {isLoading
                    ? 'Please wait...'
                    : authMode === 'login'
                    ? 'Log In'
                    : 'Create Account'}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isDark ? '#000000' : '#FFFFFF'}
                />
              </TouchableOpacity>

              {/* Quick Demo Pre-fill Options */}
              <View style={styles.quickFillRow}>
                <TouchableOpacity
                  style={styles.quickFillBtn}
                  onPress={() => {
                    setEmailOrPhone('sonal.perera@gmail.com');
                    setPassword('demo1234');
                    if (authMode === 'signup') setFullName('Sonal Perera');
                    showToast('Filled Buyer credentials (sonal.perera@gmail.com / demo1234)', 'info');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickFillText}>⚡ Auto-fill User</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickFillBtn, styles.adminFillBtn]}
                  onPress={() => {
                    setAuthMode('login');
                    setEmailOrPhone('admin@farmby.com');
                    setPassword('admin123');
                    showToast('Filled Admin credentials (admin@farmby.com / admin123)', 'info');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickFillText, { color: '#F59E0B' }]}>🛡️ Auto-fill Admin</Text>
                </TouchableOpacity>
              </View>

              {/* Terms & Privacy */}
              <Text style={styles.legalNotice}>
                By signing up, you agree to FarmBy Terms of Service and Privacy Policy. Secure escrow protected by AgriPay.
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Uber Bottom Navigation Bar */}
      {!hideBottomNav && <UberBottomNavBar activeTab="account" />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#000000',
  },
  bgLight: {
    backgroundColor: '#F8F8F8',
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#06C167',
    letterSpacing: 0.8,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 193, 103, 0.25)',
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06C167',
  },
  demoBadgeText: {
    color: '#06C167',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnDark: {
    backgroundColor: '#171717',
    borderColor: '#262626',
  },
  actionBtnLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  smallActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Auth styles */
  authContainer: {
    marginTop: 6,
  },
  authHeroTextWrap: {
    marginBottom: 20,
  },
  authMainHeading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  authSubHeading: {
    fontSize: 13.5,
    color: '#71717A',
    lineHeight: 20,
    marginTop: 6,
  },

  /* Switcher tabs */
  switcherContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    marginBottom: 20,
  },
  switcherBgDark: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
  },
  switcherBgLight: {
    backgroundColor: '#ECECEC',
  },
  switcherTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  switcherTabActiveDark: {
    backgroundColor: '#FFFFFF',
  },
  switcherTabActiveLight: {
    backgroundColor: '#000000',
  },
  switcherText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  switcherTextActiveDark: {
    color: '#000000',
    fontWeight: '800',
  },
  switcherTextActiveLight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Google Button */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 18,
  },
  googleBtnDark: {
    backgroundColor: '#171717',
    borderColor: '#2D2D2D',
  },
  googleBtnLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E2E2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  /* Or Divider */
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orLineDark: {
    backgroundColor: '#262626',
  },
  orLineLight: {
    backgroundColor: '#E5E5E5',
  },
  orText: {
    fontSize: 11.5,
    color: '#71717A',
    fontWeight: '500',
  },

  /* Form inputs */
  formFields: {
    gap: 14,
    marginBottom: 22,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 0.5,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 11.5,
    color: '#06C167',
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputBoxDark: {
    backgroundColor: '#141414',
    borderColor: '#262626',
  },
  inputBoxLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },

  /* Primary auth action button */
  primaryAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  primaryAuthBtnDark: {
    backgroundColor: '#FFFFFF',
  },
  primaryAuthBtnLight: {
    backgroundColor: '#000000',
  },
  primaryAuthBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  quickFillBtn: {
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 193, 103, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 193, 103, 0.2)',
  },
  adminFillBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  legalNotice: {
    textAlign: 'center',
    fontSize: 11,
    color: '#71717A',
    lineHeight: 16,
    paddingHorizontal: 10,
  },

  /* Profile View styles */
  profileContainer: {
    gap: 16,
    marginTop: 4,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#141414',
    borderColor: '#222222',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAEAEA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#262626',
  },
  avatarPlaceholderLight: {
    backgroundColor: '#EAEAEA',
  },
  profileHeroInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 12.5,
    color: '#71717A',
    marginTop: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#06C167',
  },
  editIconBtn: {
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  borderDark: {
    backgroundColor: '#1F1F1F',
    borderColor: '#2C2C2C',
  },
  borderLight: {
    backgroundColor: '#F4F4F4',
    borderColor: '#E5E5E5',
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },

  /* Menu List */
  menuList: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWrapDark: {
    backgroundColor: '#222222',
  },
  menuIconWrapLight: {
    backgroundColor: '#F0F0F0',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: '#71717A',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  dividerDark: {
    backgroundColor: '#222222',
  },
  dividerLight: {
    backgroundColor: '#F0F0F0',
  },

  /* Role Selection Stack Styles */
  roleSelectionStack: {
    gap: 14,
    marginBottom: 20,
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  roleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardInfo: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  roleCardDesc: {
    fontSize: 12,
    color: '#71717A',
    lineHeight: 17,
    marginTop: 4,
  },
  rolePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  roleBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  roleBackText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#71717A',
  },
  adminDirectLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  adminDirectLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  /* Sign out */
  signOutBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  signOutBtnDark: {
    backgroundColor: '#141414',
    borderColor: '#2B2B2B',
  },
  signOutBtnLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  signOutBtnText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '700',
  },
});
