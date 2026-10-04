import { useCallback, useEffect, useRef, useState } from 'react'
import { ACCEPT_ATTR, formatBytes, listAssets, rejectReason, uploadImage, type Asset } from './media'
import styles from './admin.module.css'
import media from './media.module.css'

/* ---- data ----------------------------------------------------------------- */

/** The bucket's contents, with local add/remove so the grid updates without a refetch. */
export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setAssets(await listAssets())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const add = useCallback((asset: Asset) => setAssets((a) => [asset, ...a]), [])
  const drop = useCallback((path: string) => setAssets((a) => a.filter((x) => x.path !== path)), [])

  return { assets, loading, error, reload, add, drop }
}

interface Upload {
  id: number
  name: string
  progress: number
  error?: string
}

let uploadCounter = 0

/**
 * Uploads files in parallel and tracks each one's progress. Finished uploads
 * drop off the list; failed ones stay with their reason until the next batch.
 */
export function useUploader(onUploaded: (asset: Asset) => void) {
  const [uploads, setUploads] = useState<Upload[]>([])

  const patch = (id: number, next: Partial<Upload>) =>
    setUploads((us) => us.map((u) => (u.id === id ? { ...u, ...next } : u)))

  const start = useCallback(
    async (files: File[]) => {
      const batch = files.map((file) => ({
        file,
        upload: { id: ++uploadCounter, name: file.name, progress: 0, error: rejectReason(file) ?? undefined },
      }))
      setUploads((us) => [...us.filter((u) => !u.error), ...batch.map((b) => b.upload)])

      await Promise.all(
        batch
          .filter((b) => !b.upload.error)
          .map(async ({ file, upload }) => {
            try {
              const asset = await uploadImage(file, (progress) => patch(upload.id, { progress }))
              setUploads((us) => us.filter((u) => u.id !== upload.id))
              onUploaded(asset)
            } catch (e) {
              patch(upload.id, { error: (e as Error).message })
            }
          }),
      )
    },
    [onUploaded],
  )

  const busy = uploads.some((u) => !u.error)
  return { uploads, start, busy }
}

/* ---- pieces --------------------------------------------------------------- */

