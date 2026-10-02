import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastNotification } from './src/components/ToastNotification';
import { OAuthWebRedirect } from './src/components/OAuthWebRedirect';
import { colors } from './src/theme/colors';

// Inject modern clean Apple SF Pro typography & Icon Fonts on Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'agriconnect-apple-liquid-glass';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: 'Ionicons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
      }
      html, body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #06111C;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }
}

function AppleStatusBar() {
  return (
    <View style={styles.appleStatusBar}>
      <Text style={styles.statusBarTime}>9:41</Text>
      <View style={styles.dynamicIsland}>
        <View style={styles.cameraLens} />
      </View>
      <View style={styles.statusBarIcons}>
        <Ionicons name="cellular" size={13} color="#1C1C1E" />
        <Ionicons name="wifi" size={13} color="#1C1C1E" />
        <View style={styles.batteryPill}>
          <View style={styles.batteryFill} />
        </View>
      </View>
    </View>
  );
}

function AppleHomeIndicator() {
  return (
    <View style={styles.homeIndicatorWrapper}>
      <View style={styles.homeIndicatorBar} />
    </View>
  );
}

function AppContent() {
  const { width } = useWindowDimensions();
  // On desktop browsers, frame precisely within standard mobile phone dimensions (390px)
  const isDesktop = Platform.OS === 'web' && width > 480;

  if (isDesktop) {
    return (
      <View style={styles.desktopBackdrop}>
        {/* Apple Vision Luminous Ambient Glows behind Phone */}
        <View style={styles.ambientGlow1} />
        <View style={styles.ambientGlow2} />

        <View style={styles.phoneFrame}>
          <StatusBar style="dark" />
          <AppleStatusBar />
          <View style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <RootNavigator />
            <ToastNotification />
            <OAuthWebRedirect />
          </View>
          <AppleHomeIndicator />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.nativeContainer}>
      <StatusBar style="dark" />
      <RootNavigator />
      <ToastNotification />
      <OAuthWebRedirect />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: colors.canvasBackground,
  },
  desktopBackdrop: {
    flex: 1,
    backgroundColor: '#06111C', // Vision Pro dark space
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(5, 150, 105, 0.18)', // Liquid emerald aurora glow
    top: -100,
    left: '20%',
    filter: 'blur(90px)' as any,
  },
  ambientGlow2: {
    position: 'absolute',
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(0, 122, 255, 0.14)', // Apple sapphire aurora glow
    bottom: -100,
    right: '20%',
    filter: 'blur(90px)' as any,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 390, // Calibrated standard iPhone mobile width
    height: '100%',
    maxHeight: 844, // 19.5:9 standard mobile screen height
    backgroundColor: colors.canvasBackground,
    borderRadius: 46, // Apple continuous curvature
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.20)', // Specular phone rim
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.65,
    shadowRadius: 48,
    elevation: 30,
    zIndex: 10,
  },
  appleStatusBar: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  statusBarTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.2,
    width: 44,
  },
  dynamicIsland: {
    width: 92,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  cameraLens: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 50,
    justifyContent: 'flex-end',
  },
  batteryPill: {
    width: 20,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    width: 14,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: '#1C1C1E',
  },
  homeIndicatorWrapper: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1C1C1E',
    opacity: 0.6,
  },
});
