import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Produce, Message, PriceOffer, RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';

interface LiveChatNegotiationModalProps {
  visible: boolean;
  produce: Produce | null;
  onClose: () => void;
}

export const LiveChatNegotiationModal: React.FC<LiveChatNegotiationModalProps> = ({
  visible,
  produce,
  onClose,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { messages, sendMessage, sendOffer, respondToOffer, themeMode, showToast, addToCart, userProfile } = useApp();
  const isDark = themeMode === 'dark';

  const [inputMessage, setInputMessage] = useState('');
  const [showOfferDrawer, setShowOfferDrawer] = useState(false);

  // Offer form state
  const [proposedPrice, setProposedPrice] = useState<number>(produce?.price ? Number((produce.price * 0.85).toFixed(2)) : 2.0);
  const [proposedQuantity, setProposedQuantity] = useState<number>(5);
  const [offerNote, setOfferNote] = useState('');
  const [counterInput, setCounterInput] = useState<{ [msgId: number]: string }>({});

  if (!produce) return null;

  // Filter messages for this specific grower & crop
  const conversation = messages.filter(
    m =>
      m.farmerName.toLowerCase() === produce.farmerName.toLowerCase() ||
      (m.produceName && m.produceName.toLowerCase() === produce.name.toLowerCase())
  );

  const quickInquiryChips = [
    'Harvested this morning?',
    'Can you pack in wooden crates?',
    'What is the bulk price for 50kg+?',
    'Direct pickup today available?',
  ];

  const handleSendTextMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage(produce.farmerName, produce.name, inputMessage.trim(), 'Buyer', produce.id);
    setInputMessage('');
  };

  const handleSubmitOffer = async () => {
    if (proposedPrice <= 0 || proposedQuantity <= 0) {
      showToast('Please enter a valid offer price and quantity', 'warn');
      return;
    }
    await sendOffer(produce, proposedPrice, proposedQuantity, offerNote);
    setShowOfferDrawer(false);
    setOfferNote('');
  };

  const discountPercent = Math.round(((produce.price - proposedPrice) / produce.price) * 100);
  const totalOfferVal = proposedPrice * proposedQuantity;
  const supermarketTotal = produce.middlemanPrice * proposedQuantity;
  const estimatedSavings = supermarketTotal - totalOfferVal;

  if (userProfile.isLoggedIn === false) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
          <View style={[styles.topHeader, isDark ? styles.borderDark : styles.borderLight]}>
            <TouchableOpacity onPress={onClose} style={[styles.backBtn, isDark && styles.backBtnDark]}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text style={[styles.growerTitle, isDark && styles.textWhite]}>Authentication Required</Text>
          </View>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(16, 185, 129, 0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="lock-closed" size={34} color="#059669" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827', textAlign: 'center', marginBottom: 8 }}>
              Sign In to Chat with {produce.farmerName}
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 24 }}>
              To ensure verified farm contracts and spam protection, please sign in or register before starting negotiations.
            </Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
                navigation.navigate('MainTabs', { tab: 'account' });
              }}
              style={{
                width: '100%',
                backgroundColor: '#059669',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Log In / Sign Up Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 13, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#000000' : '#FFFFFF'} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardWrap}
        >
          {/* Top Header: Grower Profile & Harvest Details */}
          <View style={[styles.topHeader, isDark ? styles.borderDark : styles.borderLight]}>
            <TouchableOpacity onPress={onClose} style={[styles.backBtn, isDark && styles.backBtnDark]}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>

            <Image
              source={{ uri: produce.imageUrl || DEFAULT_CATEGORY_IMAGES[produce.category] }}
              style={styles.cropThumb}
            />

            <View style={styles.headerInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={[styles.growerTitle, isDark && styles.textWhite]} numberOfLines={1}>
                  {produce.farmerName}
                </Text>
                <Ionicons name="checkmark-circle" size={15} color="#06C167" />
              </View>
              <Text style={styles.growerSub} numberOfLines={1}>
                {produce.name} • <Text style={{ color: '#06C167', fontWeight: '700' }}>${produce.price.toFixed(2)}/{produce.unit}</Text>
              </Text>
            </View>

            {/* Bargain Trigger Button */}
            <TouchableOpacity
              style={[styles.bargainHeaderBtn, showOfferDrawer && styles.bargainHeaderBtnActive]}
              onPress={() => setShowOfferDrawer(!showOfferDrawer)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="tag-outline" size={15} color="#000000" />
              <Text style={styles.bargainHeaderBtnText}>Offer</Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible Bargain Offer Drawer */}
          {showOfferDrawer && (
            <View style={[styles.offerDrawer, isDark ? styles.drawerDark : styles.drawerLight]}>
              <View style={styles.drawerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="scale-balance" size={18} color="#06C167" />
                  <Text style={[styles.drawerTitle, isDark && styles.textWhite]}>Make a Price Offer</Text>
                </View>
                <TouchableOpacity onPress={() => setShowOfferDrawer(false)}>
                  <Ionicons name="close" size={18} color={isDark ? '#9CA3AF' : '#71717A'} />
                </TouchableOpacity>
              </View>

              <Text style={styles.drawerSub}>
                Bargain directly with the grower. Accepted offers are locked into escrow.
              </Text>

              {/* Price & Quantity Steppers */}
              <View style={styles.stepperRow}>
                {/* Proposed Price per unit */}
                <View style={[styles.stepperBox, isDark && styles.boxDark]}>
                  <Text style={styles.stepperLabel}>YOUR OFFER / {produce.unit.toUpperCase()}</Text>
                  <View style={styles.stepperControls}>
                    <TouchableOpacity
                      onPress={() => setProposedPrice(Math.max(0.2, Number((proposedPrice - 0.1).toFixed(2))))}
                      style={styles.stepCircleBtn}
                    >
                      <Ionicons name="remove" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
                    </TouchableOpacity>
                    <Text style={[styles.stepValText, isDark && styles.textWhite]}>
                      ${proposedPrice.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setProposedPrice(Number((proposedPrice + 0.1).toFixed(2)))}
                      style={styles.stepCircleBtn}
                    >
                      <Ionicons name="add" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.discountTag}>
                    {discountPercent > 0 ? `${discountPercent}% Below List` : 'At List Price'}
                  </Text>
                </View>

                {/* Proposed Quantity */}
                <View style={[styles.stepperBox, isDark && styles.boxDark]}>
                  <Text style={styles.stepperLabel}>QUANTITY ({produce.unit.toUpperCase()})</Text>
                  <View style={styles.stepperControls}>
                    <TouchableOpacity
                      onPress={() => setProposedQuantity(Math.max(1, proposedQuantity - 1))}
                      style={styles.stepCircleBtn}
                    >
                      <Ionicons name="remove" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
                    </TouchableOpacity>
                    <Text style={[styles.stepValText, isDark && styles.textWhite]}>
                      {proposedQuantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setProposedQuantity(proposedQuantity + 1)}
                      style={styles.stepCircleBtn}
                    >
                      <Ionicons name="add" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.totalOfferTag}>
                    Total: ${totalOfferVal.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Price Transparency Bar */}
              <View style={[styles.savingsComparisonRow, isDark && { backgroundColor: '#262626' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.compLabel}>Supermarket Retail: <Text style={{ textDecorationLine: 'line-through' }}>${supermarketTotal.toFixed(2)}</Text></Text>
                  <Text style={styles.compSaving}>You save ~${estimatedSavings.toFixed(2)} with direct grower escrow</Text>
                </View>
              </View>

              {/* Optional Offer Note */}
              <TextInput
                style={[styles.offerNoteInput, isDark && styles.noteInputDark]}
                value={offerNote}
                onChangeText={setOfferNote}
                placeholder="Add a negotiation note (e.g. Can take entire lot today)..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#8E8E93'}
              />

              {/* Submit Offer Button */}
              <TouchableOpacity style={styles.submitOfferBtn} onPress={handleSubmitOffer} activeOpacity={0.85}>
                <Ionicons name="flash" size={16} color="#000000" />
                <Text style={styles.submitOfferBtnText}>
                  Send Official Offer (${totalOfferVal.toFixed(2)})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Messages Stream */}
          <ScrollView
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          >
            {conversation.length === 0 ? (
              <View style={styles.emptyChatBox}>
                <View style={[styles.emptyIconCircle, isDark && { backgroundColor: '#1C1C1E' }]}>
                  <Ionicons name="chatbubbles-outline" size={36} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>
                  Direct Farm Chat with {produce.farmerName}
                </Text>
                <Text style={styles.emptyDesc}>
                  Ask harvest questions or propose a custom bulk price offer. All bargains are 100% Escrow protected.
                </Text>
              </View>
            ) : (
              conversation.map(msg => {
                const isBuyer = msg.sender === 'Buyer';
                const offer = msg.offer;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgBubbleRow,
                      isBuyer ? styles.msgRowBuyer : styles.msgRowFarmer,
                    ]}
                  >
                    <View
                      style={[
                        styles.msgBubble,
                        isBuyer
                          ? [styles.msgBubbleBuyer, isDark && styles.msgBubbleBuyerDark]
                          : [styles.msgBubbleFarmer, isDark && styles.msgBubbleFarmerDark],
                      ]}
                    >
                      <View style={styles.msgHeaderRow}>
                        <Text style={[styles.senderName, isBuyer ? styles.senderBuyer : styles.senderFarmer]}>
                          {isBuyer ? 'You' : msg.farmerName}
                        </Text>
                        <Text style={styles.msgTime}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>

                      {/* Text content */}
                      <Text style={[styles.msgContentText, isDark && styles.textWhite]}>
                        {msg.content}
                      </Text>

                      {/* Interactive Offer Card if attached */}
                      {offer && (
                        <View style={[styles.offerCardInside, isDark && styles.offerCardInsideDark]}>
                          <View style={styles.offerBadgeHeader}>
                            <View style={styles.offerTag}>
                              <Ionicons name="pricetag" size={12} color="#FFFFFF" />
                              <Text style={styles.offerTagText}>PRICE BARGAIN OFFER</Text>
                            </View>
                            <View
                              style={[
                                styles.offerStatusChip,
                                offer.status === 'accepted' && styles.statusAccepted,
                                offer.status === 'declined' && styles.statusDeclined,
                                offer.status === 'countered' && styles.statusCountered,
                              ]}
                            >
                              <Text style={styles.offerStatusChipText}>
                                {offer.status.toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.offerValuesGrid}>
                            <View>
                              <Text style={styles.offerValLabel}>OFFERED</Text>
                              <Text style={styles.offerValBig}>
                                ${offer.offeredPrice.toFixed(2)}/{offer.unit}
                              </Text>
                              <Text style={styles.offerOriginalCross}>
                                List: ${offer.originalPrice.toFixed(2)}
                              </Text>
                            </View>

                            <View style={styles.offerDivider} />

                            <View>
                              <Text style={styles.offerValLabel}>TOTAL LOT</Text>
                              <Text style={[styles.offerValBig, { color: '#06C167' }]}>
                                ${(offer.offeredPrice * offer.quantity).toFixed(2)}
                              </Text>
                              <Text style={styles.offerQuantityText}>
                                {offer.quantity} {offer.unit}
                              </Text>
                            </View>
                          </View>

                          {/* Action triggers depending on status */}
                          {offer.status === 'pending' && (
                            <View style={styles.offerActionsRow}>
                              <TouchableOpacity
                                style={styles.acceptBtn}
                                onPress={() => respondToOffer(msg.id, 'accept')}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="checkmark" size={14} color="#000000" />
                                <Text style={styles.acceptBtnText}>Accept Offer</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.declineBtn}
                                onPress={() => respondToOffer(msg.id, 'decline')}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="close" size={14} color="#FFFFFF" />
                                <Text style={styles.declineBtnText}>Decline</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {offer.status === 'accepted' && (
                            <TouchableOpacity
                              style={styles.bookAcceptedBtn}
                              onPress={() => {
                                const discountedProduce: Produce = {
                                  ...produce,
                                  price: offer.offeredPrice,
                                };
                                addToCart(discountedProduce, offer.quantity);
                                onClose();
                              }}
                              activeOpacity={0.85}
                            >
                              <Ionicons name="cart" size={15} color="#FFFFFF" />
                              <Text style={styles.bookAcceptedBtnText}>
                                Checkout at Agreed Price (${(offer.offeredPrice * offer.quantity).toFixed(2)})
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Quick Inquiry Suggestion Chips */}
          <View style={styles.quickChipsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}>
              {quickInquiryChips.map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickChip, isDark && styles.quickChipDark]}
                  onPress={() => setInputMessage(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickChipText, isDark && styles.textWhite]}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Bar */}
          <View style={[styles.inputBar, isDark ? styles.inputBarDark : styles.inputBarLight]}>
            <TouchableOpacity
              style={[styles.attachOfferBtn, isDark && styles.attachOfferBtnDark]}
              onPress={() => setShowOfferDrawer(!showOfferDrawer)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name="tag-outline" size={20} color="#06C167" />
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, isDark && styles.textInputDark]}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder={`Message ${produce.farmerName}...`}
              placeholderTextColor={isDark ? '#9CA3AF' : '#8E8E93'}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputMessage.trim() && styles.sendBtnDisabled]}
              onPress={handleSendTextMessage}
              disabled={!inputMessage.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#000000',
  },
  bgLight: {
    backgroundColor: '#F8F9FA',
  },
  borderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderLight: {
    borderBottomColor: '#E5E7EB',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  keyboardWrap: {
    flex: 1,
  },

  // Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: '#262626',
  },
  cropThumb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginLeft: 10,
    backgroundColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  growerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  growerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  bargainHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#06C167',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bargainHeaderBtnActive: {
    backgroundColor: '#059669',
  },
  bargainHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },

  // Drawer
  offerDrawer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 193, 103, 0.3)',
  },
  drawerDark: {
    backgroundColor: '#18181B',
  },
  drawerLight: {
    backgroundColor: '#F0FDF4',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  drawerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  stepperBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  boxDark: {
    backgroundColor: '#27272A',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepperLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepValText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  discountTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
    marginTop: 4,
  },
  totalOfferTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    marginTop: 4,
  },
  savingsComparisonRow: {
    backgroundColor: '#E2FBEA',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  compLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  compSaving: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  offerNoteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  noteInputDark: {
    backgroundColor: '#27272A',
    color: '#FFFFFF',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitOfferBtn: {
    backgroundColor: '#06C167',
    borderRadius: 14,
    height: 42,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  submitOfferBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  // Message Stream
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyChatBox: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  msgBubbleRow: {
    marginBottom: 14,
    flexDirection: 'row',
  },
  msgRowBuyer: {
    justifyContent: 'flex-end',
  },
  msgRowFarmer: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '85%',
    borderRadius: 18,
    padding: 12,
  },
  msgBubbleBuyer: {
    backgroundColor: '#F3F4F6',
    borderBottomRightRadius: 4,
  },
  msgBubbleBuyerDark: {
    backgroundColor: '#1E1E22',
  },
  msgBubbleFarmer: {
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    borderBottomLeftRadius: 4,
  },
  msgBubbleFarmerDark: {
    backgroundColor: 'rgba(6, 193, 103, 0.18)',
  },
  msgHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '800',
  },
  senderBuyer: {
    color: '#3B82F6',
  },
  senderFarmer: {
    color: '#059669',
  },
  msgTime: {
    fontSize: 9.5,
    color: '#9CA3AF',
  },
  msgContentText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },

  // Offer Card inside bubble
  offerCardInside: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 193, 103, 0.3)',
  },
  offerCardInsideDark: {
    backgroundColor: '#18181B',
  },
  offerBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#06C167',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  offerStatusChip: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusAccepted: {
    backgroundColor: '#10B981',
  },
  statusDeclined: {
    backgroundColor: '#EF4444',
  },
  statusCountered: {
    backgroundColor: '#8B5CF6',
  },
  offerStatusChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  offerValuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
  },
  offerValLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  offerValBig: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginTop: 1,
  },
  offerOriginalCross: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  offerQuantityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  offerDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  acceptBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#06C167',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  acceptBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#000000',
  },
  declineBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  declineBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bookAcceptedBtn: {
    backgroundColor: '#06C167',
    borderRadius: 10,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  bookAcceptedBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#000000',
  },

  // Quick Chips
  quickChipsBar: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.1)',
  },
  quickChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickChipDark: {
    backgroundColor: '#1E1E22',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputBarDark: {
    backgroundColor: '#121214',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputBarLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
  },
  attachOfferBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachOfferBtnDark: {
    backgroundColor: 'rgba(6, 193, 103, 0.18)',
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#000000',
  },
  textInputDark: {
    backgroundColor: '#262626',
    color: '#FFFFFF',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06C167',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
