import { useEffect, useState } from 'react'
import { Category, supabase } from '../../lib/supabase'

type L = { id: string; label: string | null; category_id: number; created_at: string; expires_at: string | null; revoked_at: string | null }
export default function Links() {
  const [cats, setCats] = useState<Category[]>([])
  const [rows, setRows] = useState<L[]>([])
  const [cat, setCat] = useState('')
  const [label, setLabel] = useState('')
  const [days, setDays] = useState('')
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const load = async () => {
    const { data } = await supabase.from('form_links').select('*').order('created_at', { ascending: false })
    setRows(data ?? [])
    const s = await supabase.from('owner_submissions').select('link_id')
    const c: Record<string, number> = {}; (s.data ?? []).forEach((x: any) => { if (x.link_id) c[x.link_id] = (c[x.link_id] ?? 0) + 1 }); setCounts(c)
  }
  useEffect(() => { supabase.from('categories').select('*').order('id').then(({ data }) => setCats(data ?? [])); load() }, [])
  async function create() {
    if (!cat) return setMsg({ ok: false, t: 'Choisissez une catégorie.' })
    const { data, error } = await supabase.rpc('create_form_link', { p_category: Number(cat), p_label: label, p_days: days ? Number(days) : 0 })
    if (error) return setMsg({ ok: false, t: 'Création impossible : ' + error.message })
    setUrl(`${location.origin}${location.pathname}#/proposer/${data}`); setMsg(null); setLabel(''); load()
  }
  async function revoke(id: string) {
    if (!confirm('Désactiver ce lien ? Il ne fonctionnera plus.')) return
    const { error } = await supabase.from('form_links').update({ revoked_at: new Date().toISOString() }).eq('id', id)
    setMsg(error ? { ok: false, t: error.message } : { ok: true, t: 'Lien désactivé.' }); load()
  }
  const status = (r: L) => r.revoked_at ? 'Désactivé' : r.expires_at && new Date(r.expires_at) < new Date() ? 'Expiré' : 'Actif'
  return (
    <>
      <h1>Liens de formulaires</h1>
      <div className="box wide">
        <label>Catégorie du bien<select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Choisir…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Pour qui ? (repère interne, facultatif)<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. M. Diallo, terrain Rufisque" /></label>
        <label>Expire dans (jours, facultatif)<input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} /></label>
        <button className="btn act" onClick={create}>Générer un lien</button>
        {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
        {url && <div className="ok"><b>Copiez ce lien maintenant : il ne sera plus affiché.</b><input readOnly value={url} onFocus={(e) => e.target.select()} />
          <div className="row2"><button onClick={() => navigator.clipboard.writeText(url).then(() => setMsg({ ok: true, t: 'Lien copié.' }))}>Copier</button>
            <a className="btn act" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent('Bonjour, voici le lien pour proposer votre bien à AL FOUTIYOU MARKET : ' + url)}`}>Partager sur WhatsApp</a></div></div>}
      </div>
      <div className="scroll"><table><tbody>
        {rows.map((r) => (
          <tr key={r.id}><td><b>{r.label || 'Sans repère'}</b><br /><small>{cats.find((c) => c.id === r.category_id)?.name} · créé le {new Date(r.created_at).toLocaleDateString('fr-FR')}{r.expires_at && ` · expire le ${new Date(r.expires_at).toLocaleDateString('fr-FR')}`}</small></td>
            <td><span className="pill">{status(r)}</span></td><td>{counts[r.id] ?? 0} proposition(s)</td>
            <td>{!r.revoked_at && <button className="sm danger" onClick={() => revoke(r.id)}>Désactiver</button>}</td></tr>
        ))}
        {!rows.length && <tr><td>Aucun lien créé.</td></tr>}
      </tbody></table></div>
    </>
  )
}
