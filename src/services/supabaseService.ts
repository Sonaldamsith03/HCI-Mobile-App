import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Produce, Transaction } from '../types';
import { Delivery, Driver } from '../types/logistics';

/**
 * ============================================================================
 * SUPABASE CLOUD DATA SERVICE
 * Handles CRUD and Real-time subscriptions when Supabase credentials are set.
 * ============================================================================
 */

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  // ── Produce Operations ───────────────────────────────────────────────────
  async fetchProduce(): Promise<Produce[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('produce')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.warn('Supabase fetchProduce error:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: Number(row.id),
        name: row.name,
        category: row.category,
        price: Number(row.price),
        quantity: row.quantity,
        unit: row.unit || 'kg',
        location: row.location,
        farmerName: row.farmer_name,
        farmerPhone: row.farmer_phone,
        imageUrl: row.image_url,
        middlemanPrice: Number(row.middleman_price),
        harvestDate: row.harvest_date || 'Harvested recently',
        isOrganic: row.is_organic ?? true,
        description: row.description || '',
      }));
    } catch (err) {
      console.warn('Supabase produce fetch failed:', err);
      return null;
    }
  },

  async insertProduce(crop: Omit<Produce, 'id'>): Promise<Produce | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('produce')
        .insert({
          farmer_name: crop.farmerName,
          farmer_phone: crop.farmerPhone,
          name: crop.name,
          category: crop.category,
          price: crop.price,
          quantity: crop.quantity,
          unit: crop.unit,
          location: crop.location,
          description: crop.description,
          image_url: crop.imageUrl,
          middleman_price: crop.middlemanPrice,
          harvest_date: crop.harvestDate,
          is_organic: crop.isOrganic ?? true,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Supabase insertProduce error:', error?.message);
        return null;
      }

      return {
        id: Number(data.id),
        name: data.name,
        category: data.category,
        price: Number(data.price),
        quantity: data.quantity,
        unit: data.unit,
        location: data.location,
        farmerName: data.farmer_name,
        farmerPhone: data.farmer_phone,
        imageUrl: data.image_url,
        middlemanPrice: Number(data.middleman_price),
        harvestDate: data.harvest_date,
        isOrganic: data.is_organic,
        description: data.description,
      };
    } catch (err) {
      console.warn('Supabase insertProduce failed:', err);
      return null;
    }
  },

  // ── Orders & Transactions ────────────────────────────────────────────────
  async fetchOrders(): Promise<Transaction[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.warn('Supabase fetchOrders error:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: Number(row.id),
        produceId: Number(row.produce_id || 1),
        produceName: row.produce_name,
        amount: Number(row.amount),
        quantityOrdered: row.quantity_ordered,
        buyerName: row.buyer_name,
        farmerName: row.farmer_name,
        farmerPhone: row.farmer_phone,
        deliveryMethod: row.delivery_method,
        deliveryAddress: row.delivery_address,
        paymentMethod: row.payment_method,
        status: row.status,
        trackingCode: row.tracking_code,
        handoverPin: row.handover_pin,
        timestamp: new Date(row.created_at).getTime(),
      }));
    } catch (err) {
      console.warn('Supabase fetchOrders failed:', err);
      return null;
    }
  },

  async insertOrder(tx: Omit<Transaction, 'id'>): Promise<Transaction | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          produce_id: tx.produceId,
          produce_name: tx.produceName,
          amount: tx.amount,
          quantity_ordered: tx.quantityOrdered,
          buyer_name: tx.buyerName,
          farmer_name: tx.farmerName,
          farmer_phone: tx.farmerPhone,
          delivery_method: tx.deliveryMethod,
          delivery_address: tx.deliveryAddress,
          payment_method: tx.paymentMethod,
          status: tx.status,
          tracking_code: tx.trackingCode,
          handover_pin: tx.handoverPin,
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Supabase insertOrder error:', error?.message);
        return null;
      }

      return {
        id: Number(data.id),
        produceId: Number(data.produce_id),
        produceName: data.produce_name,
        amount: Number(data.amount),
        quantityOrdered: data.quantity_ordered,
        buyerName: data.buyer_name,
        farmerName: data.farmer_name,
        farmerPhone: data.farmer_phone,
        deliveryMethod: data.delivery_method,
        deliveryAddress: data.delivery_address,
        paymentMethod: data.payment_method,
        status: data.status,
        trackingCode: data.tracking_code,
        handoverPin: data.handover_pin,
        timestamp: new Date(data.created_at).getTime(),
      };
    } catch (err) {
      console.warn('Supabase insertOrder failed:', err);
      return null;
    }
  },

  // ── Logistics Deliveries ─────────────────────────────────────────────────
  async fetchDeliveries(): Promise<Delivery[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchDeliveries error:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        orderId: Number(row.order_id || 1),
        trackingCode: row.tracking_code,
        handoverPin: row.handover_pin,
        farmerId: row.farmer_id || 'usr-farmer',
        farmerName: row.farmer_name,
        farmerPhone: row.farmer_phone,
        farmerAvatar: row.farmer_avatar,
        buyerId: row.buyer_id || 'usr-buyer',
        buyerName: row.buyer_name,
        buyerPhone: row.buyer_phone,
        buyerAvatar: row.buyer_avatar,
        pickup: row.pickup,
        dropoff: row.dropoff,
        goods: row.goods,
        vehicleRequired: row.vehicle_required,
        distanceKm: Number(row.distance_km),
        estimatedMinutes: Number(row.estimated_minutes),
        customerDeliveryFee: Number(row.customer_delivery_fee),
        driverEarnings: Number(row.driver_earnings),
        platformFee: Number(row.platform_fee),
        status: row.status,
        assignedDriverId: row.assigned_driver_id || undefined,
        requestedAt: new Date(row.requested_at).getTime(),
        acceptedAt: row.accepted_at ? new Date(row.accepted_at).getTime() : undefined,
        pickupArrivedAt: row.pickup_at ? new Date(row.pickup_at).getTime() : undefined,
        deliveredAt: row.delivered_at ? new Date(row.delivered_at).getTime() : undefined,
        pickupProof: row.pickup_proof || undefined,
        deliveryProof: row.delivery_proof || undefined,
        problemReport: row.problem_report || undefined,
        statusHistory: row.status_history || [],
      }));
    } catch (err) {
      console.warn('Supabase fetchDeliveries failed:', err);
      return null;
    }
  },

  async upsertDelivery(delivery: Delivery): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('deliveries').upsert({
        id: delivery.id,
        order_id: delivery.orderId,
        tracking_code: delivery.trackingCode,
        handover_pin: delivery.handoverPin,
        farmer_id: delivery.farmerId,
        farmer_name: delivery.farmerName,
        farmer_phone: delivery.farmerPhone,
        farmer_avatar: delivery.farmerAvatar,
        buyer_id: delivery.buyerId,
        buyer_name: delivery.buyerName,
        buyer_phone: delivery.buyerPhone,
        buyer_avatar: delivery.buyerAvatar,
        pickup: delivery.pickup,
        dropoff: delivery.dropoff,
        goods: delivery.goods,
        vehicle_required: delivery.vehicleRequired,
        distance_km: delivery.distanceKm,
        estimated_minutes: delivery.estimatedMinutes,
        customer_delivery_fee: delivery.customerDeliveryFee,
        driver_earnings: delivery.driverEarnings,
        platform_fee: delivery.platformFee,
        status: delivery.status,
        assigned_driver_id: delivery.assignedDriverId || null,
        requested_at: new Date(delivery.requestedAt).toISOString(),
        accepted_at: delivery.acceptedAt ? new Date(delivery.acceptedAt).toISOString() : null,
        pickup_at: delivery.pickupArrivedAt ? new Date(delivery.pickupArrivedAt).toISOString() : null,
        delivered_at: delivery.deliveredAt ? new Date(delivery.deliveredAt).toISOString() : null,
        pickup_proof: delivery.pickupProof || null,
        delivery_proof: delivery.deliveryProof || null,
        problem_report: delivery.problemReport || null,
        status_history: delivery.statusHistory,
      });

      if (error) {
        console.warn('Supabase upsertDelivery error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase upsertDelivery failed:', err);
      return false;
    }
  },

  // ── Realtime Listener ────────────────────────────────────────────────────
  subscribeToDeliveries(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel('realtime:deliveries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deliveries' },
        payload => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
