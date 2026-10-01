import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { MainTabsContainer } from '../screens/MainTabsContainer';
import { LandingScreen } from '../screens/LandingScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { FarmerDashboard } from '../screens/FarmerDashboard';
import { BuyerDashboard } from '../screens/BuyerDashboard';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { AdminDashboard } from '../screens/AdminDashboard';
import { LogisticsDashboard } from '../screens/LogisticsDashboard';
import { ChatConversationScreen } from '../screens/ChatConversationScreen';
import { DriverAuthScreen } from '../screens/logistics/DriverAuthScreen';
import { DriverMainTabsScreen } from '../screens/logistics/DriverMainTabsScreen';
import { DriverTripDetailScreen } from '../screens/logistics/DriverTripDetailScreen';
import { DeliveryTrackingScreen } from '../screens/logistics/DeliveryTrackingScreen';

import { useApp } from '../context/AppContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { navTransitionDirection } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: navTransitionDirection,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationDuration: 240,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabsContainer}
          options={{ animation: 'none' }}
        />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="FarmerDashboard" component={FarmerDashboard} />
        <Stack.Screen name="BuyerDashboard" component={BuyerDashboard} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="LogisticsDashboard" component={DriverMainTabsScreen} />
        <Stack.Screen name="DriverAuth" component={DriverAuthScreen} />
        <Stack.Screen name="DriverDashboard" component={DriverMainTabsScreen} />
        <Stack.Screen name="DriverTripDetail" component={DriverTripDetailScreen} />
        <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} />
        <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

