import { useEffect, useRef, useState } from 'react'
import { ChannelIcon } from '@/components/ChannelIcon'
import { ContactForm } from '@/components/ContactForm'
import { channelOfKind } from '@/lib/content'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { ContactChannel } from '@/types'
import styles from './Contact.module.css'

/** Icon, kicker and handle — the inside of every channel card. */
function CardBody({ channel, handleClass }: { channel: ContactChannel; handleClass: string }) {
  return (
    <div className={styles.cardBody}>
      <span className={styles.icon}>
        <ChannelIcon kind={channel.kind} size={20} />
      </span>
      <div>
        <div className={styles.kicker}>{channel.blurb}</div>
        <div className={handleClass}>{channel.handle}</div>
      </div>
    </div>
  )
}

/** A channel card — an anchor when the row has a link, a plain div when not. */
function Card({ channel }: { channel: ContactChannel }) {
  const body = <CardBody channel={channel} handleClass={styles.handle} />
  return channel.href ? (
    <a
      href={channel.href}
      className={styles.card}
      target={channel.href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
    >
      {body}
    </a>
  ) : (
    <div className={styles.card}>{body}</div>
  )
}

/** How long the "Copied!" confirmation stays up. */
const COPIED_MS = 1800

/**
 * The email card copies the address rather than opening a mail client — a
 * mailto link does nothing for anyone on webmail, which is most people.
 */
function EmailCard({ channel }: { channel: ContactChannel }) {
  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(channel.handle)
    } catch {
      return
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
  }

  return (
    <button
      type="button"
      className={`${styles.card} ${styles.primary}`}
      onClick={onCopy}
      title={copy('contact.email.copy')}
    >
      <CardBody channel={channel} handleClass={styles.handleLg} />
      <span className={styles.copied} aria-live="polite">
        {copied && copy('contact.email.copied')}
      </span>
    </button>
  )
}

export function Contact() {
  // Only the niche dropdown needs content, so the page renders straight away
  // rather than sitting behind a loading state.
  const { content } = useSiteContent()
  const copy = useCopy()
  useDocumentTitle('meta.title.contact')
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
        <ContactForm niches={content?.niches.map((n) => n.name) ?? []} />

        <aside className={styles.aside}>
          <div className={styles.asideHead}>
            <div className="eyebrow">{copy('contact.aside.eyebrow')}</div>
            <p className={styles.asideNote}>{copy('contact.aside.note')}</p>
          </div>

          {email && <EmailCard channel={email} />}

          <div className={styles.pair}>
            {secondary.map((channel) => (
              <Card key={channel.id} channel={channel} />
            ))}
          </div>

          <div className={styles.note}>{copy('contact.aside.footnote')}</div>
        </aside>
      </div>
    </>
  )
}
