import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '../../utils/cn'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Fatima Rahman',
    role: 'Regular Customer',
    location: 'Dhaka',
    avatar: 'FR',
    avatarBg: 'bg-primary-100 text-primary-700',
    rating: 5,
    review:
      'N A Pharma has completely changed how I manage my family\'s healthcare. The medicines arrive on time, the packaging is perfect, and the pharmacists are always available to answer my questions. Highly recommended!',
    highlight: 'Medicines arrive on time',
  },
  {
    id: 2,
    name: 'Dr. Karim Hossain',
    role: 'General Physician',
    location: 'Chittagong',
    avatar: 'KH',
    avatarBg: 'bg-secondary-100 text-secondary-700',
    rating: 5,
    review:
      'As a doctor, I recommend N A Pharma to my patients with full confidence. Their prescription verification process is thorough, and I\'ve never had a patient report receiving incorrect medication. A truly professional service.',
    highlight: 'Prescription verification is thorough',
  },
  {
    id: 3,
    name: 'Nusrat Jahan',
    role: 'Working Mother',
    location: 'Sylhet',
    avatar: 'NJ',
    avatarBg: 'bg-green-100 text-green-700',
    rating: 5,
    review:
      'With two kids and a busy schedule, I rely on N A Pharma for all our medicine needs. The same-day delivery is a lifesaver, and the prices are genuinely competitive. The app is easy to use too!',
    highlight: 'Same-day delivery is a lifesaver',
  },
  {
    id: 4,
    name: 'Arif Chowdhury',
    role: 'Senior Citizen',
    location: 'Rajshahi',
    avatar: 'AC',
    avatarBg: 'bg-amber-100 text-amber-700',
    rating: 5,
    review:
      'At my age, getting to a pharmacy is difficult. N A Pharma\'s home delivery service has been a blessing. The customer support team is patient, helpful, and always available. I feel genuinely cared for.',
    highlight: 'Customer support is patient and helpful',
  },
  {
    id: 5,
    name: 'Sadia Islam',
    role: 'Pharmacist',
    location: 'Khulna',
    avatar: 'SI',
    avatarBg: 'bg-violet-100 text-violet-700',
    rating: 5,
    review:
      'From a professional standpoint, N A Pharma\'s quality control is impressive. Every product I\'ve ordered has been genuine, properly stored, and within expiry. This is the standard all pharmacies should meet.',
    highlight: 'Quality control is impressive',
  },
]

// How many cards to show at once per breakpoint (handled via CSS grid)
// We use a manual slider for mobile, grid for desktop

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial, className }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-neutral-100 shadow-soft p-6 flex flex-col gap-4',
        className
      )}
    >
      {/* Quote icon */}
      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        <Quote size={14} className="text-primary-500" />
      </div>

      {/* Highlight pill */}
      <p className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100
                    px-3 py-1 rounded-full self-start">
        "{testimonial.highlight}"
      </p>

      {/* Review text */}
      <p className="text-neutral-600 text-sm leading-relaxed flex-1">
        {testimonial.review}
      </p>

      {/* Rating */}
      <StarRating rating={testimonial.rating} />

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                         text-sm font-bold flex-shrink-0 ${testimonial.avatarBg}`}>
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-neutral-900 text-sm leading-tight">
            {testimonial.name}
          </p>
          <p className="text-neutral-400 text-xs">
            {testimonial.role} · {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const total = TESTIMONIALS.length

  function prev() {
    setActiveIndex((i) => (i - 1 + total) % total)
  }

  function next() {
    setActiveIndex((i) => (i + 1) % total)
  }

  return (
    <section className="bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block text-primary-600 text-sm font-medium mb-2">
              Customer Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
              Trusted by Thousands
            </h2>
            <p className="text-neutral-500 mt-2 max-w-md">
              Real experiences from real customers across Bangladesh.
            </p>
          </div>

          {/* Desktop nav arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-xl border border-neutral-200 bg-white
                         flex items-center justify-center text-neutral-500
                         hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                         transition-all duration-200 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-xl border border-neutral-200 bg-white
                         flex items-center justify-center text-neutral-500
                         hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                         transition-all duration-200 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* ── Desktop: 3-column grid (first 3 visible, rest hidden) ── */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <TestimonialCard testimonial={t} />
            </motion.div>
          ))}
        </div>

        {/* ── Tablet: 2-column grid ── */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-5">
          {TESTIMONIALS.slice(0, 4).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <TestimonialCard testimonial={t} />
            </motion.div>
          ))}
        </div>

        {/* ── Mobile: single-card slider ── */}
        <div className="sm:hidden">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <TestimonialCard testimonial={TESTIMONIALS[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-xl border border-neutral-200 bg-white
                         flex items-center justify-center text-neutral-500
                         hover:border-primary-300 hover:text-primary-600
                         transition-all duration-200 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    i === activeIndex
                      ? 'w-5 h-2 bg-primary-600'
                      : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-xl border border-neutral-200 bg-white
                         flex items-center justify-center text-neutral-500
                         hover:border-primary-300 hover:text-primary-600
                         transition-all duration-200 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Summary stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 grid grid-cols-3 gap-4 bg-primary-600 rounded-2xl p-6 sm:p-8"
        >
          {[
            { value: '4.9/5',    label: 'Average Rating',    sub: 'from 12,000+ reviews' },
            { value: '98%',      label: 'Satisfaction Rate', sub: 'would recommend us' },
            { value: '50,000+',  label: 'Happy Customers',   sub: 'across Bangladesh' },
          ].map(({ value, label, sub }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5">{value}</p>
              <p className="text-primary-100 text-xs sm:text-sm font-medium">{label}</p>
              <p className="text-primary-200 text-[10px] sm:text-xs mt-0.5 hidden sm:block">{sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
