import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import Fields from '../components/Fields'
import { allLabel, fieldsFor, val } from '../lib/fields'
import Photos, { Item } from '../components/Photos'
import { sha256, uid, upload } from '../lib/images'

type Info = { category_id: number; slug: string; name: string }
const STEPS = ['Propriétaire', 'Le bien', 'Dossier & détails', 'Photos', 'Vérification']

export default function Proposer({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null | undefined>(undefined)
  const [step, setStep] = useState(0)
  const [v, setV] = useState<Record<string, any>>({ price_negotiable: false, consent: false })
  const [fd, setFd] = useState<Record<string, any>>({})
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => { supabase.rpc('get_form_link', { p_token: token }).then(({ data, error }) => setInfo(error ? null : (data as Info | null))) }, [token])
  const on = (k: string) => (e: any) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  function check(): string {
    if (step === 0) {
      if (!v.owner_name?.trim()) return 'Indiquez votre nom complet.'
      if ((v.owner_phone ?? '').replace(/\D/g, '').length < 8) return 'Indiquez un numéro de téléphone valide.'
      if (!v.city?.trim()) return 'Indiquez la ville du bien.'
    }
    if (step === 1 && !v.title?.trim()) return "Donnez un titre à l'annonce."
    if (step === 1 && !(Number(v.price) > 0)) return 'Indiquez le prix de vente demandé en FCFA.'
    if (step === 4 && !v.consent) return 'Vous devez accepter d’être contacté par AL FOUTIYOU MARKET.'
    return ''
  }
  const next = () => { const m = check(); setErr(m); if (!m) setStep(step + 1) }
  async function send() {
    const m = check(); setErr(m); if (m) return
    setBusy(true)
    const photos: string[] = []
    try {
      const h = await sha256(token)
      for (const it of items) { const path = `${h}/${uid()}.${it.proc!.ext}`; await upload('submission-photos', path, it.proc!.full); photos.push(path) }
    } catch (e: any) { setBusy(false); return setErr(e.message) }
    const { error } = await supabase.rpc('submit_owner_proposal', { p_token: token, p: { ...v, photos, form_data: Object.fromEntries(Object.entries(fd).filter(([, x]) => x && !(Array.isArray(x) && !x.length))) } })
    setBusy(false)
    if (error) setErr(error.message || "Envoi impossible. Vérifiez votre connexion et réessayez.")
    else setDone(true)
  }

  if (info === undefined) return <Layout><main className="wrap"><p className="mut">Chargement…</p></main></Layout>
  if (!info) return <Layout><main className="wrap"><div className="empty"><h3>Lien invalide ou expiré</h3><p>Ce lien n'est plus actif. Contactez AL FOUTIYOU MARKET pour en obtenir un nouveau.</p></div></main></Layout>
  if (done) return <Layout><main className="wrap"><div className="empty"><h3>Merci d'avoir choisi AL FOUTIYOU MARKET</h3><p>Votre proposition a bien été reçue. Notre équipe vous contactera pour examiner les informations et les prochaines étapes.</p></div></main></Layout>

  return (
    <Layout>
      <main className="wrap">
        <h1 className="sec">Proposer un bien : {info.name}</h1>
        <div className="prog" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>{STEPS.map((s, i) => <span key={s} className={i <= step ? 'on' : ''}>{i + 1}. {s}</span>)}</div>
        <div className="box wide">
          {step === 0 && <>
            <label>Nom complet *<input value={v.owner_name ?? ''} onChange={on('owner_name')} autoComplete="name" /></label>
            <label>Téléphone *<input type="tel" value={v.owner_phone ?? ''} onChange={on('owner_phone')} autoComplete="tel" /></label>
            <label>E-mail (facultatif)<input type="email" value={v.owner_email ?? ''} onChange={on('owner_email')} autoComplete="email" /></label>
            <label>Ville *<input value={v.city ?? ''} onChange={on('city')} /></label>
            <label>Région<input value={v.region ?? ''} onChange={on('region')} /></label>
          </>}
          {step === 1 && <>
            <label>Titre de l'annonce *<input value={v.title ?? ''} onChange={on('title')} /></label>
            <label>Description<textarea rows={4} value={v.description ?? ''} onChange={on('description')} /></label>
            <label>Prix de vente demandé en FCFA *<input type="number" min="0" value={v.price ?? ''} onChange={on('price')} /></label>
            <label className="chk"><input type="checkbox" checked={v.price_negotiable} onChange={on('price_negotiable')} /> Prix négociable</label>
          </>}
          {step === 2 && <>
            <h3>Dossier administratif et caractéristiques</h3>
            <p className="mut">Ces informations sont déclarées par vous. Elles aident l'acheteur à décider et seront vérifiées par AL FOUTIYOU MARKET avant toute vente. Les champs sans mention « reste privée » sont visibles par les clients ; les numéros et noms de titre ne le sont pas.</p>
            <Fields fields={fieldsFor(info.slug)} v={fd} set={(k, x) => setFd({ ...fd, [k]: x })} />
          </>}
          {step === 3 && <>
            <h3>Photos du bien</h3>
            <p className="mut">Ajoutez de bonnes photos (façade, intérieur, plaque et tableau de bord pour un véhicule…). Elles sont facultatives mais augmentent vos chances de vente.</p>
            <Photos items={items} setItems={setItems} />
          </>}
          {step === 4 && <>
            <h3>Vérifiez vos informations</h3>
            <p><b>{v.owner_name}</b> · {v.owner_phone}{v.owner_email && ` · ${v.owner_email}`}<br />{[v.city, v.region].filter(Boolean).join(', ')}</p>
            <p>{items.length} photo(s) ajoutée(s)</p>
            <p><b>{v.title}</b>{v.price && ` · ${Number(v.price).toLocaleString('fr-FR')} FCFA`}{v.price_negotiable && ' (négociable)'}</p>
            {Object.entries(fd).filter(([, x]) => x && !(Array.isArray(x) && !x.length)).map(([k, x]) => <p key={k} className="mut">{allLabel(k)} : {val(x)}</p>)}
            <label className="chk"><input type="checkbox" checked={v.consent} onChange={on('consent')} /> J'accepte d'être contacté par AL FOUTIYOU MARKET au sujet de ce bien.</label>
            <p className="mut">Votre proposition reste privée tant qu'elle n'a pas été examinée. Elle ne sera jamais publiée automatiquement.</p>
          </>}
          {err && <p className="warn">{err}</p>}
          <div className="row2">
            {step > 0 && <button className="ghost" onClick={() => { setErr(''); setStep(step - 1) }}>Retour</button>}
            {step < 4 ? <button className="btn act" onClick={next}>Continuer</button> : <button className="btn act" disabled={busy} onClick={send}>{busy ? 'Envoi…' : 'Envoyer ma proposition'}</button>}
          </div>
        </div>
      </main>
    </Layout>
  )
}
