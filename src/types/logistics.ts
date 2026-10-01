export type VehicleType = 
  | 'Motorbike'
  | 'Three-wheeler'
  | 'Van'
  | 'Small truck'
  | 'Lorry';

export type DriverVerificationStatus = 
  | 'pending'
  | 'active'
  | 'offline'
  | 'suspended'
  | 'rejected';

export type DriverAvailability = 
  | 'ONLINE'
  | 'OFFLINE'
  | 'BUSY';

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  model: string;
  registrationNumber: string; // e.g. "WP CAB-1234"
  capacityKg: number;
  capacityLabel: string; // e.g. "500 kg"
  photoUrl?: string;
  documentsVerified: boolean;
  licenseNumber?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  profileImage: string;
  verificationStatus: DriverVerificationStatus;
  availabilityStatus: DriverAvailability;
  rating: number;
  totalTrips: number;
  completedTrips: number;
  vehicle: Vehicle;
  operatingArea: string;
  deliveryRadiusKm: number;
  preferredHours: string;
  joinedDate: string;
  walletBalance: number;
  todayEarnings: number;
  todayTrips: number;
}

export type DeliveryStatus =
  | 'Delivery Requested'
  | 'Searching for Driver'
  | 'Driver Assigned'
  | 'Driver En Route to Pickup'
  | 'Arrived at Pickup'
  | 'Goods Collected'
  | 'In Transit'
  | 'Arrived at Delivery'
  | 'Delivery Completed'
  | 'Cancelled'
  | 'Failed Delivery';

export interface DeliveryGoods {
  produceId?: number;
  name: string;
  category: string;
  quantity: string; // e.g. "250 kg"
  unit: string;
  packageCount: number;
  weightKg: number;
  specialHandling?: string; // e.g. "Chilled cold-chain", "Fragile berries"
  notes?: string;
  imageUrl?: string;
}

export interface DeliveryLocation {
  address: string;
  label: string;
  contactName: string;
  contactPhone: string;
  lat: number;
  lng: number;
  instructions?: string;
}

export interface DeliveryProof {
  timestamp: number;
  photoUrl?: string;
  packageCountVerified?: number;
  condition?: 'Pristine' | 'Good' | 'Damaged Crates' | 'Accepted with Notes';
  handoverPinVerified?: boolean;
  signatureName?: string;
  notes?: string;
}

export interface ProblemReport {
  reason: 
    | 'Farmer unavailable'
    | 'Buyer unavailable'
    | 'Incorrect address'
    | 'Goods unavailable'
    | 'Goods quantity mismatch'
    | 'Vehicle problem'
    | 'Accident / Emergency'
    | 'Delivery refused'
    | 'Cannot complete delivery'
    | 'Other';
  description: string;
  photoUrl?: string;
  reportedAt: number;
}

export interface StatusHistoryEntry {
  status: DeliveryStatus;
  timestamp: number;
  actor: string;
  notes?: string;
}

export interface Delivery {
  id: string; // e.g. "DLV-10284"
  orderId: number;
  trackingCode: string;
  handoverPin: string; // 4-digit code e.g. "7824"
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAvatar?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAvatar?: string;
  pickup: DeliveryLocation;
  dropoff: DeliveryLocation;
  goods: DeliveryGoods;
  vehicleRequired: VehicleType;
  distanceKm: number;
  estimatedMinutes: number;
  customerDeliveryFee: number;
  driverEarnings: number;
  platformFee: number;
  status: DeliveryStatus;
  requestedAt: number;
  acceptedAt?: number;
  pickupArrivedAt?: number;
  goodsCollectedAt?: number;
  dropoffArrivedAt?: number;
  deliveredAt?: number;
  cancelledAt?: number;
  cancellationReason?: string;
  cancelledBy?: 'Buyer' | 'Farmer' | 'Driver' | 'System';
  assignedDriverId?: string;
  assignedDriver?: Driver;
  pickupProof?: DeliveryProof;
  deliveryProof?: DeliveryProof;
  problemReport?: ProblemReport;
  statusHistory: StatusHistoryEntry[];
}

export interface DriverTripEarningsRecord {
  deliveryId: string;
  date: string;
  goodsName: string;
  quantity: string;
  distanceKm: number;
  customerFee: number;
  driverEarnings: number;
  platformCommission: number;
  status: 'Completed' | 'Cancelled';
}

export interface DriverEarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  tripsToday: number;
  tripHistory: DriverTripEarningsRecord[];
}

export type LogisticsNotificationType =
  | 'new_request'
  | 'driver_assigned'
  | 'en_route_pickup'
  | 'arrived_pickup'
  | 'goods_collected'
  | 'in_transit'
  | 'arrived_delivery'
  | 'completed'
  | 'cancelled'
  | 'earnings'
  | 'system';

export interface LogisticsNotification {
  id: string;
  driverId?: string;
  recipientRole: 'DRIVER' | 'BUYER' | 'FARMER';
  type: LogisticsNotificationType;
  title: string;
  message: string;
  deliveryId?: string;
  timestamp: number;
  isRead: boolean;
}

export interface PricingQuote {
  baseFee: number;
  distanceCharge: number;
  weightSurcharge: number;
  handlingSurcharge: number;
  customerDeliveryFee: number;
  driverEarnings: number;
  platformCommission: number;
  estimatedMinutes: number;
  recommendedVehicle: VehicleType;
}
