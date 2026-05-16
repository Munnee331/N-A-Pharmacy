import { useEffect } from 'react'

const SITE_NAME = 'N A Pharma'
const DEFAULT_DESCRIPTION =
  'N A Pharma — Your trusted online pharmacy. Browse 10,000+ certified medicines with fast delivery across Bangladesh.'

/**
 * Sets the document title and meta description for a page.
 * Call at the top of each page component.
 *
 * @param {string} title - Page-specific title (e.g. "Shop")
 * @param {string} [description] - Optional meta description override
 *
 * @example
 * usePageMeta('Shop', 'Browse certified medicines and healthcare products.')
 */
export default function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    // Set document title
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description)

    // Cleanup: restore default title on unmount
    return () => {
      document.title = SITE_NAME
    }
  }, [title, description])
}
