import { ChannelIcon } from '@/components/ChannelIcon'
import { channelOfKind } from '@/lib/content'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import styles from './ContactCta.module.css'

export function ContactCta() {
  const { content } = useSiteContent()
  const copy = useCopy()
  const channels = content?.contact ?? []

  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <div>
          <h2 className={styles.title}>{copy('home.cta.title')}</h2>
          <p className={styles.blurb}>{copy('home.cta.blurb')}</p>
        </div>
        <div className={styles.channels}>
          {(['email', 'discord', 'twitter'] as const).map((kind) => {
            const channel = channelOfKind(channels, kind)
            if (!channel) return null
            const className = `${styles.row} ${
              kind === 'email' ? styles['row--primary'] : ''
            }`.trim()
            const body = (
              <>
                <span className={styles.handle}>
                  <ChannelIcon kind={kind} size={17} />
                  {channel.handle}
                </span>
                <span className={styles.kind}>{channel.label}</span>
              </>
            )
            // A channel with no link — Discord, typically — is a plain row.
            return channel.href ? (
              <a
                key={channel.id}
                href={channel.href}
                className={className}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {body}
              </a>
            ) : (
              <div key={channel.id} className={className}>
                {body}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
