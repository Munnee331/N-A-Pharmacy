import { MapPin, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

const contactItems = [
  {
    icon: MapPin,
    label: '123 Healthcare Avenue, Medical District, Dhaka 1200, Bangladesh',
  },
  {
    icon: Phone,
    label: '+880 1700-000000',
    href: 'tel:+8801700000000',
  },
  {
    icon: Mail,
    label: 'support@napharma.com',
    href: 'mailto:support@napharma.com',
  },
]

/**
 * Footer contact information section.
 */
export default function FooterContact() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
        Contact Us
      </h4>
      <ul className="flex flex-col gap-3">
        {contactItems.map(({ icon: Icon, label, href }) => (
          <li key={label} className="flex items-start gap-3">
            <Icon size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
            {href ? (
              <a
                href={href}
                className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
              >
                {label}
              </a>
            ) : (
              <span className="text-neutral-400 text-sm leading-relaxed">{label}</span>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
