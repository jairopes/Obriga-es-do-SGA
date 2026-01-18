

import { createClient } from '@supabase/supabase-js';

// Fixed: Use process.env instead of import.meta.env to resolve TypeScript errors in this environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xnymdmqdqjqzjhhjluio.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_a4tSQjHVbvXOVFXBbWACrA_co6utNpl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);