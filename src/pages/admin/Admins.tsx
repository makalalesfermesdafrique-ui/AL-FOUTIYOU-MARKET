import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type P = { user_id: string; full_name: string | null; email: string | null; role: string; active: boolean }
export default function Admins({ me }: { me: string }) {
  const [rows, setRows] = useState<P[]>([])
  const [msg, setMsg] = useState('')
  const load = () => supabase.from('profiles').select('*').then(({ data }) => setRows(data ?? []))
  useEffect(() => { load() }, [])
  async function up(id: string, patch: object) {
    const { error } = await supabase.from('profiles').update(patch).eq('user_id', id)
    setMsg(error ? 'Modification impossible : ' + error.message : 'Modifié.'); load()
  }
  return (
    <>
      <h1>Administrateurs</h1>
      <p className="mut">Créez l'utilisateur dans Supabase (Authentication → Users), puis activez-le ici.</p>
      {msg && <p className="ok">{msg}</p>}
      <div className="scroll"><table><tbody>
        {rows.map((r) => (
          <tr key={r.user_id}>
            <td>{r.full_name || r.email || r.user_id.slice(0, 8)}<br /><small>{r.email}</small></td>
            <td><select aria-label="Rôle" value={r.role} disabled={r.user_id === me} onChange={(e) => up(r.user_id, { role: e.target.value })}><option value="agent">Agent</option><option value="admin">Administrateur</option><option value="super_admin">Super administrateur</option></select></td>
            <td><label className="chk"><input type="checkbox" checked={r.active} disabled={r.user_id === me} onChange={(e) => up(r.user_id, { active: e.target.checked })} /> Actif</label></td>
          </tr>
        ))}
      </tbody></table></div>
    </>
  )
}
