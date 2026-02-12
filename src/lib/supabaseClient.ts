import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null

if (!supabaseUrl || !supabaseAnonKey) {
	if (typeof window !== 'undefined') {
		console.error(
			'Missing Supabase env vars NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local and restart `npm run dev`.'
		)
	} else {
		// Log on the server side without crashing the whole app
		console.warn(
			'Supabase env vars missing on server. Check .env.local and restart dev server.'
		)
	}
} else {
	supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }