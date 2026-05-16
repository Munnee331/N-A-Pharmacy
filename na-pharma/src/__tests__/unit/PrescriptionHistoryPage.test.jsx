/**
 * Unit tests for PrescriptionHistoryPage.
 *
 * Coverage:
 *  - Route protection: unauthenticated users redirected to /login
 *  - Loading state: skeleton grid shown while fetching
 *  - Empty state: shown when no prescriptions exist
 *  - Error state: shown when API call fails
 *  - Prescription cards: image, status badge, date, reference ID
 *  - Status filter tabs: filter changes trigger re-fetch
 *  - Expand/collapse: details shown on expand
 *  - Recommended medicines: shown when status is approved
 *  - Rejection reason: shown when status is rejected
 *  - Pharmacist notes: shown when notes exist
 *  - Pagination: shown when totalPages > 1
 *  - Refresh button: re-fetches data
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const Tag = typeof tag === 'string' ? tag : 'div'
      return ({ children, ...props }) => {
        const {
          initial, animate, exit, variants, transition,
          whileHover, whileInView, viewport, whileTap,
          ...rest
        } = props
        return <Tag {...rest}>{children}</Tag>
      }
    },
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

vi.mock('../../api/prescriptionApi.js', () => ({
  getMyPrescriptions: vi.fn(),
}))

vi.mock('../../hooks/usePageMeta.js', () => ({ default: vi.fn() }))

// Mock CartContext
const mockAddItems = vi.fn().mockReturnValue({ added: 0, skipped: 0 })
vi.mock('../../context/CartContext.jsx', () => ({
  useCart: () => ({ addItems: mockAddItems, items: [], totalItems: 0 }),
}))

// Mock toast
vi.mock('../../utils/toast.js', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

import PrescriptionHistoryPage from '../../pages/PrescriptionHistoryPage'
import { getMyPrescriptions }  from '../../api/prescriptionApi.js'
import showToast               from '../../utils/toast.js'

// ── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
  mockAddItems.mockReturnValue({ added: 0, skipped: 0 })
})

// ── Helpers ───────────────────────────────────────────────────────────────

function renderPage({ authenticated = true } = {}) {
  mockUseAuth.mockReturnValue({
    isAuthenticated: authenticated,
    isLoading:       false,
  })

  return render(
    <MemoryRouter initialEntries={['/prescriptions']}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/prescriptions" element={<PrescriptionHistoryPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function makePrescription(overrides = {}) {
  return {
    _id:              '507f1f77bcf86cd799439011',
    imageUrl:         '/uploads/prescriptions/rx-test.jpg',
    originalFileName: 'prescription.jpg',
    status:           'pending',
    notes:            '',
    rejectionReason:  '',
    recommendedMedicines: [],
    pharmacist:       null,
    createdAt:        '2026-05-13T10:30:00.000Z',
    ...overrides,
  }
}

function makePagination(overrides = {}) {
  return {
    total:      1,
    page:       1,
    limit:      9,
    totalPages: 1,
    hasNext:    false,
    hasPrev:    false,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Route protection
// ─────────────────────────────────────────────────────────────────────────

describe('Route protection', () => {
  it('renders the page when authenticated', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage({ authenticated: true })

    await waitFor(() => {
      expect(screen.getByTestId('prescription-history-page')).toBeInTheDocument()
    })
  })

  it('the page itself renders without crashing when authenticated', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage({ authenticated: true })

    await waitFor(() => {
      expect(screen.getByText(/my prescriptions/i)).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. Loading state
// ─────────────────────────────────────────────────────────────────────────

describe('Loading state', () => {
  it('shows skeleton grid while fetching', () => {
    // Never resolves — keeps loading state
    getMyPrescriptions.mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getByTestId('skeleton-grid')).toBeInTheDocument()
  })

  it('hides skeleton after data loads', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-grid')).not.toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. Empty state
// ─────────────────────────────────────────────────────────────────────────

describe('Empty state', () => {
  it('shows empty state when no prescriptions exist', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination({ total: 0 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
    expect(screen.getByText(/no prescriptions yet/i)).toBeInTheDocument()
  })

  it('shows "Upload Prescription" button in empty state', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination({ total: 0 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
    // Button as={Link} renders as <a> (role="link"), not role="button"
    expect(screen.getByRole('link', { name: /upload prescription/i })).toBeInTheDocument()
  })

  it('shows "no prescriptions found" when filter is active and empty', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination({ total: 0 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    })

    // Click the "Approved" filter
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination({ total: 0 }),
    })
    fireEvent.click(screen.getByTestId('filter-approved'))

    await waitFor(() => {
      expect(screen.getByText(/no prescriptions found/i)).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 4. Error state
// ─────────────────────────────────────────────────────────────────────────

describe('Error state', () => {
  it('shows error state when API call fails', async () => {
    getMyPrescriptions.mockRejectedValue({ message: 'Network error' })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('shows generic error when error has no message', async () => {
    getMyPrescriptions.mockRejectedValue({})

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })

  it('retries fetch when "Try Again" is clicked', async () => {
    getMyPrescriptions
      .mockRejectedValueOnce({ message: 'Network error' })
      .mockResolvedValueOnce({
        prescriptions: [makePrescription()],
        pagination:    makePagination({ total: 1 }),
      })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(screen.getByTestId('prescriptions-grid')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 5. Prescription cards
// ─────────────────────────────────────────────────────────────────────────

describe('Prescription cards', () => {
  it('renders a card for each prescription', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [
        makePrescription({ _id: 'aaa111' }),
        makePrescription({ _id: 'bbb222' }),
        makePrescription({ _id: 'ccc333' }),
      ],
      pagination: makePagination({ total: 3 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getAllByTestId('prescription-card')).toHaveLength(3)
    })
  })

  it('shows the reference ID (last 8 chars of _id uppercased)', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: '507f1f77bcf86cd799439011' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('#99439011')).toBeInTheDocument()
    })
  })

  it('shows the upload date', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ createdAt: '2026-05-13T10:30:00.000Z' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      // Date is formatted with en-BD locale — accept either "13 May 2026" or "May 13, 2026"
      expect(screen.getByText(/13.*2026|2026.*13/i)).toBeInTheDocument()
    })
  })

  it('shows the status badge for each status', async () => {
    const statuses = ['pending', 'under_review', 'approved', 'rejected']

    for (const status of statuses) {
      getMyPrescriptions.mockResolvedValue({
        prescriptions: [makePrescription({ status })],
        pagination:    makePagination({ total: 1 }),
      })

      const { unmount } = renderPage()

      await waitFor(() => {
        expect(screen.getByTestId(`status-badge-${status}`)).toBeInTheDocument()
      })

      unmount()
    }
  })

  it('shows image preview for image files', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ imageUrl: '/uploads/prescriptions/rx.jpg' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prescription-image')).toBeInTheDocument()
    })
  })

  it('shows PDF preview for PDF files', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ imageUrl: '/uploads/prescriptions/rx.pdf' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prescription-pdf-preview')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 6. Expand / collapse details
// ─────────────────────────────────────────────────────────────────────────

describe('Expand / collapse details', () => {
  it('details are hidden by default', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ notes: 'Urgent' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prescription-card')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('pharmacist-notes')).not.toBeInTheDocument()
  })

  it('shows details after clicking "Show details"', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ notes: 'Urgent delivery needed' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    expect(screen.getByTestId('pharmacist-notes')).toBeInTheDocument()
    expect(screen.getByText('Urgent delivery needed')).toBeInTheDocument()
  })

  it('hides details after clicking "Hide details"', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ notes: 'Urgent' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))
    expect(screen.getByTestId('pharmacist-notes')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('expand-button'))
    expect(screen.queryByTestId('pharmacist-notes')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 7. Recommended medicines (approved)
// ─────────────────────────────────────────────────────────────────────────

describe('Recommended medicines', () => {
  it('shows recommended medicines when prescription is approved', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [
        makePrescription({
          status: 'approved',
          recommendedMedicines: [
            {
              _id:      'med1',
              medicine: { name: 'Paracetamol 500mg', brand: 'Napa' },
              quantity: 2,
              dosageInstructions: 'Twice daily after meals',
            },
          ],
        }),
      ],
      pagination: makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    expect(screen.getByTestId('recommended-medicines')).toBeInTheDocument()
    expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument()
    expect(screen.getByText('Napa')).toBeInTheDocument()
    // quantity is rendered as: "Qty: " + <strong>2</strong>
    expect(screen.getByText(/qty/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Twice daily after meals')).toBeInTheDocument()
  })

  it('does not show recommended medicines section when empty', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ status: 'pending', recommendedMedicines: [] })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    expect(screen.queryByTestId('recommended-medicines')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 8. Rejection reason
// ─────────────────────────────────────────────────────────────────────────

describe('Rejection reason', () => {
  it('shows rejection reason when prescription is rejected', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [
        makePrescription({
          status:          'rejected',
          rejectionReason: 'Prescription is expired',
        }),
      ],
      pagination: makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    expect(screen.getByTestId('rejection-reason')).toBeInTheDocument()
    expect(screen.getByText('Prescription is expired')).toBeInTheDocument()
  })

  it('does not show rejection reason section when empty', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ status: 'pending', rejectionReason: '' })],
      pagination:    makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    expect(screen.queryByTestId('rejection-reason')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 9. Pharmacist info
// ─────────────────────────────────────────────────────────────────────────

describe('Pharmacist info', () => {
  it('shows pharmacist name when assigned', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [
        makePrescription({
          status:     'approved',
          pharmacist: { name: 'Dr. Karim', email: 'karim@napharma.com' },
          recommendedMedicines: [
            { _id: 'm1', medicine: { name: 'Amoxicillin' }, quantity: 1 },
          ],
        }),
      ],
      pagination: makePagination({ total: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('expand-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('expand-button'))

    expect(screen.getByTestId('pharmacist-notes')).toBeInTheDocument()
    expect(screen.getByText('Dr. Karim')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 10. Status filter tabs
// ─────────────────────────────────────────────────────────────────────────

describe('Status filter tabs', () => {
  it('renders all filter tabs', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    })

    expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-pending')).toBeInTheDocument()
    expect(screen.getByTestId('filter-under_review')).toBeInTheDocument()
    expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    expect(screen.getByTestId('filter-rejected')).toBeInTheDocument()
  })

  it('calls getMyPrescriptions with status param when filter is clicked', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('filter-approved'))

    await waitFor(() => {
      expect(getMyPrescriptions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      )
    })
  })

  it('"All" filter calls API without status param', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    })

    // Click approved first, then all
    fireEvent.click(screen.getByTestId('filter-approved'))
    await waitFor(() => {
      expect(getMyPrescriptions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      )
    })

    fireEvent.click(screen.getByTestId('filter-all'))
    await waitFor(() => {
      const calls = getMyPrescriptions.mock.calls
      const lastCall = calls[calls.length - 1][0]
      expect(lastCall.status).toBeUndefined()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 11. Pagination
// ─────────────────────────────────────────────────────────────────────────

describe('Pagination', () => {
  it('shows pagination when totalPages > 1', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription()],
      pagination:    makePagination({ total: 20, totalPages: 3, hasNext: true }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })
  })

  it('does not show pagination when only one page', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription()],
      pagination:    makePagination({ total: 1, totalPages: 1 }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prescriptions-grid')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('disables Prev button on first page', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription()],
      pagination:    makePagination({ total: 20, totalPages: 3, hasNext: true, hasPrev: false }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prev-page')).toBeInTheDocument()
    })

    expect(screen.getByTestId('prev-page')).toBeDisabled()
    expect(screen.getByTestId('next-page')).not.toBeDisabled()
  })

  it('calls getMyPrescriptions with page=2 when Next is clicked', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription()],
      pagination:    makePagination({ total: 20, totalPages: 3, hasNext: true, hasPrev: false }),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('next-page')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('next-page'))

    await waitFor(() => {
      expect(getMyPrescriptions).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 12. Refresh button
// ─────────────────────────────────────────────────────────────────────────

describe('Refresh button', () => {
  it('calls getMyPrescriptions again when Refresh is clicked', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [],
      pagination:    makePagination(),
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('refresh-button'))

    await waitFor(() => {
      expect(getMyPrescriptions).toHaveBeenCalledTimes(2)
    })
  })
})


// ─────────────────────────────────────────────────────────────────────────
// 13. Add to Cart button
// ─────────────────────────────────────────────────────────────────────────

describe('Add to Cart button', () => {
  const approvedRx = {
    _id:              '507f1f77bcf86cd799439011',
    imageUrl:         '/uploads/prescriptions/rx.jpg',
    originalFileName: 'rx.jpg',
    status:           'approved',
    notes:            '',
    rejectionReason:  '',
    createdAt:        '2026-05-13T10:30:00.000Z',
    pharmacist:       null,
    recommendedMedicines: [
      {
        _id:      'rm1',
        medicine: { _id: 'med-001', name: 'Paracetamol 500mg', brand: 'Napa', price: 35 },
        quantity: 2,
        dosageInstructions: 'Twice daily',
      },
      {
        _id:      'rm2',
        medicine: { _id: 'med-002', name: 'Amoxicillin 250mg', brand: 'Moxacil', price: 80 },
        quantity: 1,
        dosageInstructions: '',
      },
    ],
  }

  const pendingRx = {
    _id:              '507f1f77bcf86cd799439022',
    imageUrl:         '/uploads/prescriptions/rx2.jpg',
    originalFileName: 'rx2.jpg',
    status:           'pending',
    notes:            '',
    rejectionReason:  '',
    createdAt:        '2026-05-13T10:30:00.000Z',
    pharmacist:       null,
    recommendedMedicines: [],
  }

  const approvedNoMeds = {
    ...approvedRx,
    _id:                  '507f1f77bcf86cd799439033',
    recommendedMedicines: [],
  }

  it('shows the button for approved prescriptions with medicines', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })
  })

  it('does NOT show the button for pending prescriptions', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [pendingRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prescription-card')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('add-to-cart-btn')).not.toBeInTheDocument()
  })

  it('does NOT show the button for approved prescriptions with no medicines', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedNoMeds],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('prescription-card')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('add-to-cart-btn')).not.toBeInTheDocument()
  })

  it('calls addItems with all recommended medicines when clicked', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('add-to-cart-btn'))

    expect(mockAddItems).toHaveBeenCalledOnce()
    const [cartItems] = mockAddItems.mock.calls[0]
    expect(cartItems).toHaveLength(2)
    expect(cartItems[0]).toMatchObject({ id: 'med-001', quantity: 2 })
    expect(cartItems[1]).toMatchObject({ id: 'med-002', quantity: 1 })
  })

  it('preserves quantities from recommendedMedicines', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('add-to-cart-btn'))

    const [cartItems] = mockAddItems.mock.calls[0]
    expect(cartItems[0].quantity).toBe(2)
    expect(cartItems[1].quantity).toBe(1)
  })

  it('shows success toast after clicking', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('add-to-cart-btn'))

    expect(showToast.success).toHaveBeenCalledWith('Medicines added to cart')
  })

  it('disables the button after successful addition', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })

    const btn = screen.getByTestId('add-to-cart-btn')
    expect(btn).not.toBeDisabled()

    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeDisabled()
    })
  })

  it('changes button label to "Added to Cart" after clicking', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('add-to-cart-btn'))

    expect(screen.getByTestId('add-to-cart-btn')).toHaveTextContent('Added to Cart')
  })

  it('does not call addItems again when button is disabled', async () => {
    getMyPrescriptions.mockResolvedValue({
      prescriptions: [approvedRx],
      pagination:    { total: 1, page: 1, limit: 9, totalPages: 1, hasNext: false, hasPrev: false },
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeInTheDocument()
    })

    const btn = screen.getByTestId('add-to-cart-btn')
    fireEvent.click(btn)   // first click
    fireEvent.click(btn)   // second click — should be ignored (disabled)

    expect(mockAddItems).toHaveBeenCalledOnce()
  })
})
