import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Newsletter subscription form in the footer.
 * Stub implementation — replace with real API call in a future phase.
 */
export default function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    // Stub: simulate subscription
    setSubscribed(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">
        Newsletter
      </h4>
      <p className="text-neutral-400 text-sm mb-4">
        Get health tips and exclusive offers in your inbox.
      </p>

      <AnimatePresence mode="wait">
        {subscribed ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-primary-400 text-sm font-medium"
          >
            <CheckCircle size={16} />
            Thanks for subscribing!
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address for newsletter"
              className="w-full bg-neutral-800 border border-neutral-700 text-white
                         placeholder:text-neutral-500 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500
                         focus:border-primary-500 transition-all"
            />
            <button
              type="submit"
              disabled={!email}
              className="flex items-center justify-center gap-2 w-full
                         bg-primary-600 hover:bg-primary-700 disabled:opacity-50
                         disabled:cursor-not-allowed text-white text-sm font-medium
                         rounded-xl px-4 py-2.5 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         focus:ring-offset-neutral-900"
            >
              <Send size={14} />
              Subscribe
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
