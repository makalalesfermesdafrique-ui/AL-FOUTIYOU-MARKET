import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const F: [string, string][] = [['company_name', "Nom de l'entreprise"], ['phone', 'Téléphone principal'], ['whatsapp', 'Numéro WhatsApp (chiffres, avec indicatif)'], ['email', 'Adresse e-mail'], ['address', 'Adresse physique'], ['description', 'Description'], ['terms', "Conditions d'utilisation (laisser vide = texte par défaut)"], ['privacy', 'Politique de confidentialité (laisser vide = texte par défaut)']]
export default function Settings() {
  const [v, setV] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  useEffect(() => { supabase.from('company_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => data && setV(data as any)) }, [])
  async function save(e: React.FormEvent) {
    e.preventDefault()
    const p: Record<string, string | null> = {}
    F.forEach(([k]) => (p[k] = (v[k] ?? '').trim() || null))
    p.company_name = p.company_name || 'AL FOUTIYOU MARKET'
    const { error } = await supabase.from('company_settings').update({ ...p, updated_at: new Date().toISOString() }).eq('id', 1)
    setMsg(error ? { ok: false, t: 'Enregistrement impossible : ' + error.message } : { ok: true, t: 'Paramètres enregistrés. Ils sont visibles sur le site.' })
  }
  return (
    <>
      <h1>Paramètres de l'entreprise</h1>
      <form className="box wide" onSubmit={save}>
        {F.map(([k, l]) => <label key={k}>{l}{['description', 'terms', 'privacy'].includes(k) ? <textarea rows={k === 'description' ? 3 : 8} value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} /> : <input value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}</label>)}
        {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
        <button className="btn act">Enregistrer</button>
      </form>
    </>
  )
}
