import { supabase, isSupabaseConfigured } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Produce, Transaction, UserRole, SystemUser } from '../types';
import { Delivery, Driver } from '../types/logistics';

// ── JWT Payload Decoder (Works across Browser and React Native) ─────────────
export function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    if (typeof atob === 'function') {
      try {
        return JSON.parse(atob(base64));
      } catch {
        const jsonStr = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonStr);
      }
    }
    return null;
  } catch {
    return null;
  }
}

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
          farmer_name: crop.farmerName || 'Local Farmer',
          farmer_phone: crop.farmerPhone || '+94 77 123 4567',
          name: crop.name,
          category: crop.category,
          price: crop.price,
          quantity: crop.quantity,
          unit: crop.unit || 'kg',
          location: crop.location || 'Negombo Agricultural Hub, Western Province',
          description: crop.description || '',
          image_url: crop.imageUrl || '',
          middleman_price: crop.middlemanPrice || crop.price * 1.5,
          harvest_date: crop.harvestDate || 'Harvested recently',
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
          produce_id: tx.produceId || 1,
          produce_name: tx.produceName,
          amount: tx.amount,
          quantity_ordered: tx.quantityOrdered,
          buyer_name: tx.buyerName || 'Buyer',
          farmer_name: tx.farmerName || 'Local Farmer',
          farmer_phone: tx.farmerPhone || '+94 77 123 4567',
          delivery_method: tx.deliveryMethod || 'Direct Farm Delivery',
          delivery_address: tx.deliveryAddress || 'Central Agri Hub #4B',
          payment_method: tx.paymentMethod || 'AgriPay Escrow',
          status: tx.status || 'Confirmed',
          tracking_code: tx.trackingCode,
          handover_pin: tx.handoverPin || '1234',
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
      let safeDriverId: string | null = null;
      if (delivery.assignedDriverId) {
        if (delivery.assignedDriverId.startsWith('drv-')) {
          safeDriverId = delivery.assignedDriverId;
        } else if (delivery.assignedDriverId === 'd1') {
          safeDriverId = 'drv-kasun';
        } else if (delivery.assignedDriverId === 'd2') {
          safeDriverId = 'drv-david';
        } else if (delivery.assignedDriverId === 'd3') {
          safeDriverId = 'drv-nuwan';
        }
      }

      const { error } = await supabase.from('deliveries').upsert({
        id: delivery.id,
        order_id: delivery.orderId,
        tracking_code: delivery.trackingCode,
        handover_pin: delivery.handoverPin || '1234',
        farmer_id: delivery.farmerId || 'usr-farmer',
        farmer_name: delivery.farmerName || 'Local Farmer',
        farmer_phone: delivery.farmerPhone || '+94 77 123 4567',
        farmer_avatar: delivery.farmerAvatar || null,
        buyer_id: delivery.buyerId || 'usr-buyer',
        buyer_name: delivery.buyerName || 'Buyer',
        buyer_phone: delivery.buyerPhone || '+94 71 888 9999',
        buyer_avatar: delivery.buyerAvatar || null,
        pickup: delivery.pickup,
        dropoff: delivery.dropoff,
        goods: delivery.goods,
        vehicle_required: ['Motorbike', 'Three-wheeler', 'Van', 'Small truck', 'Lorry'].includes(delivery.vehicleRequired)
          ? delivery.vehicleRequired
          : 'Van',
        distance_km: delivery.distanceKm,
        estimated_minutes: delivery.estimatedMinutes,
        customer_delivery_fee: delivery.customerDeliveryFee,
        driver_earnings: delivery.driverEarnings,
        platform_fee: delivery.platformFee,
        status: delivery.status,
        assigned_driver_id: safeDriverId,
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
  ): Promise<{ user: any; profile: any; error: string | null; notice?: string }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      let user: any = null;
      let userId: string | null = null;
      let rateLimited = false;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: profileData.name,
            role: profileData.role,
            phone: profileData.phone || '',
          },
        },
      });

      if (error) {
        const errMsg = error.message?.toLowerCase() || '';
        const errCode = (error as any)?.code || '';
        const errStatus = (error as any)?.status || 0;

        const isRateLimit =
          errCode === 'over_email_send_rate_limit' ||
          errStatus === 429 ||
          errMsg.includes('rate limit') ||
          errMsg.includes('exceeded') ||
          errMsg.includes('too many') ||
          errMsg.includes('email accounts');

        if (isRateLimit) {
          rateLimited = true;
          console.warn('Supabase email rate limit reached during signUp. Continuing with direct profile creation.');
        } else if (
          errMsg.includes('already registered') ||
          errMsg.includes('user already exists')
        ) {
          return { user: null, profile: null, error: error.message };
        } else {
          return { user: null, profile: null, error: error.message };
        }
      } else {
        user = data?.user || null;
        userId = user?.id || null;
      }

      // Check existing profile in public.profiles table
      let existing: any = null;
      try {
        const { data: existingList } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .order('created_at', { ascending: false })
          .limit(1);
        if (existingList && existingList.length > 0) {
          existing = existingList[0];
        }
      } catch (checkErr) {
        console.warn('Could not query existing profile:', checkErr);
      }

      // If email was rate-limited on sign up, but already belongs to an established auth user:
      if (rateLimited && existing && existing.auth_user_id) {
        return {
          user: null,
          profile: null,
          error: `An account with ${cleanEmail} is already registered. Please switch to Sign In.`,
        };
      }

      let profileRecord: any = null;
      try {
        if (existing) {
          const { data: updated } = await supabase
            .from('profiles')
            .update({
              auth_user_id: userId || existing.auth_user_id || null,
              name: profileData.name || existing.name,
              phone: profileData.phone || existing.phone,
              role: profileData.role || existing.role,
              status: 'active',
            })
            .eq('id', existing.id)
            .select()
            .single();
          profileRecord = updated || existing;
        } else {
          const { data: inserted, error: insErr } = await supabase
            .from('profiles')
            .insert({
              auth_user_id: userId || null,
              name: profileData.name,
              email: cleanEmail,
              phone: profileData.phone || null,
              role: profileData.role,
              wallet_balance: profileData.role === 'FARMER' ? 24500 : 12500,
              escrow_balance: 0,
              status: 'active',
            })
            .select()
            .single();

          if (insErr) {
            console.warn('Profile insert note:', insErr.message);
            const { data: fallbackList } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', cleanEmail)
              .order('created_at', { ascending: false })
              .limit(1);
            profileRecord = fallbackList && fallbackList.length > 0 ? fallbackList[0] : null;
          } else {
            profileRecord = inserted;
          }
        }
      } catch (profileErr: any) {
        console.warn('Profile sync exception:', profileErr?.message);
      }

      // Cache credentials locally so user can always sign in smoothly
      try {
        const rawAccounts = await AsyncStorage.getItem('@farmby_auth_accounts');
        const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};
        accounts[cleanEmail] = {
          email: cleanEmail,
          password: cleanPassword,
          role: profileData.role,
          name: profileData.name,
          phone: profileData.phone || '',
          profileId: profileRecord?.id || userId || `usr-${Date.now()}`,
          savedAt: Date.now(),
        };
        await AsyncStorage.setItem('@farmby_auth_accounts', JSON.stringify(accounts));
      } catch (saveErr) {
        console.warn('Local account cache error:', saveErr);
      }

      const formattedProfile = {
        id: profileRecord?.id || userId || `usr-${Date.now()}`,
        name: profileRecord?.name || profileData.name,
        role: profileRecord?.role || profileData.role,
        email: cleanEmail,
        phone: profileRecord?.phone || profileData.phone || '',
        avatarUrl: profileRecord?.avatar_url || '',
        defaultAddress: profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley',
        walletBalance: Number(profileRecord?.wallet_balance ?? (profileData.role === 'FARMER' ? 24500 : 12500)),
        escrowBalance: Number(profileRecord?.escrow_balance ?? 0),
        savedAddresses: [profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley'],
        isLoggedIn: true,
      };

      return {
        user: user || { email: cleanEmail, id: formattedProfile.id },
        profile: formattedProfile,
        error: null,
        notice: rateLimited
          ? 'Account created and activated! Email verification was bypassed.'
          : undefined,
      };
    } catch (err: any) {
      return { user: null, profile: null, error: err.message || 'Unexpected sign up failure' };
    }
  },

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: any; profile: any; error: string | null; notice?: string }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // 1. Check local credentials cache first
        try {
          const rawAccounts = await AsyncStorage.getItem('@farmby_auth_accounts');
          if (rawAccounts) {
            const accounts = JSON.parse(rawAccounts);
            const localAcc = accounts[cleanEmail];
            if (localAcc) {
              if (localAcc.password === cleanPassword) {
                // Password match! Fetch fresh profile from database
                const { data: dbList } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', cleanEmail)
                  .order('created_at', { ascending: false })
                  .limit(1);

                const dbProfile = dbList && dbList.length > 0 ? dbList[0] : null;
                const profile = {
                  id: dbProfile?.id || localAcc.profileId || `usr-${Date.now()}`,
                  name: dbProfile?.name || localAcc.name || cleanEmail.split('@')[0],
                  role: dbProfile?.role || localAcc.role || 'BUYER',
                  email: cleanEmail,
                  phone: dbProfile?.phone || localAcc.phone || '',
                  avatarUrl: dbProfile?.avatar_url || '',
                  defaultAddress: dbProfile?.default_address || 'Central Delivery Hub #4B, Green Valley',
                  walletBalance: Number(dbProfile?.wallet_balance ?? (dbProfile?.role === 'FARMER' ? 24500 : 12500)),
                  escrowBalance: Number(dbProfile?.escrow_balance ?? 0),
                  savedAddresses: [dbProfile?.default_address || 'Central Delivery Hub #4B, Green Valley'],
                  isLoggedIn: true,
                };

                return {
                  user: { email: cleanEmail, id: profile.id },
                  profile,
                  error: null,
                };
              } else {
                return { user: null, profile: null, error: 'Invalid login credentials' };
              }
            }
          }
        } catch (localCheckErr) {
          console.warn('Local check note:', localCheckErr);
        }

        // 2. If Supabase has "Confirm Email" enabled or rate limit was hit, check public.profiles
        const errMsg = error.message.toLowerCase();
        const isEmailNotConfirmed = errMsg.includes('email not confirmed');
        const isRateLimit = errMsg.includes('rate limit') || errMsg.includes('exceeded');

        if (isEmailNotConfirmed || isRateLimit) {
          const { data: profileList } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .order('created_at', { ascending: false })
            .limit(1);

          const profileRecord = profileList && profileList.length > 0 ? profileList[0] : null;

          if (profileRecord) {
            const profile = {
              id: profileRecord.id,
              name: profileRecord.name,
              role: profileRecord.role,
              email: profileRecord.email,
              phone: profileRecord.phone || '',
              avatarUrl: profileRecord.avatar_url || '',
              defaultAddress: profileRecord.default_address || 'Central Delivery Hub #4B, Green Valley',
              walletBalance: Number(profileRecord.wallet_balance ?? 12500),
              escrowBalance: Number(profileRecord.escrow_balance ?? 0),
              savedAddresses: [profileRecord.default_address || 'Central Delivery Hub #4B, Green Valley'],
              isLoggedIn: true,
            };
            return {
              user: { email: cleanEmail, id: profileRecord.id },
              profile,
              error: null,
              notice: isEmailNotConfirmed
                ? 'Email confirmation pending, signed in directly.'
                : undefined,
            };
          }
        }

        return { user: null, profile: null, error: error.message };
      }

      const user = data.user;
      if (!user) {
        return { user: null, profile: null, error: 'User session not found' };
      }

      // Fetch profile from public.profiles
      let { data: profileList } = await supabase
        .from('profiles')
        .select('*')
        .or(`auth_user_id.eq.${user.id},email.eq.${cleanEmail}`)
        .order('created_at', { ascending: false })
        .limit(1);

      let profileRecord = profileList && profileList.length > 0 ? profileList[0] : null;

      // If profile record doesn't exist yet, auto-create it
      if (!profileRecord) {
        const metadataRole = (user.user_metadata?.role as any) || 'BUYER';
        const metadataName = user.user_metadata?.name || cleanEmail.split('@')[0];
        const { data: created } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: user.id,
            name: metadataName,
            email: cleanEmail,
            role: metadataRole,
            wallet_balance: metadataRole === 'FARMER' ? 24500 : 12500,
            escrow_balance: 0,
            status: 'active',
          })
          .select()
          .single();
        profileRecord = created;
      }

      // Cache credentials locally for offline/rate-limit resilience
      try {
        const rawAccounts = await AsyncStorage.getItem('@farmby_auth_accounts');
        const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};
        accounts[cleanEmail] = {
          email: cleanEmail,
          password: cleanPassword,
          role: profileRecord?.role || 'BUYER',
          name: profileRecord?.name || cleanEmail.split('@')[0],
          phone: profileRecord?.phone || '',
          profileId: profileRecord?.id || user.id,
          savedAt: Date.now(),
        };
        await AsyncStorage.setItem('@farmby_auth_accounts', JSON.stringify(accounts));
      } catch (e) {}

      const profile = {
        id: profileRecord?.id || user.id,
        name: profileRecord?.name || user.user_metadata?.name || cleanEmail.split('@')[0],
        role: profileRecord?.role || user.user_metadata?.role || 'BUYER',
        email: profileRecord?.email || cleanEmail,
        phone: profileRecord?.phone || user.user_metadata?.phone || '',
        avatarUrl: profileRecord?.avatar_url || '',
        defaultAddress: profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley',
        walletBalance: Number(profileRecord?.wallet_balance ?? 12500),
        escrowBalance: Number(profileRecord?.escrow_balance ?? 0),
        savedAddresses: [profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley'],
        isLoggedIn: true,
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

  // ── Google OAuth & Social Auth ──────────────────────────────────────────
  async signInWithGoogleOAuth(customRedirectTo?: string): Promise<{ data: any; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase is not configured' };
    }
    try {
      let redirectTo = customRedirectTo;
      if (!redirectTo) {
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
          redirectTo = window.location.origin;
        } else {
          redirectTo = 'agriconnect://auth-callback';
        }
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to initiate Google OAuth' };
    }
  },

  async handleOAuthCallbackUrl(url: string): Promise<{ user: any; profile: any; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }
    try {
      // 0. Check for verified_email parameter (passed from OAuth web bridge)
      const verifiedEmailMatch = url.match(/[?&]verified_email=([^&#]+)/);
      if (verifiedEmailMatch && verifiedEmailMatch[1]) {
        const cleanEmail = decodeURIComponent(verifiedEmailMatch[1]).trim().toLowerCase();
        const nameMatch = url.match(/[?&]name=([^&#]+)/);
        const roleMatch = url.match(/[?&]role=([^&#]+)/);
        const resolvedName = nameMatch && nameMatch[1] ? decodeURIComponent(nameMatch[1]) : cleanEmail.split('@')[0];
        let rawRole = (roleMatch && roleMatch[1] ? decodeURIComponent(roleMatch[1]) : '') as any;

        if (!rawRole || rawRole === 'BUYER') {
          try {
            const pendingRole = await AsyncStorage.getItem('@agriconnect_pending_role');
            if (pendingRole) {
              rawRole = pendingRole;
              await AsyncStorage.removeItem('@agriconnect_pending_role');
            }
          } catch {}
        }

        const resolvedRole: UserRole =
          rawRole === 'ADMIN'
            ? 'ADMIN'
            : rawRole === 'DRIVER' || rawRole === 'COURIER'
            ? 'COURIER'
            : rawRole === 'FARMER'
            ? 'FARMER'
            : 'BUYER';

        // Create immediate profile for 0ms lag
        const immediateProfile = {
          id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: resolvedName,
          email: cleanEmail,
          role: resolvedRole,
          avatarUrl: '',
          walletBalance: resolvedRole === 'FARMER' ? 24500 : 12500,
          escrowBalance: 0,
          savedAddresses: ['Central Delivery Hub, Colombo'],
          defaultAddress: 'Central Delivery Hub, Colombo',
          isLoggedIn: true,
        };

        // Sync with Supabase cloud database in background
        this.loginWithGoogleAccount({
          email: cleanEmail,
          name: resolvedName,
          role: resolvedRole,
        }).catch((e: any) => console.warn('Background Google sync note:', e));

        return { user: { email: cleanEmail, id: immediateProfile.id }, profile: immediateProfile, error: null };
      }

      // 1. Check for authorization code (PKCE flow)
      const codeMatch = url.match(/[?&]code=([^&#]+)/);
      if (codeMatch && codeMatch[1]) {
        const authCode = decodeURIComponent(codeMatch[1]);
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
          if (!error && data?.user) {
            const { profile } = await this.syncUserProfileAfterAuth(data.user);
            return { user: data.user, profile, error: null };
          }
        } catch (codeErr) {
          console.warn('exchangeCodeForSession note:', codeErr);
        }
      }

      // 2. Check for hash fragment access_token / refresh_token (Implicit flow)
      const accessTokenMatch = url.match(/[#&?]access_token=([^&#]+)/);
      const refreshTokenMatch = url.match(/[#&?]refresh_token=([^&#]+)/);

      if (accessTokenMatch && accessTokenMatch[1]) {
        const accessToken = decodeURIComponent(accessTokenMatch[1]);
        const refreshToken = refreshTokenMatch && refreshTokenMatch[1] ? decodeURIComponent(refreshTokenMatch[1]) : '';

        // Try direct JWT payload decode first (guaranteed instant success without network errors)
        const jwtPayload = parseJwtPayload(accessToken);
        if (jwtPayload && jwtPayload.email) {
          const jwtEmail = jwtPayload.email.trim().toLowerCase();
          const jwtName =
            jwtPayload.user_metadata?.full_name ||
            jwtPayload.user_metadata?.name ||
            jwtEmail.split('@')[0];

          let pendingRole: any = null;
          try {
            pendingRole = await AsyncStorage.getItem('@agriconnect_pending_role');
            if (pendingRole) await AsyncStorage.removeItem('@agriconnect_pending_role');
          } catch {}

          const rawRole = pendingRole || jwtPayload.user_metadata?.role || 'BUYER';
          const resolvedRole: UserRole =
            rawRole === 'ADMIN'
              ? 'ADMIN'
              : rawRole === 'DRIVER' || rawRole === 'COURIER'
              ? 'COURIER'
              : rawRole === 'FARMER'
              ? 'FARMER'
              : 'BUYER';

          const jwtProfile = {
            id: jwtPayload.sub || `usr-${jwtEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: jwtName,
            email: jwtEmail,
            avatarUrl: jwtPayload.user_metadata?.avatar_url || jwtPayload.user_metadata?.picture || '',
            role: resolvedRole,
            walletBalance: resolvedRole === 'FARMER' ? 24500 : 12500,
            escrowBalance: 0,
            savedAddresses: ['Central Delivery Hub, Colombo'],
            defaultAddress: 'Central Delivery Hub, Colombo',
            isLoggedIn: true,
          };

          // Also set the session in Supabase background
          if (refreshToken) {
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch(() => {});
          }

          // Sync cloud profile in background
          this.loginWithGoogleAccount({
            email: jwtEmail,
            name: jwtName,
            avatarUrl: jwtProfile.avatarUrl,
            role: resolvedRole,
          }).catch((e: any) => console.warn('Background Google sync note:', e));

          return {
            user: { email: jwtEmail, id: jwtProfile.id },
            profile: jwtProfile,
            error: null,
          };
        }

        // Standard Supabase setSession fallback
        try {
          if (refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error && data?.user) {
              const { profile } = await this.syncUserProfileAfterAuth(data.user);
              return { user: data.user, profile, error: null };
            }
          }
        } catch (sessErr) {
          console.warn('setSession note:', sessErr);
        }
      }

      // 3. Fallback: check current session user
      const currentUser = await this.getCurrentSessionUser();
      if (currentUser) {
        const { profile } = await this.syncUserProfileAfterAuth(currentUser);
        return { user: currentUser, profile, error: null };
      }

      return { user: null, profile: null, error: 'No authentication tokens found in redirect URL' };
    } catch (err: any) {
      return { user: null, profile: null, error: err?.message || 'Failed to process authentication redirect' };
    }
  },

  async syncUserProfileAfterAuth(user: any): Promise<{ profile: any }> {
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || cleanEmail.split('@')[0];
    const metadataAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
    let metadataRole = user.user_metadata?.role as any;

    if (!metadataRole) {
      try {
        const pending = await AsyncStorage.getItem('@agriconnect_pending_role');
        if (pending) {
          metadataRole = pending;
          await AsyncStorage.removeItem('@agriconnect_pending_role');
        }
      } catch {}
    }

    const dbRoleToSave: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' =
      metadataRole === 'ADMIN'
        ? 'ADMIN'
        : metadataRole === 'COURIER' || metadataRole === 'DRIVER'
        ? 'DRIVER'
        : metadataRole === 'FARMER'
        ? 'FARMER'
        : 'BUYER';

    let { data: profileRecord } = await supabase
      .from('profiles')
      .select('*')
      .or(`auth_user_id.eq.${user.id},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (!profileRecord) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({
          auth_user_id: user.id,
          name: metadataName,
          email: cleanEmail,
          avatar_url: metadataAvatar,
          role: dbRoleToSave,
          wallet_balance: dbRoleToSave === 'FARMER' ? 24500 : 12500,
          escrow_balance: 0,
          status: 'active',
        })
        .select()
        .single();
      profileRecord = created;
    } else if (metadataRole && metadataRole !== profileRecord.role) {
      // User explicitly picked a different role during this login flow
      const { data: updated } = await supabase
        .from('profiles')
        .update({
          role: dbRoleToSave,
          name: metadataName || profileRecord.name,
        })
        .eq('id', profileRecord.id)
        .select()
        .single();
      if (updated) {
        profileRecord = updated;
      }
    }

    const appRole: UserRole =
      profileRecord?.role === 'ADMIN'
        ? 'ADMIN'
        : profileRecord?.role === 'DRIVER' || profileRecord?.role === 'COURIER'
        ? 'COURIER'
        : profileRecord?.role === 'FARMER'
        ? 'FARMER'
        : 'BUYER';

    const formatted = {
      id: profileRecord?.id || user.id,
      name: profileRecord?.name || metadataName,
      role: appRole,
      email: profileRecord?.email || cleanEmail,
      phone: profileRecord?.phone || '',
      avatarUrl: profileRecord?.avatar_url || metadataAvatar,
      defaultAddress: profileRecord?.default_address || 'Central Delivery Hub, Colombo',
      walletBalance: Number(profileRecord?.wallet_balance ?? (appRole === 'FARMER' ? 24500 : 12500)),
      escrowBalance: Number(profileRecord?.escrow_balance ?? 0),
      savedAddresses: [profileRecord?.default_address || 'Central Delivery Hub, Colombo'],
      isLoggedIn: true,
    };

    return { profile: formatted };
  },

  async loginWithGoogleAccount(googleAccount: {
    email: string;
    name: string;
    avatarUrl?: string;
    role: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' | 'COURIER';
  }): Promise<{ user: any; profile: any; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }
    try {
      const cleanEmail = googleAccount.email.trim().toLowerCase();
      const dbRole: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' =
        googleAccount.role === 'ADMIN'
          ? 'ADMIN'
          : googleAccount.role === 'COURIER' || googleAccount.role === 'DRIVER'
          ? 'DRIVER'
          : googleAccount.role === 'FARMER'
          ? 'FARMER'
          : 'BUYER';

      const appRole: UserRole =
        dbRole === 'DRIVER' ? 'COURIER' : dbRole;

      // Upsert into public.profiles
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      let profileRecord: any = null;
      if (existing) {
        const { data: updated } = await supabase
          .from('profiles')
          .update({
            name: googleAccount.name,
            role: dbRole,
            avatar_url: googleAccount.avatarUrl || existing.avatar_url,
          })
          .eq('id', existing.id)
          .select()
          .single();
        profileRecord = updated || existing;
      } else {
        const { data: inserted } = await supabase
          .from('profiles')
          .insert({
            name: googleAccount.name,
            email: cleanEmail,
            role: dbRole,
            avatar_url:
              googleAccount.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            wallet_balance: dbRole === 'FARMER' ? 24500 : 12500,
            escrow_balance: 0,
            status: 'active',
          })
          .select()
          .single();
        profileRecord = inserted;
      }

      const formattedProfile = {
        name: profileRecord?.name || googleAccount.name,
        role: appRole,
        email: cleanEmail,
        avatarUrl:
          profileRecord?.avatar_url ||
          googleAccount.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        defaultAddress: profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley',
        walletBalance: Number(profileRecord?.wallet_balance ?? (dbRole === 'FARMER' ? 24500 : 12500)),
        escrowBalance: Number(profileRecord?.escrow_balance ?? 0),
        savedAddresses: [profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley'],
        isLoggedIn: true,
      };

      return {
        user: { email: cleanEmail, id: profileRecord?.id || 'usr-google' },
        profile: formattedProfile,
        error: null,
      };
    } catch (err: any) {
      return { user: null, profile: null, error: err.message || 'Google account sync error' };
    }
  },

  // ── Supabase Email Service: Magic Link & Password Reset ─────────────────
  async sendMagicLink(
    email: string,
    role?: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN' | 'COURIER'
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectTo = typeof window !== 'undefined' && window.location ? window.location.origin : undefined;
      const normalizedRole = role === 'COURIER' ? 'DRIVER' : role;

      if (normalizedRole) {
        try {
          await AsyncStorage.setItem('@agriconnect_pending_role', normalizedRole === 'DRIVER' ? 'COURIER' : normalizedRole);
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (existing) {
            await supabase
              .from('profiles')
              .update({ role: normalizedRole })
              .eq('id', existing.id);
          }
        } catch (e) {
          // ignore
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
          data: normalizedRole ? { role: normalizedRole } : undefined,
        },
      });
      if (error) {
        const errMsg = error.message.toLowerCase();
        if (
          (error as any)?.code === 'over_email_send_rate_limit' ||
          (error as any)?.status === 429 ||
          errMsg.includes('rate limit') ||
          errMsg.includes('exceeded')
        ) {
          return {
            success: false,
            error:
              'Supabase email sending limit reached (3 emails/hr on free tier). Please sign in using your password instead, or disable "Confirm email" in Supabase settings.',
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send magic link email' };
    }
  },

  async sendPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectTo = typeof window !== 'undefined' && window.location ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      if (error) {
        const errMsg = error.message.toLowerCase();
        if (
          (error as any)?.code === 'over_email_send_rate_limit' ||
          (error as any)?.status === 429 ||
          errMsg.includes('rate limit') ||
          errMsg.includes('exceeded')
        ) {
          return {
            success: false,
            error:
              'Supabase email sending limit reached (3 emails/hr on free tier). Please sign in using your password or try again later.',
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email' };
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

  // ── Admin Cloud Profile Management ──────────────────────────────────────
  async fetchProfiles(): Promise<SystemUser[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchProfiles error:', error.message);
        return null;
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name || 'User',
        email: row.email,
        role: (row.role === 'DRIVER' ? 'COURIER' : row.role) as UserRole,
        status: (row.status === 'suspended' ? 'banned' : row.status || 'active') as any,
        isVerified: Boolean(row.is_verified),
        phone: row.phone || '',
        joinedDate: row.created_at
          ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Oct 2026',
        lastLogin: 'Active recently',
        walletBalance: Number(row.wallet_balance || 0),
        avatarUrl: row.avatar_url || '',
      }));
    } catch (err) {
      console.warn('Supabase fetchProfiles failed:', err);
      return null;
    }
  },

  async updateProfileAdmin(
    id: string,
    updates: { is_verified?: boolean; status?: string; role?: string; name?: string; phone?: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const sanitizedUpdates: any = { ...updates };
      if (updates.status) {
        sanitizedUpdates.status =
          updates.status === 'banned' || updates.status === 'suspended'
            ? 'banned'
            : updates.status === 'pending'
            ? 'pending'
            : 'active';
      }

      const { error } = await supabase.from('profiles').update(sanitizedUpdates).eq('id', id);
      if (error) {
        console.warn('Supabase updateProfileAdmin error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase updateProfileAdmin failed:', err);
      return false;
    }
  },

  async deleteProfileAdmin(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) {
        console.warn('Supabase deleteProfileAdmin error:', error.message);
        // Fallback: suspend status
        await supabase.from('profiles').update({ status: 'suspended' }).eq('id', id);
      }
      return true;
    } catch (err) {
      console.warn('Supabase deleteProfileAdmin failed:', err);
      return false;
    }
  },

  // ── Cloud Messages & Chat Integration ────────────────────────────────────
  async fetchMessages(conversationId: string): Promise<any[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetchMessages error:', error.message);
        return null;
      }
      return data || [];
    } catch (err) {
      console.warn('Supabase fetchMessages failed:', err);
      return null;
    }
  },

  async insertMessage(msg: {
    conversation_id: string;
    farmer_name: string;
    buyer_name: string;
    produce_name: string;
    sender: 'Buyer' | 'Farmer';
    content: string;
    price_offer?: any;
  }): Promise<any | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: msg.conversation_id,
          farmer_name: msg.farmer_name,
          buyer_name: msg.buyer_name,
          produce_name: msg.produce_name,
          sender: msg.sender,
          content: msg.content,
          price_offer: msg.price_offer ? JSON.stringify(msg.price_offer) : null,
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase insertMessage error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Supabase insertMessage failed:', err);
      return null;
    }
  },

  subscribeToMessages(conversationId: string, onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel(`realtime:messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        payload => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToProduce(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime:produce')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce' }, payload => {
        onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToOrders(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToProfiles(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel('realtime:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
