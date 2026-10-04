import { useCallback, useEffect, useState } from 'react'
import { deleteAsset, findUsage, formatBytes, type Asset } from './media'
import { AssetTile, Dropzone, matchesQuery, UploadList, useAssets, useUploader } from './MediaLibrary'
import styles from './admin.module.css'
import media from './media.module.css'

/**
 * Every image in the media bucket. Upload in bulk, copy a URL, or delete what's
 * no longer needed — each tile says where on the site its image is used, so a
 * delete that would leave a blank slot gets a louder warning.
 */
export function AssetsPage() {
  const { assets, loading, error, add, drop } = useAssets()
  const { uploads, start } = useUploader(add)
  const [usage, setUsage] = useState<Map<string, string[]>>(new Map())
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    findUsage()
      .then(setUsage)
      .catch(() => setUsage(new Map()))
  }, [])

  const copy = useCallback(async (asset: Asset) => {
    try {
      await navigator.clipboard.writeText(asset.url)
      setNotice(`Copied the URL for ${asset.name}.`)
    } catch {
      window.prompt('Copy this URL:', asset.url)
    }
  }, [])

  const remove = async (asset: Asset) => {
    const usedBy = usage.get(asset.url) ?? []
    const message = usedBy.length
      ? `${asset.name} is still used by:\n\n${usedBy.join('\n')}\n\nDeleting it will leave ${
          usedBy.length === 1 ? 'that slot' : 'those slots'
        } blank on the site. Delete anyway?`
      : `Delete ${asset.name}? This can’t be undone.`
    if (!window.confirm(message)) return
    setActionError(null)
    setNotice(null)
    try {
      await deleteAsset(asset.path)
      drop(asset.path)
      setNotice(`Deleted ${asset.name}.`)
    } catch (e) {
      setActionError((e as Error).message)
    }
  }

  const shown = assets.filter((a) => matchesQuery(a, query))
  const totalBytes = assets.reduce((sum, a) => sum + a.size, 0)

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Assets</h1>
      </div>
      <p className={styles.pageBlurb}>
        Images uploaded for the site. Anything here can be picked from an image field’s Upload /
        choose button, and uploads made from there land here too. Files are never overwritten, so
        a URL in use won’t change under it.
      </p>

      <div className={media.libraryUpload}>
        <Dropzone multiple onFiles={(files) => void start(files)} />
        <UploadList uploads={uploads} />
      </div>

      {(error || actionError) && (
        <div className={`${styles.banner} ${styles.bannerError}`}>{error ?? actionError}</div>
      )}
      {notice && !error && !actionError && (
        <div className={`${styles.banner} ${styles.bannerOk}`}>{notice}</div>
      )}

      <div className={media.libraryBar}>
        <input
          className={`${styles.input} ${media.librarySearch}`}
          type="search"
          placeholder="Search by file name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className={styles.hint}>
          {assets.length} {assets.length === 1 ? 'image' : 'images'} · {formatBytes(totalBytes)}
        </span>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading assets…</div>
      ) : error ? null : shown.length === 0 ? (
        <div className={styles.empty}>
          {assets.length === 0 ? 'No assets yet — drop some images above.' : 'Nothing matches that search.'}
        </div>
      ) : (
        <div className={media.grid}>
          {shown.map((asset) => {
            const usedBy = usage.get(asset.url) ?? []
            return (
              <AssetTile key={asset.path} asset={asset}>
                <div className={media.tileUsage} title={usedBy.join('\n')}>
                  {usedBy.length ? `Used in ${usedBy.length} ${usedBy.length === 1 ? 'place' : 'places'}` : 'Not used'}
                </div>
                <div className={media.tileActions}>
                  <button type="button" className={styles.linkBtn} onClick={() => void copy(asset)}>
                    Copy URL
                  </button>
                  <a className={styles.linkBtn} href={asset.url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <span className={styles.spacer} />
                  <button
                    type="button"
                    className={`${styles.linkBtn} ${media.danger}`}
                    onClick={() => void remove(asset)}
                  >
                    Delete
                  </button>
                </div>
              </AssetTile>
            )
          })}
        </div>
      )}
    </>
  )
}
