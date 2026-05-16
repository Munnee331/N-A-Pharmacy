import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../../components/navbar/Navbar'

// Mock hooks used internally by Navbar
vi.mock('../../hooks/useScrolled', () => ({ default: () => false }))
vi.mock('../../hooks/useMobileMenu', () => ({
  default: () => ({ isOpen: false, toggle: vi.fn(), close: vi.fn() }),
}))
vi.mock('../../hooks/useCartCount', () => ({ default: () => 0 }))
vi.mock('../../hooks/useWishlistCount', () => ({ default: () => 0 }))

// NavActions calls useAuth() — mock AuthContext so it doesn't throw
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => <>{children}</>,
}))

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders the brand name "N A Pharma"', () => {
    renderNavbar()
    // The brand is split across two elements: "N A " and "Pharma"
    expect(screen.getByText(/N A/)).toBeInTheDocument()
    expect(screen.getByText('Pharma')).toBeInTheDocument()
  })

  it('renders all four nav links (Home, Shop, About, Contact)', () => {
    renderNavbar()
    expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /shop/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0)
  })

  it('renders Login and Register buttons', () => {
    renderNavbar()
    // Button as={Link} renders as <a> (role="link")
    expect(screen.getAllByRole('link', { name: /login/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /register/i }).length).toBeGreaterThan(0)
  })

  it('renders the hamburger button (visible on mobile viewport)', () => {
    renderNavbar()
    expect(
      screen.getByRole('button', { name: /toggle navigation menu/i })
    ).toBeInTheDocument()
  })

  it('has data-testid="navbar" on the root element', () => {
    renderNavbar()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })
})
