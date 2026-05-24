import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, BadgeCheck, Package, ShieldCheck } from 'lucide-react'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'

/**
 * Product card for medicine listings.
 *
 * @param {object} props
 * @param {string}   props.name
 * @param {string}   props.brand
 * @param {number}   props.price
 * @param {number}   [props.originalPrice]
 * @param {string}   props.image          - URL or null for placeholder
 * @param {string}   props.category
 * @param {boolean}  props.inStock
 * @param {number}   props.reviewCount
 * @param {string}   [props.badge]        - e.g. "Bestseller"
 * @param {() => void} props.onAddToCart
 * @param {() => void} props.onAddToWishlist
 */
export default function MedicineCard({
  id,
  slug,
  name,
  brand,
  rating = 0,
  price,
  originalPrice,
  image,
  category,
  inStock = true,
  reviewCount = 0,
  badge,
  onAddToCart,
  onAddToWishlist,
}) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const detailTo = id || slug ? `/shop/${slug || id}` : null

  const discountPct =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  function handleWishlist() {
    setIsWishlisted((prev) => !prev)
    onAddToWishlist?.()
  }

  function handleAddToCart() {
    if (!inStock) return
    setAddedToCart(true)
    onAddToCart?.()
    setTimeout(() => setAddedToCart(false), 1800)
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border border-neutral-100
                 shadow-soft hover:shadow-soft-lg hover:border-primary-100
                 transition-all duration-200 overflow-hidden flex flex-col h-full"
    >
      {/* ── Image area ── */}
      <div className="relative bg-gradient-to-br from-neutral-50 via-white to-primary-50/40 aspect-[4/3] overflow-hidden">
        {image ? (
          detailTo ? (
            <Link to={detailTo} aria-label={`View details for ${name}`} className="block h-full w-full">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-contain p-5 transition-transform duration-300
                           group-hover:scale-105"
              />
            </Link>
          ) : (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-5 transition-transform duration-300
                       group-hover:scale-105"
          />
          )
        ) : (
          /* Placeholder illustration */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-primary-100 shadow-sm flex items-center justify-center">
              <Package size={28} className="text-primary-500" />
            </div>
            <span className="text-xs text-neutral-400 font-medium">{category}</span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                           bg-red-500 text-white text-[11px] font-bold shadow-sm">
            -{discountPct}%
          </span>
        )}

        {/* Custom badge (Bestseller, New, etc.) */}
        {badge && !discountPct && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                           bg-primary-600 text-white text-[11px] font-semibold shadow-sm">
            {badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-neutral-900/55 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-white/95 text-neutral-700
                             text-xs font-semibold shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/95 shadow-sm
                     border border-white/80
                     flex items-center justify-center transition-all duration-200
                     hover:scale-105 hover:text-red-500 focus:outline-none focus:ring-2
                     focus:ring-primary-500 focus:ring-offset-1"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isWishlisted ? 'filled' : 'empty'}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              <Heart
                size={15}
                className={cn(
                  'transition-colors',
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-400'
                )}
              />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* ── Content area ── */}
      <div className="flex flex-col flex-1 p-4 gap-3.5">
        {/* Category + verified */}
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[11px] font-semibold text-primary-700 bg-primary-50
                           px-2.5 py-1 rounded-full border border-primary-100">
            {category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
            <BadgeCheck size={14} className="text-primary-500" aria-label="Certified" />
            Certified
          </span>
        </div>

        {/* Name + brand */}
        <div>
          {detailTo ? (
            <Link
              to={detailTo}
              className="block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              <h3 className="font-semibold text-neutral-900 text-[15px] leading-snug line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
                {name}
              </h3>
            </Link>
          ) : (
            <h3 className="font-semibold text-neutral-900 text-[15px] leading-snug line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
              {name}
            </h3>
          )}
          <p className="text-xs text-neutral-500">{brand || 'Trusted manufacturer'}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={cn(
                    i < Math.floor(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-200 fill-neutral-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500">
              {rating.toFixed(1)}
              {reviewCount > 0 && (
                <span className="text-neutral-400"> ({reviewCount})</span>
              )}
            </span>
          </div>
          <span className={cn(
            'text-[11px] font-semibold px-2 py-1 rounded-full',
            inStock ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500'
          )}>
            {inStock ? 'In stock' : 'Unavailable'}
          </span>
        </div>

        {/* Price row */}
        <div className="mt-auto rounded-2xl bg-neutral-50 border border-neutral-100 p-3">
          <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-neutral-900">
            ৳{price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-neutral-400 line-through">
              TK{originalPrice.toLocaleString()}
            </span>
          )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <ShieldCheck size={12} className="text-primary-500" />
            Pharmacy verified product
          </div>
        </div>

        {/* Add to cart */}
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          variant={addedToCart ? 'ghost' : 'primary'}
          size="sm"
          className="w-full rounded-xl py-2.5"
          leftIcon={
            addedToCart
              ? <span className="text-primary-600">✓</span>
              : <ShoppingCart size={14} />
          }
        >
          {addedToCart ? 'Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </motion.article>
  )
}
