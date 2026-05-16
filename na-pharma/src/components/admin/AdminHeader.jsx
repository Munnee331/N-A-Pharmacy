import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Settings, Menu, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Admin dashboard top header bar.
 * Shows the logged-in admin's name/initials and provides a working logout.
 *
 * @param {object}   props
 * @param {Function} props.onMenuClick - Opens mobile sidebar drawer
 */
export default function AdminHeader({ onMenuClick }) {
  const { user, logout }            = useAuth()
  const navigate                    = useNavigate()
  const [dropdownOpen, setDropdown] = useState(false)
  const [searchQuery, setSearch]    = useState('')

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // Derive initials from the user's name (e.g. "Admin User" → "AU")
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const displayName = user?.name?.split(' ')[0] ?? 'Admin'

  function handleLogout() {
    setDropdown(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white border-b border-neutral-100 shadow-sm flex-shrink-0
                       flex items-center px-4 sm:px-6 gap-4">

      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500
                   hover:bg-neutral-100 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Menu size={18} />
      </button>

      {/* Date */}
      <div className="hidden sm:block min-w-0">
        <p className="text-xs text-neutral-400 truncate">{today}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders, medicines…"
          aria-label="Admin search"
          className="pl-9 pr-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50
                     text-sm text-neutral-900 placeholder:text-neutral-400 w-52
                     focus:outline-none focus:ring-2 focus:ring-primary-500
                     focus:border-primary-400 focus:bg-white transition-all"
        />
      </div>

      {/* Notifications */}
      <button
        aria-label="Notifications — 3 unread"
        className="relative w-9 h-9 rounded-xl border border-neutral-200 bg-white
                   flex items-center justify-center text-neutral-500
                   hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                   transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Bell size={16} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500
                         text-white text-[9px] font-bold flex items-center justify-center">
          3
        </span>
      </button>

      {/* Settings */}
      <button
        aria-label="Settings"
        className="hidden sm:flex w-9 h-9 rounded-xl border border-neutral-200 bg-white
                   items-center justify-center text-neutral-500
                   hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                   transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Settings size={16} />
      </button>

      {/* Avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdown((v) => !v)}
          aria-label="Admin account menu"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                     hover:bg-neutral-50 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-neutral-700">
            {displayName}
          </span>
          <ChevronDown
            size={14}
            className={`text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl
                         border border-neutral-100 shadow-soft-lg py-1 z-50"
              role="menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full
                                 text-[10px] font-semibold bg-primary-50 text-primary-700">
                  {user?.role}
                </span>
              </div>

              {/* Menu items */}
              <button
                role="menuitem"
                onClick={() => setDropdown(false)}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm
                           text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <User size={14} className="text-neutral-400" />
                Profile
              </button>
              <button
                role="menuitem"
                onClick={() => setDropdown(false)}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm
                           text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Settings size={14} className="text-neutral-400" />
                Settings
              </button>

              <div className="border-t border-neutral-100 mt-1 pt-1">
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm
                             text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
