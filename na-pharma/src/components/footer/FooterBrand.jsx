import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * Footer brand section — logo, tagline, and description.
 */
export default function FooterBrand() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                        flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <span className="font-semibold text-white text-base tracking-tight">
          N A <span className="text-primary-400">Pharma</span>
        </span>
      </Link>

      {/* Tagline */}
      <p className="text-primary-400 font-medium text-sm mb-3">
        Your Trusted Healthcare Partner
      </p>

      {/* Description */}
      <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
        Providing quality medicines and healthcare products with care, convenience,
        and professional guidance since 2010.
      </p>
    </motion.div>
  )
}
