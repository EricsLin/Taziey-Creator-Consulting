import { useMemo } from 'react'
import { PageState } from '@/components/PageState'
import { ContactCta } from '@/components/home/ContactCta'
import { CreatorRail } from '@/components/home/CreatorRail'
import { Hero } from '@/components/home/Hero'
import { HomeSkeleton } from '@/components/home/HomeSkeleton'
import { PackagingStrip } from '@/components/home/PackagingStrip'
import { StatsRow } from '@/components/home/StatsRow'
import { heroSlides } from '@/lib/content'
import { useSiteContent } from '@/lib/useSiteContent'

export function Home() {
  const { content, loading, error } = useSiteContent()

  const slides = useMemo(() => (content ? heroSlides(content.videos) : []), [content])

  if (loading) return <HomeSkeleton />
  if (error || !content) return <PageState>Couldn&rsquo;t load the page content.</PageState>

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
