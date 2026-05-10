import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

// Gradient backgrounds per color
const colorGradients = {
  primary:   'from-primary-50 to-primary-100',
  secondary: 'from-secondary-50 to-secondary-100',
  success:   'from-green-50 to-green-100',
  warning:   'from-amber-50 to-amber-100',
}

// Trend icon + color
const trendConfig = {
  up:      { icon: TrendingUp,   color: 'text-green-600',  bg: 'bg-green-50' },
  down:    { icon: TrendingDown, color: 'text-red-600',    bg: 'bg-red-50' },
  neutral: { icon: Minus,        color: 'text-neutral-500', bg: 'bg-neutral-100' },
}

/**
 * Metric card for dashboard overview sections.
 *
 * @param {object} props
 * @param {string} props.title - Metric label
 * @param {string|number} props.value - Primary metric value
 * @param {React.ReactNode} props.icon - Lucide icon element
 * @param {'up'|'down'|'neutral'} props.trend
 * @param {string} props.trendValue - e.g. "+12%"
 * @param {'primary'|'secondary'|'success'|'warning'} props.color
 */
export default function DashboardCard({
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue,
  color = 'primary',
}) {
  const { icon: TrendIcon, color: trendColor, bg: trendBg } = trendConfig[trend]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'glass rounded-2xl shadow-soft p-6',
        'bg-gradient-to-br',
        colorGradients[color]
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        {icon && (
          <div className="p-2 rounded-xl bg-white/60">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-neutral-900 mb-3">{value}</p>

      {/* Trend */}
      {trendValue && (
        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', trendBg, trendColor)}>
          <TrendIcon size={12} />
          {trendValue}
        </div>
      )}
    </motion.div>
  )
}
