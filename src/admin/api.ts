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

/* ---- site_copy -------------------------------------------------------------
 * Keyed by `key`, not `id`, and every column but the value is presentation
 * metadata mirrored from `src/lib/copyKeys.ts` — so it gets its own pair of
 * calls rather than going through the generic row helpers above.
 */

/** Saved copy values as `key → value`. Keys with no row have never been edited. */
export async function listCopy(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('site_copy').select('key, value')
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map((row) => [row.key as string, (row.value ?? '') as string]))
}

export interface CopyUpsert {
  key: string
  value: string
  section: string
  label: string
  multiline: boolean
  sort_order: number
}

/**
 * Writes the edited keys. An upsert rather than an update because most keys
 * have no row until the first time someone changes them; the metadata columns
 * ride along so the table stays readable in the Supabase dashboard.
 */
export async function saveCopy(rows: CopyUpsert[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from('site_copy').upsert(rows, { onConflict: 'key' })
  if (error) throw new Error(error.message)
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
