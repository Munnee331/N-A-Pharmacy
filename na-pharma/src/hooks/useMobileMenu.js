import { useState, useEffect } from 'react'

/**
 * Manages mobile navigation menu open/close state.
 * Locks body scroll when the menu is open.
 *
 * @param {boolean} initialState - Initial open state (default: false)
 * @returns {{ isOpen: boolean, toggle: () => void, close: () => void }}
 */
export default function useMobileMenu(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    // Restore on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function toggle() {
    setIsOpen((prev) => !prev)
  }

  function close() {
    setIsOpen(false)
  }

  return { isOpen, toggle, close }
}
