import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight, Sparkles, Bell, ShieldCheck } from 'lucide-react'

const PERKS = [
  { icon: Bell,        text: 'Exclusive deals & discounts' },
  { icon: ShieldCheck, text: 'Health tips from pharmacists' },
  { icon: Sparkles,    text: 'New product announcements' },
]

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    // Stub — replace with real API call
    setSubmitted(true)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700">

      {/* ── Decorative glow blobs ── */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full
                   bg-primary-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full
                   bg-secondary-400/20 blur-3xl"
        aria-hidden="true"
      />
      {/* Subtle dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                             bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
              <Mail size={13} />
              Stay in the Loop
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              Get Health Tips &{' '}
              <span className="text-primary-200">Exclusive Offers</span>{' '}
              in Your Inbox
            </h2>

            <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-lg">
              Join 30,000+ subscribers who receive weekly health insights, medicine
              discounts, and expert pharmacist advice — completely free.
            </p>

            {/* Perks list */}
            <ul className="flex flex-col gap-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-primary-100 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-white" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Right: form card ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 sm:p-10">

              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center text-center gap-5 py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        You're subscribed!
                      </h3>
                      <p className="text-primary-100 text-sm leading-relaxed">
                        Welcome to the N A Pharma community. Check your inbox for
                        a confirmation email and your first health tip.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-primary-200 text-xs">
                      <ShieldCheck size={13} />
                      No spam, ever. Unsubscribe anytime.
                    </div>
                  </motion.div>
                ) : (
                  /* ── Form state ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Subscribe to our newsletter
                      </h3>
                      <p className="text-primary-200 text-sm">
                        Free weekly health content. No spam.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                      {/* Name input */}
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        aria-label="Your name"
                        className="w-full bg-white/10 border border-white/20 text-white
                                   placeholder:text-white/50 rounded-xl px-4 py-3 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-white/40
                                   focus:border-white/40 transition-all"
                      />

                      {/* Email input + button row */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <Mail
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                          />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError('') }}
                            placeholder="Enter your email address"
                            aria-label="Email address"
                            aria-describedby={error ? 'newsletter-error' : undefined}
                            aria-invalid={error ? 'true' : undefined}
                            required
                            className="w-full bg-white/10 border border-white/20 text-white
                                       placeholder:text-white/50 rounded-xl pl-10 pr-4 py-3 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-white/40
                                       focus:border-white/40 transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2 px-5 py-3
                                     bg-white text-primary-700 font-semibold text-sm rounded-xl
                                     hover:bg-primary-50 active:bg-primary-100
                                     transition-colors duration-200 flex-shrink-0
                                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                                     focus:ring-offset-primary-700"
                        >
                          Subscribe
                          <ArrowRight size={15} />
                        </button>
                      </div>

                      {/* Inline error */}
                      {error && (
                        <motion.p
                          id="newsletter-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          role="alert"
                          className="text-red-300 text-xs flex items-center gap-1.5"
                        >
                          {error}
                        </motion.p>
                      )}
                    </form>

                    {/* Privacy note */}
                    <p className="text-primary-200/70 text-xs flex items-center gap-1.5">
                      <ShieldCheck size={12} />
                      Your email is safe with us. We never share your data.
                    </p>

                    {/* Social proof */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                      {/* Avatar stack */}
                      <div className="flex -space-x-2">
                        {['FR', 'KH', 'NJ', 'AC'].map((initials, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30
                                       flex items-center justify-center text-[9px] font-bold text-white"
                          >
                            {initials}
                          </div>
                        ))}
                      </div>
                      <p className="text-primary-100 text-xs">
                        <span className="font-semibold text-white">30,000+</span> subscribers
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
