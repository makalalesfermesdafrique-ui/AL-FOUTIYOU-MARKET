import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes, useParams } from 'react-router-dom'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import Detail from './pages/Detail'
import Proposer from './pages/Proposer'
import Admin from './pages/Admin'
import './style.css'

function ProposerRoute() { const { token } = useParams(); return <Proposer token={token ?? ''} /> }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/annonces" element={<Catalogue />} />
        <Route path="/annonce/:id" element={<Detail />} />
        <Route path="/proposer/:token" element={<ProposerRoute />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
