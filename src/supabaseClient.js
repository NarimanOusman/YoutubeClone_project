import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hahgpdeuolemszwdhtru.supabase.co';
const supabaseAnonKey = 'sb_publishable_EfE--QbZuVNPnyV_cEAXZg_w_YcpUeJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
