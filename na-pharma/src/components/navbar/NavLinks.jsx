import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

/**
 * Navigation links list — used in both desktop navbar and mobile drawer.
 *
 * @param {object} props
 * @param {Array<{label: string, to: string}>} props.links
 * @param {() => void} [props.onLinkClick] - Called when a link is clicked (closes mobile drawer)
 * @param {boolean} [props.mobile] - Applies mobile-specific styles
 */
export default function NavLinks({ links, onLinkClick, mobile = false }) {
  return (
    <ul className={cn(
      'flex',
      mobile ? 'flex-col gap-1' : 'flex-row items-center gap-1'
    )}>
      {links.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            end={link.to === '/'}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'relative block font-medium transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg',
                mobile
                  ? cn(
                      'px-4 py-3 text-base rounded-xl',
                      isActive
                        ? 'text-primary-600 bg-primary-50 font-semibold'
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                    )
                  : cn(
                      'px-3 py-2 text-sm',
                      isActive
                        ? 'text-primary-600 font-semibold nav-link-active'
                        : 'text-neutral-600 hover:text-primary-600'
                    )
              )
            }
          >
            {({ isActive }) => (
              <motion.span
                whileHover={mobile ? {} : { y: -1 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {link.label}
                {/* Active underline indicator (desktop only) */}
                {!mobile && isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                  />
                )}
              </motion.span>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
