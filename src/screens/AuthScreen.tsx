import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserRole, VehicleType } from '../types';
import { useApp } from '../context/AppContext';
import { supabaseService } from '../services/supabaseService';
import { logisticsService } from '../services/logisticsService';
import { colors } from '../theme/colors';
import { Logo } from '../components/Logo';

interface GoogleAccountOption {
  name: string;
  email: string;
  avatarUrl: string;
  subtitle: string;
}

const GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: 'Sonal Perera',
    email: 'sonal.perera@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    subtitle: 'Google Account • Verified Purchaser',
  },
  {
    name: 'Mateo Gutierrez',
    email: 'mateo.gutierrez@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    subtitle: 'Google Account • Certified Grower',
  },
  {
    name: 'Kasun Perera',
    email: 'kasun.perera@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    subtitle: 'Google Account • Fleet Transport Courier',
  },
  {
    name: 'Elena Vance',
    email: 'elena.vance@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    subtitle: 'Google Account • Agricultural Partner',
  },
];

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const { themeMode, userProfile, updateUserProfile, setCurrentRole, showToast } = useApp();
  const isDark = themeMode === 'dark';

  // Auth Modes & Selected Role
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(route.params?.initialMode || 'login');
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'FARMER' | 'COURIER'>(
    route.params?.initialRole || 'BUYER'
  );

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');

  // Driver specific fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('Small truck');
  const [vehicleModel, setVehicleModel] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [capacityKg, setCapacityKg] = useState('1200');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [authMode, selectedRole]);

  useEffect(() => {
    if (showGoogleModal && email && !customGoogleEmail) {
      setCustomGoogleEmail(email.trim());
    }
  }, [showGoogleModal, email]);

  // Quick Demo Logins
  const handleQuickDemo = async (role: 'BUYER' | 'FARMER' | 'COURIER' | 'ADMIN') => {
    setIsLoading(true);

    if (role === 'BUYER') {
      updateUserProfile({
        name: 'Sonal Perera',
        email: 'sonal.perera@gmail.com',
        phone: '+94 71 888 9999',
        role: 'BUYER',
        walletBalance: 12500,
        escrowBalance: 240,
        savedAddresses: ['144 Harvest Way, Apt 3B, Green Valley, CA', 'Colombo 03, Western Province'],
        defaultAddress: '144 Harvest Way, Apt 3B, Green Valley, CA',
        isLoggedIn: true,
      });
      setCurrentRole('BUYER');
      showToast('Logged in as Verified Buyer (Sonal Perera)', 'success');
      navigation.navigate('BuyerDashboard');
    } else if (role === 'FARMER') {
      updateUserProfile({
        name: 'Mateo Gutierrez',
        email: 'mateo@greenvalleyfarms.com',
        phone: '+94 77 123 4567',
        role: 'FARMER',
        walletBalance: 24500,
        escrowBalance: 0,
        savedAddresses: ['Green Valley Farm Gate #4, Central Province'],
        defaultAddress: 'Green Valley Farm Gate #4, Central Province',
        isLoggedIn: true,
      });
      setCurrentRole('FARMER');
      showToast('Logged in as Verified Farmer (Mateo Gutierrez)', 'success');
      navigation.navigate('FarmerDashboard');
    } else if (role === 'COURIER') {
      logisticsService.switchDriver('drv-kasun');
      setCurrentRole('COURIER');
      showToast('Logged in as Fleet Driver (Kasun Perera - Truck)', 'success');
      navigation.navigate('DriverDashboard');
    } else if (role === 'ADMIN') {
      updateUserProfile({
        name: 'Administrator',
        email: 'admin@farmby.com',
        phone: '+94 77 000 0000',
        role: 'ADMIN',
        walletBalance: 50000,
        escrowBalance: 128400,
        savedAddresses: ['Platform Governance Hub, Colombo'],
        defaultAddress: 'Platform Governance Hub, Colombo',
        isLoggedIn: true,
      });
      setCurrentRole('ADMIN');
      showToast('Logged in as Platform Administrator 🛡️', 'success');
      navigation.navigate('AdminDashboard');
    }

    setIsLoading(false);
  };

  // Google Login Handler
  const handleSelectGoogleAccount = async (account: { name: string; email: string; avatarUrl?: string }) => {
    setIsLoading(true);
    setShowGoogleModal(false);

    const cloudRole: 'BUYER' | 'FARMER' | 'DRIVER' =
      selectedRole === 'COURIER' ? 'DRIVER' : selectedRole === 'FARMER' ? 'FARMER' : 'BUYER';

    const { profile, error } = await supabaseService.loginWithGoogleAccount({
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      role: cloudRole,
    });

    if (error) {
      setIsLoading(false);
      showToast(error, 'warn');
      return;
    }

    updateUserProfile({
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: selectedRole,
      walletBalance: profile.walletBalance,
      escrowBalance: profile.escrowBalance,
      savedAddresses: profile.savedAddresses,
      defaultAddress: profile.defaultAddress,
      isLoggedIn: true,
    });
    setCurrentRole(selectedRole);

    if (selectedRole === 'COURIER') {
      logisticsService.loginDriver(profile.email);
    }

    setIsLoading(false);
    showToast(`Signed in with Google as ${profile.name}! 🚀`, 'success');

    if (selectedRole === 'COURIER') {
      navigation.navigate('DriverDashboard');
    } else if (selectedRole === 'FARMER') {
      navigation.navigate('FarmerDashboard');
    } else {
      navigation.navigate('BuyerDashboard');
    }
  };

  // Google Continue Button on main screen
  const handleContinueWithGoogle = async () => {
    // 1. If user already typed an email into the input field:
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes('@')) {
      await handleSelectGoogleAccount({
        name: fullName.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
      });
      return;
    }

    // 2. Launch Google Browser OAuth with the credentials configured
    setIsLoading(true);
    const { data, error } = await supabaseService.signInWithGoogleOAuth();
    setIsLoading(false);

    if (!error && data?.url) {
      try {
        const canOpen = await Linking.canOpenURL(data.url).catch(() => false);
        if (canOpen) {
          await Linking.openURL(data.url);
          showToast('Opening Google Sign-In...', 'info');
          return;
        }
      } catch (err) {
        console.warn('Linking error:', err);
      }
    }

    // 3. Fallback: Open Google Account selector modal smoothly
    setCustomGoogleEmail(email || '');
    setShowGoogleModal(true);
  };

  // Custom Google Account submission from modal
  const handleCustomGoogleSubmit = () => {
    const candidateEmail = (customGoogleEmail.trim() || email.trim()).toLowerCase();
    if (!candidateEmail || !candidateEmail.includes('@')) {
      showToast('Please enter your Google email address (e.g. name@gmail.com)', 'warn');
      return;
    }
    const derivedName = customGoogleName.trim() || fullName.trim() || candidateEmail.split('@')[0];
    handleSelectGoogleAccount({
      name: derivedName,
      email: candidateEmail,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });
  };

  // Live Supabase OAuth via Browser from modal
  const handleBrowserGoogleOAuth = async () => {
    setIsLoading(true);
    setShowGoogleModal(false);
    const { data, error } = await supabaseService.signInWithGoogleOAuth();
    setIsLoading(false);
    if (error) {
      Alert.alert(
        'Google OAuth Notice',
        `${error}\n\nTip: Google Client ID & Secret must be enabled in Supabase Authentication -> Providers -> Google.`
      );
    } else if (data?.url) {
      try {
        await Linking.openURL(data.url);
        showToast('Opening Google Authorization...', 'info');
      } catch (e: any) {
        Alert.alert('Browser Open Error', e.message || 'Could not open browser');
      }
    } else {
      showToast('OAuth initiated', 'info');
    }
  };

  // Magic Link Email Service
  const handleSendMagicLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter your email address in the field above', 'warn');
      return;
    }

    setIsSendingMagicLink(true);
    const { success, error } = await supabaseService.sendMagicLink(cleanEmail);
    setIsSendingMagicLink(false);

    if (success) {
      Alert.alert(
        'Magic Link Sent! ✉️',
        `Supabase Email Service has sent a secure, one-click sign-in link to:\n\n${cleanEmail}\n\nCheck your email inbox or spam folder to authenticate.`
      );
      showToast(`Magic login link sent to ${cleanEmail}!`, 'success');
    } else {
      Alert.alert('Email Service Notice', error || 'Failed to dispatch magic link email.');
    }
  };

  // Password Reset Email Service
  const handleSendPasswordReset = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter your account email in the box first', 'warn');
      return;
    }

    const { success, error } = await supabaseService.sendPasswordReset(cleanEmail);
    if (success) {
      Alert.alert(
        'Password Reset Email Dispatched! 🔑',
        `A password recovery email has been sent to ${cleanEmail}. Click the link inside to set a new password.`
      );
      showToast(`Password reset link emailed to ${cleanEmail}`, 'success');
    } else {
      Alert.alert('Email Reset Note', error || 'Failed to send password reset email.');
    }
  };

  // Submit Cloud or Local Auth
  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showToast('Please enter your email address', 'warn');
      return;
    }
    if (!password.trim()) {
      showToast('Please enter your password', 'warn');
      return;
    }
    if (authMode === 'signup') {
      if (!fullName.trim()) {
        showToast('Please enter your full name', 'warn');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warn');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'warn');
        return;
      }
      if (selectedRole === 'COURIER' && (!vehicleModel.trim() || !regPlate.trim())) {
        showToast('Please provide vehicle model and registration plate', 'warn');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const cloudRole: 'BUYER' | 'FARMER' | 'DRIVER' =
          selectedRole === 'FARMER' ? 'FARMER' : selectedRole === 'COURIER' ? 'DRIVER' : 'BUYER';

        // 1. Register user with their own email on Supabase Auth
        const { profile, error } = await supabaseService.signUp(cleanEmail, password, {
          name: fullName.trim(),
          role: cloudRole,
          phone: phone.trim() || undefined,
        });

        if (error) {
          setIsLoading(false);
          if (error.toLowerCase().includes('already registered') || error.toLowerCase().includes('user already exists')) {
            Alert.alert(
              'Email Already Registered',
              `An account with ${cleanEmail} is already registered.\n\nWould you like to switch to "Sign In" instead?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Switch to Sign In', onPress: () => setAuthMode('login') },
              ]
            );
          } else {
            Alert.alert('Sign Up Notice', error);
          }
          return;
        }

        // 2. If Driver, create driver & vehicle records in Supabase
        if (selectedRole === 'COURIER') {
          await logisticsService.registerDriver({
            name: fullName.trim(),
            phone: phone.trim() || '+94 77 000 0000',
            email: cleanEmail,
            operatingArea: 'Western Province',
            deliveryRadiusKm: 35,
            preferredHours: '6:00 AM - 6:00 PM',
            vehicleType,
            vehicleModel: vehicleModel.trim() || 'Cargo Vehicle',
            registrationNumber: regPlate.trim().toUpperCase() || 'WP CARGO-01',
            capacityKg: parseInt(capacityKg, 10) || 500,
          });
        }

        updateUserProfile({
          name: fullName.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          role: selectedRole,
          walletBalance: profile?.walletBalance ?? (selectedRole === 'FARMER' ? 24500 : 12500),
          escrowBalance: profile?.escrowBalance ?? 0,
          savedAddresses: profile?.savedAddresses ?? ['Central Delivery Hub #4B, Green Valley'],
          defaultAddress: profile?.defaultAddress ?? 'Central Delivery Hub #4B, Green Valley',
          isLoggedIn: true,
        });
        setCurrentRole(selectedRole);

        setIsLoading(false);
        showToast(`Account created for ${cleanEmail}! Welcome, ${fullName.trim()}! 🚀`, 'success');

        if (selectedRole === 'COURIER') {
          navigation.navigate('DriverDashboard');
        } else if (selectedRole === 'FARMER') {
          navigation.navigate('FarmerDashboard');
        } else {
          navigation.navigate('BuyerDashboard');
        }
      } else {
        // Sign In Flow with user's own email & password
        const { profile, error, notice } = await supabaseService.signIn(cleanEmail, password);

        if (error) {
          setIsLoading(false);
          if (error.toLowerCase().includes('invalid login credentials')) {
            Alert.alert(
              'Sign In Failed',
              `No account found matching ${cleanEmail} with this password.\n\nIf you don't have an account yet, switch to "Create Account" above to register with your email!`,
              [
                { text: 'Try Again', style: 'cancel' },
                { text: 'Create Account', onPress: () => setAuthMode('signup') },
              ]
            );
          } else {
            Alert.alert('Sign In Notice', error);
          }
          return;
        }

        if (notice) {
          showToast(notice, 'info');
        }

        const resolvedRole: UserRole =
          profile?.role === 'FARMER'
            ? 'FARMER'
            : profile?.role === 'DRIVER'
            ? 'COURIER'
            : selectedRole;

        const resolvedName = profile?.name || cleanEmail.split('@')[0];

        updateUserProfile({
          name: resolvedName,
          email: cleanEmail,
          role: resolvedRole,
          walletBalance: profile?.walletBalance ?? 12500,
          escrowBalance: profile?.escrowBalance ?? 0,
          savedAddresses: profile?.savedAddresses ?? ['Central Delivery Hub #4B, Green Valley'],
          defaultAddress: profile?.defaultAddress ?? 'Central Delivery Hub #4B, Green Valley',
          isLoggedIn: true,
        });
        setCurrentRole(resolvedRole);

        if (resolvedRole === 'COURIER') {
          logisticsService.loginDriver(cleanEmail);
        }

        setIsLoading(false);
        showToast(`Welcome back, ${resolvedName}! (${resolvedRole})`, 'success');

        if (resolvedRole === 'COURIER') {
          navigation.navigate('DriverDashboard');
        } else if (resolvedRole === 'FARMER') {
          navigation.navigate('FarmerDashboard');
        } else {
          navigation.navigate('BuyerDashboard');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Authentication Error', err.message || 'Unable to connect to Supabase service.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Logo size="md" variant="mark" themeMode={themeMode} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.brandTitle, isDark && { color: '#FFFFFF' }]}>FarmBy</Text>
                <Text style={styles.brandSubtitle}>AGRICULTURAL MARKETPLACE & FLEET</Text>
              </View>
            </View>

            {/* Cloud Status Indicator */}
            <View style={[styles.cloudBadge, isDark && { backgroundColor: '#1A1A1E', borderColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={styles.pulsingGreenDot} />
              <Text style={styles.cloudBadgeText}>Supabase Cloud Active</Text>
            </View>
          </View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Role Selector Segment */}
            <Text style={[styles.sectionLabel, isDark && { color: '#9CA3AF' }]}>SELECT YOUR ROLE</Text>
            <View style={[styles.roleSegment, isDark && { backgroundColor: '#18181B' }]}>
              <TouchableOpacity
                style={[styles.roleTab, selectedRole === 'BUYER' && styles.roleTabActive]}
                onPress={() => setSelectedRole('BUYER')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="cart"
                  size={16}
                  color={selectedRole === 'BUYER' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#64748B'}
                />
                <Text style={[styles.roleTabText, selectedRole === 'BUYER' && styles.roleTabTextActive]}>
                  Buyer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, selectedRole === 'FARMER' && styles.roleTabActive]}
                onPress={() => setSelectedRole('FARMER')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="leaf"
                  size={16}
                  color={selectedRole === 'FARMER' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#64748B'}
                />
                <Text style={[styles.roleTabText, selectedRole === 'FARMER' && styles.roleTabTextActive]}>
                  Farmer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, selectedRole === 'COURIER' && styles.roleTabActive]}
                onPress={() => setSelectedRole('COURIER')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="car"
                  size={16}
                  color={selectedRole === 'COURIER' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#64748B'}
                />
                <Text style={[styles.roleTabText, selectedRole === 'COURIER' && styles.roleTabTextActive]}>
                  Driver
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode Toggle (Sign In / Register) */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeBtn, authMode === 'login' && styles.modeBtnActive]}
                onPress={() => setAuthMode('login')}
              >
                <Text style={[styles.modeBtnText, authMode === 'login' && styles.modeBtnTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, authMode === 'signup' && styles.modeBtnActive]}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={[styles.modeBtnText, authMode === 'signup' && styles.modeBtnTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Google Sign In Direct Option */}
            <TouchableOpacity
              style={[styles.googleContinueBtn, isDark ? styles.googleBtnDark : styles.googleBtnLight]}
              onPress={handleContinueWithGoogle}
              activeOpacity={0.85}
            >
              <View style={styles.googleIconBadge}>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
              </View>
              <Text style={[styles.googleContinueText, isDark && { color: '#FFFFFF' }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.orDividerRow}>
              <View style={[styles.orDividerLine, isDark && styles.orLineDark]} />
              <Text style={[styles.orDividerText, isDark && { color: '#71717A' }]}>
                OR WITH EMAIL
              </Text>
              <View style={[styles.orDividerLine, isDark && styles.orLineDark]} />
            </View>

            {/* Primary Form Inputs Container */}
            <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.formHeaderRow}>
                <Ionicons
                  name={authMode === 'login' ? 'log-in-outline' : 'person-add-outline'}
                  size={20}
                  color="#06C167"
                />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={[styles.formHeaderTitle, isDark && { color: '#FFFFFF' }]}>
                    {authMode === 'login' ? 'Sign In with Your Email' : 'Create Your Account'}
                  </Text>
                  <Text style={styles.formHeaderSub}>
                    {authMode === 'login'
                      ? 'Use your personal email and password to access your account'
                      : `Enter your details to register as a ${selectedRole === 'COURIER' ? 'Driver' : selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'}`}
                  </Text>
                </View>
              </View>

              {/* Full Name for Sign Up */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Full Name</Text>
                  <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                    <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      style={[styles.input, isDark && { color: '#FFFFFF' }]}
                      placeholder="e.g. John Doe"
                      placeholderTextColor="#71717A"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Your Email Address</Text>
                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={[styles.input, isDark && { color: '#FFFFFF' }]}
                    placeholder="your.email@gmail.com"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <Text style={styles.inputHelperText}>
                  Enter any personal or work email address.
                </Text>
              </View>

              {/* Phone Number for Sign Up */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Phone Number</Text>
                  <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                    <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      style={[styles.input, isDark && { color: '#FFFFFF' }]}
                      placeholder="+94 77 123 4567"
                      placeholderTextColor="#71717A"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              )}

              {/* Farmer Specific Fields */}
              {authMode === 'signup' && selectedRole === 'FARMER' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Farm / Orchard Name</Text>
                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                      <Ionicons name="business-outline" size={18} color="#9CA3AF" />
                      <TextInput
                        style={[styles.input, isDark && { color: '#FFFFFF' }]}
                        placeholder="e.g. Highland Valley Orchards"
                        placeholderTextColor="#71717A"
                        value={farmName}
                        onChangeText={setFarmName}
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Farm Region / Location</Text>
                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                      <Ionicons name="location-outline" size={18} color="#9CA3AF" />
                      <TextInput
                        style={[styles.input, isDark && { color: '#FFFFFF' }]}
                        placeholder="e.g. Kandy, Central Province"
                        placeholderTextColor="#71717A"
                        value={farmLocation}
                        onChangeText={setFarmLocation}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Driver Specific Fields */}
              {authMode === 'signup' && selectedRole === 'COURIER' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Vehicle Category</Text>
                    <View style={styles.vehiclePillRow}>
                      {(['Small truck', 'Van', 'Three-wheeler', 'Motorbike', 'Lorry'] as VehicleType[]).map(v => (
                        <TouchableOpacity
                          key={v}
                          style={[styles.vehiclePill, vehicleType === v && styles.vehiclePillActive]}
                          onPress={() => setVehicleType(v)}
                        >
                          <Text style={[styles.vehiclePillText, vehicleType === v && styles.vehiclePillTextActive]}>
                            {v}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Vehicle Model & Registration Plate</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={[styles.inputWrapper, { flex: 1 }, isDark && styles.inputWrapperDark]}>
                        <TextInput
                          style={[styles.input, isDark && { color: '#FFFFFF' }]}
                          placeholder="e.g. Isuzu Elf"
                          placeholderTextColor="#71717A"
                          value={vehicleModel}
                          onChangeText={setVehicleModel}
                        />
                      </View>
                      <View style={[styles.inputWrapper, { flex: 1 }, isDark && styles.inputWrapperDark]}>
                        <TextInput
                          style={[styles.input, isDark && { color: '#FFFFFF' }]}
                          placeholder="WP CAB-1234"
                          placeholderTextColor="#71717A"
                          value={regPlate}
                          onChangeText={setRegPlate}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* Password */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Password</Text>
                  {authMode === 'login' && (
                    <TouchableOpacity onPress={handleSendPasswordReset} activeOpacity={0.7}>
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={[styles.input, isDark && { color: '#FFFFFF' }]}
                    placeholder="Enter password (min 6 chars)"
                    placeholderTextColor="#71717A"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password for Sign Up */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      style={[styles.input, isDark && { color: '#FFFFFF' }]}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#71717A"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>
              )}

              {/* Primary Action Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && { opacity: 0.8 }]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.88}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {authMode === 'login'
                        ? `Sign In with Email`
                        : `Create ${selectedRole === 'COURIER' ? 'Driver' : selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'} Account`}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Email Service: Magic Link (Passwordless) Option */}
              {authMode === 'login' && (
                <TouchableOpacity
                  style={[styles.magicLinkBtn, isDark && styles.magicLinkBtnDark]}
                  onPress={handleSendMagicLink}
                  disabled={isSendingMagicLink}
                  activeOpacity={0.8}
                >
                  {isSendingMagicLink ? (
                    <ActivityIndicator size="small" color="#06C167" />
                  ) : (
                    <>
                      <Ionicons name="mail-unread-outline" size={16} color="#06C167" />
                      <Text style={styles.magicLinkText}>Email me a Magic Sign-In Link</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Switch Auth Mode Prompt */}
            <View style={styles.switchModeContainer}>
              <Text style={[styles.switchModeText, isDark && { color: '#94A3B8' }]}>
                {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity
                onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{ marginLeft: 6 }}
              >
                <Text style={styles.switchModeLink}>
                  {authMode === 'login' ? 'Create Account' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick 1-Tap Demo Logins Strip */}
            <View style={styles.demoSection}>
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, isDark && { backgroundColor: '#27272A' }]} />
                <Text style={[styles.dividerText, isDark && { color: '#71717A' }]}>QUICK DEMO ACCESS</Text>
                <View style={[styles.dividerLine, isDark && { backgroundColor: '#27272A' }]} />
              </View>

              <View style={styles.demoButtonsGrid}>
                <TouchableOpacity
                  style={[styles.demoCard, isDark && styles.demoCardDark]}
                  onPress={() => handleQuickDemo('BUYER')}
                >
                  <Text style={styles.demoEmoji}>🛒</Text>
                  <Text style={[styles.demoTitle, isDark && { color: '#FFFFFF' }]}>Buyer</Text>
                  <Text style={styles.demoSub}>Sonal Perera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoCard, isDark && styles.demoCardDark]}
                  onPress={() => handleQuickDemo('FARMER')}
                >
                  <Text style={styles.demoEmoji}>🌾</Text>
                  <Text style={[styles.demoTitle, isDark && { color: '#FFFFFF' }]}>Farmer</Text>
                  <Text style={styles.demoSub}>Mateo Gutierrez</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoCard, isDark && styles.demoCardDark]}
                  onPress={() => handleQuickDemo('COURIER')}
                >
                  <Text style={styles.demoEmoji}>🚚</Text>
                  <Text style={[styles.demoTitle, isDark && { color: '#FFFFFF' }]}>Driver</Text>
                  <Text style={styles.demoSub}>Kasun Perera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoCard, isDark && styles.demoCardDark]}
                  onPress={() => handleQuickDemo('ADMIN')}
                >
                  <Text style={styles.demoEmoji}>🛡️</Text>
                  <Text style={[styles.demoTitle, isDark && { color: '#FFFFFF' }]}>Admin</Text>
                  <Text style={styles.demoSub}>Platform Hub</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Account Picker Modal */}
      <Modal
        visible={showGoogleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.googleModalContent, isDark && styles.googleModalContentDark]}>
            <View style={styles.googleModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
                <View>
                  <Text style={[styles.googleModalTitle, isDark && { color: '#FFFFFF' }]}>
                    Sign in with Google
                  </Text>
                  <Text style={styles.googleModalSub}>Use your own Google email or choose an account</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowGoogleModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={isDark ? '#FFFFFF' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Primary: Live Official Google OAuth Button */}
              <TouchableOpacity
                style={[styles.primaryOAuthBtn, isDark && styles.primaryOAuthBtnDark]}
                onPress={handleBrowserGoogleOAuth}
                activeOpacity={0.88}
              >
                <View style={styles.googleIconBadge}>
                  <Ionicons name="logo-google" size={20} color="#EA4335" />
                </View>
                <Text style={[styles.primaryOAuthBtnText, isDark && { color: '#FFFFFF' }]}>
                  Launch Official Google Sign-In
                </Text>
                <Ionicons name="open-outline" size={16} color="#06C167" />
              </TouchableOpacity>

              {/* Divider */}
              <View style={{ marginVertical: 14 }}>
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, isDark && { backgroundColor: '#27272A' }]} />
                  <Text style={[styles.dividerText, isDark && { color: '#71717A' }]}>
                    OR SIGN IN WITH ANY GMAIL
                  </Text>
                  <View style={[styles.dividerLine, isDark && { backgroundColor: '#27272A' }]} />
                </View>
              </View>

              {/* Custom Google Account Box */}
              <View style={[styles.customGoogleBox, isDark && styles.customGoogleBoxDark]}>
                <TextInput
                  style={[styles.customInput, isDark && styles.customInputDark]}
                  placeholder="Your Full Name (optional)"
                  placeholderTextColor="#71717A"
                  value={customGoogleName}
                  onChangeText={setCustomGoogleName}
                />
                <TextInput
                  style={[styles.customInput, isDark && styles.customInputDark]}
                  placeholder={email || "your.email@gmail.com"}
                  placeholderTextColor="#71717A"
                  value={customGoogleEmail}
                  onChangeText={setCustomGoogleEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.customSubmitBtn}
                  onPress={handleCustomGoogleSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.customSubmitText}>Sync & Sign In with This Email</Text>
                </TouchableOpacity>
              </View>

              {/* Demo Profiles Subtitle */}
              <View style={{ marginVertical: 14, paddingHorizontal: 4 }}>
                <Text style={[styles.sectionLabel, { fontSize: 11, marginBottom: 8 }, isDark && { color: '#9CA3AF' }]}>
                  OR SELECT A VERIFIED TEST PROFILE
                </Text>
              </View>

              {/* Account list */}
              {GOOGLE_ACCOUNTS.map((acc, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.googleAccountCard, isDark && styles.googleAccountCardDark]}
                  onPress={() => handleSelectGoogleAccount(acc)}
                  activeOpacity={0.75}
                >
                  <Image source={{ uri: acc.avatarUrl }} style={styles.googleAccountAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.googleAccountName, isDark && { color: '#FFFFFF' }]}>
                      {acc.name}
                    </Text>
                    <Text style={styles.googleAccountEmail}>{acc.email}</Text>
                    <Text style={styles.googleAccountSub}>{acc.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.8,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  pulsingGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#06C167',
  },
  cloudBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#06C167',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  roleSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#06C167',
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modeToggleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
    marginBottom: 16,
  },
  modeBtn: {
    paddingVertical: 8,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeBtnActive: {
    borderBottomColor: '#06C167',
  },
  modeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeBtnTextActive: {
    color: '#06C167',
    fontWeight: '800',
  },
  googleContinueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
  },
  googleBtnLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleBtnDark: {
    backgroundColor: '#1E1E22',
    borderColor: '#2E2E34',
  },
  googleIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleContinueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orLineDark: {
    backgroundColor: '#27272A',
  },
  orDividerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  cardDark: {
    backgroundColor: '#121214',
    borderColor: '#27272A',
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  formHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  formHeaderSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  inputHelperText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#06C167',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2E2E32',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 10,
  },
  vehiclePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  vehiclePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  vehiclePillActive: {
    backgroundColor: '#06C167',
    borderColor: '#06C167',
  },
  vehiclePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  vehiclePillTextActive: {
    color: '#FFFFFF',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06C167',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  magicLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 193, 103, 0.08)',
  },
  magicLinkBtnDark: {
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
  },
  magicLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#06C167',
  },
  demoSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    paddingHorizontal: 10,
    letterSpacing: 0.8,
  },
  demoButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  demoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoCardDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  demoEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  demoSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  // Google Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  googleModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 35,
  },
  googleModalContentDark: {
    backgroundColor: '#18181B',
  },
  googleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  googleModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  googleModalSub: {
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  googleAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  googleAccountCardDark: {
    backgroundColor: '#27272A',
    borderColor: '#3F3F46',
  },
  googleAccountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  googleAccountName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  googleAccountEmail: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  googleAccountSub: {
    fontSize: 10,
    color: '#06C167',
    fontWeight: '600',
    marginTop: 2,
  },
  addGoogleAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 6,
  },
  addGoogleAccountBtnDark: {
    borderColor: '#3B82F6',
  },
  addGoogleAccountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  customGoogleBox: {
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
    gap: 8,
  },
  customGoogleBoxDark: {
    backgroundColor: '#27272A',
  },
  customGoogleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  customInputDark: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
    color: '#FFFFFF',
  },
  customSubmitBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  customSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleModalFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  browserOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  browserOAuthText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#3B82F6',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  switchModeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  switchModeLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
  },
  primaryOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryOAuthBtnDark: {
    backgroundColor: '#1E1E22',
    borderColor: '#3F3F46',
  },
  primaryOAuthBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
