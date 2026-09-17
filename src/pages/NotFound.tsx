import { Link } from 'react-router-dom'
import { useCopy } from '@/lib/useSiteContent'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function NotFound() {
  const copy = useCopy()
  useDocumentTitle('meta.title.not_found')

  return (
    <section className="shell" style={{ paddingBlock: '140px 160px' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        {copy('not_found.eyebrow')}
      </div>
      <h1
        style={{
          fontWeight: 800,
          fontSize: 56,
          letterSpacing: '-0.045em',
          lineHeight: 0.98,
          margin: '0 0 20px',
        }}
      >
        {copy('not_found.title')}
      </h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 18, maxWidth: '46ch', margin: '0 0 32px' }}>
        {copy('not_found.text')}
      </p>
      <Link to="/" className="btn btn--primary">
        {copy('not_found.link_label')}
      </Link>
    </section>
  )
}
