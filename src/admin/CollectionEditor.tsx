import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteRow, insertRow, listRows, persistOrder, updateRow, type Row, type TableName } from './api'
import styles from './admin.module.css'

export interface FieldDef {
  /** Column name on the table. */
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'image' | 'date'
  /** Choices for `select` — a bare string is its own value. An empty first
   *  option is added when `nullable`. */
  options?: Array<string | { value: string; label: string }>
  /** Blank input saves null rather than an empty string. */
  nullable?: boolean
  hint?: string
  placeholder?: string
  /** Span both columns of the card grid. */
  full?: boolean
  /** Preview shape for `image` fields. */
  shape?: 'rect' | 'circle'
}

interface Props {
  table: TableName
  title: string
  blurb: string
  fields: FieldDef[]
  /** Headline for a row's collapsed card. */
  titleOf: (row: Row) => string
  subtitleOf?: (row: Row) => string
  /** Image URL for the collapsed card, when the row has one. */
  thumbOf?: (row: Row) => string | null | undefined
  thumbShape?: 'rect' | 'circle'
  /** Column values for a freshly added row. */
  newRow: () => Row
  addLabel?: string
  /** Extra controls above the list — e.g. the YouTube importer. */
  toolbar?: (helpers: { addRow: (values: Row) => Promise<void>; busy: boolean }) => React.ReactNode
}

/** Client-side id for a row that has not been inserted yet. */
const NEW_PREFIX = 'new:'
const isNew = (row: Row) => String(row.id).startsWith(NEW_PREFIX)

let newRowCounter = 0

/**
 * List-of-rows editor shared by every content table.
 *
 * Each row is a collapsed card that expands into a form; edits are held locally
 * and written on Save, so a half-typed field never reaches the live site. Adding
 * works the same way: a new row is staged in the list, open for editing, and
 * only reaches the database when its Save is clicked. Reordering writes
 * `sort_order` straight away for rows that exist, since there is nothing to
 * half-type about a move.
 */
