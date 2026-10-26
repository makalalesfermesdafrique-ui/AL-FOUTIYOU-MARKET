import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import ListingCard from '../components/ListingCard'
import { Category, Listing, configured, supabase } from '../lib/supabase'
import { useSettings, waLink } from '../lib/settings'

const CARDS = [
  { slug: 'terrains', icon: '🌍', t: 'Terrains', p: 'Découvrez des opportunités foncières.', b: 'Voir les terrains' },
  { slug: 'immobilier', icon: '🏠', t: 'Immobilier', p: 'Maisons, appartements, villas et locaux commerciaux.', b: 'Voir les biens immobiliers' },
  { slug: 'automobiles', icon: '🚗', t: 'Automobiles', p: 'Découvrez les véhicules disponibles.', b: 'Voir les voitures' },
  { slug: 'motos', icon: '🏍️', t: 'Motos et autres véhicules', p: 'Explorez les motos et autres véhicules.', b: 'Voir les véhicules' },
]

export default function Home() {
  const s = useSettings()
  const [cats, setCats] = useState<Category[]>([])
  const [items, setItems] = useState<Listing[]>([])
  const [state, setState] = useState<'load' | 'ok' | 'err'>('load')
  const load = () => {
    setState('load')
    supabase.from('categories').select('*').then(({ data }) => setCats(data ?? []))
    supabase.from('public_listings').select('*').order('published_at', { ascending: false }).limit(6)
      .then(({ data, error }) => { if (error) setState('err'); else { setItems(data ?? []); setState('ok') } })
  }
  useEffect(load, [])
  const wa = waLink(s.whatsapp, 'Bonjour, je souhaite proposer un bien. ')

  return (
    <Layout>
      <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(6,28,21,.72),rgba(6,28,21,.86)), url(${import.meta.env.BASE_URL}hero.jpg), linear-gradient(135deg,#0f3d2e,#0a2a20)` }}>
        <div className="wrap">
          <h1>Trouvez votre prochain bien avec <span className="outline">AL FOUTIYOU MARKET</span></h1>
          <p>Terrains, maisons et véhicules : découvrez les opportunités et contactez notre équipe pour organiser votre visite.</p>
          <div className="row2">
            <Link className="btn act" to="/annonces">Explorer les annonces</Link>
            <a className="btn light" href="#contact">Proposer un bien</a>
          </div>
        </div>
      </section>
      <main className="wrap">
        {!configured && <p className="warn">Le site n'est pas encore relié à Supabase.</p>}
        <div className="cats">
          {CARDS.map((c) => (
            <Link key={c.slug} to={`/annonces?cat=${c.slug}`} className="cat">
              <span className="ic">{c.icon}</span><h3>{c.t}</h3><p>{c.p}</p><span className="lnk">{c.b}</span>
            </Link>
          ))}
        </div>
        <h2 className="sec">Les dernières annonces publiées</h2>
        {state === 'load' && <p className="mut">Chargement des annonces…</p>}
        {state === 'err' && <p className="warn">Impossible de charger les annonces. <button className="btn ghost" onClick={load}>Réessayer</button></p>}
        {state === 'ok' && !items.length && (
          <div className="empty"><h3>Les premières annonces arrivent bientôt</h3>
            <p>Vous avez un terrain, une maison ou un véhicule à vendre ? Contactez AL FOUTIYOU MARKET pour le proposer.</p></div>
        )}
        <div className="grid">{items.map((l) => <ListingCard key={l.id} l={l} cat={cats.find((c) => c.id === l.category_id)} />)}</div>
        {!!items.length && <p className="center"><Link className="btn" to="/annonces">Voir toutes les annonces</Link></p>}

        <h2 className="sec">Pourquoi choisir AL FOUTIYOU MARKET ?</h2>
        <div className="three">
          <div><h3>Mise en relation de confiance</h3><p>Notre équipe examine chaque bien avant publication.</p></div>
          <div><h3>Un seul interlocuteur</h3><p>Vous nous contactez, nous organisons la visite avec le propriétaire.</p></div>
          <div><h3>Simple depuis votre téléphone</h3><p>Consultez, filtrez et écrivez-nous sans créer de compte.</p></div>
        </div>
        <h2 className="sec">Comment fonctionne notre service ?</h2>
        <ol className="steps">
          <li>Vous parcourez les annonces publiées.</li>
          <li>Vous nous envoyez une demande de renseignements.</li>
          <li>Nous vous recontactons et organisons la visite.</li>
          <li>Nous facilitons les échanges jusqu'à la vente.</li>
        </ol>
        <section id="contact" className="cta">
          <h2>Contacter AL FOUTIYOU MARKET</h2>
          <p>Pour proposer un bien ou obtenir un renseignement.</p>
          <div className="row2">
            {wa && <a className="btn act" href={wa} target="_blank" rel="noreferrer">💬 Écrire sur WhatsApp</a>}
            {s.phone && <a className="btn light" href={`tel:${s.phone}`}>📞 {s.phone}</a>}
            {s.email && <a className="btn light" href={`mailto:${s.email}`}>✉️ {s.email}</a>}
            {!wa && !s.phone && !s.email && <p>Les coordonnées seront bientôt disponibles.</p>}
          </div>
        </section>
      </main>
    </Layout>
  )
}
