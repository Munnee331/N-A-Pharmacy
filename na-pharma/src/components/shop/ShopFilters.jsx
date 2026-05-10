import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react'
import { cn } from '../../utils/cn'
import { CATEGORIES, SORT_OPTIONS, PRICE_RANGES } from '../../data/medicines'

/**
 * Search bar + filter controls for the shop page.
 * Collapses into a drawer on mobile.
 *
 * @param {object}   props
 * @param {object}   props.filters        - Current filter state
 * @param {Function} props.onFilterChange - (key, value) => void
 * @param {boolean}  props.drawerOpen     - Mobile filter drawer open state
 * @param {Function} props.onDrawerToggle
 * @param {number}   props.totalResults
 */
export default function ShopFilters({
  filters,
  onFilterChange,
  drawerOpen,
  onDrawerToggle,
  totalResults,
}) {
  const activeFilterCount = [
    filters.category !== 'All',
    filters.priceRange !== 'all',
    filters.minRating > 0,
    filters.inStockOnly,
  ].filter(Boolean).length

  function clearAll() {
    onFilterChange('category', 'All')
    onFilterChange('priceRange', 'all')
    onFilterChange('minRating', 0)
    onFilterChange('inStockOnly', false)
    onFilterChange('search', '')
    onFilterChange('sort', 'featured')
  }

  return (
    <>
      {/* ── Top bar: search + sort + mobile filter toggle ── */}
      <div className="bg-white border-b border-neutral-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                           text-neutral-400 pointer-events-none" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                placeholder="Search medicines, brands…"
                aria-label="Search medicines"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white
                           text-sm text-neutral-900 placeholder:text-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500
                           focus:border-primary-400 transition-all"
              />
            </div>

            {/* Sort dropdown — desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-neutral-500 whitespace-nowrap">
                Sort by
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) => onFilterChange('sort', e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-neutral-200
                             bg-white text-sm text-neutral-900 cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-primary-500
                             focus:border-primary-400 transition-all"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2
                                                   text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={onDrawerToggle}
              aria-label="Open filters"
              aria-expanded={drawerOpen}
              className={cn(
                'lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500',
                activeFilterCount > 0
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              )}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px]
                                 font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear all — shown when filters active */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500
                           hover:text-red-500 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-red-400 rounded-lg px-1"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop sidebar filters ── */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <FilterPanel
          filters={filters}
          onFilterChange={onFilterChange}
          onClearAll={clearAll}
          activeFilterCount={activeFilterCount}
          totalResults={totalResults}
        />
      </aside>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onDrawerToggle}
              className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white
                         shadow-soft-lg overflow-y-auto lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filter options"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 sticky top-0 bg-white">
                <h2 className="font-semibold text-neutral-900">Filters</h2>
                <button
                  onClick={onDrawerToggle}
                  aria-label="Close filters"
                  className="w-8 h-8 rounded-xl flex items-center justify-center
                             text-neutral-500 hover:bg-neutral-100 transition-colors
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                {/* Sort — mobile only inside drawer */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                    Sort By
                  </p>
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => onFilterChange('sort', e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border
                                 border-neutral-200 bg-white text-sm text-neutral-900
                                 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2
                                                       text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <FilterPanel
                  filters={filters}
                  onFilterChange={onFilterChange}
                  onClearAll={clearAll}
                  activeFilterCount={activeFilterCount}
                  totalResults={totalResults}
                  mobile
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────────
   Inner FilterPanel — shared by sidebar + drawer
───────────────────────────────────────────── */
function FilterPanel({ filters, onFilterChange, onClearAll, activeFilterCount, totalResults, mobile = false }) {
  return (
    <div className={cn('flex flex-col gap-6', !mobile && 'pt-6 pr-2')}>

      {/* Results count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-900">{totalResults}</span> results
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-600 font-medium
                       focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange('category', cat)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm',
                'transition-all duration-150 text-left',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                filters.category === cat
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {cat}
              {filters.category === cat && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => onFilterChange('priceRange', range.value)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm',
                'transition-all duration-150 text-left',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                filters.priceRange === range.value
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {range.label}
              {filters.priceRange === range.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Minimum rating */}
      <FilterSection title="Minimum Rating">
        <div className="flex flex-col gap-1">
          {[0, 3, 4, 4.5].map((minR) => (
            <button
              key={minR}
              onClick={() => onFilterChange('minRating', minR)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm',
                'transition-all duration-150 text-left',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                filters.minRating === minR
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {minR === 0 ? (
                'Any rating'
              ) : (
                <>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < Math.floor(minR)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-200 text-neutral-200'}
                      />
                    ))}
                  </div>
                  <span>{minR}+ stars</span>
                </>
              )}
              {filters.minRating === minR && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* In stock only */}
      <FilterSection title="Availability">
        <label className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer
                          hover:bg-neutral-50 transition-colors">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => onFilterChange('inStockOnly', e.target.checked)}
              className="sr-only peer"
            />
            <div className={cn(
              'w-9 h-5 rounded-full transition-colors duration-200',
              filters.inStockOnly ? 'bg-primary-600' : 'bg-neutral-200'
            )} />
            <div className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
              'transition-transform duration-200',
              filters.inStockOnly ? 'translate-x-4' : 'translate-x-0'
            )} />
          </div>
          <span className="text-sm text-neutral-700">In stock only</span>
        </label>
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  )
}
