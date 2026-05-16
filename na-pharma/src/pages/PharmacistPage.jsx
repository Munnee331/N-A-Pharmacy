import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
} from 'lucide-react'
import Button from '../components/ui/Button'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Input from '../components/ui/Input'
import usePageMeta from '../hooks/usePageMeta'
import { useAuth } from '../context/AuthContext'
import showToast from '../utils/toast'
import {
  getPendingPrescriptions,
  startReview,
  approvePrescription,
  rejectPrescription,
} from '../api/prescriptionApi'
import { getMedicines } from '../api/medicineApi'

// ── Status config ─────────────────────────────────────────────────────────

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Eye,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
}

const FILTER_TABS = [
  { key: 'all',          label: 'All',          testId: 'filter-all' },
  { key: 'pending',      label: 'Pending',       testId: 'filter-pending' },
  { key: 'under_review', label: 'Under Review',  testId: 'filter-under_review' },
  { key: 'approved',     label: 'Approved',      testId: 'filter-approved' },
  { key: 'rejected',     label: 'Rejected',      testId: 'filter-rejected' },
]

// ── Helpers ───────────────────────────────────────────────────────────────

function buildImageUrl(imageUrl) {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  return `http://localhost:5000${imageUrl}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function PharmacistPage() {
  usePageMeta('Pharmacist Dashboard', 'Review and approve prescription submissions')
  const { user } = useAuth()

  const [prescriptions, setPrescriptions] = useState([])
  const [stats, setStats]                 = useState({ pending: 0, under_review: 0, approved: 0, rejected: 0 })
  const [isLoading, setLoading]           = useState(true)
  const [error, setError]                 = useState(null)
  const [activeFilter, setActiveFilter]   = useState('all')

  // Modal state
  const [approveTarget, setApproveTarget] = useState(null) // prescription object
  const [rejectTarget, setRejectTarget]   = useState(null) // prescription object

  // ── Fetch ───────────────────────────────────────────────────────────────

  const fetchPrescriptions = useCallback(async (status = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const params = status === 'all' ? {} : { status }
      const { prescriptions: list } = await getPendingPrescriptions(params)
      setPrescriptions(list)

      // Derive stats from a separate "all" call only when viewing all
      if (status === 'all') {
        const counts = { pending: 0, under_review: 0, approved: 0, rejected: 0 }
        list.forEach((p) => {
          if (counts[p.status] !== undefined) counts[p.status]++
        })
        setStats(counts)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrescriptions(activeFilter)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter change ────────────────────────────────────────────────────────

  function handleFilterChange(key) {
    setActiveFilter(key)
    fetchPrescriptions(key)
  }

  // ── Start Review ─────────────────────────────────────────────────────────

  async function handleStartReview(id) {
    try {
      await startReview(id)
      showToast.success('Review started')
      fetchPrescriptions(activeFilter)
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to start review')
    }
  }

  // ── Approve / Reject callbacks ────────────────────────────────────────────

  function handleApproveSuccess() {
    setApproveTarget(null)
    fetchPrescriptions(activeFilter)
    showToast.success('Prescription approved successfully')
  }

  function handleRejectSuccess() {
    setRejectTarget(null)
    fetchPrescriptions(activeFilter)
    showToast.error('Prescription rejected')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div data-testid="pharmacist-page" className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Pharmacist Dashboard</h1>
              <p className="text-neutral-500 text-sm mt-1">
                Welcome back, {user?.name?.split(' ')[0]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Calendar size={16} />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid="refresh-btn"
                leftIcon={<RefreshCw size={14} />}
                onClick={() => fetchPrescriptions(activeFilter)}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending"      value={stats.pending}      icon={Clock}         color="amber"  testId="stat-pending" />
          <StatCard label="Under Review" value={stats.under_review} icon={Eye}           color="blue"   testId="stat-under_review" />
          <StatCard label="Approved"     value={stats.approved}     icon={CheckCircle}   color="green"  testId="stat-approved" />
          <StatCard label="Rejected"     value={stats.rejected}     icon={XCircle}       color="red"    testId="stat-rejected" />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              data-testid={tab.testId}
              onClick={() => handleFilterChange(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div data-testid="skeleton-loading" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : error ? (
          <div
            data-testid="error-state"
            className="bg-white rounded-2xl border border-neutral-200 p-12 text-center"
          >
            <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <p className="text-neutral-700 font-medium mb-1">Something went wrong</p>
            <p className="text-neutral-500 text-sm mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPrescriptions(activeFilter)}
            >
              Retry
            </Button>
          </div>
        ) : prescriptions.length === 0 ? (
          <div
            data-testid="empty-state"
            className="bg-white rounded-2xl border border-neutral-200 p-12 text-center"
          >
            <ClipboardList size={40} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No prescriptions found.</p>
          </div>
        ) : (
          <div data-testid="prescriptions-list" className="space-y-4">
            {prescriptions.map((rx) => (
              <PrescriptionCard
                key={rx._id}
                prescription={rx}
                onStartReview={handleStartReview}
                onApprove={() => setApproveTarget(rx)}
                onReject={() => setRejectTarget(rx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <AnimatePresence>
        {approveTarget && (
          <ApproveModal
            prescription={approveTarget}
            onClose={() => setApproveTarget(null)}
            onSuccess={handleApproveSuccess}
          />
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            prescription={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onSuccess={handleRejectSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, testId }) {
  const colorMap = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue:  'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red:   'bg-red-50 text-red-600 border-red-100',
  }

  return (
    <motion.div
      data-testid={testId}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500 mt-1">{label}</p>
    </motion.div>
  )
}

// ── PrescriptionCard ──────────────────────────────────────────────────────

function PrescriptionCard({ prescription, onStartReview, onApprove, onReject }) {
  const { _id, imageUrl, status, notes, createdAt } = prescription
  const customerName = prescription.customer?.name || 'Unknown'
  const pharmacistName = prescription.pharmacist?.name || null
  const config = statusConfig[status] || statusConfig.pending
  const StatusIcon = config.icon
  const imgSrc = buildImageUrl(imageUrl)

  return (
    <motion.div
      data-testid="prescription-card"
      whileHover={{ y: -1 }}
      className="bg-white rounded-2xl border border-neutral-200 shadow-soft p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Image / placeholder */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Prescription"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText size={24} className="text-neutral-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
            >
              <StatusIcon size={11} />
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
            <span className="flex items-center gap-1">
              <User size={13} className="text-neutral-400" />
              {customerName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-neutral-400" />
              {formatDate(createdAt)}
            </span>
          </div>

          {pharmacistName && (
            <p className="text-xs text-neutral-400 mt-1">
              Assigned to: {pharmacistName}
            </p>
          )}

          {notes && (
            <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-800">
                <strong>Patient note:</strong> {notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {status === 'pending' && (
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-neutral-100">
          <Button
            variant="primary"
            size="sm"
            data-testid="start-review-btn"
            leftIcon={<Eye size={14} />}
            onClick={() => onStartReview(_id)}
          >
            Start Review
          </Button>
        </div>
      )}

      {status === 'under_review' && (
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-neutral-100">
          <Button
            variant="primary"
            size="sm"
            data-testid="approve-btn"
            leftIcon={<CheckCircle size={14} />}
            onClick={onApprove}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            data-testid="reject-btn"
            leftIcon={<XCircle size={14} />}
            onClick={onReject}
          >
            Reject
          </Button>
        </div>
      )}

      {(status === 'approved' || status === 'rejected') && (
        <div className="pt-4 mt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 italic">
            {status === 'approved' ? 'This prescription has been approved.' : 'This prescription has been rejected.'}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ── ApproveModal ──────────────────────────────────────────────────────────

function ApproveModal({ prescription, onClose, onSuccess }) {
  const [searchQuery, setSearchQuery]           = useState('')
  const [searchResults, setSearchResults]       = useState([])
  const [isSearching, setIsSearching]           = useState(false)
  const [recommendedMeds, setRecommendedMeds]   = useState([])
  const [isSubmitting, setIsSubmitting]         = useState(false)
  const [validationError, setValidationError]   = useState('')
  const debounceRef = useRef(null)

  // Debounced medicine search
  function handleSearchChange(e) {
    const q = e.target.value
    setSearchQuery(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q.trim()) {
      setSearchResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { medicines } = await getMedicines({ search: q })
        setSearchResults(medicines || [])
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  function addMedicine(medicine) {
    // Avoid duplicates
    if (recommendedMeds.find((m) => m.medicine === medicine._id)) return
    setRecommendedMeds((prev) => [
      ...prev,
      {
        medicine:           medicine._id,
        medicineName:       medicine.name,
        quantity:           1,
        dosageInstructions: '',
      },
    ])
    setSearchQuery('')
    setSearchResults([])
    setValidationError('')
  }

  function removeMedicine(medicineId) {
    setRecommendedMeds((prev) => prev.filter((m) => m.medicine !== medicineId))
  }

  function updateMed(medicineId, field, value) {
    setRecommendedMeds((prev) =>
      prev.map((m) => (m.medicine === medicineId ? { ...m, [field]: value } : m))
    )
  }

  async function handleSubmit() {
    if (recommendedMeds.length === 0) {
      setValidationError('Please add at least one medicine.')
      return
    }

    // Validate quantities
    for (const med of recommendedMeds) {
      const qty = Number(med.quantity)
      if (!qty || qty < 1 || qty > 999) {
        setValidationError(`Quantity for "${med.medicineName}" must be between 1 and 999.`)
        return
      }
    }

    setValidationError('')
    setIsSubmitting(true)
    try {
      const payload = recommendedMeds.map(({ medicine, quantity, dosageInstructions }) => ({
        medicine,
        quantity: Number(quantity),
        dosageInstructions,
      }))
      await approvePrescription(prescription._id, payload)
      onSuccess()
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to approve prescription')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        data-testid="approve-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-1">Approve Prescription</h2>
          <p className="text-sm text-neutral-500 mb-5">
            Add recommended medicines for the patient.
          </p>

          {/* Medicine search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Search Medicines
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                data-testid="medicine-search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Type medicine name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Search results */}
            {(searchResults.length > 0 || isSearching) && (
              <ul
                data-testid="medicine-search-results"
                className="mt-1 border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
              >
                {isSearching ? (
                  <li className="px-4 py-3 text-sm text-neutral-400">Searching…</li>
                ) : (
                  searchResults.map((med) => (
                    <li
                      key={med._id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{med.name}</p>
                        {med.brand && (
                          <p className="text-xs text-neutral-400">{med.brand}</p>
                        )}
                      </div>
                      <button
                        data-testid="add-medicine-btn"
                        onClick={() => addMedicine(med)}
                        className="ml-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 text-xs font-medium hover:bg-primary-100 transition-colors"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Recommended medicines list */}
          {recommendedMeds.length > 0 && (
            <div className="mb-4 space-y-3">
              <p className="text-sm font-medium text-neutral-700">Recommended Medicines</p>
              {recommendedMeds.map((med) => (
                <div
                  key={med.medicine}
                  data-testid="recommended-medicine-item"
                  className="bg-neutral-50 rounded-xl border border-neutral-200 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-neutral-800">{med.medicineName}</p>
                    <button
                      data-testid="remove-medicine-btn"
                      onClick={() => removeMedicine(med.medicine)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Quantity</label>
                      <input
                        data-testid="medicine-quantity-input"
                        type="number"
                        min={1}
                        max={999}
                        value={med.quantity}
                        onChange={(e) => updateMed(med.medicine, 'quantity', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Dosage Instructions</label>
                      <input
                        type="text"
                        value={med.dosageInstructions}
                        onChange={(e) => updateMed(med.medicine, 'dosageInstructions', e.target.value)}
                        placeholder="e.g. Twice daily"
                        className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <p className="text-sm text-red-600 mb-3" role="alert">{validationError}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              data-testid="submit-approve-btn"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              Approve Prescription
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── RejectModal ───────────────────────────────────────────────────────────

function RejectModal({ prescription, onClose, onSuccess }) {
  const [reason, setReason]               = useState('')
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [validationError, setValidationError] = useState('')

  async function handleSubmit() {
    if (!reason.trim()) {
      setValidationError('Rejection reason is required.')
      return
    }
    setValidationError('')
    setIsSubmitting(true)
    try {
      await rejectPrescription(prescription._id, reason.trim())
      onSuccess()
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to reject prescription')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        data-testid="reject-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-1">Reject Prescription</h2>
          <p className="text-sm text-neutral-500 mb-5">
            Please provide a reason for rejecting this prescription.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              data-testid="reject-reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Explain why this prescription is being rejected..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-neutral-400 mt-1 text-right">{reason.length}/500</p>
          </div>

          {/* Validation error */}
          {validationError && (
            <p className="text-sm text-red-600 mb-3" role="alert">{validationError}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              data-testid="submit-reject-btn"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              Reject Prescription
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
