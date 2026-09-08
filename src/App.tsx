import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/useTheme'
import { SiteContentProvider } from '@/lib/useSiteContent'
import { Home } from '@/pages/Home'
import { Services } from '@/pages/Services'
import { Content } from '@/pages/Content'
import { Contact } from '@/pages/Contact'
import { NotFound } from '@/pages/NotFound'
import { AdminLayout } from '@/admin/AdminLayout'
import {
  CategoriesEditor,
  ContactEditor,
  CreatorsEditor,
  Dashboard,
  PackagingEditor,
  ServicesEditor,
  StatsEditor,
  VideosEditor,
} from '@/admin/collections'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SiteContentProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="content" element={<Content />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Its own shell — the admin doesn't wear the site nav or footer. */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="videos" element={<VideosEditor />} />
                <Route path="packaging" element={<PackagingEditor />} />
                <Route path="creators" element={<CreatorsEditor />} />
                <Route path="services" element={<ServicesEditor />} />
                <Route path="categories" element={<CategoriesEditor />} />
                <Route path="stats" element={<StatsEditor />} />
                <Route path="contact" element={<ContactEditor />} />
              </Route>
            </Routes>
          </SiteContentProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
