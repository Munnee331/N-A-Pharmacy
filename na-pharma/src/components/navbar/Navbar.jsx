import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import useScrolled from '../../hooks/useScrolled'
import useMobileMenu from '../../hooks/useMobileMenu'
import useCartCount from '../../hooks/useCartCount'
import useWishlistCount from '../../hooks/useWishlistCount'
import NavLinks from './NavLinks'
import NavActions from './NavActions'
import HamburgerButton from './HamburgerButton'
import MobileDrawer from './MobileDrawer'
import { NAV_LINKS } from '../../routes/index'

/**
 * Sticky top navigation bar.
 * Handles scroll shadow, desktop links, mobile drawer, cart/wishlist counts.
 */
export default function Navbar() {
  const isScrolled = useScrolled(20)
  const { isOpen, toggle, close } = useMobileMenu()
  const cartCount = useCartCount()
  const wishlistCount = useWishlistCount()

  return (
    <>
      <header
        data-testid="navbar"
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 bg-white transition-shadow duration-300',
          isScrolled ? 'shadow-soft' : 'shadow-none'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 focus:outline-none
                       focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
          >
            {/* Brand mark */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold leading-none">N</span>
            </div>
            <span className="font-semibold text-neutral-800 text-base tracking-tight">
              N A <span className="text-primary-600">Pharma</span>
            </span>
          </Link>

          {/* Desktop nav links — center */}
          <nav className="hidden md:flex flex-1 justify-center">
            <NavLinks links={NAV_LINKS} />
          </nav>

          {/* Desktop actions — right */}
          <div className="hidden md:flex items-center">
            <NavActions cartCount={cartCount} wishlistCount={wishlistCount} />
          </div>

          {/* Mobile: cart + wishlist icons + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <NavActions cartCount={cartCount} wishlistCount={wishlistCount} />
            <HamburgerButton isOpen={isOpen} onClick={toggle} />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={isOpen}
        onClose={close}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  )
}
