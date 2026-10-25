import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Category, Listing, WHATSAPP, configured, fcfa, supabase } from '../lib/supabase'

export default function Home() {
  const [cats, setCats] = useState<Category[]>([])
  const [items, setItems] = useState<Listing[]>([])
  const [cat, setCat] = useState<number | null>(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Listing | null>(null)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('*').order('id').then(({ data }) => setCats(data ?? []))
    supabase.from('public_listings').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setErr(error.message)
      setItems(data ?? [])
    })
  }, [])

  const shown = items.filter(
    (i) => (!cat || i.category_id === cat) && (i.title + ' ' + (i.city ?? '')).toLowerCase().includes(q.toLowerCase()),
  )

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.from('customer_leads').insert({
      listing_id: sel?.id, name: f.get('name'), phone: f.get('phone'), message: f.get('message'),
    })
    if (error) setErr(error.message)
    else { setSent(true); setSel(null) }
  }

  return (
    <>
      <header className="hero">
        <h1>AL FOUTIYOU MARKET</h1>
        <p>Les bonnes opportunités, au bon endroit</p>
        <input placeholder="Rechercher (titre, ville)…" value={q} onChange={(e) => setQ(e.target.value)} />
      </header>
      <main>
        {!configured && <p className="warn">Supabase n'est pas configuré (secrets GitHub manquants).</p>}
        {err && <p className="warn">{err}</p>}
        {sent && <p className="ok">Merci ! Nous vous recontactons très vite.</p>}
        <div className="chips">
          <button className={!cat ? 'on' : ''} onClick={() => setCat(null)}>Tout</button>
          {cats.map((c) => (
            <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.name}</button>
          ))}
        </div>
        <div className="grid">
          {shown.map((l) => (
            <article key={l.id} className="card">
              {l.image_url && <img src={l.image_url} alt={l.title} />}
              <h3>{l.title}</h3>
              <p>{l.description}</p>
              <p className="price">{fcfa(l.price)} {l.city && <small>· {l.city}</small>}</p>
              <button onClick={() => { setSel(l); setSent(false) }}>Je suis intéressé</button>
              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Bonjour, je suis intéressé par : ' + l.title)}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </article>
          ))}
          {!shown.length && <p>Aucune annonce pour le moment.</p>}
        </div>
      </main>
      {sel && (
        <div className="modal" onClick={() => setSel(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={send}>
            <h3>{sel.title}</h3>
            <input name="name" placeholder="Votre nom" required />
            <input name="phone" placeholder="Téléphone" required />
            <textarea name="message" placeholder="Message (facultatif)" />
            <button>Envoyer</button>
          </form>
        </div>
      )}
      <footer><Link to="/admin">Espace administrateur</Link></footer>
    </>
  )
}
