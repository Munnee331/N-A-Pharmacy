/**
 * Unit tests for all placeholder page components.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ── Mock framer-motion to avoid animation issues in tests ─────────────────
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) =>
        ({ children, ...props }) => {
          // Strip framer-motion-specific props before passing to DOM element
          const {
            initial, animate, exit, variants, transition, whileHover,
            whileInView, viewport, whileTap, layout, layoutId,
            ...rest
          } = props
          const Tag = typeof tag === 'string' ? tag : 'div'
          return <Tag {...rest}>{children}</Tag>
        },
    }
  ),
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
  useInView: () => true,
}))

// ── Mock recharts (used by SalesOverview inside AdminPage) ────────────────
vi.mock('recharts', () => ({
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}))

// ── Mock API calls ────────────────────────────────────────────────────────
vi.mock('../../api/medicineApi.js', () => ({
  getMedicines: vi.fn(() => Promise.resolve({ medicines: [], pagination: { total: 0 } })),
}))

vi.mock('../../api/authApi.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getProfile: vi.fn(() => Promise.reject(new Error('no token'))),
}))

// ── Mock react-hot-toast ──────────────────────────────────────────────────
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
}))

// ── Mock AuthContext so pages that call useAuth() don't throw ─────────────
vi.mock('../../context/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

// ── Mock heavy home section components ───────────────────────────────────
vi.mock('../../components/home/HeroSection.jsx', () => ({
  default: () => <section data-testid="hero-section">Hero</section>,
}))
vi.mock('../../components/home/FeaturedMedicinesSection.jsx', () => ({
  default: () => <section data-testid="featured-section">Featured</section>,
}))
vi.mock('../../components/home/CategoriesSection.jsx', () => ({
  default: () => <section data-testid="categories-section">Categories</section>,
}))
vi.mock('../../components/home/WhyChooseUsSection.jsx', () => ({
  default: () => <section data-testid="why-section">Why Us</section>,
}))
vi.mock('../../components/home/PrescriptionUploadSection.jsx', () => ({
  default: () => <section data-testid="prescription-section">Prescription</section>,
}))
vi.mock('../../components/home/TestimonialsSection.jsx', () => ({
  default: () => <section data-testid="testimonials-section">Testimonials</section>,
}))
vi.mock('../../components/home/NewsletterSection.jsx', () => ({
  default: () => <section data-testid="newsletter-section">Newsletter</section>,
}))

// ── Mock shop sub-components ──────────────────────────────────────────────
vi.mock('../../components/shop/ShopHero.jsx', () => ({
  default: ({ totalResults }) => (
    <div data-testid="shop-hero">Shop ({totalResults} results)</div>
  ),
}))
vi.mock('../../components/shop/ShopFilters.jsx', () => ({
  default: () => <div data-testid="shop-filters">Filters</div>,
}))
vi.mock('../../components/shop/MedicineCard.jsx', () => ({
  default: ({ name }) => <div data-testid="medicine-card">{name}</div>,
}))
vi.mock('../../components/shop/ShopPagination.jsx', () => ({
  default: () => <div data-testid="shop-pagination">Pagination</div>,
}))

// Mock CartContext for ShopPage (which now calls useCart)
vi.mock('../../context/CartContext.jsx', () => ({
  CartProvider: ({ children }) => <>{children}</>,
  useCart: () => ({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    addItem: vi.fn(),
    addItems: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  }),
}))

// ── Mock admin sub-components ─────────────────────────────────────────────
vi.mock('../../components/admin/AdminStatsGrid.jsx', () => ({
  default: () => <div data-testid="admin-stats-grid">Stats</div>,
}))
vi.mock('../../components/admin/SalesOverview.jsx', () => ({
  default: () => <div data-testid="sales-overview">Sales</div>,
}))
vi.mock('../../components/admin/RecentOrdersTable.jsx', () => ({
  default: () => <div data-testid="recent-orders">Orders</div>,
}))
vi.mock('../../components/admin/LowStockAlert.jsx', () => ({
  default: () => <div data-testid="low-stock">Low Stock</div>,
}))
vi.mock('../../components/admin/RecentPrescriptions.jsx', () => ({
  default: () => <div data-testid="recent-prescriptions">Prescriptions</div>,
}))
vi.mock('../../components/admin/TopSellingMedicines.jsx', () => ({
  default: () => <div data-testid="top-selling">Top Selling</div>,
}))
vi.mock('../../components/admin/QuickActions.jsx', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}))

// ── Import pages after mocks are set up ──────────────────────────────────
import HomePage      from '../../pages/HomePage'
import ShopPage      from '../../pages/ShopPage'
import AboutPage     from '../../pages/AboutPage'
import ContactPage   from '../../pages/ContactPage'
import LoginPage     from '../../pages/LoginPage'
import RegisterPage  from '../../pages/RegisterPage'
import DashboardPage from '../../pages/DashboardPage'
import AdminPage     from '../../pages/AdminPage'
import NotFoundPage  from '../../pages/NotFoundPage'

// ── Helper ────────────────────────────────────────────────────────────────
function renderInRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// HomePage
// ─────────────────────────────────────────────────────────────────────────
describe('HomePage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<HomePage />)).not.toThrow()
  })

  it('has data-testid="home-page"', () => {
    renderInRouter(<HomePage />)
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// ShopPage
// ─────────────────────────────────────────────────────────────────────────
describe('ShopPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<ShopPage />, { initialEntries: ['/shop'] })).not.toThrow()
  })

  it('has data-testid="shop-page"', () => {
    renderInRouter(<ShopPage />, { initialEntries: ['/shop'] })
    expect(screen.getByTestId('shop-page')).toBeInTheDocument()
  })

  it('displays the Shop hero section', () => {
    renderInRouter(<ShopPage />, { initialEntries: ['/shop'] })
    expect(screen.getByTestId('shop-hero')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// AboutPage
// ─────────────────────────────────────────────────────────────────────────
describe('AboutPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<AboutPage />)).not.toThrow()
  })

  it('has data-testid="about-page"', () => {
    renderInRouter(<AboutPage />)
    expect(screen.getByTestId('about-page')).toBeInTheDocument()
  })

  it('displays "About" in the page heading', () => {
    renderInRouter(<AboutPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/about/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// ContactPage
// ─────────────────────────────────────────────────────────────────────────
describe('ContactPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<ContactPage />)).not.toThrow()
  })

  it('has data-testid="contact-page"', () => {
    renderInRouter(<ContactPage />)
    expect(screen.getByTestId('contact-page')).toBeInTheDocument()
  })

  it('displays "Contact" or "Touch" in the page heading', () => {
    renderInRouter(<ContactPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/touch|contact/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// LoginPage
// ─────────────────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<LoginPage />)).not.toThrow()
  })

  it('has data-testid="login-page"', () => {
    renderInRouter(<LoginPage />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('displays "Sign in" heading', () => {
    renderInRouter(<LoginPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/sign in/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// RegisterPage
// ─────────────────────────────────────────────────────────────────────────
describe('RegisterPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<RegisterPage />)).not.toThrow()
  })

  it('has data-testid="register-page"', () => {
    renderInRouter(<RegisterPage />)
    expect(screen.getByTestId('register-page')).toBeInTheDocument()
  })

  it('displays "Create account" heading', () => {
    renderInRouter(<RegisterPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/create account/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// DashboardPage
// ─────────────────────────────────────────────────────────────────────────
describe('DashboardPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<DashboardPage />)).not.toThrow()
  })

  it('has data-testid="dashboard-page"', () => {
    renderInRouter(<DashboardPage />)
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  it('displays "Dashboard" in the page heading', () => {
    renderInRouter(<DashboardPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/dashboard/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// AdminPage
// ─────────────────────────────────────────────────────────────────────────
describe('AdminPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<AdminPage />)).not.toThrow()
  })

  it('has data-testid="admin-page"', () => {
    renderInRouter(<AdminPage />)
    expect(screen.getByTestId('admin-page')).toBeInTheDocument()
  })

  it('displays "Dashboard" in the page heading', () => {
    renderInRouter(<AdminPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/dashboard/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// NotFoundPage
// ─────────────────────────────────────────────────────────────────────────
describe('NotFoundPage', () => {
  it('renders without throwing', () => {
    expect(() => renderInRouter(<NotFoundPage />)).not.toThrow()
  })

  it('has data-testid="not-found-page"', () => {
    renderInRouter(<NotFoundPage />)
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
  })

  it('displays "404" text', () => {
    renderInRouter(<NotFoundPage />)
    // Both the large "404" paragraph and the "Page Not Found" heading are present
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('displays "Page Not Found" heading', () => {
    renderInRouter(<NotFoundPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/page not found/i)
  })

  it('renders a home navigation element pointing to "/"', () => {
    renderInRouter(<NotFoundPage />)
    // Button as={Link} now renders as <a> with role="link"
    const homeLink = screen.getByRole('link', { name: /back to home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
