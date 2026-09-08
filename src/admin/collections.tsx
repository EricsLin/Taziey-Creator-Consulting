import { useEffect, useState } from 'react'
import { CollectionEditor } from './CollectionEditor'
import { listRows, type TableName } from './api'
import { VideoImportBar } from './VideoImportBar'
import styles from './admin.module.css'

/** Names from a lookup table, for the select fields that reference it. */
function useNames(table: TableName): string[] {
  const [names, setNames] = useState<string[]>([])
  useEffect(() => {
    listRows(table)
      .then((rows) => setNames(rows.map((r) => String(r.name))))
      .catch(() => setNames([]))
  }, [table])
  return names
}

export function CategoriesEditor() {
  return (
    <CollectionEditor
      table="service_categories"
      title="Service categories"
      blurb="The groups the services page breaks its list into. Order here is the order the filter chips and sections appear in. Renaming one re-points every service in it."
      fields={[
        { name: 'name', label: 'Name' },
        { name: 'blurb', label: 'One-line pitch', full: true },
      ]}
      titleOf={(r) => r.name}
      subtitleOf={(r) => r.blurb}
      newRow={() => ({ name: 'New category', blurb: '' })}
      addLabel="Add category"
    />
  )
}

export function ServicesEditor() {
  const categories = useNames('service_categories')
  return (
    <CollectionEditor
      table="services"
      title="Services"
      blurb="The numbered cards on /services. The site splits each description at the first full stop — the opening sentence leads the card, the rest becomes the detail line."
      fields={[
        { name: 'name', label: 'Name' },
        { name: 'category', label: 'Category', type: 'select', options: categories },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      titleOf={(r) => r.name}
      subtitleOf={(r) => r.category}
      newRow={() => ({ name: 'New service', category: categories[0] ?? '', description: '' })}
      addLabel="Add service"
    />
  )
}

export function CreatorsEditor() {
  return (
    <CollectionEditor
      table="creators"
      title="Creators"
      blurb="The “You may know…” rail on the home page. It pages six at a time, so multiples of six fill each page evenly."
      fields={[
        { name: 'name', label: 'Name' },
        { name: 'subscribers', label: 'Subscribers', placeholder: '1.4M', hint: 'Written as it should read — the site does no formatting.' },
        { name: 'avatar_url', label: 'Avatar URL', type: 'image', shape: 'circle', nullable: true, full: true },
      ]}
      titleOf={(r) => r.name}
      subtitleOf={(r) => `${r.subscribers} subs`}
      thumbOf={(r) => r.avatar_url}
      thumbShape="circle"
      newRow={() => ({ name: 'New creator', subscribers: '', avatar_url: null })}
      addLabel="Add creator"
    />
  )
}

export function StatsEditor() {
  return (
    <CollectionEditor
      table="stats"
      title="Stats"
      blurb="The metric cards near the bottom of the home page. Three fits the row; more will wrap."
      fields={[
        { name: 'value', label: 'Value', placeholder: '1.02B' },
        { name: 'label', label: 'Label', placeholder: 'Total views generated' },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
      titleOf={(r) => `${r.value} — ${r.label}`}
      subtitleOf={(r) => r.note}
      newRow={() => ({ value: '', label: 'New stat', note: '' })}
      addLabel="Add stat"
    />
  )
}

export function PackagingEditor() {
  return (
    <CollectionEditor
      table="packaging_flips"
      title="Packaging flips"
      blurb="The before/after wipe strip on the home page. Four cards fit the row."
      fields={[
        { name: 'creator', label: 'Creator' },
        { name: 'lift', label: 'Result', placeholder: '+41% CTR' },
        { name: 'title', label: 'Video title', full: true },
        { name: 'before_url', label: 'Before thumbnail URL', type: 'image', nullable: true },
        { name: 'after_url', label: 'After thumbnail URL', type: 'image', nullable: true },
      ]}
      titleOf={(r) => r.title}
      subtitleOf={(r) => `${r.creator} · ${r.lift}`}
      thumbOf={(r) => r.after_url}
      newRow={() => ({ creator: '', lift: '', title: 'New flip', before_url: null, after_url: null })}
      addLabel="Add flip"
    />
  )
}

export function ContactEditor() {
  return (
    <CollectionEditor
      table="contact_channels"
      title="Contact links"
      blurb="Email, Discord and Twitter as they appear in the footer, the home CTA and the contact page. The kind decides which slot a row fills, so keep one of each. Leave the link empty for a handle that isn't clickable, like Discord."
      fields={[
        { name: 'kind', label: 'Kind', type: 'select', options: ['email', 'discord', 'twitter'] },
        { name: 'label', label: 'Label', placeholder: 'Email' },
        { name: 'handle', label: 'Handle', placeholder: 'you@example.com' },
        { name: 'href', label: 'Link', nullable: true, placeholder: 'mailto:you@example.com' },
        { name: 'blurb', label: 'Kicker', full: true, hint: 'The small uppercase line above the handle.' },
      ]}
      titleOf={(r) => r.handle}
      subtitleOf={(r) => r.blurb}
      newRow={() => ({ kind: 'email', label: '', handle: '', href: null, blurb: '' })}
      addLabel="Add channel"
    />
  )
}

export function VideosEditor() {
  const niches = useNames('niches')
  return (
    <CollectionEditor
      table="videos"
      title="Videos"
      blurb="The full portfolio on /content. Set a rotator column (1–3) and position to also surface a video in the home page “Videos we helped shape” block; leave the column empty to keep it off the home page."
      fields={[
        { name: 'title', label: 'Title', full: true },
        { name: 'creator', label: 'Creator' },
        { name: 'views', label: 'Views', placeholder: '41M' },
        { name: 'niche', label: 'Niche', type: 'select', options: niches },
        { name: 'youtube_url', label: 'YouTube URL', nullable: true },
        { name: 'thumbnail_url', label: 'Thumbnail URL', type: 'image', nullable: true, full: true },
        { name: 'featured', label: 'Featured', type: 'checkbox' },
        {
          name: 'rotator_column',
          label: 'Rotator column',
          type: 'number',
          nullable: true,
          hint: '1–3, or empty to leave it off the home page.',
        },
        { name: 'rotator_position', label: 'Rotator position', type: 'number', nullable: true },
      ]}
      titleOf={(r) => r.title}
      subtitleOf={(r) =>
        [r.creator, r.views && `${r.views} views`, r.niche].filter(Boolean).join(' · ')
      }
      thumbOf={(r) => r.thumbnail_url}
      newRow={() => ({
        title: 'New video',
        creator: '',
        views: '',
        niche: niches[0] ?? '',
        featured: false,
      })}
      addLabel="Add blank video"
      toolbar={({ addRow, busy }) => <VideoImportBar addRow={addRow} busy={busy} niches={niches} />}
    />
  )
}

export function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const tables: TableName[] = [
    'videos',
    'creators',
    'services',
    'service_categories',
    'niches',
    'stats',
    'packaging_flips',
    'contact_channels',
  ]

  useEffect(() => {
    Promise.all(tables.map((t) => listRows(t).then((rows) => [t, rows.length] as const)))
      .then((pairs) => setCounts(Object.fromEntries(pairs)))
      .catch(() => setCounts({}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>
      <p className={styles.pageBlurb}>
        Everything the public site renders comes from these tables. Adds and edits are held in the
        browser until you hit Save on the row; once saved they are live the next time a visitor
        loads the page.
      </p>
      <div className={styles.copyGrid}>
        {tables.map((table) => (
          <div key={table} className={styles.field}>
            <div className={styles.label}>{table.replace(/_/g, ' ')}</div>
            <div style={{ fontSize: 26, fontFamily: 'var(--font-display)' }}>
              {counts[table] ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
