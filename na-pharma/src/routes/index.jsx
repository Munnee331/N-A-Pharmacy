import { Routes, Route } from 'react-router-dom'
import Layout from '../layouts/Layout'

// Page components
import HomePage       from '../pages/HomePage'
import ShopPage       from '../pages/ShopPage'
import AboutPage      from '../pages/AboutPage'
import ContactPage    from '../pages/ContactPage'
import LoginPage      from '../pages/LoginPage'
import RegisterPage   from '../pages/RegisterPage'
import DashboardPage  from '../pages/DashboardPage'
import AdminPage      from '../pages/AdminPage'
import NotFoundPage   from '../pages/NotFoundPage'

/**
 * Navigation links used in Navbar and MobileDrawer.
 * Exported so components can import from a single source of truth.
 */
export const NAV_LINKS = [
  { label: 'Home',    to: '/' },
  { label: 'Shop',    to: '/shop' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
]

/**
 * Centralized application router.
 * All routes are nested under Layout so Navbar + Footer wrap every page.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index                element={<HomePage />} />
        <Route path="shop"          element={<ShopPage />} />
        <Route path="about"         element={<AboutPage />} />
        <Route path="contact"       element={<ContactPage />} />
        <Route path="login"         element={<LoginPage />} />
        <Route path="register"      element={<RegisterPage />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="admin"         element={<AdminPage />} />
        {/* 404 catch-all */}
        <Route path="*"             element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
