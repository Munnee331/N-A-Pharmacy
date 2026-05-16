import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  FileImage,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Pill,
  MessageSquare,
  Upload,
  Stethoscope,
  ShoppingCart,
  CheckCheck,
} from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import LoadingSkeleton  from '../components/ui/LoadingSkeleton'
import Button           from '../components/ui/Button'
import { getMyPrescriptions } from '../api/prescriptionApi.js'
import { useCart }            from '../context/CartContext.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import showToast   from '../utils/toast.js'

// ── Constants ─────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

const STATUS_CONFIG = {
  pending: {
    label:     'Pending Review',
    color:     'bg-amber-100 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
    Icon:      Clock,
  },
  under_review: {
    label:     'Under Review',
    color:     'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500',
    Icon:      Eye,
  },
  approved: {
    label:     'Approved',
    color:     'bg-green-100 text-green-700 border-green-200',
    iconColor: 'text-green-500',
    Icon:      CheckCircle2,
  },
  rejected: {
    label:     'Rejected',
    color:     'bg-red-100 text-red-700 border-red-200',
    iconColor: 'text-red-500',
    Icon:      XCircle,
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-BD', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-BD', {
    hour:   '2-digit',
    minute: '2-digit',
  })
}

function isPdf(url = '') {
  return url.toLowerCase().endsWith('.pdf')
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-semibold border ${cfg.color}`}
      data-testid={`status-badge-${status}`}
    >
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  )
}

function PrescriptionImage({ imageUrl, originalFileName }) {
  const fullUrl = imageUrl?.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`
  const pdf     = isPdf(imageUrl ?? '')

  if (pdf) {
    return (
      <div
        className="w-full h-36 rounded-xl bg-neutral-100 flex flex-col items-center
                   justify-center gap-2 border border-neutral-200"
        data-testid="prescription-pdf-preview"
      >
        <FileText size={28} className="text-neutral-400" />
        <p className="text-xs text-neutral-500 truncate max-w-[140px]">
          {originalFileName || 'prescription.pdf'}
        </p>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-secondary-600 hover:underline font-medium"
        >
          Open PDF
        </a>
      </div>
    )
  }

  return (
    <div className="w-full h-36 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
      <img
        src={fullUrl}
        alt={originalFileName || 'Prescription image'}
        className="w-full h-full object-cover"
        data-testid="prescription-image"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextSibling.style.display = 'flex'
        }}
      />
      {/* Fallback shown when image fails to load */}
      <div
        className="w-full h-full hidden flex-col items-center justify-center gap-2"
        aria-hidden="true"
      >
        <FileImage size={28} className="text-neutral-300" />
        <p className="text-xs text-neutral-400">Image unavailable</p>
      </div>
    </div>
  )
}

