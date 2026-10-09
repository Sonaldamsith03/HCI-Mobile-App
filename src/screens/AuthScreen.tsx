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
  Linking,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserRole, VehicleType } from '../types';
import { useApp } from '../context/AppContext';
import { supabaseService } from '../services/supabaseService';
import { logisticsService } from '../services/logisticsService';
import { colors } from '../theme/colors';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const { userProfile, themeMode, toggleThemeMode, updateUserProfile, setCurrentRole, showToast } = useApp();
  const isDark = themeMode === 'dark';

  // Auth Modes & Selected Role
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(route.params?.initialMode || 'login');
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'FARMER' | 'COURIER' | 'ADMIN'>(
    route.params?.initialRole || 'BUYER'
  );

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Farmer specific fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');

  // Driver specific fields
  const [vehicleType, setVehicleType] = useState<VehicleType>('Small truck');
  const [vehicleModel, setVehicleModel] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [capacityKg, setCapacityKg] = useState('1200');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Trigger smooth transition whenever role or auth mode changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(14);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [authMode, selectedRole]);

  // Watch for authenticated session state (e.g. from background deep link or OAuth redirect)
  useEffect(() => {
    if (userProfile.isLoggedIn) {
      const resolvedRole: UserRole =
        userProfile.role === 'ADMIN'
          ? 'ADMIN'
          : userProfile.role === 'COURIER' || (userProfile.role as any) === 'DRIVER'
          ? 'COURIER'
          : userProfile.role === 'FARMER'
          ? 'FARMER'
          : 'BUYER';
      setCurrentRole(resolvedRole);
      if (resolvedRole === 'ADMIN') {
        navigation.navigate('AdminDashboard');
      } else if (resolvedRole === 'COURIER') {
        navigation.navigate('DriverDashboard');
      } else if (resolvedRole === 'FARMER') {
        navigation.navigate('FarmerDashboard');
      } else {
        navigation.navigate('BuyerDashboard');
      }
    }
  }, [userProfile.isLoggedIn, userProfile.role]);

  // Deep link listener for incoming OAuth redirects from Safari / browser
  useEffect(() => {
    const handleUrlEvent = async ({ url }: { url: string }) => {
      if (!url) return;
      if (
        url.includes('auth-callback') ||
        url.includes('verified_email') ||
        url.includes('access_token') ||
        url.includes('code=')
      ) {
        setIsLoading(true);
        const { profile, error } = await supabaseService.handleOAuthCallbackUrl(url);
        setIsLoading(false);
        if (error) {
          Alert.alert('Google Sign-In Notice', error);
          return;
        }
        if (profile) {
          updateUserProfile(profile);
          const resolvedRole: UserRole =
            profile.role === 'ADMIN'
              ? 'ADMIN'
              : profile.role === 'DRIVER' || profile.role === 'COURIER'
              ? 'COURIER'
              : profile.role === 'FARMER'
              ? 'FARMER'
              : 'BUYER';
          setCurrentRole(resolvedRole);
          showToast(`Welcome, ${profile.name}! (${resolvedRole}) 🚀`, 'success');
          if (resolvedRole === 'ADMIN') {
            navigation.navigate('AdminDashboard');
          } else if (resolvedRole === 'COURIER') {
            navigation.navigate('DriverDashboard');
          } else if (resolvedRole === 'FARMER') {
            navigation.navigate('FarmerDashboard');
          } else {
            navigation.navigate('BuyerDashboard');
          }
        }
      }
    };

    const sub = Linking.addEventListener('url', handleUrlEvent);
    Linking.getInitialURL().then(url => {
      if (url) handleUrlEvent({ url });
    });

    return () => {
      sub.remove();
    };
  }, []);

  // Micro-animation for primary CTA touch
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // ── Execute Direct Google Account Auth (No Broken Redirects) ───────────
  const executeGoogleLogin = async (candidateEmail: string) => {
    const cleanEmail = candidateEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid Google email address', 'warn');
      return;
    }

    setIsGoogleLoading(true);
    setShowGoogleModal(false);

    try {
      const cloudRole: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' =
        selectedRole === 'ADMIN'
          ? 'ADMIN'
          : selectedRole === 'FARMER'
          ? 'FARMER'
          : selectedRole === 'COURIER'
          ? 'DRIVER'
          : 'BUYER';

      const derivedName = fullName.trim() || cleanEmail.split('@')[0];

      const { profile, error } = await supabaseService.loginWithGoogleAccount({
        email: cleanEmail,
        name: derivedName,
        role: cloudRole,
      });

      setIsGoogleLoading(false);

      if (error) {
        Alert.alert('Google Sign-In Notice', error);
        return;
      }

      if (profile) {
        updateUserProfile(profile);
        setCurrentRole(selectedRole);

        if (selectedRole === 'COURIER') {
          logisticsService.loginDriver(cleanEmail);
        }

        showToast(`Signed in with Google as ${profile.name} (${selectedRole})! 🚀`, 'success');

        if (selectedRole === 'ADMIN') {
          navigation.navigate('AdminDashboard');
        } else if (selectedRole === 'COURIER') {
          navigation.navigate('DriverDashboard');
        } else if (selectedRole === 'FARMER') {
          navigation.navigate('FarmerDashboard');
        } else {
          navigation.navigate('BuyerDashboard');
        }
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      Alert.alert('Google Authentication Error', err?.message || 'Could not authenticate Google account.');
    }
  };

  // Google Continue Button: if email is present, signs in immediately; otherwise prompts for email
  const handleContinueWithGoogle = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes('@')) {
      executeGoogleLogin(cleanEmail);
    } else {
      setGoogleEmailInput('');
      setShowGoogleModal(true);
    }
  };

  // Launch browser OAuth from modal with local web IP (valid http URL)
  const handleBrowserOAuthFromModal = async () => {
    setShowGoogleModal(false);
    setIsGoogleLoading(true);
    try {
      await AsyncStorage.setItem('@agriconnect_pending_role', selectedRole);

      const redirectUri =
        typeof window !== 'undefined' && window.location && window.location.origin
          ? window.location.origin
          : 'http://172.20.10.2:8081';

      const { data, error } = await supabaseService.signInWithGoogleOAuth(redirectUri);
      setIsGoogleLoading(false);

      if (error) {
        Alert.alert('Google Sign-In', error);
        return;
      }

      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      Alert.alert('Browser Error', err?.message || 'Could not open browser');
    }
  };

  // ── Passwordless Magic Link Email Service ──────────────────────────────
  const handleSendMagicLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter your email address first', 'warn');
      setFocusedField('email');
      return;
    }

    const cloudRole: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' =
      selectedRole === 'ADMIN'
        ? 'ADMIN'
        : selectedRole === 'FARMER'
        ? 'FARMER'
        : selectedRole === 'COURIER'
        ? 'DRIVER'
        : 'BUYER';

    try {
      await AsyncStorage.setItem('@agriconnect_pending_role', selectedRole);
    } catch {}

    setIsSendingMagicLink(true);
    const { success, error } = await supabaseService.sendMagicLink(cleanEmail, cloudRole);
    setIsSendingMagicLink(false);

    if (success) {
      Alert.alert(
        'Magic Link Sent! ✉️',
        `A secure login link for the ${roleDetails[selectedRole].title} role has been dispatched to:\n\n${cleanEmail}\n\nTap the link inside your email to sign in directly as a ${roleDetails[selectedRole].title}.`
      );
      showToast(`Magic login link (${roleDetails[selectedRole].title}) sent to ${cleanEmail}`, 'success');
    } else {
      Alert.alert('Email Service Notice', error || 'Failed to dispatch magic link email.');
    }
  };

  // ── Password Reset Email Service ────────────────────────────────────────
  const handleSendPasswordReset = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter your account email in the box first', 'warn');
      setFocusedField('email');
      return;
    }

    const { success, error } = await supabaseService.sendPasswordReset(cleanEmail);
    if (success) {
      Alert.alert(
        'Password Recovery Dispatched 🔑',
        `A password reset link has been emailed to:\n\n${cleanEmail}\n\nOpen the link to securely choose a new password.`
      );
      showToast(`Password reset link emailed to ${cleanEmail}`, 'success');
    } else {
      Alert.alert('Recovery Notice', error || 'Failed to dispatch password recovery email.');
    }
  };

  // ── Form Validation & Submission ────────────────────────────────────────
  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address', 'warn');
      setFocusedField('email');
      return;
    }

    if (!password.trim()) {
      showToast('Please enter your password', 'warn');
      setFocusedField('password');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        showToast('Please enter your full name', 'warn');
        setFocusedField('fullName');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warn');
        setFocusedField('password');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'warn');
        setFocusedField('confirmPassword');
        return;
      }
      if (selectedRole === 'FARMER' && !farmName.trim()) {
        showToast('Please enter your Farm or Orchard name', 'warn');
        setFocusedField('farmName');
        return;
      }
      if (selectedRole === 'COURIER' && (!vehicleModel.trim() || !regPlate.trim())) {
        showToast('Please provide your vehicle model and registration plate', 'warn');
        setFocusedField('vehicleModel');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const cloudRole: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' =
          selectedRole === 'ADMIN'
            ? 'ADMIN'
            : selectedRole === 'FARMER'
            ? 'FARMER'
            : selectedRole === 'COURIER'
            ? 'DRIVER'
            : 'BUYER';

        // 1. Live Supabase Auth sign up
        const { profile, error, notice } = await supabaseService.signUp(cleanEmail, password, {
          name: fullName.trim(),
          role: cloudRole,
          phone: phone.trim() || undefined,
        });

        if (error) {
          setIsLoading(false);
          if (
            error.toLowerCase().includes('already registered') ||
            error.toLowerCase().includes('user already exists')
          ) {
            Alert.alert(
              'Account Exists',
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

        if (notice) {
          showToast(notice, 'info');
        }

        // 2. If Driver, register vehicle in logistics tables
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

        // 3. Update active user profile
        updateUserProfile({
          name: fullName.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          role: selectedRole,
          walletBalance: profile?.walletBalance ?? (selectedRole === 'FARMER' ? 24500 : 12500),
          escrowBalance: profile?.escrowBalance ?? 0,
          savedAddresses: profile?.savedAddresses ?? ['Central Delivery Hub, Colombo'],
          defaultAddress: profile?.defaultAddress ?? 'Central Delivery Hub, Colombo',
          isLoggedIn: true,
        });
        setCurrentRole(selectedRole);

        setIsLoading(false);
        showToast(`Welcome to FarmBy, ${fullName.trim()}! (${selectedRole}) 🚀`, 'success');

        // Route to respective dashboard
        if (selectedRole === 'ADMIN') {
          navigation.navigate('AdminDashboard');
        } else if (selectedRole === 'COURIER') {
          navigation.navigate('DriverDashboard');
        } else if (selectedRole === 'FARMER') {
          navigation.navigate('FarmerDashboard');
        } else {
          navigation.navigate('BuyerDashboard');
        }
      } else {
        // Sign In Flow with real Supabase Auth credentials
        const { profile, error, notice } = await supabaseService.signIn(cleanEmail, password);

        if (error) {
          setIsLoading(false);
          if (error.toLowerCase().includes('invalid login credentials')) {
            Alert.alert(
              'Sign In Failed',
              `The email or password you entered does not match our records.\n\nIf you don't have an account yet, switch to "Create Account" to get started!`,
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
          profile?.role === 'ADMIN'
            ? 'ADMIN'
            : profile?.role === 'DRIVER' || profile?.role === 'COURIER'
            ? 'COURIER'
            : profile?.role === 'FARMER'
            ? 'FARMER'
            : selectedRole;

        const resolvedName = profile?.name || cleanEmail.split('@')[0];

        updateUserProfile({
          name: resolvedName,
          email: cleanEmail,
          role: resolvedRole,
          walletBalance: profile?.walletBalance ?? 12500,
          escrowBalance: profile?.escrowBalance ?? 0,
          savedAddresses: profile?.savedAddresses ?? ['Central Delivery Hub, Colombo'],
          defaultAddress: profile?.defaultAddress ?? 'Central Delivery Hub, Colombo',
          isLoggedIn: true,
        });
        setCurrentRole(resolvedRole);

        if (resolvedRole === 'COURIER') {
          logisticsService.loginDriver(cleanEmail);
        }

        setIsLoading(false);
        showToast(`Welcome back, ${resolvedName}! (${resolvedRole})`, 'success');

        if (resolvedRole === 'ADMIN') {
          navigation.navigate('AdminDashboard');
        } else if (resolvedRole === 'COURIER') {
          navigation.navigate('DriverDashboard');
        } else if (resolvedRole === 'FARMER') {
          navigation.navigate('FarmerDashboard');
        } else {
          navigation.navigate('BuyerDashboard');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Authentication Error', err.message || 'Unable to connect to authentication service.');
    }
  };

  const roleDetails = {
    BUYER: {
      title: 'Buyer',
      subtitle: 'Order fresh harvest directly from verified growers',
      icon: 'cart-outline' as const,
    },
    FARMER: {
      title: 'Farmer',
      subtitle: 'List crop yields & connect directly with buyers',
      icon: 'leaf-outline' as const,
    },
    COURIER: {
      title: 'Driver',
      subtitle: 'Deliver farm shipments with intelligent route dispatch',
      icon: 'car-outline' as const,
    },
    ADMIN: {
      title: 'Admin',
      subtitle: 'Platform oversight, dispute resolution & governance',
      icon: 'shield-checkmark-outline' as const,
    },
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Minimalist Uber Top Navigation Bar */}
        <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
          <TouchableOpacity
            style={[styles.iconButton, isDark ? styles.iconButtonDark : styles.iconButtonLight]}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs', { tab: 'home' });
              }
            }}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <Text style={[styles.brandText, isDark ? styles.textWhite : styles.textBlack]}>FarmBy</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#06C167" />
              <Text style={styles.verifiedText}>Official</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.iconButton, isDark ? styles.iconButtonDark : styles.iconButtonLight]}
            onPress={toggleThemeMode}
            activeOpacity={0.7}
            accessibilityLabel="Toggle dark/light mode"
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={19}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Animated Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.mainHeading, isDark ? styles.textWhite : styles.textBlack]}>
              {authMode === 'login' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text style={[styles.subHeading, isDark ? styles.textMutedDark : styles.textMutedLight]}>
              {authMode === 'login'
                ? 'Sign in with your email to access your dashboard'
                : 'Join the decentralized agricultural network today'}
            </Text>
          </View>

          {/* Uber-Style Animated Role Selector */}
          <View style={styles.sectionWrap}>
            <Text style={[styles.microLabel, isDark ? styles.microLabelDark : styles.microLabelLight]}>
              ACCOUNT ROLE
            </Text>
            <View style={[styles.roleSegmentContainer, isDark ? styles.segmentDark : styles.segmentLight]}>
              {(['BUYER', 'FARMER', 'COURIER', 'ADMIN'] as const).map(role => {
                const isActive = selectedRole === role;
                const info = roleDetails[role];
                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleSegmentButton,
                      isActive && (isDark ? styles.roleSegmentActiveDark : styles.roleSegmentActiveLight),
                    ]}
                    onPress={() => setSelectedRole(role)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={info.icon}
                      size={17}
                      color={
                        isActive
                          ? isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : isDark
                          ? '#A1A1AA'
                          : '#71717A'
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.roleSegmentText,
                        isActive
                          ? isDark
                            ? styles.roleSegmentTextActiveDark
                            : styles.roleSegmentTextActiveLight
                          : isDark
                          ? styles.textMutedDark
                          : styles.textMutedLight,
                      ]}
                    >
                      {info.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.roleHint, isDark ? styles.roleHintDark : styles.roleHintLight]}>
              {roleDetails[selectedRole].subtitle}
            </Text>
          </View>

          {/* Animated Mode Switcher (Sign In vs Create Account) */}
          <View style={[styles.modeTabsRow, isDark ? styles.modeTabsDark : styles.modeTabsLight]}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                authMode === 'login' && (isDark ? styles.modeTabActiveDark : styles.modeTabActiveLight),
              ]}
              onPress={() => setAuthMode('login')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.modeTabText,
                  authMode === 'login'
                    ? isDark
                      ? styles.textWhite
                      : styles.textBlack
                    : isDark
                    ? styles.textMutedDark
                    : styles.textMutedLight,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                authMode === 'signup' && (isDark ? styles.modeTabActiveDark : styles.modeTabActiveLight),
              ]}
              onPress={() => setAuthMode('signup')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.modeTabText,
                  authMode === 'signup'
                    ? isDark
                      ? styles.textWhite
                      : styles.textBlack
                    : isDark
                    ? styles.textMutedDark
                    : styles.textMutedLight,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Official Google OAuth Single Sign-On Button */}
          <TouchableOpacity
            style={[styles.googleButton, isDark ? styles.googleButtonDark : styles.googleButtonLight]}
            onPress={handleContinueWithGoogle}
            disabled={isGoogleLoading}
            activeOpacity={0.85}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
            ) : (
              <>
                <View style={styles.googleIconWrap}>
                  <Ionicons name="logo-google" size={19} color="#EA4335" />
                </View>
                <Text style={[styles.googleButtonText, isDark ? styles.textWhite : styles.textBlack]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerWrap}>
            <View style={[styles.dividerLine, isDark ? styles.dividerLineDark : styles.dividerLineLight]} />
            <Text style={[styles.dividerText, isDark ? styles.dividerTextDark : styles.dividerTextLight]}>
              OR CONTINUE WITH EMAIL
            </Text>
            <View style={[styles.dividerLine, isDark ? styles.dividerLineDark : styles.dividerLineLight]} />
          </View>

          {/* Animated Form Fields */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Full Name (Sign Up only) */}
            {authMode === 'signup' && (
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                  Full Name
                </Text>
                <View
                  style={[
                    styles.inputField,
                    isDark ? styles.inputFieldDark : styles.inputFieldLight,
                    focusedField === 'fullName' && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color={focusedField === 'fullName' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                  />
                  <TextInput
                    style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                    placeholder="e.g. John Doe"
                    placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputBlock}>
              <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                Email Address
              </Text>
              <View
                style={[
                  styles.inputField,
                  isDark ? styles.inputFieldDark : styles.inputFieldLight,
                  focusedField === 'email' && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={focusedField === 'email' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                />
                <TextInput
                  style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Phone Number (Sign Up only) */}
            {authMode === 'signup' && (
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                  Phone Number
                </Text>
                <View
                  style={[
                    styles.inputField,
                    isDark ? styles.inputFieldDark : styles.inputFieldLight,
                    focusedField === 'phone' && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={19}
                    color={focusedField === 'phone' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                  />
                  <TextInput
                    style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                    placeholder="+94 77 123 4567"
                    placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* Farmer Specific Fields (Sign Up only) */}
            {authMode === 'signup' && selectedRole === 'FARMER' && (
              <>
                <View style={styles.inputBlock}>
                  <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                    Farm or Orchard Name
                  </Text>
                  <View
                    style={[
                      styles.inputField,
                      isDark ? styles.inputFieldDark : styles.inputFieldLight,
                      focusedField === 'farmName' && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name="business-outline"
                      size={19}
                      color={focusedField === 'farmName' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                    />
                    <TextInput
                      style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="e.g. Highland Valley Orchards"
                      placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                      value={farmName}
                      onChangeText={setFarmName}
                      onFocus={() => setFocusedField('farmName')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={styles.inputBlock}>
                  <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                    Farm Region / Location
                  </Text>
                  <View
                    style={[
                      styles.inputField,
                      isDark ? styles.inputFieldDark : styles.inputFieldLight,
                      focusedField === 'farmLocation' && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={19}
                      color={focusedField === 'farmLocation' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                    />
                    <TextInput
                      style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                      placeholder="e.g. Kandy, Central Province"
                      placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                      value={farmLocation}
                      onChangeText={setFarmLocation}
                      onFocus={() => setFocusedField('farmLocation')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Driver Specific Fields (Sign Up only) */}
            {authMode === 'signup' && selectedRole === 'COURIER' && (
              <>
                <View style={styles.inputBlock}>
                  <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                    Vehicle Category
                  </Text>
                  <View style={styles.vehicleCategoryRow}>
                    {(['Small truck', 'Van', 'Three-wheeler', 'Motorbike', 'Lorry'] as VehicleType[]).map(v => {
                      const isVSelected = vehicleType === v;
                      return (
                        <TouchableOpacity
                          key={v}
                          style={[
                            styles.vehiclePill,
                            isDark ? styles.vehiclePillDark : styles.vehiclePillLight,
                            isVSelected && styles.vehiclePillActive,
                          ]}
                          onPress={() => setVehicleType(v)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.vehiclePillText,
                              isVSelected
                                ? styles.vehiclePillTextActive
                                : isDark
                                ? styles.textMutedDark
                                : styles.textMutedLight,
                            ]}
                          >
                            {v}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputBlock}>
                  <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                    Vehicle Model & License Plate
                  </Text>
                  <View style={styles.dualInputRow}>
                    <View
                      style={[
                        styles.inputField,
                        { flex: 1.2 },
                        isDark ? styles.inputFieldDark : styles.inputFieldLight,
                        focusedField === 'vehicleModel' && styles.inputFocused,
                      ]}
                    >
                      <TextInput
                        style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="e.g. Isuzu Elf"
                        placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                        value={vehicleModel}
                        onChangeText={setVehicleModel}
                        onFocus={() => setFocusedField('vehicleModel')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    <View
                      style={[
                        styles.inputField,
                        { flex: 1 },
                        isDark ? styles.inputFieldDark : styles.inputFieldLight,
                        focusedField === 'regPlate' && styles.inputFocused,
                      ]}
                    >
                      <TextInput
                        style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                        placeholder="WP CAB-1234"
                        placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                        value={regPlate}
                        onChangeText={setRegPlate}
                        onFocus={() => setFocusedField('regPlate')}
                        onBlur={() => setFocusedField(null)}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Password */}
            <View style={styles.inputBlock}>
              <View style={styles.labelWithActionRow}>
                <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                  Password
                </Text>
                {authMode === 'login' && (
                  <TouchableOpacity onPress={handleSendPasswordReset} activeOpacity={0.7}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={[
                  styles.inputField,
                  isDark ? styles.inputFieldDark : styles.inputFieldLight,
                  focusedField === 'password' && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={focusedField === 'password' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                />
                <TextInput
                  style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder={authMode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={isDark ? '#71717A' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password (Sign Up only) */}
            {authMode === 'signup' && (
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                  Confirm Password
                </Text>
                <View
                  style={[
                    styles.inputField,
                    isDark ? styles.inputFieldDark : styles.inputFieldLight,
                    focusedField === 'confirmPassword' && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={19}
                    color={focusedField === 'confirmPassword' ? '#06C167' : isDark ? '#71717A' : '#9CA3AF'}
                  />
                  <TextInput
                    style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                    placeholder="Re-enter password"
                    placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Primary Action Button with Micro-Animation */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && { opacity: 0.8 }]}
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
                activeOpacity={0.92}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.primaryButtonContent}>
                    <Text style={styles.primaryButtonText}>
                      {authMode === 'login'
                        ? 'Sign In'
                        : `Create ${roleDetails[selectedRole].title} Account`}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Magic Link (Passwordless Option in Login Mode) */}
            {authMode === 'login' && (
              <TouchableOpacity
                style={[styles.magicLinkButton, isDark ? styles.magicLinkDark : styles.magicLinkLight]}
                onPress={handleSendMagicLink}
                disabled={isSendingMagicLink}
                activeOpacity={0.8}
              >
                {isSendingMagicLink ? (
                  <ActivityIndicator size="small" color="#06C167" />
                ) : (
                  <>
                    <Ionicons name="mail-unread-outline" size={17} color="#06C167" style={{ marginRight: 8 }} />
                    <Text style={[styles.magicLinkText, isDark ? styles.textWhite : styles.textBlack]}>
                      Email me a Magic Sign-In Link
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Mode Switch Prompt */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchPromptText, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity
                onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{ marginLeft: 6 }}
                activeOpacity={0.7}
              >
                <Text style={styles.switchActionLink}>
                  {authMode === 'login' ? 'Create Account' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security and Terms Footer */}
            <View style={styles.footerBlock}>
              <View style={styles.securityRow}>
                <Ionicons name="lock-closed" size={12} color="#06C167" style={{ marginRight: 5 }} />
                <Text style={[styles.securityText, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                  Protected by Supabase Cloud Authentication • 256-Bit SSL
                </Text>
              </View>
              <Text style={[styles.termsText, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                By continuing, you agree to FarmBy's Terms of Service and Privacy Policy.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Seamless Minimalist Google Sign-In Modal */}
      <Modal
        visible={showGoogleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, isDark ? styles.modalCardDark : styles.modalCardLight]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.googleIconBadgeLarge}>
                <Ionicons name="logo-google" size={22} color="#EA4335" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.modalTitle, isDark ? styles.textWhite : styles.textBlack]}>
                  Continue with Google
                </Text>
                <Text style={[styles.modalSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                  Sign in with your Google account
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGoogleModal(false)}
                style={[styles.closeIconBtn, isDark ? styles.iconButtonDark : styles.iconButtonLight]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            {/* Role Selection inside Google Modal */}
            <View style={{ marginTop: 14, marginBottom: 8 }}>
              <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                SIGN IN AS ROLE
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {(['BUYER', 'FARMER', 'COURIER', 'ADMIN'] as const).map(r => {
                  const isCurActive = selectedRole === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setSelectedRole(r)}
                      style={{
                        flex: 1,
                        paddingVertical: 7,
                        borderRadius: 8,
                        alignItems: 'center',
                        backgroundColor: isCurActive
                          ? (isDark ? '#FFFFFF' : '#000000')
                          : (isDark ? '#27272A' : '#F4F4F5'),
                        borderWidth: 1,
                        borderColor: isCurActive ? (isDark ? '#FFFFFF' : '#000000') : 'transparent',
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          color: isCurActive
                            ? (isDark ? '#000000' : '#FFFFFF')
                            : (isDark ? '#A1A1AA' : '#71717A'),
                        }}
                      >
                        {r === 'COURIER' ? 'DRIVER' : r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Google Email Input */}
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textBlack]}>
                Your Google Email Address
              </Text>
              <View
                style={[
                  styles.inputField,
                  isDark ? styles.inputFieldDark : styles.inputFieldLight,
                  styles.inputFocused,
                ]}
              >
                <Ionicons name="mail-outline" size={19} color="#06C167" />
                <TextInput
                  style={[styles.textInput, isDark ? styles.textWhite : styles.textBlack]}
                  placeholder="your.name@gmail.com"
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  value={googleEmailInput}
                  onChangeText={setGoogleEmailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => executeGoogleLogin(googleEmailInput)}
              disabled={isGoogleLoading}
              activeOpacity={0.88}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.primaryButtonContent}>
                  <Ionicons name="logo-google" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>
                    Sign In with This Google Account
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Optional Browser OAuth link */}
            <TouchableOpacity
              style={{ marginTop: 14, alignItems: 'center' }}
              onPress={handleBrowserOAuthFromModal}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalSecondaryLink, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                Or launch browser authorization →
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgLight: {
    backgroundColor: '#FFFFFF',
  },
  bgDark: {
    backgroundColor: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#000000',
  },
  textMutedLight: {
    color: '#6B7280',
  },
  textMutedDark: {
    color: '#9CA3AF',
  },

  // Top Minimalist Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  topBarDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonLight: {
    backgroundColor: '#F3F4F6',
  },
  iconButtonDark: {
    backgroundColor: '#1C1C1E',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06C167',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },

  headerSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Role Selector Segment
  sectionWrap: {
    marginBottom: 18,
  },
  microLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  microLabelLight: {
    color: '#6B7280',
  },
  microLabelDark: {
    color: '#9CA3AF',
  },
  roleSegmentContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
  },
  segmentLight: {
    backgroundColor: '#F3F4F6',
  },
  segmentDark: {
    backgroundColor: '#161618',
  },
  roleSegmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  roleSegmentActiveLight: {
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  roleSegmentActiveDark: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  roleSegmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleSegmentTextActiveLight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  roleSegmentTextActiveDark: {
    color: '#000000',
    fontWeight: '700',
  },
  roleHint: {
    fontSize: 12,
    marginTop: 7,
    fontStyle: 'italic',
  },
  roleHintLight: {
    color: '#6B7280',
  },
  roleHintDark: {
    color: '#9CA3AF',
  },

  // Mode Switch Tabs (Sign In / Create Account)
  modeTabsRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  modeTabsLight: {
    backgroundColor: '#F3F4F6',
  },
  modeTabsDark: {
    backgroundColor: '#161618',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  modeTabActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabActiveDark: {
    backgroundColor: '#27272A',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Google Single Sign-On
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  googleButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonDark: {
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  googleIconWrap: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Divider
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLineLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
  },
  dividerLineDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
  },
  dividerTextLight: {
    color: '#9CA3AF',
  },
  dividerTextDark: {
    color: '#71717A',
  },

  // Input Fields
  inputBlock: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  labelWithActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  inputFieldLight: {
    backgroundColor: '#F9FAFB',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  inputFieldDark: {
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  inputFocused: {
    borderColor: '#06C167',
    backgroundColor: 'rgba(6, 193, 103, 0.03)',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },

  // Vehicle Categories for Drivers
  vehicleCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehiclePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  vehiclePillLight: {
    backgroundColor: '#F3F4F6',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  vehiclePillDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  vehiclePillActive: {
    backgroundColor: '#06C167',
    borderColor: '#06C167',
  },
  vehiclePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vehiclePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dualInputRow: {
    flexDirection: 'row',
    gap: 8,
  },

  // Primary Action Button (Electric Emerald)
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#06C167',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Passwordless Magic Link Button
  magicLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  magicLinkLight: {
    backgroundColor: '#F9FAFB',
    borderColor: 'rgba(6, 193, 103, 0.3)',
  },
  magicLinkDark: {
    backgroundColor: '#161618',
    borderColor: 'rgba(6, 193, 103, 0.3)',
  },
  magicLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Switch Mode
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  switchPromptText: {
    fontSize: 13,
  },
  switchActionLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
  },

  // Footer & Security
  footerBlock: {
    marginTop: 32,
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },

  // Google Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalCardLight: {
    backgroundColor: '#FFFFFF',
  },
  modalCardDark: {
    backgroundColor: '#161618',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconBadgeLarge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryLink: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 6,
  },
});
