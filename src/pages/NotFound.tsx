import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="shell" style={{ paddingBlock: '140px 160px' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        404
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
        Nothing here.
      </h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 18, maxWidth: '46ch', margin: '0 0 32px' }}>
        That page doesn&rsquo;t exist &mdash; or it hasn&rsquo;t been built yet.
      </p>
      <Link to="/" className="btn btn--primary">
        Back home
      </Link>
    </section>
  )
}
