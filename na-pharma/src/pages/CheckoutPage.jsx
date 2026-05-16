import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronRight, ShieldCheck, Truck, Clock, Package,
  MapPin, Phone, Mail, User, FileText, CheckCircle,
  AlertCircle, CreditCard, Smartphone, Banknote, ExternalLink,
  Lock, Loader2,
} from 'lucide-react'
import { cn } from '../utils/cn'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import SectionContainer from '../components/ui/SectionContainer'
import Modal from '../components/ui/Modal'
import usePageMeta from '../hooks/usePageMeta'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { PAYMENT_METHODS } from '../data/cartData'

// ── Validation ────────────────────────────────────────────────────────────
function validate(fields) {
  const errors = {}
  if (!fields.fullName.trim())   errors.fullName   = 'Full name is required.'
  if (!fields.email.trim())      errors.email      = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = 'Enter a valid email.'
  if (!fields.phone.trim())      errors.phone      = 'Phone number is required.'
  if (!fields.address.trim())    errors.address    = 'Delivery address is required.'
  if (!fields.city.trim())       errors.city       = 'City is required.'
  if (!fields.postalCode.trim()) errors.postalCode = 'Postal code is required.'
  return errors
}

const PAYMENT_ICONS = { bkash: Smartphone, nagad: Smartphone, card: CreditCard, cod: Banknote }

// SSLCommerz handles bKash, Nagad, card, etc. — these are the non-COD methods
const ONLINE_PAYMENT_IDS = new Set(['bkash', 'nagad', 'card'])

const TIMELINE = [
  { icon: CheckCircle, label: 'Order Placed',        sub: 'Immediately' },
  { icon: ShieldCheck, label: 'Pharmacist Review',   sub: '~30 minutes' },
  { icon: Package,     label: 'Packed & Dispatched', sub: '1–2 hours' },
  { icon: Truck,       label: 'Out for Delivery',    sub: 'Same day' },
  { icon: MapPin,      label: 'Delivered',            sub: 'By evening' },
]

