import { useCallback, useEffect, useMemo, useState } from 'react'
import { COPY_ORDER, COPY_SECTIONS, type CopyKeyDef } from '@/lib/copyKeys'
import { listCopy, saveCopy, type CopyUpsert } from './api'
import styles from './admin.module.css'

/**
 * Editor for every fixed string on the public site — headings, buttons, form
 * labels, the browser tab titles.
 *
 * The fields come from `src/lib/copyKeys.ts`, not from the database: a key with
 * no row yet is still shown here, sitting at its built-in default, and only
 * gets written once it is changed. That is why a new string needs a code change
 * but never a migration.
 *
 * Edits are held locally and written by the one Save at the top, since a copy
 * pass usually touches several fields across sections at once.
 */
export function CopyEditor() {
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSaved(await listCopy())
      setDrafts({})
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  /** What the site currently renders for a key: its row, else its default. */
  const liveValue = useCallback(
    (def: CopyKeyDef) => saved[def.key] ?? def.default,
    [saved],
  )

  const valueOf = (def: CopyKeyDef) => drafts[def.key] ?? liveValue(def)
  const isDirty = (def: CopyKeyDef) =>
    drafts[def.key] !== undefined && drafts[def.key] !== liveValue(def)

  const dirty = useMemo(
    () => COPY_SECTIONS.flatMap((section) => section.keys).filter(isDirty),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drafts, saved],
  )

  const setValue = (def: CopyKeyDef, value: string) =>
    setDrafts((d) => ({ ...d, [def.key]: value }))

  /** Back to the built-in default — staged like any other edit, not written. */
  const reset = (def: CopyKeyDef) => setDrafts((d) => ({ ...d, [def.key]: def.default }))

  const save = async () => {
    if (dirty.length === 0) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const rows: CopyUpsert[] = dirty.map((def) => ({
        key: def.key,
        value: drafts[def.key],
        section: def.section,
        label: def.label,
        multiline: !!def.multiline,
        sort_order: COPY_ORDER[def.key] ?? 0,
      }))
      await saveCopy(rows)
      setSaved((s) => ({ ...s, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) }))
      setDrafts({})
      setNotice(`Saved ${rows.length} ${rows.length === 1 ? 'string' : 'strings'}.`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Same guard the collection editors use — unsaved copy is easy to walk away
  // from, since nothing on screen looks like a form being filled in.
  useEffect(() => {
    if (dirty.length === 0) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty.length])

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Site copy</h1>
        <button
          type="button"
          className={`${styles.action} ${styles.actionPrimary}`}
          disabled={busy || dirty.length === 0}
          onClick={() => void save()}
        >
          {busy ? 'Saving…' : dirty.length > 0 ? `Save ${dirty.length} change${dirty.length === 1 ? '' : 's'}` : 'Saved'}
        </button>
      </div>
      <p className={styles.pageBlurb}>
        Every fixed string on the site, including the browser tab titles. Lists that grow and
        shrink — services, videos, creators, contact links — live in their own sections; this is
        the wording around them. Edits here go live the next time a visitor loads the page.
      </p>

      {error && <div className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}
      {notice && !error && <div className={`${styles.banner} ${styles.bannerOk}`}>{notice}</div>}
      {dirty.length > 0 && (
        <div className={`${styles.banner} ${styles.bannerInfo}`}>
          {dirty.length} unsaved {dirty.length === 1 ? 'change' : 'changes'} — hit Save to write
          them.
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading copy…</div>
      ) : (
        COPY_SECTIONS.map((section) => (
          <section key={section.name} className={styles.copySection}>
            <div className={styles.copySectionTitle}>{section.name}</div>
            <div className={styles.copyGrid}>
              {section.keys.map((def) => {
                const id = `copy-${def.key.replace(/\./g, '-')}`
                const value = valueOf(def)
                return (
                  <div
                    key={def.key}
                    className={`${styles.field} ${def.multiline ? styles.fieldFull : ''}`}
                  >
                    <label className={`${styles.label} ${styles.copyLabel}`} htmlFor={id}>
                      {def.label}
                      {isDirty(def) && <span className={styles.dirtyDot} aria-hidden="true" />}
                    </label>
                    {def.multiline ? (
                      <textarea
                        id={id}
                        className={styles.textarea}
                        value={value}
                        onChange={(e) => setValue(def, e.target.value)}
                      />
                    ) : (
                      <input
                        id={id}
                        className={styles.input}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(def, e.target.value)}
                      />
                    )}
                    <div className={styles.hint}>
                      {def.hint}
                      {def.hint && value !== def.default && ' '}
                      {value !== def.default && (
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => reset(def)}
                        >
                          Reset to default
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}
    </>
  )
}
