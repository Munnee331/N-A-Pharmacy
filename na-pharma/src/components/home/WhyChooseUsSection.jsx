import { motion } from 'framer-motion'
import {
  ShieldCheck,
  ClipboardCheck,
  Truck,
  HeadphonesIcon,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    id: 'safe',
    icon: ShieldCheck,
    title: 'Safe & Certified Medicines',
    description:
      'Every product is sourced directly from licensed manufacturers and passes rigorous quality checks before reaching you.',
    stat: '100%',
    statLabel: 'Certified',
    accent: 'primary',
  },
  {
    id: 'prescription',
    icon: ClipboardCheck,
    title: 'Verified Prescriptions',
    description:
      'Our licensed pharmacists review every prescription order to ensure accuracy, safety, and proper dosage guidance.',
    stat: '200+',
    statLabel: 'Pharmacists',
    accent: 'secondary',
  },
  {
    id: 'delivery',
    icon: Truck,
    title: 'Fast & Reliable Delivery',
    description:
      'Same-day delivery across Dhaka and nationwide shipping within 48 hours — tracked, insured, and on time.',
    stat: '99%',
    statLabel: 'On-Time Rate',
    accent: 'green',
  },
  {
    id: 'support',
    icon: HeadphonesIcon,
    title: '24/7 Expert Support',
    description:
      'Round-the-clock access to our healthcare team for medicine queries, prescription help, and order assistance.',
    stat: '24/7',
    statLabel: 'Available',
    accent: 'violet',
  },
]

// Accent colour maps — keeps JSX clean
const accentMap = {
  primary:   { icon: 'text-primary-600',   iconBg: 'bg-primary-50',   border: 'border-primary-100',   stat: 'text-primary-600',   statBg: 'bg-primary-50',   ring: 'group-hover:ring-primary-200' },
  secondary: { icon: 'text-secondary-600', iconBg: 'bg-secondary-50', border: 'border-secondary-100', stat: 'text-secondary-600', statBg: 'bg-secondary-50', ring: 'group-hover:ring-secondary-200' },
  green:     { icon: 'text-green-600',     iconBg: 'bg-green-50',     border: 'border-green-100',     stat: 'text-green-700',     statBg: 'bg-green-50',     ring: 'group-hover:ring-green-200' },
  violet:    { icon: 'text-violet-600',    iconBg: 'bg-violet-50',    border: 'border-violet-100',    stat: 'text-violet-700',    statBg: 'bg-violet-50',    ring: 'group-hover:ring-violet-200' },
}

// Shared animation variants
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function WhyChooseUsSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-primary-600 text-sm font-medium mb-2 tracking-wide">
            Why N A Pharma
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-4">
            Healthcare You Can{' '}
            <span className="text-primary-600">Trust</span>
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto leading-relaxed">
            We go beyond just selling medicines — we deliver a complete, safe, and
            professional healthcare experience every single time.
          </p>
        </motion.div>

        {/* ── Feature cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature) => {
            const a = accentMap[feature.accent]
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`group relative bg-white rounded-2xl border ${a.border}
                            shadow-soft hover:shadow-soft-lg
                            ring-2 ring-transparent ${a.ring}
                            transition-all duration-300 p-6 flex flex-col gap-4`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${a.iconBg} flex items-center justify-center
                                 transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon size={22} className={a.icon} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 text-base mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Stat chip */}
                <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5
                                 rounded-full ${a.statBg} ${a.stat} text-xs font-semibold`}>
                  <span>{feature.stat}</span>
                  <span className="opacity-70">{feature.statLabel}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Bottom link ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm
                       hover:gap-3 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-1"
          >
            Learn more about our standards
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
