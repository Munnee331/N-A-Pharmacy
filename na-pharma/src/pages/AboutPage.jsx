import { motion } from 'framer-motion'
import { Users, Award, MapPin } from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'

const stats = [
  { icon: Users,  value: '50,000+', label: 'Happy Customers' },
  { icon: Award,  value: '15+',     label: 'Years of Service' },
  { icon: MapPin, value: '8',       label: 'Locations' },
]

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50">
        <SectionContainer py="lg" as="div">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-neutral-900 mb-6">
              About <span className="text-primary-600">N A Pharma</span>
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Founded in 2010, N A Pharma has been a trusted name in healthcare across Bangladesh.
              We are committed to making quality medicines accessible, affordable, and convenient
              for every family.
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* Stats */}
      <SectionContainer py="md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 text-center"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary-50 mb-3">
                <stat.icon size={22} className="text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-neutral-500 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>

      {/* Mission */}
      <SectionContainer py="md">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-primary-100 text-lg leading-relaxed max-w-2xl">
            To provide every person with access to safe, effective, and affordable healthcare
            products — backed by expert guidance and delivered with compassion.
          </p>
        </div>
      </SectionContainer>
    </div>
  )
}
