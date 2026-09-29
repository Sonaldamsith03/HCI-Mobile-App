import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Produce,
  Transaction,
  Message,
  UserRole,
  OrderStatus,
  CartItem,
  UserProfile,
  ToastState,
  CommunityPool,
  ProduceCategory,
  ConversationThread,
} from '../types';
import {
  INITIAL_PRODUCE,
  INITIAL_TRANSACTIONS,
  INITIAL_MESSAGES,
  DEFAULT_CATEGORY_IMAGES,
  INITIAL_USER_PROFILE,
  INITIAL_COMMUNITY_POOLS,
  INITIAL_SYSTEM_USERS,
  INITIAL_CROP_TYPES,
} from '../data/seedData';
import { getThemeColors, ThemeColors } from '../theme/colors';
import { chatService } from '../services/chatService';

interface AppContextType {
  produceList: Produce[];
  transactions: Transaction[];
  messages: Message[];
  conversationThreads: ConversationThread[];
  unreadMessageCount: number;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  // Produce management
  addProduce: (crop: Omit<Produce, 'id'>) => Promise<void>;
  updateProduce: (crop: Produce) => Promise<void>;
  deleteProduce: (id: number) => Promise<void>;
  // Single Booking
  bookProduce: (
    produce: Produce,
    quantity: number,
    deliveryMethod: string,
    deliveryAddress: string,
    paymentMethod: string
  ) => Promise<Transaction>;
  // Multi-item Cart
  cart: CartItem[];
  addToCart: (produce: Produce, quantity?: number) => void;
  removeFromCart: (produceId: number) => void;
  updateCartQuantity: (produceId: number, quantity: number) => void;
  clearCart: () => void;
  checkoutCart: (
    deliveryMethod: string,
    deliveryAddress: string,
    paymentMethod: string
  ) => Promise<Transaction[]>;
  // Saved Favorites
  favorites: number[];
  toggleFavorite: (produceId: number) => void;
  isFavorite: (produceId: number) => boolean;
  // Orders & Fulfillment
  updateOrderStatus: (transactionId: number, status: OrderStatus) => Promise<void>;
  // Live Chat & Negotiation
  sendMessage: (
    farmerName: string,
    produceName: string,
    content: string,
    sender?: 'Buyer' | 'Farmer',
    produceId?: number,
    offer?: import('../types').PriceOffer,
    buyerName?: string
  ) => Promise<void>;
  sendOffer: (
    produce: Produce,
    offeredPrice: number,
    quantity: number,
    note?: string
  ) => Promise<void>;
  respondToOffer: (
    messageId: number,
    action: 'accept' | 'decline' | 'counter',
    counterPrice?: number,
    conversationId?: string
  ) => Promise<void>;
  // Toast notifications
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warn') => void;
  clearToast: () => void;
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  resetSeedData: () => Promise<void>;
  // Community Wholesale Pools
  communityPools: CommunityPool[];
  joinPool: (poolId: number, kg: number) => Promise<void>;
  // Wallet & Escrow
  topUpWallet: (amount: number) => void;
  releaseEscrow: (transactionId: number) => Promise<void>;
  // Theme Switcher
  themeMode: 'dark' | 'light';
  toggleThemeMode: () => void;
  theme: ThemeColors;
  // Dynamic Tab Transition Direction
  navTransitionDirection: 'slide_from_right' | 'slide_from_left';
  setNavTransitionDirection: (direction: 'slide_from_right' | 'slide_from_left') => void;
  // Unified Bottom Nav Tab
  currentBottomTab: 'home' | 'services' | 'activity' | 'account';
  setCurrentBottomTab: (tab: 'home' | 'services' | 'activity' | 'account') => void;
  // Admin Management: System Users
  systemUsers: import('../types').SystemUser[];
  updateSystemUser: (userId: string, updates: Partial<import('../types').SystemUser>) => void;
  toggleBanUser: (userId: string) => void;
  toggleVerifyUser: (userId: string) => void;
  // Admin Management: Crop Types
  cropTypes: { id: string; name: string; category: ProduceCategory; basePriceKg: number; season: string; icon: string }[];
  addCropType: (newCrop: { name: string; category: ProduceCategory; basePriceKg: number; season: string }) => void;
  deleteCropType: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCE: '@agriconnect_produce_v2',
  TRANSACTIONS: '@agriconnect_transactions_v2',
  MESSAGES: '@agriconnect_messages_v1',
  CART: '@agriconnect_cart_v1',
  FAVORITES: '@agriconnect_favorites_v1',
  PROFILE: '@agriconnect_profile_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [produceList, setProduceList] = useState<Produce[]>(INITIAL_PRODUCE);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [conversationThreads, setConversationThreads] = useState<ConversationThread[]>(() => chatService.getAllThreads());
  const [currentRole, setCurrentRole] = useState<UserRole>('BUYER');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([1, 3, 5]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [communityPools, setCommunityPools] = useState<CommunityPool[]>(INITIAL_COMMUNITY_POOLS);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [navTransitionDirection, setNavTransitionDirection] = useState<'slide_from_right' | 'slide_from_left'>('slide_from_right');
  const [currentBottomTab, setCurrentBottomTab] = useState<'home' | 'services' | 'activity' | 'account'>('home');
  const [systemUsers, setSystemUsers] = useState<import('../types').SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [cropTypes, setCropTypes] = useState(INITIAL_CROP_TYPES);

  // Subscribe to real-time chat service threads
  useEffect(() => {
    const unsubscribe = chatService.subscribeToThreads((updatedThreads) => {
      setConversationThreads(updatedThreads);
    });
    return unsubscribe;
  }, []);

  const unreadMessageCount = conversationThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  const updateSystemUser = (userId: string, updates: Partial<import('../types').SystemUser>) => {
    setSystemUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
    );
    showToast('User updated successfully', 'success');
  };

