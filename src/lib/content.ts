import { supabase } from './supabase'
import type {
  ContactChannel,
  Creator,
  PackagingFlip,
  Service,
  ServiceCategory,
  SiteContent,
  Stat,
  Video,
} from '@/types'

/**
 * Single read seam for every piece of editable site content.
 *
 * One round of parallel selects against the public, world-readable tables. The
 * admin editors write to the same tables, so anything saved in /admin shows up
 * here on the next load.
 */
export async function fetchSiteContent(): Promise<SiteContent> {
  const [categories, services, creators, stats, niches, videos, flips, contact, copy] =
    await Promise.all([
      supabase.from('service_categories').select('*').order('sort_order'),
      supabase.from('services').select('*').order('sort_order'),
      supabase.from('creators').select('*').order('sort_order'),
      supabase.from('stats').select('*').order('sort_order'),
      supabase.from('niches').select('*').order('sort_order'),
      supabase.from('videos').select('*').order('sort_order'),
      supabase.from('packaging_flips').select('*').order('sort_order'),
      supabase.from('contact_channels').select('*').order('sort_order'),
      supabase.from('site_copy').select('key, value'),
    ])

  const failed = [categories, services, creators, stats, niches, videos, flips, contact, copy].find(
    (r) => r.error,
  )
  if (failed?.error) throw new Error(failed.error.message)

  return {
    categories: (categories.data ?? []).map(toCategory),
    services: (services.data ?? []).map(toService),
    creators: (creators.data ?? []).map(toCreator),
    stats: (stats.data ?? []).map(toStat),
    niches: (niches.data ?? []).map((row: Row) => String(row.name)),
    videos: (videos.data ?? []).map(toVideo),
    flips: (flips.data ?? []).map(toFlip),
    contact: (contact.data ?? []).map(toChannel),
    copy: Object.fromEntries((copy.data ?? []).map((row: Row) => [row.key, row.value ?? ''])),
  }
}

/* Row mappers — snake_case columns to the camelCase shapes in `src/types.ts`. */

type Row = Record<string, any>

const toCategory = (r: Row): ServiceCategory => ({
  id: r.id,
  name: r.name,
  blurb: r.blurb ?? '',
  order: r.sort_order,
})

const toService = (r: Row): Service => ({
  id: r.id,
  order: r.sort_order,
  name: r.name,
  category: r.category,
  description: r.description ?? '',
})

const toCreator = (r: Row): Creator => ({
  id: r.id,
  name: r.name,
  subscribers: r.subscribers ?? '',
  avatarUrl: r.avatar_url,
  order: r.sort_order,
})

const toStat = (r: Row): Stat => ({
  id: r.id,
  value: r.value ?? '',
  label: r.label ?? '',
  note: r.note ?? '',
  order: r.sort_order,
})

const toVideo = (r: Row): Video => ({
  id: r.id,
  title: r.title ?? '',
  creator: r.creator ?? '',
  views: r.views ?? '',
  niche: r.niche ?? '',
  thumbnailUrl: r.thumbnail_url,
  youtubeUrl: r.youtube_url,
  youtubeId: r.youtube_id,
  featured: !!r.featured,
  rotatorColumn: r.rotator_column,
  rotatorPosition: r.rotator_position,
  order: r.sort_order,
})

const toFlip = (r: Row): PackagingFlip => ({
  id: r.id,
  creator: r.creator ?? '',
  lift: r.lift ?? '',
  title: r.title ?? '',
  beforeUrl: r.before_url,
  afterUrl: r.after_url,
  order: r.sort_order,
})

const toChannel = (r: Row): ContactChannel => ({
  id: r.id,
  kind: r.kind,
  label: r.label ?? '',
  handle: r.handle ?? '',
  href: r.href,
  blurb: r.blurb ?? '',
  order: r.sort_order,
})

/* Derived views over the content -------------------------------------------- */

/**
 * Column-major slide order for the home page rotator, built from each video's
 * `rotator_column` / `rotator_position`. Replaces the hardcoded id list the
 * seed data used to carry.
 */
export function rotatorColumns(videos: Video[]): Video[][] {
  const columns: Video[][] = [[], [], []]
  videos
    .filter((v) => v.rotatorColumn && v.rotatorColumn >= 1 && v.rotatorColumn <= 3)
    .sort((a, b) => (a.rotatorPosition ?? 0) - (b.rotatorPosition ?? 0))
    .forEach((v) => columns[v.rotatorColumn! - 1].push(v))
  return columns.filter((c) => c.length > 0)
}

export function channelOfKind(
  contact: ContactChannel[],
  kind: ContactChannel['kind'],
): ContactChannel | undefined {
  return contact.find((c) => c.kind === kind)
}
