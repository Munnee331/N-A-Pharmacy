import { motion } from 'framer-motion'
import { User, Mail, Lock, Phone, HeartPulse } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/ui/SectionContainer'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  return (
    <div data-testid="register-page" className="bg-gradient-to-br from-primary-50 to-secondary-50 min-h-[calc(100vh-4rem)]">
      <SectionContainer py="lg" as="div" className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-soft-lg p-8 border border-neutral-100"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center shadow-sm mb-4">
              <HeartPulse size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Create an account</h1>
            <p className="text-neutral-500 text-sm mt-1">Join N A Pharma today</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="John"  leftIcon={<User size={16} />} />
              <Input label="Last Name"  placeholder="Doe" />
            </div>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+880 1700-000000"
              leftIcon={<Phone size={16} />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              leftIcon={<Lock size={16} />}
              helperText="Use at least 8 characters with a mix of letters and numbers."
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              leftIcon={<Lock size={16} />}
            />

            <Button type="submit" size="md" className="mt-2 w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </SectionContainer>
    </div>
  )
}
