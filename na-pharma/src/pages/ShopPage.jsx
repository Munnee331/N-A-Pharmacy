import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PackageSearch, RotateCcw } from 'lucide-react'

import { ALL_MEDICINES, PRICE_RANGES } from '../data/medicines'
import MedicineCard from '../components/shop/MedicineCard'
import ShopHero from '../components/shop/ShopHero'
import ShopFilters from '../components/shop/ShopFilters'
import ShopPagination from '../components/shop/ShopPagination'
import Button from '../components/ui/Button'

const ITEMS_PER_PAGE = 12

// Default filter state — single source of truth
const DEFAULT_FILTERS = {
  search:      '',
  category:    'All',
  priceRange:  'all',
  minRating:   0,
  inStockOnly: false,
  sort:        'featured',
}

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    // Pre-fill from URL query params (e.g. /shop?q=paracetamol&category=Tablet)
    search:   searchParams.get('q')        || '',
    category: searchParams.get('category') || 'All',
  }))
  const [currentPage, setCurrentPage]   = useState(1)
  const [drawerOpen, setDrawerOpen]     = useState(false)

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1) }, [filters])

  // ── Filter + sort logic (pure, no backend) ──────────────────────────────
  const filteredMedicines = useMemo(() => {
    let result = [...ALL_MEDICINES]

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
    }

    // Category
    if (filters.category !== 'All') {
      result = result.filter((m) => m.category === filters.category)
    }

    // Price range
    if (filters.priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.value === filters.priceRange)
      if (range) {
        result = result.filter((m) => m.price >= range.min && m.price <= range.max)
      }
    }

    // Minimum rating
    if (filters.minRating > 0) {
      result = result.filter((m) => m.rating >= filters.minRating)
    }

    // In stock only
    if (filters.inStockOnly) {
      result = result.filter((m) => m.inStock)
    }

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => b.id - a.id)
        break
      default:
        // 'featured' — keep original order, but put badged items first
        result.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0))
    }

    return result
  }, [filters])

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE)
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }

  return (
    <div data-testid="shop-page" className="min-h-screen bg-neutral-50">

      {/* ── Hero / Header ── */}
      <ShopHero
        totalResults={filteredMedicines.length}
        searchQuery={filters.search}
        activeCategory={filters.category}
      />

      {/* ── Search bar + sort bar (sticky) ── */}
      <ShopFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        drawerOpen={drawerOpen}
        onDrawerToggle={() => setDrawerOpen((v) => !v)}
        totalResults={filteredMedicines.length}
      />

      {/* ── Main content: sidebar + grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* Desktop sidebar — rendered by ShopFilters */}
          <ShopFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            drawerOpen={false}
            onDrawerToggle={() => {}}
            totalResults={filteredMedicines.length}
          />

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">

            {/* Active filter chips */}
            <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

            {/* Grid or empty state */}
            <AnimatePresence mode="wait">
              {paginatedMedicines.length === 0 ? (
                <EmptyState key="empty" onReset={handleReset} />
              ) : (
                <motion.div
                  key={`page-${currentPage}-${filters.category}-${filters.search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {paginatedMedicines.map((medicine, i) => (
                      <motion.div
                        key={medicine.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                      >
                        <MedicineCard
                          {...medicine}
                          onAddToCart={() => console.log('Cart:', medicine.name)}
                          onAddToWishlist={() => console.log('Wishlist:', medicine.name)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <ShopPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Active filter chips row
───────────────────────────────────────────── */
function ActiveFilterChips({ filters, onFilterChange, onReset }) {
  const chips = []

  if (filters.category !== 'All')
    chips.push({ label: filters.category, onRemove: () => onFilterChange('category', 'All') })
  if (filters.priceRange !== 'all') {
    const range = PRICE_RANGES.find((r) => r.value === filters.priceRange)
    chips.push({ label: range?.label, onRemove: () => onFilterChange('priceRange', 'all') })
  }
  if (filters.minRating > 0)
    chips.push({ label: `${filters.minRating}+ stars`, onRemove: () => onFilterChange('minRating', 0) })
  if (filters.inStockOnly)
    chips.push({ label: 'In Stock', onRemove: () => onFilterChange('inStockOnly', false) })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="text-xs text-neutral-500 font-medium">Active filters:</span>
      {chips.map(({ label, onRemove }) => (
        <button
          key={label}
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                     bg-primary-50 text-primary-700 border border-primary-200
                     text-xs font-medium hover:bg-primary-100 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {label}
          <span aria-hidden="true" className="text-primary-400 hover:text-primary-600">×</span>
        </button>
      ))}
      <button
        onClick={onReset}
        className="text-xs text-neutral-400 hover:text-red-500 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1"
      >
        Clear all
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Empty state
───────────────────────────────────────────── */
function EmptyState({ onReset }) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center text-center py-20 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
        <PackageSearch size={28} className="text-neutral-400" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">No medicines found</h3>
      <p className="text-neutral-500 text-sm max-w-xs mb-6">
        We couldn't find any products matching your current filters. Try adjusting your search or clearing the filters.
      </p>
      <Button
        onClick={onReset}
        variant="outline"
        size="sm"
        leftIcon={<RotateCcw size={14} />}
      >
        Reset Filters
      </Button>
    </motion.div>
  )
}
