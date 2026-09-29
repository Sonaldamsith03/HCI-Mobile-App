export type ProduceCategory = 
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Tubers'
  | 'Honey & Dairy';

export interface Produce {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  imageUrl?: string;
  category: ProduceCategory;
  harvestDate: string;
  middlemanPrice: number;
  description: string;
  isOrganic: boolean;
}

export type OrderStatus = 'Confirmed' | 'Packed at Farm' | 'In Transit' | 'Delivered';

export interface Transaction {
  id: number;
  produceId: number;
  produceName: string;
  amount: number;
  quantityOrdered: string;
  buyerName: string;
  farmerName: string;
  farmerPhone: string;
  deliveryMethod: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: OrderStatus;
  trackingCode: string;
  handoverPin?: string;
  timestamp: number;
}

export interface CartItem {
  produce: Produce;
  quantity: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  defaultAddress: string;
  escrowBalance: number;
  walletBalance: number;
  savedAddresses: string[];
  avatarUrl?: string;
  role?: UserRole;
  isLoggedIn?: boolean;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'banned' | 'pending';
  isVerified: boolean;
  phone?: string;
  joinedDate: string;
  lastLogin: string;
  walletBalance?: number;
  avatarUrl?: string;
}

export interface ToastState {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'warn';
}

export type SortOption = 'featured' | 'price_low' | 'savings' | 'freshness';

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';

export interface PriceOffer {
  id: string;
  offeredPrice: number;
  originalPrice: number;
  quantity: number;
  unit: string;
  status: OfferStatus;
  counterPrice?: number;
  note?: string;
  proposedBy?: 'Buyer' | 'Farmer';
}

export interface Message {
  id: number;
  conversationId?: string;
  farmerName: string;
  buyerName?: string;
  produceName: string;
  produceId?: number;
  sender: 'Buyer' | 'Farmer';
  content: string;
  timestamp: number;
  offer?: PriceOffer;
  status?: 'sent' | 'delivered' | 'read';
  imageAttachment?: string;
}

export interface ConversationThread {
  id: string; // e.g. farmer_buyer_produceId
  farmerName: string;
  buyerName: string;
  produceId?: number;
  produceName: string;
  produceImage?: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  activeOffer?: PriceOffer;
}

export type UserRole = 'FARMER' | 'BUYER' | 'COURIER' | 'ADMIN' | 'OTHER';

export interface CommunityPool {
  id: number;
  title: string;
  produceName: string;
  farmerName: string;
  location: string;
  imageUrl: string;
  targetKg: number;
  joinedKg: number;
  pricePerKg: number;
  retailPrice: number;
  dispatchTimeRemaining: string;
  pickupHub: string;
}

export type RootStackParamList = {
  MainTabs: { tab?: 'home' | 'services' | 'activity' | 'account' } | undefined;
  Landing: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  FarmerDashboard: undefined;
  BuyerDashboard: { initialTab?: 'marketplace' | 'saved' | 'cart' | 'orders' | 'profile' } | undefined;
  LogisticsDashboard: undefined;
  AdminDashboard: undefined;
  ProductDetail: { produceId: number };
  ChatConversation: {
    conversationId?: string;
    farmerName: string;
    buyerName?: string;
    produceName?: string;
    produceId?: number;
    initialMessage?: string;
  };
};
