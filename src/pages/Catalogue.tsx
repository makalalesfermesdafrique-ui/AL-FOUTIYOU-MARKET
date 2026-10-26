import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Bubbles from '../components/Bubbles'
import Layout from '../components/Layout'
import ListingCard from '../components/ListingCard'
import { Category, Listing, supabase } from '../lib/supabase'

const PAGE = 12
export default function Catalogue() {
  const [sp, setSp] = useSearchParams()
  const [cats, setCats] = useState<Category[]>([])
  const [items, setItems] = useState<Listing[]>([])
  const [more, setMore] = useState(false)
  const [state, setState] = useState<'load' | 'ok' | 'err'>('load')
  const q = sp.get('q') ?? '', cat = sp.get('cat') ?? '', city = sp.get('city') ?? '', region = sp.get('region') ?? ''
  const max = sp.get('max') ?? '', sort = sp.get('sort') ?? 'desc'
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }) }

  useEffect(() => { supabase.from('categories').select('*').order('id').then(({ data }) => setCats(data ?? [])) }, [])

  async function run(from: number) {
    setState('load')
    let r = supabase.from('public_listings').select('*')
    const c = cats.find((x) => x.slug === cat)
    if (cat && c) r = r.eq('category_id', c.id)
    if (q) r = r.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    if (city) r = r.ilike('city', `%${city}%`)
    if (region) r = r.ilike('region', `%${region}%`)
    if (max) r = r.lte('price', Number(max))
    const { data, error } = await r.order('published_at', { ascending: sort === 'asc' }).range(from, from + PAGE - 1)
    if (error) return setState('err')
    setItems(from ? [...items, ...(data ?? [])] : data ?? [])
    setMore((data ?? []).length === PAGE)
    setState('ok')
  }
  useEffect(() => { if (cat && !cats.length) return; run(0) }, [q, cat, city, region, max, sort, cats])

  return (
    <Layout>
      <section className="banner" style={{ backgroundImage: `linear-gradient(rgba(6,28,21,.75),rgba(6,28,21,.88)), url(${import.meta.env.BASE_URL}hero.jpg), linear-gradient(135deg,#0f3d2e,#0a2a20)` }}>
        <Bubbles /><h1 className="outline">Nos annonces</h1>
      </section>
      <main className="wrap">
        <div style={{ height: 18 }} />
        <div className="filters">
          <input aria-label="Mot-clé" placeholder="Mot-clé" key={q} defaultValue={q} onBlur={(e) => set('q', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && set('q', e.currentTarget.value)} />
          <select aria-label="Catégorie" value={cat} onChange={(e) => set('cat', e.target.value)}>
            <option value="">Toutes les catégories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <input aria-label="Ville" placeholder="Ville" key={city} defaultValue={city} onBlur={(e) => set('city', e.target.value)} />
          <input aria-label="Région" placeholder="Région" key={region} defaultValue={region} onBlur={(e) => set('region', e.target.value)} />
          <input aria-label="Budget maximum" type="number" min="0" placeholder="Budget max (FCFA)" key={max} defaultValue={max} onBlur={(e) => set('max', e.target.value)} />
          <select aria-label="Tri" value={sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="desc">Plus récentes</option><option value="asc">Plus anciennes</option>
          </select>
        </div>
        {state === 'err' && <p className="warn">Chargement impossible. <button className="btn ghost" onClick={() => run(0)}>Réessayer</button></p>}
        {state === 'ok' && !items.length && <div className="empty"><h3>Aucune annonce ne correspond</h3><p>Modifiez vos critères ou contactez-nous pour une recherche personnalisée.</p></div>}
        <div className="grid">{items.map((l) => <ListingCard key={l.id} l={l} cat={cats.find((c) => c.id === l.category_id)} />)}</div>
        {state === 'load' && <p className="mut center">Chargement…</p>}
        {more && state === 'ok' && <p className="center"><button className="btn" onClick={() => run(items.length)}>Voir plus d'annonces</button></p>}
      </main>
    </Layout>
  )
}