const stagger      = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fieldVariant = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function CheckoutPage() {
  usePageMeta('Checkout', 'Complete your pharmacy order securely.')

  // ── State ─────────────────────────────────────────────────────────────
  const [fields, setFields] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', postalCode: '',
    paymentMethod: 'cod', orderNotes: '',
  })
  const [errors, setErrors]           = useState({})
  const [isLoading, setLoading]       = useState(false)
  const [sslLoading, setSslLoading]   = useState(false)
  const [sslError, setSslError]       = useState('')
  const [showSuccess, setSuccess]     = useState(false)
  const [orderId, setOrderId]         = useState('')
  // Demo payment gateway modal
  const [showGateway, setShowGateway] = useState(false)
  const [gatewayStep, setGatewayStep] = useState('select') // 'select' | 'form' | 'processing' | 'done'
  const [demoOrderId, setDemoOrderId] = useState('')

  // ── Data sources ──────────────────────────────────────────────────────
  const { items: cartItems, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const delivery = 60
  const total    = totalPrice + delivery
  const hasPrescription = cartItems.some((i) => i.requiresPrescription)

  // Pre-fill form from auth user on first render
  useEffect(() => {
    if (user) {
      setFields((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name  || '',
        email:    prev.email    || user.email || '',
        phone:    prev.phone    || user.phone || '',
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  // ── Helpers ───────────────────────────────────────────────────────────
  function handleChange(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
    if (sslError)    setSslError('')
  }

  function getValidatedFields() {
    const errs = validate(fields)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return null
    }
    return fields
  }

  // ── COD submit ────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault()
    if (!getValidatedFields()) return
    if (cartItems.length === 0) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOrderId(`ORD-${Math.floor(Math.random() * 9000) + 1000}`)
      setSuccess(true)
      clearCart()
    }, 1800)
  }

  // ── Online payment — open demo gateway modal ──────────────────────────
  function handleSSLPayment(e) {
    e.preventDefault()
    setSslError('')
    if (!getValidatedFields()) return
    if (cartItems.length === 0) { setSslError('Your cart is empty.'); return }
    const id = `TXN-${Date.now().toString(36).toUpperCase()}`
    setDemoOrderId(id)
    setGatewayStep('select')
    setShowGateway(true)
  }

  // Called when user confirms payment inside the demo gateway
  function handleDemoPaymentConfirm() {
    setGatewayStep('processing')
    setTimeout(() => {
      setGatewayStep('done')
      clearCart()
    }, 2200)
  }

  const isOnlinePayment = ONLINE_PAYMENT_IDS.has(fields.paymentMethod)

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div data-testid="checkout-page" className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-b border-neutral-100">
        <SectionContainer py="md" as="div">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <Link to="/cart" className="hover:text-primary-600 transition-colors">Cart</Link>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-neutral-900 font-medium">Checkout</span>
          </nav>
          <h1 className="text-4xl font-bold text-neutral-900 mb-1">Checkout</h1>
          <p className="text-neutral-500 text-sm">Complete your order details below.</p>
        </SectionContainer>
      </section>

      <SectionContainer py="md">
        {/* Empty cart guard */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Package size={48} className="text-neutral-300" />
            <p className="text-neutral-500 text-lg font-medium">Your cart is empty.</p>
            <Button as={Link} to="/shop" variant="outline" size="md">Browse Medicines</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT ── */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="lg:col-span-2 flex flex-col gap-6">
              {hasPrescription && (
                <motion.div variants={fieldVariant}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Prescription verification required</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Your order contains prescription medicines.{' '}
                      <Link to="/upload-prescription" className="underline font-medium">Upload prescription</Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Address */}
              <motion.div variants={fieldVariant} className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
                <h2 className="text-base font-semibold text-neutral-900 mb-5 flex items-center gap-2">
                  <MapPin size={16} className="text-primary-600" />Delivery Address
                </h2>
                <div className="flex flex-col gap-4">
                  <Input label="Full Name" id="co-fullname" placeholder="Fatima Rahman"
                    value={fields.fullName} onChange={(e) => handleChange('fullName', e.target.value)}
                    error={errors.fullName} leftIcon={<User size={16} />} autoComplete="name" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Email Address" id="co-email" type="email" placeholder="you@example.com"
                      value={fields.email} onChange={(e) => handleChange('email', e.target.value)}
                      error={errors.email} leftIcon={<Mail size={16} />} autoComplete="email" />
                    <Input label="Phone Number" id="co-phone" type="tel" placeholder="01700-000000"
                      value={fields.phone} onChange={(e) => handleChange('phone', e.target.value)}
                      error={errors.phone} leftIcon={<Phone size={16} />} autoComplete="tel" />
                  </div>
                  <Input label="Street Address" id="co-address" placeholder="House 12, Road 5, Block C"
                    value={fields.address} onChange={(e) => handleChange('address', e.target.value)}
                    error={errors.address} leftIcon={<MapPin size={16} />} autoComplete="street-address" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="City" id="co-city" placeholder="Dhaka"
                      value={fields.city} onChange={(e) => handleChange('city', e.target.value)}
                      error={errors.city} autoComplete="address-level2" />
                    <Input label="Postal Code" id="co-postal" placeholder="1207"
                      value={fields.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)}
                      error={errors.postalCode} autoComplete="postal-code" />
                  </div>
                </div>
              </motion.div>

              {/* Payment method */}
              <motion.div variants={fieldVariant} className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
                <h2 className="text-base font-semibold text-neutral-900 mb-5 flex items-center gap-2">
                  <CreditCard size={16} className="text-primary-600" />Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon       = PAYMENT_ICONS[method.id] || CreditCard
                    const isSelected = fields.paymentMethod === method.id
                    return (
                      <label key={method.id} className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150',
                        isSelected
                          ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-400'
                          : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50')}>
                        <input type="radio" name="payment" value={method.id} checked={isSelected}
                          onChange={() => handleChange('paymentMethod', method.id)}
                          className="text-primary-600 focus:ring-primary-500" />
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                          isSelected ? 'bg-primary-100' : 'bg-neutral-100')}>
                          <Icon size={16} className={isSelected ? 'text-primary-600' : 'text-neutral-500'} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn('text-sm font-semibold leading-tight',
                            isSelected ? 'text-primary-700' : 'text-neutral-800')}>
                            {method.label}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5 leading-tight">{method.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* SSLCommerz notice for online methods */}
                <AnimatePresence>
                  {isOnlinePayment && (
                    <motion.div
                      key="ssl-notice"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <ShieldCheck size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                          You'll be redirected to the <strong>SSLCommerz</strong> secure payment gateway to complete your payment.
                          Your card details are never stored on our servers.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Notes */}
              <motion.div variants={fieldVariant} className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
                <h2 className="text-base font-semibold text-neutral-900 mb-1 flex items-center gap-2">
                  <FileText size={16} className="text-primary-600" />Order Notes
                  <span className="text-neutral-400 font-normal text-sm">(optional)</span>
                </h2>
                <p className="text-xs text-neutral-400 mb-3">Special delivery instructions or notes for the pharmacist.</p>
                <textarea value={fields.orderNotes} onChange={(e) => handleChange('orderNotes', e.target.value)}
                  rows={3} placeholder="e.g. Please ring the bell twice." aria-label="Order notes"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900
                             placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2
                             focus:ring-primary-500 focus:border-primary-500 transition-all" />
              </motion.div>

              {/* Timeline */}
              <motion.div variants={fieldVariant} className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6">
                <h2 className="text-base font-semibold text-neutral-900 mb-5 flex items-center gap-2">
                  <Clock size={16} className="text-primary-600" />Delivery Timeline
                </h2>
                <ol className="flex flex-col gap-0">
                  {TIMELINE.map((step, i) => (
                    <li key={step.label} className="flex items-start gap-4 pb-5 last:pb-0">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center',
                          i === 0 ? 'bg-primary-600' : 'bg-primary-100')}>
                          <step.icon size={14} className={i === 0 ? 'text-white' : 'text-primary-500'} />
                        </div>
                        {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-primary-100 mt-1 min-h-[20px]" />}
                      </div>
                      <div className="pt-1">
                        <p className={cn('text-sm font-semibold', i === 0 ? 'text-primary-700' : 'text-neutral-700')}>{step.label}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{step.sub}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </motion.div>
            </motion.div>

            {/* ── RIGHT — summary ── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col gap-5"
            >
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6 sticky top-24">
                <h3 className="text-base font-semibold text-neutral-900 mb-5">Order Summary</h3>

                {/* Cart items */}
                <div className="flex flex-col gap-3 mb-5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                          : <Package size={14} className="text-primary-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 leading-snug line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 flex-shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2.5 text-sm border-t border-neutral-100 pt-4 mb-5">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-neutral-900">৳{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Delivery</span>
                    <span className="font-medium text-neutral-900">৳{delivery}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 pt-2.5 font-semibold text-neutral-900">
                    <span>Total</span>
                    <span className="text-lg">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* SSLCommerz error */}
                <AnimatePresence>
                  {sslError && (
                    <motion.div
                      key="ssl-error"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-100"
                      role="alert"
                    >
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 leading-relaxed">{sslError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  {isOnlinePayment ? (
                    /* ── Demo SSLCommerz payment button ── */
                    <Button
                      onClick={handleSSLPayment}
                      size="lg"
                      disabled={isLoading}
                      className="w-full"
                      aria-label="Pay online with SSLCommerz"
                    >
                      <ExternalLink size={15} className="mr-2 flex-shrink-0" />
                      Pay Online with SSLCommerz
                    </Button>
                  ) : (
                    /* ── COD / existing flow ── */
                    <Button
                      onClick={handleSubmit}
                      size="lg"
                      isLoading={isLoading}
                      disabled={isLoading || sslLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Placing Order…' : 'Place Order'}
                    </Button>
                  )}
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-neutral-100">
                  {[
                    { icon: ShieldCheck, label: 'Secure' },
                    { icon: Truck,       label: 'Fast Delivery' },
                    { icon: Clock,       label: '30-min review' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <Icon size={11} className="text-primary-500" />{label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </SectionContainer>

      {/* COD success modal */}
      <Modal isOpen={showSuccess} onClose={() => setSuccess(false)} title="" size="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center gap-4 py-2"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Order Placed!</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Your order has been received. Our pharmacist will review and dispatch it shortly.
            </p>
          </div>
          <div className="bg-primary-50 rounded-xl p-3 w-full border border-primary-100">
            <p className="text-xs text-primary-600 font-medium">Order ID</p>
            <p className="text-base font-bold text-primary-700 font-mono">{orderId}</p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button as={Link} to="/dashboard" size="md" className="w-full" onClick={() => setSuccess(false)}>
              Track Order
            </Button>
            <Button as={Link} to="/shop" variant="outline" size="sm" className="w-full" onClick={() => setSuccess(false)}>
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </Modal>

      {/* ── Demo SSLCommerz Gateway Modal ── */}
      <Modal
        isOpen={showGateway}
        onClose={() => gatewayStep !== 'processing' && setShowGateway(false)}
        title=""
        size="md"
      >
        <DemoGateway
          step={gatewayStep}
          orderId={demoOrderId}
          total={total}
          paymentMethod={fields.paymentMethod}
          onConfirm={handleDemoPaymentConfirm}
          onClose={() => setShowGateway(false)}
        />
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Demo SSLCommerz Gateway — simulates the real payment gateway UI
// for practicum / demo purposes. No real money is charged.
// ─────────────────────────────────────────────────────────────────────────
const DEMO_METHODS = [
  { id: 'bkash',  label: 'bKash',               color: 'bg-pink-500',   text: 'text-white', placeholder: '01XXXXXXXXX' },
  { id: 'nagad',  label: 'Nagad',               color: 'bg-orange-500', text: 'text-white', placeholder: '01XXXXXXXXX' },
  { id: 'card',   label: 'Credit / Debit Card', color: 'bg-blue-600',   text: 'text-white', placeholder: '4111 1111 1111 1111' },
  { id: 'rocket', label: 'Rocket (DBBL)',        color: 'bg-violet-600', text: 'text-white', placeholder: '01XXXXXXXXX' },
]

function DemoGateway({ step, orderId, total, paymentMethod, onConfirm, onClose }) {
  const [selected, setSelected] = useState(
    DEMO_METHODS.find((m) => m.id === paymentMethod) ?? DEMO_METHODS[0]
  )
  const [inputVal, setInputVal] = useState('')
  const [pin, setPin]           = useState('')

  const isCard = selected.id === 'card'

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-10">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
          <Loader2 size={32} className="text-primary-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-neutral-900 text-lg">Processing Payment…</p>
          <p className="text-neutral-500 text-sm mt-1">Please wait, do not close this window.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Lock size={12} />
          Secured by SSLCommerz
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 py-6"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">Payment Successful!</h2>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
            Your payment has been confirmed. Our pharmacist will review and dispatch your order shortly.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 w-full border border-green-100 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Transaction ID</span>
            <span className="font-mono font-semibold text-neutral-800 text-xs">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Amount Paid</span>
            <span className="font-semibold text-neutral-800">৳{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Method</span>
            <span className="font-semibold text-neutral-800">{selected.label}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button as={Link} to="/dashboard" size="md" className="w-full" onClick={onClose}>
            <Package size={16} className="mr-2" />
            Track My Order
          </Button>
          <Button as={Link} to="/shop" variant="outline" size="sm" className="w-full" onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
        <p className="text-[10px] text-neutral-400 flex items-center gap-1">
          <Lock size={10} />
          This is a demo transaction. No real money was charged.
        </p>
      </motion.div>
    )
  }

  // step === 'select' or 'form'
  return (
    <div className="flex flex-col gap-0">
      {/* Gateway header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Lock size={13} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Secured by SSLCommerz</span>
          </div>
          <p className="text-neutral-500 text-xs">Demo Payment Gateway</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Total Amount</p>
          <p className="text-xl font-bold text-neutral-900">৳{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Demo notice */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5">
        <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Demo mode:</strong> This simulates the SSLCommerz gateway. Enter any value — no real payment will be processed.
        </p>
      </div>

      {/* Payment method tabs */}
      <p className="text-xs font-semibold text-neutral-600 mb-2">Select Payment Method</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {DEMO_METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelected(m); setInputVal(''); setPin('') }}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
              selected.id === m.id
                ? `${m.color} ${m.text} border-transparent shadow-sm`
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
            )}
          >
            <span className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              selected.id === m.id ? 'bg-white/70' : 'bg-neutral-300'
            )} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="flex flex-col gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            {isCard ? 'Card Number' : `${selected.label} Number`}
          </label>
          <input
            type={isCard ? 'text' : 'tel'}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={selected.placeholder}
            maxLength={isCard ? 19 : 11}
            className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        {isCard && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Expiry Date</label>
              <input type="text" placeholder="MM / YY" maxLength={7}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">CVV</label>
              <input type="password" placeholder="•••" maxLength={4}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            {isCard ? 'Cardholder Name' : 'PIN / OTP'}
          </label>
          <input
            type={isCard ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={isCard ? 'Name on card' : '••••••'}
            maxLength={isCard ? 60 : 6}
            className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Confirm button */}
      <Button
        onClick={onConfirm}
        size="lg"
        className={cn('w-full', selected.color, selected.text, 'border-0')}
      >
        <Lock size={15} className="mr-2" />
        Confirm Payment — ৳{total.toLocaleString()}
      </Button>

      <p className="text-center text-[10px] text-neutral-400 mt-3 flex items-center justify-center gap-1">
        <Lock size={10} />
        256-bit SSL encrypted · Demo transaction only
      </p>
    </div>
  )
}
