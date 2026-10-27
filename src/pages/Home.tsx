import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Bubbles from '../components/Bubbles'
import Art from '../components/Art'
import Layout from '../components/Layout'
import ListingCard from '../components/ListingCard'
import { Category, Listing, configured, supabase } from '../lib/supabase'
import { useSettings, waLink } from '../lib/settings'

const STATIC = ['terrains', 'immobilier', 'automobiles', 'motos']
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
        <Bubbles />
        <div className="wrap">
          <h1>Trouvez votre prochain bien avec <span className="brand">AL FOUTIYOU <em>MARKET</em></span></h1>
          <p>Terrains, maisons et véhicules : découvrez les opportunités et contactez notre équipe pour organiser votre visite.</p>
          <div className="row2">
            <Link className="btn act" to="/annonces">Explorer les annonces</Link>
            <button className="btn light" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Proposer un bien</button>
          </div>
        </div>
      </section>
      <main className="wrap">
        {!configured && <p className="warn">Le site n'est pas encore relié à Supabase.</p>}
        <div className="cats">
          {CARDS.map((c) => (
            <Link key={c.slug} to={`/annonces?cat=${c.slug}`} className="cat">
              <div className="cimg">
                {(() => { const u = cats.find((x) => x.slug === c.slug)?.image_url || (STATIC.includes(c.slug) ? `${import.meta.env.BASE_URL}categories/${c.slug}.webp` : null); return u ? <img src={u} alt={c.t} loading="lazy" /> : <Art slug={c.slug} /> })()}
                <span className="ctag">{c.icon} {c.t}</span>
              </div>
              <div className="cbody"><p>{c.p}</p><span className="lnk">{c.b} →</span></div>
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
        <p className="lead">Acheter un terrain, une maison ou un véhicule est une décision importante. Nous vous aidons à la prendre avec des informations claires et un interlocuteur unique.</p>
        <div className="why">
          {[
            ['Des biens examinés avant publication', "Aucun bien n'est publié automatiquement. Notre équipe échange avec le propriétaire, relit les informations transmises et décide de la mise en ligne."],
            ['Un dossier clair avant même la visite', "Chaque fiche présente le prix, les caractéristiques et les documents administratifs déclarés par le propriétaire : titre foncier, bail, délibération, carte grise, certificat de non-gage…"],
            ['Des points de vigilance annoncés', "Statut foncier, hypothèque, litige éventuel, occupation du bien : ces renseignements essentiels sont indiqués pour que vous sachiez à quoi vous attendre."],
            ['Un seul interlocuteur', "Vous n'avez pas à chercher le propriétaire : vous nous contactez, nous vous répondons et organisons la rencontre à votre rythme."],
            ['Des prix affichés en toute transparence', "Le prix demandé est indiqué en francs CFA, avec la mention « négociable » lorsque le propriétaire est ouvert à la discussion."],
            ['Simple, depuis votre téléphone', "Consultez les annonces, filtrez par ville ou par budget et écrivez-nous sur WhatsApp ou par formulaire, sans créer de compte."],
          ].map(([t, d], i) => <article key={t} className="wy"><span className="n">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>

        <h2 className="sec">Comment fonctionne notre service ?</h2>
        <p className="lead">De la première recherche à la conclusion de la vente, nous restons à vos côtés. Le site présente les biens et facilite les échanges : la vente elle-même se conclut avec le propriétaire, avec notre accompagnement.</p>
        <ol className="tl">
          {[
            ['Explorez les annonces', 'Choisissez une catégorie, puis affinez par ville, région ou budget maximum.'],
            ['Étudiez le dossier du bien', "Photos, prix, caractéristiques et documents administratifs déclarés : tout est sur la fiche."],
            ['Contactez-nous', 'Envoyez une demande de renseignements ou écrivez-nous sur WhatsApp, sans inscription.'],
            ['Visitez le bien', 'Nous vous recontactons, fixons un rendez-vous avec le propriétaire et vous accompagnons si besoin.'],
            ['Concluez la vente', "Nous facilitons les échanges et la négociation. Demandez à consulter les documents originaux avant de vous engager."],
          ].map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
        </ol>

        <h2 className="sec">Vous avez un bien à vendre ?</h2>
        <p className="lead">Proposez-le sans créer de compte. Notre équipe vous accompagne à chaque étape.</p>
        <div className="own">
          {[
            ['Prenez contact', 'Écrivez-nous ou appelez-nous pour nous présenter votre bien.'],
            ['Remplissez votre fiche', "Nous vous envoyons un lien sécurisé : prix, documents disponibles, caractéristiques et photos."],
            ['Nous examinons', "Nous vérifions les informations avec vous et vous recontactons avant toute publication."],
            ['Votre annonce est publiée', 'Une fois validée, elle est visible par les acheteurs, et nous gérons les demandes et les visites.'],
          ].map(([t, d], i) => <div key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></div>)}
        </div>
        <section id="contact" className="cta"><Bubbles />
          <h2>Contacter AL FOUTIYOU MARKET</h2>
          <p>Pour proposer un bien ou obtenir un renseignement.</p>
          <div className="row2">
            {wa && <a className="btn wa" href={wa} target="_blank" rel="noreferrer">💬 Écrire sur WhatsApp</a>}
            {s.phone && <a className="btn light" href={`tel:${s.phone}`}>📞 {s.phone}</a>}
            {s.email && <a className="btn light" href={`mailto:${s.email}`}>✉️ {s.email}</a>}
            {!wa && !s.phone && !s.email && <p>Les coordonnées seront bientôt disponibles.</p>}
          </div>
        </section>
      </main>
    </Layout>
  )
}
