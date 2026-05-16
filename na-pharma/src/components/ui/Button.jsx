import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

// Variant styles map
const variantStyles = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800',
  outline:   'border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  ghost:     'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

// Size styles map
const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-base rounded-xl gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
}

/**
 * Polymorphic button component.
 *
 * Renders as a <button> by default. Pass `as={Link}` (or any component / tag)
 * to render as that element instead — all styling and props are forwarded.
 *
 * @param {object}  props
 * @param {React.ElementType} [props.as='button'] - Element or component to render as
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean}  [props.isLoading=false] - Shows spinner and disables interaction
 * @param {React.ReactNode} [props.leftIcon]  - Icon before label
 * @param {React.ReactNode} [props.rightIcon] - Icon after label
 * @param {React.ReactNode} props.children
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...rest
}) {
  // <button> supports disabled; other elements (Link, a) do not — handle gracefully
  const isNativeButton = Component === 'button'

  return (
    <Component
      {...(isNativeButton ? { disabled: disabled || isLoading } : {})}
      aria-disabled={!isNativeButton && (disabled || isLoading) ? true : undefined}
      className={cn(
        // Base
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant + size
        variantStyles[variant],
        sizeStyles[size],
        // Visually disable non-button elements
        (disabled || isLoading) && !isNativeButton && 'opacity-50 pointer-events-none',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </Component>
  )
}
