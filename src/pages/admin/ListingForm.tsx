import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Category, supabase } from '../../lib/supabase'

export default function ListingForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const [cats, setCats] = useState<Category[]>([])
  const [v, setV] = useState<any>({ title: '', description: '', category_id: '', city: '', region: '', price: '', price_negotiable: false, image_url: '', status: 'draft' })
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    supabase.from('categories').select('*').order('id').then(({ data }) => setCats(data ?? []))
    if (id) supabase.from('listings').select('*').eq('id', id).maybeSingle().then(({ data }) => data && setV({ ...data, price: data.price ?? '', image_url: data.image_url ?? '', city: data.city ?? '', region: data.region ?? '', description: data.description ?? '' }))
  }, [id])
  const on = (k: string) => (e: any) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function save(status: string) {
    if (!v.title.trim() || !v.category_id) return setMsg({ ok: false, t: 'Le titre et la catégorie sont obligatoires.' })
    setBusy(true); setMsg(null)
    const row = { title: v.title.trim(), description: v.description || null, category_id: Number(v.category_id), city: v.city || null, region: v.region || null,
      price: v.price === '' ? null : Number(v.price), price_negotiable: v.price_negotiable, image_url: v.image_url || null, status, updated_at: new Date().toISOString() }
    const { error } = id ? await supabase.from('listings').update(row).eq('id', id) : await supabase.from('listings').insert(row)
    setBusy(false)
    if (error) return setMsg({ ok: false, t: "Enregistrement impossible : " + error.message })
    nav('/admin/annonces')
  }
  return (
    <>
      <h1>{id ? 'Modifier le bien' : 'Ajouter un bien'}</h1>
      <div className="box wide">
        <label>Titre *<input value={v.title} onChange={on('title')} /></label>
        <label>Catégorie *<select value={v.category_id} onChange={on('category_id')}><option value="">Choisir…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Description<textarea rows={5} value={v.description} onChange={on('description')} /></label>
        <label>Ville<input value={v.city} onChange={on('city')} /></label>
        <label>Région<input value={v.region} onChange={on('region')} /></label>
        <label>Prix (FCFA), facultatif<input type="number" min="0" value={v.price} onChange={on('price')} /></label>
        <label className="chk"><input type="checkbox" checked={v.price_negotiable} onChange={on('price_negotiable')} /> Prix négociable</label>
        <label>Photo principale (adresse web de l'image)<input value={v.image_url} onChange={on('image_url')} placeholder="https://…" /></label>
        {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
        <div className="row2">
          <button className="ghost" disabled={busy} onClick={() => save(v.status === 'published' ? 'draft' : v.status)}>Enregistrer sans publier</button>
          <button className="btn act" disabled={busy} onClick={() => save('published')}>{busy ? 'Enregistrement…' : 'Publier'}</button>
          <button className="ghost" onClick={() => nav('/admin/annonces')}>Annuler</button>
        </div>
      </div>
    </>
  )
}
