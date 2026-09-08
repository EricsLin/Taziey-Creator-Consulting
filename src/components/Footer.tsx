import { channelOfKind } from '@/lib/content'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import styles from './Footer.module.css'

export function Footer() {
  const { content } = useSiteContent()
  const copy = useCopy()
  const channels = content?.contact ?? []
  const discord = channelOfKind(channels, 'discord')

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.copy}>{copy('footer.copy')}</div>
        <div className={styles.links}>
          {channels
            .filter((channel) => channel.href)
            .map((channel) => (
              <a
                key={channel.id}
                href={channel.href!}
                target={channel.href!.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {channel.label}
              </a>
            ))}
          {discord && !discord.href && (
            <span>
              {discord.label}: {discord.handle}
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
