import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PageState } from '@/components/PageState'
import { Skeleton, SkeletonScreen } from '@/components/Skeleton'
import { SmartLink } from '@/components/SmartLink'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import type { Service, ServiceCategory } from '@/types'
import styles from './Services.module.css'

/**
 * Every description opens with a "what it is" sentence and follows with the
 * "how it works" detail — splitting them lets the panel lead with the point.
 */
function splitDescription(description: string): [string, string] {
  const end = description.indexOf('. ')
  if (end === -1) return [description, '']
  return [description.slice(0, end + 1), description.slice(end + 2)]
}

/**
 * One category: heading, blurb, a column of its services, and the detail panel
 * beside them. Exactly one service per section is open at a time — the panel
 * would read as broken empty, so selecting is a switch, not a toggle.
 *
 * Wide screens put the panel to the right of the column; below 860px the two
 * stack and the panel sits under the buttons.
 */
function ServiceGroup({
  category,
  items,
  numberOf,
}: {
  category: ServiceCategory
  items: Service[]
  numberOf: Map<string, number>
}) {
  const [openId, setOpenId] = useState(items[0].id)
  const railRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  // Where the accent marker sits, so it can slide between buttons.
  const [marker, setMarker] = useState<{ y: number; h: number } | null>(null)

  // Falls back to the first service if the open one vanishes on a content edit.
  const open = items.find((service) => service.id === openId) ?? items[0]

  const placeMarker = useCallback(() => {
    const button = buttonRefs.current.get(open.id)
    if (!button) return
    setMarker({ y: button.offsetTop, h: button.offsetHeight })
  }, [open.id])

  // Measure before paint so the marker never shows at a stale position.
  useLayoutEffect(placeMarker, [placeMarker])

  // Buttons change height when the rail reflows, which moves the marker.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const observer = new ResizeObserver(placeMarker)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [placeMarker])

  /** Up/down walks the list, the way a tab strip is expected to behave. */
  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
    const first = event.key === 'Home'
    const last = event.key === 'End'
    if (!step && !first && !last) return
    event.preventDefault()
    const at = items.findIndex((service) => service.id === open.id)
    const next = first ? 0 : last ? items.length - 1 : (at + step + items.length) % items.length
    setOpenId(items[next].id)
    buttonRefs.current.get(items[next].id)?.focus()
  }

  const [lead, detail] = splitDescription(open.description)
  const panelId = `services-panel-${category.id}`

  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <h2 className={styles.groupTitle}>{category.name}</h2>
        <p className={styles.groupBlurb}>{category.blurb}</p>
      </div>

      <div className={styles.groupBody}>
        <div
          className={styles.rail}
          ref={railRef}
          role="tablist"
          aria-orientation="vertical"
          aria-label={category.name}
          onKeyDown={onKeyDown}
        >
          <span
            className={styles.marker}
            aria-hidden="true"
            style={
              marker
                ? ({
                    '--marker-y': `${marker.y}px`,
                    '--marker-h': `${marker.h}px`,
                  } as React.CSSProperties)
                : { opacity: 0 }
            }
          />
          {items.map((service) => {
            const isOpen = service.id === open.id
            return (
              <button
                key={service.id}
                type="button"
                role="tab"
                id={`service-tab-${service.id}`}
                ref={(node) => {
                  if (node) buttonRefs.current.set(service.id, node)
                  else buttonRefs.current.delete(service.id)
                }}
                className={`${styles.pill} ${isOpen ? styles.pillOpen : ''}`}
                aria-selected={isOpen}
                aria-controls={panelId}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => setOpenId(service.id)}
              >
                <span className={styles.pillNum}>
                  {String(numberOf.get(service.id) ?? 0).padStart(2, '0')}
                </span>
                <span className={styles.pillName}>{service.name}</span>
                <span className={styles.pillMark} aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div className={styles.panel} id={panelId} role="tabpanel" aria-labelledby={`service-tab-${open.id}`}>
          {/* Keyed so switching services replays the entrance animation. */}
          <div className={styles.panelBody} key={open.id}>
            <h3 className={styles.panelName}>{open.name}</h3>
            <p className={styles.panelLead}>{lead}</p>
            {detail && <p className={styles.panelDetail}>{detail}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Placeholder shaped like the real page — same widths, same rails. */
function ServicesSkeleton() {
  return (
    <SkeletonScreen>
      <section className={styles.intro}>
        <Skeleton w={150} h={13} className={styles.eyebrowSpacing} />
        <div className={styles.skelTitle}>
          <Skeleton w="min(600px, 85%)" h={54} />
          <Skeleton w="min(380px, 55%)" h={54} />
        </div>
        <div className={styles.skelStack}>
          <Skeleton w="min(520px, 90%)" h={17} />
          <Skeleton w="min(400px, 72%)" h={17} />
        </div>
      </section>

      <section className={styles.groups}>
        {[0, 1].map((group) => (
          <div key={group} className={styles.group}>
            <div className={styles.groupHead}>
              <Skeleton w={180} h={25} />
              <Skeleton w={220} h={15} />
            </div>
            <div className={styles.groupBody}>
              <div className={styles.rail}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} w="100%" h={52} radius="14px" />
                ))}
              </div>
              <div className={`${styles.panelBody} ${styles.skelStack}`}>
                <Skeleton w="55%" h={22} />
                <Skeleton w="92%" h={16} />
                <Skeleton w="78%" h={16} />
              </div>
            </div>
          </div>
        ))}
      </section>
    </SkeletonScreen>
  )
}

