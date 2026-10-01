import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ============================================================================
 * SUPABASE CONFIGURATION
 * ============================================================================
 * 
 * Replace the placeholder values below with your actual Supabase credentials:
 * 1. Log in to https://supabase.com
 * 2. Go to your Project -> Settings (gear icon) -> API
 * 3. Copy "Project URL" and paste below in SUPABASE_URL
 * 4. Copy "anon / public" API Key and paste below in SUPABASE_ANON_KEY
 */

export const SUPABASE_URL: string = 'https://rcxkrkjknsdyeiupsuwd.supabase.co';
export const SUPABASE_ANON_KEY: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGtya2prbnNkeWVpdXBzdXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NDI2MjAsImV4cCI6MjEwNjQxODYyMH0.koYLyd8Cw_QMqjUtEUYwq18MpnvE-4JbVU3kfxTQPA8';
export const GOOGLE_CLIENT_ID: string =
  '861668647553-5qidcarn3em3edro5vj5p6lbv27rh2n5.apps.googleusercontent.com';

/**
 * Returns true if the user has provided real Supabase credentials.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL.trim().length > 0 &&
    SUPABASE_ANON_KEY.trim().length > 0 &&
    !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
  );
};

/**
 * Pre-configured Supabase Client for React Native / Expo
 * Features:
 * - Uses AsyncStorage to persist session and auth tokens across app restarts.
 * - Auto-refreshes expired auth tokens.
 * - Supports Realtime WebSocket subscriptions.
 */
export const supabase = createClient(
  isSupabaseConfigured() ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
