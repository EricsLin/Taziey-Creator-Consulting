import { ContactForm } from '@/components/ContactForm'
import { channelOfKind } from '@/lib/content'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import type { ContactChannel } from '@/types'
import styles from './Contact.module.css'

/** A channel card — an anchor when the row has a link, a plain div when not. */
function Card({
  channel,
  className,
  handleClass,
  children,
}: {
  channel: ContactChannel
  className: string
  handleClass: string
  children?: React.ReactNode
}) {
  const body = (
    <>
      <div>
        <div className={styles.kicker}>{channel.blurb}</div>
        <div className={handleClass}>{channel.handle}</div>
      </div>
      {children}
    </>
  )
  return channel.href ? (
    <a
      href={channel.href}
      className={className}
      target={channel.href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  )
}

export function Contact() {
  // Only the niche dropdown needs content, so the page renders straight away
  // rather than sitting behind a loading state.
  const { content } = useSiteContent()
  const copy = useCopy()
  const channels = content?.contact ?? []
  const email = channelOfKind(channels, 'email')
  const secondary = channels.filter((channel) => channel.kind !== 'email')

  return (
    <>
      <section className={styles.intro}>
        <div className={styles.glow} aria-hidden="true" />
        <h1 className={styles.title}>{copy('contact.title')}</h1>
        <p className={styles.lede}>{copy('contact.lede')}</p>
      </section>

      <div className={styles.body}>
        <ContactForm niches={content?.niches ?? []} />

        <aside className={styles.aside}>
          <div className={styles.asideHead}>
            <div className="eyebrow">{copy('contact.aside.eyebrow')}</div>
            <p className={styles.asideNote}>{copy('contact.aside.note')}</p>
          </div>

          {email && (
            <Card
              channel={email}
              className={`${styles.card} ${styles.primary}`}
              handleClass={styles.handleLg}
            >
              <div className={styles.chev} aria-hidden="true">
                &rarr;
              </div>
            </Card>
          )}

          <div className={styles.pair}>
            {secondary.map((channel) => (
              <Card
                key={channel.id}
                channel={channel}
                className={styles.card}
                handleClass={styles.handle}
              />
            ))}
          </div>

          <div className={styles.note}>{copy('contact.aside.footnote')}</div>
        </aside>
      </div>
    </>
  )
}
