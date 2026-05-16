import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Star, BadgeCheck, Package } from 'lucide-react'
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
 * @param {number}   props.rating         - 0–5
 * @param {number}   props.reviewCount
 * @param {string}   [props.badge]        - e.g. "Bestseller"
 * @param {() => void} props.onAddToCart
 * @param {() => void} props.onAddToWishlist
 */
export default function MedicineCard({
  name,
  brand,
  price,
  originalPrice,
  image,
  category,
  inStock = true,
  rating = 0,
  reviewCount = 0,
  badge,
  onAddToCart,
  onAddToWishlist,
}) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

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
                 shadow-soft hover:shadow-soft-lg transition-shadow overflow-hidden
                 flex flex-col h-full"
    >
      {/* ── Image area ── */}
      <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 aspect-[4/3] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-4 transition-transform duration-300
                       group-hover:scale-105"
          />
        ) : (
          /* Placeholder illustration */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Package size={28} className="text-primary-500" />
            </div>
            <span className="text-xs text-neutral-400 font-medium">{category}</span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full
                           bg-red-500 text-white text-[11px] font-bold">
            -{discountPct}%
          </span>
        )}

        {/* Custom badge (Bestseller, New, etc.) */}
        {badge && !discountPct && (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full
                           bg-primary-600 text-white text-[11px] font-semibold">
            {badge}
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-white/90 text-neutral-700
                             text-xs font-semibold shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white shadow-sm
                     flex items-center justify-center transition-all duration-200
                     hover:scale-110 focus:outline-none focus:ring-2
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
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Category + verified */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-primary-600 bg-primary-50
                           px-2 py-0.5 rounded-full">
            {category}
          </span>
          <BadgeCheck size={14} className="text-primary-500" aria-label="Certified" />
        </div>

        {/* Name + brand */}
        <div>
          <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 mb-0.5">
            {name}
          </h3>
          <p className="text-xs text-neutral-400">{brand}</p>
        </div>

        {/* Rating */}
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

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-neutral-900">
            ৳{price.toLocaleString()}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-neutral-400 line-through">
              ৳{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          variant={addedToCart ? 'ghost' : 'primary'}
          size="sm"
          className="w-full"
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
