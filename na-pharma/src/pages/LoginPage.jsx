import { motion } from 'framer-motion'
import { Mail, Lock, HeartPulse } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/ui/SectionContainer'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  return (
    <div data-testid="login-page" className="bg-gradient-to-br from-primary-50 to-secondary-50 min-h-[calc(100vh-4rem)]">
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
            <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
            <p className="text-neutral-500 text-sm mt-1">Sign in to your N A Pharma account</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                <input type="checkbox" className="rounded border-neutral-300 text-primary-600
                                                   focus:ring-primary-500" />
                Remember me
              </label>
              <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="md" className="mt-2 w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </SectionContainer>
    </div>
  )
}
