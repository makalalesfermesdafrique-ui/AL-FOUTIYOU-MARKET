import { useEffect, useState } from 'react'
import Art from '../../components/Art'
import { Category, supabase } from '../../lib/supabase'
import { processImage, pubUrl, uid, upload } from '../../lib/images'

export default function Categories() {
  const [rows, setRows] = useState<(Category & { image_url: string | null })[]>([])
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [busy, setBusy] = useState('')
  const load = () => supabase.from('categories').select('*').order('id').then(({ data }) => setRows((data ?? []) as any))
  useEffect(() => { load() }, [])
  async function pick(c: Category, f?: File) {
    if (!f) return
    setBusy(c.slug); setMsg(null)
    try {
      const p = await processImage(f)
      const path = `categories/${c.slug}-${uid()}.${p.ext}`
      await upload('listing-images', path, p.full)
      const { error } = await supabase.from('categories').update({ image_url: pubUrl(path) }).eq('id', c.id)
      if (error) throw error
      setMsg({ ok: true, t: `Photo « ${c.name} » enregistrée. Elle apparaît sur l'accueil.` }); load()
    } catch (e: any) { setMsg({ ok: false, t: 'Impossible : ' + (e.message ?? e) }) }
    setBusy('')
  }
  async function clear(c: Category) {
    const { error } = await supabase.from('categories').update({ image_url: null }).eq('id', c.id)
    setMsg(error ? { ok: false, t: error.message } : { ok: true, t: 'Photo retirée.' }); load()
  }
  return (
    <>
      <h1>Photos des catégories</h1>
      <p className="mut">Ces photos s'affichent sur les grandes cartes de l'accueil. Utilisez de vraies photos dont vous avez les droits (format horizontal conseillé).</p>
      {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
      <div className="catadm">
        {rows.map((c) => (
          <div key={c.id} className="box">
            <div className="cimg">{c.image_url ? <img src={c.image_url} alt={c.name} /> : <Art slug={c.slug} />}</div>
            <b>{c.name}</b>
            <label className="btn ghost sm">{busy === c.slug ? 'Envoi…' : c.image_url ? 'Changer la photo' : '📷 Ajouter une photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={!!busy} onChange={(e) => { pick(c, e.target.files?.[0]); e.target.value = '' }} /></label>
            {c.image_url && <button className="sm danger" onClick={() => clear(c)}>Retirer</button>}
          </div>
        ))}
      </div>
    </>
  )
}
