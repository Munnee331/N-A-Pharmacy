import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, RefreshCw, ShoppingCart } from 'lucide-react'
import Button from '../components/ui/Button'
import SectionContainer from '../components/ui/SectionContainer'
import usePageMeta from '../hooks/usePageMeta'

const REASON_MESSAGES = {
  validation_failed: 'The payment could not be verified. Please try again.',
  missing_tran_id:   'An unexpected error occurred with the transaction.',
  order_not_found:   'We could not locate your order. Please contact support.',
}

export default function PaymentFailPage() {
  usePageMeta('Payment Failed', 'Your payment was not completed.')
  const [params] = useSearchParams()
  const tranId   = params.get('tran_id')
  const reason   = params.get('reason')

  const message = REASON_MESSAGES[reason] ?? 'Your payment was not completed. Please try again.'

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
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Payment Failed</h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">{message}</p>

          {tranId && (
            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Transaction ID</span>
                <span className="font-mono font-semibold text-neutral-800 text-xs">{tranId}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button as={Link} to="/checkout" size="md" className="w-full">
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
            <Button as={Link} to="/cart" variant="outline" size="sm" className="w-full">
              <ShoppingCart size={14} className="mr-2" />
              Back to Cart
            </Button>
          </div>
        </motion.div>
      </SectionContainer>
    </div>
  )
}
