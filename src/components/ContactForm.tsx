import { useState } from 'react'
import { useCopy } from '@/lib/useSiteContent'
import styles from './ContactForm.module.css'

export interface ContactEnquiry {
  name: string
  email: string
  channelUrl: string
  niche: string
  message: string
}

const EMPTY: ContactEnquiry = {
  name: '',
  email: '',
  channelUrl: '',
  niche: '',
  message: '',
}

interface Props {
  /** Niche options for the dropdown; comes from site content. */
  niches?: string[]
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

const ENDPOINT = 'https://api.web3forms.com/submit'

/**
 * Enquiry form. Submissions go to Web3Forms, which emails them to the inbox the
 * access key is registered to; the sender's address becomes the reply-to.
 */
export function ContactForm({ niches = [] }: Props) {
  const copy = useCopy()
  const [values, setValues] = useState<ContactEnquiry>(EMPTY)
  const [status, setStatus] = useState<Status>('idle')
  // Honeypot: hidden from people, so anything in it came from a bot.
  const [botcheck, setBotcheck] = useState(false)

  const set = (key: keyof ContactEnquiry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    if (status === 'sent' || status === 'error') setStatus('idle')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY,
          subject: `New enquiry from ${values.name}`,
          from_name: 'Taziey website',
          name: values.name,
          email: values.email,
          'Channel link': values.channelUrl,
          Niche: values.niche || '—',
          message: values.message,
          botcheck,
        }),
      })
      const data: { success?: boolean } = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error('Submission rejected')
      setValues(EMPTY)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{copy('contact.form.title')}</h2>
      <p className={styles.blurb}>{copy('contact.form.blurb')}</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
        <div className={styles.pair}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-name">
              {copy('contact.form.name_label')}
            </label>
            <input
              id="cf-name"
              className={styles.input}
              type="text"
              name="name"
              autoComplete="name"
              placeholder={copy('contact.form.name_placeholder')}
              required
              value={values.name}
              onChange={set('name')}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-email">
              {copy('contact.form.email_label')}
            </label>
            <input
              id="cf-email"
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={copy('contact.form.email_placeholder')}
              required
              value={values.email}
              onChange={set('email')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-channel">
            {copy('contact.form.channel_label')}
          </label>
          <input
            id="cf-channel"
            className={styles.input}
            type="text"
            name="channelUrl"
            inputMode="url"
            placeholder={copy('contact.form.channel_placeholder')}
            required
            value={values.channelUrl}
            onChange={set('channelUrl')}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-niche">
            {copy('contact.form.niche_label')}{' '}
            <span className={styles.optional}>{copy('contact.form.niche_optional')}</span>
          </label>
          <select
            id="cf-niche"
            className={styles.select}
            name="niche"
            value={values.niche}
            onChange={set('niche')}
          >
            <option value="">{copy('contact.form.niche_placeholder')}</option>
            {niches.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
            <option value="Other">{copy('contact.form.niche_other')}</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-message">
            {copy('contact.form.message_label')}
          </label>
          <textarea
            id="cf-message"
            className={styles.textarea}
            name="message"
            placeholder={copy('contact.form.message_placeholder')}
            required
            value={values.message}
            onChange={set('message')}
          />
        </div>

        <input
          type="checkbox"
          name="botcheck"
          className={styles.honeypot}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          checked={botcheck}
          onChange={(e) => setBotcheck(e.target.checked)}
        />

        <div className={styles.submitRow}>
          <button type="submit" className={styles.submit} disabled={status === 'sending'}>
            {status === 'sending'
              ? copy('contact.form.sending_label')
              : copy('contact.form.submit_label')}
          </button>
          <span className={styles.reply}>{copy('contact.form.reply_note')}</span>
        </div>

        <p className={styles.status} data-status={status} role="status" aria-live="polite">
          {status === 'sent' && copy('contact.form.success')}
          {status === 'error' && copy('contact.form.error')}
        </p>
      </form>
    </div>
  )
}
