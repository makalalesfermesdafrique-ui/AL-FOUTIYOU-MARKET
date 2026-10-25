import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { waLink } from '../../lib/settings'

const LS: Record<string, string> = { new: 'Nouvelle demande', contacted: 'Client contacté', visit_to_plan: 'Visite à organiser', visit_done: 'Visite organisée', negotiating: 'Négociation en cours', sold: 'Vente réalisée', closed: 'Demande clôturée' }
type Lead = { id: string; name: string; phone: string; message: string | null; status: string; admin_notes: string | null; created_at: string; listings: { title: string } | null }

export default function Leads() {
  const [rows, setRows] = useState<Lead[]>([])
  const [f, setF] = useState('')
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('customer_leads').select('*, listings(title)').order('created_at', { ascending: false })
    .then(({ data, error }) => { if (error) setMsg(error.message); else setRows((data ?? []) as any) })
  useEffect(() => { load() }, [])
  async function up(id: string, patch: object) {
    const { error } = await supabase.from('customer_leads').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
    setMsg(error ? 'Mise à jour impossible : ' + error.message : 'Enregistré.')
    if (!error) load()
  }
  const shown = rows.filter((r) => (!f || r.status === f) && (r.name + r.phone + (r.listings?.title ?? '')).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <h1>Demandes de renseignements</h1>
      <div className="filters">
        <input aria-label="Rechercher" placeholder="Nom, téléphone, bien…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Statut" value={f} onChange={(e) => setF(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(LS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      {msg && <p className="ok">{msg}</p>}
      {shown.map((r) => (
        <article key={r.id} className="box wide lead">
          <div className="bar"><b>{r.name}</b><small>{new Date(r.created_at).toLocaleString('fr-FR')}</small></div>
          <p>📞 <a href={`tel:${r.phone}`}>{r.phone}</a> · Bien : {r.listings?.title ?? 'Demande générale'}</p>
          {r.message && <p className="msgbox">{r.message}</p>}
          <select aria-label="Statut" value={r.status} onChange={(e) => up(r.id, { status: e.target.value })}>{Object.entries(LS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <textarea aria-label="Notes internes" rows={2} placeholder="Notes internes (invisibles au public)" defaultValue={r.admin_notes ?? ''} onBlur={(e) => e.target.value !== (r.admin_notes ?? '') && up(r.id, { admin_notes: e.target.value })} />
          {waLink(r.phone) && <a className="btn act" target="_blank" rel="noreferrer" href={waLink(r.phone, `Bonjour ${r.name}, ici AL FOUTIYOU MARKET au sujet de votre demande.`)}>💬 Écrire sur WhatsApp</a>}
        </article>
      ))}
      {!shown.length && <div className="empty">Aucune demande pour le moment.</div>}
    </>
  )
}