export function Services() {
  const { content, loading, error } = useSiteContent()
  const copy = useCopy()

  const groups = useMemo(() => {
    if (!content) return []
    return content.categories
      .map((category) => ({
        category,
        items: content.services.filter((service) => service.category === category.name),
      }))
      .filter((group) => group.items.length > 0)
  }, [content])

  // Numbering runs across the whole list, not per group.
  const numberOf = useMemo(() => {
    const map = new Map<string, number>()
    content?.services.forEach((service, i) => map.set(service.id, i + 1))
    return map
  }, [content])

  if (loading) return <ServicesSkeleton />
  if (error || !content) return <PageState>Couldn&rsquo;t load the services list.</PageState>

  return (
    <>
      <section className={styles.intro}>
        <div className={`eyebrow ${styles.eyebrowSpacing}`}>{copy('services.eyebrow')}</div>
        <h1 className={styles.title}>{copy('services.title')}</h1>
        <p className={styles.lede}>{copy('services.lede')}</p>
      </section>

      <section className={styles.groups}>
        {groups.map((group) => (
          <ServiceGroup
            key={group.category.id}
            category={group.category}
            items={group.items}
            numberOf={numberOf}
          />
        ))}
      </section>

      <section className={styles.consult}>
        <div className={styles.consultPanel}>
          <div className={styles.consultBody}>
            <div className={`eyebrow ${styles.eyebrowSpacing}`}>
              {copy('services.consult.eyebrow')}
            </div>
            <h2 className={styles.consultTitle}>{copy('services.consult.title')}</h2>
            <p className={styles.consultText}>{copy('services.consult.text')}</p>
            <div className={styles.bullets}>
              {copy('services.consult.bullets')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <div key={line} className={styles.bullet}>
                    <span className={styles.arrow}>&rarr;</span> {line}
                  </div>
                ))}
            </div>
          </div>
          <div className={styles.priceCol}>
            <div className={styles.priceRow}>
              <div className={styles.price}>{copy('services.consult.price')}</div>
              <div className={styles.per}>{copy('services.consult.per')}</div>
            </div>
            <div className={styles.priceNote}>{copy('services.consult.price_note')}</div>
            <SmartLink to={copy('services.consult.book_href', '/contact')} className={styles.book}>
              {copy('services.consult.book_label')}
            </SmartLink>
          </div>
        </div>
      </section>
    </>
  )
}
