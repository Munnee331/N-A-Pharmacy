import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Computes password strength score (0–4) and which rules pass.
 */
export function getPasswordStrength(password) {
  const rules = [
    { id: 'length',   label: 'At least 8 characters', pass: password.length >= 8 },
    { id: 'upper',    label: 'One uppercase letter',   pass: /[A-Z]/.test(password) },
    { id: 'number',   label: 'One number',             pass: /\d/.test(password) },
    { id: 'special',  label: 'One special character',  pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = rules.filter((r) => r.pass).length
  return { score, rules }
}

const STRENGTH_CONFIG = [
  { label: 'Too weak',  color: 'bg-red-500',    text: 'text-red-600' },
  { label: 'Weak',      color: 'bg-orange-400',  text: 'text-orange-600' },
  { label: 'Fair',      color: 'bg-amber-400',   text: 'text-amber-600' },
  { label: 'Good',      color: 'bg-primary-500', text: 'text-primary-600' },
  { label: 'Strong',    color: 'bg-green-500',   text: 'text-green-600' },
]

/**
 * Visual password strength indicator with rule checklist.
 *
 * @param {object} props
 * @param {string} props.password
 */
export default function PasswordStrengthBar({ password }) {
  if (!password) return null

  const { score, rules } = getPasswordStrength(password)
  const config = STRENGTH_CONFIG[score]

  return (
    <div className="flex flex-col gap-3 mt-1">
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-500">Password strength</span>
          <span className={cn('text-xs font-semibold', config.text)}>{config.label}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i < score ? '100%' : '0%' }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={cn('h-full rounded-full', i < score ? config.color : '')}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rule checklist */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {rules.map(({ id, label, pass }) => (
          <li key={id} className="flex items-center gap-1.5 text-xs">
            <span className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
              pass ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
            )}>
              {pass ? <Check size={9} strokeWidth={3} /> : <X size={9} strokeWidth={3} />}
            </span>
            <span className={pass ? 'text-neutral-700' : 'text-neutral-400'}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
