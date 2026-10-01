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

  async updateProduce(crop: Produce): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase
        .from('produce')
        .update({
          name: crop.name,
          category: crop.category,
          price: crop.price,
          quantity: crop.quantity,
          unit: crop.unit,
          location: crop.location,
          description: crop.description,
          middleman_price: crop.middlemanPrice,
          harvest_date: crop.harvestDate,
          is_organic: crop.isOrganic,
        })
        .eq('id', crop.id);

      if (error) {
        console.warn('Supabase updateProduce error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase updateProduce failed:', err);
      return false;
    }
  },

  async deleteProduce(id: number): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('produce').delete().eq('id', id);
      if (error) {
        console.warn('Supabase deleteProduce error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase deleteProduce failed:', err);
      return false;
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

  // ── Authentication & Profiles ─────────────────────────────────────────────
  async signUp(
    email: string,
    password: string,
    profileData: {
      name: string;
      role: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN';
      phone?: string;
    }
  ): Promise<{ user: any; profile: any; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password.trim(),
        options: {
          data: {
            name: profileData.name,
            role: profileData.role,
            phone: profileData.phone || '',
          },
        },
      });

      if (error) {
        return { user: null, profile: null, error: error.message };
      }

      const user = data.user;
      if (!user) {
        return { user: null, profile: null, error: 'Sign up failed to return user data' };
      }

      // Upsert profile record in public.profiles table
      const { data: profileRecord, error: profileErr } = await supabase
        .from('profiles')
        .upsert(
          {
            auth_user_id: user.id,
            name: profileData.name,
            email: cleanEmail,
            phone: profileData.phone || null,
            role: profileData.role,
            wallet_balance: profileData.role === 'FARMER' ? 24500 : 12500,
            status: 'active',
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (profileErr) {
        console.warn('Profile creation note:', profileErr.message);
      }

      return { user, profile: profileRecord || { ...profileData, email: cleanEmail }, error: null };
    } catch (err: any) {
      return { user: null, profile: null, error: err.message || 'Unexpected sign up failure' };
    }
  },

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: any; profile: any; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });

      if (error) {
        return { user: null, profile: null, error: error.message };
      }

      const user = data.user;
      if (!user) {
        return { user: null, profile: null, error: 'User session not found' };
      }

      // Fetch profile from public.profiles
      const { data: profileRecord } = await supabase
        .from('profiles')
        .select('*')
        .or(`auth_user_id.eq.${user.id},email.eq.${cleanEmail}`)
        .maybeSingle();

      const profile = profileRecord || {
        name: user.user_metadata?.name || 'Verified User',
        role: user.user_metadata?.role || 'BUYER',
        email: cleanEmail,
      };

      return { user, profile, error: null };
    } catch (err: any) {
      return { user: null, profile: null, error: err.message || 'Unexpected sign in failure' };
    }
  },

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  },

  async getCurrentSessionUser(): Promise<any | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data } = await supabase.auth.getUser();
      return data.user || null;
    } catch {
      return null;
    }
  },

  // ── Driver Cloud Operations ──────────────────────────────────────────────
  async registerDriverCloud(data: {
    driverId: string;
    vehicleId: string;
    name: string;
    phone: string;
    email: string;
    operatingArea: string;
    deliveryRadiusKm: number;
    preferredHours: string;
    vehicleType: string;
    vehicleModel: string;
    registrationNumber: string;
    capacityKg: number;
    licenseNumber?: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      // 1. Insert vehicle
      await supabase.from('vehicles').upsert({
        id: data.vehicleId,
        driver_id: data.driverId,
        type: data.vehicleType,
        model: data.vehicleModel,
        registration_number: data.registrationNumber.toUpperCase(),
        capacity_kg: data.capacityKg,
        capacity_label: `${data.capacityKg} kg`,
        documents_verified: true,
        license_number: data.licenseNumber || 'PENDING',
      });

      // 2. Insert driver
      await supabase.from('drivers').upsert({
        id: data.driverId,
        name: data.name,
        phone: data.phone,
        email: data.email.toLowerCase(),
        profile_image:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        verification_status: 'active',
        availability_status: 'ONLINE',
        vehicle_id: data.vehicleId,
        operating_area: data.operatingArea,
        delivery_radius_km: data.deliveryRadiusKm,
        preferred_hours: data.preferredHours,
      });

      return true;
    } catch (err) {
      console.warn('Supabase registerDriverCloud error:', err);
      return false;
    }
  },

  // ── Database Explorer / Cloud Inspection ───────────────────────────────────
  async fetchTableRows(
    table: 'produce' | 'orders' | 'deliveries' | 'profiles' | 'drivers' | 'vehicles',
    limit: number = 25
  ): Promise<any[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase.from(table).select('*').limit(limit);
      if (error) {
        console.warn(`Supabase fetchTableRows (${table}) error:`, error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn(`Supabase fetchTableRows (${table}) failed:`, err);
      return [];
    }
  },

  async getTableCounts(): Promise<{ [key: string]: number }> {
    if (!isSupabaseConfigured()) return {};
    const tables = ['produce', 'orders', 'deliveries', 'profiles', 'drivers', 'vehicles'] as const;
    const counts: { [key: string]: number } = {};

    await Promise.all(
      tables.map(async t => {
        try {
          const { count, error } = await supabase
            .from(t)
            .select('*', { count: 'exact', head: true });
          if (!error && typeof count === 'number') {
            counts[t] = count;
          } else {
            counts[t] = 0;
          }
        } catch {
          counts[t] = 0;
        }
      })
    );

    return counts;
  },
};
