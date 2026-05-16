import { cn } from '../../utils/cn'

/**
 * Reusable loading spinner.
 *
 * @param {object} props
 * @param {boolean} [props.fullPage] - Centers spinner in the full viewport
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.className]
 */
export default function LoadingSpinner({ fullPage = false, size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-primary-200 border-t-primary-600 animate-spin',
        sizeClasses[size],
        className
      )}
    />
  )

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        {spinner}
        <p className="text-sm text-neutral-400 font-medium">Loading…</p>
      </div>
    )
  }

  return spinner
}
