import { useMemo } from 'react'
import { PageState } from '@/components/PageState'
import { ContactCta } from '@/components/home/ContactCta'
import { CreatorRail } from '@/components/home/CreatorRail'
import { Hero } from '@/components/home/Hero'
import { HomeSkeleton } from '@/components/home/HomeSkeleton'
import { PackagingStrip } from '@/components/home/PackagingStrip'
import { StatsRow } from '@/components/home/StatsRow'
import { heroSlides } from '@/lib/content'
import { useCopy, useSiteContent } from '@/lib/useSiteContent'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function Home() {
  const { content, loading, error } = useSiteContent()
  const copy = useCopy()
  useDocumentTitle('meta.title.home')

  const slides = useMemo(() => (content ? heroSlides(content.videos) : []), [content])

  if (loading) return <HomeSkeleton />
  if (error || !content) return <PageState>{copy('home.error')}</PageState>

  return (
    <>
      <Hero videos={slides} />
      <CreatorRail creators={content.creators} />
      <StatsRow stats={content.stats} />
      <PackagingStrip flips={content.flips} videos={content.videos} />
      <ContactCta />
    </>
  )
}
