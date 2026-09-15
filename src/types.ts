/**
 * Content shapes for the site. Each interface mirrors one table in the Supabase
 * `public` schema; `src/lib/content.ts` maps the snake_case rows onto these.
 */

export interface ServiceCategory {
  id: string
  name: string
  /** One-line pitch shown under the group heading on /services. */
  blurb: string
  order: number
}

export interface Service {
  id: string
  /** Display order — the site shows a zero-padded index derived from this. */
  order: number
  name: string
  /** Matches a `ServiceCategory.name`. */
  category: string
  description: string
}

export interface Creator {
  id: string
  name: string
  /** Pre-formatted for display, e.g. "1.4M". */
  subscribers: string
  avatarUrl?: string | null
  order: number
}

export interface Stat {
  id: string
  value: string
  label: string
  note: string
  order: number
}

export interface Video {
  id: string
  title: string
  creator: string
  /** Pre-formatted for display, e.g. "41M". */
  views: string
  niche: string
  thumbnailUrl?: string | null
  youtubeUrl?: string | null
  youtubeId?: string | null
  /* ---- detail fields, shown only in the video popup ---- */
  /** Game or subject featured in the video. */
  game: string
  /** Runtime as displayed, e.g. "14:22". */
  duration: string
  /** ISO date the video went live, or null if unknown. */
  publishedAt?: string | null
  /** Pre-formatted, e.g. "182K". */
  likes: string
  channelUrl?: string | null
  /** Surface on the home page "Videos we helped shape" rotator. */
  featured: boolean
  /** Which rotator column this sits in (1–3), and where within it. */
  rotatorColumn?: number | null
  rotatorPosition?: number | null
  order: number
}

/** A packaging before/after pair for the home page flip strip. */
export interface PackagingFlip {
  id: string
  creator: string
  /** Headline result, e.g. "+41% CTR". */
  lift: string
  title: string
  beforeUrl?: string | null
  afterUrl?: string | null
  /** The `Video` this flip repackaged, if one is linked. Drives the popup. */
  videoId?: string | null
  order: number
}

export interface ContactChannel {
  id: string
  kind: 'email' | 'discord' | 'twitter'
  label: string
  handle: string
  href?: string | null
  blurb: string
  order: number
}

export interface Niche {
  id: string
  name: string
  order: number
}

/** One editable string of page copy, keyed by slug. */
export interface CopyEntry {
  key: string
  value: string
  section: string
  label: string
  multiline: boolean
  order: number
}

export interface SiteContent {
  categories: ServiceCategory[]
  services: Service[]
  creators: Creator[]
  stats: Stat[]
  niches: string[]
  videos: Video[]
  flips: PackagingFlip[]
  contact: ContactChannel[]
  /** Flattened `site_copy` for lookup by key. */
  copy: Record<string, string>
}
