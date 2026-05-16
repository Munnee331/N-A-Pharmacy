import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  LayoutDashboard,
  Heart,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

/**
 * User menu dropdown — shown when user is authenticated.
 * Displays user avatar + name, dropdown with links to dashboard, orders, wishlist, etc.
 */
export default function UserMenu({ onLinkClick }) {
  const { user, logout, isAdmin, isPharmacist } = useAuth()
  const [isOpen, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  function handleLogout() {
    logout()
    setOpen(false)
    onLinkClick?.()
    navigate('/login')
  }

  const menuItems = []

  if (isAdmin) {
    menuItems.push({ icon: LayoutDashboard, label: 'Admin Dashboard', to: '/admin' })
  } else if (isPharmacist) {
    menuItems.push({ icon: LayoutDashboard, label: 'Pharmacist Dashboard', to: '/pharmacist' })
  } else {
    menuItems.push(
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: ShoppingBag, label: 'My Orders', to: '/dashboard' },
      { icon: Heart, label: 'Wishlist', to: '/dashboard' },
      { icon: FileText, label: 'Prescriptions', to: '/dashboard' }
    )
  }

  menuItems.push({ icon: Settings, label: 'Settings', to: '/dashboard' })

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl
                   text-neutral-700 hover:bg-neutral-50 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                        flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        {/* Name (desktop only) */}
        <span className="hidden md:block text-sm font-medium">
          {user?.name?.split(' ')[0]}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'hidden md:block transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg
                       border border-neutral-100 py-2 z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
              {user?.role && (
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full
                                 bg-primary-50 text-primary-700 text-[10px] font-medium">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1">
              {menuItems.map(({ icon: Icon, label, to }) => (
                <Link
                  key={to + label}
                  to={to}
                  onClick={() => {
                    setOpen(false)
                    onLinkClick?.()
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700
                             hover:bg-neutral-50 transition-colors"
                >
                  <Icon size={16} className="text-neutral-400" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-neutral-100 pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
                           hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
