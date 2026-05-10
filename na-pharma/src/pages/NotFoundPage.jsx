import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div data-testid="not-found-page">
      <SectionContainer py="xl" as="div">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-neutral-100 flex items-center justify-center mb-6">
            <SearchX size={36} className="text-neutral-400" />
          </div>

          {/* 404 */}
          <p className="text-8xl font-bold text-primary-100 mb-2 leading-none">404</p>

          <h1 className="text-3xl font-bold text-neutral-900 mb-3">Page Not Found</h1>
          <p className="text-neutral-500 max-w-md mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <Button as={Link} to="/" size="lg" leftIcon={<Home size={18} />}>
            Back to Home
          </Button>
        </motion.div>
      </SectionContainer>
    </div>
  )
}
