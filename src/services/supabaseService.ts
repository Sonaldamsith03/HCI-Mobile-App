import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Produce, Transaction } from '../types';
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
      const userId = user?.id;

      // Upsert profile in public.profiles table
      let profileRecord: any = null;
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existing) {
          const { data: updated } = await supabase
            .from('profiles')
            .update({
              auth_user_id: userId || existing.auth_user_id,
              name: profileData.name || existing.name,
              phone: profileData.phone || existing.phone,
              role: profileData.role || existing.role,
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
            // Fallback fetch
            const { data: fallback } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', cleanEmail)
              .maybeSingle();
            profileRecord = fallback;
          } else {
            profileRecord = inserted;
          }
        }
      } catch (profileErr: any) {
        console.warn('Profile sync exception:', profileErr?.message);
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

      return { user: user || { email: cleanEmail, id: formattedProfile.id }, profile: formattedProfile, error: null };
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });

      if (error) {
        // If Supabase has "Confirm Email" enabled, handle smoothly if profile exists in database
        if (error.message.toLowerCase().includes('email not confirmed')) {
          const { data: profileRecord } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();

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
              notice: 'Email confirmation link was sent to your inbox. You can continue exploring the app!',
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
      let { data: profileRecord } = await supabase
        .from('profiles')
        .select('*')
        .or(`auth_user_id.eq.${user.id},email.eq.${cleanEmail}`)
        .maybeSingle();

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
        const resolvedRole = (roleMatch && roleMatch[1] ? decodeURIComponent(roleMatch[1]) : 'BUYER') as any;

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

          const jwtProfile = {
            id: jwtPayload.sub || `usr-${jwtEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: jwtName,
            email: jwtEmail,
            avatarUrl: jwtPayload.user_metadata?.avatar_url || jwtPayload.user_metadata?.picture || '',
            role: 'BUYER' as const,
            walletBalance: 12500,
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
            role: 'BUYER',
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
    const metadataRole = (user.user_metadata?.role as any) || 'BUYER';

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
          role: metadataRole,
          wallet_balance: metadataRole === 'FARMER' ? 24500 : 12500,
          escrow_balance: 0,
          status: 'active',
        })
        .select()
        .single();
      profileRecord = created;
    }

    const formatted = {
      id: profileRecord?.id || user.id,
      name: profileRecord?.name || metadataName,
      role: profileRecord?.role || metadataRole,
      email: profileRecord?.email || cleanEmail,
      phone: profileRecord?.phone || '',
      avatarUrl: profileRecord?.avatar_url || metadataAvatar,
      defaultAddress: profileRecord?.default_address || 'Central Delivery Hub, Colombo',
      walletBalance: Number(profileRecord?.wallet_balance ?? 12500),
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
    role: 'BUYER' | 'FARMER' | 'DRIVER' | 'ADMIN';
  }): Promise<{ user: any; profile: any; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, profile: null, error: 'Supabase is not configured' };
    }
    try {
      const cleanEmail = googleAccount.email.trim().toLowerCase();

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
            role: googleAccount.role,
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
            role: googleAccount.role,
            avatar_url:
              googleAccount.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            wallet_balance: googleAccount.role === 'FARMER' ? 24500 : 12500,
            escrow_balance: 0,
            status: 'active',
          })
          .select()
          .single();
        profileRecord = inserted;
      }

      const formattedProfile = {
        name: profileRecord?.name || googleAccount.name,
        role: profileRecord?.role || googleAccount.role,
        email: cleanEmail,
        avatarUrl:
          profileRecord?.avatar_url ||
          googleAccount.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        defaultAddress: profileRecord?.default_address || 'Central Delivery Hub #4B, Green Valley',
        walletBalance: Number(profileRecord?.wallet_balance ?? (googleAccount.role === 'FARMER' ? 24500 : 12500)),
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
  async sendMagicLink(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectTo = typeof window !== 'undefined' && window.location ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) {
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
};
