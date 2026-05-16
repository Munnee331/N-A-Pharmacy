import { motion } from 'framer-motion'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { TOP_MEDICINES } from '../../data/adminData'

const CATEGORY_COLORS = {
  Tablet:  'bg-primary-50 text-primary-700',
  Capsule: 'bg-secondary-50 text-secondary-700',
  Syrup:   'bg-green-50 text-green-700',
  Device:  'bg-violet-50 text-violet-700',
}

/**
 * Top selling medicines ranked list with mini progress bars.
 */
export default function TopSellingMedicines() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
            <TrendingUp size={15} className="text-primary-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Top Selling Medicines</h3>
            <p className="text-xs text-neutral-400 mt-0.5">This month's bestsellers</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-primary-600 font-medium
                           hover:text-primary-700 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1">
          View all <ChevronRight size={13} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-50">
        {TOP_MEDICINES.map((med, i) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/60 transition-colors"
          >
            {/* Rank */}
            <span className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
              i === 0 ? 'bg-amber-100 text-amber-700'
                : i === 1 ? 'bg-neutral-200 text-neutral-600'
                : i === 2 ? 'bg-orange-100 text-orange-700'
                : 'bg-neutral-100 text-neutral-500'
            )}>
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-semibold text-neutral-900 truncate">{med.name}</p>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full',
                  CATEGORY_COLORS[med.category] || 'bg-neutral-100 text-neutral-600')}>
                  {med.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Mini progress bar */}
                <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${med.pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                    className="h-full bg-primary-500 rounded-full"
                  />
                </div>
                <span className="text-[11px] text-neutral-400 flex-shrink-0">{med.pct}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-neutral-900">{med.sold.toLocaleString()}</p>
              <p className="text-[10px] text-neutral-400">units sold</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
