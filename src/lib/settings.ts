import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Settings = { company_name: string; phone: string | null; whatsapp: string | null; email: string | null; address: string | null; description: string | null }
const empty: Settings = { company_name: 'AL FOUTIYOU MARKET', phone: null, whatsapp: null, email: null, address: null, description: null }

export function useSettings() {
  const [s, setS] = useState<Settings>(empty)
  useEffect(() => { supabase.from('company_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => data && setS(data as Settings)) }, [])
  return s
}
export const waLink = (num: string | null, text = '') => {
  const d = (num ?? '').replace(/\D/g, '')
  return d ? `https://wa.me/${d}${text ? '?text=' + encodeURIComponent(text) : ''}` : ''
}
