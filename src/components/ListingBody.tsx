import { useState } from 'react'
import { Listing, fcfa } from '../lib/supabase'
import { allLabel, val } from '../lib/fields'

export default function ListingBody({ l, imgs, icon }: { l: Listing; imgs: string[]; icon: string }) {
  const [cur, setCur] = useState(0)
  const main = imgs[cur] ?? l.image_url
  const d = l.details ?? {}
  return (
    <>
      <div className="ph big">{main ? <img src={main} alt={`${l.title} – photo ${cur + 1}`} /> : <span>{icon}</span>}
        {imgs.length > 1 && <><button type="button" className="nv l" aria-label="Photo précédente" onClick={() => setCur((cur + imgs.length - 1) % imgs.length)}>◀</button><button type="button" className="nv r" aria-label="Photo suivante" onClick={() => setCur((cur + 1) % imgs.length)}>▶</button></>}
      </div>
      {imgs.length > 1 && <div className="strip">{imgs.map((u, i) => <img key={u} src={u} alt={`Miniature ${i + 1}`} className={i === cur ? 'on' : ''} onClick={() => setCur(i)} loading="lazy" />)}</div>}
      <h1>{l.title}</h1>
      <p className="loc">📍 {[l.city, l.region].filter(Boolean).join(', ') || 'Localité à préciser'}</p>
      <p className="price big">{fcfa(l.price)}{l.price_negotiable && l.price != null && <small> · négociable</small>}</p>
      {l.published_at && <p className="mut">Publiée le {new Date(l.published_at).toLocaleDateString('fr-FR')}</p>}
      <p className="desc">{l.description || 'Aucune description détaillée pour le moment.'}</p>
      {!!Object.keys(d).length && (
        <section className="info">
          <h2>Informations pour l'acheteur</h2>
          <dl>{Object.entries(d).filter(([k]) => k !== 'documents' && k !== 'observations').map(([k, x]) => <div key={k}><dt>{allLabel(k)}</dt><dd>{val(x)}</dd></div>)}</dl>
          {!!d.documents?.length && <><h3>Documents administratifs déclarés</h3><ul className="docs">{(d.documents as string[]).map((x) => <li key={x}>✓ {x}</li>)}</ul></>}
          {d.observations && <p className="desc">{d.observations}</p>}
          <p className="mut">Informations déclarées par le propriétaire. AL FOUTIYOU MARKET les vérifie avec lui avant toute vente : demandez-nous de voir les documents lors de la visite.</p>
        </section>
      )}
    </>
  )
}
