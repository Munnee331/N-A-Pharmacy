/**
 * CartContext — global cart state.
 *
 * Persists to localStorage so the cart survives page refreshes.
 * Cart items shape:
 *   {
 *     id:           string   (medicine._id)
 *     name:         string
 *     brand:        string
 *     price:        number
 *     originalPrice: number | null
 *     quantity:     number
 *     image:        string
 *     category:     string
 *     inStock:      boolean
 *     requiresPrescription: boolean
 *   }
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'na_pharma_cart'

function loadCart () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart (items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore quota errors */ }
}

export function CartProvider ({ children }) {
  const [items, setItems] = useState(loadCart)

  // Persist on every change
  useEffect(() => {
    saveCart(items)
  }, [items])

  // ── Actions ─────────────────────────────────────────────────────────────

  /** Add a single item. If it already exists, increment quantity. */
  const addItem = useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        )
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 }]
    })
  }, [])

  /**
   * Add multiple items at once (e.g. from an approved prescription).
   * If an item already exists in the cart, its quantity is increased.
   * Returns { added: number, merged: number }.
   */
  const addItems = useCallback((newItems) => {
    let added  = 0
    let merged = 0

    setItems((prev) => {
      const next = [...prev]
      for (const item of newItems) {
        const idx = next.findIndex((i) => i.id === item.id)
        if (idx !== -1) {
          // Already in cart — increase quantity instead of duplicating
          next[idx] = { ...next[idx], quantity: next[idx].quantity + (item.quantity ?? 1) }
          merged++
        } else {
          next.push({ ...item, quantity: item.quantity ?? 1 })
          added++
        }
      }
      return next
    })

    return { added, merged }
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        addItems,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart () {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