export function CollectionEditor({
  table,
  title,
  blurb,
  fields,
  titleOf,
  subtitleOf,
  thumbOf,
  thumbShape = 'rect',
  newRow,
  addLabel = 'Add',
  toolbar,
}: Props) {
  const [rows, setRows] = useState<Row[]>([])
  const [drafts, setDrafts] = useState<Record<string, Row>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await listRows(table))
      setDrafts({})
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [table])

  useEffect(() => {
    void load()
  }, [load])

  const draftFor = (row: Row): Row => drafts[row.id] ?? row

  const setField = (row: Row, name: string, value: unknown) => {
    setDrafts((d) => ({ ...d, [row.id]: { ...draftFor(row), [name]: value } }))
  }

  // A staged row is dirty by definition - nothing about it has been written yet.
  const isDirty = (row: Row) =>
    isNew(row) || (!!drafts[row.id] && fields.some((f) => drafts[row.id][f.name] !== row[f.name]))

  const run = async (fn: () => Promise<void>, okMessage?: string) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await fn()
      if (okMessage) setNotice(okMessage)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const save = (row: Row) =>
    run(async () => {
      const draft = draftFor(row)

      if (isNew(row)) {
        // Keep whatever the staged row carries beyond the form's fields — the
        // YouTube importer, for one, fills in columns that have no input.
        const { id: _staged, ...values } = draft
        const index = rows.findIndex((r) => r.id === row.id)
        const created = await insertRow(table, { ...values, sort_order: index + 1 })
        const next = rows.map((r) => (r.id === row.id ? created : r))
        setRows(next)
        setOpenId((id) => (id === row.id ? created.id : id))
        setDrafts((d) => {
          const rest = { ...d }
          delete rest[row.id]
          return rest
        })
        await persistOrder(table, next.filter((r) => !isNew(r)).map((r) => r.id))
        return
      }

      const patch: Row = {}
      fields.forEach((f) => {
        if (draft[f.name] !== row[f.name]) patch[f.name] = draft[f.name]
      })
      if (Object.keys(patch).length === 0) return
      await updateRow(table, row.id, patch)
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...patch } : r)))
      setDrafts((d) => {
        const next = { ...d }
        delete next[row.id]
        return next
      })
    }, 'Saved.')

  /**
   * New rows are staged at the top of the list, opened for editing, rather than
   * at the bottom where the form would be a long scroll away. Nothing is written
   * until Save on that row.
   */
  const addRow = async (values: Row) => {
    const staged: Row = { ...values, id: `${NEW_PREFIX}${++newRowCounter}` }
    setRows((rs) => [staged, ...rs])
    setOpenId(staged.id)
    setError(null)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = (row: Row) => {
    // A staged row was never written, so discarding it is purely local.
    if (isNew(row)) {
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      setDrafts((d) => {
        const rest = { ...d }
        delete rest[row.id]
        return rest
      })
      setOpenId((id) => (id === row.id ? null : id))
      return
    }
    if (!window.confirm(`Delete “${titleOf(row) || 'this row'}”? This can’t be undone.`)) return
    void run(async () => {
      await deleteRow(table, row.id)
      const next = rows.filter((r) => r.id !== row.id)
      setRows(next)
      await persistOrder(table, next.filter((r) => !isNew(r)).map((r) => r.id))
    }, 'Deleted.')
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    setRows(next)
    // Staged rows have no sort_order to write yet; they take their place on save.
    if (isNew(next[index]) && isNew(next[target])) return
    void run(() => persistOrder(table, next.filter((r) => !isNew(r)).map((r) => r.id)))
  }

  const stagedCount = useMemo(() => rows.filter(isNew).length, [rows])
  const dirtyCount = useMemo(() => rows.filter((r) => !isNew(r) && isDirty(r)).length, [rows, drafts])

  // Staged rows and edits live only in this tab, so leaving would drop them.
  useEffect(() => {
    if (stagedCount === 0 && dirtyCount === 0) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [stagedCount, dirtyCount])

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <button
          type="button"
          className={`${styles.action} ${styles.actionPrimary}`}
          disabled={busy}
          onClick={() => void addRow(newRow())}
        >
          + {addLabel}
        </button>
      </div>
      <p className={styles.pageBlurb}>{blurb}</p>

      {toolbar?.({ addRow, busy })}

      {error && <div className={`${styles.banner} ${styles.bannerError}`}>{error}</div>}
      {notice && !error && <div className={`${styles.banner} ${styles.bannerOk}`}>{notice}</div>}
      {(dirtyCount > 0 || stagedCount > 0) && (
        <div className={`${styles.banner} ${styles.bannerInfo}`}>
          {[
            stagedCount > 0 && `${stagedCount} new row${stagedCount === 1 ? '' : 's'} not added yet`,
            dirtyCount > 0 && `${dirtyCount} row${dirtyCount === 1 ? '' : 's'} with unsaved edits`,
          ]
            .filter(Boolean)
            .join(' · ')}{' '}
          — hit Save on each to write it.
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>Nothing here yet — add the first one.</div>
      ) : (
        rows.map((row, index) => {
          const draft = draftFor(row)
          const open = openId === row.id
          const dirty = isDirty(row)
          const thumb = thumbOf?.(draft)

          return (
            <div key={row.id} className={`${styles.card} ${dirty ? styles.cardDirty : ''}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardIndex}>
                  {isNew(row) ? '—' : String(index + 1).padStart(2, '0')}
                </span>
                {thumbOf && (
                  <div
                    className={`${styles.cardThumb} ${
                      thumbShape === 'circle' ? styles.cardThumbCircle : ''
                    }`}
                  >
                    {thumb ? <img src={thumb} alt="" referrerPolicy="no-referrer" /> : null}
                  </div>
                )}
                <button
                  type="button"
                  className={styles.cardTitleWrap}
                  onClick={() => setOpenId(open ? null : row.id)}
                  aria-expanded={open}
                >
                  <div className={styles.cardTitle}>
                    {isNew(row) && <span className={styles.newTag}>Not added</span>}
                    {titleOf(draft) || 'Untitled'}
                  </div>
                  {subtitleOf && <div className={styles.cardSub}>{subtitleOf(draft)}</div>}
                </button>
                <div className={styles.cardTools}>
                  {dirty && <span className={styles.dirtyDot} aria-label="Unsaved changes" />}
                  <button
                    type="button"
                    className={styles.iconBtn}
                    title="Move up"
                    disabled={index === 0 || busy}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    title="Move down"
                    disabled={index === rows.length - 1 || busy}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    title={open ? 'Collapse' : 'Edit'}
                    onClick={() => setOpenId(open ? null : row.id)}
                  >
                    {open ? '×' : '✎'}
                  </button>
                </div>
              </div>

              {open && (
                <div className={styles.cardBody}>
                  {fields.map((field) => (
                    <Field
                      key={field.name}
                      field={field}
                      value={draft[field.name]}
                      onChange={(v) => setField(row, field.name, v)}
                    />
                  ))}
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={`${styles.action} ${styles.actionPrimary}`}
                      disabled={!dirty || busy}
                      onClick={() => void save(row)}
                    >
                      {isNew(row) ? 'Save & add' : 'Save'}
                    </button>
                    {!isNew(row) && (
                      <button
                        type="button"
                        className={styles.action}
                        disabled={!dirty || busy}
                        onClick={() =>
                          setDrafts((d) => {
                            const next = { ...d }
                            delete next[row.id]
                            return next
                          })
                        }
                      >
                        Revert
                      </button>
                    )}
                    <span className={styles.spacer} />
                    <button
                      type="button"
                      className={`${styles.action} ${styles.actionDanger}`}
                      disabled={busy}
                      onClick={() => remove(row)}
                    >
                      {isNew(row) ? 'Discard' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </>
  )
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
}) {
  const id = `field-${field.name}`
  const text = value == null ? '' : String(value)
  const full = field.full || field.type === 'textarea'

  if (field.type === 'checkbox') {
    return (
      <label className={`${styles.checkboxRow} ${full ? styles.fieldFull : ''}`} htmlFor={id}>
        <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    )
  }

  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.label} htmlFor={id}>
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={id}
          className={styles.textarea}
          value={text}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          className={styles.select}
          value={text}
          onChange={(e) => onChange(e.target.value === '' && field.nullable ? null : e.target.value)}
        >
          {field.nullable && <option value="">—</option>}
          {(field.options ?? []).map((option) => {
            const { value: v, label } =
              typeof option === 'string' ? { value: option, label: option } : option
            return (
              <option key={v} value={v}>
                {label}
              </option>
            )
          })}
        </select>
      ) : (
        <input
          id={id}
          className={styles.input}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={text}
          placeholder={field.placeholder}
          onChange={(e) => {
            const raw = e.target.value
            if (field.type === 'number') {
              onChange(raw === '' ? null : Number(raw))
            } else {
              onChange(raw === '' && field.nullable ? null : raw)
            }
          }}
        />
      )}

      {field.hint && <div className={styles.hint}>{field.hint}</div>}

      {field.type === 'image' && text && (
        <div className={`${styles.preview} ${field.shape === 'circle' ? styles.previewCircle : ''}`}>
          <img src={text} alt="" referrerPolicy="no-referrer" />
        </div>
      )}
    </div>
  )
}
