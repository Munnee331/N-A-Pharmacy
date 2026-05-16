import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MobileDrawer from '../../components/navbar/MobileDrawer'

// NavActions (rendered inside MobileDrawer) calls useAuth() — mock it
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

const defaultProps = {
  isOpen: false,
  onClose: vi.fn(),
  cartCount: 0,
  wishlistCount: 0,
}

function renderDrawer(props = {}) {
  return render(
    <MemoryRouter>
      <MobileDrawer {...defaultProps} {...props} />
    </MemoryRouter>
  )
}

describe('MobileDrawer', () => {
  it('renders nav links when isOpen is true', () => {
    renderDrawer({ isOpen: true })
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shop/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('renders the close button when isOpen is true', () => {
    renderDrawer({ isOpen: true })
    expect(
      screen.getByRole('button', { name: /close navigation menu/i })
    ).toBeInTheDocument()
  })

  it('does not render the drawer panel when isOpen is false', () => {
    renderDrawer({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render nav links when isOpen is false', () => {
    renderDrawer({ isOpen: false })
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument()
  })
})