/** Click-to-browse and drag-and-drop target for image files. */
export function Dropzone({
  multiple,
  disabled,
  onFiles,
  children,
}: {
  multiple?: boolean
  disabled?: boolean
  onFiles: (files: File[]) => void
  children?: React.ReactNode
}) {
  const [over, setOver] = useState(false)

  return (
    <label
      className={`${media.dropzone} ${over ? media.dropzoneOver : ''} ${disabled ? media.dropzoneDisabled : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        if (disabled) return
        const files = Array.from(e.dataTransfer.files)
        if (files.length) onFiles(multiple ? files : files.slice(0, 1))
      }}
    >
      <input
        type="file"
        accept={ACCEPT_ATTR}
        multiple={multiple}
        disabled={disabled}
        className={media.fileInput}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (files.length) onFiles(files)
        }}
      />
      <span className={media.dropIcon} aria-hidden="true">
        ↑
      </span>
      <span className={media.dropTitle}>
        {over ? 'Drop to upload' : multiple ? 'Drop images here or browse' : 'Drop an image here or browse'}
      </span>
      <span className={media.dropNote}>PNG, JPEG, WebP, GIF or AVIF · up to 50 MB</span>
      {children}
    </label>
  )
}

export function UploadList({ uploads }: { uploads: Upload[] }) {
  if (uploads.length === 0) return null
  return (
    <ul className={media.uploads}>
      {uploads.map((u) => (
        <li key={u.id} className={media.upload}>
          <div className={media.uploadRow}>
            <span className={media.uploadName}>{u.name}</span>
            <span className={media.uploadPct}>{u.error ? 'Failed' : `${Math.round(u.progress * 100)}%`}</span>
          </div>
          {u.error ? (
            <div className={media.uploadError}>{u.error}</div>
          ) : (
            <div className={media.bar}>
              <div className={media.barFill} style={{ width: `${u.progress * 100}%` }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export function matchesQuery(asset: Asset, query: string): boolean {
  return asset.name.toLowerCase().includes(query.trim().toLowerCase())
}

/** Square thumbnail of an asset with its name and size underneath. */
export function AssetTile({
  asset,
  selected,
  onClick,
  children,
}: {
  asset: Asset
  selected?: boolean
  onClick?: () => void
  children?: React.ReactNode
}) {
  const body = (
    <>
      <div className={media.tileImg}>
        <img src={asset.url} alt="" loading="lazy" />
      </div>
      <div className={media.tileName} title={asset.name}>
        {asset.name}
      </div>
      <div className={media.tileMeta}>{formatBytes(asset.size)}</div>
    </>
  )
  return (
    <div className={`${media.tile} ${selected ? media.tileSelected : ''}`}>
      {onClick ? (
        <button type="button" className={media.tileBtn} onClick={onClick} title={`Use ${asset.name}`}>
          {body}
        </button>
      ) : (
        body
      )}
      {children}
    </div>
  )
}

/* ---- picker --------------------------------------------------------------- */

/**
 * The "upload or choose" dialog behind every image field. Uploading a file
 * selects it as soon as it lands; picking an existing asset selects that.
 * Either way the field just receives a URL.
 */
export function MediaPicker({
  open,
  current,
  onSelect,
  onClose,
}: {
  open: boolean
  current?: string
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={media.dialog}
      onClose={onClose}
      // A click that lands on the dialog element itself is a click on the backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {open && <PickerBody current={current} onSelect={onSelect} onClose={onClose} />}
    </dialog>
  )
}

function PickerBody({
  current,
  onSelect,
  onClose,
}: {
  current?: string
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const { assets, loading, error, add } = useAssets()
  const [query, setQuery] = useState('')

  const choose = useCallback(
    (asset: Asset) => {
      onSelect(asset.url)
      onClose()
    },
    [onSelect, onClose],
  )
  const uploaded = useCallback(
    (asset: Asset) => {
      add(asset)
      choose(asset)
    },
    [add, choose],
  )
  const { uploads, start, busy } = useUploader(uploaded)

  // Paste an image straight from the clipboard while the picker is open.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'))
      if (file && !busy) {
        e.preventDefault()
        void start([file])
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [busy, start])

  const shown = assets.filter((a) => matchesQuery(a, query))

  return (
    <div className={media.picker}>
      <div className={media.pickerHead}>
        <h2 className={media.pickerTitle}>Choose an image</h2>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className={media.pickerBody}>
        <section className={media.pickerUpload}>
          <div className={media.pickerLabel}>Upload from your computer</div>
          <Dropzone disabled={busy} onFiles={(files) => void start(files)} />
          <div className={styles.hint}>You can also paste an image. It’s added to your assets and used here.</div>
          <UploadList uploads={uploads} />
        </section>

        <section className={media.pickerAssets}>
          <div className={media.pickerAssetsHead}>
            <div className={media.pickerLabel}>Your assets</div>
            <a className={styles.linkBtn} href="/admin/assets" target="_blank" rel="noreferrer">
              Open library ↗
            </a>
          </div>
          <input
            className={styles.input}
            type="search"
            placeholder="Search by file name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {error ? (
            <div className={`${styles.banner} ${styles.bannerError}`}>{error}</div>
          ) : loading ? (
            <div className={media.gridEmpty}>Loading assets…</div>
          ) : shown.length === 0 ? (
            <div className={media.gridEmpty}>
              {assets.length === 0 ? 'No assets yet — upload the first one.' : 'Nothing matches that search.'}
            </div>
          ) : (
            <div className={`${media.grid} ${media.gridScroll}`}>
              {shown.map((asset) => (
                <AssetTile
                  key={asset.path}
                  asset={asset}
                  selected={asset.url === current}
                  onClick={() => choose(asset)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/* ---- field ---------------------------------------------------------------- */

/**
 * An image column in an editor: the URL itself stays editable — paste any link
 * — with the upload / asset picker one click away. Whatever route is taken, the
 * column only ever stores a URL.
 */
export function ImageField({
  id,
  value,
  onChange,
  nullable,
  placeholder,
  shape = 'rect',
}: {
  id: string
  value: string
  onChange: (value: string | null) => void
  nullable?: boolean
  placeholder?: string
  shape?: 'rect' | 'circle'
}) {
  const [picking, setPicking] = useState(false)
  const set = (next: string) => onChange(next === '' && nullable ? null : next)

  return (
    <>
      <div className={media.urlRow}>
        <input
          id={id}
          className={styles.input}
          type="text"
          value={value}
          placeholder={placeholder ?? 'https://… or upload one'}
          onChange={(e) => set(e.target.value)}
        />
        <button type="button" className={styles.action} onClick={() => setPicking(true)}>
          Upload / choose
        </button>
      </div>

      {value && (
        <div className={media.previewRow}>
          <div className={`${styles.preview} ${shape === 'circle' ? styles.previewCircle : ''}`}>
            <img src={value} alt="" referrerPolicy="no-referrer" />
          </div>
          <button type="button" className={styles.linkBtn} onClick={() => set('')}>
            Remove image
          </button>
        </div>
      )}

      <MediaPicker open={picking} current={value} onSelect={set} onClose={() => setPicking(false)} />
    </>
  )
}
