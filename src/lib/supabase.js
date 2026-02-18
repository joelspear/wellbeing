import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ttkujwbcksrdqclwkqkc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0a3Vqd2Jja3NyZHFjbHdrcWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzgzNzksImV4cCI6MjA4NjU1NDM3OX0.GcbhqQnb3VC3K3CvzAMAAa42Ouy5CdYIUcxGbKXqrnQ';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