  const toggleBanUser = (userId: string) => {
    setSystemUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'banned' ? 'active' : 'banned';
          showToast(newStatus === 'banned' ? `Banned user ${u.name}` : `Restored user ${u.name}`, newStatus === 'banned' ? 'warn' : 'success');
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const toggleVerifyUser = (userId: string) => {
    setSystemUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextVerified = !u.isVerified;
          showToast(nextVerified ? `Verified ${u.name}` : `Revoked verification for ${u.name}`, 'info');
          return { ...u, isVerified: nextVerified };
        }
        return u;
      })
    );
  };

  const addCropType = (newCrop: { name: string; category: ProduceCategory; basePriceKg: number; season: string }) => {
    const newEntry = {
      id: `ct-${Date.now()}`,
      name: newCrop.name.trim(),
      category: newCrop.category,
      basePriceKg: newCrop.basePriceKg,
      season: newCrop.season || 'Year-round',
      icon: 'leaf-outline',
    };
    setCropTypes(prev => [newEntry, ...prev]);
    showToast(`Added crop category: ${newEntry.name}`, 'success');
  };

  const deleteCropType = (id: string) => {
    setCropTypes(prev => prev.filter(c => c.id !== id));
    showToast('Crop category removed', 'info');
  };

  const toggleThemeMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const topUpWallet = (amount: number) => {
    setUserProfile(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
    }));
    showToast(`Added $${amount.toFixed(2)} to AgriPay Wallet`, 'success');
  };

  const releaseEscrow = async (transactionId: number) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;
    await updateOrderStatus(transactionId, 'Delivered');
    setUserProfile(prev => ({
      ...prev,
      escrowBalance: Math.max(0, prev.escrowBalance - tx.amount),
    }));
    showToast(`$${tx.amount.toFixed(2)} released from Escrow to grower`, 'success');
  };

  const joinPool = async (poolId: number, kg: number) => {
    setCommunityPools(prev =>
      prev.map(p => {
        if (p.id === poolId) {
          const newJoined = Math.min(p.targetKg, p.joinedKg + kg);
          return { ...p, joinedKg: newJoined };
        }
        return p;
      })
    );
    showToast(`Joined batch with ${kg}kg! Wholesale discount applied.`, 'success');
  };

  // Load persistent storage on initial mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [
          savedProduce,
          savedTransactions,
          savedMessages,
          savedCart,
          savedFavs,
          savedProfile,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PRODUCE),
          AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
          AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
          AsyncStorage.getItem(STORAGE_KEYS.CART),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        ]);

        if (savedProduce) {
          const parsed: Produce[] = JSON.parse(savedProduce);
          const hydrated = parsed.map(item => {
            if (!item.imageUrl) {
              const matched = INITIAL_PRODUCE.find(
                p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase()
              );
              return {
                ...item,
                imageUrl:
                  matched?.imageUrl ||
                  DEFAULT_CATEGORY_IMAGES[item.category] ||
                  DEFAULT_CATEGORY_IMAGES.Vegetables,
              };
            }
            return item;
          });
          setProduceList(hydrated);
        } else {
          setProduceList(INITIAL_PRODUCE);
        }

        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedMessages) setMessages(JSON.parse(savedMessages));
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.warn('Failed to load data from storage, using initial seed data', err);
      }
    };
    loadStoredData();
  }, []);

  const persistData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn('AsyncStorage error persisting key:', key, err);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
  };

  const clearToast = () => {
    setToast(null);
  };

  const addProduce = async (cropData: Omit<Produce, 'id'>) => {
    const nextId = produceList.length > 0 ? Math.max(...produceList.map(p => p.id)) + 1 : 1;
    const newProduce: Produce = {
      ...cropData,
      id: nextId,
      imageUrl:
        cropData.imageUrl ||
        DEFAULT_CATEGORY_IMAGES[cropData.category] ||
        DEFAULT_CATEGORY_IMAGES.Vegetables,
      middlemanPrice: cropData.middlemanPrice || cropData.price * 1.55,
      harvestDate: cropData.harvestDate || 'Harvested today',
      farmerName: cropData.farmerName || 'Mateo Gutierrez',
      farmerPhone: cropData.farmerPhone || '+1 (555) 234-7890',
      location: cropData.location || 'Green Valley, Block 4',
    };
    const updated = [newProduce, ...produceList];
    setProduceList(updated);
    await persistData(STORAGE_KEYS.PRODUCE, updated);
    showToast(`Published listing: ${newProduce.name}`, 'success');
  };

  const updateProduce = async (crop: Produce) => {
    const updated = produceList.map(item => (item.id === crop.id ? crop : item));
    setProduceList(updated);
    await persistData(STORAGE_KEYS.PRODUCE, updated);
    showToast(`Updated listing: ${crop.name}`, 'success');
  };

  const deleteProduce = async (id: number) => {
    const updated = produceList.filter(item => item.id !== id);
    setProduceList(updated);
    await persistData(STORAGE_KEYS.PRODUCE, updated);
    showToast(`Harvest listing removed`, 'info');
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    const updated = transactions.map(tx => (tx.id === id ? { ...tx, status } : tx));
    setTransactions(updated);
    await persistData(STORAGE_KEYS.TRANSACTIONS, updated);
    showToast(`Order status updated to "${status}"`, 'success');
  };

  // Cart operations
  const addToCart = (produce: Produce, quantity: number = 1) => {
    // Restriction: Users cannot purchase or place an order on their own uploaded crops
    if (
      userProfile.name &&
      produce.farmerName &&
      produce.farmerName.trim().toLowerCase() === userProfile.name.trim().toLowerCase()
    ) {
      showToast('You cannot purchase or add your own uploaded crop to cart!', 'warn');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.produce.id === produce.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(item =>
          item.produce.id === produce.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { produce, quantity }];
      }
      persistData(STORAGE_KEYS.CART, updated);
      return updated;
    });
    showToast(`Added ${produce.name} to cart`, 'success');
  };

  const removeFromCart = (produceId: number) => {
    setCart(prev => {
      const updated = prev.filter(item => item.produce.id !== produceId);
      persistData(STORAGE_KEYS.CART, updated);
      return updated;
    });
    showToast(`Item removed from cart`, 'info');
  };

  const updateCartQuantity = (produceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(produceId);
      return;
    }
    setCart(prev => {
      const updated = prev.map(item =>
        item.produce.id === produceId ? { ...item, quantity } : item
      );
      persistData(STORAGE_KEYS.CART, updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    persistData(STORAGE_KEYS.CART, []);
  };

  const checkoutCart = async (
    deliveryMethod: string,
    deliveryAddress: string,
    paymentMethod: string
  ): Promise<Transaction[]> => {
    if (cart.length === 0) return [];

    const newTxList: Transaction[] = [];
    let baseId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

    for (const item of cart) {
      const itemTotal = item.quantity * item.produce.price;
      const trackingCode = `AGRI-${Math.floor(1000 + Math.random() * 9000)}-${item.produce.category
        .substring(0, 2)
        .toUpperCase()}`;
      const handoverPin = `${Math.floor(1000 + Math.random() * 9000)}`;

      const newTx: Transaction = {
        id: baseId++,
        produceId: item.produce.id,
        produceName: item.produce.name,
        amount: parseFloat(itemTotal.toFixed(2)),
        quantityOrdered: `${item.quantity} ${item.produce.unit}`,
        buyerName: userProfile.name,
        farmerName: item.produce.farmerName,
        farmerPhone: item.produce.farmerPhone,
        deliveryMethod,
        deliveryAddress: deliveryAddress.trim() || userProfile.defaultAddress,
        paymentMethod,
        status: 'Confirmed',
        trackingCode,
        handoverPin,
        timestamp: Date.now(),
      };
      newTxList.push(newTx);
    }

    const updatedTransactions = [...newTxList, ...transactions];
    setTransactions(updatedTransactions);
    await persistData(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);

    clearCart();
    showToast(
      `Order confirmed with AgriPay Escrow! (${newTxList.length} items)`,
      'success'
    );
    return newTxList;
  };

  // Favorites
  const toggleFavorite = (produceId: number) => {
    setFavorites(prev => {
      const exists = prev.includes(produceId);
      const updated = exists ? prev.filter(id => id !== produceId) : [...prev, produceId];
      persistData(STORAGE_KEYS.FAVORITES, updated);
      showToast(exists ? 'Removed from Saved' : 'Saved to Favorites', 'info');
      return updated;
    });
  };

  const isFavorite = (produceId: number) => favorites.includes(produceId);

  // User Profile
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...profile };
      persistData(STORAGE_KEYS.PROFILE, updated);
      showToast('Profile updated successfully', 'success');
      return updated;
    });
  };

  // Single Book Produce
  const bookProduce = async (
    produce: Produce,
    quantity: number,
    deliveryMethod: string,
    deliveryAddress: string,
    paymentMethod: string
  ): Promise<Transaction> => {
    // Restriction: Users cannot purchase or place an order on their own uploaded crops
    if (
      userProfile.name &&
      produce.farmerName &&
      produce.farmerName.trim().toLowerCase() === userProfile.name.trim().toLowerCase()
    ) {
      showToast('You cannot place an order on your own crops!', 'warn');
      throw new Error('Self-orders on own crops are prohibited.');
    }

    const deliveryFee =
      deliveryMethod === 'Direct Farm Delivery'
        ? 3.0
        : deliveryMethod === 'Regional Agri-Hub'
        ? 1.5
        : 0;
    const totalCost = quantity * produce.price + deliveryFee;
    const trackingCode = `AGRI-${Math.floor(1000 + Math.random() * 9000)}-${produce.category
      .substring(0, 2)
      .toUpperCase()}`;
    const handoverPin = `${Math.floor(1000 + Math.random() * 9000)}`;

    const nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const newTx: Transaction = {
      id: nextId,
      produceId: produce.id,
      produceName: produce.name,
      amount: parseFloat(totalCost.toFixed(2)),
      quantityOrdered: `${quantity} ${produce.unit}`,
      buyerName: userProfile.name,
      farmerName: produce.farmerName,
      farmerPhone: produce.farmerPhone,
      deliveryMethod,
      deliveryAddress: deliveryAddress.trim() || userProfile.defaultAddress,
      paymentMethod,
      status: 'Confirmed',
      trackingCode,
      handoverPin,
      timestamp: Date.now(),
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);
    await persistData(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);

    showToast(`Order for ${produce.name} placed with Escrow!`, 'success');

    // Auto-generate confirmation message
    await sendMessage(
      produce.farmerName,
      produce.name,
      `Hello ${produce.farmerName}, I just booked ${quantity} ${produce.unit} of ${produce.name} for $${totalCost.toFixed(2)} (${deliveryMethod}). Tracking ID: ${trackingCode}. PIN: ${handoverPin}.`,
      'Buyer'
    );

    return newTx;
  };

  const sendMessage = async (
    farmerName: string,
    produceName: string,
    content: string,
    sender: 'Buyer' | 'Farmer' = 'Buyer',
    produceId?: number,
    offer?: import('../types').PriceOffer,
    buyerName?: string
  ) => {
    if (!content.trim() && !offer) return;
    const resolvedBuyer = buyerName || userProfile.name || 'Buyer';
    const conversationId = chatService.getConversationId(farmerName, resolvedBuyer, produceId);

    // Broadcast to real-time service
    const createdMsg = chatService.sendMessage(
      conversationId,
      farmerName,
      resolvedBuyer,
      produceName,
      content,
      sender,
      produceId,
      offer
    );

    const updated = [createdMsg, ...messages];
    setMessages(updated);
    await persistData(STORAGE_KEYS.MESSAGES, updated);
  };

  const sendOffer = async (
    produce: Produce,
    offeredPrice: number,
    quantity: number,
    note?: string
  ) => {
    const offerId = `OFFER-${Date.now()}`;
    const newOffer: import('../types').PriceOffer = {
      id: offerId,
      offeredPrice,
      originalPrice: produce.price,
      quantity,
      unit: produce.unit,
      status: 'pending',
      note,
    };

    const offerMsg = note?.trim()
      ? `[PRICE OFFER] I'd like to offer $${offeredPrice.toFixed(2)}/${produce.unit} for ${quantity} ${produce.unit}. "${note.trim()}"`
      : `[PRICE OFFER] I would like to offer $${offeredPrice.toFixed(2)}/${produce.unit} for ${quantity} ${produce.unit}.`;

    await sendMessage(
      produce.farmerName,
      produce.name,
      offerMsg,
      'Buyer',
      produce.id,
      newOffer
    );
    showToast(`Bargain offer submitted to ${produce.farmerName}!`, 'success');
  };

  const respondToOffer = async (
    messageId: number,
    action: 'accept' | 'decline' | 'counter',
    counterPrice?: number,
    conversationId?: string
  ) => {
    const targetMsg = messages.find(m => m.id === messageId);
    if (!targetMsg || !targetMsg.offer) return;

    const convId = conversationId || targetMsg.conversationId || chatService.getConversationId(targetMsg.farmerName, targetMsg.buyerName || userProfile.name || 'Buyer', targetMsg.produceId);
    chatService.respondToOffer(convId, messageId, action, counterPrice, currentRole === 'FARMER' ? 'Farmer' : 'Buyer');

    let updatedOfferStatus: import('../types').OfferStatus = 'pending';
    let replyText = '';

    if (action === 'accept') {
      updatedOfferStatus = 'accepted';
      replyText = `Accepted your offer of $${targetMsg.offer.offeredPrice.toFixed(2)}/${targetMsg.offer.unit} for ${targetMsg.offer.quantity} ${targetMsg.offer.unit}! You may now complete your order with Escrow.`;
      
      // Also inject negotiated price into cart automatically if matched produce exists
      const matchedProduce = produceList.find(p => p.id === targetMsg.produceId || p.name === targetMsg.produceName);
      if (matchedProduce) {
        const discountedProduce: Produce = {
          ...matchedProduce,
          price: targetMsg.offer.offeredPrice,
        };
        addToCart(discountedProduce, targetMsg.offer.quantity);
      }
    } else if (action === 'decline') {
      updatedOfferStatus = 'declined';
      replyText = `Thank you for your interest, but I cannot fulfill this order at $${targetMsg.offer.offeredPrice.toFixed(2)}/${targetMsg.offer.unit}. Current farm cost is $${targetMsg.offer.originalPrice.toFixed(2)}.`;
    } else if (action === 'counter' && counterPrice) {
      updatedOfferStatus = 'countered';
      replyText = `I cannot do $${targetMsg.offer.offeredPrice.toFixed(2)}, but I can offer $${counterPrice.toFixed(2)}/${targetMsg.offer.unit} for ${targetMsg.offer.quantity} ${targetMsg.offer.unit}. Does this work?`;
    }

    const updatedMessages = messages.map(m => {
      if (m.id === messageId && m.offer) {
        return {
          ...m,
          offer: {
            ...m.offer,
            status: updatedOfferStatus,
            counterPrice: counterPrice || m.offer.counterPrice,
          },
        };
      }
      return m;
    });

    const nextId = updatedMessages.length > 0 ? Math.max(...updatedMessages.map(m => m.id)) + 1 : 1;
    const responseMsg: Message = {
      id: nextId,
      farmerName: targetMsg.farmerName,
      produceName: targetMsg.produceName,
      produceId: targetMsg.produceId,
      sender: 'Farmer',
      content: replyText,
      timestamp: Date.now(),
      offer: targetMsg.offer
        ? {
            ...targetMsg.offer,
            status: updatedOfferStatus,
            counterPrice: counterPrice || targetMsg.offer.counterPrice,
          }
        : undefined,
    };

    const finalMessages = [responseMsg, ...updatedMessages];
    setMessages(finalMessages);
    await persistData(STORAGE_KEYS.MESSAGES, finalMessages);
    showToast(
      action === 'accept'
        ? 'Offer accepted & added to basket!'
        : action === 'decline'
        ? 'Offer declined'
        : `Counter-offer of $${counterPrice?.toFixed(2)} sent!`,
      action === 'accept' ? 'success' : 'info'
    );
  };

  const resetSeedData = async () => {
    setProduceList(INITIAL_PRODUCE);
    setTransactions(INITIAL_TRANSACTIONS);
    setMessages(INITIAL_MESSAGES);
    setFavorites([1, 3, 5]);
    setUserProfile(INITIAL_USER_PROFILE);
    setCart([]);
    await Promise.all([
      persistData(STORAGE_KEYS.PRODUCE, INITIAL_PRODUCE),
      persistData(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
      persistData(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES),
      persistData(STORAGE_KEYS.FAVORITES, [1, 3, 5]),
      persistData(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE),
      persistData(STORAGE_KEYS.CART, []),
    ]);
    showToast('Demo database reset to default', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        produceList,
        transactions,
        messages,
        conversationThreads,
        unreadMessageCount,
        currentRole,
        setCurrentRole,
        addProduce,
        updateProduce,
        deleteProduce,
        bookProduce,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutCart,
        favorites,
        toggleFavorite,
        isFavorite,
        updateOrderStatus,
        sendMessage,
        sendOffer,
        respondToOffer,
        toast,
        showToast,
        clearToast,
        userProfile,
        updateUserProfile,
        resetSeedData,
        communityPools,
        joinPool,
        topUpWallet,
        releaseEscrow,
        themeMode,
        toggleThemeMode,
        theme: getThemeColors(themeMode),
        navTransitionDirection,
        setNavTransitionDirection,
        currentBottomTab,
        setCurrentBottomTab,
        systemUsers,
        updateSystemUser,
        toggleBanUser,
        toggleVerifyUser,
        cropTypes,
        addCropType,
        deleteCropType,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
