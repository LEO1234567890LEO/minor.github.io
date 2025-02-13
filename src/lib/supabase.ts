import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Log the URL (but not the key) to help with debugging
console.log('Supabase URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'food-sharing-app'
    }
  }
});

// Test the connection
supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(() => console.log('Successfully connected to Supabase'))
  .catch(err => console.error('Failed to connect to Supabase:', err.message));