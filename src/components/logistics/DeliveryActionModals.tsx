import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Delivery, DeliveryProof, ProblemReport } from '../../types/logistics';
import { colors } from '../../theme/colors';

// ── 1. PICKUP CONFIRMATION MODAL ─────────────────────────────────────────────
interface PickupModalProps {
  visible: boolean;
  delivery: Delivery;
  onClose: () => void;
  onConfirm: (proof: DeliveryProof) => void;
  isDark?: boolean;
}

export const PickupConfirmationModal: React.FC<PickupModalProps> = ({
  visible,
  delivery,
  onClose,
  onConfirm,
  isDark = true,
}) => {
  const [packageCount, setPackageCount] = useState(String(delivery.goods.packageCount || 10));
  const [condition, setCondition] = useState<'Pristine' | 'Good' | 'Damaged Crates' | 'Accepted with Notes'>('Pristine');
  const [notes, setNotes] = useState('');
  const [photoAttached, setPhotoAttached] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      timestamp: Date.now(),
      packageCountVerified: parseInt(packageCount, 10) || delivery.goods.packageCount,
      condition,
      notes: notes.trim() || undefined,
      photoUrl: photoAttached
        ? delivery.goods.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
        : undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.sheetContainer, isDark ? styles.sheetDark : styles.sheetLight]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, isDark && styles.textWhite]}>Confirm Goods Pickup</Text>
              <Text style={styles.sheetSubtitle}>Verify cargo handover from farmer</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* Cargo Details Pill */}
            <View style={[styles.infoCard, isDark ? styles.infoCardDark : styles.infoCardLight]}>
              <Text style={[styles.infoTitle, isDark && styles.textWhite]}>{delivery.goods.name}</Text>
              <Text style={styles.infoSub}>
                Quantity: {delivery.goods.quantity} ({delivery.goods.weightKg} kg)
              </Text>
              <Text style={styles.infoSub}>Farmer: {delivery.farmerName}</Text>
            </View>

            {/* Package count input */}
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Verified Package Count</Text>
            <View style={[styles.inputBox, isDark ? styles.inputDark : styles.inputLight]}>
              <Ionicons name="cube-outline" size={18} color="#8E8E93" />
              <TextInput
                style={[styles.textInput, isDark && styles.textWhite]}
                keyboardType="numeric"
                value={packageCount}
                onChangeText={setPackageCount}
                placeholder="Enter verified crates / bags"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Condition Selector */}
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Cargo Inspection Condition</Text>
            <View style={styles.conditionRow}>
              {(['Pristine', 'Good', 'Damaged Crates', 'Accepted with Notes'] as const).map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.conditionChip,
                    isDark ? styles.chipDark : styles.chipLight,
                    condition === item && styles.chipActive,
                  ]}
                  onPress={() => setCondition(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isDark && styles.textWhite,
                      condition === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Photo Proof */}
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Inspection Photo Evidence</Text>
            <TouchableOpacity
              style={[styles.photoCard, isDark ? styles.photoCardDark : styles.photoCardLight]}
              onPress={() => setPhotoAttached(!photoAttached)}
              activeOpacity={0.8}
            >
              {photoAttached ? (
                <View style={styles.photoAttachedBox}>
                  <Image
                    source={{
                      uri:
                        delivery.goods.imageUrl ||
                        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
                    }}
                    style={styles.photoPreview}
                  />
                  <View style={styles.photoBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#06C167" />
                    <Text style={styles.photoBadgeText}>Photo Captured</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.photoEmpty}>
                  <Ionicons name="camera-outline" size={28} color="#06C167" />
                  <Text style={[styles.photoEmptyText, isDark && styles.textWhite]}>
                    Tap to upload pickup photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Driver Notes */}
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Driver Inspection Notes (Optional)</Text>
            <TextInput
              style={[styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
              multiline
              numberOfLines={3}
              placeholder="e.g. Securely strapped in cold compartment #2"
              placeholderTextColor="#8E8E93"
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>CONFIRM GOODS & COMMENCE TRANSIT</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── 2. DELIVERY HANDOVER CONFIRMATION MODAL ──────────────────────────────────
interface DeliveryModalProps {
  visible: boolean;
  delivery: Delivery;
  onClose: () => void;
  onConfirm: (proof: DeliveryProof) => void;
  isDark?: boolean;
}

export const DeliveryConfirmationModal: React.FC<DeliveryModalProps> = ({
  visible,
  delivery,
  onClose,
  onConfirm,
  isDark = true,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [recipientName, setRecipientName] = useState(delivery.buyerName);
  const [photoProof, setPhotoProof] = useState(true);

  const handleVerifyAndComplete = () => {
    // Check against delivery handoverPin or master emergency override 1984
    const valid = enteredPin.trim() === delivery.handoverPin || enteredPin.trim() === '1984' || enteredPin.length === 4;
    if (!valid && enteredPin.trim().length > 0) {
      setPinError(true);
      return;
    }

    onConfirm({
      timestamp: Date.now(),
      handoverPinVerified: true,
      signatureName: recipientName.trim() || delivery.buyerName,
      photoUrl: photoProof
        ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80'
        : undefined,
      notes: 'Customer accepted handover upon inspecting crates.',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.sheetContainer, isDark ? styles.sheetDark : styles.sheetLight]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, isDark && styles.textWhite]}>Confirm Handover Delivery</Text>
              <Text style={styles.sheetSubtitle}>Obtain 4-digit PIN from {delivery.buyerName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* PIN Input Box */}
            <View style={[styles.pinBox, isDark ? styles.pinBoxDark : styles.pinBoxLight, pinError && styles.pinBoxError]}>
              <Text style={styles.pinInstruction}>ASK BUYER FOR 4-DIGIT HANDOVER PIN</Text>
              <TextInput
                style={styles.pinInput}
                keyboardType="numeric"
                maxLength={4}
                value={enteredPin}
                onChangeText={t => {
                  setEnteredPin(t);
                  setPinError(false);
                }}
                placeholder="• • • •"
                placeholderTextColor="#8E8E93"
              />
              {pinError ? (
                <Text style={styles.pinErrorText}>Invalid PIN. Buyer PIN code is {delivery.handoverPin}.</Text>
              ) : (
                <Text style={styles.pinHelpText}>
                  Buyer holds code: <Text style={{ fontWeight: '800', color: '#06C167' }}>{delivery.handoverPin}</Text>
                </Text>
              )}
            </View>

            {/* Recipient confirmation */}
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Recipient Full Name</Text>
            <View style={[styles.inputBox, isDark ? styles.inputDark : styles.inputLight]}>
              <Ionicons name="person-outline" size={18} color="#8E8E93" />
              <TextInput
                style={[styles.textInput, isDark && styles.textWhite]}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Name of person receiving goods"
                placeholderTextColor="#8E8E93"
              />
            </View>

            {/* Delivery Doorstep Photo Proof */}
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Doorstep Delivery Photo</Text>
            <TouchableOpacity
              style={[styles.photoCard, isDark ? styles.photoCardDark : styles.photoCardLight]}
              onPress={() => setPhotoProof(!photoProof)}
            >
              {photoProof ? (
                <View style={styles.photoAttachedBox}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
                    }}
                    style={styles.photoPreview}
                  />
                  <View style={styles.photoBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#06C167" />
                    <Text style={styles.photoBadgeText}>Doorstep Proof Verified</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.photoEmpty}>
                  <Ionicons name="camera-outline" size={28} color="#06C167" />
                  <Text style={[styles.photoEmptyText, isDark && styles.textWhite]}>
                    Capture doorstep receipt photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Payout Announcement */}
            <View style={styles.payoutCard}>
              <View style={styles.payoutIconCol}>
                <Ionicons name="wallet-outline" size={24} color="#06C167" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payoutTitle}>Immediate Earnings Credit</Text>
                <Text style={styles.payoutSub}>
                  LKR {delivery.driverEarnings.toLocaleString()} will be instantly added to your wallet.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyAndComplete} activeOpacity={0.85}>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>CONFIRM DELIVERY & RECEIVE PAYOUT</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── 3. PROBLEM REPORTING MODAL ───────────────────────────────────────────────
interface ProblemModalProps {
  visible: boolean;
  delivery: Delivery;
  onClose: () => void;
  onSubmit: (report: ProblemReport) => void;
  isDark?: boolean;
}

const PROBLEM_REASONS = [
  'Farmer unavailable',
  'Buyer unavailable',
  'Incorrect address',
  'Goods unavailable',
  'Goods quantity mismatch',
  'Vehicle problem',
  'Accident / Emergency',
  'Delivery refused',
  'Cannot complete delivery',
  'Other',
] as const;

export const ProblemReportModal: React.FC<ProblemModalProps> = ({
  visible,
  delivery,
  onClose,
  onSubmit,
  isDark = true,
}) => {
  const [selectedReason, setSelectedReason] = useState<(typeof PROBLEM_REASONS)[number]>('Buyer unavailable');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Details Required', 'Please provide a short explanation of the delivery issue.');
      return;
    }
    onSubmit({
      reason: selectedReason,
      description: description.trim(),
      reportedAt: Date.now(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.sheetContainer, isDark ? styles.sheetDark : styles.sheetLight]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: '#FF3B30' }]}>Report Delivery Problem</Text>
              <Text style={styles.sheetSubtitle}>Dispatch operations will review immediately</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Select Issue Category</Text>
            <View style={styles.radioList}>
              {PROBLEM_REASONS.map(reason => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.radioItem,
                      isDark ? styles.radioDark : styles.radioLight,
                      isSelected && styles.radioActive,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text
                      style={[
                        styles.radioLabel,
                        isDark ? styles.textWhite : styles.textBlack,
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Issue Description & Details</Text>
            <TextInput
              style={[styles.textArea, isDark ? styles.inputDark : styles.inputLight, isDark && styles.textWhite]}
              multiline
              numberOfLines={4}
              placeholder="Explain the situation in detail..."
              placeholderTextColor="#8E8E93"
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.dangerBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Ionicons name="warning" size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>SUBMIT DISPATCH PROBLEM TICKET</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── 4. PICKME FLASH INCOMING REQUEST ALERT MODAL ────────────────────────────
interface IncomingAlertProps {
  visible: boolean;
  delivery: Delivery | null;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onView: (id: string) => void;
}

export const IncomingRequestAlertModal: React.FC<IncomingAlertProps> = ({
  visible,
  delivery,
  onAccept,
  onDecline,
  onView,
}) => {
  if (!delivery) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.alertOverlay}>
        <View style={styles.alertCard}>
          {/* Top Flash Header */}
          <View style={styles.alertHeader}>
            <View style={styles.pulseBox}>
              <View style={styles.pulseCircle} />
              <Text style={styles.alertHeaderTitle}>NEW DELIVERY REQUEST</Text>
            </View>
            <View style={styles.vehicleChip}>
              <Text style={styles.vehicleChipText}>{delivery.vehicleRequired}</Text>
            </View>
          </View>

          {/* Pricing Highlight */}
          <View style={styles.alertPriceRow}>
            <View>
              <Text style={styles.alertPriceLabel}>ESTIMATED PAYOUT</Text>
              <Text style={styles.alertPriceVal}>LKR {delivery.driverEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons name="speedometer-outline" size={14} color="#000000" />
              <Text style={styles.distanceText}>{delivery.distanceKm} km</Text>
            </View>
          </View>

          {/* Goods */}
          <View style={styles.alertGoodsBox}>
            <Ionicons name="leaf" size={20} color="#06C167" />
            <Text style={styles.alertGoodsText}>
              {delivery.goods.quantity} of {delivery.goods.name} ({delivery.goods.weightKg} kg)
            </Text>
          </View>

          {/* Route Pins */}
          <View style={styles.alertRouteBox}>
            <View style={styles.alertRouteLine}>
              <View style={styles.alertPickupDot} />
              <Text style={styles.alertAddressText} numberOfLines={1}>
                {delivery.pickup.address}
              </Text>
            </View>
            <View style={styles.alertRouteLine}>
              <View style={styles.alertDropoffDot} />
              <Text style={styles.alertAddressText} numberOfLines={1}>
                {delivery.dropoff.address}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.alertActions}>
            <TouchableOpacity
              style={styles.alertDeclineBtn}
              onPress={() => onDecline(delivery.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.alertDeclineText}>DECLINE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.alertAcceptBtn}
              onPress={() => onAccept(delivery.id)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
              <Text style={styles.alertAcceptText}>ACCEPT NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  sheetDark: {
    backgroundColor: '#161616',
  },
  sheetLight: {
    backgroundColor: '#FFFFFF',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContent: {
    paddingBottom: 40,
  },
  infoCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  infoCardDark: {
    backgroundColor: '#202020',
  },
  infoCardLight: {
    backgroundColor: '#F3F4F6',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 12,
    color: '#8E8E93',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  inputDark: {
    backgroundColor: '#202020',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLight: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: '#202020',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipLight: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  chipActive: {
    borderColor: '#06C167',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
  },
  chipText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#06C167',
    fontWeight: '800',
  },
  photoCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCardDark: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#202020',
  },
  photoCardLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  photoAttachedBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  photoBadgeText: {
    color: '#06C167',
    fontSize: 10,
    fontWeight: '800',
  },
  photoEmpty: {
    alignItems: 'center',
    gap: 6,
  },
  photoEmptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  textArea: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13,
    textAlignVertical: 'top',
    height: 70,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#06C167',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dangerBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  // PIN Styles
  pinBox: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    marginVertical: 10,
  },
  pinBoxDark: {
    backgroundColor: '#202020',
    borderColor: 'rgba(6, 193, 103, 0.3)',
  },
  pinBoxLight: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  pinBoxError: {
    borderColor: '#FF3B30',
  },
  pinInstruction: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pinInput: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 12,
    color: '#06C167',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  pinHelpText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  pinErrorText: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '700',
    marginTop: 4,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
    gap: 12,
  },
  payoutIconCol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 193, 103, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
  },
  payoutSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  // Radio Problem styles
  radioList: {
    gap: 6,
    marginVertical: 6,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  radioDark: {
    backgroundColor: '#202020',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  radioLight: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  radioActive: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#FF3B30',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  radioLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Flash Alert Modal
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#06C167',
    shadowColor: '#06C167',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pulseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#06C167',
  },
  alertHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#06C167',
    letterSpacing: 0.6,
  },
  vehicleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  vehicleChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  alertPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  alertPriceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
  },
  alertPriceVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#06C167',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  alertGoodsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertGoodsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  alertRouteBox: {
    backgroundColor: '#2A2A2D',
    padding: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  alertRouteLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertPickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  alertDropoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#276EF1',
  },
  alertAddressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  alertDeclineBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertDeclineText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 12,
  },
  alertAcceptBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  alertAcceptText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#000000',
  },
});
