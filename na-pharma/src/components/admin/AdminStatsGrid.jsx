import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingCart, Users, AlertTriangle,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { ADMIN_STATS } from '../../data/adminData'

const ICON_MAP = { DollarSign, ShoppingCart, Users, AlertTriangle }

const COLOR_MAP = {
  primary:   { bg: 'from-primary-50 to-primary-100',     icon: 'bg-primary-100 text-primary-600',   value: 'text-primary-700' },
  secondary: { bg: 'from-secondary-50 to-secondary-100', icon: 'bg-secondary-100 text-secondary-600', value: 'text-secondary-700' },
  success:   { bg: 'from-green-50 to-green-100',         icon: 'bg-green-100 text-green-600',       value: 'text-green-700' },
  warning:   { bg: 'from-amber-50 to-amber-100',         icon: 'bg-amber-100 text-amber-600',       value: 'text-amber-700' },
}

const TREND_MAP = {
  up:   { icon: TrendingUp,   cls: 'text-green-600 bg-green-50' },
  down: { icon: TrendingDown, cls: 'text-red-600 bg-red-50' },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/**
 * 4-column animated stats grid for the admin dashboard.
 *
 * @param {{ liveStats?: object }} props
 *   liveStats — optional overrides from real API data, keyed by stat id.
 *   e.g. { medicines: { value: '42', sub: '42 in catalogue' } }
 */
export default function AdminStatsGrid({ liveStats = {} }) {
  // Merge static fallback with any live overrides
  const stats = ADMIN_STATS.map((s) =>
    liveStats[s.id] ? { ...s, ...liveStats[s.id] } : s
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
    >
      {stats.map((stat) => {
        const Icon      = ICON_MAP[stat.iconName]
        const c         = COLOR_MAP[stat.color]
        const t         = TREND_MAP[stat.trend]
        const TrendIcon = t?.icon

        return (
          <motion.div
            key={stat.id}
            variants={cardVariants}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-2xl p-6 border border-white/60 shadow-soft',
              'glass backdrop-blur-sm bg-gradient-to-br',
              c.bg
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', c.icon)}>
                {Icon && <Icon size={17} />}
              </div>
            </div>

            <p className={cn('text-3xl font-bold mb-1', c.value)}>{stat.value}</p>
            <p className="text-xs text-neutral-400 mb-3">{stat.sub}</p>

            {stat.trendValue && TrendIcon && (
              <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', t.cls)}>
                <TrendIcon size={11} />
                {stat.trendValue}
              </div>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
