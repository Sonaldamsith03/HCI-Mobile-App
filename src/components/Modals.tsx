import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Produce, ProduceCategory, OrderStatus, Transaction } from '../types';
import { ForestPrimaryButton, HarvestAccentButton } from './Buttons';
import { AgriCard } from './AgriCard';
import { STOCK_IMAGE_PRESETS, DEFAULT_CATEGORY_IMAGES } from '../data/seedData';

// ----------------------------------------------------------------------------
// 1. BOOKING / CHECKOUT MODAL (iOS Bottom Sheet)
// ----------------------------------------------------------------------------
interface BookingModalProps {
  visible: boolean;
  produce: Produce | null;
  onClose: () => void;
  onConfirm: (
    produce: Produce,
    quantity: number,
    deliveryMethod: string,
    deliveryAddress: string,
    paymentMethod: string
  ) => void;
}

export const BookingCheckoutModal: React.FC<BookingModalProps> = ({
  visible,
  produce,
  onClose,
  onConfirm,
}) => {
  if (!produce) return null;

  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'Direct Farm Delivery' | 'Regional Agri-Hub'>('Direct Farm Delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('Central Delivery Hub #4B');
  const deliveryFee = deliveryMethod === 'Direct Farm Delivery' ? 3.0 : 1.5;
  const subtotal = quantity * produce.price;
  const total = subtotal + deliveryFee;

  const handleBook = () => {
    onConfirm(produce, quantity, deliveryMethod, deliveryAddress, 'AgriPay Escrow');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* iOS Grabber Pill */}
          <View style={styles.grabber} />

          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image
                source={{ uri: produce.imageUrl || DEFAULT_CATEGORY_IMAGES[produce.category] || DEFAULT_CATEGORY_IMAGES.Vegetables }}
                style={styles.modalCropThumb}
                resizeMode="cover"
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.modalTitle}>Book with AgriPay Escrow</Text>
                <Text style={styles.modalSubtitle}>{produce.name} • ${produce.price.toFixed(2)} / {produce.unit}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.earthTextSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Quantity Stepper */}
            <Text style={styles.sectionLabel}>Order Quantity ({produce.unit})</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.stepperBtn}
              >
                <Ionicons name="remove" size={20} color={colors.forestGreenPrimary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>
                {quantity} {produce.unit}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.stepperBtn}
              >
                <Ionicons name="add" size={20} color={colors.forestGreenPrimary} />
              </TouchableOpacity>
            </View>

            {/* Delivery Method Selection */}
            <Text style={styles.sectionLabel}>Fulfillment Options</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDeliveryMethod('Direct Farm Delivery')}
              style={[
                styles.optionRow,
                deliveryMethod === 'Direct Farm Delivery' && styles.optionRowActive,
              ]}
            >
              <Ionicons
                name="bicycle-outline"
                size={22}
                color={deliveryMethod === 'Direct Farm Delivery' ? colors.forestGreenPrimary : colors.earthTextMuted}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.optionTitle}>Direct Farm Delivery</Text>
                <Text style={styles.optionDesc}>From farm gate right to your door</Text>
              </View>
              <Text style={styles.optionPrice}>+$3.00</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDeliveryMethod('Regional Agri-Hub')}
              style={[
                styles.optionRow,
                deliveryMethod === 'Regional Agri-Hub' && styles.optionRowActive,
              ]}
            >
              <Ionicons
                name="business-outline"
                size={22}
                color={deliveryMethod === 'Regional Agri-Hub' ? colors.forestGreenPrimary : colors.earthTextMuted}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.optionTitle}>Regional Agri-Hub Pickup</Text>
                <Text style={styles.optionDesc}>Consolidated depot pickup point</Text>
              </View>
              <Text style={styles.optionPrice}>+$1.50</Text>
            </TouchableOpacity>

            {/* Destination Address */}
            <Text style={styles.sectionLabel}>Delivery Destination</Text>
            <TextInput
              style={styles.input}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter delivery hub or address"
            />

            {/* Summary Card */}
            <AgriCard variant="mint" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Produce ({quantity} × ${produce.price.toFixed(2)}):
                </Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Service Fee:</Text>
                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.totalLabel}>Total with Escrow:</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.escrowNotice}>
                <Ionicons name="shield-checkmark" size={15} color={colors.forestGreenPrimary} />
                <Text style={styles.escrowNoticeText}>
                  Funds held safely in escrow until you inspect & accept harvest.
                </Text>
              </View>
            </AgriCard>
          </ScrollView>

          <View style={styles.modalFooter}>
            <HarvestAccentButton
              title={`Confirm Order • $${total.toFixed(2)}`}
              icon={<Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />}
              onPress={handleBook}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// 2. CROP FORM MODAL (iOS Bottom Sheet)
