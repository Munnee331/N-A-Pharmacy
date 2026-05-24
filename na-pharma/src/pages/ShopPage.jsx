import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PackageSearch, RotateCcw } from 'lucide-react'

import { PRICE_RANGES, CATEGORIES, SORT_OPTIONS } from '../data/medicines'
import { getMedicines } from '../api/medicineApi'
import MedicineCard from '../components/shop/MedicineCard'
import ShopHero from '../components/shop/ShopHero'
import ShopFilters from '../components/shop/ShopFilters'
import ShopPagination from '../components/shop/ShopPagination'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import usePageMeta from '../hooks/usePageMeta'
import Button from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import showToast from '../utils/toast'

const ITEMS_PER_PAGE = 16

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
  usePageMeta('Shop', 'Browse 10,000+ certified medicines and healthcare products with fast delivery.')
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search:   searchParams.get('q')        || '',
    category: searchParams.get('category') || 'All',
  }))
  const [currentPage, setCurrentPage] = useState(1)
  const [drawerOpen, setDrawerOpen]   = useState(false)

  // ── Real API data ────────────────────────────────────────────────────
  const [medicines, setMedicines]   = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [apiError, setApiError]     = useState(false)

  const { addItem } = useCart()

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    setApiError(false)
    try {
      const params = {
        page:  currentPage,
        limit: ITEMS_PER_PAGE,
      }
      if (filters.search.trim())       params.search   = filters.search.trim()
      if (filters.category !== 'All')  params.category = filters.category.toLowerCase()
      if (filters.inStockOnly)         params.inStock  = true
      if (filters.minRating > 0)       params.minRating = filters.minRating

      // Map sort values to backend sort params
      const sortMap = {
        'price-asc':   'price',
        'price-desc':  '-price',
        'rating-desc': '-ratings.average',
        'newest':      '-createdAt',
        'featured':    '-isFeatured',
      }
      if (sortMap[filters.sort]) params.sort = sortMap[filters.sort]

      const data = await getMedicines(params)
      // Normalise backend medicine shape to match MedicineCard props
      const normalised = (data.medicines ?? []).map((m) => ({
        id:                   m._id,
        name:                 m.name,
        brand:                m.brand,
        price:                m.price,
        originalPrice:        m.discountPrice ?? null,
        category:             m.category.charAt(0).toUpperCase() + m.category.slice(1),
        inStock:              m.stock > 0,
        rating:               m.ratings?.average ?? 0,
        reviewCount:          m.ratings?.count   ?? 0,
        badge:                m.isFeatured ? 'Featured' : null,
        image:                m.image || null,
        prescriptionRequired: m.prescriptionRequired,
      }))

      // Client-side price range filter (backend doesn't support it yet)
      const range = PRICE_RANGES.find((r) => r.value === filters.priceRange)
      const filtered = range && filters.priceRange !== 'all'
        ? normalised.filter((m) => m.price >= range.min && m.price <= range.max)
        : normalised

      setMedicines(filtered)
      setTotalCount(data.pagination?.total ?? filtered.length)
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch {
      setApiError(true)
      setMedicines([])
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  useEffect(() => { fetchMedicines() }, [fetchMedicines])
  useEffect(() => { setCurrentPage(1) }, [filters])

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }

  function handleAddToCart(medicine) {
    if (!medicine.inStock) return
    addItem({
      id:                   String(medicine.id),
      name:                 medicine.name,
      brand:                medicine.brand,
      price:                medicine.price,
      originalPrice:        medicine.originalPrice ?? null,
      quantity:             1,
      image:                medicine.image ?? '',
      category:             medicine.category,
      inStock:              medicine.inStock,
      requiresPrescription: medicine.prescriptionRequired ?? false,
    })
    showToast.success(`${medicine.name.split(' ').slice(0, 3).join(' ')} added to cart`)
  }

  return (
    <div data-testid="shop-page" className="min-h-screen bg-neutral-50">

      {/* ── Hero / Header ── */}
      <ShopHero
        totalResults={loading ? 0 : totalCount}
        searchQuery={filters.search}
        activeCategory={filters.category}
      />

      {/* ── Search bar + sort bar (sticky) ── */}
      <ShopFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        drawerOpen={drawerOpen}
        onDrawerToggle={() => setDrawerOpen((v) => !v)}
        totalResults={loading ? 0 : totalCount}
      />

      {/* ── Main content: sidebar + grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)] items-start">

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                      Product Filter
                    </p>
                    <h2 className="text-xl font-semibold text-neutral-900">Refine results</h2>
                  </div>
                  <span className="text-sm text-neutral-500">{loading ? 0 : totalCount} items</span>
                </div>
                <ShopFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  drawerOpen={false}
                  onDrawerToggle={() => {}}
                  totalResults={loading ? 0 : totalCount}
                  sidebarOnly
                />
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-neutral-500">
                  Showing <span className="font-semibold text-neutral-900">{loading ? 0 : totalCount}</span> products
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
                <span>Sorted by</span>
                <span className="font-semibold text-neutral-900">
                  {SORT_OPTIONS.find((opt) => opt.value === filters.sort)?.label ?? 'Featured'}
                </span>
              </div>
            </div>

            <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

            <AnimatePresence mode="wait">
              {/* Loading skeletons */}
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} variant="card" />
                  ))}
                </motion.div>
              ) : apiError ? (
                /* API error state */
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-20 px-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                    <PackageSearch size={28} className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Could not load medicines</h3>
                  <p className="text-neutral-500 text-sm max-w-xs mb-6">
                    There was a problem connecting to the server. Please try again.
                  </p>
                  <Button onClick={fetchMedicines} variant="outline" size="sm" leftIcon={<RotateCcw size={14} />}>
                    Retry
                  </Button>
                </motion.div>
              ) : medicines.length === 0 ? (
                <EmptyState key="empty" onReset={handleReset} />
              ) : (
                <motion.div
                  key={`page-${currentPage}-${filters.category}-${filters.search}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {medicines.map((medicine, i) => (
                      <motion.div
                        key={medicine.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="h-full"
                      >
                        <MedicineCard
                          {...medicine}
                          onAddToCart={() => handleAddToCart(medicine)}
                          onAddToWishlist={() => showToast.info('Wishlist coming soon')}
                        />
                      </motion.div>
                    ))}
                  </div>

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
