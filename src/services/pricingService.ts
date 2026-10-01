import { VehicleType, PricingQuote } from '../types/logistics';

export interface VehicleConfig {
  type: VehicleType;
  displayName: string;
  icon: string; // Ionicons / MaterialCommunityIcons name
  baseFee: number; // in LKR or USD ($3.00 etc, we support clean display)
  perKmRate: number;
  maxWeightKg: number;
  speedKmh: number;
  description: string;
}

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  Motorbike: {
    type: 'Motorbike',
    displayName: 'Motorbike Express',
    icon: 'bicycle-outline',
    baseFee: 350, // LKR
    perKmRate: 45, // LKR / km
    maxWeightKg: 25,
    speedKmh: 45,
    description: 'Fastest for small produce pouches, herbs, honey & urgent samples up to 25 kg',
  },
  'Three-wheeler': {
    type: 'Three-wheeler',
    displayName: 'Three-Wheeler (Tuk)',
    icon: 'car-sport-outline',
    baseFee: 600,
    perKmRate: 70,
    maxWeightKg: 150,
    speedKmh: 35,
    description: 'Agile transport for medium baskets & sacks up to 150 kg across town',
  },
  Van: {
    type: 'Van',
    displayName: 'Chilled Cargo Van',
    icon: 'cube-outline',
    baseFee: 1200,
    perKmRate: 110,
    maxWeightKg: 600,
    speedKmh: 50,
    description: 'Insulated & climate-protected for fresh fruit, dairy & leafy greens up to 600 kg',
  },
  'Small truck': {
    type: 'Small truck',
    displayName: 'Small Truck / Dimo Batta',
    icon: 'car-outline',
    baseFee: 2200,
    perKmRate: 150,
    maxWeightKg: 1500,
    speedKmh: 42,
    description: 'Heavy harvest haulage for 500 kg to 1.5 tons of tubers, grains & bulk vegetables',
  },
  Lorry: {
    type: 'Lorry',
    displayName: 'Commercial Lorry (3.5T)',
    icon: 'bus-outline',
    baseFee: 4500,
    perKmRate: 220,
    maxWeightKg: 3500,
    speedKmh: 38,
    description: 'Large commercial wholesale transport for full acre yields up to 3.5 tons',
  },
};

export interface PricingOptions {
  distanceKm: number;
  weightKg: number;
  vehicleType?: VehicleType;
  requiresRefrigeration?: boolean;
  fragileHandling?: boolean;
  priorityDispatch?: boolean;
  currency?: 'LKR' | 'USD';
}

// Configurable platform settings
export const LOGISTICS_PLATFORM_CONFIG = {
  driverEarningsShare: 0.82, // Driver receives 82%
  platformCommissionShare: 0.18, // Platform retains 18%
  refrigerationSurcharge: 450, // LKR
  fragileHandlingSurcharge: 250, // LKR
  priorityDispatchSurcharge: 350, // LKR
  heavyWeightThresholdKg: 100, // per 50kg above threshold adds surcharge
  heavyWeightSurchargePer50Kg: 150,
};

/**
 * Automatically recommends the best vehicle type based on cargo weight and requirements
 */
export function recommendVehicleForCargo(weightKg: number, requiresRefrigeration?: boolean): VehicleType {
  if (requiresRefrigeration) {
    if (weightKg <= 600) return 'Van';
    return 'Lorry';
  }

  if (weightKg <= 25) return 'Motorbike';
  if (weightKg <= 150) return 'Three-wheeler';
  if (weightKg <= 600) return 'Van';
  if (weightKg <= 1500) return 'Small truck';
  return 'Lorry';
}

/**
 * Calculates a complete, transparent delivery quotation
 */
export function calculateDeliveryQuote(options: PricingOptions): PricingQuote {
  const {
    distanceKm,
    weightKg,
    requiresRefrigeration,
    fragileHandling,
    priorityDispatch,
  } = options;

  const vehicleType = options.vehicleType || recommendVehicleForCargo(weightKg, requiresRefrigeration);
  const vehicle = VEHICLE_CONFIGS[vehicleType];

  const baseFee = vehicle.baseFee;
  const distanceCharge = Math.round(distanceKm * vehicle.perKmRate);

  // Weight surcharge for oversized cargo
  let weightSurcharge = 0;
  if (weightKg > LOGISTICS_PLATFORM_CONFIG.heavyWeightThresholdKg) {
    const excessKg = weightKg - LOGISTICS_PLATFORM_CONFIG.heavyWeightThresholdKg;
    const blocksOf50 = Math.ceil(excessKg / 50);
    weightSurcharge = blocksOf50 * LOGISTICS_PLATFORM_CONFIG.heavyWeightSurchargePer50Kg;
  }

  // Handling surcharges
  let handlingSurcharge = 0;
  if (requiresRefrigeration) {
    handlingSurcharge += LOGISTICS_PLATFORM_CONFIG.refrigerationSurcharge;
  }
  if (fragileHandling) {
    handlingSurcharge += LOGISTICS_PLATFORM_CONFIG.fragileHandlingSurcharge;
  }
  if (priorityDispatch) {
    handlingSurcharge += LOGISTICS_PLATFORM_CONFIG.priorityDispatchSurcharge;
  }

  const customerDeliveryFee = baseFee + distanceCharge + weightSurcharge + handlingSurcharge;
  const driverEarnings = Math.round(customerDeliveryFee * LOGISTICS_PLATFORM_CONFIG.driverEarningsShare);
  const platformCommission = customerDeliveryFee - driverEarnings;

  // Travel time estimation (Distance / Speed) + 15 mins loading/unloading buffer
  const travelMinutes = Math.round((distanceKm / vehicle.speedKmh) * 60) + 15;

  return {
    baseFee,
    distanceCharge,
    weightSurcharge,
    handlingSurcharge,
    customerDeliveryFee,
    driverEarnings,
    platformCommission,
    estimatedMinutes: travelMinutes,
    recommendedVehicle: vehicleType,
  };
}

/**
 * Format currency nicely for display
 */
export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString()}`;
}
