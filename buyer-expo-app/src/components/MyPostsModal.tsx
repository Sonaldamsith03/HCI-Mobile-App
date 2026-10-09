import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BuyerRequirement } from '@/context/FarmContext';

interface MyPostsModalProps {
  visible: boolean;
  onClose: () => void;
  posts: BuyerRequirement[];
  onEdit: (post: BuyerRequirement) => void;
  onDelete: (postId: string) => void;
  onOpenCreate: () => void;
}

export function MyPostsModal({
  visible,
  onClose,
  posts,
  onEdit,
  onDelete,
  onOpenCreate,
}: MyPostsModalProps) {
  const [activeTab, setActiveTab] = useState<'buyer' | 'farmer'>('buyer');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getProduceImage = (produce: string) => {
    const p = produce.toLowerCase();
    if (p.includes('tomato')) {
      return require('@/assets/images/farmby/vine_tomatoes.jpg');
    }
    if (p.includes('gotu') || p.includes('kola') || p.includes('herb')) {
      return require('@/assets/images/farmby/ceylon_gotu_kola.jpg');
    }
    if (p.includes('corn')) {
      return require('@/assets/images/farmby/sweet_corn_cobs.jpg');
    }
    if (p.includes('pepper')) {
      return require('@/assets/images/farmby/hero_peppers_tomatoes.jpg');
    }
    return null;
  };

  const handleStartChatWithFarmer = (
    farmerId: string,
    post: BuyerRequirement,
    farmerName: string
  ) => {
    onClose();
    router.push({
      pathname: `/chat/${farmerId}` as any,
      params: {
        reqProduce: post.produce,
        reqQuantity: post.quantity,
        reqDate: post.requiredBy,
        reqPrice: post.preferredPrice,
        reqTitle: post.buyerName,
      },
    });
  };

  const handleFarmerChatWithBuyer = (post: BuyerRequirement) => {
    onClose();
    // Farmer chats with buyer to supply requested products
    router.push({
      pathname: '/chat/maliths-family-farm' as any,
      params: {
        reqProduce: post.produce,
        reqQuantity: post.quantity,
        reqDate: post.requiredBy,
        reqPrice: post.preferredPrice,
        reqTitle: post.buyerName,
      },
    });
  };

  const handleDeletePost = (postId: string) => {
    setConfirmDeleteId(null);
    onDelete(postId);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Produce Requirements</Text>
              <Text style={styles.headerSubtitle}>
                {posts.length} active {posts.length === 1 ? 'post' : 'posts'} in reverse marketplace
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          {/* Perspective Switch Tabs */}
          <View style={styles.tabsRow}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'buyer' && styles.tabBtnActive]}
              onPress={() => setActiveTab('buyer')}>
              <Ionicons
                name="person-outline"
                size={14}
                color={activeTab === 'buyer' ? '#15803D' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'buyer' && styles.tabBtnTextActive,
                ]}>
                My Posts ({posts.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabBtn, activeTab === 'farmer' && styles.tabBtnActive]}
              onPress={() => setActiveTab('farmer')}>
              <Ionicons
                name="leaf-outline"
                size={14}
                color={activeTab === 'farmer' ? '#15803D' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'farmer' && styles.tabBtnTextActive,
                ]}>
                Farmer View &amp; Bids
              </Text>
            </Pressable>
          </View>

          {/* Posts List */}
          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="basket-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No active produce posts</Text>
                <Text style={styles.emptySubtitle}>
                  Post your exact harvest quantity and let local farmers bid directly with field-cut timetables.
                </Text>
                <Pressable
                  style={styles.emptyPostBtn}
                  onPress={() => {
                    onClose();
                    onOpenCreate();
                  }}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyPostBtnText}>Post a Requirement</Text>
                </Pressable>
              </View>
            ) : (
              posts.map((post) => {
                const produceImg = getProduceImage(post.produce);

                return (
                  <View key={post.id} style={styles.postCard}>
                    {/* Top status bar */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Active Requirement</Text>
                      </View>
                      <Text style={styles.postedTime}>{post.createdAt}</Text>
                    </View>

                    {/* EXACT REQUESTED POST FORMAT */}
                    <View style={styles.postContentBox}>
                      {/* Buyer Line */}
                      <Text style={styles.buyerLine}>{post.buyerName}</Text>

                      {/* Produce Line with Image & Emoji */}
                      <View style={styles.produceLineRow}>
                        {produceImg ? (
                          <Image
                            source={produceImg}
                            style={styles.produceThumbnail}
                            contentFit="cover"
                          />
                        ) : null}
                        <Text style={styles.emojiIcon}>{post.emoji}</Text>
                        <Text style={styles.produceQuantityText}>
                          {post.quantity} {post.produce}
                        </Text>
                      </View>

                      {/* Requirement Specifications */}
                      <View style={styles.specsContainer}>
                        <View style={styles.specRow}>
                          <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                          <Text style={styles.specLabel}>Required by: </Text>
                          <Text style={styles.specValue}>{post.requiredBy}</Text>
                        </View>

                        <View style={styles.specRow}>
                          <Ionicons name="pricetag-outline" size={14} color="#15803D" />
                          <Text style={styles.specLabel}>Preferred price: </Text>
                          <Text style={styles.specValue}>{post.preferredPrice}</Text>
                        </View>

                        <View style={styles.specRow}>
                          <Ionicons name="location-outline" size={14} color="#0284C7" />
                          <Text style={styles.specLabel}>Location: </Text>
                          <Text style={styles.specValue}>{post.location}</Text>
                        </View>

                        <View style={styles.specRow}>
                          <Ionicons name="leaf-outline" size={14} color="#16A34A" />
                          <Text style={styles.specLabel}>Organic preferred: </Text>
                          <Text
                            style={[
                              styles.specValue,
                              { color: post.organicPreferred ? '#15803D' : '#64748B' },
                            ]}>
                            {post.organicPreferred ? 'Yes' : 'No'}
                          </Text>
                        </View>

                        {post.notes ? (
                          <View style={styles.notesRow}>
                            <Ionicons name="information-circle-outline" size={13} color="#64748B" />
                            <Text style={styles.notesText}>{post.notes}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Buyer Controls: Edit & Delete */}
                    {activeTab === 'buyer' ? (
                      confirmDeleteId === post.id ? (
                        <View style={styles.inlineConfirmRow}>
                          <View style={styles.inlineConfirmLeft}>
                            <Ionicons name="alert-circle" size={16} color="#DC2626" />
                            <Text style={styles.inlineConfirmText}>Delete this post?</Text>
                          </View>
                          <View style={styles.inlineConfirmActions}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.inlineCancelBtn,
                                pressed && styles.btnPressed,
                              ]}
                              onPress={() => setConfirmDeleteId(null)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              accessibilityRole="button"
                              accessibilityLabel="Cancel delete">
                              <Text style={styles.inlineCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [
                                styles.inlineDeleteBtn,
                                pressed && styles.btnPressed,
                              ]}
                              onPress={() => handleDeletePost(post.id)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              accessibilityRole="button"
                              accessibilityLabel="Confirm delete">
                              <Ionicons name="trash" size={13} color="#FFFFFF" />
                              <Text style={styles.inlineDeleteText}>Yes, Delete</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.actionBtnsRow}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.editBtn,
                              pressed && styles.btnPressed,
                            ]}
                            onPress={() => onEdit(post)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel="Edit Post">
                            <Ionicons name="pencil-outline" size={15} color="#1E293B" />
                            <Text style={styles.editBtnText}>Edit Post</Text>
                          </Pressable>

                          <Pressable
                            style={({ pressed }) => [
                              styles.deleteBtn,
                              pressed && styles.btnPressed,
                            ]}
                            onPress={() => setConfirmDeleteId(post.id)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            accessibilityRole="button"
                            accessibilityLabel="Delete Post">
                            <Ionicons name="trash-outline" size={15} color="#DC2626" />
                            <Text style={styles.deleteBtnText}>Delete</Text>
                          </Pressable>
                        </View>
                      )
                    ) : null}

                    {/* Farmer Responses / Bids Section */}
                    <View style={styles.bidsSection}>
                      <View style={styles.bidsHeaderRow}>
                        <Ionicons name="chatbubbles-outline" size={15} color="#15803D" />
                        <Text style={styles.bidsHeaderTitle}>
                          Farmer Proposals &amp; Bids ({post.bids?.length || 0})
                        </Text>
                      </View>

                      {post.bids && post.bids.length > 0 ? (
                        post.bids.map((bid) => (
                          <View key={bid.id} style={styles.bidCard}>
                            <View style={styles.bidTopRow}>
                              <Image
                                source={{ uri: bid.farmerAvatar }}
                                style={styles.farmerAvatar}
                                contentFit="cover"
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.farmerName}>{bid.farmerName}</Text>
                                <Text style={styles.bidDate}>{bid.availableDate}</Text>
                              </View>
                              <View style={styles.bidPriceBadge}>
                                <Text style={styles.bidPriceText}>{bid.offeredPrice}</Text>
                              </View>
                            </View>

                            <Text style={styles.bidMessageText}>{bid.message}</Text>

                            <Pressable
                              style={styles.chatFarmerBtn}
                              onPress={() =>
                                handleStartChatWithFarmer(bid.farmerId, post, bid.farmerName)
                              }>
                              <Ionicons name="chatbubble-ellipses" size={15} color="#FFFFFF" />
                              <Text style={styles.chatFarmerBtnText}>
                                Chat with Farmer &amp; Arrange Supply
                              </Text>
                            </Pressable>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noBidsText}>
                          Awaiting first smallholder harvest bid. Notifications are sent automatically.
                        </Text>
                      )}

                      {/* If Farmer View Tab is Active: direct button for farmers to chat and provide products */}
                      {activeTab === 'farmer' && (
                        <View style={styles.farmerSupplyBox}>
                          <View style={styles.farmerSupplyPrompt}>
                            <Ionicons name="leaf" size={16} color="#15803D" />
                            <Text style={styles.farmerSupplyPromptText}>
                              Are you a grower with {post.produce}? Provide harvest directly to this buyer.
                            </Text>
                          </View>
                          <Pressable
                            style={styles.supplyProduceBtn}
                            onPress={() => handleFarmerChatWithBuyer(post)}>
                            <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.supplyProduceBtnText}>
                              Chat with Buyer to Provide Products
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer with Post Another Button */}
          <View style={styles.footerRow}>
            <Pressable
              style={styles.addNewPostBtn}
              onPress={() => {
                onClose();
                onOpenCreate();
              }}>
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addNewPostBtnText}>Post Another Requirement</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
    maxHeight: '92%',
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
    paddingBottom: 12,
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  listScroll: {
    maxHeight: 480,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyPostBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  postedTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  postContentBox: {
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  buyerLine: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  produceLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  produceThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  emojiIcon: {
    fontSize: 22,
  },
  produceQuantityText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  specsContainer: {
    gap: 5,
    marginTop: 2,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  notesText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    flex: 1,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  inlineConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    gap: 8,
  },
  inlineConfirmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  inlineConfirmText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#991B1B',
  },
  inlineConfirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  inlineCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  inlineDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  inlineDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  bidsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bidsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  bidsHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  bidCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  bidTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  farmerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  farmerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  bidDate: {
    fontSize: 11,
    color: '#64748B',
  },
  bidPriceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bidPriceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  bidMessageText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 8,
  },
  chatFarmerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingVertical: 8,
    borderRadius: 8,
  },
  chatFarmerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noBidsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  farmerSupplyBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
    gap: 8,
  },
  farmerSupplyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerSupplyPromptText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  supplyProduceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingVertical: 8,
    borderRadius: 8,
  },
  supplyProduceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addNewPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingVertical: 12,
    borderRadius: 12,
  },
  addNewPostBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
