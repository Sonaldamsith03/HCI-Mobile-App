import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabaseService, parseJwtPayload } from '../services/supabaseService';

export const OAuthWebRedirect: React.FC = () => {
  const [hasAuthCallback, setHasAuthCallback] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const currentUrl = window.location.href;
    const hasHash = window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'));
    const hasCode = window.location.search && window.location.search.includes('code=');

    if (hasHash || hasCode) {
      setHasAuthCallback(true);

      const exchangeAndRedirect = async () => {
        const host = window.location.host;
        let queryParams = window.location.search || '';
        let hashParams = window.location.hash || '';

        // 1. Exchange session in Safari to get authenticated user identity
        const { user, profile } = await supabaseService.handleOAuthCallbackUrl(currentUrl);

        let emailToPass = user?.email;
        let nameToPass = profile?.name;
        let roleToPass = profile?.role || 'BUYER';

        // Direct JWT token fallback if handleOAuthCallbackUrl didn't get email
        if (!emailToPass) {
          const match = currentUrl.match(/[#&?]access_token=([^&#]+)/);
          if (match && match[1]) {
            const payload = parseJwtPayload(decodeURIComponent(match[1]));
            if (payload?.email) {
              emailToPass = payload.email;
              nameToPass = payload.user_metadata?.full_name || payload.user_metadata?.name || payload.email.split('@')[0];
              if (payload.user_metadata?.role) {
                roleToPass = payload.user_metadata.role;
              }
            }
          }
        }

        let finalUrl = `exp://${host}/--/auth-callback`;
        if (emailToPass) {
          finalUrl += `?verified_email=${encodeURIComponent(emailToPass)}&name=${encodeURIComponent(nameToPass || emailToPass.split('@')[0])}&role=${encodeURIComponent(roleToPass)}`;
        } else {
          finalUrl += `${queryParams}${hashParams}`;
        }

        setTargetUrl(finalUrl);

        // 2. Automatically trigger redirect to Expo Go app
        const timer = setTimeout(() => {
          try {
            window.location.href = finalUrl;
          } catch {
            // Ignore navigation error
          }
          setIsRedirecting(false);
        }, 500);

        return () => clearTimeout(timer);
      };

      exchangeAndRedirect();
    }
  }, []);

  if (!hasAuthCallback || dismissed) {
    return null;
  }

  const handleOpenApp = () => {
    if (typeof window !== 'undefined' && targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const handleStayInBrowser = () => {
    setDismissed(true);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={48} color="#06C167" />
        </View>

        <Text style={styles.title}>Signed In Successfully!</Text>
        <Text style={styles.subtitle}>
          Your Google authentication is verified. Returning to the mobile app...
        </Text>

        {isRedirecting && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#06C167" />
            <Text style={styles.loadingText}>Opening AgriConnect App...</Text>
          </View>
        )}

        {/* Primary CTA to open native app */}
        <TouchableOpacity
          style={styles.openAppButton}
          onPress={handleOpenApp}
          activeOpacity={0.88}
        >
          <Ionicons name="phone-portrait-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.openAppButtonText}>Open in AgriConnect App</Text>
        </TouchableOpacity>

        {/* Secondary option to stay in web */}
        <TouchableOpacity
          style={styles.stayButton}
          onPress={handleStayInBrowser}
          activeOpacity={0.7}
        >
          <Text style={styles.stayButtonText}>Continue in Safari Browser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#161618',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(6, 193, 103, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  loadingText: {
    fontSize: 12,
    color: '#06C167',
    fontWeight: '600',
  },
  openAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#06C167',
    borderRadius: 14,
    marginBottom: 12,
  },
  openAppButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stayButton: {
    paddingVertical: 8,
  },
  stayButtonText: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '600',
  },
});
