import { supabase } from '@/lib/supabase'

export type Row = Record<string, any>

/** Every content table the admin can edit, plus the column it sorts by. */
export type TableName =
  | 'service_categories'
  | 'services'
  | 'creators'
  | 'stats'
  | 'niches'
  | 'videos'
  | 'packaging_flips'
  | 'contact_channels'

export async function listRows(table: TableName): Promise<Row[]> {
  const { data, error } = await supabase.from(table).select('*').order('sort_order')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function insertRow(table: TableName, values: Row): Promise<Row> {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateRow(table: TableName, id: string, values: Row): Promise<void> {
  const { error } = await supabase.from(table).update(values).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteRow(table: TableName, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Renumbers `sort_order` to match the given id order, 1-based. */
export async function persistOrder(table: TableName, ids: string[]): Promise<void> {
  const results = await Promise.all(
    ids.map((id, i) => supabase.from(table).update({ sort_order: i + 1 }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export interface VideoMeta {
  source: 'youtube-data-api' | 'oembed'
  youtubeId: string
  youtubeUrl: string
  title: string
  creator: string
  views: string
  thumbnailUrl: string
  /** Detail fields for the popup; blank when the lookup fell back to oEmbed. */
  likes: string
  duration: string
  publishedAt: string | null
  channelUrl: string | null
  notice?: string
}

/**
 * Resolves title / channel / views / thumbnail for a pasted YouTube URL via the
 * `video-meta` edge function. Everything it returns is editable before saving.
 */
export async function fetchVideoMeta(url: string): Promise<VideoMeta> {
  const { data, error } = await supabase.functions.invoke<VideoMeta & { error?: string }>(
    'video-meta',
    { body: { url } },
  )
  if (error) throw new Error(data?.error || error.message)
  if (!data || (data as any).error) throw new Error((data as any)?.error ?? 'Lookup failed.')
  return data
}
