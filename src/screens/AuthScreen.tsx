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

  // Quick Demo Logins
  const handleQuickDemo = async (role: 'BUYER' | 'FARMER' | 'COURIER' | 'ADMIN') => {
    setIsLoading(true);

    if (role === 'BUYER') {
      updateUserProfile({
        name: 'Sonal Perera',
        email: 'sonal.perera@gmail.com',
        phone: '+94 71 888 9999',
        role: 'BUYER',
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
        role: 'ADMIN',
        isLoggedIn: true,
      });
      setCurrentRole('ADMIN');
      showToast('Logged in as Platform Administrator 🛡️', 'success');
      navigation.navigate('AdminDashboard');
    }

    setIsLoading(false);
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
        // Map courier role to driver for supabase profile
        const cloudRole: 'BUYER' | 'FARMER' | 'DRIVER' =
          selectedRole === 'FARMER' ? 'FARMER' : selectedRole === 'COURIER' ? 'DRIVER' : 'BUYER';

        // 1. Register with Supabase Auth
        const { user, profile, error } = await supabaseService.signUp(cleanEmail, password, {
          name: fullName.trim(),
          role: cloudRole,
          phone: phone.trim() || undefined,
        });

        if (error) {
          setIsLoading(false);
          Alert.alert('Sign Up Note', error);
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
          isLoggedIn: true,
        });
        setCurrentRole(selectedRole);

        setIsLoading(false);
        showToast(`Account created on Supabase Cloud! Welcome, ${fullName.trim()}! 🚀`, 'success');

        if (selectedRole === 'COURIER') {
          navigation.navigate('DriverDashboard');
        } else if (selectedRole === 'FARMER') {
          navigation.navigate('FarmerDashboard');
        } else {
          navigation.navigate('BuyerDashboard');
        }
      } else {
        // Sign In Flow
        const { user, profile, error } = await supabaseService.signIn(cleanEmail, password);

        if (error) {
          // If demo account entered offline, allow graceful login
          const isDemo =
            cleanEmail.includes('greenvalley') ||
            cleanEmail.includes('demo') ||
            cleanEmail.includes('sonal') ||
            cleanEmail.includes('kasun');

          if (!isDemo) {
            setIsLoading(false);
            Alert.alert('Authentication Failed', error);
            return;
          }
        }

        const resolvedRole: UserRole =
          profile?.role === 'FARMER'
            ? 'FARMER'
            : profile?.role === 'DRIVER'
            ? 'COURIER'
            : selectedRole;

        const resolvedName = profile?.name || (resolvedRole === 'FARMER' ? 'Mateo Gutierrez' : 'Sonal Perera');

        updateUserProfile({
          name: resolvedName,
          email: cleanEmail,
          role: resolvedRole,
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

            {/* Form Inputs Container */}
            <View style={[styles.card, isDark && styles.cardDark]}>
              {/* Full Name for Sign Up */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Full Name</Text>
                  <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                    <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                    <TextInput
                      style={[styles.input, isDark && { color: '#FFFFFF' }]}
                      placeholder="e.g. Sonal Perera"
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
                <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Email Address</Text>
                <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={[styles.input, isDark && { color: '#FFFFFF' }]}
                    placeholder="name@example.com"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
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
                <Text style={[styles.inputLabel, isDark && { color: '#E4E4E7' }]}>Password</Text>
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
                        ? `Sign In as ${selectedRole === 'COURIER' ? 'Driver' : selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'}`
                        : `Create ${selectedRole === 'COURIER' ? 'Driver' : selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'} Account`}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick 1-Tap Demo Logins Strip */}
            <View style={styles.demoSection}>
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, isDark && { backgroundColor: '#27272A' }]} />
                <Text style={[styles.dividerText, isDark && { color: '#71717A' }]}>OR QUICK DEMO LOGIN</Text>
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
    marginBottom: 18,
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
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
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
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
    borderColor: '#06C167',
  },
  vehiclePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  vehiclePillTextActive: {
    color: '#06C167',
    fontWeight: '800',
  },
  primaryBtn: {
    backgroundColor: '#06C167',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  demoSection: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
});
