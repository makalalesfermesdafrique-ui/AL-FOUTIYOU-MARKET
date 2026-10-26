import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import Dashboard from './admin/Dashboard'
import Listings from './admin/Listings'
import ListingForm from './admin/ListingForm'
import Leads from './admin/Leads'
import Settings from './admin/Settings'
import Links from './admin/Links'
import Submissions from './admin/Submissions'
import Categories from './admin/Categories'
import Admins from './admin/Admins'

type Prof = { role: string; active: boolean } | null
export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [prof, setProf] = useState<Prof | undefined>(undefined)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) return setProf(undefined)
    supabase.from('profiles').select('role,active').eq('user_id', session.user.id).maybeSingle().then(({ data }) => setProf(data ?? null))
  }, [session])

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) })
    setMsg(error ? { ok: false, t: 'Connexion impossible : e-mail ou mot de passe incorrect.' } : null)
  }
  async function reset(e: React.MouseEvent<HTMLButtonElement>) {
    const email = (e.currentTarget.form?.elements.namedItem('email') as HTMLInputElement).value
    if (!email) return setMsg({ ok: false, t: "Saisissez d'abord votre adresse e-mail." })
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname })
    setMsg(error ? { ok: false, t: "Envoi impossible : " + error.message } : { ok: true, t: 'Un e-mail de réinitialisation vient de vous être envoyé.' })
  }

  if (!ready) return <main className="wrap"><p className="mut">Chargement…</p></main>
  if (!session)
    return (
      <main className="narrow">
        <h1>Connexion administrateur</h1>
        <form className="box" onSubmit={login}>
          <label>Adresse e-mail<input name="email" type="email" required autoComplete="username" /></label>
          <label>Mot de passe<input name="password" type="password" required autoComplete="current-password" /></label>
          <button className="btn act">Se connecter</button>
          <button type="button" className="ghost" onClick={reset}>Mot de passe oublié</button>
          {msg && <p className={msg.ok ? 'ok' : 'warn'}>{msg.t}</p>}
        </form>
        <p><Link to="/">← Retour au site</Link></p>
      </main>
    )
  if (prof === undefined) return <main className="wrap"><p className="mut">Vérification de vos droits…</p></main>
  if (!prof?.active)
    return (
      <main className="narrow">
        <p className="warn">Votre compte n'est pas encore activé. Un super administrateur doit l'activer.</p>
        <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </main>
    )
  const isSuper = prof.role === 'super_admin'
  const close = () => setOpen(false)
  return (
    <div className="adm">
      <aside className={open ? 'open' : ''}>
        <b className="logo">AL FOUTIYOU <i>MARKET</i></b>
        <NavLink end to="/admin" onClick={close}>Tableau de bord</NavLink>
        <NavLink to="/admin/annonces" onClick={close}>Annonces</NavLink>
        <NavLink to="/admin/annonces/nouveau" onClick={close}>Ajouter un bien</NavLink>
        <NavLink to="/admin/propositions" onClick={close}>Propositions reçues</NavLink>
        <NavLink to="/admin/liens" onClick={close}>Liens de formulaires</NavLink>
        <NavLink to="/admin/demandes" onClick={close}>Demandes clients</NavLink>
        <NavLink to="/admin/categories" onClick={close}>Photos des catégories</NavLink>
        <NavLink to="/admin/parametres" onClick={close}>Paramètres</NavLink>
        {isSuper && <NavLink to="/admin/admins" onClick={close}>Administrateurs</NavLink>}
        <Link to="/" onClick={close}>Voir le site</Link>
        <button className="ghost light" onClick={() => supabase.auth.signOut()}>Déconnexion</button>
      </aside>
      <section className="adm-main">
        <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰ Menu</button>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="annonces" element={<Listings />} />
          <Route path="annonces/nouveau" element={<ListingForm />} />
          <Route path="annonces/:id" element={<ListingForm />} />
          <Route path="propositions" element={<Submissions />} />
          <Route path="liens" element={<Links />} />
          <Route path="demandes" element={<Leads />} />
          <Route path="categories" element={<Categories />} />
          <Route path="parametres" element={<Settings />} />
          {isSuper && <Route path="admins" element={<Admins me={session.user.id} />} />}
        </Routes>
      </section>
    </div>
  )
}
