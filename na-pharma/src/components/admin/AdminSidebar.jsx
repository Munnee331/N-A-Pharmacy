import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Pill, Users,
  ClipboardList, BarChart3, Settings, X,
  ChevronLeft, HeartPulse,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { SIDEBAR_LINKS } from '../../data/adminData'

// Icon map — keeps data file free of JSX
const ICON_MAP = {
  LayoutDashboard, ShoppingBag, Pill, Users,
  ClipboardList, BarChart3, Settings,
}

const drawerVariants = {
  closed: { x: '-100%', opacity: 0 },
  open:   { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

const backdropVariants = {
  closed: { opacity: 0 },
  open:   { opacity: 1 },
}

/**
 * Admin sidebar — desktop persistent + mobile slide-in drawer.
 *
 * @param {object} props
 * @param {boolean} props.collapsed   - Desktop collapsed state
 * @param {boolean} props.mobileOpen  - Mobile drawer open state
 * @param {Function} props.onToggle   - Toggle desktop collapse
 * @param {Function} props.onClose    - Close mobile drawer
 */
export default function AdminSidebar({ collapsed, mobileOpen, onToggle, onClose }) {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-neutral-100 shadow-sm',
          'transition-all duration-300 ease-in-out flex-shrink-0',
          collapsed ? 'w-16' : 'w-56'
        )}
        aria-label="Admin navigation"
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} onClose={onClose} />
      </aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 z-50 h-full w-56 bg-white shadow-soft-lg
                         flex flex-col lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
            >
              <SidebarContent collapsed={false} onToggle={onToggle} onClose={onClose} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Inner sidebar content (shared by desktop + mobile) ── */
function SidebarContent({ collapsed, onToggle, onClose, mobile = false }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-neutral-100 flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center shadow-sm">
              <HeartPulse size={16} className="text-white" />
            </div>
            <span className="font-semibold text-neutral-800 text-sm tracking-tight">
              N A <span className="text-primary-600">Admin</span>
            </span>
          </div>
        )}

        {/* Toggle / close button */}
        {mobile ? (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500
                       hover:bg-neutral-100 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400
                       hover:bg-neutral-100 hover:text-neutral-600 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <ChevronLeft size={16} className={cn('transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Admin menu">
        <ul className="flex flex-col gap-1">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = ICON_MAP[link.iconName]
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/admin'}
                  onClick={mobile ? onClose : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                      'transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    )
                  }
                  title={collapsed ? link.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {Icon && (
                        <Icon
                          size={17}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? 'text-primary-600' : 'text-neutral-400'
                          )}
                        />
                      )}
                      {!collapsed && (
                        <span className="truncate">{link.label}</span>
                      )}
                      {/* Active dot */}
                      {!collapsed && isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom: version */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400">N A Pharma Admin v1.0</p>
        </div>
      )}
    </div>
  )
}
