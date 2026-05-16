import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../layouts/Layout'
import AdminLayout from '../layouts/AdminLayout'
import PageLoader from '../components/ui/PageLoader'
import { ProtectedRoute, AdminRoute, PharmacistRoute } from '../components/routing/ProtectedRoute'

// ── Lazy-loaded page components ───────────────────────────────────────────
const HomePage               = lazy(() => import('../pages/HomePage'))
const ShopPage               = lazy(() => import('../pages/ShopPage'))
const AboutPage              = lazy(() => import('../pages/AboutPage'))
const ContactPage            = lazy(() => import('../pages/ContactPage'))
const LoginPage              = lazy(() => import('../pages/LoginPage'))
const RegisterPage           = lazy(() => import('../pages/RegisterPage'))
const DashboardPage          = lazy(() => import('../pages/DashboardPage'))
const AdminPage              = lazy(() => import('../pages/AdminPage'))
const AdminMedicinesPage     = lazy(() => import('../pages/AdminMedicinesPage'))
const PharmacistPage         = lazy(() => import('../pages/PharmacistPage'))
const CartPage               = lazy(() => import('../pages/CartPage'))
const CheckoutPage           = lazy(() => import('../pages/CheckoutPage'))
const PrescriptionUploadPage   = lazy(() => import('../pages/PrescriptionUploadPage'))
const PrescriptionHistoryPage  = lazy(() => import('../pages/PrescriptionHistoryPage'))
const PaymentSuccessPage       = lazy(() => import('../pages/PaymentSuccessPage'))
const PaymentFailPage          = lazy(() => import('../pages/PaymentFailPage'))
const PaymentCancelPage        = lazy(() => import('../pages/PaymentCancelPage'))
const NotFoundPage             = lazy(() => import('../pages/NotFoundPage'))

/**
 * Navigation links used in Navbar and MobileDrawer.
 */
export const NAV_LINKS = [
  { label: 'Home',    to: '/' },
  { label: 'Shop',    to: '/shop' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Admin routes — use AdminLayout (sidebar + header, no public navbar/footer) ── */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="admin"            element={<AdminPage />} />
          <Route path="admin/medicines"  element={<AdminMedicinesPage />} />
          {/* Future admin sub-routes:
              <Route path="admin/orders"        element={<AdminOrdersPage />} />
              <Route path="admin/customers"     element={<AdminCustomersPage />} />
          */}
        </Route>

        {/* ── Pharmacist routes — use public Layout (navbar + footer) ── */}
        <Route element={<Layout />}>
          <Route path="pharmacist" element={
            <PharmacistRoute><PharmacistPage /></PharmacistRoute>
          } />
        </Route>

        {/* ── Public + user routes — use public Layout (navbar + footer) ── */}
        <Route element={<Layout />}>
          <Route index                      element={<HomePage />} />
          <Route path="shop"                element={<ShopPage />} />
          <Route path="about"               element={<AboutPage />} />
          <Route path="contact"             element={<ContactPage />} />
          <Route path="login"               element={<LoginPage />} />
          <Route path="register"            element={<RegisterPage />} />
          <Route path="cart"                element={<CartPage />} />

          <Route path="checkout"            element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="upload-prescription" element={
            <ProtectedRoute><PrescriptionUploadPage /></ProtectedRoute>
          } />
          <Route path="prescriptions" element={
            <ProtectedRoute><PrescriptionHistoryPage /></ProtectedRoute>
          } />
          <Route path="dashboard"           element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />

          {/* Payment result pages — no auth required (SSLCommerz redirects here) */}
          <Route path="payment/success" element={<PaymentSuccessPage />} />
          <Route path="payment/fail"    element={<PaymentFailPage />} />
          <Route path="payment/cancel"  element={<PaymentCancelPage />} />

          <Route path="*"                   element={<NotFoundPage />} />
        </Route>

      </Routes>
    </Suspense>
  )
}
