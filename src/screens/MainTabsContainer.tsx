import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { LandingScreen } from './LandingScreen';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { BuyerDashboard } from './BuyerDashboard';
import { OnboardingScreen } from './OnboardingScreen';
import { AuthScreen } from './AuthScreen';
import { UberBottomNavBar, AppNavTab } from '../components/UberBottomNavBar';
import { useApp } from '../context/AppContext';

export const MainTabsContainer: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'MainTabs'>>();
  const { themeMode, currentBottomTab, setCurrentBottomTab } = useApp();
  const isDark = themeMode === 'dark';

  // If route params specified a tab, sync it
  React.useEffect(() => {
    if (route.params?.tab && route.params.tab !== currentBottomTab) {
      setCurrentBottomTab(route.params.tab);
    }
  }, [route.params?.tab]);

  // Animate page transition smoothly inside the container without shifting the bottom bar
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleTabChange = (tab: AppNavTab) => {
    if (tab === currentBottomTab) return;
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentBottomTab(tab);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Dynamic Screen Content - Transitions independently while bottom nav stays strictly pinned */}
      <Animated.View style={[styles.screenContent, { opacity: fadeAnim }]}>
        {currentBottomTab === 'home' && <LandingScreen hideBottomNav={true} />}
        {currentBottomTab === 'services' && <RoleSelectionScreen hideBottomNav={true} />}
        {currentBottomTab === 'activity' && <BuyerDashboard hideBottomNav={true} />}
        {currentBottomTab === 'account' && (
          userProfile.isLoggedIn ? (
            <OnboardingScreen hideBottomNav={true} />
          ) : (
            <AuthScreen />
          )
        )}
      </Animated.View>

      {/* Permanently Static Floating Uber Navigation Bar */}
      <UberBottomNavBar
        activeTab={currentBottomTab}
        onTabSelect={handleTabChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  screenContent: {
    flex: 1,
  },
});
