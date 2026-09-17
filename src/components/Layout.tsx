import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { useMetaDescription } from '@/lib/useDocumentTitle'

export function Layout() {
  const { pathname } = useLocation()
  useMetaDescription()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Nav />
      <main key={pathname} className="rise">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
