import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BuyerRequirement } from '@/context/FarmContext';

interface PostRequirementModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BuyerRequirement, 'id' | 'createdAt' | 'status' | 'bids'>) => void;
  initialData?: BuyerRequirement | null;
}

const PRODUCE_PRESETS = [
  { name: 'tomatoes', emoji: '🍅' },
  { name: 'carrots', emoji: '🥕' },
  { name: 'bell peppers', emoji: '🫑' },
  { name: 'gotu kola', emoji: '🥬' },
  { name: 'potatoes', emoji: '🥔' },
  { name: 'red onions', emoji: '🧅' },
  { name: 'sweet corn', emoji: '🌽' },
  { name: 'ripe mangoes', emoji: '🥭' },
];

const DATE_PRESETS = ['Friday', 'Tomorrow', 'In 3 days', 'This weekend', 'Monday'];

interface FormContentProps {
  onClose: () => void;
  onSubmit: (data: Omit<BuyerRequirement, 'id' | 'createdAt' | 'status' | 'bids'>) => void;
  initialData?: BuyerRequirement | null;
}

function PostRequirementFormContent({
  onClose,
  onSubmit,
  initialData,
}: FormContentProps) {
  const [buyerName, setBuyerName] = useState(initialData?.buyerName || 'A restaurant needs:');
  const [produce, setProduce] = useState(initialData?.produce || 'tomatoes');
  const [emoji, setEmoji] = useState(initialData?.emoji || '🍅');
  const [quantity, setQuantity] = useState(initialData?.quantity || '100 kg');
  const [requiredBy, setRequiredBy] = useState(initialData?.requiredBy || 'Friday');
  const [preferredPrice, setPreferredPrice] = useState(initialData?.preferredPrice || 'Rs. 400–450/kg');
  const [location, setLocation] = useState(initialData?.location || 'Colombo');
  const [organicPreferred, setOrganicPreferred] = useState(initialData?.organicPreferred ?? true);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = () => {
    if (!produce.trim() || !quantity.trim()) return;

    onSubmit({
      buyerName: buyerName.trim() || 'A restaurant needs:',
      buyerType: 'Restaurant Buyer',
      produce: produce.trim(),
      emoji,
      quantity: quantity.trim(),
      requiredBy: requiredBy.trim() || 'Friday',
      preferredPrice: preferredPrice.trim() || 'Negotiable',
      location: location.trim() || 'Colombo',
      organicPreferred,
      notes: notes.trim(),
    });
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <View style={styles.sheetContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Produce Requirement' : 'Post Produce Requirement'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Smallholders will see your post and propose harvest fulfillment
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#64748B" />
        </Pressable>
      </View>

      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        {/* Requester Headline */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>POST HEADING / BUYER TYPE</Text>
          <TextInput
            style={styles.input}
            value={buyerName}
            onChangeText={setBuyerName}
            placeholder="e.g. A restaurant needs:"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.chipRow}>
            {['A restaurant needs:', 'The Ocean Grill needs:', 'Organic Cafe needs:'].map(
              (h) => (
                <Pressable
                  key={h}
                  style={[styles.smallChip, buyerName === h && styles.smallChipActive]}
                  onPress={() => setBuyerName(h)}>
                  <Text
                    style={[
                      styles.smallChipText,
                      buyerName === h && styles.smallChipTextActive,
                    ]}>
                    {h}
                  </Text>
                </Pressable>
              )
            )}
          </View>
        </View>

        {/* Produce & Emoji */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>WHAT PRODUCE DO YOU NEED?</Text>
          <View style={styles.produceRow}>
            <View style={styles.emojiDisplay}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={produce}
              onChangeText={setProduce}
              placeholder="Produce name (e.g. tomatoes)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Produce Preset Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {PRODUCE_PRESETS.map((p) => (
              <Pressable
                key={p.name}
                style={[
                  styles.presetChip,
                  produce.toLowerCase() === p.name && styles.presetChipActive,
                ]}
                onPress={() => {
                  setProduce(p.name);
                  setEmoji(p.emoji);
                }}>
                <Text style={styles.presetEmoji}>{p.emoji}</Text>
                <Text
                  style={[
                    styles.presetName,
                    produce.toLowerCase() === p.name && styles.presetNameActive,
                  ]}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Quantity */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>REQUIRED QUANTITY</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 100 kg"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.chipRow}>
            {['50 kg', '100 kg', '200 kg', '500 kg', '15 crates'].map((q) => (
              <Pressable
                key={q}
                style={[styles.smallChip, quantity === q && styles.smallChipActive]}
                onPress={() => setQuantity(q)}>
                <Text
                  style={[
                    styles.smallChipText,
                    quantity === q && styles.smallChipTextActive,
                  ]}>
                  {q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Required By */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>REQUIRED BY (DEADLINE)</Text>
          <TextInput
            style={styles.input}
            value={requiredBy}
            onChangeText={setRequiredBy}
            placeholder="e.g. Friday"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.chipRow}>
            {DATE_PRESETS.map((d) => (
              <Pressable
                key={d}
                style={[styles.smallChip, requiredBy === d && styles.smallChipActive]}
                onPress={() => setRequiredBy(d)}>
                <Text
                  style={[
                    styles.smallChipText,
                    requiredBy === d && styles.smallChipTextActive,
                  ]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Preferred Price */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PREFERRED PRICE RANGE</Text>
          <TextInput
            style={styles.input}
            value={preferredPrice}
            onChangeText={setPreferredPrice}
            placeholder="e.g. Rs. 400–450/kg"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Location */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>DELIVERY LOCATION</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Colombo"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.chipRow}>
            {['Colombo', 'Kaluthara', 'Galle', 'Kandy'].map((loc) => (
              <Pressable
                key={loc}
                style={[styles.smallChip, location === loc && styles.smallChipActive]}
                onPress={() => setLocation(loc)}>
                <Text
                  style={[
                    styles.smallChipText,
                    location === loc && styles.smallChipTextActive,
                  ]}>
                  {loc}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Organic Preferred Switch */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Organic Preferred: {organicPreferred ? 'Yes' : 'No'}</Text>
            <Text style={styles.toggleSub}>Specify if residue-free or certified organic is requested</Text>
          </View>
          <Switch
            value={organicPreferred}
            onValueChange={setOrganicPreferred}
            trackColor={{ false: '#E2E8F0', true: '#15803D' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Notes / Special Instructions */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ADDITIONAL SPECIFICATIONS (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Firm texture for salads, dawn harvest requested..."
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footerRow}>
        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name={isEditing ? 'checkmark' : 'paper-plane-outline'} size={18} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>
            {isEditing ? 'Save Changes' : 'Post Requirement'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PostRequirementModal({
  visible,
  onClose,
  onSubmit,
  initialData,
}: PostRequirementModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <PostRequirementFormContent
          key={initialData ? initialData.id : 'new-requirement'}
          onClose={onClose}
          onSubmit={onSubmit}
          initialData={initialData}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  formScroll: {
    marginTop: 12,
    maxHeight: 460,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  produceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emojiDisplay: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emojiText: {
    fontSize: 24,
  },
  presetScroll: {
    marginTop: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  presetChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#15803D',
  },
  presetEmoji: {
    fontSize: 14,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  presetNameActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  smallChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  smallChipText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  smallChipTextActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#15803D',
  },
  toggleSub: {
    fontSize: 11.5,
    color: '#166534',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#15803D',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