function RecommendedMedicines({ medicines }) {
  if (!medicines?.length) return null
  return (
    <div
      className="mt-4 pt-4 border-t border-neutral-100"
      data-testid="recommended-medicines"
    >
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Pill size={12} />
        Recommended Medicines
      </p>
      <ul className="flex flex-col gap-2">
        {medicines.map((item, i) => (
          <li
            key={item._id ?? i}
            className="flex items-start gap-3 bg-green-50 rounded-xl p-3 border border-green-100"
          >
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Pill size={13} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {item.medicine?.name ?? 'Unknown medicine'}
              </p>
              {item.medicine?.brand && (
                <p className="text-xs text-neutral-500">{item.medicine.brand}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="text-xs text-neutral-600">
                  Qty: <strong>{item.quantity}</strong>
                </span>
                {item.dosageInstructions && (
                  <span className="text-xs text-neutral-600">
                    {item.dosageInstructions}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RejectionReason({ reason }) {
  if (!reason) return null
  return (
    <div
      className="mt-4 pt-4 border-t border-neutral-100"
      data-testid="rejection-reason"
    >
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <AlertCircle size={12} />
        Rejection Reason
      </p>
      <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3 border border-red-100">
        {reason}
      </p>
    </div>
  )
}

function PharmacistNotes({ notes, pharmacist }) {
  if (!notes && !pharmacist) return null
  return (
    <div
      className="mt-4 pt-4 border-t border-neutral-100"
      data-testid="pharmacist-notes"
    >
      {pharmacist && (
        <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1.5">
          <Stethoscope size={12} />
          Reviewed by <strong className="text-neutral-700">{pharmacist.name}</strong>
        </p>
      )}
      {notes && (
        <>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <MessageSquare size={12} />
            Your Notes
          </p>
          <p className="text-sm text-neutral-700 bg-neutral-50 rounded-xl p-3 border border-neutral-200">
            {notes}
          </p>
        </>
      )}
    </div>
  )
}

function PrescriptionCard({ prescription }) {
  const [expanded, setExpanded]   = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItems }              = useCart()
  const cfg = STATUS_CONFIG[prescription.status] ?? STATUS_CONFIG.pending

  const canAddToCart =
    prescription.status === 'approved' &&
    Array.isArray(prescription.recommendedMedicines) &&
    prescription.recommendedMedicines.length > 0

  function handleAddToCart() {
    const cartItems = prescription.recommendedMedicines.map((item) => ({
      id:       item.medicine?._id ?? item.medicine,
      name:     item.medicine?.name  ?? 'Unknown',
      brand:    item.medicine?.brand ?? '',
      price:    item.medicine?.price ?? 0,
      originalPrice: item.medicine?.originalPrice ?? null,
      image:    item.medicine?.image ?? '',
      category: item.medicine?.category ?? '',
      inStock:  true,
      requiresPrescription: true,
      quantity: item.quantity ?? 1,
    }))

    addItems(cartItems)
    setAddedToCart(true)
    showToast.success('Medicines added to cart')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-neutral-200 shadow-soft overflow-hidden"
      data-testid="prescription-card"
    >
      {/* Status accent bar */}
      <div className={`h-1 w-full ${
        prescription.status === 'approved'     ? 'bg-green-400' :
        prescription.status === 'rejected'     ? 'bg-red-400'   :
        prescription.status === 'under_review' ? 'bg-blue-400'  :
        'bg-amber-400'
      }`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-xs text-neutral-400 mb-0.5">Reference</p>
            <p className="text-sm font-mono font-bold text-neutral-800 truncate">
              #{prescription._id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <StatusBadge status={prescription.status} />
        </div>

        {/* Image preview */}
        <PrescriptionImage
          imageUrl={prescription.imageUrl}
          originalFileName={prescription.originalFileName}
        />

        {/* Date + file name */}
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <span>
            {formatDate(prescription.createdAt)}{' '}
            <span className="text-neutral-400">{formatTime(prescription.createdAt)}</span>
          </span>
          {prescription.originalFileName && (
            <span className="truncate max-w-[120px] text-neutral-400">
              {prescription.originalFileName}
            </span>
          )}
        </div>

        {/* Add to cart — approved prescriptions only */}
        {canAddToCart && (
          <Button
            variant={addedToCart ? 'ghost' : 'primary'}
            size="sm"
            className="mt-4 w-full"
            disabled={addedToCart}
            onClick={handleAddToCart}
            leftIcon={addedToCart ? <CheckCheck size={14} /> : <ShoppingCart size={14} />}
            data-testid="add-to-cart-btn"
          >
            {addedToCart ? 'Added to Cart' : 'Add Medicines to Cart'}
          </Button>
        )}

        {/* Expand / collapse details */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs
                     text-secondary-600 hover:text-secondary-700 font-medium py-1.5
                     rounded-lg hover:bg-secondary-50 transition-colors"
          aria-expanded={expanded}
          data-testid="expand-button"
        >
          {expanded ? 'Hide details' : 'Show details'}
          <cfg.Icon size={12} className={cfg.iconColor} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PharmacistNotes
                notes={prescription.notes}
                pharmacist={prescription.pharmacist}
              />
              <RecommendedMedicines medicines={prescription.recommendedMedicines} />
              <RejectionReason reason={prescription.rejectionReason} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

function SkeletonGrid() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      data-testid="skeleton-grid"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
          <LoadingSkeleton variant="text" className="w-1/3" />
          <LoadingSkeleton variant="card" className="h-36" />
          <LoadingSkeleton variant="text" className="w-2/3" />
        </div>
      ))}
    </div>
  )
}

// ── Status filter tabs ────────────────────────────────────────────────────

const FILTERS = [
  { value: '',             label: 'All' },
  { value: 'pending',      label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved',     label: 'Approved' },
  { value: 'rejected',     label: 'Rejected' },
]

// ── Main page ─────────────────────────────────────────────────────────────

export default function PrescriptionHistoryPage() {
  usePageMeta('My Prescriptions', 'View and track all your prescription submissions.')

  const [prescriptions, setPrescriptions] = useState([])
  const [pagination, setPagination]       = useState(null)
  const [isLoading, setLoading]           = useState(true)
  const [error, setError]                 = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [page, setPage]                   = useState(1)

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: 9 }
      if (statusFilter) params.status = statusFilter
      const data = await getMyPrescriptions(params)
      setPrescriptions(data.prescriptions)
      setPagination(data.pagination)
    } catch (err) {
      setError(err?.message || 'Failed to load prescriptions. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  // Reset to page 1 when filter changes
  function handleFilterChange(value) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div data-testid="prescription-history-page">
      <SectionContainer as="div" py="lg">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">My Prescriptions</h1>
            <p className="text-neutral-500 text-sm">
              Track the status of all your prescription submissions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPrescriptions}
              leftIcon={<RefreshCw size={14} />}
              disabled={isLoading}
              data-testid="refresh-button"
            >
              Refresh
            </Button>
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="sm"
              leftIcon={<Upload size={14} />}
            >
              Upload New
            </Button>
          </div>
        </div>

        {/* ── Status filter tabs ── */}
        <div
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter prescriptions by status"
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              role="tab"
              aria-selected={statusFilter === value}
              onClick={() => handleFilterChange(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                          ${statusFilter === value
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                          }`}
              data-testid={`filter-${value || 'all'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchPrescriptions} />
        ) : prescriptions.length === 0 ? (
          <EmptyState hasFilter={Boolean(statusFilter)} />
        ) : (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-testid="prescriptions-grid"
            >
              {prescriptions.map((rx) => (
                <PrescriptionCard key={rx._id} prescription={rx} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                page={page}
                onPageChange={setPage}
              />
            )}
          </>
        )}

      </SectionContainer>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────

function Pagination({ pagination, page, onPageChange }) {
  return (
    <div
      className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200"
      data-testid="pagination"
    >
      <p className="text-sm text-neutral-500">
        Showing{' '}
        <strong className="text-neutral-700">
          {(page - 1) * pagination.limit + 1}–
          {Math.min(page * pagination.limit, pagination.total)}
        </strong>{' '}
        of <strong className="text-neutral-700">{pagination.total}</strong>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPrev}
          onClick={() => onPageChange((p) => p - 1)}
          leftIcon={<ChevronLeft size={14} />}
          data-testid="prev-page"
        >
          Prev
        </Button>
        <span className="text-sm text-neutral-600 px-2">
          {page} / {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNext}
          onClick={() => onPageChange((p) => p + 1)}
          rightIcon={<ChevronRight size={14} />}
          data-testid="next-page"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState({ hasFilter }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      data-testid="empty-state"
    >
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <FileText size={28} className="text-neutral-300" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 mb-2">
        {hasFilter ? 'No prescriptions found' : 'No prescriptions yet'}
      </h3>
      <p className="text-neutral-400 text-sm max-w-xs mb-6">
        {hasFilter
          ? 'Try a different status filter to see more results.'
          : 'Upload your first prescription to get started.'}
      </p>
      {!hasFilter && (
        <Button as={Link} to="/" variant="primary" size="sm" leftIcon={<Upload size={14} />}>
          Upload Prescription
        </Button>
      )}
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      data-testid="error-state"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 mb-2">Something went wrong</h3>
      <p className="text-neutral-400 text-sm max-w-xs mb-6">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />}>
        Try Again
      </Button>
    </div>
  )
}
