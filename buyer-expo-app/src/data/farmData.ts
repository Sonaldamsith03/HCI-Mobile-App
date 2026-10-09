export interface CropItem {
  id: string;
  title: string;
  farm: string;
  farmId: string;
  badge?: string;
  verified?: boolean;
  rating: number;
  distance: string;
  stock: string;
  price: number;
  originalPrice?: number;
  unit: string;
  category: 'Veg' | 'Fruits' | 'Grains' | 'Herbs' | 'Organic' | 'Season';
  image: any;
  organic: boolean;
  harvestedToday: boolean;
  description: string;
  harvestTime?: string;
}

export interface FarmStall {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  reviews: number;
  distance: string;
  specialties: string;
  activeLots: number;
  delivery: string;
  status: 'Open' | 'Closed';
  image: any;
  farmerName: string;
  story: string;
  phone: string;
  locationName: string;
  cropsCount: number;
}

export const HERO_DEAL: CropItem = {
  id: 'sweet-bell-peppers-roma-tomatoes',
  title: 'Sweet Bell Peppers & Roma Vine Tomatoes',
  farm: "Malith's Family Farm",
  farmId: 'maliths-family-farm',
  badge: '✦ DAWN DISPATCH • 25% OFF',
  verified: true,
  rating: 4.96,
  distance: '3.4 mi',
  stock: '42 lbs batch',
  price: 200,
  originalPrice: 220,
  unit: 'lb',
  category: 'Veg',
  image: require('@/assets/images/farmby/hero_peppers_tomatoes.jpg'),
  organic: true,
  harvestedToday: true,
  harvestTime: '5:30 AM today',
  description:
    'Plucked at 5:30 AM with morning dew intact. Crisp, soil-fed, and ready for immediate kitchen delivery. Grown without synthetic pesticides under living soil practices.',
};

export const PICKED_TODAY_ITEMS: CropItem[] = [
  {
    id: 'heirloom-vine-tomatoes',
    title: 'Heirloom Vine Tomatoes',
    farm: 'Oakridge Farm',
    farmId: 'oakridge-farm',
    badge: '🕒 4h ago',
    verified: true,
    rating: 4.9,
    distance: '4.2 mi',
    stock: '35kg left',
    price: 200,
    unit: 'kg',
    category: 'Veg',
    image: require('@/assets/images/farmby/vine_tomatoes.jpg'),
    organic: true,
    harvestedToday: true,
    harvestTime: '6:00 AM today',
    description:
      'Heritage variety heirloom tomatoes ripened naturally under warm Kaluthara sunshine. Sweet, juicy, rich in lycopene with unmatched aroma.',
  },
  {
    id: 'organic-rainbow-chard',
    title: 'Organic Rainbow Chard',
    farm: 'Green Acres Eco',
    farmId: 'green-acres-eco',
    badge: '🌱 Dawn cut',
    verified: true,
    rating: 5.0,
    distance: '6.8 mi',
    stock: '18 bunches',
    price: 380,
    unit: 'bch',
    category: 'Herbs',
    image: require('@/assets/images/farmby/rainbow_chard.jpg'),
    organic: true,
    harvestedToday: true,
    harvestTime: '5:15 AM today',
    description:
      'Vivid multicolored crisp stalks and deep green mineral-dense leaves. Hand-harvested at dawn to preserve freshness and peak cellular hydration.',
  },
];

export const REGIONAL_STALLS: FarmStall[] = [
  {
    id: 'meadowview-homestead',
    name: 'Meadowview Homestead',
    verified: true,
    rating: 4.9,
    reviews: 128,
    distance: '3.1 mi away',
    specialties: 'Artisanal Strawberries, Baby Vegetables, Raw Wild Honey',
    activeLots: 12,
    delivery: 'Pickup or Direct Delivery',
    status: 'Open',
    image: require('@/assets/images/farmby/farm_family.jpg'),
    farmerName: 'Saman & Niluka Perera',
    story:
      'Third-generation regenerative farm family dedicated to pesticide-free soil and morning-picked produce. Every basket helps preserve regional agricultural heritage.',
    phone: '+94 77 123 4567',
    locationName: 'Plot 4, Green Valley Road, Kaluthara',
    cropsCount: 12,
  },
  {
    id: 'oakridge-farm',
    name: 'Oakridge Farm',
    verified: true,
    rating: 4.9,
    reviews: 94,
    distance: '4.2 mi away',
    specialties: 'Heirloom Vine Crops, Crisp Bell Peppers, French Green Beans',
    activeLots: 8,
    delivery: 'Pickup & Direct Dispatch',
    status: 'Open',
    image: require('@/assets/images/farmby/vine_tomatoes.jpg'),
    farmerName: 'Rohan Jayasinghe',
    story:
      'Specializing in heritage open-pollinated seed varieties grown in compost-enriched volcanic clay soil.',
    phone: '+94 71 890 1234',
    locationName: 'Oakridge Slope, Kaluthara North',
    cropsCount: 8,
  },
  {
    id: 'green-acres-eco',
    name: 'Green Acres Eco',
    verified: true,
    rating: 5.0,
    reviews: 152,
    distance: '6.8 mi away',
    specialties: 'Organic Leafy Greens, Rainbow Chard, Fresh Culinary Herbs',
    activeLots: 15,
    delivery: 'Same-day Direct Courier',
    status: 'Open',
    image: require('@/assets/images/farmby/rainbow_chard.jpg'),
    farmerName: 'Kumari Silva',
    story:
      'Certified 100% chemical-free agro-forest farming that captures carbon while supplying top restaurants and homes with nutrient-rich crops.',
    phone: '+94 76 543 2198',
    locationName: 'Valley Basin, Kaluthara Riverbend',
    cropsCount: 15,
  },
];

