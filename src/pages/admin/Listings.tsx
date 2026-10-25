import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fcfa, supabase } from '../../lib/supabase'

type Row = { id: string; title: string; price: number | null; status: string; city: string | null }
export const ST: Record<string, string> = { draft: 'Brouillon', published: 'Publiée', sold: 'Vendue', unavailable: 'Indisponible', archived: 'Archivée' }

export default function Listings() {
  const [rows, setRows] = useState<Row[]>([])
  const [f, setF] = useState('')
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('listings').select('id,title,price,status,city').order('created_at', { ascending: false })
    .then(({ data, error }) => { if (error) setMsg(error.message); else setRows(data ?? []) })
  useEffect(() => { load() }, [])
  async function set(id: string, status: string) {
    const { error } = await supabase.from('listings').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setMsg(error ? "Action impossible : " + error.message : 'Statut mis à jour.'); load()
  }
  async function del(r: Row) {
    if (!confirm(`Supprimer définitivement « ${r.title} » ?`)) return
    const { error } = await supabase.from('listings').delete().eq('id', r.id)
    setMsg(error ? 'Suppression réservée au super administrateur.' : 'Annonce supprimée.'); load()
  }
  const shown = rows.filter((r) => !f || r.status === f)
  return (
    <>
      <div className="bar"><h1>Annonces</h1><Link className="btn act" to="/admin/annonces/nouveau">+ Ajouter un bien</Link></div>
      <select aria-label="Filtrer par statut" value={f} onChange={(e) => setF(e.target.value)}>
        <option value="">Tous les statuts</option>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {msg && <p className="ok">{msg}</p>}
      <div className="scroll"><table><tbody>
        {shown.map((r) => (
          <tr key={r.id}>
            <td><b>{r.title}</b><br /><small>{r.city}</small></td><td>{fcfa(r.price)}</td><td><span className={'pill ' + r.status}>{ST[r.status]}</span></td>
            <td>
              <Link className="btn ghost sm" to={`/admin/annonces/${r.id}`}>Modifier</Link>
              {r.status === 'published'
                ? <button className="sm" onClick={() => set(r.id, 'draft')}>Dépublier</button>
                : r.status !== 'archived' && <button className="sm" onClick={() => set(r.id, 'published')}>Publier</button>}
              {r.status === 'published' && <button className="sm ghost" onClick={() => set(r.id, 'sold')}>Vendu</button>}
              {r.status !== 'archived' ? <button className="sm ghost" onClick={() => set(r.id, 'archived')}>Archiver</button> : <button className="sm ghost" onClick={() => set(r.id, 'draft')}>Restaurer</button>}
              <button className="sm danger" onClick={() => del(r)}>Supprimer</button>
            </td>
          </tr>
        ))}
        {!shown.length && <tr><td>Aucune annonce. Cliquez sur « Ajouter un bien ».</td></tr>}
      </tbody></table></div>
    </>
  )
}
