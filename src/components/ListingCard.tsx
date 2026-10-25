import { Link } from 'react-router-dom'
import { Category, ICON, Listing, fcfa, isNew } from '../lib/supabase'

export default function ListingCard({ l, cat }: { l: Listing; cat?: Category }) {
  return (
    <article className="card">
      <Link to={`/annonce/${l.id}`} className="ph" aria-label={l.title}>
        {l.image_url ? <img src={l.image_url} alt={l.title} loading="lazy" /> : <span>{ICON[cat?.slug ?? ''] ?? '📦'}</span>}
        {cat && <em className="badge">{cat.name}</em>}
        {isNew(l.published_at) && <em className="badge new">Nouveau</em>}
      </Link>
      <div className="body">
        <h3>{l.title}</h3>
        <p className="loc">📍 {[l.city, l.region].filter(Boolean).join(', ') || 'Localité à préciser'}</p>
        <p className="price">{fcfa(l.price)}{l.price_negotiable && l.price != null && <small> · négociable</small>}</p>
        <Link className="btn ghost" to={`/annonce/${l.id}`}>Voir les détails</Link>
      </div>
    </article>
  )
}
