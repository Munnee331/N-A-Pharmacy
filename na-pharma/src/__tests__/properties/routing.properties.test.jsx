/**
 * Property-Based Tests: Routing
 * Feature: na-pharma-project-setup
 *
 * Uses fast-check to verify universal routing properties hold across all inputs.
 * Validates: Requirements 4.9, 4.10, 5.1, 5.2, 6.4, 6.6, 7.4
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Suspense } from 'react'
import fc from 'fast-check'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        const Tag = typeof tag === 'string' ? tag : 'div'
        return ({ children, ...props }) => {
          // Strip framer-motion-specific props
          const {
            initial, animate, exit, variants, whileHover, whileInView,
            viewport, transition, layoutId, whileTap, drag, dragConstraints,
            ...rest
          } = props
          return <Tag {...rest}>{children}</Tag>
        }
      },
    }
  ),
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
  useInView: () => true,
}))

// Mock AuthContext so ProtectedRoute / AdminRoute don't redirect
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: true,
    isLoading: false,
    user: { name: 'Test User', role: 'admin' },
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}))

// Mock all lazy-loaded page components to avoid dynamic import issues in tests
vi.mock('../../pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home</div>,
}))
vi.mock('../../pages/ShopPage', () => ({
  default: () => <div data-testid="shop-page">Shop</div>,
}))
vi.mock('../../pages/AboutPage', () => ({
  default: () => <div data-testid="about-page">About</div>,
}))
vi.mock('../../pages/ContactPage', () => ({
  default: () => <div data-testid="contact-page">Contact</div>,
}))
vi.mock('../../pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}))
vi.mock('../../pages/RegisterPage', () => ({
  default: () => <div data-testid="register-page">Register</div>,
}))
vi.mock('../../pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}))
vi.mock('../../pages/AdminPage', () => ({
  default: () => <div data-testid="admin-page">Admin</div>,
}))
vi.mock('../../pages/AdminMedicinesPage', () => ({
  default: () => <div data-testid="admin-medicines-page">Admin Medicines</div>,
}))
vi.mock('../../pages/CartPage', () => ({
  default: () => <div data-testid="cart-page">Cart</div>,
}))
vi.mock('../../pages/CheckoutPage', () => ({
  default: () => <div data-testid="checkout-page">Checkout</div>,
}))
vi.mock('../../pages/PrescriptionUploadPage', () => ({
  default: () => <div data-testid="prescription-upload-page">Prescription Upload</div>,
}))
vi.mock('../../pages/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}))

// Mock PageLoader used in Suspense fallback
vi.mock('../../components/ui/PageLoader', () => ({
  default: () => <div data-testid="page-loader">Loading...</div>,
}))

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import AppRouter from '../../routes/index'
import Navbar from '../../components/navbar/Navbar'
import Footer from '../../components/footer/Footer'
import useMobileMenu from '../../hooks/useMobileMenu'
import { CartProvider } from '../../context/CartContext'

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * All paths that are defined in the application router and wrapped by Layout.
 * Admin paths are excluded because they use AdminLayout (no public navbar/footer).
 */
const DEFINED_PATHS = ['/', '/shop', '/about', '/contact', '/login', '/register', '/dashboard', '/cart']

/**
 * Paths that appear in the Navbar navigation links.
 */
const NAV_LINK_PATHS = ['/', '/shop', '/about', '/contact']

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Renders AppRouter inside a MemoryRouter at the given initial path,
 * wrapped in Suspense to handle lazy-loaded components.
 * Uses act() to flush all pending state updates and lazy imports.
 */
async function renderAtPath(path) {
  let result
  await act(async () => {
    result = render(
      <CartProvider>
        <MemoryRouter initialEntries={[path]}>
          <Suspense fallback={<div data-testid="page-loader">Loading...</div>}>
            <AppRouter />
          </Suspense>
        </MemoryRouter>
      </CartProvider>
    )
  })
  return result
}

// ── Property Tests ────────────────────────────────────────────────────────────

describe('Property-Based Tests: Routing', () => {

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  /**
   * Property 1: Layout wraps every defined route
   * Feature: na-pharma-project-setup, Property 1: Layout wraps every defined route
   * Validates: Requirements 4.10, 5.1, 5.2
   */
  it('Property 1: Layout wraps every defined route — navbar and footer are always present', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...DEFINED_PATHS),
        async (path) => {
          const { getByTestId, unmount } = await renderAtPath(path)

          expect(getByTestId('navbar')).toBeInTheDocument()
          expect(getByTestId('footer')).toBeInTheDocument()

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)

  /**
   * Property 2: Unknown paths always render the 404 page
   * Feature: na-pharma-project-setup, Property 2: Unknown paths always render the 404 page
   * Validates: Requirements 4.9
   */
  it('Property 2: Unknown paths always render the 404 page', async () => {    // Use alphanumeric + safe characters only to avoid malformed URL issues
    // (%, ?, #, spaces, etc. cause React Router to throw URI errors)
    const safeSegmentArb = fc
      .stringMatching(/^[a-zA-Z0-9_-]+$/, { minLength: 1, maxLength: 30 })
      .filter(
        (s) =>
          !DEFINED_PATHS.includes('/' + s) &&
          !s.startsWith('admin')
      )

    await fc.assert(
      fc.asyncProperty(
        safeSegmentArb,
        async (randomSegment) => {
          const { getByTestId, unmount } = await renderAtPath('/' + randomSegment)

          expect(getByTestId('not-found-page')).toBeInTheDocument()

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)

  /**
   * Property 3: Active navigation link reflects current route
   * Feature: na-pharma-project-setup, Property 3: Active navigation link reflects current route
   * Validates: Requirements 6.4
   */
  it('Property 3: Active navigation link reflects current route', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NAV_LINK_PATHS),
        (activePath) => {
          const { container, unmount } = render(
            <CartProvider>
              <MemoryRouter initialEntries={[activePath]}>
                <Navbar />
              </MemoryRouter>
            </CartProvider>
          )

          // Find all links with the active CSS class applied by NavLinks
          const activeLinks = Array.from(container.querySelectorAll('a.nav-link-active'))

          // Exactly one link should be active
          expect(activeLinks).toHaveLength(1)

          // The active link's href should match the current path
          expect(activeLinks[0]).toHaveAttribute('href', activePath)

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: Mobile menu toggle is a round-trip
   * Feature: na-pharma-project-setup, Property 4: Mobile menu toggle is a round-trip
   * Validates: Requirements 6.6
   */
  it('Property 4: Mobile menu toggle is a round-trip', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (initiallyOpen) => {
          const { result, unmount } = renderHook(() => useMobileMenu(initiallyOpen))

          const originalState = result.current.isOpen

          act(() => {
            result.current.toggle()
          })
          act(() => {
            result.current.toggle()
          })

          expect(result.current.isOpen).toBe(originalState)

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Footer copyright year is always current
   * Feature: na-pharma-project-setup, Property 5: Footer copyright year is always current
   * Validates: Requirements 7.4
   */
  it('Property 5: Footer copyright year is always current', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2100 }),
        (year) => {
          // Use vi.setSystemTime to mock the current date
          vi.useFakeTimers()
          vi.setSystemTime(new Date(year, 0, 1))

          const { getByTestId, unmount } = render(
            <MemoryRouter>
              <Footer />
            </MemoryRouter>
          )

          const copyrightEl = getByTestId('footer-copyright')
          expect(copyrightEl.textContent).toContain(String(year))

          unmount()
          vi.useRealTimers()
        }
      ),
      { numRuns: 100 }
    )
  })
})
