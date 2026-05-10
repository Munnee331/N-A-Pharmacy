import { cn } from '../../utils/cn'

/**
 * Accessible form input with label, helper text, error state, and icon slots.
 *
 * @param {object} props
 * @param {string} props.label - Visible label text
 * @param {string} props.error - Error message (triggers red border)
 * @param {string} props.helperText - Subtle hint text below the input
 * @param {React.ReactNode} props.leftIcon - Icon inside the left edge
 * @param {React.ReactNode} props.rightIcon - Icon inside the right edge
 */
export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...rest
}) {
  // Derive a stable id from the label if none provided
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const errorId = inputId ? `${inputId}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Left icon */}
        {leftIcon && (
          <span className="absolute left-3 text-neutral-400 pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-base text-neutral-900',
            'placeholder:text-neutral-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:border-primary-500',
            'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-neutral-300',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...rest}
        />

        {/* Right icon */}
        {rightIcon && (
          <span className="absolute right-3 text-neutral-400 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <p className="text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  )
}
