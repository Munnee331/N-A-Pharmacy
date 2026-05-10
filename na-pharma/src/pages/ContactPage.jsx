import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const contactInfo = [
  { icon: MapPin, label: 'Address',  value: '123 Healthcare Avenue, Dhaka 1200' },
  { icon: Phone,  label: 'Phone',    value: '+880 1700-000000' },
  { icon: Mail,   label: 'Email',    value: 'support@napharma.com' },
  { icon: Clock,  label: 'Hours',    value: 'Sat–Thu: 8am – 10pm' },
]

export default function ContactPage() {
  return (
    <div data-testid="contact-page">
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50">
        <SectionContainer py="lg" as="div">
          <div className="max-w-xl mb-10">
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Get in <span className="text-primary-600">Touch</span>
            </h1>
            <p className="text-neutral-600 text-lg">
              Have a question or need help? Our team is here for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-soft border border-neutral-100"
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Send a Message</h2>
              <form className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First Name" placeholder="John" />
                  <Input label="Last Name"  placeholder="Doe" />
                </div>
                <Input label="Email" type="email" placeholder="john@example.com" />
                <Input label="Subject" placeholder="How can we help?" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Write your message here..."
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-base
                               text-neutral-900 placeholder:text-neutral-400 resize-none
                               focus:outline-none focus:ring-2 focus:ring-primary-500
                               focus:border-primary-500 transition-all"
                  />
                </div>
                <Button type="submit" size="md" className="mt-2">
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              {contactInfo.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5
                             shadow-soft border border-neutral-100"
                >
                  <div className="p-2.5 rounded-xl bg-primary-50 flex-shrink-0">
                    <Icon size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    <p className="text-neutral-800 font-medium text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </SectionContainer>
      </section>
    </div>
  )
}
