import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase environment variables. Please create .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('⚠️ Supabase features will not work until configured.');
}

// Create a dummy client if credentials are missing (prevents app crash)
const dummyUrl = supabaseUrl || 'https://placeholder.supabase.co';
const dummyKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(dummyUrl, dummyKey);

// Type definitions for Supabase tables
export interface UserProfile {
  id: string; // Firebase UID
  email: string;
  username: string;
  google_email?: string;
  google_display_name?: string;
  google_photo_url?: string;
  google_connected: boolean;
  has_password: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

