import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, MoreVertical, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { RECENT_ORDERS, AVATAR_COLORS } from '../../data/adminData'

const PAYMENT_BADGE = {
  paid:    { label: 'Paid',    cls: 'bg-green-50 text-green-700 border-green-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed:  { label: 'Failed',  cls: 'bg-red-50 text-red-700 border-red-200' },
}

const DELIVERY_BADGE = {
  delivered:  { label: 'Delivered',  cls: 'bg-green-50 text-green-700 border-green-200' },
  in_transit: { label: 'In Transit', cls: 'bg-secondary-50 text-secondary-700 border-secondary-200' },
  processing: { label: 'Processing', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-700 border-red-200' },
}

function StatusBadge({ config }) {
  if (!config) return null
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', config.cls)}>
      {config.label}
    </span>
  )
}

/**
 * Recent orders management table.
 */
export default function RecentOrdersTable() {
  const [openMenu, setOpenMenu] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Recent Orders</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{RECENT_ORDERS.length} latest transactions</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-primary-600 font-medium
                           hover:text-primary-700 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1">
          View all <ChevronRight size={13} />
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]" role="table">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Delivery', 'Date', ''].map((h) => (
                <th key={h} scope="col"
                  className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500
                             uppercase tracking-wider first:pl-6 last:pr-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {RECENT_ORDERS.map((order, i) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="hover:bg-neutral-50/60 transition-colors group"
              >
                <td className="px-4 py-3.5 pl-6">
                  <span className="text-sm font-mono font-semibold text-primary-600">{order.id}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                      AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                      {order.avatar}
                    </div>
                    <span className="text-sm font-medium text-neutral-800 whitespace-nowrap">{order.customer}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-neutral-600">{order.items} item{order.items !== 1 ? 's' : ''}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-neutral-900">{order.total}</span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge config={PAYMENT_BADGE[order.payment]} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge config={DELIVERY_BADGE[order.delivery]} />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-neutral-400 whitespace-nowrap">{order.date}</span>
                </td>
                <td className="px-4 py-3.5 pr-6">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button aria-label={`View order ${order.id}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                                 hover:text-primary-600 hover:bg-primary-50 transition-all
                                 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <Eye size={13} />
                    </button>
                    <div className="relative">
                      <button aria-label="More options"
                        onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                                   hover:text-neutral-600 hover:bg-neutral-100 transition-all
                                   focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <MoreVertical size={13} />
                      </button>
                      {openMenu === order.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl
                                     border border-neutral-100 shadow-soft-lg py-1 z-20">
                          {['View details', 'Update status', 'Cancel order'].map((action) => (
                            <button key={action} onClick={() => setOpenMenu(null)}
                              className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors">
                              {action}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
