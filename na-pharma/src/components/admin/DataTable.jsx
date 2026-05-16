import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import LoadingSkeleton from '../ui/LoadingSkeleton'

/**
 * Sortable, accessible data table for admin views.
 *
 * @param {object}   props
 * @param {Array}    props.columns      - Array of { key, label, render? } column definitions
 * @param {Array}    props.data         - Array of row data objects
 * @param {boolean}  props.isLoading    - When true, renders skeleton rows
 * @param {string}   props.emptyMessage - Message shown when data is empty and not loading
 */
export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data available.',
}) {
  const [sort, setSort] = useState({ key: null, direction: 'asc' })

  // Cycle: asc → desc → null (unsorted)
  function handleSort(colKey) {
    setSort((prev) => {
      if (prev.key !== colKey) {
        return { key: colKey, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key: colKey, direction: 'desc' }
      }
      // desc → unsorted
      return { key: null, direction: 'asc' }
    })
  }

  // Derive sorted rows
  const sortedData = (() => {
    if (!sort.key) return data
    return [...data].sort((a, b) => {
      const aVal = a[sort.key]
      const bVal = b[sort.key]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      if (aStr < bStr) return sort.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  })()

  function getSortIcon(colKey) {
    if (sort.key !== colKey) {
      return <ChevronsUpDown className="w-4 h-4 text-neutral-400" aria-hidden="true" />
    }
    if (sort.direction === 'asc') {
      return <ChevronUp className="w-4 h-4 text-primary-600" aria-hidden="true" />
    }
    return <ChevronDown className="w-4 h-4 text-primary-600" aria-hidden="true" />
  }

  function getAriaSort(colKey) {
    if (sort.key !== colKey) return undefined
    return sort.direction === 'asc' ? 'ascending' : 'descending'
  }

  function getSortAriaLabel(label, colKey) {
    if (sort.key !== colKey || sort.direction === 'desc') {
      return `Sort by ${label} ascending`
    }
    return `Sort by ${label} descending`
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-soft">
      <table
        role="table"
        className="min-w-full divide-y divide-neutral-200 bg-white"
      >
        {/* Header */}
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={getAriaSort(col.key)}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
              >
                <button
                  type="button"
                  onClick={() => handleSort(col.key)}
                  aria-label={getSortAriaLabel(col.label, col.key)}
                  className="inline-flex items-center gap-1 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded transition-colors"
                >
                  {col.label}
                  {getSortIcon(col.key)}
                </button>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-neutral-100">
          {isLoading ? (
            // 5 skeleton rows
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={columns.length} className="px-4 py-2">
                  <LoadingSkeleton variant="table-row" />
                </td>
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-neutral-500 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="hover:bg-neutral-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
