import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Download, AlertCircle, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'
import SectionContainer from '../components/ui/SectionContainer'
import usePageMeta from '../hooks/usePageMeta'
import { downloadInvoice } from '../api/orderApi'

export default function PaymentSuccessPage() {
  usePageMeta('Payment Successful', 'Your payment was completed successfully.')
  const [params]  = useSearchParams()
  const tranId    = params.get('tran_id')
  const orderId   = params.get('orderId')

  const [dlLoading, setDlLoading] = useState(false)
  const [dlError,   setDlError]   = useState('')

  async function handleDownload() {
    if (!orderId) { setDlError('Order ID not available.'); return }
    setDlLoading(true)
    setDlError('')
    try {
      await downloadInvoice(orderId)
    } catch (err) {
      setDlError(err?.message ?? 'Could not download invoice. Please try again.')
    } finally {
      setDlLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center">
      <SectionContainer py="lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto bg-white rounded-2xl border border-neutral-100 shadow-soft p-8 text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Payment Successful!</h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            Your payment has been confirmed. Our pharmacist will review and dispatch your order shortly.
          </p>

          {/* Transaction details */}
          {(tranId || orderId) && (
            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100 text-left space-y-2">
              {tranId && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Transaction ID</span>
                  <span className="font-mono font-semibold text-neutral-800 text-xs">{tranId}</span>
                </div>
              )}
              {orderId && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Order ID</span>
                  <span className="font-mono font-semibold text-neutral-800 text-xs">
                    #{orderId.slice(-8).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Download error */}
          {dlError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-left"
            >
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{dlError}</p>
            </motion.div>
          )}

          <div className="flex flex-col gap-3">
            {/* Invoice download — only shown when orderId is available */}
            {orderId && (
              <Button
                onClick={handleDownload}
                variant="outline"
                size="md"
                disabled={dlLoading}
                className="w-full"
              >
                {dlLoading
                  ? <><Loader2 size={15} className="mr-2 animate-spin" />Generating Invoice…</>
                  : <><Download size={15} className="mr-2" />Download Invoice (PDF)</>
                }
              </Button>
            )}

            <Button as={Link} to="/dashboard" size="md" className="w-full">
              <Package size={16} className="mr-2" />
              Track My Order
            </Button>
            <Button as={Link} to="/shop" variant="outline" size="sm" className="w-full">
              Continue Shopping
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        </motion.div>
      </SectionContainer>
    </div>
  )
}
