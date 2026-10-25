import { ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings, waLink } from '../lib/settings'

export default function Layout({ children }: { children: ReactNode }) {
  const s = useSettings()
  const [open, setOpen] = useState(false)
  const wa = waLink(s.whatsapp, 'Bonjour AL FOUTIYOU MARKET, ')
  const close = () => setOpen(false)
  return (
    <>
      <header className="top">
        <div className="wrap nav">
          <Link to="/" className="logo" onClick={close}>AL FOUTIYOU <b>MARKET</b></Link>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          <nav className={open ? 'open' : ''}>
            <Link to="/" onClick={close}>Accueil</Link>
            <Link to="/annonces" onClick={close}>Toutes les annonces</Link>
            <Link to="/annonces?cat=terrains" onClick={close}>Terrains</Link>
            <Link to="/annonces?cat=immobilier" onClick={close}>Immobilier</Link>
            <Link to="/annonces?cat=automobiles" onClick={close}>Voitures</Link>
            {wa && <a className="btn act" href={wa} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
          </nav>
        </div>
      </header>
      {children}
      <footer className="foot">
        <div className="wrap">
          <strong>{s.company_name}</strong>
          {s.description && <p>{s.description}</p>}
          {s.phone && <p>📞 <a href={`tel:${s.phone}`}>{s.phone}</a></p>}
          {s.email && <p>✉️ <a href={`mailto:${s.email}`}>{s.email}</a></p>}
          {s.address && <p>📍 {s.address}</p>}
          <p><Link to="/admin">Espace administrateur</Link></p>
        </div>
      </footer>
    </>
  )
}
