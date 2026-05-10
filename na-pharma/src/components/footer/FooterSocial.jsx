import { Globe, MessageCircle, AtSign, Rss } from 'lucide-react'
import { motion } from 'framer-motion'

// Lucide React doesn't include brand icons — using clean generic alternatives
const socialLinks = [
  { icon: Globe,          label: 'Website',   href: 'https://napharma.com' },
  { icon: MessageCircle,  label: 'Community', href: 'https://facebook.com' },
  { icon: AtSign,         label: 'Twitter',   href: 'https://twitter.com' },
  { icon: Rss,            label: 'Blog',      href: 'https://napharma.com/blog' },
]

/**
 * Footer social media icon links.
 */
export default function FooterSocial() {
  return (
    <div className="flex items-center gap-2 mt-5">
      {socialLinks.map(({ icon: Icon, label, href }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          whileHover={{ scale: 1.2, y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center w-9 h-9 rounded-xl
                     bg-neutral-800 text-neutral-400 hover:text-primary-400
                     hover:bg-neutral-700 transition-colors"
        >
          <Icon size={16} />
        </motion.a>
      ))}
    </div>
  )
}
