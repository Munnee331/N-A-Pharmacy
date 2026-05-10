import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import NavLinks from './NavLinks'
import NavActions from './NavActions'
import { NAV_LINKS } from '../../routes/index'

const backdropVariants = {
  closed: { opacity: 0 },
  open:   { opacity: 1 },
}

const drawerVariants = {
  closed: { x: '100%', opacity: 0 },
  open: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

/**
 * Slide-in mobile navigation drawer.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {number} props.cartCount
 * @param {number} props.wishlistCount
 */
export default function MobileDrawer({ isOpen, onClose, cartCount, wishlistCount }) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-0 z-40 bg-neutral-900/50"
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw]
                       bg-white shadow-soft-lg flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                {/* Mini logo */}
                <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <span className="font-semibold text-neutral-800 text-sm">N A Pharma</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex items-center justify-center w-9 h-9 rounded-xl
                           text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
                           transition-colors focus:outline-none focus:ring-2
                           focus:ring-primary-500 focus:ring-offset-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <NavLinks links={NAV_LINKS} onLinkClick={onClose} mobile />
            </nav>

            {/* Actions */}
            <div className="px-4 pb-6">
              <NavActions
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                onLinkClick={onClose}
                mobile
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
