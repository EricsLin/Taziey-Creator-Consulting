import type { ContactChannel } from '@/types'

/**
 * The glyph for a contact channel. Drawn with `currentColor` so each caller
 * controls the colour through its own text colour — the icon sits on an accent
 * panel in one place and a plain surface in another.
 */
const PATHS: Record<ContactChannel['kind'], React.ReactNode> = {
  email: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  discord: (
    <path
      fill="currentColor"
      d="M19.3 5.3A16.2 16.2 0 0 0 15.4 4l-.3.5a12 12 0 0 0-6.2 0L8.6 4a16.2 16.2 0 0 0-3.9 1.3C2.2 9 1.5 12.6 1.9 16.1a16.3 16.3 0 0 0 4.9 2.5l1-1.7a10.6 10.6 0 0 1-1.7-.8l.4-.3a11.6 11.6 0 0 0 9.9 0l.4.3a10.6 10.6 0 0 1-1.7.8l1 1.7a16.3 16.3 0 0 0 4.9-2.5c.5-4-.7-7.6-2.7-10.8ZM8.3 14c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.8.9 1.7 2c0 1.1-.8 2-1.7 2Zm7.4 0c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.8.9 1.7 2c0 1.1-.8 2-1.7 2Z"
    />
  ),
  twitter: (
    <path
      fill="currentColor"
      d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L4.9 21H1.8l7.3-8.3L1.5 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.1h1.7L7.2 4.8H5.4l11 14.3Z"
    />
  ),
}

export function ChannelIcon({
  kind,
  size = 18,
  className,
}: {
  kind: ContactChannel['kind']
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[kind]}
    </svg>
  )
}
