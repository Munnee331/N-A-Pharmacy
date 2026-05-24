import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const Tag = typeof tag === 'string' ? tag : 'div'
      return ({ children, ...props }) => {
        const { initial, animate, exit, variants, transition, whileHover, whileInView, viewport, whileTap, ...rest } = props
        return <Tag {...rest}>{children}</Tag>
      }
    },
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock APIs and contexts
const mockRemoveItem = vi.fn()
const mockClearCart = vi.fn()
vi.mock('../../context/CartContext', () => ({
  useCart: () => ({
    items: [
      { id: 'rx1', name: 'RxMed', price: 50, quantity: 1, requiresPrescription: true },
      { id: 'm2', name: 'FreeMed', price: 20, quantity: 2, requiresPrescription: false },
    ],
    totalPrice: 90,
    clearCart: mockClearCart,
    removeItem: mockRemoveItem,
  }),
  CartProvider: ({ children }) => <>{children}</>,
}))

vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: () => ({ user: { name: 'Test', email: 't@test' } }) }))

const mockInitiate = vi.fn()
vi.mock('../../api/paymentApi.js', () => ({ initiatePayment: (p) => mockInitiate(p) }))


import CheckoutPage from '../../pages/CheckoutPage'

beforeEach(() => {
  vi.clearAllMocks()
  mockInitiate.mockResolvedValue({ orderId: 'ord1', gatewayUrl: null, filteredOutItems: [{ medicine: 'rx1', name: 'RxMed', quantity: 1 }] })
})

afterEach(() => {
  // noop
})

function renderPage() {
  return render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>
  )
}

describe('CheckoutPage filtered-out items handling', () => {
  it('removes filtered items from cart and shows toast when backend returns filteredOutItems', async () => {
    renderPage()

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'a@b.test' } })
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '01700000000' } })
    fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: 'Addr' } })
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Dhaka' } })
    fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: '1207' } })

    // Click Place Order
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }))

    await waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalledWith('rx1')
    })
  })
})
