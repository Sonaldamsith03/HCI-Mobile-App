import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Message, PriceOffer, Produce } from '../types';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chatService';
import { DEFAULT_CATEGORY_IMAGES } from '../data/seedData';
import { BookingCheckoutModal } from '../components/Modals';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatConversation'>;
type ChatScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ChatConversationScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavProp>();
  const { farmerName, produceName, produceId, initialMessage } = route.params;

  const {
    userProfile,
    currentRole,
    produceList,
    themeMode,
    showToast,
    addToCart,
    respondToOffer,
    bookProduce,
  } = useApp();

  const isDark = themeMode === 'dark';
  // Respect buyerName passed from thread or userProfile or fallback
  const buyerName = route.params.buyerName || (currentRole === 'FARMER' ? 'Elena Vance' : (userProfile.name || 'Sonal Perera'));
  const currentSenderRole = currentRole === 'FARMER' ? 'Farmer' : 'Buyer';

  // Partner display name in header
  const partnerName = currentRole === 'FARMER' ? (route.params.buyerName || 'Buyer') : farmerName;

  // Derive stable channel ID
  const conversationId =
    route.params.conversationId ||
    chatService.getConversationId(farmerName, buyerName, produceId);

  const matchedProduce = produceList.find(p => p.id === produceId || p.name === produceName);

  const [conversation, setConversation] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(
    matchedProduce?.price ? Number((matchedProduce.price * 0.85).toFixed(2)) : 2.5
  );
  const [proposedQty, setProposedQty] = useState<number>(10);
  const [offerNote, setOfferNote] = useState('');
  const [counterInput, setCounterInput] = useState<{ [id: number]: string }>({});
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleFinalizeOrder = async (
    prod: Produce,
    quantity: number,
    deliveryMethod: string,
    deliveryAddress: string,
    paymentMethod: string
  ) => {
    try {
      const tx = await bookProduce(prod, quantity, deliveryMethod, deliveryAddress, paymentMethod);
      chatService.sendMessage(
        conversationId,
        farmerName,
        buyerName,
        prod.name,
        `🎉 ORDER FINALIZED & ESCROW SECURED!\n• Amount: $${tx.amount.toFixed(2)} (${quantity} ${prod.unit})\n• Method: ${deliveryMethod}\n• Tracking: ${tx.trackingCode} (PIN: ${tx.handoverPin})\nDelivery request dispatched to logistics fleet!`,
        currentSenderRole,
        prod.id
      );
      showToast(`Order #${tx.trackingCode} placed with Escrow!`, 'success');
      setShowOrderModal(false);
    } catch (e: any) {
      showToast(e?.message || 'Failed to finalize order', 'warn');
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimerRef = useRef<any>(null);

  // Subscribe to real-time updates for this conversation
  useEffect(() => {
    const unsubscribe = chatService.subscribeToConversation(
      conversationId,
      msgs => {
        setConversation(msgs);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      typingInfo => {
        if (typingInfo.sender !== currentSenderRole) {
          setIsPartnerTyping(typingInfo.isTyping);
        }
      }
    );

    return () => {
      unsubscribe();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, currentSenderRole]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    chatService.sendTypingStatus(conversationId, currentSenderRole, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      chatService.sendTypingStatus(conversationId, currentSenderRole, false);
    }, 1500);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    chatService.sendTypingStatus(conversationId, currentSenderRole, false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    chatService.sendMessage(
      conversationId,
      farmerName,
      buyerName,
      produceName || matchedProduce?.name || 'Produce',
      inputText.trim(),
      currentSenderRole,
      produceId
    );
    setInputText('');
  };

  const handleSendOffer = () => {
    if (proposedPrice <= 0 || proposedQty <= 0) {
      showToast('Please enter valid price and quantity', 'warn');
      return;
    }

    const offer: PriceOffer = {
      id: `OFFER-${Date.now()}`,
      offeredPrice: proposedPrice,
      originalPrice: matchedProduce?.price || proposedPrice * 1.15,
      quantity: proposedQty,
      unit: matchedProduce?.unit || 'kg',
      status: 'pending',
      note: offerNote.trim() || undefined,
      proposedBy: currentSenderRole,
    };

    chatService.sendMessage(
      conversationId,
      farmerName,
      buyerName,
      produceName || matchedProduce?.name || 'Produce',
      `[PRICE OFFER] Proposing $${proposedPrice.toFixed(2)}/${offer.unit} for ${proposedQty} ${offer.unit}.`,
      currentSenderRole,
      produceId,
      offer
    );

    setShowOfferModal(false);
    setOfferNote('');
    showToast(`Bargain offer sent to ${currentRole === 'FARMER' ? buyerName : farmerName}!`, 'success');
  };

  const handleAcceptOffer = (msgId: number, offer: PriceOffer) => {
    chatService.respondToOffer(conversationId, msgId, 'accept', undefined, currentSenderRole);
    if (matchedProduce) {
      const discounted: Produce = { ...matchedProduce, price: offer.offeredPrice };
      addToCart(discounted, offer.quantity);
      showToast('Offer accepted! Item added to basket at discounted price.', 'success');
    }
  };

  const handleDeclineOffer = (msgId: number) => {
    chatService.respondToOffer(conversationId, msgId, 'decline', undefined, currentSenderRole);
    showToast('Offer declined', 'info');
  };

  const handleCounterOffer = (msgId: number) => {
    const counterVal = parseFloat(counterInput[msgId]);
    if (!counterVal || counterVal <= 0) {
      showToast('Enter valid counter-offer price', 'warn');
      return;
    }
    chatService.respondToOffer(conversationId, msgId, 'counter', counterVal, currentSenderRole);
    setCounterInput(prev => ({ ...prev, [msgId]: '' }));
    showToast(`Counter-offer of $${counterVal.toFixed(2)} dispatched!`, 'success');
  };

  const quickInquiries = [
    'Harvested fresh today?',
    'Can you deliver by morning?',
    'Any discount on 30kg+ bulk?',
    'Organic certification confirmed?',
  ];

  // ─── AUTHENTICATION GATE: User must be signed in or registered to chat ───
  if (userProfile.isLoggedIn === false) {
    return (
      <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {/* Top Header */}
        <View style={[styles.header, isDark ? styles.borderDark : styles.borderLight]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Direct Farm Messenger</Text>
        </View>

        <View style={styles.authLockContainer}>
          <View style={styles.authLockIconCircle}>
            <Ionicons name="lock-closed" size={36} color="#059669" />
          </View>

          <Text style={[styles.authLockTitle, isDark && styles.textWhite]}>
            Sign In to Chat with Growers
          </Text>
          <Text style={[styles.authLockSub, isDark && styles.textMuted]}>
            To protect farmers and ensure verified, fraud-free farm-to-table trade, you must log in or create an AgriConnect account before sending live inquiries and bargaining.
          </Text>

          {/* Benefits bullets */}
          <View style={styles.authBenefitsBox}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={[styles.benefitText, isDark && styles.textWhite]}>Direct farm-gate wholesale price bargaining</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={[styles.benefitText, isDark && styles.textWhite]}>Escrow-backed buyer & grower contract guarantee</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={[styles.benefitText, isDark && styles.textWhite]}>Live order dispatch & delivery status updates</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MainTabs', { tab: 'account' });
            }}
            style={styles.authPrimaryBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.authPrimaryBtnText}>Log In or Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.authSecondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.authSecondaryBtnText, isDark && styles.textMuted]}>
              Continue Browsing Market
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.header, isDark ? styles.borderDark : styles.borderLight]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>

        <Image
          source={{
            uri:
              matchedProduce?.imageUrl ||
              (matchedProduce?.category
                ? DEFAULT_CATEGORY_IMAGES[matchedProduce.category]
                : DEFAULT_CATEGORY_IMAGES.Vegetables),
          }}
          style={styles.avatarImg}
        />

        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, isDark && styles.textWhite]}>
              {partnerName}
            </Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Active Now</Text>
            </View>
          </View>
          <Text style={[styles.headerSub, isDark && styles.textMuted]}>
            {produceName || matchedProduce?.name || 'Direct Farm Inquiry'}
            {matchedProduce ? ` • $${matchedProduce.price}/${matchedProduce.unit}` : ''}
          </Text>
        </View>

        <View style={styles.headerActionBtns}>
          {matchedProduce && currentRole === 'BUYER' && (
            <TouchableOpacity
              onPress={() => setShowOrderModal(true)}
              style={styles.finalizePillBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={13} color="#FFFFFF" />
              <Text style={styles.finalizePillText}>Order</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowOfferModal(!showOfferModal)}
            style={[styles.bargainPillBtn, showOfferModal && styles.bargainPillActive]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="handshake-outline"
              size={15}
              color={showOfferModal ? '#FFFFFF' : '#047857'}
            />
            <Text style={[styles.bargainPillText, showOfferModal && { color: '#FFFFFF' }]}>
              Offer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offer Modal / Top Drawer */}
      {showOfferModal && matchedProduce && (
        <View style={[styles.offerDrawer, isDark ? styles.offerDrawerDark : styles.offerDrawerLight]}>
          <View style={styles.offerDrawerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="tag-outline" size={18} color="#059669" style={{ marginRight: 6 }} />
              <Text style={[styles.offerDrawerTitle, isDark && styles.textWhite]}>
                Propose Price Bargain
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowOfferModal(false)}>
              <Ionicons name="close" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <View style={styles.offerFieldsRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.inputLabel, isDark && styles.textMuted]}>
                Offer Price (${matchedProduce.unit})
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(proposedPrice)}
                onChangeText={v => setProposedPrice(parseFloat(v) || 0)}
                style={[styles.modalInput, isDark && styles.modalInputDark]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, isDark && styles.textMuted]}>
                Quantity ({matchedProduce.unit})
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(proposedQty)}
                onChangeText={v => setProposedQty(parseInt(v, 10) || 0)}
                style={[styles.modalInput, isDark && styles.modalInputDark]}
              />
            </View>
          </View>

          <TextInput
            placeholder="Add note (e.g., Will order weekly if quality is solid)..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#8E8E93'}
            value={offerNote}
            onChangeText={setOfferNote}
            style={[styles.modalInput, { marginTop: 8 }, isDark && styles.modalInputDark]}
          />

          <View style={styles.offerSavingsRow}>
            <Text style={[styles.savingsText, isDark && styles.textMuted]}>
              Original: ${(matchedProduce.price * proposedQty).toFixed(2)} ➔ Offered: $
              {(proposedPrice * proposedQty).toFixed(2)}
            </Text>
            <TouchableOpacity onPress={handleSendOffer} style={styles.submitOfferBtn}>
              <Text style={styles.submitOfferText}>Send Live Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages Scroll Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trust & Direct Escrow Banner */}
          <View style={[styles.escrowBanner, isDark && styles.escrowBannerDark]}>
            <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginRight: 6 }} />
            <Text style={[styles.escrowBannerText, isDark && styles.textMuted]}>
              End-to-end buyer protection. Payment held in Escrow until produce is inspected.
            </Text>
          </View>

          {conversation.map(item => {
            const isMe = item.sender === currentSenderRole;

            return (
              <View
                key={item.id}
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                {!isMe && (
                  <View style={styles.senderInitialCircle}>
                    <Text style={styles.senderInitialText}>
                      {item.sender === 'Farmer' ? 'F' : 'B'}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isMe
                      ? styles.bubbleRight
                      : isDark
                      ? styles.bubbleLeftDark
                      : styles.bubbleLeftLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe ? styles.textBubbleWhite : isDark ? styles.textWhite : styles.textDark,
                    ]}
                  >
                    {item.content}
                  </Text>

                  {/* Interactive Bargain Card */}
                  {item.offer && (
                    <View
                      style={[
                        styles.offerCard,
                        isDark ? styles.offerCardDark : styles.offerCardLight,
                      ]}
                    >
                      <View style={styles.offerCardHeader}>
                        <MaterialCommunityIcons name="scale" size={16} color="#059669" />
                        <Text style={styles.offerCardTitle}>
                          Bargain Proposal ({item.offer.status.toUpperCase()})
                        </Text>
                      </View>

                      <View style={styles.offerValuesRow}>
                        <View>
                          <Text style={styles.offerLabel}>Target Rate</Text>
                          <Text style={styles.offerPriceVal}>
                            ${item.offer.offeredPrice.toFixed(2)}/{item.offer.unit}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.offerLabel}>Total Volume</Text>
                          <Text style={styles.offerPriceVal}>
                            {item.offer.quantity} {item.offer.unit} ($
                            {(item.offer.offeredPrice * item.offer.quantity).toFixed(2)})
                          </Text>
                        </View>
                      </View>

                      {item.offer.counterPrice && (
                        <View style={styles.counterAlertBox}>
                          <Text style={styles.counterAlertText}>
                            Counter Offered: ${item.offer.counterPrice.toFixed(2)}/{item.offer.unit}
                          </Text>
                        </View>
                      )}

                      {/* Action buttons if pending and not proposed by current viewer */}
                      {item.offer.status === 'pending' && item.offer.proposedBy !== currentSenderRole && (
                        <View style={styles.offerActionsRow}>
                          <TouchableOpacity
                            onPress={() => handleAcceptOffer(item.id, item.offer!)}
                            style={styles.acceptBtn}
                          >
                            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                            <Text style={styles.btnActionText}>Accept</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDeclineOffer(item.id)}
                            style={styles.declineBtn}
                          >
                            <Ionicons name="close-circle" size={14} color="#EF4444" />
                            <Text style={[styles.btnActionText, { color: '#EF4444' }]}>Decline</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {item.offer.status === 'pending' && item.offer.proposedBy !== currentSenderRole && (
                        <View style={styles.counterInputRow}>
                          <TextInput
                            placeholder="Counter $/unit"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={counterInput[item.id] || ''}
                            onChangeText={txt =>
                              setCounterInput(prev => ({ ...prev, [item.id]: txt }))
                            }
                            style={styles.counterField}
                          />
                          <TouchableOpacity
                            onPress={() => handleCounterOffer(item.id)}
                            style={styles.counterSubmitBtn}
                          >
                            <Text style={styles.counterSubmitText}>Counter</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.bubbleFooter}>
                    <Text
                      style={[
                        styles.timestampText,
                        isMe ? styles.timestampWhite : styles.timestampMuted,
                      ]}
                    >
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {isMe && (
                      <Ionicons
                        name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                        size={13}
                        color="rgba(255,255,255,0.8)"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Inquiry Suggestions Chips */}
        <View style={styles.chipsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {quickInquiries.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setInputText(q)}
                style={[styles.quickChip, isDark ? styles.quickChipDark : styles.quickChipLight]}
              >
                <Text style={[styles.quickChipText, isDark && styles.textWhite]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Live Partner Typing Indicator */}
        {isPartnerTyping && (
          <View style={[styles.typingBar, isDark ? styles.typingBarDark : styles.typingBarLight]}>
            <View style={styles.typingDotBox}>
              <View style={styles.typingDotSmall} />
              <View style={[styles.typingDotSmall, { marginHorizontal: 3 }]} />
              <View style={styles.typingDotSmall} />
            </View>
            <Text style={[styles.typingText, isDark && styles.textMuted]}>
              {partnerName} is typing...
            </Text>
          </View>
        )}

        {/* Bottom Input Bar */}
        <View style={[styles.bottomInputBar, isDark ? styles.borderDark : styles.borderLight]}>
          <TextInput
            placeholder={`Message ${partnerName}...`}
            placeholderTextColor={isDark ? '#9CA3AF' : '#8E8E93'}
            value={inputText}
            onChangeText={handleInputChange}
            style={[styles.chatInput, isDark && styles.chatInputDark]}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendText}
            disabled={!inputText.trim()}
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BookingCheckoutModal
        visible={showOrderModal}
        produce={matchedProduce || null}
        onClose={() => setShowOrderModal(false)}
        onConfirm={handleFinalizeOrder}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgLight: {
    backgroundColor: '#F9FAFB',
  },
  bgDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  borderLight: {
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  borderDark: {
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  finalizePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#06C167',
    gap: 4,
  },
  finalizePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bargainPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  bargainPillActive: {
    backgroundColor: '#059669',
  },
  bargainPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 4,
  },
  offerDrawer: {
    padding: 14,
    borderBottomWidth: 1,
  },
  offerDrawerLight: {
    backgroundColor: '#ECFDF5',
    borderBottomColor: '#A7F3D0',
  },
  offerDrawerDark: {
    backgroundColor: '#064E3B',
    borderBottomColor: '#047857',
  },
  offerDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerDrawerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  offerFieldsRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalInputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#FFFFFF',
  },
  offerSavingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  savingsText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  submitOfferBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  submitOfferText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  escrowBannerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  escrowBannerText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 15,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  senderInitialCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  senderInitialText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleRight: {
    backgroundColor: '#059669',
    borderBottomRightRadius: 2,
  },
  bubbleLeftLight: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bubbleLeftDark: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textBubbleWhite: {
    color: '#FFFFFF',
  },
  textWhite: {
    color: '#F9FAFB',
  },
  textDark: {
    color: '#111827',
  },
  textMuted: {
    color: '#9CA3AF',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
  },
  timestampWhite: {
    color: 'rgba(255,255,255,0.7)',
  },
  timestampMuted: {
    color: '#9CA3AF',
  },
  offerCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  offerCardLight: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  offerCardDark: {
    backgroundColor: '#064E3B',
    borderColor: '#047857',
  },
  offerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  offerCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  offerValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  offerLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  offerPriceVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  counterAlertBox: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  counterAlertText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 6,
    borderRadius: 6,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  counterInputRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  counterField: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  counterSubmitBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  counterSubmitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chipsWrapper: {
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickChipLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  quickChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  quickChipText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  bottomInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  chatInputDark: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  authLockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  authLockIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  authLockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  authLockSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  authBenefitsBox: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  benefitText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  authPrimaryBtn: {
    width: '100%',
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  authPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  authSecondaryBtn: {
    paddingVertical: 10,
  },
  authSecondaryBtnText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  typingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typingBarLight: {
    backgroundColor: '#F3F4F6',
  },
  typingBarDark: {
    backgroundColor: '#1F2937',
  },
  typingDotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  typingDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6B7280',
  },
});
