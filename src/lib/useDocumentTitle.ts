import { useEffect } from 'react'
import { useCopy } from './useSiteContent'

/**
 * Sets the browser tab title from an editable copy key.
 *
 * Called at the top of each page component, before any loading or error return,
 * so the tab is right even while the page is still a skeleton. The title starts
 * at the key's default and re-runs once `site_copy` lands, which is what picks
 * up an admin's edit.
 */
export function useDocumentTitle(key: string): void {
  const copy = useCopy()
  const title = copy(key)

  useEffect(() => {
    if (title) document.title = title
  }, [title])
}

/**
 * Keeps the `<meta name="description">` in `index.html` in step with the
 * editable value. Lives in the layout rather than per page — the site has one
 * description, and crawlers read the served HTML anyway; this only matters for
 * anything reading the live DOM.
 */
export function useMetaDescription(key = 'meta.description'): void {
  const copy = useCopy()
  const description = copy(key)

  useEffect(() => {
    if (!description) return
    const tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (tag) tag.content = description
  }, [description])
}
