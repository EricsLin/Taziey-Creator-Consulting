import { useState } from 'react'
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

/**
 * Enquiry form — presentation only for now. Fields are controlled so the values
 * are ready to hand off, but nothing is submitted anywhere yet: submitting is a
 * no-op pending the Supabase edge function.
 */
export function ContactForm({ niches = [] }: Props) {
  const [values, setValues] = useState<ContactEnquiry>(EMPTY)

  const set = (key: keyof ContactEnquiry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }))

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: POST `values` to the Supabase edge function once the backend exists.
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Tell us about your channel</h2>
      <p className={styles.blurb}>
        The more you give us up front, the more useful our first reply will be.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
        <div className={styles.pair}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-name">
              Name
            </label>
            <input
              id="cf-name"
              className={styles.input}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Ryley"
              required
              value={values.name}
              onChange={set('name')}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cf-email">
              Email
            </label>
            <input
              id="cf-email"
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@channel.com"
              required
              value={values.email}
              onChange={set('email')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-channel">
            Channel link
          </label>
          <input
            id="cf-channel"
            className={styles.input}
            type="url"
            name="channelUrl"
            inputMode="url"
            placeholder="youtube.com/@yourchannel"
            required
            value={values.channelUrl}
            onChange={set('channelUrl')}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-niche">
            Niche <span className={styles.optional}>(optional)</span>
          </label>
          <select
            id="cf-niche"
            className={styles.select}
            name="niche"
            value={values.niche}
            onChange={set('niche')}
          >
            <option value="">Pick the closest one</option>
            {niches.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
            <option value="Other">Something else</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-message">
            What&rsquo;s frustrating you right now?
          </label>
          <textarea
            id="cf-message"
            className={styles.textarea}
            name="message"
            placeholder="Views are flat, the last four thumbnails flopped, no idea what to make next&hellip;"
            required
            value={values.message}
            onChange={set('message')}
          />
        </div>

        <div className={styles.submitRow}>
          <button type="submit" className={styles.submit}>
            Send it over
          </button>
          <span className={styles.reply}>We reply to everything, usually same day.</span>
        </div>
      </form>
    </div>
  )
}
