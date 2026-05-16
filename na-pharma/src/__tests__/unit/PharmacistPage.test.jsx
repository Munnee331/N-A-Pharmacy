/**
 * Unit tests for PharmacistPage.
 *
 * Coverage:
 *  1. Loading state — shows skeleton while fetching
 *  2. Error state — shows error + retry button when API fails; retry re-fetches
 *  3. Empty state — shows empty message when no prescriptions
 *  4. Prescription list — renders cards for each prescription
 *  5. Filter tabs — clicking a filter calls API with correct status param
 *  6. Start Review — clicking calls startReview, refreshes list, shows toast
 *  7. Approve flow — clicking Approve opens modal; adding a medicine and submitting calls approvePrescription
 *  8. Reject flow — clicking Reject opens modal; entering reason and submitting calls rejectPrescription
 *  9. Approve validation — submit without medicines shows error
 * 10. Reject validation — submit without reason shows error
 * 11. Medicine search — typing in search calls getMedicines with search param
 * 12. Refresh button — clicking re-fetches
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
  getPendingPrescriptions: vi.fn(),
  startReview:             vi.fn(),
  approvePrescription:     vi.fn(),
  rejectPrescription:      vi.fn(),
}))

vi.mock('../../api/medicineApi.js', () => ({
  getMedicines: vi.fn(),
}))

vi.mock('../../hooks/usePageMeta.js', () => ({ default: vi.fn() }))

vi.mock('../../utils/toast.js', () => ({
  default: {
    success: vi.fn(),
    error:   vi.fn(),
    info:    vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}))

const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}))

import PharmacistPage from '../../pages/PharmacistPage'
import {
  getPendingPrescriptions,
  startReview,
  approvePrescription,
  rejectPrescription,
} from '../../api/prescriptionApi.js'
import { getMedicines } from '../../api/medicineApi.js'
import showToast from '../../utils/toast.js'

// ── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    user: { name: 'Pharmacist User', role: 'pharmacist' },
    isAuthenticated: true,
    isLoading: false,
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter>
      <PharmacistPage />
    </MemoryRouter>
  )
}

function makePrescription(overrides = {}) {
  return {
    _id:       '507f1f77bcf86cd799439011',
    imageUrl:  '/uploads/prescriptions/rx-test.jpg',
    status:    'pending',
    notes:     '',
    createdAt: '2026-05-13T10:30:00.000Z',
    customer:  { name: 'Fatima Rahman', email: 'fatima@example.com' },
    pharmacist: null,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Loading state
// ─────────────────────────────────────────────────────────────────────────

describe('Loading state', () => {
  it('shows skeleton while fetching', () => {
    getPendingPrescriptions.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId('skeleton-loading')).toBeInTheDocument()
  })

  it('hides skeleton after data loads', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loading')).not.toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. Error state
// ─────────────────────────────────────────────────────────────────────────

describe('Error state', () => {
  it('shows error state when API fails', async () => {
    getPendingPrescriptions.mockRejectedValue({ message: 'Network error' })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('retry button re-fetches data', async () => {
    getPendingPrescriptions
      .mockRejectedValueOnce({ message: 'Network error' })
      .mockResolvedValueOnce({ prescriptions: [] })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
      expect(getPendingPrescriptions).toHaveBeenCalledTimes(2)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. Empty state
// ─────────────────────────────────────────────────────────────────────────

describe('Empty state', () => {
  it('shows empty state when no prescriptions', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 4. Prescription list
// ─────────────────────────────────────────────────────────────────────────

describe('Prescription list', () => {
  it('renders a card for each prescription', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [
        makePrescription({ _id: 'aaa111' }),
        makePrescription({ _id: 'bbb222' }),
        makePrescription({ _id: 'ccc333' }),
      ],
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByTestId('prescription-card')).toHaveLength(3)
    })
  })

  it('shows customer name on each card', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ customer: { name: 'Fatima Rahman' } })],
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Fatima Rahman')).toBeInTheDocument()
    })
  })

  it('shows prescriptions-list container', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription()],
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('prescriptions-list')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 5. Filter tabs
// ─────────────────────────────────────────────────────────────────────────

describe('Filter tabs', () => {
  it('renders all filter tabs', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    })
    expect(screen.getByTestId('filter-pending')).toBeInTheDocument()
    expect(screen.getByTestId('filter-under_review')).toBeInTheDocument()
    expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    expect(screen.getByTestId('filter-rejected')).toBeInTheDocument()
  })

  it('clicking "pending" filter calls API with status=pending', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('filter-pending')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('filter-pending'))

    await waitFor(() => {
      expect(getPendingPrescriptions).toHaveBeenCalledWith({ status: 'pending' })
    })
  })

  it('clicking "approved" filter calls API with status=approved', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('filter-approved'))

    await waitFor(() => {
      expect(getPendingPrescriptions).toHaveBeenCalledWith({ status: 'approved' })
    })
  })

  it('clicking "all" filter calls API with empty params', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    })

    // First click pending, then all
    fireEvent.click(screen.getByTestId('filter-pending'))
    await waitFor(() => {
      expect(getPendingPrescriptions).toHaveBeenCalledWith({ status: 'pending' })
    })

    fireEvent.click(screen.getByTestId('filter-all'))
    await waitFor(() => {
      expect(getPendingPrescriptions).toHaveBeenCalledWith({})
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 6. Start Review
// ─────────────────────────────────────────────────────────────────────────

describe('Start Review', () => {
  it('clicking Start Review calls startReview with prescription id', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-001', status: 'pending' })],
    })
    startReview.mockResolvedValue({})

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('start-review-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('start-review-btn'))

    await waitFor(() => {
      expect(startReview).toHaveBeenCalledWith('rx-001')
    })
  })

  it('shows success toast after starting review', async () => {
    getPendingPrescriptions
      .mockResolvedValueOnce({
        prescriptions: [makePrescription({ _id: 'rx-001', status: 'pending' })],
      })
      .mockResolvedValueOnce({ prescriptions: [] })
    startReview.mockResolvedValue({})

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('start-review-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('start-review-btn'))

    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalled()
    })
  })

  it('refreshes list after starting review', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-001', status: 'pending' })],
    })
    startReview.mockResolvedValue({})

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('start-review-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('start-review-btn'))

    await waitFor(() => {
      // Initial fetch + refresh = 2 calls
      expect(getPendingPrescriptions).toHaveBeenCalledTimes(2)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 7. Approve flow
// ─────────────────────────────────────────────────────────────────────────

describe('Approve flow', () => {
  it('clicking Approve opens the approve modal', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-002', status: 'under_review' })],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('approve-btn'))

    expect(screen.getByTestId('approve-modal')).toBeInTheDocument()
  })

  it('adding a medicine and submitting calls approvePrescription', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-002', status: 'under_review' })],
    })
    getMedicines.mockResolvedValue({
      medicines: [{ _id: 'med-001', name: 'Paracetamol 500mg', brand: 'Napa' }],
    })
    approvePrescription.mockResolvedValue({})

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('approve-btn'))

    // Type in search
    fireEvent.change(screen.getByTestId('medicine-search-input'), {
      target: { value: 'Para' },
    })

    // Wait for debounce + results
    await waitFor(() => {
      expect(getMedicines).toHaveBeenCalledWith({ search: 'Para' })
    })

    await waitFor(() => {
      expect(screen.getByTestId('medicine-search-results')).toBeInTheDocument()
    })

    // Click add
    fireEvent.click(screen.getByTestId('add-medicine-btn'))

    // Medicine item should appear
    await waitFor(() => {
      expect(screen.getByTestId('recommended-medicine-item')).toBeInTheDocument()
    })

    // Submit
    fireEvent.click(screen.getByTestId('submit-approve-btn'))

    await waitFor(() => {
      expect(approvePrescription).toHaveBeenCalledWith(
        'rx-002',
        expect.arrayContaining([
          expect.objectContaining({ medicine: 'med-001', quantity: 1 }),
        ])
      )
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 8. Reject flow
// ─────────────────────────────────────────────────────────────────────────

describe('Reject flow', () => {
  it('clicking Reject opens the reject modal', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-003', status: 'under_review' })],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('reject-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('reject-btn'))

    expect(screen.getByTestId('reject-modal')).toBeInTheDocument()
  })

  it('entering reason and submitting calls rejectPrescription', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-003', status: 'under_review' })],
    })
    rejectPrescription.mockResolvedValue({})

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('reject-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('reject-btn'))

    fireEvent.change(screen.getByTestId('reject-reason-input'), {
      target: { value: 'Prescription is expired' },
    })

    fireEvent.click(screen.getByTestId('submit-reject-btn'))

    await waitFor(() => {
      expect(rejectPrescription).toHaveBeenCalledWith('rx-003', 'Prescription is expired')
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 9. Approve validation
// ─────────────────────────────────────────────────────────────────────────

describe('Approve validation', () => {
  it('shows error when submitting without medicines', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-004', status: 'under_review' })],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('approve-btn'))
    fireEvent.click(screen.getByTestId('submit-approve-btn'))

    await waitFor(() => {
      expect(screen.getByText(/at least one medicine/i)).toBeInTheDocument()
    })

    expect(approvePrescription).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 10. Reject validation
// ─────────────────────────────────────────────────────────────────────────

describe('Reject validation', () => {
  it('shows error when submitting without reason', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-005', status: 'under_review' })],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('reject-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('reject-btn'))
    fireEvent.click(screen.getByTestId('submit-reject-btn'))

    await waitFor(() => {
      expect(screen.getByText(/reason is required/i)).toBeInTheDocument()
    })

    expect(rejectPrescription).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 11. Medicine search
// ─────────────────────────────────────────────────────────────────────────

describe('Medicine search', () => {
  it('typing in search calls getMedicines with search param', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-006', status: 'under_review' })],
    })
    getMedicines.mockResolvedValue({ medicines: [] })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('approve-btn'))

    fireEvent.change(screen.getByTestId('medicine-search-input'), {
      target: { value: 'Amox' },
    })

    await waitFor(() => {
      expect(getMedicines).toHaveBeenCalledWith({ search: 'Amox' })
    })
  })

  it('shows search results list when medicines are returned', async () => {
    getPendingPrescriptions.mockResolvedValue({
      prescriptions: [makePrescription({ _id: 'rx-006', status: 'under_review' })],
    })
    getMedicines.mockResolvedValue({
      medicines: [
        { _id: 'med-a', name: 'Amoxicillin 250mg', brand: 'Moxacil' },
      ],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('approve-btn'))

    fireEvent.change(screen.getByTestId('medicine-search-input'), {
      target: { value: 'Amox' },
    })

    await waitFor(() => {
      expect(screen.getByTestId('medicine-search-results')).toBeInTheDocument()
    })

    expect(screen.getByText('Amoxicillin 250mg')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 12. Refresh button
// ─────────────────────────────────────────────────────────────────────────

describe('Refresh button', () => {
  it('clicking refresh re-fetches prescriptions', async () => {
    getPendingPrescriptions.mockResolvedValue({ prescriptions: [] })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('refresh-btn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('refresh-btn'))

    await waitFor(() => {
      expect(getPendingPrescriptions).toHaveBeenCalledTimes(2)
    })
  })
})
