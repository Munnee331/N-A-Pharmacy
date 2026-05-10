import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Pill, FlaskConical, Droplets, Cpu, ChevronRight, Stethoscope, Thermometer, Syringe } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'tablet',
    label: 'Tablets',
    description: 'Pain relief, antibiotics, vitamins & more',
    icon: Pill,
    count: '3,200+ products',
    gradient: 'from-primary-500 to-primary-600',
    lightBg: 'bg-primary-50',
    lightText: 'text-primary-600',
    lightBorder: 'border-primary-100',
    iconBg: 'bg-primary-100',
    to: '/shop?category=tablet',
  },
  {
    id: 'syrup',
    label: 'Syrups',
    description: 'Cough, cold, digestive & pediatric syrups',
    icon: Droplets,
    count: '1,400+ products',
    gradient: 'from-secondary-500 to-secondary-600',
    lightBg: 'bg-secondary-50',
    lightText: 'text-secondary-600',
    lightBorder: 'border-secondary-100',
    iconBg: 'bg-secondary-100',
    to: '/shop?category=syrup',
  },
  {
    id: 'capsule',
    label: 'Capsules',
    description: 'Supplements, probiotics & prescription caps',
    icon: FlaskConical,
    count: '2,100+ products',
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    lightText: 'text-green-700',
    lightBorder: 'border-green-100',
    iconBg: 'bg-green-100',
    to: '/shop?category=capsule',
  },
  {
    id: 'devices',
    label: 'Medical Devices',
    description: 'BP monitors, glucometers, thermometers',
    icon: Cpu,
    count: '850+ products',
    gradient: 'from-violet-500 to-violet-600',
    lightBg: 'bg-violet-50',
    lightText: 'text-violet-700',
    lightBorder: 'border-violet-100',
    iconBg: 'bg-violet-100',
    to: '/shop?category=devices',
  },
]

// Secondary quick-access categories
const QUICK_CATEGORIES = [
  { label: 'Stethoscopes',  icon: Stethoscope, to: '/shop?category=stethoscope' },
  { label: 'Thermometers',  icon: Thermometer,  to: '/shop?category=thermometer' },
  { label: 'Injections',    icon: Syringe,      to: '/shop?category=injection' },
  { label: 'All Products',  icon: ChevronRight, to: '/shop' },
]

export default function CategoriesSection() {
  return (
    <section className="bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-primary-600 text-sm font-medium mb-2">
            Shop by Category
          </span>
          <h2 className="text-3xl font-semibold text-neutral-900 mb-3">
            Find What You Need
          </h2>
          <p className="text-neutral-500 max-w-md mx-auto">
            Browse our curated categories to quickly find the right medicine
            or healthcare product for you.
          </p>
        </motion.div>

        {/* Main category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={cat.to}
                className="group block rounded-2xl overflow-hidden border border-neutral-100
                           shadow-soft hover:shadow-soft-lg transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${cat.gradient} p-6 flex items-center justify-between`}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <cat.icon size={24} className="text-white" />
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <ChevronRight size={16} className="text-white" />
                  </motion.div>
                </div>

                {/* Card body */}
                <div className="bg-white p-5">
                  <h3 className="font-semibold text-neutral-900 text-base mb-1 group-hover:text-primary-600
                                 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-neutral-500 text-xs leading-relaxed mb-3">
                    {cat.description}
                  </p>
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1
                                   rounded-full border ${cat.lightBg} ${cat.lightText} ${cat.lightBorder}`}>
                    {cat.count}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick-access row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {QUICK_CATEGORIES.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white
                         border border-neutral-200 text-neutral-600 text-sm font-medium
                         hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                         transition-all duration-200 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
