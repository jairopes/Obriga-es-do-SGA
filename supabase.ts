
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xnymdmqdqjqzjhhjluio.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_a4tSQjHVbvXOVFXBbWACrA_co6utNpl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
