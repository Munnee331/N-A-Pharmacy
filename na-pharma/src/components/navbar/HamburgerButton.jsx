import { motion } from 'framer-motion'

/**
 * Animated hamburger / close toggle button for mobile navigation.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClick
 */
export default function HamburgerButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle navigation menu"
      aria-expanded={isOpen}
      className="flex flex-col justify-center items-center w-10 h-10 rounded-xl
                 hover:bg-neutral-100 transition-colors focus:outline-none
                 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {/* Top bar */}
      <motion.span
        animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        className="block w-5 h-0.5 bg-neutral-700 rounded-full"
      />
      {/* Middle bar */}
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        className="block w-5 h-0.5 bg-neutral-700 rounded-full mt-1.5"
      />
      {/* Bottom bar */}
      <motion.span
        animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        className="block w-5 h-0.5 bg-neutral-700 rounded-full mt-1.5"
      />
    </button>
  )
}
