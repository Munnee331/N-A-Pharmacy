import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { LOW_STOCK_ITEMS } from '../../data/adminData'

const STATUS_CONFIG = {
  critical: { label: 'Critical',     cls: 'bg-red-50 text-red-700 border-red-200',     bar: 'bg-red-500' },
  low:      { label: 'Low Stock',    cls: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500' },
  out:      { label: 'Out of Stock', cls: 'bg-neutral-100 text-neutral-500 border-neutral-200', bar: 'bg-neutral-400' },
}

/**
 * Low stock alert panel with progress bars and restock buttons.
 */
export default function LowStockAlert() {
  const criticalCount = LOW_STOCK_ITEMS.filter((i) => i.status === 'critical' || i.status === 'out').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={15} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Low Stock Alerts</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{criticalCount} items need immediate attention</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-primary-600 font-medium
                           hover:text-primary-700 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1">
          View all <ChevronRight size={13} />
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-neutral-50">
        {LOW_STOCK_ITEMS.map((item, i) => {
          const cfg = STATUS_CONFIG[item.status]
          const pct = item.status === 'out' ? 0 : Math.round((item.stock / item.threshold) * 100)

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={cn(
                'px-6 py-4 flex items-center gap-4',
                (item.status === 'critical' || item.status === 'out') && 'bg-red-50/30'
              )}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{item.name}</p>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.cls)}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-2">{item.category} · {item.stock} / {item.threshold} units</p>

                {/* Progress bar */}
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', cfg.bar)}
                  />
                </div>
              </div>

              {/* Restock button */}
              <button
                aria-label={`Restock ${item.name}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                           bg-primary-50 text-primary-700 border border-primary-200
                           hover:bg-primary-100 transition-colors flex-shrink-0
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <RefreshCw size={11} />
                Restock
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
