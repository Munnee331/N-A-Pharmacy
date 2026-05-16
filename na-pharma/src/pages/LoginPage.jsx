import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Mail, HeartPulse, Smartphone } from 'lucide-react'
import { cn } from '../utils/cn.js'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import PasswordInput from '../components/auth/PasswordInput.jsx'
import AuthBrandPanel from '../components/auth/AuthBrandPanel.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import { useAuth } from '../context/AuthContext.jsx'
import showToast from '../utils/toast.js'

// ── Validation ────────────────────────────────────────────────────────────
function validate(fields) {
  const errors = {}
  if (!fields.email.trim())
    errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.'
  if (!fields.password)
    errors.password = 'Password is required.'
  else if (fields.password.length < 6)
    errors.password = 'Password must be at least 6 characters.'
  return errors
}

// ── Animation variants ────────────────────────────────────────────────────
const panelVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const fieldVariant = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function LoginPage() {
  usePageMeta('Sign In', 'Sign in to your N A Pharma account.')

  const { login, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [fields, setFields]     = useState({ email: '', password: '', remember: false })
  const [errors, setErrors]     = useState({})
  const [isLoading, setLoading] = useState(false)

  // Already logged in — redirect immediately
  if (!authLoading && isAuthenticated) {
    const from = location.state?.from?.pathname
    const dest = from || (isAdmin ? '/admin' : '/dashboard')
    return <Navigate to={dest} replace />
  }

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
      const user = await login({ email: fields.email, password: fields.password })
      // Redirect: back to the page they came from, or role-based default
      const from = location.state?.from?.pathname
      let dest
      if (from) {
        dest = from
      } else if (user.role === 'admin') {
        dest = '/admin'
      } else if (user.role === 'pharmacist') {
        dest = '/pharmacist'
      } else {
        dest = '/dashboard'
      }
      navigate(dest, { replace: true })
    } catch (err) {
      const msg = err?.message || 'Invalid email or password.'
      showToast.error(msg)
      setErrors({ password: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      data-testid="login-page"
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 via-white to-secondary-50
                 flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

        {/* ── Brand panel (desktop left) ── */}
        <AuthBrandPanel mode="login" />

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-1.5">Sign in</h1>
            <p className="text-neutral-500 text-sm">
              Welcome back — enter your credentials to continue.
            </p>
          </div>

          <motion.form
            variants={stagger}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Email */}
            <motion.div variants={fieldVariant}>
              <Input
                label="Email Address"
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={fields.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                leftIcon={<Mail size={16} />}
                autoComplete="email"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={fieldVariant}>
              <PasswordInput
                label="Password"
                id="login-password"
                placeholder="Enter your password"
                value={fields.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
            </motion.div>

            {/* Remember me + forgot */}
            <motion.div variants={fieldVariant} className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={fields.remember}
                    onChange={(e) => handleChange('remember', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    'w-9 h-5 rounded-full transition-colors duration-200',
                    fields.remember ? 'bg-primary-600' : 'bg-neutral-200'
                  )} />
                  <div className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
                    'transition-transform duration-200',
                    fields.remember ? 'translate-x-4' : 'translate-x-0'
                  )} />
                </div>
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>

              <Link
                to="/contact"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fieldVariant}>
              <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fieldVariant} className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </motion.div>

            {/* Social login buttons (UI only) */}
            <motion.div variants={fieldVariant} className="grid grid-cols-2 gap-3">
              <SocialButton icon="G" label="Google" />
              <SocialButton icon={<Smartphone size={16} />} label="Phone" />
            </motion.div>

            {/* Register link */}
            <motion.p variants={fieldVariant} className="text-center text-sm text-neutral-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-0.5"
              >
                Create one free
              </Link>
            </motion.p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}

/* ── Social button (UI only) ── */
function SocialButton({ icon, label }) {
  return (
    <button
      type="button"
      onClick={() => showToast.info(`${label} login coming soon`)}
      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                 border border-neutral-200 bg-white text-neutral-700 text-sm font-medium
                 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {typeof icon === 'string' ? (
        <span className="w-4 h-4 rounded-sm bg-neutral-800 text-white text-[10px]
                         font-bold flex items-center justify-center flex-shrink-0">
          {icon}
        </span>
      ) : icon}
      {label}
    </button>
  )
}