// ----------------------------------------------------------------------------
interface CropModalProps {
  visible: boolean;
  produceToEdit?: Produce | null;
  onClose: () => void;
  onSave: (data: Omit<Produce, 'id'>) => void;
}

export const CropFormModal: React.FC<CropModalProps> = ({
  visible,
  produceToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(produceToEdit?.name || '');
  const [price, setPrice] = useState(produceToEdit?.price?.toString() || '');
  const [unit, setUnit] = useState(produceToEdit?.unit || 'kg');
  const [quantity, setQuantity] = useState(produceToEdit?.quantity || '100 kg');
  const [category, setCategory] = useState<ProduceCategory>(produceToEdit?.category || 'Vegetables');
  const [location, setLocation] = useState(produceToEdit?.location || 'Green Valley, Block 4');
  const [isOrganic, setIsOrganic] = useState(produceToEdit?.isOrganic ?? true);
  const [description, setDescription] = useState(produceToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(produceToEdit?.imageUrl || STOCK_IMAGE_PRESETS[0].url);

  const categories: ProduceCategory[] = ['Vegetables', 'Fruits', 'Grains', 'Tubers', 'Honey & Dairy'];

  const handleSubmit = () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Missing Fields', 'Please specify crop name and price per unit.');
      return;
    }
    const numPrice = parseFloat(price) || 1.0;
    onSave({
      name: name.trim(),
      price: numPrice,
      unit: unit.trim(),
      quantity: quantity.trim(),
      category,
      location: location.trim(),
      farmerName: 'Mateo Gutierrez',
      farmerPhone: '+1 (555) 234-7890',
      harvestDate: 'Harvested today',
      imageUrl: imageUrl.trim() || DEFAULT_CATEGORY_IMAGES[category],
      middlemanPrice: parseFloat((numPrice * 1.55).toFixed(2)),
      description: description.trim() || `Freshly harvested ${name} grown locally with care.`,
      isOrganic,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.grabber} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {produceToEdit ? 'Edit Crop Listing' : 'List Fresh Harvest'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.earthTextSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Harvest Stock Photo Presets */}
            <Text style={styles.sectionLabel}>Select Stock Photo Preset</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {STOCK_IMAGE_PRESETS.map((preset, idx) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setImageUrl(preset.url);
                      setCategory(preset.category);
                    }}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}
                  >
                    <Image source={{ uri: preset.url }} style={styles.presetThumb} resizeMode="cover" />
                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Live Crop Photo Preview Box */}
            <View style={styles.photoPreviewCard}>
              <Image source={{ uri: imageUrl }} style={styles.photoPreviewImg} resizeMode="cover" />
              <View style={styles.photoPreviewBadge}>
                <Ionicons name="eye-outline" size={12} color="#FFFFFF" />
                <Text style={styles.photoPreviewBadgeText}>Preview</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Produce Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Organic Roma Tomatoes"
            />

            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catPill,
                    category === cat && styles.catPillActive,
                  ]}
                >
                  <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.sectionLabel}>Direct Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="2.50"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.sectionLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="kg, ear, jar"
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>Available Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g. 150 kg"
            />

            <Text style={styles.sectionLabel}>Farm Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Block 4, Green Valley"
            />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.optionTitle}>100% Certified Organic</Text>
                <Text style={styles.optionDesc}>Zero synthetic fertilizers or sprays</Text>
              </View>
              <Switch
                value={isOrganic}
                onValueChange={setIsOrganic}
                trackColor={{ true: colors.forestGreenPrimary, false: '#E5E5EA' }}
              />
            </View>

            <Text style={styles.sectionLabel}>Harvest Description</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe freshness, soil practices, and taste..."
              multiline
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <ForestPrimaryButton
              title={produceToEdit ? 'Save Changes' : 'Publish Harvest Listing'}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// 3. STAFF / ADMIN PIN MODAL (iOS Alert Style)
