import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These will now work because .env.local is loaded by Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Environment check:', {
  url: SUPABASE_URL,
  hasKey: !!SUPABASE_PUBLISHABLE_KEY
});

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(`
    ❌ Missing environment variables!
    Make sure you have a .env.local file with:
    VITE_SUPABASE_URL=your-url
    VITE_SUPABASE_PUBLISHABLE_KEY=your-key
  `);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});