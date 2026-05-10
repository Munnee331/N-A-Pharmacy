import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

/**
 * Pagination controls for the shop product grid.
 *
 * @param {object}   props
 * @param {number}   props.currentPage  - 1-indexed
 * @param {number}   props.totalPages
 * @param {Function} props.onPageChange - (page: number) => void
 */
export default function ShopPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Build the page number array with ellipsis logic
  function getPageNumbers() {
    const pages = []
    const delta = 1 // pages on each side of current

    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd   = Math.min(totalPages - 1, currentPage + delta)

    pages.push(1)

    if (rangeStart > 2) pages.push('...')

    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)

    if (rangeEnd < totalPages - 1) pages.push('...')

    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  const pages = getPageNumbers()

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handlePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)
    scrollToTop()
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 py-10"
    >
      {/* Previous */}
      <button
        onClick={() => handlePage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          currentPage === 1
            ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-white'
            : 'border-neutral-200 text-neutral-600 bg-white hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
        )}
      >
        <ChevronLeft size={15} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-neutral-400 text-sm"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                page === currentPage
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-neutral-200 text-neutral-600 bg-white hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => handlePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          currentPage === totalPages
            ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-white'
            : 'border-neutral-200 text-neutral-600 bg-white hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={15} />
      </button>
    </motion.nav>
  )
}
