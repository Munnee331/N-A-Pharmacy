import { motion } from 'framer-motion'
import { HeartPulse } from 'lucide-react'

/**
 * Full-page loading fallback used by React.Suspense.
 * Shown while lazy-loaded page chunks are being fetched.
 */
export default function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5">
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                   flex items-center justify-center shadow-soft"
      >
        <HeartPulse size={26} className="text-white" />
      </motion.div>

      {/* Shimmer bar */}
      <div className="flex flex-col items-center gap-2">
        <div className="h-2 w-32 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
          />
        </div>
        <p className="text-xs text-neutral-400 font-medium">Loading page…</p>
      </div>
    </div>
  )
}
