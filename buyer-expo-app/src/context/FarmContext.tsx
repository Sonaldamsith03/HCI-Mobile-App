import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CropItem } from '@/data/farmData';

export interface CartItem {
  crop: CropItem;
  quantity: number;
}

export interface FarmOffer {
  id: string;
  cropId: string;
  cropTitle: string;
  farmName: string;
  originalPrice: number;
  offeredPrice: number;
  quantity: number;
  unit: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  date: string;
}

export interface FarmerBid {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerAvatar: string;
  offeredPrice: string;
  availableDate: string;
  message: string;
}

export interface BuyerRequirement {
  id: string;
  buyerName: string;
  buyerType?: string;
  produce: string;
  emoji: string;
  imageUrl?: string;
  quantity: string;
  requiredBy: string;
  preferredPrice: string;
  location: string;
  organicPreferred: boolean;
  notes?: string;
  createdAt: string;
  status: 'Active' | 'Fulfilled';
  bids: FarmerBid[];
}

interface FarmContextType {
  cart: CartItem[];
  addToCart: (crop: CropItem, quantity?: number) => void;
  removeFromCart: (cropId: string) => void;
  updateCartQuantity: (cropId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  favorites: Record<string, boolean>;
  toggleFavorite: (cropId: string) => void;
  isFavorite: (cropId: string) => boolean;

  location: string;
  setLocation: (loc: string) => void;
  radiusText: string;
  setRadiusText: (radius: string) => void;

  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;

  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  offers: FarmOffer[];
  submitOffer: (offer: Omit<FarmOffer, 'id' | 'status' | 'date'>) => void;

  buyerRequirements: BuyerRequirement[];
  addBuyerRequirement: (req: Omit<BuyerRequirement, 'id' | 'createdAt' | 'status' | 'bids'>) => void;
  updateBuyerRequirement: (id: string, updated: Partial<BuyerRequirement>) => void;
  deleteBuyerRequirement: (id: string) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [location, setLocation] = useState('Kaluthara');
  const [radiusText, setRadiusText] = useState('Green Valley • Within 15 miles');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [buyerRequirements, setBuyerRequirements] = useState<BuyerRequirement[]>([
    {
      id: 'req-1',
      buyerName: 'A restaurant needs:',
      buyerType: 'Restaurant Buyer',
      produce: 'tomatoes',
      emoji: '🍅',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
      quantity: '100 kg',
      requiredBy: 'Friday',
      preferredPrice: 'Rs. 400–450/kg',
      location: 'Colombo',
      organicPreferred: true,
      notes: 'Crisp, vine-ripened tomatoes for restaurant salads and sauce bases.',
      createdAt: '2 hours ago',
      status: 'Active',
      bids: [
        {
          id: 'bid-1',
          farmerId: 'maliths-family-farm',
          farmerName: "Malith's Farm",
          farmerAvatar: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80',
          offeredPrice: 'Rs. 420/kg',
          availableDate: 'Ready Thursday dawn',
          message: 'We have 150 kg prime Roma vine tomatoes ready for dawn harvest on Thursday. Can deliver directly to Colombo.',
        },
        {
          id: 'bid-2',
          farmerId: 'meadowview-farm',
          farmerName: 'Meadowview Homestead',
          farmerAvatar: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=200&q=80',
          offeredPrice: 'Rs. 440/kg',
          availableDate: 'Ready Friday 6 AM',
          message: '100% certified organic soil-ripened tomatoes available. Can supply full 100 kg batch.',
        },
      ],
    },
  ]);
  const [offers, setOffers] = useState<FarmOffer[]>([
    {
      id: 'offer-1',
      cropId: 'heirloom-vine-tomatoes',
      cropTitle: 'Heirloom Vine Tomatoes',
      farmName: 'Oakridge Farm',
      originalPrice: 200,
      offeredPrice: 175,
      quantity: 10,
      unit: 'kg',
      status: 'Pending',
      date: 'Today at 7:15 AM',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const addToCart = (crop: CropItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.crop.id === crop.id);
      if (existing) {
        return prev.map((item) =>
          item.crop.id === crop.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { crop, quantity }];
    });
    showToast(`Added ${quantity} ${crop.unit} ${crop.title} to basket!`);
  };

  const removeFromCart = (cropId: string) => {
    setCart((prev) => prev.filter((item) => item.crop.id !== cropId));
  };

  const updateCartQuantity = (cropId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cropId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.crop.id === cropId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.crop.price * item.quantity, 0);

  const toggleFavorite = (cropId: string) => {
    setFavorites((prev) => {
      const next = !prev[cropId];
      showToast(next ? 'Saved to your farm favorites ❤️' : 'Removed from favorites');
      return { ...prev, [cropId]: next };
    });
  };

  const isFavorite = (cropId: string) => !!favorites[cropId];

  const submitOffer = (newOffer: Omit<FarmOffer, 'id' | 'status' | 'date'>) => {
    const offer: FarmOffer = {
      ...newOffer,
      id: `offer-${Date.now()}`,
      status: 'Pending',
      date: 'Just now',
    };
    setOffers((prev) => [offer, ...prev]);
    showToast(`Offer of RS. ${offer.offeredPrice}/${offer.unit} sent to ${offer.farmName}!`);
  };

  const addBuyerRequirement = (newReq: Omit<BuyerRequirement, 'id' | 'createdAt' | 'status' | 'bids'>) => {
    const requirement: BuyerRequirement = {
      ...newReq,
      id: `req-${Date.now()}`,
      status: 'Active',
      createdAt: 'Just now',
      bids: [
        {
          id: `bid-${Date.now()}-1`,
          farmerId: 'maliths-family-farm',
          farmerName: "Malith's Farm",
          farmerAvatar: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&q=80',
          offeredPrice: newReq.preferredPrice.split('–')[0] || newReq.preferredPrice,
          availableDate: `Ready by ${newReq.requiredBy}`,
          message: `Ayubowan! We can harvest and supply your requested batch of ${newReq.quantity} ${newReq.produce}. Direct delivery available.`,
        },
      ],
    };
    setBuyerRequirements((prev) => [requirement, ...prev]);
    showToast(`Requirement for ${newReq.quantity} ${newReq.produce} posted to local farmers! 🎉`);
  };

  const updateBuyerRequirement = (id: string, updated: Partial<BuyerRequirement>) => {
    setBuyerRequirements((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updated } : req))
    );
    showToast('Your requirement post has been updated!');
  };

  const deleteBuyerRequirement = (id: string) => {
    setBuyerRequirements((prev) => prev.filter((req) => req.id !== id));
    showToast('Requirement post removed');
  };

  return (
    <FarmContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        favorites,
        toggleFavorite,
        isFavorite,
        location,
        setLocation,
        radiusText,
        setRadiusText,
        selectedCategory,
        setSelectedCategory,
        selectedFilter,
        setSelectedFilter,
        searchQuery,
        setSearchQuery,
        offers,
        submitOffer,
        buyerRequirements,
        addBuyerRequirement,
        updateBuyerRequirement,
        deleteBuyerRequirement,
        toastMessage,
        showToast,
      }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
