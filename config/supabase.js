// This is a placeholder for your Supabase configuration.
// You will need to replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY'
// with your actual Supabase project URL and anon key.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