// ----------------------------------------------------------------------------
export const StaffPinModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ visible, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = () => {
    if (pin.trim() === '1984') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 20 }]}>
        <View style={[styles.modalContainer, { maxWidth: 360, borderRadius: 28, padding: 24 }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed" size={20} color={colors.forestGreenPrimary} />
              <Text style={[styles.modalTitle, { marginLeft: 8 }]}>Staff Security PIN</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.earthTextMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.pinHint}>
            Platform staff and admin oversight only. Enter your 4-digit code (Default: 1984).
          </Text>

          <TextInput
            style={[styles.pinInput, error && styles.pinInputError]}
            value={pin}
            onChangeText={(text) => {
              setPin(text);
              setError(false);
            }}
            placeholder="••••"
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
          />

          {error && <Text style={styles.errorText}>Incorrect PIN. Try 1984.</Text>}

          <ForestPrimaryButton title="Unlock Staff Portal" onPress={handleVerify} style={{ marginTop: 16 }} />
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// 4. UPDATE ORDER STATUS MODAL
// ----------------------------------------------------------------------------
export const UpdateOrderStatusModal: React.FC<{
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onUpdate: (id: number, status: OrderStatus) => void;
}> = ({ visible, transaction, onClose, onUpdate }) => {
  if (!transaction) return null;

  const statuses: OrderStatus[] = ['Confirmed', 'Packed at Farm', 'In Transit', 'Delivered'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.grabber} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <Text style={styles.modalSubtitle}>{transaction.produceName} • {transaction.trackingCode}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.earthTextSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingVertical: 12 }}>
            {statuses.map(st => (
              <TouchableOpacity
                key={st}
                activeOpacity={0.7}
                onPress={() => {
                  onUpdate(transaction.id, st);
                  onClose();
                }}
                style={[
                  styles.statusOption,
                  transaction.status === st && styles.statusOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    transaction.status === st && styles.statusOptionTextActive,
                  ]}
                >
                  {st}
                </Text>
                {transaction.status === st && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.forestGreenPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// 5. CONTACT FARMER MODAL WITH SMART INQUIRY CHIPS
// ----------------------------------------------------------------------------
export const ContactFarmerModal: React.FC<{
  visible: boolean;
  produce: Produce | null;
  onClose: () => void;
  onSend: (message: string) => void;
}> = ({ visible, produce, onClose, onSend }) => {
  if (!produce) return null;
  const [text, setText] = useState('');

  const quickChips = [
    'Harvested today?',
    'Can you pack in wooden crates?',
    'Is bulk wholesale available?',
    'Can I schedule pickup for 3 PM?',
  ];

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.grabber} />

          <View style={styles.modalHeader}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.modalTitle}>Contact {produce.farmerName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#06C167" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#06C167' }} />
                <Text style={styles.modalSubtitle}>Online • Typically replies in 5m</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.earthTextSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Inquiry Chips */}
          <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Quick Inquiries</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {quickChips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setText(chip)}
                style={{
                  backgroundColor: 'rgba(6, 193, 103, 0.08)',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(6, 193, 103, 0.2)',
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11.5, color: '#047840', fontWeight: '600' }}>
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            value={text}
            onChangeText={setText}
            placeholder={`Ask ${produce.farmerName} about ${produce.name}...`}
            multiline
          />

          <View style={styles.modalFooter}>
            <ForestPrimaryButton
              title="Send Direct Message"
              icon={<Ionicons name="send" size={16} color="#FFFFFF" />}
              onPress={handleSend}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// 6. WALLET TOP-UP MODAL (AgriPay)
// ----------------------------------------------------------------------------
export const WalletTopUpModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
  currentBalance: number;
}> = ({ visible, onClose, onTopUp, currentBalance }) => {
  const [selectedAmount, setSelectedAmount] = useState(50);

  const handleConfirm = () => {
    onTopUp(selectedAmount);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.grabber} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>AgriPay Vault Top-Up</Text>
              <Text style={styles.modalSubtitle}>Current Escrow Balance: ${currentBalance.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.earthTextSecondary} />
            </TouchableOpacity>
          </View>

          <AgriCard variant="mint" style={{ marginVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark" size={18} color="#06C167" />
              <Text style={{ fontSize: 12, color: '#047840', fontWeight: '700', flex: 1 }}>
                Funds are held in institutional multi-sig escrow and only released after your PIN inspection.
              </Text>
            </View>
          </AgriCard>

          <Text style={styles.sectionLabel}>Select Top-Up Amount</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[25, 50, 100, 250].map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => setSelectedAmount(amt)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  backgroundColor: selectedAmount === amt ? '#000000' : '#F3F4F6',
                  borderWidth: 1.5,
                  borderColor: selectedAmount === amt ? '#000000' : 'rgba(0,0,0,0.06)',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: selectedAmount === amt ? '#FFFFFF' : '#000000' }}>
                  ${amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
            <Ionicons name="card-outline" size={20} color="#000000" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#000000', flex: 1 }}>
              Apple Pay / Instant Bank Transfer
            </Text>
            <Ionicons name="checkmark-circle" size={18} color="#06C167" />
          </View>

          <View style={styles.modalFooter}>
            <ForestPrimaryButton
              title={`Confirm Top-Up +$${selectedAmount}.00`}
              onPress={handleConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// 7. DIGITAL FAIR-TRADE RECEIPT MODAL
// ----------------------------------------------------------------------------
export const FairTradeReceiptModal: React.FC<{
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}> = ({ visible, transaction, onClose }) => {
  if (!transaction) return null;

  const growerShare = (transaction.amount * 0.88).toFixed(2);
  const coldChainTransport = (transaction.amount * 0.09).toFixed(2);
  const platformEscrowFee = (transaction.amount * 0.03).toFixed(2);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.grabber} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Fair-Trade Digital Receipt</Text>
              <Text style={styles.modalSubtitle}>Order {transaction.trackingCode}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.earthTextSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#000000' }}>{transaction.produceName}</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#000000' }}>${transaction.amount.toFixed(2)}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Volume: {transaction.quantityOrdered}</Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Grower: {transaction.farmerName}</Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Status: {transaction.status}</Text>
            </View>

            <Text style={styles.sectionLabel}>Direct Farm Gate Breakdown</Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#4B5563' }}>Direct Farm-Gate Payment (88%)</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#000000' }}>${growerShare}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#4B5563' }}>Refrigerated Cold-Chain Transport (9%)</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#000000' }}>${coldChainTransport}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: '#4B5563' }}>AgriPay Escrow Vault Fee (3%)</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#000000' }}>${platformEscrowFee}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#000000' }}>Total Paid via Escrow</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#06C167' }}>${transaction.amount.toFixed(2)}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color="#06C167" />
              <Text style={{ fontSize: 11.5, color: '#047840', fontWeight: '600' }}>
                Zero middleman brokerage. Verified transparent receipt.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <ForestPrimaryButton
              title="Close Receipt"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // iOS Backdrop
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderTopLeftRadius: 32, // Apple bottom sheet squircle
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '88%',
    backdropFilter: 'blur(30px)' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D1D6', // Apple iOS Bottom Sheet Handle
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCropThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  presetChip: {
    alignItems: 'center',
    marginRight: 10,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
  },
  presetChipActive: {
    borderColor: colors.forestGreenPrimary,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
  },
  presetThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  presetText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.earthTextSecondary,
    marginTop: 4,
    maxWidth: 60,
    textAlign: 'center',
  },
  presetTextActive: {
    color: colors.forestGreenPrimary,
    fontWeight: '700',
  },
  photoPreviewCard: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
  },
  photoPreviewImg: {
    width: '100%',
    height: '100%',
  },
  photoPreviewBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoPreviewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.earthTextPrimary,
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.earthTextSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalScroll: {
    maxHeight: 440,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.earthTextSecondary,
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: -0.2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    padding: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  stepperValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.earthTextPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  optionRowActive: {
    borderColor: colors.forestGreenPrimary,
    backgroundColor: colors.mintContainer,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.earthTextPrimary,
    letterSpacing: -0.2,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.earthTextMuted,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forestGreenPrimary,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.earthTextPrimary,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  summaryCard: {
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.earthTextSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.earthTextPrimary,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.canvasBorder,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.earthTextPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreenPrimary,
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  escrowNoticeText: {
    fontSize: 12,
    color: colors.forestGreenMedium,
    fontWeight: '600',
    flex: 1,
  },
  modalFooter: {
    marginTop: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F3F3',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  catPillActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  pinHint: {
    fontSize: 14,
    color: '#5E5E5E',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    height: 54,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  pinInputError: {
    borderColor: colors.harvestTerracotta,
    borderWidth: 1.5,
  },
  errorText: {
    color: colors.harvestTerracotta,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statusOptionActive: {
    backgroundColor: '#E6F7EF',
    borderColor: '#06C167',
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  statusOptionTextActive: {
    color: '#047840',
    fontWeight: '700',
  },
  directNotice: {
    fontSize: 13,
    color: '#5E5E5E',
    lineHeight: 18,
  },
} as any);
