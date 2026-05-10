import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

/**
 * Right-side navbar actions: cart icon, wishlist icon, login/register buttons.
 *
 * @param {object} props
 * @param {number} props.cartCount
 * @param {number} props.wishlistCount
 * @param {() => void} [props.onLinkClick] - Called on any action click (closes mobile drawer)
 * @param {boolean} [props.mobile] - Stacks buttons vertically in mobile drawer
 */
export default function NavActions({ cartCount, wishlistCount, onLinkClick, mobile = false }) {
  return (
    <div className={cn(
      'flex items-center',
      mobile ? 'flex-col gap-3 pt-4 border-t border-neutral-100' : 'flex-row gap-2'
    )}>
      {/* Icon buttons (hidden in mobile stacked view — shown inline) */}
      <div className={cn('flex items-center gap-1', mobile && 'mb-1')}>
        {/* Cart */}
        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.15 }}>
          <Link
            to="/shop"
            onClick={onLinkClick}
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl
                       text-neutral-600 hover:text-primary-600 hover:bg-primary-50
                       transition-colors focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:ring-offset-2"
          >
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                             bg-primary-600 text-white text-[10px] font-bold
                             rounded-full flex items-center justify-center"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        {/* Wishlist */}
        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.15 }}>
          <Link
            to="/dashboard"
            onClick={onLinkClick}
            aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl
                       text-neutral-600 hover:text-primary-600 hover:bg-primary-50
                       transition-colors focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:ring-offset-2"
          >
            <Heart size={20} />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span
                  key="wish-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                             bg-primary-600 text-white text-[10px] font-bold
                             rounded-full flex items-center justify-center"
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      </div>

      {/* Login / Register */}
      <div className={cn('flex gap-2', mobile && 'w-full flex-col')}>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}
          className={mobile ? 'w-full' : ''}>
          <Button
            as={Link}
            to="/login"
            variant="outline"
            size="sm"
            onClick={onLinkClick}
            className={mobile ? 'w-full justify-center' : ''}
          >
            Login
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}
          className={mobile ? 'w-full' : ''}>
          <Button
            as={Link}
            to="/register"
            variant="primary"
            size="sm"
            onClick={onLinkClick}
            className={mobile ? 'w-full justify-center' : ''}
          >
            Register
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
