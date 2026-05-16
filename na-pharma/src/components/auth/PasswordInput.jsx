import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Password input with show/hide toggle.
 * Fully accessible — toggle button has aria-label, input type switches.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.placeholder]
 * @param {string} [props.id]
 * @param {string} [props.value]
 * @param {Function} [props.onChange]
 */
export default function PasswordInput({
  label,
  error,
  helperText,
  placeholder = '••••••••',
  id,
  value,
  onChange,
  className,
  ...rest
}) {
  const [visible, setVisible] = useState(false)

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'password')
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Lock icon */}
        <span className="absolute left-3 text-neutral-400 pointer-events-none">
          <Lock size={16} />
        </span>

        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-xl border bg-white pl-10 pr-11 py-2.5 text-base text-neutral-900',
            'placeholder:text-neutral-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:border-primary-500',
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300',
            className
          )}
          {...rest}
        />

        {/* Show/hide toggle */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 text-neutral-400 hover:text-neutral-600
                     transition-colors focus:outline-none focus:ring-2
                     focus:ring-primary-500 rounded-md p-0.5"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600 flex items-center gap-1.5" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  )
}
