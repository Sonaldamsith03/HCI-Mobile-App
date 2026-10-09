import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFarm } from '@/context/FarmContext';
import { FarmToast } from '@/components/FloatingCartBar';

export default function CartScreen() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, showToast } =
    useFarm();

  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier');
  const deliveryFee = deliveryMethod === 'courier' ? 150 : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handleCheckout = () => {
    showToast('Order confirmed! Farmers notified for morning dispatch.');
    clearCart();
    setTimeout(() => {
      router.replace('/orders');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <Text style={styles.headerTitle}>Harvest Basket</Text>

        {cart.length > 0 ? (
          <Pressable onPress={clearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={44} color="#15803D" />
          </View>
          <Text style={styles.emptyTitle}>Your Farm Basket is Empty</Text>
          <Text style={styles.emptySub}>
            Discover fresh regional crops picked at sunrise across 18 regional plots.
          </Text>

          <Pressable
            style={styles.exploreBtn}
            onPress={() => router.push('/explore')}>
            <Text style={styles.exploreBtnText}>{"Explore Today's Harvest"}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Cart Items List */}
          <View style={styles.itemsCard}>
            {cart.map((item) => (
              <View key={item.crop.id} style={styles.itemRow}>
                <Image
                  source={item.crop.image}
                  style={styles.itemImage}
                  contentFit="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.crop.title}</Text>
                  <Text style={styles.itemFarm}>From {item.crop.farm}</Text>
                  <Text style={styles.itemPrice}>
                    RS. {item.crop.price} /{item.crop.unit}
                  </Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.qtyCol}>
                  <View style={styles.qtyRow}>
                    <Pressable
                      style={styles.qtyMiniBtn}
                      onPress={() =>
                        updateCartQuantity(item.crop.id, item.quantity - 1)
                      }>
                      <Ionicons name="remove" size={14} color="#0F172A" />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyMiniBtn}
                      onPress={() =>
                        updateCartQuantity(item.crop.id, item.quantity + 1)
                      }>
                      <Ionicons name="add" size={14} color="#0F172A" />
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => removeFromCart(item.crop.id)}>
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          {/* Delivery Method Selector */}
          <View style={styles.deliveryCard}>
            <Text style={styles.cardHeader}>Fulfillment Method</Text>

            <Pressable
              style={[
                styles.methodOption,
                deliveryMethod === 'courier' && styles.methodOptionActive,
              ]}
              onPress={() => setDeliveryMethod('courier')}>
              <View style={styles.methodLeft}>
                <Ionicons
                  name="bicycle-outline"
                  size={20}
                  color={deliveryMethod === 'courier' ? '#15803D' : '#64748B'}
                />
                <View>
                  <Text style={styles.methodTitle}>
                    Direct Farm Courier (Same-Day)
                  </Text>
                  <Text style={styles.methodSub}>
                    Direct delivery in Kaluthara • 1-2 hours
                  </Text>
                </View>
              </View>
              <Text style={styles.methodFee}>RS. 150</Text>
            </Pressable>

            <Pressable
              style={[
                styles.methodOption,
                deliveryMethod === 'pickup' && styles.methodOptionActive,
              ]}
              onPress={() => setDeliveryMethod('pickup')}>
              <View style={styles.methodLeft}>
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={deliveryMethod === 'pickup' ? '#15803D' : '#64748B'}
                />
                <View>
                  <Text style={styles.methodTitle}>Farmgate Stall Pickup</Text>
                  <Text style={styles.methodSub}>
                    Collect straight from farmer plot
                  </Text>
                </View>
              </View>
              <Text style={styles.methodFeeFree}>Free</Text>
            </Pressable>
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardHeader}>Order Summary</Text>

            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Produce Subtotal</Text>
              <Text style={styles.sumValue}>RS. {cartTotal}</Text>
            </View>

            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Fulfillment Fee</Text>
              <Text style={styles.sumValue}>
                {deliveryFee > 0 ? `RS. ${deliveryFee}` : 'Free'}
              </Text>
            </View>

            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Eco Packaging</Text>
              <Text style={styles.sumValueFree}>Included (Zero Waste)</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.sumRowTotal}>
              <Text style={styles.sumLabelTotal}>Total (LKR)</Text>
              <Text style={styles.sumValueTotal}>RS. {grandTotal}</Text>
            </View>

            <View style={styles.farmerCutBanner}>
              <Ionicons name="heart" size={14} color="#15803D" />
              <Text style={styles.farmerCutText}>
                RS. {Math.round(cartTotal * 0.88)} goes directly to regional growers.
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <Pressable
            style={styles.checkoutBtn}
            onPress={handleCheckout}
            accessibilityRole="button"
            accessibilityLabel="Proceed to Checkout">
            <Text style={styles.checkoutBtnText}>
              Proceed to Direct Checkout • RS. {grandTotal}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  clearText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  exploreBtn: {
    backgroundColor: '#15803D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  contentContainer: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemFarm: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  qtyCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 2,
  },
  qtyMiniBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 2,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardHeader: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  methodOptionActive: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  methodSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  methodFee: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  methodFeeFree: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  sumValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sumValueFree: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  sumRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabelTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sumValueTotal: {
    fontSize: 19,
    fontWeight: '900',
    color: '#15803D',
  },
  farmerCutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  farmerCutText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
