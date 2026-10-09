import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REGIONAL_STALLS, ALL_CROPS, HERO_DEAL } from '@/data/farmData';
import { FarmToast } from '@/components/FloatingCartBar';
import { useFarm } from '@/context/FarmContext';

interface Message {
  id: string;
  sender: 'user' | 'farmer';
  text: string;
  time: string;
}

export default function ChatScreen() {
  const { id, productId, reqProduce, reqQuantity, reqDate, reqPrice, reqTitle } =
    useLocalSearchParams<{
      id: string;
      productId?: string;
      reqProduce?: string;
      reqQuantity?: string;
      reqDate?: string;
      reqPrice?: string;
      reqTitle?: string;
    }>();
  const { showToast } = useFarm();
  const counterRef = useRef(100);

  const stall = REGIONAL_STALLS.find((s) => s.id === id) || REGIONAL_STALLS[0];

  // Product context — only present when navigating from a product detail page
  const contextProduct = productId
    ? ALL_CROPS.find((c) => c.id === productId) ||
      (HERO_DEAL.id === productId ? HERO_DEAL : undefined)
    : undefined;

  const [offerRangeOpen, setOfferRangeOpen] = useState(false);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'farmer',
      text: reqProduce
        ? `Ayubowan Heshani! I saw your post: ${reqTitle || 'A restaurant needs'} ${reqQuantity || 'custom harvest'} ${reqProduce} by ${reqDate || 'this week'}. We can harvest and supply this directly from our plot at ${reqPrice || 'fair price'}. How can we arrange delivery?`
        : contextProduct
        ? `Ayubowan Heshani! I see you're enquiring about ${contextProduct.title}. Our morning batch was picked at 5:30 AM with dew intact. Current offer stands at Rs. ${contextProduct.price}/${contextProduct.unit}. How can I help?`
        : `Ayubowan Heshani! Welcome to ${stall.name}. Our morning crops were picked at 5:30 AM with dew intact. How can we help you today?`,
      time: '9:08 AM',
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    counterRef.current += 1;
    const userMsg: Message = {
      id: `u-${counterRef.current}`,
      sender: 'user',
      text: text.trim(),
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Simulate farmer reply after 1s
    setTimeout(() => {
      const farmerReplies = [
        `Thank you Heshani! Yes, that lot is reserved for you straight from today's sunrise harvest. We're packing it in banana-bark wrap now.`,
        `Understood! We will have it ready at our Farmgate Stall by 4:00 PM. See you soon!`,
        `Confirmed! Niluka just checked the beehive crates—the wild raw honey jar is packed and ready.`,
      ];
      const replyText =
        farmerReplies[Math.floor(Math.random() * farmerReplies.length)];

      counterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `f-${counterRef.current}`,
          sender: 'farmer',
          text: replyText,
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  const QUICK_PROMPTS = reqProduce
    ? [
        `Can you supply the full ${reqQuantity || 'quantity'}?`,
        `Can you deliver to ${reqTitle?.includes('Colombo') ? 'Colombo' : 'our location'} by ${reqDate || 'Friday'}?`,
        'Is this 100% organic & chemical-free?',
      ]
    : [
        "Is today's batch still available?",
        'Can I pick up at 4 PM?',
        'Do you have raw wild honey?',
      ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <Pressable
          style={styles.headerInfo}
          onPress={() => router.push(`/farm/${stall.id}` as any)}>
          <Image source={stall.image} style={styles.avatar} contentFit="cover" />
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.stallName}>{stall.name}</Text>
              <Ionicons name="checkmark-circle" size={13} color="#15803D" />
            </View>
            <Text style={styles.statusSub}>Active at farm plot • Replies quickly</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.circleBtn}
          onPress={() => showToast(`Calling ${stall.farmerName}...`)}>
          <Ionicons name="call-outline" size={18} color="#15803D" />
        </Pressable>
      </View>

      {/* ── Requirement Context Banner (shown when chatting about buyer requirement) ── */}
      {reqProduce && (
        <View style={styles.requirementBanner}>
          <View style={styles.reqBadgeRow}>
            <View style={styles.reqBadge}>
              <Ionicons name="megaphone-outline" size={12} color="#15803D" />
              <Text style={styles.reqBadgeText}>REVERSE MARKETPLACE REQUIREMENT</Text>
            </View>
            <Text style={styles.reqDateText}>Needed by {reqDate || 'Friday'}</Text>
          </View>
          <Text style={styles.reqTitleText}>
            {reqQuantity || '100 kg'} {reqProduce}
          </Text>
          <View style={styles.reqFooterRow}>
            <Text style={styles.reqPriceText}>Target Price: {reqPrice || 'Rs. 400–450/kg'}</Text>
            <View style={styles.directOfferPill}>
              <Text style={styles.directOfferPillText}>Direct Smallholder Supply</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Product Context Card (shown only when coming from a product page) ── */}
      {contextProduct && (
        <View style={styles.productCtxCard}>
          <View style={styles.productCtxLeft}>
            <Image source={contextProduct.image} style={styles.productCtxThumb} contentFit="cover" />
            <View style={styles.productCtxInfo}>
              <Text style={styles.productCtxTitle} numberOfLines={1}>
                {contextProduct.title}
              </Text>
              <View style={styles.productCtxRow}>
                <View style={styles.negotiatingBadge}>
                  <View style={styles.negDot} />
                  <Text style={styles.negotiatingText}>Negotiating</Text>
                </View>
              </View>
              <View style={styles.productCtxPriceRow}>
                {contextProduct.originalPrice ? (
                  <Text style={styles.ctxOrigPrice}>Rs. {contextProduct.originalPrice}/{contextProduct.unit}</Text>
                ) : null}
                <Text style={styles.ctxOfferLabel}>Offer: </Text>
                <Text style={styles.ctxOfferPrice}>Rs. {contextProduct.price}/{contextProduct.unit}</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={styles.rangeBtn}
            onPress={() => setOfferRangeOpen((v) => !v)}>
            <Text style={styles.rangeBtnText}>
              Range Rs.{Math.round(contextProduct.price * 0.9)}-{Math.round(contextProduct.price * 1.05)}
            </Text>
            <Ionicons name={offerRangeOpen ? 'chevron-up' : 'chevron-down'} size={12} color="#334155" />
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}>
          {/* Farm verified notice */}
          <View style={styles.noticeBox}>
            <Ionicons name="shield-checkmark" size={16} color="#15803D" />
            <Text style={styles.noticeText}>
              Direct peer-to-peer line with {stall.farmerName}. 100% transparent pricing.
            </Text>
          </View>

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.msgWrapper,
                  isUser ? styles.msgWrapperUser : styles.msgWrapperFarmer,
                ]}>
                <View
                  style={[
                    styles.msgBubble,
                    isUser ? styles.msgBubbleUser : styles.msgBubbleFarmer,
                  ]}>
                  <Text
                    style={[
                      styles.msgText,
                      isUser ? styles.msgTextUser : styles.msgTextFarmer,
                    ]}>
                    {m.text}
                  </Text>
                </View>
                <Text style={styles.msgTime}>{m.time}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <Pressable
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(prompt)}>
                <Text style={styles.promptChipText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={`Message ${stall.farmerName}...`}
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
          />

          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stallName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusSub: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '500',
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'center',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  noticeText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  msgWrapper: {
    maxWidth: '82%',
    gap: 2,
  },
  msgWrapperUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  msgWrapperFarmer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  msgBubbleUser: {
    backgroundColor: '#15803D',
    borderBottomRightRadius: 4,
  },
  msgBubbleFarmer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgTextFarmer: {
    color: '#0F172A',
  },
  msgTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  suggestionsRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  promptChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  promptChipText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
  },

  /* Product context card */
  productCtxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  productCtxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  productCtxThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  productCtxInfo: {
    flex: 1,
    gap: 2,
  },
  productCtxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  productCtxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  negotiatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  negDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  negotiatingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  productCtxPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  ctxOrigPrice: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 2,
  },
  ctxOfferLabel: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  ctxOfferPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  rangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rangeBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  requirementBanner: {
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  reqBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reqBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  reqDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },
  reqTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  reqFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  reqPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  directOfferPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  directOfferPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
});
