# Taziey — site

React + TypeScript + Vite front end for the Taziey portfolio site
edited at `/admin` — there is no hardcoded copy left in the components.

## Run it

```bash
npm install
cp .env.example .env   # fill in the two Supabase values
npm run dev            # http://localhost:5173
npm run build          # typecheck + production bundle into dist/
npm run preview        # serve the built bundle
npm run typecheck
```

## Layout

```
src/
  App.tsx                 routes — public site under Layout, admin under AdminLayout
  components/
    Layout.tsx            sticky nav + footer + per-route scroll reset
    Nav.tsx  Footer.tsx
    SmartLink.tsx         router Link for a site path, anchor for a URL
    ImageSlot.tsx         image with labelled placeholder for empty CMS rows
    ContactForm.tsx       enquiry form (fields + submit, not yet wired up)
    PageState.tsx         loading / error shell
    home/                 Hero, PackagingStrip, RecentWork, CreatorRail, StatsRow, ContactCta
  pages/                  Home, Services, Content, Contact, NotFound
  admin/
    AdminLayout.tsx       sidebar shell + the auth/allowlist gate
    Login.tsx             email + password sign-in
    CollectionEditor.tsx  generic list editor every content table reuses
    collections.tsx       per-table configuration of that editor + dashboard
    CopyEditor.tsx        every headline / lede / label, grouped by section
    VideoImportBar.tsx    add a video by pasting its YouTube URL
    MediaLibrary.tsx      ImageField, the upload / choose picker, dropzone, asset grid
    AssetsPage.tsx        /admin/assets — the full media library
    media.ts              Storage helpers: validate, upload with progress, list, delete, usage
    api.ts                CRUD helpers + the video-meta edge function call
  lib/
    supabase.ts           the publishable-key client
    content.ts            single read seam — one parallel fetch of every table
    useSiteContent.tsx    provider + useCopy(), loaded once above the router
    auth.tsx              session + admin-allowlist state
    useInterval.ts        reduced-motion-aware interval for the carousels
  styles/
    tokens.css            colours, type, spacing, radii, easing from the spec
    global.css            reset + shared .shell / .btn / .eyebrow helpers
  types.ts                content shapes (one interface per table)
```

Styling is CSS Modules per component plus the token layer — no CSS framework.
Dynamic values that animate (transition delays, clip paths, transforms) stay as
inline styles; everything static lives in the module.

## Backend

Project ref `lmrtgteqcqwmlcnhrytd`.

| Table                | Drives                                                            |
| -------------------- | ----------------------------------------------------------------- |
| `service_categories` | group headings, blurbs and filter-chip order on /services          |
| `services`           | the numbered cards; `sort_order` is the number shown               |
| `creators`           | the "You may know…" rail (six per page)                            |
| `stats`              | the three home-page metric cards                                   |
| `niches`             | /content filter chips (with optional `icon_url`) and the contact form dropdown |
| `videos`             | the portfolio; `rotator_column` / `rotator_position` also place a video in the home rotator |
| `packaging_flips`    | before/after pairs for the home strip                              |
| `contact_channels`   | email / discord / twitter, in the footer, home CTA and /contact    |
| `site_copy`          | every other string on the site, keyed by slug                      |
| `admins`             | who may write — checked by every RLS policy                        |
| `admin_invites`      | emails that become admins as soon as their auth user exists        |

Every content table is world-readable and writable only by a row in `admins`.
The check lives in `private.is_admin()` — a `SECURITY DEFINER` function in a
schema PostgREST doesn't expose, so it can't be called as an RPC.

`homeRotator` used to be a hardcoded list of ids; it is now derived from each
video's `rotator_column` (1–3) and `rotator_position`, both editable in /admin.

### Storage: `media` bucket

Every image field in /admin (thumbnails, avatars, niche icons, packaging
flips) takes a URL three ways: paste one, upload from the computer, or pick an
existing asset. Uploads go to a public `media` bucket and the field stores the
file's public URL — the tables still only ever hold a URL.

- Images only (PNG, JPEG, WebP, GIF, AVIF), 50 MB each — enforced by the bucket,
  mirrored in `src/admin/media.ts`. SVG is excluded because it can carry script.
- Anyone can load a file by its URL; listing, uploading and deleting are gated
  by `private.is_admin()`, like the tables.
- Files are named `<stamp>-<original-name>.<ext>` and never overwritten.

Created by `supabase/media-bucket.sql` — run it once in the SQL editor. The
project-wide upload cap (Storage → Settings) must be at least 50 MB.

### Edge function: `video-meta`

`POST { url }` with an admin's JWT. Resolves a YouTube URL (watch, `youtu.be`,
`/shorts`, `/embed`, or a bare id) to title, channel, thumbnail and views.

- With a `YOUTUBE_API_KEY` secret set it uses the YouTube Data API, which is the
  only source that returns a real view count.
- Without one it falls back to the keyless oEmbed endpoint: title, channel and
  thumbnail come through, views are left blank to type in by hand.

To enable view counts, add the secret in the dashboard (Edge Functions →
Secrets) or `supabase secrets set YOUTUBE_API_KEY=…`. No redeploy needed.

## Admin access

`/admin` is gated twice: you must be signed in, and your user must have a row in
`admins`. There is no sign-up form — being signed in is not enough, and RLS
would reject the writes anyway.

To grant access:

1. `insert into public.admin_invites (email) values ('someone@example.com');`
2. Create that user in the dashboard (Authentication → Users → Add user), or
   have them sign up. A trigger on `auth.users` promotes them on creation.
3. For an account that already exists, run `select private.sync_admin_invites();`

`admin_invites` is empty, so nobody can sign in yet — step 1 above is what's
left before the admin is usable.

## Placeholder imagery

Every thumbnail and avatar is still hotlinked from YouTube's CDN, now as seeded
`thumbnail_url` / `avatar_url` values rather than hardcoded strings:

- **Thumbnails** — MrBeast videos on `i.ytimg.com`. `vid-9`'s row uses the
  `maxres2` variant because that video has no `maxresdefault`.
- **Avatars** — game-channel logos on `yt3.googleusercontent.com` (logos rather
  than people, since the creator names are invented).

Two things to know before this goes anywhere public: the site presents these as
Taziey's own work, and the URLs are third-party — they can change or start
refusing hotlinks at any time. `ImageSlot` degrades to its labelled placeholder
on load failure, so nothing breaks visually, but these should be replaced with
real client assets before launch — upload them through any image field's
Upload / choose button, or in bulk at /admin/assets.

## Not built yet

- Contact form submission — `src/components/ContactForm.tsx` renders and holds
  its values, but `handleSubmit` is a no-op pending an edge function to POST to
  (plus success/error states and spam protection)
- Real client imagery (see above)
