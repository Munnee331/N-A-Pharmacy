import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * Footer navigation link columns.
 *
 * @param {object} props
 * @param {Array<{heading: string, links: Array<{label: string, to: string}>}>} props.sections
 * @param {number} props.startIndex - Used for staggered animation delay
 */
export default function FooterLinks({ sections, startIndex = 0 }) {
  return (
    <>
      {sections.map((section, i) => (
        <motion.div
          key={section.heading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: (startIndex + i) * 0.1 }}
        >
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
            {section.heading}
          </h4>
          <ul className="flex flex-col gap-2.5">
            {section.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </>
  )
}
