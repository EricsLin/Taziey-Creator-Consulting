/**
 * Every editable string on the public site, in one list.
 *
 * This is the single source of truth for what the copy editor in /admin shows
 * and for what the site renders before `site_copy` has loaded. A key only needs
 * a row in the database once someone has changed it — until then `default`
 * below is what visitors see, which is why adding a string here needs no
 * migration. Saving in /admin upserts the key with the section, label and order
 * it carries here, so the table stays readable if you ever query it directly.
 *
 * To make a new string editable: add an entry here and read it with `useCopy()`
 * in the component. Nothing else.
 */
export interface CopyKeyDef {
  key: string
  /** Field label in the admin editor. */
  label: string
  /** Groups the field under a heading in the admin editor. */
  section: string
  /** Render as a textarea rather than a single-line input. */
  multiline?: boolean
  /** Small note under the field, for anything non-obvious. */
  hint?: string
  /** What the site renders when the key has no row in `site_copy`. */
  default: string
}

/** Hint for a string that carries `{token}` placeholders. */
const tokenHint = (tokens: string) => `Keep the ${tokens} placeholder — the value is filled in.`

const KEYS: CopyKeyDef[] = [
  /* ---- Browser tab & meta ---- */
  {
    key: 'meta.title.home',
    section: 'Browser tab & meta',
    label: 'Tab title — home',
    default: 'Taziey — Creators helping creators grow.',
  },
  {
    key: 'meta.title.services',
    section: 'Browser tab & meta',
    label: 'Tab title — services',
    default: 'Services · Taziey',
  },
  {
    key: 'meta.title.content',
    section: 'Browser tab & meta',
    label: 'Tab title — content',
    default: 'Content · Taziey',
  },
  {
    key: 'meta.title.contact',
    section: 'Browser tab & meta',
    label: 'Tab title — contact',
    default: 'Contact · Taziey',
  },
  {
    key: 'meta.title.not_found',
    section: 'Browser tab & meta',
    label: 'Tab title — 404 page',
    default: 'Not found · Taziey',
  },
  {
    key: 'meta.title.admin',
    section: 'Browser tab & meta',
    label: 'Tab title — admin',
    default: 'Admin · Taziey',
  },
  {
    key: 'meta.description',
    section: 'Browser tab & meta',
    label: 'Search / share description',
    multiline: true,
    hint: 'Shown by Google and in link previews. Around 150 characters reads best.',
    default:
      'Taziey is a small strategy crew working alongside the channels you already watch. Niche, ideas, packaging, retention — we take the boring half so you can make the video.',
  },

  /* ---- Navigation ---- */
  { key: 'brand.wordmark', section: 'Navigation', label: 'Wordmark', default: 'Taziey' },
  { key: 'nav.home', section: 'Navigation', label: 'Home link', default: 'Home' },
  { key: 'nav.content', section: 'Navigation', label: 'Content link', default: 'Content' },
  { key: 'nav.services', section: 'Navigation', label: 'Services link', default: 'Services' },
  { key: 'nav.contact', section: 'Navigation', label: 'Contact link', default: 'Contact' },
  {
    key: 'nav.theme_to_dark',
    section: 'Navigation',
    label: 'Theme toggle — to dark',
    hint: 'Tooltip and screen-reader label on the sun/moon button.',
    default: 'Switch to dark mode',
  },
  {
    key: 'nav.theme_to_light',
    section: 'Navigation',
    label: 'Theme toggle — to light',
    default: 'Switch to light mode',
  },

  /* ---- Footer ---- */
  { key: 'footer.copy', section: 'Footer', label: 'Copyright line', default: 'Taziey · ©2026' },

  /* ---- Home — hero ---- */
  {
    key: 'home.hero.title_before',
    section: 'Home — hero',
    label: 'Headline, before accent',
    default: 'Creators helping ',
  },
  {
    key: 'home.hero.title_accent',
    section: 'Home — hero',
    label: 'Headline, accent word',
    default: 'creators',
  },
  {
    key: 'home.hero.title_after',
    section: 'Home — hero',
    label: 'Headline, after accent',
    default: ' grow.',
  },
  {
    key: 'home.recent.eyebrow',
    section: 'Home — hero',
    label: 'Carousel screen-reader label',
    default: 'WHAT WE’VE BEEN UP TO',
  },
  {
    key: 'home.hero.prev_label',
    section: 'Home — hero',
    label: 'Previous arrow label',
    default: 'Previous video',
  },
  {
    key: 'home.hero.next_label',
    section: 'Home — hero',
    label: 'Next arrow label',
    default: 'Next video',
  },

  /* ---- Home — creator rail ---- */
  {
    key: 'home.creators.title',
    section: 'Home — creator rail',
    label: 'Heading',
    default: 'Friends of the channel',
  },
  {
    key: 'home.creators.sub',
    section: 'Home — creator rail',
    label: 'Subheading',
    default: 'A few you’ll probably recognise.',
  },
  {
    key: 'home.creators.subs_suffix',
    section: 'Home — creator rail',
    label: 'Subscriber-count suffix',
    hint: 'Follows the number on each card — “1.4M subs”.',
    default: 'subs',
  },
  {
    key: 'home.creators.avatar_placeholder',
    section: 'Home — creator rail',
    label: 'Avatar placeholder text',
    hint: 'Stands in for a creator photo that is missing or fails to load.',
    default: 'pfp',
  },
  {
    key: 'home.creators.page_label',
    section: 'Home — creator rail',
    label: 'Pager dot label',
    hint: tokenHint('{from} and {to}'),
    default: 'Show creators {from}–{to}',
  },

  /* ---- Home — packaging strip ---- */
  {
    key: 'home.packaging.eyebrow',
    section: 'Home — packaging strip',
    label: 'Eyebrow',
    default: 'PACKAGING, BEFORE AND AFTER',
  },
  {
    key: 'home.packaging.sub',
    section: 'Home — packaging strip',
    label: 'Subheading',
    default: 'Same video, same channel — different thumbnail.',
  },
  {
    key: 'home.packaging.label_before',
    section: 'Home — packaging strip',
    label: 'Before pill',
    default: 'BEFORE',
  },
  {
    key: 'home.packaging.label_after',
    section: 'Home — packaging strip',
    label: 'After pill',
    default: 'AFTER',
  },
  {
    key: 'home.packaging.placeholder_before',
    section: 'Home — packaging strip',
    label: 'Before image placeholder',
    default: 'before',
  },
  {
    key: 'home.packaging.placeholder_after',
    section: 'Home — packaging strip',
    label: 'After image placeholder',
    default: 'after',
  },

  /* ---- Home — contact CTA ---- */
  {
    key: 'home.cta.title',
    section: 'Home — contact CTA',
    label: 'Heading',
    default: 'Come talk shop.',
  },
  {
    key: 'home.cta.blurb',
    section: 'Home — contact CTA',
    label: 'Blurb',
    multiline: true,
    default:
      'No pitch deck, no retainer talk on day one. Just a chat about where your channel is stuck.',
  },

  /* ---- Services page ---- */
  { key: 'services.eyebrow', section: 'Services page', label: 'Eyebrow', default: 'SERVICES' },
  {
    key: 'services.title',
    section: 'Services page',
    label: 'Heading',
    default: 'Pick what you need. Leave the rest.',
  },
  {
    key: 'services.lede',
    section: 'Services page',
    label: 'Lede',
    multiline: true,
    default:
      'Every channel is stuck somewhere different, so nothing here is a bundle. Everything we do, grouped by the problem it solves — jump to the part that sounds like your week.',
  },

  /* ---- Services — consultation panel ---- */
  {
    key: 'services.consult.eyebrow',
    section: 'Services — consultation panel',
    label: 'Eyebrow',
    default: 'ONE-OFF',
  },
  {
    key: 'services.consult.title',
    section: 'Services — consultation panel',
    label: 'Heading',
    default: 'Consultation calls',
  },
  {
    key: 'services.consult.text',
    section: 'Services — consultation panel',
    label: 'Body copy',
    multiline: true,
    default:
      'Not ready for an ongoing thing? Book an hour. Bring your analytics, your last five videos, or a half-formed idea — we’ll pull it apart and leave you with a plan you can action that week.',
  },
  {
    key: 'services.consult.bullets',
    section: 'Services — consultation panel',
    label: 'Bullets',
    multiline: true,
    hint: 'One bullet per line.',
    default:
      'Channel audit & where the growth actually is\nPackaging teardown on your recent uploads\nWritten recap sent over after the call',
  },
  {
    key: 'services.consult.price',
    section: 'Services — consultation panel',
    label: 'Price',
    default: '$200',
  },
  {
    key: 'services.consult.per',
    section: 'Services — consultation panel',
    label: 'Price unit',
    default: '/hr',
  },
  {
    key: 'services.consult.price_note',
    section: 'Services — consultation panel',
    label: 'Price note',
    multiline: true,
    default: 'Billed per hour, no minimum. Blocks of 4+ hours are discounted — ask.',
  },
  {
    key: 'services.consult.book_label',
    section: 'Services — consultation panel',
    label: 'Button label',
    default: 'Book a call',
  },
  {
    key: 'services.consult.book_href',
    section: 'Services — consultation panel',
    label: 'Button link',
    hint: 'A site path like /contact, or a full https:// URL, which opens in a new tab.',
    default: '/contact',
  },

  /* ---- Content page ---- */
  { key: 'content.eyebrow', section: 'Content page', label: 'Eyebrow', default: 'CONTENT' },
  {
    key: 'content.title',
    section: 'Content page',
    label: 'Heading',
    default: 'Stuff we’ve had a hand in.',
  },
  {
    key: 'content.lede',
    section: 'Content page',
    label: 'Lede',
    multiline: true,
    default:
      'Ideas, titles, thumbnails, retention passes — somewhere in each of these are our fingerprints. Filter by niche and have a scroll.',
  },
  {
    key: 'content.filter_all_label',
    section: 'Content page',
    label: '“All” filter chip',
    default: 'All',
  },
  {
    key: 'content.filter_label',
    section: 'Content page',
    label: 'Filter row screen-reader label',
    default: 'Filter portfolio by niche',
  },
  {
    key: 'content.empty',
    section: 'Content page',
    label: 'Empty-state message',
    default: 'Nothing published in this niche yet.',
  },

  /* ---- Contact page ---- */
  { key: 'contact.title', section: 'Contact page', label: 'Heading', default: 'Say hey.' },
  {
    key: 'contact.lede',
    section: 'Contact page',
    label: 'Lede',
    multiline: true,
    default: 'Tell us the channel, the niche, and what’s frustrating you right now.',
  },
  {
    key: 'contact.aside.eyebrow',
    section: 'Contact page',
    label: 'Aside eyebrow',
    default: 'OR GO DIRECT',
  },
  {
    key: 'contact.aside.note',
    section: 'Contact page',
    label: 'Aside note',
    multiline: true,
    default: 'Forms are fine, but we live in the inbox and the DMs just as much.',
  },
  {
    key: 'contact.aside.footnote',
    section: 'Contact page',
    label: 'Aside footnote',
    multiline: true,
    default:
      'Working with a manager or editor already? Loop them in on the first message — we’d rather build around your existing team than replace it.',
  },

  /* ---- Contact form ---- */
  {
    key: 'contact.form.title',
    section: 'Contact form',
    label: 'Heading',
    default: 'Tell us about your channel',
  },
  {
    key: 'contact.form.blurb',
    section: 'Contact form',
    label: 'Blurb',
    multiline: true,
    default: 'The more you give us up front, the more useful our first reply will be.',
  },
  {
    key: 'contact.form.name_label',
    section: 'Contact form',
    label: 'Name — label',
    default: 'Name',
  },
  {
    key: 'contact.form.name_placeholder',
    section: 'Contact form',
    label: 'Name — placeholder',
    default: 'Ryley',
  },
  {
    key: 'contact.form.email_label',
    section: 'Contact form',
    label: 'Email — label',
    default: 'Email',
  },
  {
    key: 'contact.form.email_placeholder',
    section: 'Contact form',
    label: 'Email — placeholder',
    default: 'you@channel.com',
  },
  {
    key: 'contact.form.channel_label',
    section: 'Contact form',
    label: 'Channel link — label',
    default: 'Channel link',
  },
  {
    key: 'contact.form.channel_placeholder',
    section: 'Contact form',
    label: 'Channel link — placeholder',
    default: 'youtube.com/@yourchannel',
  },
  {
    key: 'contact.form.niche_label',
    section: 'Contact form',
    label: 'Niche — label',
    default: 'Niche',
  },
  {
    key: 'contact.form.niche_optional',
    section: 'Contact form',
    label: 'Niche — optional tag',
    default: '(optional)',
  },
  {
    key: 'contact.form.niche_placeholder',
    section: 'Contact form',
    label: 'Niche — empty option',
    default: 'Pick the closest one',
  },
  {
    key: 'contact.form.niche_other',
    section: 'Contact form',
    label: 'Niche — “other” option',
    default: 'Something else',
  },
  {
    key: 'contact.form.message_label',
    section: 'Contact form',
    label: 'Message — label',
    default: 'What’s frustrating you right now?',
  },
  {
    key: 'contact.form.message_placeholder',
    section: 'Contact form',
    label: 'Message — placeholder',
    multiline: true,
    default: 'Views are flat, the last four thumbnails flopped, no idea what to make next…',
  },
  {
    key: 'contact.form.submit_label',
    section: 'Contact form',
    label: 'Submit button',
    default: 'Send it over',
  },
  {
    key: 'contact.form.reply_note',
    section: 'Contact form',
    label: 'Note beside the button',
    default: 'We reply to everything, usually same day.',
  },

  /* ---- Video popup ---- */
  {
    key: 'video.details_label',
    section: 'Video popup',
    label: 'Thumbnail screen-reader label',
    hint: tokenHint('{title}'),
    default: '{title} — view details',
  },
  { key: 'video.views_label', section: 'Video popup', label: 'Views stat label', default: 'Views' },
  { key: 'video.likes_label', section: 'Video popup', label: 'Likes stat label', default: 'Likes' },
  {
    key: 'video.watch_label',
    section: 'Video popup',
    label: 'Watch button',
    default: 'Watch the video',
  },
  { key: 'video.close_label', section: 'Video popup', label: 'Close button', default: 'Close' },
  {
    key: 'video.thumbnail_placeholder',
    section: 'Video popup',
    label: 'Thumbnail placeholder text',
    hint: 'Stands in wherever a video has no thumbnail, or its thumbnail fails to load.',
    default: 'thumbnail',
  },
  {
    key: 'video.views_suffix',
    section: 'Video popup',
    label: 'View-count suffix',
    hint: 'Follows the number on cards and in the hero — “41M views”.',
    default: 'views',
  },

  /* ---- 404 page ---- */
  { key: 'not_found.eyebrow', section: '404 page', label: 'Eyebrow', default: '404' },
  { key: 'not_found.title', section: '404 page', label: 'Heading', default: 'Nothing here.' },
  {
    key: 'not_found.text',
    section: '404 page',
    label: 'Body copy',
    multiline: true,
    default: 'That page doesn’t exist — or it hasn’t been built yet.',
  },
  { key: 'not_found.link_label', section: '404 page', label: 'Button label', default: 'Back home' },

  /* ---- Loading & error states ---- */
  {
    key: 'loading.label',
    section: 'Loading & error states',
    label: 'Skeleton screen-reader label',
    hint: 'Announced once while a page is still loading its placeholder blocks.',
    default: 'Loading',
  },
  {
    key: 'home.error',
    section: 'Loading & error states',
    label: 'Home page failed to load',
    default: 'Couldn’t load the page content.',
  },
  {
    key: 'services.error',
    section: 'Loading & error states',
    label: 'Services page failed to load',
    default: 'Couldn’t load the services list.',
  },
  {
    key: 'content.error',
    section: 'Loading & error states',
    label: 'Content page failed to load',
    default: 'Couldn’t load the portfolio.',
  },
]

