import { motion } from 'framer-motion'
import { Plus, UserPlus, Download, FileBarChart, RefreshCw, Zap } from 'lucide-react'
import { cn } from '../../utils/cn'
import showToast from '../../utils/toast'

const ACTIONS = [
  {
    id: 'add-medicine',
    label: 'Add Medicine',
    description: 'Add a new product to the catalogue',
    icon: Plus,
    lightBg: 'bg-primary-50',
    lightText: 'text-primary-700',
    lightBorder: 'border-primary-100',
    iconBg: 'bg-primary-100 text-primary-600',
  },
  {
    id: 'add-user',
    label: 'Add User',
    description: 'Create a new customer account',
    icon: UserPlus,
    lightBg: 'bg-secondary-50',
    lightText: 'text-secondary-700',
    lightBorder: 'border-secondary-100',
    iconBg: 'bg-secondary-100 text-secondary-600',
  },
  {
    id: 'generate-report',
    label: 'Generate Report',
    description: 'Export sales and inventory data',
    icon: FileBarChart,
    lightBg: 'bg-green-50',
    lightText: 'text-green-700',
    lightBorder: 'border-green-100',
    iconBg: 'bg-green-100 text-green-600',
  },
  {
    id: 'export-orders',
    label: 'Export Orders',
    description: 'Download orders as CSV/Excel',
    icon: Download,
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    lightBorder: 'border-amber-100',
    iconBg: 'bg-amber-100 text-amber-600',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

/**
 * Quick actions panel — 4 action cards + refresh button.
 */
export default function QuickActions() {
  function handleAction(label) {
    showToast.info(`${label} — coming soon`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Quick Actions</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Common admin tasks</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
          <Zap size={15} className="text-primary-600" />
        </div>
      </div>

      {/* Action cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-3"
      >
        {ACTIONS.map((action) => (
          <motion.button
            key={action.id}
            variants={cardVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={() => handleAction(action.label)}
            className={cn(
              'group flex flex-col items-start gap-3 p-4 rounded-2xl border text-left',
              'transition-all duration-200 hover:shadow-soft',
              action.lightBg, action.lightBorder,
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              'transition-transform duration-200 group-hover:scale-110',
              action.iconBg
            )}>
              <action.icon size={16} />
            </div>
            <div>
              <p className={cn('text-sm font-semibold leading-tight', action.lightText)}>
                {action.label}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                {action.description}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Refresh */}
      <button
        onClick={() => showToast.success('Dashboard refreshed!')}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                   border border-neutral-200 text-neutral-500 text-sm font-medium
                   hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                   transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <RefreshCw size={14} />
        Refresh Dashboard
      </button>
    </motion.div>
  )
}
