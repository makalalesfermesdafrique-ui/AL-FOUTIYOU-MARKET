import Layout from '../components/Layout'
import { defaultPrivacy, defaultTerms } from '../lib/legal'
import { useSettings } from '../lib/settings'

export default function Legal({ kind }: { kind: 'terms' | 'privacy' }) {
  const s: any = useSettings()
  const custom = (kind === 'terms' ? s.terms : s.privacy) as string | null
  const text = custom?.trim() || (kind === 'terms' ? defaultTerms : defaultPrivacy)(s.company_name)
  const [title, ...rest] = text.split('\n')
  return (
    <Layout>
      <main className="wrap legal">
        <h1 className="sec">{title}</h1>
        <article>{rest.join('\n').trim().split(/\n{2,}/).map((b, i) => <p key={i}>{b}</p>)}</article>
      </main>
    </Layout>
  )
}
