import { useState } from 'react'
import { fetchVideoMeta, type Row } from './api'
import styles from './admin.module.css'

interface Props {
  addRow: (values: Row) => Promise<void>
  busy: boolean
  niches: string[]
}

/**
 * Stages a video from a pasted YouTube URL. The `video-meta` edge function
 * resolves title, channel, thumbnail and — when a YOUTUBE_API_KEY is configured
 * — the view count; the row it stages opens straight into the edit form and is
 * only written once its Save is clicked.
 */
export function VideoImportBar({ addRow, busy, niches }: Props) {
  const [url, setUrl] = useState('')
  const [niche, setNiche] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleImport() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const meta = await fetchVideoMeta(url)
      await addRow({
        title: meta.title,
        creator: meta.creator,
        views: meta.views,
        niche: niche || niches[0] || '',
        thumbnail_url: meta.thumbnailUrl,
        youtube_url: meta.youtubeUrl,
        youtube_id: meta.youtubeId,
        featured: false,
      })
      setUrl('')
      setNotice(
        `${
          meta.notice ??
          `Fetched from ${meta.source === 'oembed' ? 'oEmbed' : 'the YouTube Data API'}.`
        } Check the fields and hit Save & add to publish it.`,
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.importBar}>
        <div className={`${styles.field} ${styles.importField}`}>
          <label className={styles.label} htmlFor="import-url">
            Import from YouTube
          </label>
          <input
            id="import-url"
            className={styles.input}
            placeholder="https://www.youtube.com/watch?v=…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleImport()
            }}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="import-niche">
            Niche
          </label>
          <select
            id="import-niche"
            className={styles.select}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            <option value="">{niches[0] ?? '—'}</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={`${styles.action} ${styles.actionPrimary}`}
          disabled={loading || busy || !url.trim()}
          onClick={() => void handleImport()}
        >
          {loading ? 'Fetching…' : 'Fetch details'}
        </button>
      </div>

      {error && <div className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}
      {notice && !error && <div className={`${styles.banner} ${styles.bannerInfo}`}>{notice}</div>}
    </>
  )
}
