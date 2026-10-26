import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const configured = Boolean(url && key)
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')

export type Category = { id: number; slug: string; name: string; image_url?: string | null }
export type Listing = {
  id: string; title: string; description: string | null; category_id: number | null
  price: number | null; city: string | null; region: string | null; price_negotiable: boolean
  image_url: string | null; published_at: string | null; created_at: string
}
export const fcfa = (n: number | null) => (n == null ? 'Prix sur demande' : n.toLocaleString('fr-FR') + ' FCFA')
export const ICON: Record<string, string> = { terrains: '🌍', immobilier: '🏠', automobiles: '🚗', motos: '🏍️', autres: '📦' }
export const isNew = (d: string | null) => !!d && Date.now() - new Date(d).getTime() < 7 * 864e5
