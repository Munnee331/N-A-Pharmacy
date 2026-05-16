import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, Phone, HeartPulse, CheckCircle } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordStrengthBar, { getPasswordStrength } from '../components/auth/PasswordStrengthBar'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import { cn } from '../utils/cn'
import usePageMeta from '../hooks/usePageMeta'
import { useAuth } from '../context/AuthContext.jsx'
import showToast from '../utils/toast.js'

// ── Validation ────────────────────────────────────────────────────────────
function validate(fields) {
  const errors = {}

  if (!fields.fullName.trim())
    errors.fullName = 'Full name is required.'

  if (!fields.email.trim())
    errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.'

  if (!fields.phone.trim())
    errors.phone = 'Phone number is required.'
  else if (!/^(\+?880|0)1[0-9]\d{8}$/.test(fields.phone.replace(/[\s-]/g, '')))
    errors.phone = 'Enter a valid phone number (e.g. 01700-000000).'

  if (!fields.password)
    errors.password = 'Password is required.'
  else if (fields.password.length < 6)
    errors.password = 'Password must be at least 6 characters.'

  if (!fields.confirmPassword)
    errors.confirmPassword = 'Please confirm your password.'
  else if (fields.password !== fields.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.'

  if (!fields.terms)
    errors.terms = 'You must accept the terms to continue.'

  return errors
}

// ── Animation variants ────────────────────────────────────────────────────
const panelVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const fieldVariant = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function RegisterPage() {
  usePageMeta('Create Account', 'Join N A Pharma — create your free account for fast medicine delivery.')
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fields, setFields] = useState({
    fullName: '', email: '', phone: '',
    password: '', confirmPassword: '', terms: false,
  })
  const [errors, setErrors]     = useState({})
  const [isLoading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await register({
        name:     fields.fullName,
        email:    fields.email,
        phone:    fields.phone,
        password: fields.password,
      })
      setSubmitted(true)
      // Redirect to dashboard after short delay so user sees success state
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
    } catch (err) {
      const msg = err?.message || 'Registration failed. Please try again.'
      showToast.error(msg)
      // Show under email field if it's a duplicate email error
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      data-testid="register-page"
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50
                 flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

        {/* ── Brand panel ── */}
        <AuthBrandPanel mode="register" />

        {/* ── Form panel ── */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl shadow-soft-lg border border-neutral-100 p-8 sm:p-10
                     flex flex-col justify-center"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center shadow-sm">
              <HeartPulse size={17} className="text-white" />
            </div>
            <span className="font-semibold text-neutral-800 text-base">
              N A <span className="text-primary-600">Pharma</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-neutral-900 mb-1.5">Create account</h1>
            <p className="text-neutral-500 text-sm">
              Join 50,000+ customers who trust N A Pharma for their healthcare.
            </p>
          </div>

          {/* ── Success state ── */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-5 py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={30} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                    Account created!
                  </h2>
                  <p className="text-neutral-500 text-sm max-w-xs">
                    Welcome to N A Pharma, {fields.fullName.split(' ')[0]}! Check your email to verify your account.
                  </p>
                </div>
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign in now</Button>
                </Link>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.form
                key="form"
                variants={stagger}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                {/* Full name */}
                <motion.div variants={fieldVariant}>
                  <Input
                    label="Full Name"
                    id="reg-fullname"
                    type="text"
                    placeholder="Fatima Rahman"
                    value={fields.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    error={errors.fullName}
                    leftIcon={<User size={16} />}
                    autoComplete="name"
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={fieldVariant}>
                  <Input
                    label="Email Address"
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={fields.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    leftIcon={<Mail size={16} />}
                    autoComplete="email"
                  />
                </motion.div>

                {/* Phone */}
                <motion.div variants={fieldVariant}>
                  <Input
                    label="Phone Number"
                    id="reg-phone"
                    type="tel"
                    placeholder="01700-000000"
                    value={fields.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={errors.phone}
                    leftIcon={<Phone size={16} />}
                    autoComplete="tel"
                  />
                </motion.div>

                {/* Password + strength bar */}
                <motion.div variants={fieldVariant}>
                  <PasswordInput
                    label="Password"
                    id="reg-password"
                    placeholder="Create a strong password"
                    value={fields.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                  />
                  <PasswordStrengthBar password={fields.password} />
                </motion.div>

                {/* Confirm password */}
                <motion.div variants={fieldVariant}>
                  <PasswordInput
                    label="Confirm Password"
                    id="reg-confirm"
                    placeholder="Repeat your password"
                    value={fields.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                  />
                </motion.div>

                {/* Terms checkbox */}
                <motion.div variants={fieldVariant}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    {/* Custom checkbox */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={fields.terms}
                        onChange={(e) => handleChange('terms', e.target.checked)}
                        className="sr-only peer"
                        aria-describedby={errors.terms ? 'terms-error' : undefined}
                      />
                      <div className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center',
                        'transition-all duration-200',
                        fields.terms
                          ? 'bg-primary-600 border-primary-600'
                          : errors.terms
                          ? 'border-red-400 bg-white'
                          : 'border-neutral-300 bg-white group-hover:border-primary-400'
                      )}>
                        {fields.terms && (
                          <svg viewBox="0 0 10 8" className="w-3 h-3 fill-none stroke-white stroke-2">
                            <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-neutral-600 leading-relaxed">
                      I agree to the{' '}
                      <Link to="/about" className="text-primary-600 hover:text-primary-700 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/about" className="text-primary-600 hover:text-primary-700 font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <p id="terms-error" className="text-sm text-red-600 mt-1.5 ml-8" role="alert">
                      {errors.terms}
                    </p>
                  )}
                </motion.div>

                {/* Submit */}
                <motion.div variants={fieldVariant}>
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </motion.div>

                {/* Login link */}
                <motion.p
                  variants={fieldVariant}
                  className="text-center text-sm text-neutral-500"
                >
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-semibold
                               focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-0.5"
                  >
                    Sign in
                  </Link>
                </motion.p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
