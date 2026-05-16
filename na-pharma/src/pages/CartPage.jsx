import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Plus, Minus, Trash2, Tag, Package,
  ChevronRight, ArrowRight, ShieldCheck, Truck, FileText, AlertCircle,
} from 'lucide-react'
import { cn } from '../utils/cn'
import Button from '../components/ui/Button'
import SectionContainer from '../components/ui/SectionContainer'
import usePageMeta from '../hooks/usePageMeta'
import { useCart } from '../context/CartContext'
import { VALID_COUPONS, DELIVERY_OPTIONS } from '../data/cartData'

const CATEGORY_COLORS = {
  Tablet:  'bg-primary-100 text-primary-600',
  Capsule: 'bg-secondary-100 text-secondary-600',
  Syrup:   'bg-green-100 text-green-600',
}

function SummaryRow({ label, value, valueClass = '', bold = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-neutral-500', bold && 'font-semibold text-neutral-900')}>{label}</span>
      <span className={cn('font-medium text-neutral-900', valueClass, bold && 'font-bold text-base')}>{value}</span>
    </div>
  )
}

export default function CartPage() {
  usePageMeta('Cart', 'Review your cart and proceed to checkout.')
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity } = useCart()
  const cartItems = items

  const [couponCode, setCouponCode]       = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError]     = useState('')
  const [delivery, setDelivery]           = useState('standard')

  const subtotal     = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const savings      = cartItems.reduce((s, i) => s + ((i.originalPrice || i.price) - i.price) * i.quantity, 0)
  const discountAmt  = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount) : 0
  const deliveryFee  = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.fee ?? 60
  const effectiveFee = subtotal >= 500 && delivery === 'free' ? 0 : deliveryFee
  const total        = subtotal - discountAmt + effectiveFee
  const hasPrescription = cartItems.some((i) => i.requiresPrescription)

  function updateQty(id, delta) {
    const item = cartItems.find((i) => i.id === id)
    if (!item) return
    const newQty = Math.max(1, item.quantity + delta)
    updateQuantity(id, newQty)
  }
  function removeItem2(id) { removeItem(id) }
  function applyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (!code) { setCouponError('Enter a coupon code.'); return }
    const found = VALID_COUPONS[code]
    if (!found) { setCouponError('Invalid coupon code.'); setAppliedCoupon(null); return }
    setAppliedCoupon({ code, ...found }); setCouponError('')
  }
  function removeCoupon() { setAppliedCoupon(null); setCouponCode(''); setCouponError('') }

  if (cartItems.length === 0) {
    return (
      <div data-testid="cart-page" className="min-h-screen bg-neutral-50">
        <SectionContainer py="xl" as="div">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-6">
              <ShoppingCart size={32} className="text-neutral-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
            <p className="text-neutral-500 max-w-sm mb-8">Browse our catalogue to get started.</p>
            <Button as={Link} to="/shop" size="lg" rightIcon={<ArrowRight size={18} />}>Browse Shop</Button>
          </motion.div>
        </SectionContainer>
      </div>
    )
  }

  return (
    <div data-testid="cart-page" className="min-h-screen bg-neutral-50">
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-b border-neutral-100">
        <SectionContainer py="md" as="div">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-neutral-900 font-medium">Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-1">Your Cart</h1>
              <p className="text-neutral-500 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
            </div>
            <Button as={Link} to="/shop" variant="outline" size="sm" leftIcon={<ArrowRight size={14} className="rotate-180" />}>
              Continue Shopping
            </Button>
          </div>
        </SectionContainer>
      </section>

      <SectionContainer py="md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {hasPrescription && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Prescription required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Some items require a valid prescription.{' '}
                    <Link to="/upload-prescription" className="underline font-medium">Upload now</Link>
                  </p>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }} transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100
                                    flex items-center justify-center flex-shrink-0 border border-neutral-100">
                      <Package size={20} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full',
                              CATEGORY_COLORS[item.category] || 'bg-neutral-100 text-neutral-600')}>
                              {item.category}
                            </span>
                            {item.requiresPrescription && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                                               text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <FileText size={9} />Rx Required
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{item.name}</h3>
                          <p className="text-xs text-neutral-400 mt-0.5">{item.brand}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                                     text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all
                                     focus:outline-none focus:ring-2 focus:ring-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-neutral-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                          {item.originalPrice && <span className="text-xs text-neutral-400 line-through">৳{(item.originalPrice * item.quantity).toLocaleString()}</span>}
                          <span className="text-xs text-neutral-400">(৳{item.price} each)</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 rounded-xl border border-neutral-200 p-1">
                          <button onClick={() => updateQty(item.id, -1)} disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600
                                       hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed
                                       transition-all focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-neutral-900">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} aria-label="Increase quantity"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-600
                                       hover:bg-white hover:shadow-sm transition-all
                                       focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Delivery options */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-5">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Truck size={15} className="text-primary-600" />Delivery Options
              </h3>
              <div className="flex flex-col gap-2">
                {DELIVERY_OPTIONS.map((opt) => {
                  const isDisabled = opt.id === 'free' && subtotal < (opt.minOrder || 0)
                  return (
                    <label key={opt.id} className={cn(
                      'flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
                      delivery === opt.id ? 'border-primary-400 bg-primary-50'
                        : isDisabled ? 'border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed'
                        : 'border-neutral-200 hover:border-primary-300')}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id}
                          disabled={isDisabled} onChange={() => setDelivery(opt.id)}
                          className="text-primary-600 focus:ring-primary-500" />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{opt.label}</p>
                          <p className="text-xs text-neutral-400">{opt.eta}</p>
                        </div>
                      </div>
                      <span className={cn('text-sm font-semibold flex-shrink-0', opt.fee === 0 ? 'text-green-600' : 'text-neutral-700')}>
                        {opt.fee === 0 ? 'FREE' : `৳${opt.fee}`}
                      </span>
                    </label>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Order summary */}
          <div className="flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6 sticky top-24">
              <h3 className="text-base font-semibold text-neutral-900 mb-5">Order Summary</h3>
              <div className="flex flex-col gap-3 text-sm mb-5">
                <SummaryRow label="Subtotal" value={`৳${subtotal.toLocaleString()}`} />
                {savings > 0 && <SummaryRow label="Product savings" value={`-৳${savings.toLocaleString()}`} valueClass="text-green-600" />}
                {appliedCoupon && <SummaryRow label={`Coupon (${appliedCoupon.code})`} value={`-৳${discountAmt.toLocaleString()}`} valueClass="text-green-600" />}
                <SummaryRow label="Delivery" value={effectiveFee === 0 ? 'FREE' : `৳${effectiveFee}`} valueClass={effectiveFee === 0 ? 'text-green-600' : ''} />
                <div className="border-t border-neutral-100 pt-3">
                  <SummaryRow label="Total" value={`৳${total.toLocaleString()}`} bold />
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-xs font-medium text-neutral-600 mb-2 flex items-center gap-1.5"><Tag size={12} />Coupon Code</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                    <div>
                      <p className="text-xs font-bold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-green-600">{appliedCoupon.label}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-green-600 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="e.g. HEALTH10" aria-label="Coupon code"
                      className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                    <Button onClick={applyCoupon} variant="outline" size="sm">Apply</Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-600 mt-1.5">{couponError}</p>}
                <p className="text-[10px] text-neutral-400 mt-1.5">Try: HEALTH10, PHARMA20, WELCOME15</p>
              </div>

              <Button onClick={() => navigate('/checkout')} size="lg" className="w-full" rightIcon={<ArrowRight size={18} />}>
                Proceed to Checkout
              </Button>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-neutral-100">
                {[{ icon: ShieldCheck, label: 'Secure' }, { icon: Truck, label: 'Fast Delivery' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Icon size={12} className="text-primary-500" />{label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
