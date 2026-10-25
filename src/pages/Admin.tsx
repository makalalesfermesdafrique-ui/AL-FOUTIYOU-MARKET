import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Category, fcfa, supabase } from '../lib/supabase'

type Row = { id: string; title: string; price: number | null; status: string; city: string | null }
type Lead = { id: string; name: string; phone: string; message: string | null; created_at: string }

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [cats, setCats] = useState<Category[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  async function load() {
    const p = await supabase.from('profiles').select('active').maybeSingle()
    setActive(p.data?.active ?? false)
    if (!p.data?.active) return
    const l = await supabase.from('listings').select('id,title,price,status,city').order('created_at', { ascending: false })
    setRows(l.data ?? [])
    const c = await supabase.from('customer_leads').select('*').order('created_at', { ascending: false })
    setLeads(c.data ?? [])
    const k = await supabase.from('categories').select('*')
    setCats(k.data ?? [])
  }
  useEffect(() => { if (session) load() }, [session])

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) })
    setMsg(error ? error.message : '')
  }
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.from('listings').insert({
      title: f.get('title'), description: f.get('description'), price: f.get('price') ? Number(f.get('price')) : null,
      city: f.get('city'), image_url: f.get('image_url') || null, category_id: Number(f.get('category_id')), status: f.get('status'),
    })
    setMsg(error ? error.message : 'Annonce ajoutée.')
    if (!error) { e.currentTarget.reset(); load() }
  }
  async function setStatus(id: string, status: string) {
    await supabase.from('listings').update({ status }).eq('id', id); load()
  }
  async function remove(id: string) {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    setMsg(error ? 'Suppression réservée au super_admin.' : ''); load()
  }

  if (!ready) return <main>Chargement…</main>
  if (!session)
    return (
      <main className="narrow">
        <h2>Connexion administrateur</h2>
        <form onSubmit={login}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Mot de passe" required />
          <button>Se connecter</button>
        </form>
        {msg && <p className="warn">{msg}</p>}
        <Link to="/">← Retour au site</Link>
      </main>
    )
  if (active === false)
    return (
      <main className="narrow">
        <p className="warn">Compte non activé. Un super_admin doit l'activer (voir README).</p>
        <button onClick={() => supabase.auth.signOut()}>Déconnexion</button>
      </main>
    )

  return (
    <main className="wrap">
      <div className="bar">
        <h2>Administration</h2>
        <span><Link to="/">Site</Link> <button onClick={() => supabase.auth.signOut()}>Déconnexion</button></span>
      </div>
      {msg && <p className="ok">{msg}</p>}
      <h3>Nouvelle annonce</h3>
      <form onSubmit={add} className="row">
        <input name="title" placeholder="Titre" required />
        <input name="price" type="number" placeholder="Prix (FCFA)" />
        <input name="city" placeholder="Ville" />
        <input name="image_url" placeholder="URL photo" />
        <select name="category_id" required>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="status"><option value="draft">Brouillon</option><option value="published">Publiée</option></select>
        <textarea name="description" placeholder="Description" />
        <button>Ajouter</button>
      </form>
      <h3>Annonces ({rows.length})</h3>
      <table><tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.title}</td><td>{fcfa(r.price)}</td><td>{r.status}</td>
            <td>
              <button onClick={() => setStatus(r.id, r.status === 'published' ? 'draft' : 'published')}>{r.status === 'published' ? 'Dépublier' : 'Publier'}</button>
              <button onClick={() => setStatus(r.id, 'sold')}>Vendu</button>
              <button onClick={() => remove(r.id)}>Suppr.</button>
            </td>
          </tr>
        ))}
      </tbody></table>
      <h3>Demandes ({leads.length})</h3>
      <table><tbody>
        {leads.map((l) => (
          <tr key={l.id}><td>{new Date(l.created_at).toLocaleDateString('fr-FR')}</td><td>{l.name}</td><td>{l.phone}</td><td>{l.message}</td></tr>
        ))}
      </tbody></table>
    </main>
  )
}
