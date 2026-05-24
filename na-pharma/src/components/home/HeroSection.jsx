import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowRight, BadgeCheck, Truck, HeartPulse, Sparkles, Stethoscope, Pill, Activity, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

// Floating stat badges shown around the illustration
const stats = [
  { label: 'Medicines',    icon: Pill,         color: 'bg-primary-50 text-primary-700 border-primary-100' },
  { label: 'Customers',    icon: HeartPulse,   color: 'bg-secondary-50 text-secondary-700 border-secondary-100' },
  { label: 'Pharmacists',    icon: Stethoscope,  color: 'bg-green-50 text-green-700 border-green-100' },
]

// Trust badges below the CTA
const trustBadges = [
  { icon: BadgeCheck, label: 'Certified Quality' },
  { icon: Truck,      label: 'Fast Delivery' },
  { icon: Shield,     label: 'Secure Payments' },
]

// Stagger animation for children
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
    else navigate('/shop')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full
                      bg-primary-100/60 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full
                      bg-secondary-100/50 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left column: copy ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Pill badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                               bg-primary-100 text-primary-700 text-sm font-medium mb-6 border border-primary-200">
                <Sparkles size={13} />
                Bangladesh's Most Trusted Pharmacy
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-[1.1] mb-5"
            >
              Quality Medicines,{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary-600">Delivered</span>
                {/* Underline accent */}
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M2 6 C50 2, 150 2, 198 6" stroke="#16a34a" strokeWidth="3"
                        strokeLinecap="round" fill="none" opacity="0.5" />
                </svg>
              </span>{' '}
              to Your Door
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg"
            >
              Browse 10,000+ certified medicines and healthcare products. Expert pharmacist
              guidance, same-day delivery, and genuine quality — all in one place.
            </motion.p>

            {/* Search bar */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white rounded-2xl shadow-soft
                         border border-neutral-200 p-2 mb-6 max-w-lg
                         focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-400
                         transition-all duration-200"
            >
              <Search size={18} className="ml-2 text-neutral-400 flex-shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search medicines, vitamins, devices…"
                aria-label="Search medicines"
                className="flex-1 bg-transparent text-neutral-900 placeholder:text-neutral-400
                           text-sm focus:outline-none py-1.5 min-w-0"
              />
              <Button type="submit" size="sm" className="flex-shrink-0 rounded-xl">
                Search
              </Button>
            </motion.form>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
              <Button
                as={Link}
                to="/shop"
                size="lg"
                rightIcon={<ArrowRight size={18} />}
              >
                Shop Now
              </Button>
              <Button
                as={Link}
                to="/contact"
                variant="outline"
                size="lg"
              >
                Talk to a Pharmacist
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-neutral-500 text-sm">
                  <Icon size={14} className="text-primary-500" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right column: illustration ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Main illustration card */}
            <div className="relative w-full max-w-sm mx-auto">
              {/* Central card */}
              <div className="bg-white rounded-3xl shadow-soft-lg border border-neutral-100 p-8
                              flex flex-col items-center gap-5">
                {/* Icon cluster */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br
                                  from-primary-100 to-secondary-100 animate-pulse" />
                  <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <HeartPulse size={40} className="text-primary-600" />
                  </div>
                  {/* Orbiting icons */}
                  <div className="absolute -top-2 -right-2 w-9 h-9 rounded-xl bg-secondary-50
                                  border border-secondary-100 flex items-center justify-center shadow-sm">
                    <Pill size={20} className="text-secondary-600" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-9 h-9 rounded-xl bg-primary-50
                                  border border-primary-100 flex items-center justify-center shadow-sm">
                    <Activity size={16} className="text-primary-600" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-semibold text-neutral-900 text-lg">N A Pharma</p>
                  <p className="text-neutral-500 text-sm">Your Health Partner</p>
                </div>

                {/* Mini progress bars */}
                <div className="w-full flex flex-col gap-2.5">
                  {[
                    { label: 'Quality Score',  pct: 98, color: 'bg-primary-500' },
                    { label: 'Customer Trust', pct: 96, color: 'bg-secondary-500' },
                    { label: 'Delivery Rate',  pct: 99, color: 'bg-green-500' },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>{label}</span>
                        <span className="font-medium text-neutral-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating stat badges */}
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}
                  className={`absolute flex items-center gap-2 px-3 py-2 rounded-xl
                              border shadow-soft bg-white text-xs font-medium
                              ${i === 0 ? '-top-4 -left-6' : i === 1 ? '-bottom-4 -right-6' : 'top-1/2 -right-8 -translate-y-1/2'}`}
                >
                  <div className={`p-1.5 rounded-lg ${stat.color.split(' ').slice(0,1).join(' ')}`}>
                    <stat.icon size={12} className={stat.color.split(' ').slice(1,2).join(' ')} />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 leading-none">{stat.value}</p>
                    <p className="text-neutral-500 text-[10px]">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
