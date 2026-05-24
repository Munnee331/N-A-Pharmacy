import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag, FileText, Package, Clock,
  ChevronRight, RefreshCw, AlertCircle, Download, Loader2,
} from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import DashboardCard from '../components/ui/DashboardCard'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Button from '../components/ui/Button'
import usePageMeta from '../hooks/usePageMeta'
import { useAuth } from '../context/AuthContext'
import { getMyPrescriptions } from '../api/prescriptionApi'
import { getMyOrders, downloadInvoice } from '../api/orderApi'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item    = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

const STATUS_COLORS = {
  pending_payment: 'bg-amber-100 text-amber-700',
  processing:      'bg-blue-100 text-blue-700',
  shipped:         'bg-indigo-100 text-indigo-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-700',
}

const RX_STATUS_COLORS = {
  pending:      'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  usePageMeta('My Dashboard', 'Manage your orders and prescriptions.')
  const { user } = useAuth()

  const [orders, setOrders]               = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [dlLoadingId, setDlLoadingId]     = useState(null)   // orderId being downloaded
  const [dlError, setDlError]             = useState('')

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [ordersRes, rxRes] = await Promise.all([
        getMyOrders({ page: 1, limit: 5 }),
        getMyPrescriptions({ page: 1, limit: 5 }),
      ])
      setOrders(ordersRes?.data ?? [])
      setPrescriptions(rxRes?.prescriptions ?? [])
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleDownloadInvoice(orderId) {
    setDlLoadingId(orderId)
    setDlError('')
    try {
      await downloadInvoice(orderId)
    } catch (err) {
      setDlError(err?.message ?? 'Could not download invoice.')
    } finally {
      setDlLoadingId(null)
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────
  const totalOrders    = orders.length
  const activeOrders   = orders.filter((o) => ['processing', 'shipped'].includes(o.status)).length
  const totalRx        = prescriptions.length
  const pendingRx      = prescriptions.filter((r) => ['pending', 'under_review'].includes(r.status)).length

  const stats = [
    {
      title: 'Total Orders',
      value: loading ? '—' : String(totalOrders),
      icon: <ShoppingBag size={18} className="text-primary-600" />,
      trend: 'neutral', trendValue: 'All time', color: 'primary',
    },
    {
      title: 'Active Orders',
      value: loading ? '—' : String(activeOrders),
      icon: <Package size={18} className="text-secondary-600" />,
      trend: activeOrders > 0 ? 'up' : 'neutral',
      trendValue: activeOrders > 0 ? 'In progress' : 'None active',
      color: 'secondary',
    },
    {
      title: 'Prescriptions',
      value: loading ? '—' : String(totalRx),
      icon: <FileText size={18} className="text-primary-600" />,
      trend: 'neutral', trendValue: 'Submitted', color: 'primary',
    },
    {
      title: 'Pending Review',
      value: loading ? '—' : String(pendingRx),
      icon: <Clock size={18} className="text-amber-600" />,
      trend: pendingRx > 0 ? 'up' : 'neutral',
      trendValue: pendingRx > 0 ? 'Awaiting pharmacist' : 'All reviewed',
      color: 'warning',
    },
  ]

  return (
    <div data-testid="dashboard-page">
      <SectionContainer py="lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-1">
              {user ? `Welcome, ${user.name.split(' ')[0]}` : 'My Dashboard'}
            </h1>
            <p className="text-neutral-500 text-sm">Here's an overview of your account activity.</p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 rounded-2xl bg-red-50 border border-red-100">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats grid */}
        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
        >
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={item}>
              <DashboardCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-900">Recent Orders</h3>
              <Link to="/orders" className="text-xs text-primary-600 hover:text-primary-700 font-medium
                flex items-center gap-1 transition-colors">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {/* Invoice download error */}
            {dlError && (
              <div className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700">{dlError}</p>
              </div>
            )}

            {loading ? (
              <LoadingSkeleton variant="table-row" count={3} />
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={32} className="text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">No orders yet.</p>
                <Button as={Link} to="/shop" variant="outline" size="sm" className="mt-4">
                  Browse Shop
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => {
                  const oid        = order._id ?? order.id
                  const isPaid     = order.paymentStatus === 'paid'
                  const isDownloading = dlLoadingId === oid
                  return (
                    <div key={oid}
                      className="flex flex-col gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            #{String(oid).slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {order.date ?? new Date(order.createdAt).toLocaleDateString('en-BD')}
                            {Array.isArray(order.items)
                              ? ` · ${order.items.length} item${order.items.length !== 1 ? 's' : ''}`
                              : order.items ? ` · ${order.items} item${order.items !== 1 ? 's' : ''}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-900">
                            {order.total ?? `৳${order.totalAmount?.toLocaleString()}`}
                          </span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize
                            ${STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                            {(order.status ?? '').replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Invoice download — only for paid orders */}
                      {isPaid && (
                        <button
                          onClick={() => handleDownloadInvoice(oid)}
                          disabled={isDownloading}
                          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700
                                     font-medium self-start disabled:opacity-50 disabled:cursor-not-allowed
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1"
                        >
                          {isDownloading
                            ? <><Loader2 size={12} className="animate-spin" />Generating…</>
                            : <><Download size={12} />Download Invoice (PDF)</>
                          }
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Prescriptions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-neutral-900">My Prescriptions</h3>
              <Link to="/prescriptions" className="text-xs text-primary-600 hover:text-primary-700 font-medium
                flex items-center gap-1 transition-colors">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton variant="table-row" count={3} />
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={32} className="text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">No prescriptions submitted yet.</p>
                <Button as={Link} to="/upload-prescription" variant="outline" size="sm" className="mt-4">
                  Upload Prescription
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {prescriptions.map((rx) => (
                  <div key={rx._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        #{rx._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {new Date(rx.createdAt).toLocaleDateString('en-BD')}
                        {rx.notes ? ` · ${rx.notes.slice(0, 30)}…` : ''}
                      </p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize
                      ${RX_STATUS_COLORS[rx.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {(rx.status ?? '').replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Browse Medicines', to: '/shop',                icon: ShoppingBag, desc: 'Find and order medicines' },
            { label: 'Upload Prescription', to: '/upload-prescription', icon: FileText,    desc: 'Submit a new prescription' },
            { label: 'Prescription History', to: '/prescriptions',   icon: Clock,        desc: 'Track all submissions' },
          ].map(({ label, to, icon: Icon, desc }) => (
            <Link key={label} to={to}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-100
                         shadow-soft hover:shadow-soft-lg hover:border-primary-200 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0
                              group-hover:bg-primary-100 transition-colors">
                <Icon size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-neutral-400">{desc}</p>
              </div>
            </Link>
          ))}
        </motion.div>

      </SectionContainer>
    </div>
  )
}