export const RECOMMENDED_ITEMS: CropItem[] = [
  {
    id: 'crisp-honeycrisp-apples',
    title: 'Crisp Honeycrisp Apples',
    farm: 'Valley Orchard',
    farmId: 'valley-orchard',
    distance: '5.4 mi',
    stock: '80 lbs left',
    price: 90,
    unit: 'lb',
    category: 'Fruits',
    image: require('@/assets/images/farmby/honeycrisp_apples.jpg'),
    organic: true,
    harvestedToday: false,
    rating: 4.8,
    description:
      'No synthetic waxes, hand-sorted tree-ripened crop with extraordinary snap and sweet tart balance. Directly harvested from hillside orchards.',
  },
  {
    id: 'sweet-corn-cobs',
    title: 'Sweet Corn Cobs (Silver Queen)',
    farm: 'Sunrise Fields',
    farmId: 'sunrise-fields',
    badge: 'Freshly cut',
    distance: '2.8 mi',
    stock: '120 ears',
    price: 75,
    unit: 'ear',
    category: 'Veg',
    image: require('@/assets/images/farmby/sweet_corn_cobs.jpg'),
    organic: false,
    harvestedToday: true,
    harvestTime: 'Dawn cut',
    rating: 4.9,
    description:
      'Tender milky kernels harvested at dawn before sugars convert to starch. Sweet, buttery, and bursting with freshness.',
  },
];

export const ALL_CROPS: CropItem[] = [
  HERO_DEAL,
  ...PICKED_TODAY_ITEMS,
  ...RECOMMENDED_ITEMS,
  {
    id: 'artisanal-strawberries',
    title: 'Artisanal Mountain Strawberries',
    farm: 'Meadowview Homestead',
    farmId: 'meadowview-homestead',
    badge: '🌱 Dawn cut',
    verified: true,
    rating: 5.0,
    distance: '3.1 mi',
    stock: '25 punnets',
    price: 450,
    unit: 'punnet',
    category: 'Fruits',
    image: require('@/assets/images/farmby/farm_family.jpg'),
    organic: true,
    harvestedToday: true,
    description: 'Fragrant, naturally sun-ripened strawberries bursting with intense floral sweetness.',
  },
  {
    id: 'wild-raw-honey',
    title: 'Raw Multi-Flora Forest Honey',
    farm: 'Meadowview Homestead',
    farmId: 'meadowview-homestead',
    badge: 'Pure 100%',
    verified: true,
    rating: 4.95,
    distance: '3.1 mi',
    stock: '14 jars',
    price: 850,
    unit: '500g',
    category: 'Organic',
    image: require('@/assets/images/farmby/farm_family.jpg'),
    organic: true,
    harvestedToday: false,
    description: 'Cold-extracted raw honey from wild forest blossoms. Never heated or micro-filtered.',
  },
];

export const CATEGORIES = [
  { id: 'Veg', name: 'Veg', icon: 'leaf-outline', color: '#166534', bg: '#E8F5E9', border: '#C8E6C9' },
  { id: 'Fruits', name: 'Fruits', icon: 'nutrition-outline', color: '#E65100', bg: '#FFF3E0', border: '#FFE0B2' },
  { id: 'Grains', name: 'Grains', icon: 'grid-outline', color: '#5E35B1', bg: '#EDE7F6', border: '#D1C4E9' },
  { id: 'Herbs', name: 'Herbs', icon: 'flower-outline', color: '#00695C', bg: '#E0F2F1', border: '#B2DFDB' },
  { id: 'Organic', name: 'Organic', icon: 'shield-checkmark-outline', color: '#1B5E20', bg: '#E8F8F0', border: '#A7F3D0' },
  { id: 'Season', name: 'Season', icon: 'sunny-outline', color: '#F57F17', bg: '#FFF8E1', border: '#FFECB3' },
] as const;

export const QUICK_FILTERS = [
  { id: 'all', label: 'All Produce', icon: null },
  { id: 'organic', label: '100% Organic', icon: 'leaf-outline' },
  { id: 'today', label: 'Harvested Today', icon: 'flash-outline' },
  { id: 'direct', label: 'Direct Farm', icon: 'storefront-outline' },
  { id: 'cold', label: 'Cold Chain', icon: 'snow-outline' },
];

export const INITIAL_USER = {
  name: 'Heshani',
  location: 'Kaluthara',
  regionFilter: 'Green Valley • Within 15 miles',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  co2SavedKg: 14.2,
  regionalPlotsCount: 18,
  activeCartCount: 0,
  unreadMessagesCount: 2,
};
