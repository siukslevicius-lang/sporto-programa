import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qbiwriksrtvmwuvvhooz.supabase.co'

const supabaseKey = 'sb_publishable_qJ3J9LhxIX338JhU6khsAQ_rtRpbOOL'

export const supabase = createClient(supabaseUrl, supabaseKey)