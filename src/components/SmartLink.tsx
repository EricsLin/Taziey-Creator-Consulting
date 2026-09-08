import { Link } from 'react-router-dom'

/**
 * Renders an editable link target: a router `Link` for a site path, a plain
 * anchor for anything else. Link destinations live in `site_copy`, so an admin
 * can point a button at `/contact` or at an external URL without a code change.
 */
export function SmartLink({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: React.ReactNode
}) {
  if (to.startsWith('/')) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={to} className={className} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
