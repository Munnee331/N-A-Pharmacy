import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ban, RefreshCw, ShoppingCart } from 'lucide-react'
import Button from '../components/ui/Button'
import SectionContainer from '../components/ui/SectionContainer'
import usePageMeta from '../hooks/usePageMeta'

export default function PaymentCancelPage() {
  usePageMeta('Payment Cancelled', 'Your payment was cancelled.')
  const [params] = useSearchParams()
  const tranId   = params.get('tran_id')

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
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Ban size={40} className="text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Payment Cancelled</h1>
          <p className="text-neutral-500 text-sm leading-relaxed mb-6">
            You cancelled the payment. Your cart is still saved — you can complete your order whenever you're ready.
          </p>

          {tranId && (
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Transaction ID</span>
                <span className="font-mono font-semibold text-neutral-800 text-xs">{tranId}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button as={Link} to="/checkout" size="md" className="w-full">
              <RefreshCw size={16} className="mr-2" />
              Return to Checkout
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
