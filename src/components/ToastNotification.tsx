import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const ToastNotification: React.FC = () => {
  const { toast, clearToast } = useApp();

  // Slide from top (Dynamic Island feel)
  const translateY = useRef(new Animated.Value(-90)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // Icon pop
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  // Pill width morph
  const pillScaleX = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    if (toast) {
      // Reset
      translateY.setValue(-90);
      opacity.setValue(0);
      iconScale.setValue(0.3);
      iconRotate.setValue(-0.3);
      pillScaleX.setValue(0.65);

      // Enter: elastic spring drop from top
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          damping: 16,
          stiffness: 320,
          mass: 0.8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(pillScaleX, {
          toValue: 1,
          useNativeDriver: Platform.OS !== 'web',
          damping: 14,
          stiffness: 280,
        }),
      ]).start(() => {
        // Icon pops in after the pill lands
        Animated.parallel([
          Animated.spring(iconScale, {
            toValue: 1,
            useNativeDriver: Platform.OS !== 'web',
            damping: 8,
            stiffness: 400,
          }),
          Animated.spring(iconRotate, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
            damping: 10,
            stiffness: 300,
          }),
        ]).start();
      });

      const timer = setTimeout(() => {
        // Exit: spring back up
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: -90,
            useNativeDriver: Platform.OS !== 'web',
            damping: 18,
            stiffness: 300,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(pillScaleX, {
            toValue: 0.65,
            useNativeDriver: Platform.OS !== 'web',
            damping: 18,
            stiffness: 300,
          }),
        ]).start(() => clearToast());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'info':
        return <Ionicons name="information-circle" size={18} color="#38BDF8" />;
      case 'warn':
        return <Ionicons name="warning" size={18} color="#FBBF24" />;
      case 'success':
      default:
        return <Ionicons name="checkmark-circle" size={18} color="#34D399" />;
    }
  };

  const rotateInterp = iconRotate.interpolate({
    inputRange: [-0.3, 0],
    outputRange: ['-25deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.toastPill,
          { transform: [{ scaleX: pillScaleX }] },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: iconScale }, { rotate: rotateInterp }],
            marginRight: 8,
          }}
        >
          {getIcon()}
        </Animated.View>
        <Text style={styles.toastText} numberOfLines={1}>
          {toast.message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 14 : 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 24, 0.97)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    maxWidth: 360,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});
