import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { FarmProvider } from '@/context/FarmContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen smoothly on mount
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FarmProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#FAFAF9' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="filter" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="location" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="map" />
        <Stack.Screen name="impact" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="farm/[id]" />
        <Stack.Screen name="offer/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </FarmProvider>
  );
}
