import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const Q: [string, (q: any) => any][] = [
  ['Annonces au total', (q) => q],
  ['Publiées', (q) => q.eq('status', 'published')],
  ['Brouillons (en attente)', (q) => q.eq('status', 'draft')],
  ['Vendues ou indisponibles', (q) => q.in('status', ['sold', 'unavailable'])],
]
export default function Dashboard() {
  const [n, setN] = useState<Record<string, number>>({})
  const [err, setErr] = useState('')
  useEffect(() => {
    (async () => {
      const out: Record<string, number> = {}
      for (const [k, f] of Q) {
        const { count, error } = await f(supabase.from('listings').select('id', { count: 'exact', head: true }))
        if (error) return setErr(error.message)
        out[k] = count ?? 0
      }
      const l = await supabase.from('customer_leads').select('id', { count: 'exact', head: true })
      const nl = await supabase.from('customer_leads').select('id', { count: 'exact', head: true }).eq('status', 'new')
      out['Demandes reçues'] = l.count ?? 0
      out['Nouvelles demandes'] = nl.count ?? 0
      setN(out)
    })()
  }, [])
  return (
    <>
      <h1>Tableau de bord</h1>
      {err && <p className="warn">{err}</p>}
      <div className="stats">{Object.entries(n).map(([k, v]) => <div key={k} className="stat"><b>{v}</b><span>{k}</span></div>)}</div>
    </>
  )
}
