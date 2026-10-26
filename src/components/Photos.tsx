import { useRef, useState } from 'react'
import { Processed, processImage } from '../lib/images'

export type Item = { key: string; preview: string; saved?: { id: string; path: string; thumb: string | null }; proc?: Processed }
export default function Photos({ items, setItems, max = 8 }: { items: Item[]; setItems: (i: Item[]) => void; max?: number }) {
  const ref = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function add(files: FileList | null) {
    if (!files?.length) return
    setErr(''); setBusy(true)
    const out = [...items]; const errs: string[] = []
    for (const f of Array.from(files)) {
      if (out.length >= max) { errs.push(`Maximum ${max} photos.`); break }
      try { const p = await processImage(f); out.push({ key: crypto.randomUUID(), preview: p.preview, proc: p }) } catch (e: any) { errs.push(e.message) }
    }
    setItems(out); setErr(errs.join(' ')); setBusy(false)
    if (ref.current) ref.current.value = ''
  }
  const move = (i: number, d: number) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setItems(a) }
  return (
    <div className="photos">
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => add(e.target.files)} />
      <button type="button" className="ghost" disabled={busy || items.length >= max} onClick={() => ref.current?.click()}>{busy ? 'Préparation des photos…' : '📷 Ajouter des photos'}</button>
      <small className="mut"> JPEG, PNG ou WebP · {items.length}/{max} · compression automatique</small>
      {err && <p className="warn">{err}</p>}
      <div className="thumbs">
        {items.map((it, i) => (
          <figure key={it.key}>
            <img src={it.preview} alt={`Photo ${i + 1}`} />
            {i === 0 && <em className="badge">Principale</em>}
            <div className="mv">
              <button type="button" aria-label="Avancer" onClick={() => move(i, -1)}>◀</button>
              <button type="button" aria-label="Reculer" onClick={() => move(i, 1)}>▶</button>
              <button type="button" className="danger" aria-label="Supprimer" onClick={() => setItems(items.filter((x) => x.key !== it.key))}>✕</button>
            </div>
          </figure>
        ))}
      </div>
      {items.length > 1 && <small className="mut">La première photo est la photo principale. Utilisez ◀ ▶ pour changer l'ordre.</small>}
    </div>
  )
}
