import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../../components/footer/Footer'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => children,
}))

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )
}

describe('Footer', () => {
  it('renders the brand name "N A Pharma"', () => {
    renderFooter()
    // FooterBrand renders "N A Pharma" split across spans inside a link
    // Use getAllByText since "N A" also appears in the copyright line
    const naElements = screen.getAllByText(/N A/)
    expect(naElements.length).toBeGreaterThan(0)
    // The brand span specifically contains "Pharma" as a child
    expect(screen.getByText('Pharma')).toBeInTheDocument()
  })

  it('renders the Quick Links section heading', () => {
    renderFooter()
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
  })

  it('renders the Services section heading', () => {
    renderFooter()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('renders the newsletter email input', () => {
    renderFooter()
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('renders the newsletter subscribe button', () => {
    renderFooter()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('has data-testid="footer" on the root element', () => {
    renderFooter()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('has data-testid="footer-copyright" on the copyright paragraph', () => {
    renderFooter()
    expect(screen.getByTestId('footer-copyright')).toBeInTheDocument()
  })

  it('copyright text contains the current year', () => {
    renderFooter()
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(currentYear)
  })
})
