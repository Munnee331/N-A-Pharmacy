import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, Package, BadgeCheck } from 'lucide-react'

/**
 * Shop page header with breadcrumb, headline, and summary stats.
 *
 * @param {object} props
 * @param {number} props.totalResults - Total filtered product count
 * @param {string} props.searchQuery  - Active search query (may be empty)
 * @param {string} props.activeCategory
 */
export default function ShopHero({ totalResults, searchQuery, activeCategory }) {
  const summaryText = searchQuery
    ? `Showing ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchQuery}"`
    : activeCategory && activeCategory !== 'All'
    ? `Showing ${totalResults} product${totalResults !== 1 ? 's' : ''} in ${activeCategory}`
    : `${totalResults} products available`

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-b border-neutral-100">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full
                      bg-primary-100/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full
                      bg-secondary-100/30 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-neutral-500 mb-5"
        >
          <Link
            to="/"
            className="hover:text-primary-600 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-neutral-300" />
          <span className="text-neutral-900 font-medium">Shop</span>
          {activeCategory && activeCategory !== 'All' && (
            <>
              <ChevronRight size={14} className="text-neutral-300" />
              <span className="text-primary-600 font-medium">{activeCategory}</span>
            </>
          )}
        </motion.nav>

        {/* Headline row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-2">
              {activeCategory && activeCategory !== 'All'
                ? activeCategory
                : 'Medicine Shop'}
            </h1>
            <p className="text-neutral-500 text-base">{summaryText}</p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="flex items-center gap-4 flex-shrink-0"
          >
            {[
              { icon: Package,    value: '10,000+', label: 'Products' },
              { icon: BadgeCheck, value: '100%',    label: 'Certified' },
              { icon: ShoppingBag, value: '24h',    label: 'Delivery' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-neutral-100
                                flex items-center justify-center">
                  <Icon size={14} className="text-primary-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-neutral-900 leading-none text-xs">{value}</p>
                  <p className="text-neutral-400 text-[10px]">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
