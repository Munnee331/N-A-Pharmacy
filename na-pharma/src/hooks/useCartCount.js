import { useCart } from '../context/CartContext.jsx'

/**
 * Returns the total number of items in the cart (sum of all quantities).
 * Reads from CartContext.
 *
 * @returns {number}
 */
export default function useCartCount () {
  const { totalItems } = useCart()
  return totalItems
}
