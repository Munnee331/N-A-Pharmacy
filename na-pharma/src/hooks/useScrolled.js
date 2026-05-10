import { useState, useEffect } from 'react'

/**
 * Returns true when the user has scrolled past the given threshold (px).
 * Useful for adding a shadow to a sticky navbar on scroll.
 *
 * @param {number} threshold - Scroll distance in px before returning true (default: 20)
 * @returns {boolean}
 */
export default function useScrolled(threshold = 20) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > threshold)
    }

    // Check initial position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrolled
}
