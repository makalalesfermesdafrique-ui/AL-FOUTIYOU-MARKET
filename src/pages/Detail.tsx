import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { ICON, Listing, fcfa, supabase } from '../lib/supabase'
import { pubUrl } from '../lib/images'
import { useSettings, waLink } from '../lib/settings'

export default function Detail() {
  const { id } = useParams()
  const s = useSettings()
  const [l, setL] = useState<Listing | null>(null)
  const [slug, setSlug] = useState('')
  const [state, setState] = useState<'load' | 'ok' | 'none' | 'err'>('load')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [imgs, setImgs] = useState<string[]>([])
  const [cur, setCur] = useState(0)

  useEffect(() => {
    supabase.from('public_listings').select('*').eq('id', id).maybeSingle().then(async ({ data, error }) => {
      if (error) return setState('err')
      if (!data) return setState('none')
      setL(data as Listing); setState('ok')
      const c = await supabase.from('categories').select('slug').eq('id', (data as Listing).category_id).maybeSingle()
      setSlug(c.data?.slug ?? '')
      const im = await supabase.from('public_listing_images').select('storage_path,sort_order').eq('listing_id', id).order('sort_order')
      setImgs((im.data ?? []).map((r: any) => pubUrl(r.storage_path)))
    })
  }, [id])

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const f = new FormData(e.currentTarget)
    const mail = String(f.get('email') || '')
    const { error } = await supabase.from('customer_leads').insert({
      listing_id: id, name: f.get('name'), phone: f.get('phone'),
      message: [mail && `E-mail : ${mail}`, f.get('message')].filter(Boolean).join('\n'),
    })
    setBusy(false)
    if (error) setMsg({ ok: false, t: "Votre demande n'a pas pu être enregistrée. Vérifiez votre connexion puis réessayez." })
    else { setMsg({ ok: true, t: 'Merci ! Votre demande a bien été reçue. Notre équipe vous recontactera.' }); e.currentTarget.reset() }
  }

  if (state === 'load') return <Layout><main className="wrap"><p className="mut">Chargement…</p></main></Layout>
  if (state === 'err') return <Layout><main className="wrap"><p className="warn">Chargement impossible. Vérifiez votre connexion.</p></main></Layout>
  if (state === 'none' || !l) return <Layout><main className="wrap"><div className="empty"><h3>Annonce introuvable</h3><p>Elle n'est plus publiée ou le lien est incorrect.</p><Link className="btn" to="/annonces">Voir les annonces</Link></div></main></Layout>
  const wa = waLink(s.whatsapp, `Bonjour, je suis intéressé par : ${l.title}`)

  return (
    <Layout>
      <main className="wrap detail">
        <p><Link to="/annonces">← Toutes les annonces</Link></p>
        <div className="ph big">{(imgs[cur] ?? l.image_url) ? <img src={imgs[cur] ?? l.image_url!} alt={`${l.title} – photo ${cur + 1}`} /> : <span>{ICON[slug] ?? '📦'}</span>}
          {imgs.length > 1 && <><button className="nv l" aria-label="Photo précédente" onClick={() => setCur((cur + imgs.length - 1) % imgs.length)}>◀</button><button className="nv r" aria-label="Photo suivante" onClick={() => setCur((cur + 1) % imgs.length)}>▶</button></>}
        </div>
        {imgs.length > 1 && <div className="strip">{imgs.map((u, i) => <img key={u} src={u} alt={`Miniature ${i + 1}`} className={i === cur ? 'on' : ''} onClick={() => setCur(i)} loading="lazy" />)}</div>}
        <h1>{l.title}</h1>
        <p className="loc">📍 {[l.city, l.region].filter(Boolean).join(', ') || 'Localité à préciser'}</p>
        <p className="price big">{fcfa(l.price)}{l.price_negotiable && l.price != null && <small> · négociable</small>}</p>
        {l.published_at && <p className="mut">Publiée le {new Date(l.published_at).toLocaleDateString('fr-FR')}</p>}
        <p className="desc">{l.description || 'Aucune description détaillée pour le moment.'}</p>
        <div className="row2">
          {wa && <a className="btn act" href={wa} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
          {navigator.share && <button className="btn ghost" onClick={() => navigator.share({ title: l.title, url: location.href })}>Partager</button>}
        </div>
        <form onSubmit={send} className="box">
          <h2>Demander des renseignements</h2>
          <label>Nom<input name="name" required autoComplete="name" /></label>
          <label>Téléphone<input name="phone" type="tel" required autoComplete="tel" /></label>
          <label>E-mail (facultatif)<input name="email" type="email" autoComplete="email" /></label>
          <label>Message<textarea name="message" rows={3} /></label>
          <button className="btn act" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer ma demande'}</button>
          {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
        </form>
      </main>
    </Layout>
  )
}
