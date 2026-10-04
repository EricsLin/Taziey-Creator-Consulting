import { supabase, supabaseAnonKey, supabaseUrl } from '@/lib/supabase'
import { listRows, type TableName } from './api'

/**
 * The media library: one public Storage bucket of images, created by
 * `supabase/media-bucket.sql`. The type list and size cap here mirror the
 * bucket's own limits — Storage enforces them regardless, this just lets the
 * UI refuse a file before spending 50 MB of upload on it.
 */
export const MEDIA_BUCKET = 'media'
export const MAX_BYTES = 50 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

export interface Asset {
  /** Object path in the bucket — also the key for delete. */
  path: string
  /** The original file name, minus the uniqueness prefix. */
  name: string
  url: string
  size: number
  type: string
  createdAt: string
}

/** Every image field on the site, so the library can tell what's in use. */
const IMAGE_COLUMNS: Array<{ table: TableName; label: string; columns: string[]; titleOf: (row: any) => string }> = [
  { table: 'videos', label: 'Video', columns: ['thumbnail_url'], titleOf: (r) => r.title },
  { table: 'creators', label: 'Creator', columns: ['avatar_url'], titleOf: (r) => r.name },
  { table: 'niches', label: 'Niche', columns: ['icon_url'], titleOf: (r) => r.name },
  { table: 'packaging_flips', label: 'Packaging flip', columns: ['before_url', 'after_url'], titleOf: (r) => r.title },
]

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Null when the file is fine to upload, otherwise the reason it isn't. */
export function rejectReason(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${file.name} isn't a supported image — use PNG, JPEG, WebP, GIF or AVIF.`
  }
  if (file.size > MAX_BYTES) {
    return `${file.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_BYTES)}.`
  }
  return null
}

export function publicUrl(path: string): string {
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

/** Splits the `<stamp>-` prefix back off an object path. */
function displayName(path: string): string {
  return path.replace(/^[a-z0-9]+-/, '')
}

/**
 * Unique, URL-safe object path that keeps the original name readable. Files are
 * never overwritten, so a URL already pasted into a row can't change under it —
 * which is also why uploads can be cached for a year.
 */
function objectPath(file: File): string {
  const dot = file.name.lastIndexOf('.')
  const base = (dot > 0 ? file.name.slice(0, dot) : file.name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  return `${stamp}-${base || 'image'}.${ext}`
}

/**
 * Uploads one image and resolves to its asset.
 *
 * Goes straight to the Storage REST endpoint over XHR rather than through
 * supabase-js, because fetch has no upload progress and a 50 MB file without a
 * progress bar looks hung.
 */
export async function uploadImage(file: File, onProgress?: (fraction: number) => void): Promise<Asset> {
  const reason = rejectReason(file)
  if (reason) throw new Error(reason)

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Your session has expired — sign in again.')

  const path = objectPath(file)
  const endpoint = `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${encodeURIComponent(path)}`

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)
    xhr.setRequestHeader('authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', supabaseAnonKey)
    xhr.setRequestHeader('content-type', file.type)
    xhr.setRequestHeader('cache-control', 'max-age=31536000')
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = `Upload failed (${xhr.status}).`
      try {
        const body = JSON.parse(xhr.responseText)
        message = body.message || body.error || message
      } catch {
        /* keep the status-code message */
      }
      if (/bucket not found/i.test(message)) {
        message = 'The media bucket doesn’t exist yet — run supabase/media-bucket.sql.'
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error(`Network error uploading ${file.name}.`))
    xhr.send(file)
  })

  onProgress?.(1)
  return {
    path,
    name: displayName(path),
    url: publicUrl(path),
    size: file.size,
    type: file.type,
    createdAt: new Date().toISOString(),
  }
}

/** Every image in the bucket, newest first. */
export async function listAssets(): Promise<Asset[]> {
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list('', {
    limit: 1000,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) {
    throw new Error(
      /bucket not found/i.test(error.message)
        ? 'The media bucket doesn’t exist yet — run supabase/media-bucket.sql.'
        : error.message,
    )
  }
  return (data ?? [])
    // Folders come back with a null id; Storage also drops a placeholder file in empty buckets.
    .filter((o) => o.id && !o.name.startsWith('.'))
    .map((o) => ({
      path: o.name,
      name: displayName(o.name),
      url: publicUrl(o.name),
      size: Number(o.metadata?.size ?? 0),
      type: String(o.metadata?.mimetype ?? ''),
      createdAt: o.created_at ?? '',
    }))
}

export async function deleteAsset(path: string): Promise<void> {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path])
  if (error) throw new Error(error.message)
}

/** Where each image URL is used, as readable labels — e.g. `Video: “Title”`. */
export async function findUsage(): Promise<Map<string, string[]>> {
  const usage = new Map<string, string[]>()
  const tables = await Promise.all(IMAGE_COLUMNS.map((def) => listRows(def.table).then((rows) => ({ def, rows }))))
  for (const { def, rows } of tables) {
    for (const row of rows) {
      for (const column of def.columns) {
        const url = row[column]
        if (!url) continue
        const label = `${def.label}: “${def.titleOf(row) || 'Untitled'}”`
        usage.set(url, [...(usage.get(url) ?? []), label])
      }
    }
  }
  return usage
}
