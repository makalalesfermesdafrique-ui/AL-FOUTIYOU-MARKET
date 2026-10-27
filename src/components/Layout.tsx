import { ReactNode, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSettings, waLink } from '../lib/settings'

const MSG = ['🌍 Terrains', '🏠 Maisons et villas', '🚗 Voitures', '🏍️ Motos', '📞 Contactez AL FOUTIYOU MARKET pour organiser votre visite', '✨ Les bonnes opportunités, au bon endroit']

export default function Layout({ children }: { children: ReactNode }) {
  const s = useSettings()
  const [open, setOpen] = useState(false)
  const wa = waLink(s.whatsapp, 'Bonjour AL FOUTIYOU MARKET, ')
  const close = () => setOpen(false)
  return (
    <>
      <div className="ticker"><div className="track">{[...MSG, ...MSG].map((m, i) => <span key={i}>{m}</span>)}</div></div>
      <header className="top">
        <div className="wrap nav">
          <Link to="/" className="logo" onClick={close}><span className="wm"><b>AL FOUTIYOU</b><i>MARKET</i></span></Link>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          <nav className={open ? 'open' : ''}>
            <NavLink end to="/" onClick={close}>Accueil</NavLink>
            <NavLink end to="/annonces" onClick={close}>Annonces</NavLink>
            <Link to="/annonces?cat=terrains" onClick={close}>Terrains</Link>
            <Link to="/annonces?cat=immobilier" onClick={close}>Immobilier</Link>
            <Link to="/annonces?cat=automobiles" onClick={close}>Voitures</Link>
            {wa && <a className="btn wa" href={wa} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
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
          <p><Link to="/conditions">Conditions d'utilisation</Link> · <Link to="/confidentialite">Politique de confidentialité</Link></p>
          <p><Link to="/admin">Espace administrateur</Link></p>
        </div>
      </footer>
      {wa && <a className="fab" href={wa} target="_blank" rel="noreferrer" aria-label="Écrire sur WhatsApp">💬</a>}
    </>
  )
}
