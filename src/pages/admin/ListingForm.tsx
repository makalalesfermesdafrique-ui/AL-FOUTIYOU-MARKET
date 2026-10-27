import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Category, supabase } from '../../lib/supabase'
import ListingBody from '../../components/ListingBody'
import { ICON } from '../../lib/supabase'
import Fields from '../../components/Fields'
import { fieldsFor, pubDetails } from '../../lib/fields'
import Photos, { Item } from '../../components/Photos'
import { pubUrl, uid, upload } from '../../lib/images'

export default function ListingForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const [cats, setCats] = useState<Category[]>([])
  const [v, setV] = useState<any>({ title: '', description: '', category_id: '', city: '', region: '', price: '', price_negotiable: false, image_url: '', status: 'draft' })
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [removed, setRemoved] = useState<{ id: string; path: string; thumb: string | null }[]>([])
  const [prog, setProg] = useState('')
  const [prev, setPrev] = useState(false)
  const [det, setDet] = useState<Record<string, any>>({})
  const slug = cats.find((c) => String(c.id) === String(v.category_id))?.slug ?? ''
  useEffect(() => {
    supabase.from('categories').select('*').order('id').then(({ data }) => setCats(data ?? []))
    if (id) supabase.from('listing_images').select('*').eq('listing_id', id).order('sort_order').then(({ data }) => setItems((data ?? []).map((r: any) => ({ key: r.id, preview: pubUrl(r.thumbnail_path ?? r.storage_path), saved: { id: r.id, path: r.storage_path, thumb: r.thumbnail_path } }))))
    if (id) supabase.from('listings').select('*').eq('id', id).maybeSingle().then(({ data }) => data && (setDet(data.details ?? {}), setV({ ...data, price: data.price ?? '', image_url: data.image_url ?? '', city: data.city ?? '', region: data.region ?? '', description: data.description ?? '' })))
  }, [id])
  const on = (k: string) => (e: any) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function save(status: string) {
    if (!v.title.trim() || !v.category_id) return setMsg({ ok: false, t: 'Le titre et la catégorie sont obligatoires.' })
    setBusy(true); setMsg(null)
    const row: any = { title: v.title.trim(), description: v.description || null, category_id: Number(v.category_id), city: v.city || null, region: v.region || null,
      price: v.price === '' ? null : Number(v.price), price_negotiable: v.price_negotiable, details: pubDetails(slug, det), status, updated_at: new Date().toISOString() }
    try {
      let lid = id
      if (id) { const { error } = await supabase.from('listings').update(row).eq('id', id); if (error) throw error }
      else { const { data, error } = await supabase.from('listings').insert(row).select('id').single(); if (error) throw error; lid = data.id }
      for (const r of removed) {
        await supabase.storage.from('listing-images').remove([r.path, ...(r.thumb ? [r.thumb] : [])])
        await supabase.from('listing_images').delete().eq('id', r.id)
      }
      let n = 0
      const rows: { id: string; path: string; thumb: string | null }[] = []
      for (const it of items) {
        if (it.saved) { rows.push(it.saved); continue }
        n++; setProg(`Envoi des photos ${n}/${items.filter((x) => x.proc).length}…`)
        const base = `${lid}/${uid()}`, p = it.proc!
        await upload('listing-images', `${base}.${p.ext}`, p.full)
        await upload('listing-images', `${base}_t.${p.ext}`, p.thumb)
        const { data, error } = await supabase.from('listing_images').insert({ listing_id: lid, storage_path: `${base}.${p.ext}`, thumbnail_path: `${base}_t.${p.ext}`, sort_order: 0, is_primary: false }).select('id').single()
        if (error) throw error
        rows.push({ id: data.id, path: `${base}.${p.ext}`, thumb: `${base}_t.${p.ext}` })
      }
      for (let i = 0; i < items.length; i++) {
        const rid = items[i].saved?.id ?? rows[i].id
        await supabase.from('listing_images').update({ sort_order: i, is_primary: i === 0 }).eq('id', rid)
      }
      const first = rows[0]
      await supabase.from('listings').update({ image_url: first ? pubUrl(first.thumb ?? first.path) : null }).eq('id', lid!)
    } catch (e: any) {
      setBusy(false); setProg('')
      return setMsg({ ok: false, t: 'Enregistrement impossible : ' + (e.message ?? e) })
    }
    setBusy(false); setProg('')
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
        {slug && <><h3>Dossier administratif et caractéristiques (visibles par les clients)</h3><Fields fields={fieldsFor(slug).filter((f) => f.pub)} v={det} set={(k, x) => setDet({ ...det, [k]: x })} /></>}
        <label>Photos du bien</label>
        <Photos items={items} setItems={(n) => { setRemoved([...removed, ...items.filter((i) => i.saved && !n.some((x) => x.key === i.key)).map((i) => i.saved!)]); setItems(n) }} />
        {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
        <div className="row2">
          <button className="ghost" disabled={busy} onClick={() => save(v.status === 'published' ? 'draft' : v.status)}>Enregistrer sans publier</button>
          <button className="btn act" disabled={busy} onClick={() => save('published')}>{busy ? prog || 'Enregistrement…' : 'Publier'}</button>
          <button className="ghost" onClick={() => setPrev(true)}>👁 Aperçu</button>
          <button className="ghost" onClick={() => nav('/admin/annonces')}>Annuler</button>
        </div>
      </div>
      {prev && (
        <div className="modal" onClick={() => setPrev(false)}>
          <div className="prevbox detail" onClick={(e) => e.stopPropagation()}>
            <div className="bar"><b>Aperçu : voici ce que verront les clients</b><button className="ghost sm" onClick={() => setPrev(false)}>Fermer</button></div>
            <ListingBody icon={ICON[slug] ?? '📦'} imgs={items.map((i) => i.preview)}
              l={{ id: 'apercu', title: v.title || 'Titre de l’annonce', description: v.description, category_id: Number(v.category_id) || null, price: v.price === '' ? null : Number(v.price), city: v.city, region: v.region,
                price_negotiable: v.price_negotiable, image_url: null, details: pubDetails(slug, det), published_at: null, created_at: '' }} />
          </div>
        </div>
      )}
    </>
  )
}
