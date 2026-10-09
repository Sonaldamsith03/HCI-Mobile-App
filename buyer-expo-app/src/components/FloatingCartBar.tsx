import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFarm } from '@/context/FarmContext';

export function FarmToast() {
  const { toastMessage } = useFarm();
  if (!toastMessage) return null;

  return (
    <View style={styles.toastContainer} pointerEvents="none">
      <View style={styles.toastBubble}>
        <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    </View>
  );
}

export function FloatingCartBar() {
  const { cartCount, cartTotal } = useFarm();
  if (cartCount === 0) return null;

  return (
    <View style={styles.floatingContainer}>
      <Pressable
        style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
        onPress={() => router.push('/cart')}>
        <View style={styles.cartInfo}>
          <View style={styles.iconCircle}>
            <Ionicons name="cart" size={18} color="#FFFFFF" />
            <View style={styles.miniBadge}>
              <Text style={styles.miniBadgeText}>{cartCount}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.batchText}>{cartCount} {cartCount === 1 ? 'crop lot' : 'crop lots'} selected</Text>
            <Text style={styles.totalText}>RS. {cartTotal.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.viewBasketRow}>
          <Text style={styles.viewBasketText}>View Basket</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastBubble: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 90,
  },
  cartButton: {
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  batchText: {
    color: '#BBF7D0',
    fontSize: 11,
    fontWeight: '500',
  },
  totalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  viewBasketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#166534',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewBasketText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
