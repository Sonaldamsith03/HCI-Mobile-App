import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFarm } from '@/context/FarmContext';
import { ALL_CROPS, HERO_DEAL } from '@/data/farmData';
import { FarmToast } from '@/components/FloatingCartBar';

export default function MakeOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { submitOffer } = useFarm();

  const crop = ALL_CROPS.find((c) => c.id === id) || HERO_DEAL;

  const [quantity, setQuantity] = useState(5);
  const [offeredPrice, setOfferedPrice] = useState(Math.round(crop.price * 0.88));
  const [note, setNote] = useState('');

  const totalOffer = offeredPrice * quantity;
  const listTotal = crop.price * quantity;
  const savings = listTotal - totalOffer;

  const handleSubmit = () => {
    submitOffer({
      cropId: crop.id,
      cropTitle: crop.title,
      farmName: crop.farm,
      originalPrice: crop.price,
      offeredPrice: offeredPrice,
      quantity: quantity,
      unit: crop.unit,
    });
    router.replace('/profile');
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

        <Text style={styles.headerTitle}>Make a Direct Farm Offer</Text>

        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Crop Summary Card */}
        <View style={styles.cropCard}>
          <Image source={crop.image} style={styles.cropImage} contentFit="cover" />
          <View style={styles.cropInfo}>
            <Text style={styles.cropTitle}>{crop.title}</Text>
            <Text style={styles.farmText}>To {crop.farm} • Verified</Text>
            <Text style={styles.listPriceText}>
              Listed Price: RS. {crop.price} /{crop.unit}
            </Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.sectionBox}>
          <Text style={styles.boxTitle}>1. Choose Batch Quantity</Text>
          <Text style={styles.boxSub}>
            Small-scale farmers are more likely to accept offers for larger batch lots.
          </Text>

          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Ionicons name="remove" size={18} color="#0F172A" />
            </Pressable>
            <View style={styles.counterDisplay}>
              <Text style={styles.counterNum}>{quantity}</Text>
              <Text style={styles.counterUnit}>{crop.unit}s</Text>
            </View>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setQuantity((q) => q + 1)}>
              <Ionicons name="add" size={18} color="#0F172A" />
            </Pressable>
          </View>
        </View>

        {/* Price Proposal */}
        <View style={styles.sectionBox}>
          <Text style={styles.boxTitle}>2. Propose Your Unit Price</Text>
          <Text style={styles.boxSub}>
            Standard asking: RS. {crop.price} /{crop.unit}
          </Text>

          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setOfferedPrice((p) => Math.max(10, p - 5))}>
              <Ionicons name="remove" size={18} color="#0F172A" />
            </Pressable>
            <View style={styles.counterDisplay}>
              <Text style={styles.counterNum}>RS. {offeredPrice}</Text>
              <Text style={styles.counterUnit}>/{crop.unit}</Text>
            </View>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setOfferedPrice((p) => p + 5)}>
              <Ionicons name="add" size={18} color="#0F172A" />
            </Pressable>
          </View>

          {/* Fair Trade Meter */}
          <View style={styles.fairTradeBanner}>
            <Ionicons name="shield-checkmark" size={16} color="#15803D" />
            <Text style={styles.fairTradeText}>
              Fair Farmer Return: {crop.farm} still receives 84% direct profit margin.
            </Text>
          </View>
        </View>

        {/* Message Note */}
        <View style={styles.sectionBox}>
          <Text style={styles.boxTitle}>3. Note to Farmer (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Looking for weekly recurring supply for my family / kitchen..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.sumLabel}>Standard Lot Total:</Text>
            <Text style={styles.sumValStrikethrough}>RS. {listTotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.sumLabel}>Your Total Offer:</Text>
            <Text style={styles.sumValGreen}>RS. {totalOffer}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.sumLabel}>Estimated Buyer Savings:</Text>
            <Text style={styles.sumValOrange}>RS. {savings} saved</Text>
          </View>
        </View>

        <Pressable
          style={styles.submitBtn}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit Offer">
          <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Submit Direct Offer</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
  cropCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'center',
  },
  cropImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cropInfo: {
    flex: 1,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  farmText: {
    fontSize: 12,
    color: '#64748B',
    marginVertical: 2,
  },
  listPriceText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  boxTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  boxSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  counterDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  counterNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  counterUnit: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fairTradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 14,
  },
  fairTradeText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  sumValStrikethrough: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  sumValGreen: {
    fontSize: 17,
    fontWeight: '800',
    color: '#15803D',
  },
  sumValOrange: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803D',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
