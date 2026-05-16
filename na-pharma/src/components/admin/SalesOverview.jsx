import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '../../utils/cn'
import { WEEKLY_SALES, MONTHLY_SALES } from '../../data/adminData'

const TABS = [
  { id: 'weekly',  label: 'Weekly',  data: WEEKLY_SALES,  xKey: 'day' },
  { id: 'monthly', label: 'Monthly', data: MONTHLY_SALES, xKey: 'month' },
]

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-soft-lg px-4 py-3 text-xs">
      <p className="font-semibold text-neutral-700 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-neutral-500 capitalize">{entry.dataKey}:</span>
          <span className="font-semibold text-neutral-900">
            {entry.dataKey === 'revenue' ? `৳${entry.value.toLocaleString()}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Sales overview chart with weekly / monthly toggle.
 * Uses Recharts AreaChart with glassmorphism card design.
 */
export default function SalesOverview() {
  const [activeTab, setActiveTab] = useState('weekly')
  const tab = TABS.find((t) => t.id === activeTab)

  const totalRevenue = tab.data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders  = tab.data.reduce((s, d) => s + d.orders, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-soft p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Sales Overview</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Revenue & order trends</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab toggle */}
          <div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  activeTab === t.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
            <BarChart3 size={15} className="text-primary-600" />
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
          <p className="text-xs text-primary-600 font-medium mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-primary-700">৳{(totalRevenue / 1000).toFixed(1)}K</p>
          <div className="flex items-center gap-1 mt-1 text-green-600 text-xs font-medium">
            <TrendingUp size={11} />+8.2% vs last period
          </div>
        </div>
        <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100">
          <p className="text-xs text-secondary-600 font-medium mb-1">Total Orders</p>
          <p className="text-xl font-bold text-secondary-700">{totalOrders}</p>
          <div className="flex items-center gap-1 mt-1 text-green-600 text-xs font-medium">
            <TrendingUp size={11} />+12 vs last period
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tab.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey={tab.xKey} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2}
              fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: '#16a34a' }}
            />
            <Area
              type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2}
              fill="url(#ordersGrad)" dot={false} activeDot={{ r: 4, fill: '#2563eb' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-neutral-100">
        {[
          { color: '#16a34a', label: 'Revenue' },
          { color: '#2563eb', label: 'Orders' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="w-3 h-1.5 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
