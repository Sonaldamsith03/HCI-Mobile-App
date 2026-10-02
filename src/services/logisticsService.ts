import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Driver,
  Vehicle,
  Delivery,
  DeliveryStatus,
  LogisticsNotification,
  DriverEarningsSummary,
  DriverTripEarningsRecord,
  VehicleType,
  DeliveryProof,
  ProblemReport,
} from '../types/logistics';
import { calculateDeliveryQuote, recommendVehicleForCargo } from './pricingService';
import { supabaseService } from './supabaseService';

const STORAGE_KEYS = {
  DRIVERS: '@agriconnect_drivers_v1',
  CURRENT_DRIVER_ID: '@agriconnect_current_driver_id_v1',
  DELIVERIES: '@agriconnect_deliveries_v1',
  NOTIFICATIONS: '@agriconnect_logistics_notifications_v1',
  DRIVER_EARNINGS: '@agriconnect_driver_earnings_v1',
};

// Seed Vehicle 1: Small Truck
const VEHICLE_KASUN: Vehicle = {
  id: 'veh-1',
  driverId: 'drv-kasun',
  type: 'Small truck',
  model: 'Isuzu D-Max Cargo',
  registrationNumber: 'WP CAB-1234',
  capacityKg: 1500,
  capacityLabel: '1.5 Tons',
  photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  documentsVerified: true,
  licenseNumber: 'B-7890123',
};

// Seed Vehicle 2: Chilled Van
const VEHICLE_DAVID: Vehicle = {
  id: 'veh-2',
  driverId: 'drv-david',
  type: 'Van',
  model: 'Toyota HiAce Cold-Chain Pro',
  registrationNumber: 'WP EV-409',
  capacityKg: 600,
  capacityLabel: '600 kg (Chilled)',
  photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  documentsVerified: true,
  licenseNumber: 'B-3456789',
};

