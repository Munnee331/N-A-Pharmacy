import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HeartPulse, ShieldCheck, Truck, BadgeCheck,
  Pill, Activity, Stethoscope,
} from 'lucide-react'

/**
 * Left-side branding panel shared by Login and Register pages.
 * Hidden on mobile, visible on lg+ screens.
 *
 * @param {object} props
 * @param {'login'|'register'} props.mode
 */
export default function AuthBrandPanel({ mode = 'login' }) {
  const isLogin = mode === 'login'

  const trustItems = [
    { icon: ShieldCheck, text: '100% certified medicines' },
    { icon: BadgeCheck,  text: 'Licensed pharmacists on call' },
    { icon: Truck,       text: 'Same-day delivery in Dhaka' },
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  }
  const itemVariants = {
    hidden:  { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  }

  const orbitIcons = [
    { icon: Pill,        pos: '-top-2 -right-2',                   bg: 'bg-primary-400/40' },
    { icon: Activity,    pos: '-bottom-2 -left-2',                  bg: 'bg-secondary-400/40' },
    { icon: Stethoscope, pos: 'top-1/2 -right-6 -translate-y-1/2', bg: 'bg-white/20' },
  ]

  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden
                    bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700
                    rounded-3xl p-10 min-h-full">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full
                      bg-white/5 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full
                      bg-secondary-400/20 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <HeartPulse size={18} className="text-white" />
          </div>
          <span className="font-semibold text-white text-base tracking-tight">
            N A <span className="text-primary-200">Pharma</span>
          </span>
        </Link>
      </motion.div>

      {/* Centre illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
        className="flex-1 flex flex-col items-center justify-center py-10 gap-6"
      >
        {/* Icon cluster */}
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-white/15 flex items-center justify-center">
            <HeartPulse size={44} className="text-white" />
          </div>
          {orbitIcons.map(({ icon: Icon, pos, bg }) => (
            <div
              key={pos}
              className={`absolute ${pos} w-9 h-9 rounded-xl ${bg} backdrop-blur-sm
                          flex items-center justify-center border border-white/20`}
            >
              <Icon size={15} className="text-white" />
            </div>
          ))}
        </div>

        {/* Headline */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Join N A Pharma'}
          </h2>
          <p className="text-primary-100 text-sm leading-relaxed max-w-xs">
            {isLogin
              ? 'Your trusted pharmacy partner. Access your orders, prescriptions, and health records.'
              : 'Create your account and get access to 10,000+ certified medicines delivered to your door.'}
          </p>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { value: '50K+', label: 'Customers' },
            { value: '10K+', label: 'Medicines' },
            { value: '4.9★', label: 'Rating' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <p className="text-white font-bold text-base leading-none">{value}</p>
              <p className="text-primary-200 text-[10px] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trust items */}
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {trustItems.map(({ icon: Icon, text }) => (
          <motion.li
            key={text}
            variants={itemVariants}
            className="flex items-center gap-3 text-primary-100 text-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Icon size={13} className="text-white" />
            </div>
            {text}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
