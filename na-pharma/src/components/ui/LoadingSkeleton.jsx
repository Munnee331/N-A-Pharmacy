import { cn } from '../../utils/cn'

// Shape classes per variant
const variantClasses = {
  text:        'h-4 w-full rounded',
  card:        'h-48 w-full rounded-2xl',
  avatar:      'h-10 w-10 rounded-full',
  'table-row': 'h-12 w-full rounded-lg',
}

/**
 * Shimmer placeholder for loading states.
 *
 * @param {object} props
 * @param {'text'|'card'|'avatar'|'table-row'} props.variant
 * @param {number} props.count - Number of skeleton items to render
 * @param {string} props.className
 */
export default function LoadingSkeleton({ variant = 'text', count = 1, className }) {
  const items = Array.from({ length: count })

  const item = (key) => (
    <div
      key={key}
      className={cn(
        'bg-neutral-200 animate-pulse',
        variantClasses[variant],
        className
      )}
    />
  )

  if (count === 1) return item(0)

  return (
    <div className="flex flex-col gap-3">
      {items.map((_, i) => item(i))}
    </div>
  )
}