export const COPY_KEYS: readonly CopyKeyDef[] = KEYS

/** `key → default`, for the reader in `useCopy`. */
export const COPY_DEFAULTS: Readonly<Record<string, string>> = Object.fromEntries(
  KEYS.map((def) => [def.key, def.default]),
)

/** The sections in the order the admin editor lists them, each with its keys. */
export const COPY_SECTIONS: ReadonlyArray<{ name: string; keys: CopyKeyDef[] }> = KEYS.reduce(
  (sections: Array<{ name: string; keys: CopyKeyDef[] }>, def) => {
    const last = sections[sections.length - 1]
    if (last && last.name === def.section) last.keys.push(def)
    else sections.push({ name: def.section, keys: [def] })
    return sections
  },
  [],
)

/** Position within its section, 1-based — what a saved row gets as `sort_order`. */
export const COPY_ORDER: Readonly<Record<string, number>> = Object.fromEntries(
  COPY_SECTIONS.flatMap((section) => section.keys.map((def, i) => [def.key, i + 1])),
)

/**
 * Substitutes `{token}` placeholders in an editable string. Used for the few
 * strings that wrap a value — a video title, a page range — so the wording
 * around the value stays editable rather than being split across keys.
 */
export function fillCopy(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in values ? String(values[token]) : match,
  )
}
