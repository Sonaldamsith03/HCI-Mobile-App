import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverAvailability } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface DriverStatusToggleProps {
  status: DriverAvailability;
  onToggle: (newStatus: boolean) => void;
  isDark?: boolean;
}

export const DriverStatusToggle: React.FC<DriverStatusToggleProps> = ({
  status,
  onToggle,
  isDark = true,
}) => {
  const isOnline = status === 'ONLINE';
  const isBusy = status === 'BUSY';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  const handlePress = () => {
    onToggle(!isOnline);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
        isOnline && styles.containerOnline,
        isBusy && styles.containerBusy,
      ]}
    >
      <View style={styles.indicatorWrapper}>
        {isOnline && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />
        )}
        <View
          style={[
            styles.dot,
            isOnline ? styles.dotOnline : isBusy ? styles.dotBusy : styles.dotOffline,
          ]}
        />
      </View>

      <View style={styles.textColumn}>
        <Text
          style={[
            styles.statusTitle,
            isOnline ? styles.textOnline : isBusy ? styles.textBusy : isDark ? styles.textWhite : styles.textBlack,
          ]}
        >
          {isOnline ? 'YOU ARE ONLINE' : isBusy ? 'ON ACTIVE TRIP' : 'YOU ARE OFFLINE'}
        </Text>
        <Text style={[styles.statusSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
          {isOnline
            ? 'Ready for instant delivery dispatches'
            : isBusy
            ? 'Completing assigned cargo run'
            : 'Tap to start receiving delivery requests'}
        </Text>
      </View>

      <View
        style={[
          styles.switchPill,
          isOnline ? styles.switchPillOnline : styles.switchPillOffline,
        ]}
      >
        <Ionicons
          name={isOnline ? 'power' : 'power-outline'}
          size={16}
          color={isOnline ? '#FFFFFF' : '#8E8E93'}
        />
        <Text style={[styles.switchText, isOnline ? styles.switchTextOnline : styles.switchTextOffline]}>
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginVertical: 8,
  },
  containerDark: {
    backgroundColor: '#121212',
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  containerOnline: {
    borderColor: 'rgba(6, 193, 103, 0.40)',
    backgroundColor: 'rgba(6, 193, 103, 0.08)',
  },
  containerBusy: {
    borderColor: 'rgba(255, 184, 0, 0.40)',
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
  },
  indicatorWrapper: {
    position: 'relative',
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#06C167',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOnline: {
    backgroundColor: '#06C167',
  },
  dotBusy: {
    backgroundColor: '#FFB800',
  },
  dotOffline: {
    backgroundColor: '#8E8E93',
  },
  textColumn: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  textOnline: {
    color: '#06C167',
  },
  textBusy: {
    color: '#FFB800',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#000000',
  },
  textMutedDark: {
    color: '#8E8E93',
  },
  textMutedLight: {
    color: '#6B7280',
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  switchPillOnline: {
    backgroundColor: '#FF3B30',
  },
  switchPillOffline: {
    backgroundColor: '#06C167',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '700',
  },
  switchTextOnline: {
    color: '#FFFFFF',
  },
  switchTextOffline: {
    color: '#FFFFFF',
  },
});
