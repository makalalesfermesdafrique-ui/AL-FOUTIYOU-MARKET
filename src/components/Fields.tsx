import { Field } from '../lib/fields'

export default function Fields({ fields, v, set }: { fields: Field[]; v: Record<string, any>; set: (k: string, x: any) => void }) {
  return (
    <>
      {fields.map((f) => (
        <div key={f.k} className="fld">
          {f.t === 'multi' ? (
            <fieldset><legend>{f.l}</legend>
              <div className="checks">{f.o!.map((o) => {
                const a: string[] = v[f.k] ?? []
                return <label key={o} className="chk"><input type="checkbox" checked={a.includes(o)} onChange={(e) => set(f.k, e.target.checked ? [...a, o] : a.filter((x) => x !== o))} /> {o}</label>
              })}</div></fieldset>
          ) : (
            <label>{f.l}
              {f.t === 'select' ? <select value={v[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)}><option value="">Choisir…</option>{f.o!.map((o) => <option key={o}>{o}</option>)}</select>
                : f.t === 'area' ? <textarea rows={3} value={v[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />
                : <input type={f.t === 'number' ? 'number' : 'text'} min={f.t === 'number' ? 0 : undefined} value={v[f.k] ?? ''} onChange={(e) => set(f.k, e.target.value)} />}
            </label>
          )}
        </div>
      ))}
    </>
  )
}
