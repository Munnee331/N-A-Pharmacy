import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight, RefreshCw, AlertCircle, Download, Package, Clock, Loader2,
} from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import Button from '../components/ui/Button'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import usePageMeta from '../hooks/usePageMeta'
import { getMyOrders, downloadInvoice } from '../api/orderApi'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function statusLabel(status) {
  switch (status) {
    case 'pending_payment': return 'Pending Payment'
    case 'processing': return 'Processing'
    case 'shipped': return 'Shipped'
    case 'delivered': return 'Delivered'
    case 'cancelled': return 'Cancelled'
    default: return status || 'Unknown'
  }
}

function badgeClass(status) {
  switch (status) {
    case 'pending_payment': return 'bg-amber-100 text-amber-700'
    case 'processing': return 'bg-blue-100 text-blue-700'
    case 'shipped': return 'bg-indigo-100 text-indigo-700'
    case 'delivered': return 'bg-green-100 text-green-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    default: return 'bg-neutral-100 text-neutral-600'
  }
}

export default function OrdersPage() {
  usePageMeta('My Orders', 'View your pharmacy order history and download invoices.')

  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [page, setPage]             = useState(1)
  const [pagination, setPagination] = useState(null)
  const [downloadId, setDownloadId] = useState(null)
  const [downloadError, setDownloadError] = useState('')

  async function fetchOrders(pageNumber = 1) {
    setLoading(true)
    setError('')
    try {
      const result = await getMyOrders({ page: pageNumber, limit: 10 })
      setOrders(result.data || [])
      setPagination(result.pagination ?? null)
      setPage(pageNumber)
    } catch (err) {
      setError(err?.message || 'Failed to load orders. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1)
  }, [])

  async function handleDownload(orderId) {
    setDownloadId(orderId)
    setDownloadError('')
    try {
      await downloadInvoice(orderId)
    } catch (err) {
      setDownloadError(err?.message || 'Could not download invoice. Please try again.')
    } finally {
      setDownloadId(null)
    }
  }

  return (
    <SectionContainer py="lg">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-neutral-500">Order History</p>
            <h1 className="text-3xl font-bold text-neutral-900">My Orders</h1>
            <p className="text-sm text-neutral-500 mt-1">Review your recent pharmacy purchases and download invoices.</p>
          </div>
          <Button
            onClick={() => fetchOrders(page)}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {downloadError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {downloadError}
          </div>
        )}

        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-6">
              <LoadingSkeleton variant="table-row" count={4} />
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-3" />
              <p className="text-sm font-semibold text-neutral-900 mb-2">Unable to load orders</p>
              <p className="text-sm text-neutral-500 mb-4">{error}</p>
              <Button onClick={() => fetchOrders(page)} variant="outline" size="sm">Retry</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center">
              <Package size={36} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-sm text-neutral-500">You haven't placed any orders yet.</p>
              <Button as={Link} to="/shop" variant="outline" size="sm" className="mt-4">Browse Medicines</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
                  {orders.map((order) => (
                    <motion.tr key={order._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">{order.items?.length ?? 0}</td>
                      <td className="px-6 py-4">৳{Number(order.totalAmount ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize">{order.paymentStatus ?? 'unknown'}</td>
                      <td className="px-6 py-4">
                        {order.paymentStatus === 'paid' ? (
                          <Button
                            onClick={() => handleDownload(order._id)}
                            variant="outline"
                            size="xs"
                            className="inline-flex items-center gap-2"
                            disabled={downloadId === order._id}
                          >
                            {downloadId === order._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : <Download size={14} />}
                            Invoice
                          </Button>
                        ) : (
                          <span className="text-xs text-neutral-500">No invoice</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => fetchOrders(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => fetchOrders(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  )
}
