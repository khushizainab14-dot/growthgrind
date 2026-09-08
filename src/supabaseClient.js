import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xqscricumpoiyijottnq.supabase.co'

const supabaseAnonKey = 'sb_publishable_KhTtEuZPlvmuheQqK-TlaQ_L_M5EzfO'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)