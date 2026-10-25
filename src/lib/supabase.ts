import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const configured = Boolean(url && key)
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')
export const WHATSAPP = '221000000000' // à remplacer par votre numéro

export type Category = { id: number; slug: string; name: string }
export type Listing = {
  id: string; title: string; description: string | null; category_id: number | null
  price: number | null; city: string | null; image_url: string | null
}
export const fcfa = (n: number | null) => (n == null ? 'Prix sur demande' : n.toLocaleString('fr-FR') + ' FCFA')
