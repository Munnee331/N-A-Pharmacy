import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Check, X, AlertCircle, Stethoscope, ChevronRight, Clock } from 'lucide-react'
import { cn } from '../../utils/cn'
import { RECENT_PRESCRIPTIONS, AVATAR_COLORS } from '../../data/adminData'

/**
 * Prescription approval queue for the admin dashboard.
 */
export default function RecentPrescriptions() {
  const [items, setItems] = useState(
    RECENT_PRESCRIPTIONS.map((p) => ({ ...p, localStatus: 'pending' }))
  )

  function handleAction(id, action) {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, localStatus: action } : p))
  }

  const pendingCount = items.filter((i) => i.localStatus === 'pending').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-soft overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Prescription Queue</h3>
          <p className="text-xs text-neutral-400 mt-0.5">{pendingCount} pending approval{pendingCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
              <Clock size={11} />{pendingCount} pending
            </span>
          )}
          <button className="flex items-center gap-1.5 text-xs text-primary-600 font-medium
                             hover:text-primary-700 transition-colors
                             focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-1">
            View all <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="divide-y divide-neutral-50">
        <AnimatePresence initial={false}>
          {items.map((rx, i) => (
            <motion.div
              key={rx.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={cn(
                'px-6 py-4 transition-colors',
                rx.localStatus === 'approved' && 'bg-green-50/40',
                rx.localStatus === 'rejected' && 'bg-red-50/40',
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0',
                  AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                  {rx.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900">{rx.patient}</span>
                        {rx.urgency === 'urgent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                           bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
                            <AlertCircle size={9} />URGENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-400">
                        <Stethoscope size={11} />{rx.doctor}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono font-semibold text-primary-600">{rx.id}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{rx.submitted}</p>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rx.medicines.map((med) => (
                      <span key={med} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                                                  bg-neutral-100 text-neutral-600 text-[11px] font-medium">
                        {med}
                      </span>
                    ))}
                  </div>

                  {/* File placeholder */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50
                                    border border-neutral-200 border-dashed text-xs text-neutral-500
                                    hover:bg-neutral-100 transition-colors cursor-pointer">
                      <FileText size={13} className="text-primary-500" />
                      prescription_{rx.id}.pdf
                      <span className="text-primary-600 font-medium ml-1">Preview</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {rx.localStatus === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAction(rx.id, 'approved')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-green-600 text-white
                                   text-xs font-semibold hover:bg-green-700 transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        <Check size={12} />Approve
                      </button>
                      <button onClick={() => handleAction(rx.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-red-600
                                   border border-red-200 text-xs font-semibold hover:bg-red-50 transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                        <X size={12} />Reject
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold',
                        rx.localStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {rx.localStatus === 'approved' ? <Check size={12} /> : <X size={12} />}
                      {rx.localStatus === 'approved' ? 'Approved' : 'Rejected'}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
