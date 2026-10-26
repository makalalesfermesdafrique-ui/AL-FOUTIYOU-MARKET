import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fcfa, supabase } from '../../lib/supabase'
import { waLink } from '../../lib/settings'

const SS: Record<string, string> = { new: 'Nouvelle', in_review: "En cours d'examen", info_requested: 'Informations demandées', contacted: 'Propriétaire contacté', validated: 'Validée pour publication', refused: 'Refusée', converted: 'Convertie en annonce' }
export default function Submissions() {
  const nav = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [f, setF] = useState('')
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('owner_submissions').select('*').order('created_at', { ascending: false }).then(({ data, error }) => { if (error) setMsg(error.message); else setRows(data ?? []) })
  useEffect(() => { load() }, [])
  async function up(id: string, patch: object) {
    const { error } = await supabase.from('owner_submissions').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
    setMsg(error ? 'Mise à jour impossible : ' + error.message : 'Enregistré.'); if (!error) load()
  }
  async function convert(id: string) {
    const { error } = await supabase.rpc('convert_submission', { p_id: id })
    if (error) return setMsg('Conversion impossible : ' + error.message)
    nav('/admin/annonces')
  }
  const shown = rows.filter((r) => !f || r.status === f)
  return (
    <>
      <h1>Propositions reçues</h1>
      <select aria-label="Statut" value={f} onChange={(e) => setF(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(SS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      {msg && <p className="ok">{msg}</p>}
      {shown.map((r) => (
        <article key={r.id} className="box wide lead">
          <div className="bar"><b>{r.title}</b><small>{new Date(r.created_at).toLocaleString('fr-FR')}</small></div>
          <p>👤 {r.owner_name} · 📞 <a href={`tel:${r.owner_phone}`}>{r.owner_phone}</a>{r.owner_email && ` · ✉️ ${r.owner_email}`}</p>
          <p>📍 {[r.city, r.region].filter(Boolean).join(', ')} · {fcfa(r.price)}{r.price_negotiable && ' (négociable)'}</p>
          {r.description && <p className="msgbox">{r.description}</p>}
          {Object.entries(r.form_data ?? {}).map(([k, x]) => <p key={k} className="mut">{k.replace(/_/g, ' ')} : {String(x)}</p>)}
          <select aria-label="Statut" value={r.status} onChange={(e) => up(r.id, { status: e.target.value })}>{Object.entries(SS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <textarea aria-label="Notes internes" rows={2} placeholder="Notes internes" defaultValue={r.admin_notes ?? ''} onBlur={(e) => e.target.value !== (r.admin_notes ?? '') && up(r.id, { admin_notes: e.target.value })} />
          <div className="row2">
            {waLink(r.owner_phone) && <a className="btn act" target="_blank" rel="noreferrer" href={waLink(r.owner_phone, `Bonjour ${r.owner_name}, ici AL FOUTIYOU MARKET au sujet de votre proposition « ${r.title} ».`)}>💬 WhatsApp</a>}
            {r.listing_id ? <button className="ghost" onClick={() => nav(`/admin/annonces/${r.listing_id}`)}>Ouvrir l'annonce créée</button> : <button onClick={() => convert(r.id)}>Créer l'annonce (brouillon)</button>}
          </div>
        </article>
      ))}
      {!shown.length && <div className="empty">Aucune proposition pour le moment.</div>}
    </>
  )
}