// Seed Vehicle 3: Three Wheeler
const VEHICLE_NUWAN: Vehicle = {
  id: 'veh-3',
  driverId: 'drv-nuwan',
  type: 'Three-wheeler',
  model: 'Bajaj RE High-Deck',
  registrationNumber: 'WP AA-5678',
  capacityKg: 150,
  capacityLabel: '150 kg',
  photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
  documentsVerified: true,
  licenseNumber: 'A-1234567',
};

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-kasun',
    name: 'Kasun Perera',
    phone: '+94 77 123 4567',
    email: 'kasun.logistics@agrifleet.lk',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    verificationStatus: 'active',
    availabilityStatus: 'ONLINE',
    rating: 4.9,
    totalTrips: 168,
    completedTrips: 164,
    vehicle: VEHICLE_KASUN,
    operatingArea: 'Western Province (Colombo & Gampaha)',
    deliveryRadiusKm: 35,
    preferredHours: '6:00 AM - 6:00 PM',
    joinedDate: 'Jan 2025',
    walletBalance: 24500,
    todayEarnings: 8500,
    todayTrips: 3,
  },
  {
    id: 'drv-david',
    name: 'David Silva',
    phone: '+94 71 890 1234',
    email: 'david.courier@agrifleet.lk',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    verificationStatus: 'active',
    availabilityStatus: 'ONLINE',
    rating: 4.8,
    totalTrips: 112,
    completedTrips: 110,
    vehicle: VEHICLE_DAVID,
    operatingArea: 'Kandy & Central Mountain Ridge',
    deliveryRadiusKm: 40,
    preferredHours: '5:00 AM - 7:00 PM',
    joinedDate: 'Mar 2025',
    walletBalance: 18200,
    todayEarnings: 6200,
    todayTrips: 2,
  },
  {
    id: 'drv-nuwan',
    name: 'Nuwan Fernando',
    phone: '+94 76 345 6789',
    email: 'nuwan.delivery@agrifleet.lk',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    verificationStatus: 'active',
    availabilityStatus: 'ONLINE',
    rating: 4.7,
    totalTrips: 84,
    completedTrips: 82,
    vehicle: VEHICLE_NUWAN,
    operatingArea: 'Negombo & Coastal Road',
    deliveryRadiusKm: 20,
    preferredHours: '7:00 AM - 8:00 PM',
    joinedDate: 'May 2025',
    walletBalance: 12400,
    todayEarnings: 3800,
    todayTrips: 1,
  },
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'DLV-10284',
    orderId: 1,
    trackingCode: 'AGRI-9281-GR',
    handoverPin: '7824',
    farmerId: 'usr-2',
    farmerName: 'Mateo Gutierrez',
    farmerPhone: '+1 (555) 234-7890',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    buyerId: 'usr-1',
    buyerName: 'Elena Rostova',
    buyerPhone: '+1 (555) 782-9012',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    pickup: {
      address: 'Green Valley Farm, Block 4, Negombo Road',
      label: 'Mateo Organic Greenhouse',
      contactName: 'Mateo Gutierrez',
      contactPhone: '+1 (555) 234-7890',
      lat: 7.208,
      lng: 79.838,
      instructions: 'Gate 2 near solar greenhouse. Loading ramp available.',
    },
    dropoff: {
      address: 'Central Delivery Hub #4B, Market Street, Colombo',
      label: 'Elena Green Grocers Central',
      contactName: 'Elena Rostova',
      contactPhone: '+1 (555) 782-9012',
      lat: 6.927,
      lng: 79.861,
      instructions: 'Deliver to rear receiving bay. Check 4-digit PIN with manager.',
    },
    goods: {
      produceId: 1,
      name: 'Organic Roma Tomatoes',
      category: 'Vegetables',
      quantity: '250 kg',
      unit: 'kg',
      packageCount: 12,
      weightKg: 250,
      specialHandling: 'Cold-chain 6°C recommended; avoid stacking > 4 crates high',
      notes: 'Harvested early dawn. High grade culinary standard.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    },
    vehicleRequired: 'Small truck',
    distanceKm: 22.4,
    estimatedMinutes: 45,
    customerDeliveryFee: 3200,
    driverEarnings: 2624,
    platformFee: 576,
    status: 'In Transit',
    requestedAt: Date.now() - 3600000 * 2.5,
    acceptedAt: Date.now() - 3600000 * 2,
    pickupArrivedAt: Date.now() - 3600000 * 1.5,
    goodsCollectedAt: Date.now() - 3600000 * 1,
    assignedDriverId: 'drv-kasun',
    assignedDriver: INITIAL_DRIVERS[0],
    pickupProof: {
      timestamp: Date.now() - 3600000 * 1,
      packageCountVerified: 12,
      condition: 'Pristine',
      notes: 'Inspected 12 crates, all firm and sealed with tamper sticker.',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    },
    statusHistory: [
      { status: 'Delivery Requested', timestamp: Date.now() - 3600000 * 2.5, actor: 'Buyer (Elena Rostova)', notes: 'Ordered with AgriPay Escrow' },
      { status: 'Searching for Driver', timestamp: Date.now() - 3600000 * 2.4, actor: 'System Matcher', notes: 'Broadcasted to eligible trucks in Negombo' },
      { status: 'Driver Assigned', timestamp: Date.now() - 3600000 * 2.0, actor: 'Driver (Kasun Perera)', notes: 'Accepted delivery request' },
      { status: 'Driver En Route to Pickup', timestamp: Date.now() - 3600000 * 1.8, actor: 'Driver (Kasun Perera)', notes: 'Navigating to Green Valley Farm' },
      { status: 'Arrived at Pickup', timestamp: Date.now() - 3600000 * 1.5, actor: 'Driver (Kasun Perera)', notes: 'Arrived at Gate 2' },
      { status: 'Goods Collected', timestamp: Date.now() - 3600000 * 1.0, actor: 'Driver (Kasun Perera)', notes: 'Verified 12 crates pristine condition' },
      { status: 'In Transit', timestamp: Date.now() - 3600000 * 0.9, actor: 'Driver (Kasun Perera)', notes: 'Traveling via Expressway toward Colombo' },
    ],
  },
  {
    id: 'DLV-10285',
    orderId: 2,
    trackingCode: 'AGRI-4819-FR',
    handoverPin: '4192',
    farmerId: 'usr-3',
    farmerName: 'Sarah Jenkins',
    farmerPhone: '+1 (555) 345-6789',
    farmerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    buyerId: 'usr-1',
    buyerName: 'Elena Rostova',
    buyerPhone: '+1 (555) 782-9012',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    pickup: {
      address: 'Rolling Hills Orchard, Kandy Road',
      label: 'Sarah Jenkins Orchard Gate',
      contactName: 'Sarah Jenkins',
      contactPhone: '+1 (555) 345-6789',
      lat: 7.290,
      lng: 80.633,
      instructions: 'Follow signs to farm office. Ready for prompt loading.',
    },
    dropoff: {
      address: 'Central Market Stall #14, Colombo 03',
      label: 'Sunrise Produce Depot',
      contactName: 'Elena Rostova',
      contactPhone: '+1 (555) 782-9012',
      lat: 6.902,
      lng: 79.858,
      instructions: 'Deliver between 3 PM and 6 PM. Check handover code.',
    },
    goods: {
      produceId: 3,
      name: 'Crisp Fuji Apples',
      category: 'Fruits',
      quantity: '85 kg',
      unit: 'kg',
      packageCount: 6,
      weightKg: 85,
      specialHandling: 'Padded crates. Keep dry and away from direct sunlight.',
      notes: 'Hand-graded quality fruit.',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    },
    vehicleRequired: 'Van',
    distanceKm: 18.0,
    estimatedMinutes: 38,
    customerDeliveryFee: 2600,
    driverEarnings: 2132,
    platformFee: 468,
    status: 'Searching for Driver',
    requestedAt: Date.now() - 3600000 * 0.4,
    statusHistory: [
      { status: 'Delivery Requested', timestamp: Date.now() - 3600000 * 0.4, actor: 'Buyer (Elena Rostova)', notes: 'Delivery requested at checkout' },
      { status: 'Searching for Driver', timestamp: Date.now() - 3600000 * 0.35, actor: 'System Matcher', notes: 'Searching active drivers with Van/Truck' },
    ],
  },
  {
    id: 'DLV-10280',
    orderId: 99,
    trackingCode: 'AGRI-3321-TB',
    handoverPin: '9041',
    farmerId: 'usr-2',
    farmerName: 'Mateo Gutierrez',
    farmerPhone: '+1 (555) 234-7890',
    buyerId: 'usr-1',
    buyerName: 'Elena Rostova',
    buyerPhone: '+1 (555) 782-9012',
    pickup: {
      address: 'Green Valley Farm Gate, Negombo',
      label: 'Mateo Farm',
      contactName: 'Mateo Gutierrez',
      contactPhone: '+1 (555) 234-7890',
      lat: 7.208,
      lng: 79.838,
    },
    dropoff: {
      address: 'Main Street Grocery, Colombo',
      label: 'Elena Grocery',
      contactName: 'Elena Rostova',
      contactPhone: '+1 (555) 782-9012',
      lat: 6.927,
      lng: 79.861,
    },
    goods: {
      name: 'Yukon Gold Potatoes',
      category: 'Tubers',
      quantity: '200 kg',
      unit: 'kg',
      packageCount: 10,
      weightKg: 200,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    },
    vehicleRequired: 'Small truck',
    distanceKm: 24.0,
    estimatedMinutes: 48,
    customerDeliveryFee: 3500,
    driverEarnings: 2870,
    platformFee: 630,
    status: 'Delivery Completed',
    requestedAt: Date.now() - 86400000 * 1.5,
    acceptedAt: Date.now() - 86400000 * 1.4,
    pickupArrivedAt: Date.now() - 86400000 * 1.2,
    goodsCollectedAt: Date.now() - 86400000 * 1.1,
    dropoffArrivedAt: Date.now() - 86400000 * 0.9,
    deliveredAt: Date.now() - 86400000 * 0.8,
    assignedDriverId: 'drv-kasun',
    assignedDriver: INITIAL_DRIVERS[0],
    deliveryProof: {
      timestamp: Date.now() - 86400000 * 0.8,
      handoverPinVerified: true,
      signatureName: 'Elena Rostova',
      notes: 'Goods received in excellent condition.',
    },
    statusHistory: [
      { status: 'Delivery Requested', timestamp: Date.now() - 86400000 * 1.5, actor: 'Buyer' },
      { status: 'Driver Assigned', timestamp: Date.now() - 86400000 * 1.4, actor: 'Kasun Perera' },
      { status: 'Goods Collected', timestamp: Date.now() - 86400000 * 1.1, actor: 'Kasun Perera' },
      { status: 'In Transit', timestamp: Date.now() - 86400000 * 1.0, actor: 'Kasun Perera' },
      { status: 'Delivery Completed', timestamp: Date.now() - 86400000 * 0.8, actor: 'Kasun Perera', notes: 'Handover PIN 9041 verified' },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: LogisticsNotification[] = [
  {
    id: 'notif-1',
    driverId: 'drv-kasun',
    recipientRole: 'DRIVER',
    type: 'new_request',
    title: 'New Delivery Request Nearby 🚚',
    message: 'Sarah Jenkins requested transport for 85 kg Fuji Apples (18 km, LKR 2,600).',
    deliveryId: 'DLV-10285',
    timestamp: Date.now() - 3600000 * 0.4,
    isRead: false,
  },
  {
    id: 'notif-2',
    driverId: 'drv-kasun',
    recipientRole: 'DRIVER',
    type: 'goods_collected',
    title: 'Pickup Confirmed: DLV-10284',
    message: 'You have confirmed collection of 250 kg Roma Tomatoes from Mateo Gutierrez.',
    deliveryId: 'DLV-10284',
    timestamp: Date.now() - 3600000 * 1,
    isRead: true,
  },
  {
    id: 'notif-3',
    driverId: 'drv-kasun',
    recipientRole: 'DRIVER',
    type: 'earnings',
    title: 'Earnings Credited: LKR 2,870 💰',
    message: 'Payout for DLV-10280 (Yukon Gold Potatoes) credited to your AgriPay wallet.',
    timestamp: Date.now() - 86400000 * 0.8,
    isRead: true,
  },
];

type DeliveryListener = (deliveries: Delivery[]) => void;
type DriverListener = (driver: Driver | null) => void;
type NotificationListener = (notifications: LogisticsNotification[]) => void;
type RequestAlertListener = (request: Delivery) => void;

class LogisticsService {
  private drivers: Driver[] = INITIAL_DRIVERS;
  private currentDriverId: string = 'drv-kasun';
  private deliveries: Delivery[] = INITIAL_DELIVERIES;
  private notifications: LogisticsNotification[] = INITIAL_NOTIFICATIONS;

  private deliveryListeners: Set<DeliveryListener> = new Set();
  private driverListeners: Set<DriverListener> = new Set();
  private notificationListeners: Set<NotificationListener> = new Set();
  private requestAlertListeners: Set<RequestAlertListener> = new Set();

  constructor() {
    this.loadFromStorage();
    if (supabaseService.isConfigured()) {
      supabaseService.subscribeToDeliveries(async () => {
        const remote = await supabaseService.fetchDeliveries();
        if (remote && remote.length > 0) {
          this.deliveries = remote;
          const list = [...this.deliveries];
          this.deliveryListeners.forEach(fn => fn(list));
        }
      });
    }
  }

  private async loadFromStorage() {
    try {
      const [savedDrivers, savedCurrentId, savedDeliveries, savedNotifs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DRIVERS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_DRIVER_ID),
        AsyncStorage.getItem(STORAGE_KEYS.DELIVERIES),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
      ]);

      if (savedDrivers) this.drivers = JSON.parse(savedDrivers);
      if (savedCurrentId) this.currentDriverId = savedCurrentId;
      if (savedDeliveries) this.deliveries = JSON.parse(savedDeliveries);
      if (savedNotifs) this.notifications = JSON.parse(savedNotifs);

      // Cloud Sync: Fetch live deliveries from Supabase if configured
      if (supabaseService.isConfigured()) {
        const remoteDeliveries = await supabaseService.fetchDeliveries();
        if (remoteDeliveries && remoteDeliveries.length > 0) {
          this.deliveries = remoteDeliveries;
        }
      }

      this.notifyDeliveryListeners();
      this.notifyDriverListeners();
      this.notifyNotificationListeners();
    } catch (err) {
      console.warn('Error loading logistics data from storage:', err);
    }
  }

  private async persist(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`Error persisting logistics key ${key}:`, err);
    }
  }

  // ── Subscriptions ──────────────────────────────────────────────────────────
  public subscribeToDeliveries(listener: DeliveryListener): () => void {
    this.deliveryListeners.add(listener);
    listener([...this.deliveries]);
    return () => this.deliveryListeners.delete(listener);
  }

  public subscribeToCurrentDriver(listener: DriverListener): () => void {
    this.driverListeners.add(listener);
    listener(this.getCurrentDriver());
    return () => this.driverListeners.delete(listener);
  }

  public subscribeToNotifications(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    listener([...this.notifications]);
    return () => this.notificationListeners.delete(listener);
  }

  public subscribeToIncomingRequestAlert(listener: RequestAlertListener): () => void {
    this.requestAlertListeners.add(listener);
    return () => this.requestAlertListeners.delete(listener);
  }

  private notifyDeliveryListeners(changedDelivery?: Delivery) {
    const list = [...this.deliveries];
    this.deliveryListeners.forEach(fn => fn(list));
    this.persist(STORAGE_KEYS.DELIVERIES, list);

    // Sync changed delivery directly to Supabase cloud
    if (changedDelivery && supabaseService.isConfigured()) {
      supabaseService.upsertDelivery(changedDelivery).catch(err => {
        console.warn('Supabase delivery upsert error:', err);
      });
    }
  }

  private notifyDriverListeners() {
    const driver = this.getCurrentDriver();
    this.driverListeners.forEach(fn => fn(driver));
    this.persist(STORAGE_KEYS.DRIVERS, this.drivers);
    this.persist(STORAGE_KEYS.CURRENT_DRIVER_ID, this.currentDriverId);
  }

  private notifyNotificationListeners() {
    const list = [...this.notifications];
    this.notificationListeners.forEach(fn => fn(list));
    this.persist(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // ── Driver Management ──────────────────────────────────────────────────────
  public getCurrentDriver(): Driver | null {
    return this.drivers.find(d => d.id === this.currentDriverId) || this.drivers[0] || null;
  }

  public getAllDrivers(): Driver[] {
    return [...this.drivers];
  }

  public switchDriver(driverId: string) {
    this.currentDriverId = driverId;
    this.notifyDriverListeners();
  }

  public async loginDriver(emailOrPhone: string): Promise<Driver | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const found = this.drivers.find(
      d => d.email.toLowerCase() === clean || d.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '')
    );
    if (found) {
      this.currentDriverId = found.id;
      this.notifyDriverListeners();
      return found;
    }
    // Fallback: pick first driver or create one
    if (this.drivers.length > 0) {
      this.currentDriverId = this.drivers[0].id;
      this.notifyDriverListeners();
      return this.drivers[0];
    }
    return null;
  }

  public async registerDriver(data: {
    name: string;
    phone: string;
    email: string;
    operatingArea: string;
    deliveryRadiusKm: number;
    preferredHours: string;
    vehicleType: VehicleType;
    vehicleModel: string;
    registrationNumber: string;
    capacityKg: number;
    licenseNumber?: string;
  }): Promise<Driver> {
    const driverId = `drv-${Date.now()}`;
    const vehicleId = `veh-${Date.now()}`;

    const newVehicle: Vehicle = {
      id: vehicleId,
      driverId,
      type: data.vehicleType,
      model: data.vehicleModel,
      registrationNumber: data.registrationNumber.toUpperCase(),
      capacityKg: data.capacityKg,
      capacityLabel: `${data.capacityKg} kg`,
      documentsVerified: true,
      licenseNumber: data.licenseNumber || 'PENDING-REG',
    };

    const newDriver: Driver = {
      id: driverId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      verificationStatus: 'active',
      availabilityStatus: 'ONLINE',
      rating: 5.0,
      totalTrips: 0,
      completedTrips: 0,
      vehicle: newVehicle,
      operatingArea: data.operatingArea,
      deliveryRadiusKm: data.deliveryRadiusKm || 30,
      preferredHours: data.preferredHours || '6:00 AM - 6:00 PM',
      joinedDate: 'Just now',
      walletBalance: 0,
      todayEarnings: 0,
      todayTrips: 0,
    };

    this.drivers = [newDriver, ...this.drivers];
    this.currentDriverId = driverId;
    this.notifyDriverListeners();

    // Cloud Sync: Persist driver and vehicle in Supabase
    if (supabaseService.isConfigured()) {
      supabaseService.registerDriverCloud({
        driverId,
        vehicleId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        operatingArea: data.operatingArea,
        deliveryRadiusKm: data.deliveryRadiusKm || 30,
        preferredHours: data.preferredHours || '6:00 AM - 6:00 PM',
        vehicleType: data.vehicleType,
        vehicleModel: data.vehicleModel,
        registrationNumber: data.registrationNumber,
        capacityKg: data.capacityKg,
        licenseNumber: data.licenseNumber,
      }).catch((err: any) => console.warn('Supabase registerDriverCloud error:', err));
    }

    this.addNotification({
      recipientRole: 'DRIVER',
      driverId,
      type: 'system',
      title: 'Welcome to AgriFleet Logistics! 🎉',
      message: 'Your driver account has been activated. Toggle ONLINE to receive immediate delivery requests.',
    });

    return newDriver;
  }

  public toggleDriverAvailability(isOnline: boolean) {
    const current = this.getCurrentDriver();
    if (!current) return;

    this.drivers = this.drivers.map(d => {
      if (d.id === current.id) {
        return {
          ...d,
          availabilityStatus: isOnline ? 'ONLINE' : 'OFFLINE',
        };
      }
      return d;
    });

    this.notifyDriverListeners();
  }

  // ── Delivery Matching & Request System ─────────────────────────────────────
  public getEligibleDrivers(delivery: Delivery): Driver[] {
    return this.drivers.filter(d => {
      if (d.verificationStatus !== 'active') return false;
      if (d.availabilityStatus === 'OFFLINE') return false;
      // Check vehicle capacity
      if (d.vehicle.capacityKg < delivery.goods.weightKg) return false;
      return true;
    });
  }

  public getAvailableRequestsForCurrentDriver(): Delivery[] {
    const driver = this.getCurrentDriver();
    if (!driver || driver.availabilityStatus === 'OFFLINE') return [];

    return this.deliveries.filter(d => {
      if (d.status !== 'Searching for Driver' && d.status !== 'Delivery Requested') return false;
      // If weight exceeds vehicle capacity, filter out
      if (d.goods.weightKg > driver.vehicle.capacityKg) return false;
      return true;
    });
  }

  public getActiveTripForDriver(driverId?: string): Delivery | null {
    const id = driverId || this.currentDriverId;
    return (
      this.deliveries.find(
        d =>
          d.assignedDriverId === id &&
          d.status !== 'Delivery Completed' &&
          d.status !== 'Cancelled' &&
          d.status !== 'Failed Delivery'
      ) || null
    );
  }

  public getDriverTripHistory(driverId?: string): Delivery[] {
    const id = driverId || this.currentDriverId;
    return this.deliveries.filter(
      d => d.assignedDriverId === id && (d.status === 'Delivery Completed' || d.status === 'Cancelled' || d.status === 'Failed Delivery')
    );
  }

  public getDeliveryById(id: string): Delivery | undefined {
    return this.deliveries.find(d => d.id === id);
  }

  public getDeliveriesForBuyer(buyerName: string): Delivery[] {
    const clean = buyerName.trim().toLowerCase();
    return this.deliveries.filter(d => d.buyerName.toLowerCase().includes(clean));
  }

  public getDeliveriesForFarmer(farmerName: string): Delivery[] {
    const clean = farmerName.trim().toLowerCase();
    return this.deliveries.filter(d => d.farmerName.toLowerCase().includes(clean));
  }

  // ── State Machine: Delivery Lifecycle Actions ──────────────────────────────
  public async createDeliveryRequest(params: {
    orderId: number;
    farmerName: string;
    farmerPhone: string;
    farmerAddress: string;
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
    produceName: string;
    produceCategory: string;
    quantity: string;
    weightKg: number;
    specialHandling?: string;
    deliveryInstructions?: string;
    vehicleType?: VehicleType;
    distanceKm?: number;
  }): Promise<Delivery> {
    const distanceKm = params.distanceKm || Math.floor(10 + Math.random() * 20);
    const weightKg = params.weightKg || 50;
    const vehicleRequired = params.vehicleType || recommendVehicleForCargo(weightKg, params.specialHandling?.toLowerCase().includes('cold'));
    const quote = calculateDeliveryQuote({
      distanceKm,
      weightKg,
      vehicleType: vehicleRequired,
      requiresRefrigeration: params.specialHandling?.toLowerCase().includes('cold'),
    });

    const nextNumber = Math.floor(10000 + Math.random() * 89999);
    const deliveryId = `DLV-${nextNumber}`;
    const handoverPin = `${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `AGRI-${Math.floor(1000 + Math.random() * 9000)}-LK`;

    const newDelivery: Delivery = {
      id: deliveryId,
      orderId: params.orderId,
      trackingCode,
      handoverPin,
      farmerId: 'usr-farmer',
      farmerName: params.farmerName,
      farmerPhone: params.farmerPhone,
      farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      buyerId: 'usr-buyer',
      buyerName: params.buyerName,
      buyerPhone: params.buyerPhone,
      buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      pickup: {
        address: params.farmerAddress || 'Highland Farm Gate, Negombo Rd',
        label: `${params.farmerName} Field Loading Bay`,
        contactName: params.farmerName,
        contactPhone: params.farmerPhone,
        lat: 7.208 + (Math.random() - 0.5) * 0.05,
        lng: 79.838 + (Math.random() - 0.5) * 0.05,
        instructions: 'Call farmer on approach for gate entry.',
      },
      dropoff: {
        address: params.buyerAddress,
        label: `${params.buyerName} Delivery Address`,
        contactName: params.buyerName,
        contactPhone: params.buyerPhone,
        lat: 6.927 + (Math.random() - 0.5) * 0.05,
        lng: 79.861 + (Math.random() - 0.5) * 0.05,
        instructions: params.deliveryInstructions || 'Leave at reception or check with recipient.',
      },
      goods: {
        name: params.produceName,
        category: params.produceCategory,
        quantity: params.quantity,
        unit: 'kg',
        packageCount: Math.ceil(weightKg / 20),
        weightKg,
        specialHandling: params.specialHandling || 'Standard dry cargo',
        notes: params.deliveryInstructions,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      },
      vehicleRequired,
      distanceKm,
      estimatedMinutes: quote.estimatedMinutes,
      customerDeliveryFee: quote.customerDeliveryFee,
      driverEarnings: quote.driverEarnings,
      platformFee: quote.platformCommission,
      status: 'Searching for Driver',
      requestedAt: Date.now(),
      statusHistory: [
        {
          status: 'Delivery Requested',
          timestamp: Date.now(),
          actor: `Buyer (${params.buyerName})`,
          notes: `Requested on-demand courier with ${vehicleRequired}`,
        },
        {
          status: 'Searching for Driver',
          timestamp: Date.now(),
          actor: 'System Auto-Dispatcher',
          notes: `Identifying eligible ${vehicleRequired} drivers in operating radius`,
        },
      ],
    };

    this.deliveries = [newDelivery, ...this.deliveries];
    this.notifyDeliveryListeners(newDelivery);

    // Trigger incoming alert to online drivers
    const current = this.getCurrentDriver();
    if (current && current.availabilityStatus === 'ONLINE' && current.vehicle.capacityKg >= weightKg) {
      this.requestAlertListeners.forEach(fn => fn(newDelivery));
      this.addNotification({
        recipientRole: 'DRIVER',
        driverId: current.id,
        type: 'new_request',
        title: 'New Delivery Request Nearby 🚚',
        message: `${params.farmerName} has ${params.quantity} of ${params.produceName} ready for delivery (${distanceKm} km, LKR ${quote.customerDeliveryFee.toLocaleString()}).`,
        deliveryId,
      });
    }

    return newDelivery;
  }

  public async acceptDelivery(deliveryId: string, driverId?: string): Promise<{ success: boolean; message: string }> {
    const id = driverId || this.currentDriverId;
    const driver = this.drivers.find(d => d.id === id);
    if (!driver) return { success: false, message: 'Driver not found.' };

    const target = this.deliveries.find(d => d.id === deliveryId);
    if (!target) return { success: false, message: 'Delivery request does not exist.' };

    // Edge case: Multiple drivers accepting simultaneously
    if (target.assignedDriverId && target.assignedDriverId !== id) {
      return {
        success: false,
        message: 'This delivery has already been assigned to another driver.',
      };
    }

    if (target.status !== 'Searching for Driver' && target.status !== 'Delivery Requested') {
      return {
        success: false,
        message: 'This delivery is no longer available.',
      };
    }

    // Atomic update
    this.deliveries = this.deliveries.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: 'Driver Assigned',
          assignedDriverId: driver.id,
          assignedDriver: driver,
          acceptedAt: Date.now(),
          statusHistory: [
            ...d.statusHistory,
            {
              status: 'Driver Assigned',
              timestamp: Date.now(),
              actor: `Driver (${driver.name})`,
              notes: `Accepted delivery request with ${driver.vehicle.model} (${driver.vehicle.registrationNumber})`,
            },
          ],
        };
      }
      return d;
    });

    // Update driver state to BUSY
    this.drivers = this.drivers.map(d => {
      if (d.id === driver.id) {
        return { ...d, availabilityStatus: 'BUSY' };
      }
      return d;
    });

    this.notifyDeliveryListeners(this.getDeliveryById(deliveryId));
    this.notifyDriverListeners();

    // Notify Buyer and Farmer
    this.addNotification({
      recipientRole: 'BUYER',
      type: 'driver_assigned',
      title: 'Driver Assigned 🚚',
      message: `${driver.name} (${driver.vehicle.type} - ${driver.vehicle.registrationNumber}) has been assigned to your delivery.`,
      deliveryId,
    });

    this.addNotification({
      recipientRole: 'FARMER',
      type: 'driver_assigned',
      title: 'Driver Dispatched to Farm 🚜',
      message: `${driver.name} is on the way to pick up ${target.goods.quantity} of ${target.goods.name}.`,
      deliveryId,
    });

    this.addNotification({
      recipientRole: 'DRIVER',
      driverId: driver.id,
      type: 'driver_assigned',
      title: 'Delivery Accepted! 📍',
      message: `Head to ${target.pickup.address} to collect goods from ${target.farmerName}.`,
      deliveryId,
    });

    return {
      success: true,
      message: `Delivery assigned to ${driver.name}! Head to pickup location.`,
    };
  }

  public async updateDeliveryStatus(
    deliveryId: string,
    nextStatus: DeliveryStatus,
    notes?: string,
    proof?: DeliveryProof
  ): Promise<boolean> {
    const target = this.deliveries.find(d => d.id === deliveryId);
    if (!target) return false;

    const currentDriver = this.getCurrentDriver();
    const actorName = currentDriver ? currentDriver.name : 'System';

    this.deliveries = this.deliveries.map(d => {
      if (d.id === deliveryId) {
        const updated: Delivery = {
          ...d,
          status: nextStatus,
          statusHistory: [
            ...d.statusHistory,
            {
              status: nextStatus,
              timestamp: Date.now(),
              actor: actorName,
              notes,
            },
          ],
        };

        if (nextStatus === 'Driver En Route to Pickup') {
          // No special timestamp
        } else if (nextStatus === 'Arrived at Pickup') {
          updated.pickupArrivedAt = Date.now();
        } else if (nextStatus === 'Goods Collected') {
          updated.goodsCollectedAt = Date.now();
          if (proof) updated.pickupProof = proof;
          // Also advance to In Transit
          updated.status = 'In Transit';
          updated.statusHistory.push({
            status: 'In Transit',
            timestamp: Date.now() + 500,
            actor: actorName,
            notes: 'Goods loaded onto vehicle. Commencing transit to buyer.',
          });
        } else if (nextStatus === 'Arrived at Delivery') {
          updated.dropoffArrivedAt = Date.now();
        } else if (nextStatus === 'Delivery Completed') {
          updated.deliveredAt = Date.now();
          if (proof) updated.deliveryProof = proof;
        }

        return updated;
      }
      return d;
    });

    // If completed, disburse driver earnings and reset availability to ONLINE
    if (nextStatus === 'Delivery Completed') {
      const driverId = target.assignedDriverId || this.currentDriverId;
      this.drivers = this.drivers.map(d => {
        if (d.id === driverId) {
          const newWallet = d.walletBalance + target.driverEarnings;
          const newToday = d.todayEarnings + target.driverEarnings;
          return {
            ...d,
            walletBalance: newWallet,
            todayEarnings: newToday,
            todayTrips: d.todayTrips + 1,
            completedTrips: d.completedTrips + 1,
            totalTrips: d.totalTrips + 1,
            availabilityStatus: 'ONLINE',
          };
        }
        return d;
      });

      this.addNotification({
        recipientRole: 'DRIVER',
        driverId,
        type: 'completed',
        title: `Trip Completed! +LKR ${target.driverEarnings.toLocaleString()} 💰`,
        message: `Delivery ${deliveryId} completed successfully. Earnings credited to your wallet.`,
        deliveryId,
      });

      this.addNotification({
        recipientRole: 'BUYER',
        type: 'completed',
        title: 'Goods Delivered 🎉',
        message: `Your ${target.goods.name} has been safely delivered and confirmed.`,
        deliveryId,
      });

      this.addNotification({
        recipientRole: 'FARMER',
        type: 'completed',
        title: 'Delivery Handover Complete 🌾',
        message: `${target.buyerName} received the goods. Escrow payout ready for release.`,
        deliveryId,
      });
    }

    this.notifyDeliveryListeners(this.getDeliveryById(deliveryId));
    this.notifyDriverListeners();
    return true;
  }

  public async reportProblem(deliveryId: string, report: ProblemReport): Promise<boolean> {
    const target = this.deliveries.find(d => d.id === deliveryId);
    if (!target) return false;

    this.deliveries = this.deliveries.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          problemReport: report,
          statusHistory: [
            ...d.statusHistory,
            {
              status: d.status,
              timestamp: Date.now(),
              actor: `Driver (${this.getCurrentDriver()?.name || 'Driver'})`,
              notes: `[PROBLEM REPORTED] ${report.reason}: ${report.description}`,
            },
          ],
        };
      }
      return d;
    });

    this.notifyDeliveryListeners(this.getDeliveryById(deliveryId));
    this.addNotification({
      recipientRole: 'DRIVER',
      type: 'system',
      title: 'Problem Logged with Dispatch Support ⚠️',
      message: `Report filed for ${deliveryId}: ${report.reason}. Our operations team has been notified.`,
      deliveryId,
    });

    return true;
  }

  public async cancelDelivery(
    deliveryId: string,
    cancelledBy: 'Buyer' | 'Farmer' | 'Driver' | 'System',
    reason: string
  ): Promise<boolean> {
    const target = this.deliveries.find(d => d.id === deliveryId);
    if (!target) return false;

    this.deliveries = this.deliveries.map(d => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: 'Cancelled',
          cancelledAt: Date.now(),
          cancelledBy,
          cancellationReason: reason,
          statusHistory: [
            ...d.statusHistory,
            {
              status: 'Cancelled',
              timestamp: Date.now(),
              actor: `${cancelledBy}`,
              notes: `Delivery cancelled: ${reason}`,
            },
          ],
        };
      }
      return d;
    });

    // Reset driver availability if assigned
    if (target.assignedDriverId) {
      this.drivers = this.drivers.map(d => {
        if (d.id === target.assignedDriverId) {
          return { ...d, availabilityStatus: 'ONLINE' };
        }
        return d;
      });
    }

    this.notifyDeliveryListeners(this.getDeliveryById(deliveryId));
    this.notifyDriverListeners();
    return true;
  }

  public addNotification(notif: Omit<LogisticsNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newEntry: LogisticsNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      isRead: false,
    };
    this.notifications = [newEntry, ...this.notifications];
    this.notifyNotificationListeners();
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    this.notifyNotificationListeners();
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.notifyNotificationListeners();
  }

  public getEarningsSummary(driverId?: string): DriverEarningsSummary {
    const id = driverId || this.currentDriverId;
    const driver = this.drivers.find(d => d.id === id) || this.drivers[0];
    const completed = this.deliveries.filter(d => d.assignedDriverId === id && d.status === 'Delivery Completed');

    const tripHistory: DriverTripEarningsRecord[] = completed.map(d => ({
      deliveryId: d.id,
      date: new Date(d.deliveredAt || d.requestedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      goodsName: d.goods.name,
      quantity: d.goods.quantity,
      distanceKm: d.distanceKm,
      customerFee: d.customerDeliveryFee,
      driverEarnings: d.driverEarnings,
      platformCommission: d.platformFee,
      status: 'Completed',
    }));

    return {
      today: driver ? driver.todayEarnings : 8500,
      thisWeek: driver ? driver.todayEarnings * 4.2 : 35700,
      thisMonth: driver ? driver.todayEarnings * 14.5 : 123250,
      total: driver ? driver.walletBalance : 24500,
      tripsToday: driver ? driver.todayTrips : 3,
      tripHistory,
    };
  }
}

export const logisticsService = new LogisticsService();
