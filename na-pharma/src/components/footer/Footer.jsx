import FooterBrand from './FooterBrand'
import FooterLinks from './FooterLinks'
import FooterContact from './FooterContact'
import FooterSocial from './FooterSocial'
import FooterNewsletter from './FooterNewsletter'

// Navigation link sections
const FOOTER_SECTIONS = [
  {
    heading: 'Quick Links',
    links: [
      { label: 'Home',      to: '/' },
      { label: 'Shop',      to: '/shop' },
      { label: 'About Us',  to: '/about' },
      { label: 'Contact',   to: '/contact' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Prescriptions',   to: '/shop' },
      { label: 'Consultations',   to: '/contact' },
      { label: 'Home Delivery',   to: '/shop' },
      { label: 'Returns Policy',  to: '/about' },
    ],
  },
]

/**
 * Site-wide footer component.
 * Responsive: 1-column mobile → 2-column tablet → 4-column desktop.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer data-testid="footer" className="bg-neutral-900">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand + Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterBrand />
            <FooterSocial />
          </div>

          {/* Columns 2 & 3 — Navigation links */}
          <FooterLinks sections={FOOTER_SECTIONS} startIndex={1} />

          {/* Column 4 — Contact + Newsletter */}
          <div className="flex flex-col gap-8">
            <FooterContact />
            <FooterNewsletter />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            data-testid="footer-copyright"
            className="text-neutral-500 text-sm text-center sm:text-left"
          >
            © {currentYear} N A Pharma. All rights reserved.
          </p>
          <p className="text-neutral-600 text-xs">
            Designed with care for your health.
          </p>
        </div>
      </div>
    </footer>
  )
}
