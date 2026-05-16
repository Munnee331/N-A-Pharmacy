import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import usePageMeta from '../hooks/usePageMeta'
import { useAuth } from '../context/AuthContext.jsx'
import { getMedicines } from '../api/medicineApi.js'
import AdminStatsGrid       from '../components/admin/AdminStatsGrid'
import SalesOverview        from '../components/admin/SalesOverview'
import RecentOrdersTable    from '../components/admin/RecentOrdersTable'
import LowStockAlert        from '../components/admin/LowStockAlert'
import RecentPrescriptions  from '../components/admin/RecentPrescriptions'
import TopSellingMedicines  from '../components/admin/TopSellingMedicines'
import QuickActions         from '../components/admin/QuickActions'

/**
 * Admin Dashboard page.
 *
 * Fetches real medicine count from the backend and passes it to AdminStatsGrid
 * as a live override. All other stats remain static until their APIs are built.
 *
 * Layout (desktop):
 *   ┌──────────────────────────────────────────────────────┐
 *   │  AdminStatsGrid  (4 cols)                            │
 *   ├──────────────────────────┬───────────────────────────┤
 *   │  SalesOverview (2/3)     │  QuickActions (1/3)       │
 *   ├──────────────────────────┴───────────────────────────┤
 *   │  RecentOrdersTable  (full width)                     │
 *   ├──────────────────────────┬───────────────────────────┤
 *   │  LowStockAlert (1/3)     │  RecentPrescriptions (1/3)│
 *   │  TopSellingMedicines(1/3)│                           │
 *   └──────────────────────────┴───────────────────────────┘
 */
export default function AdminPage() {
  usePageMeta('Admin Dashboard', 'Manage N A Pharma operations — orders, inventory, prescriptions.')

  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  // ── Fetch real medicine count ─────────────────────────────────────────
  const [liveStats, setLiveStats] = useState({})

  useEffect(() => {
    getMedicines({ limit: 1 })
      .then(({ pagination }) => {
        if (pagination?.total != null) {
          setLiveStats({
            orders: {
              value: String(pagination.total),
              sub:   `${pagination.total} medicines in catalogue`,
            },
          })
        }
      })
      .catch(() => {/* silently fall back to static data */})
  }, [])

  return (
    <div data-testid="admin-page" className="p-5 sm:p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">

      {/* Welcome row */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Welcome back, {firstName}. Here's what's happening today.
        </p>
      </motion.div>

      {/* Row 1 — Stats (with live medicine count) */}
      <AdminStatsGrid liveStats={liveStats} />

      {/* Row 2 — Sales chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesOverview />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Row 3 — Recent orders (full width) */}
      <RecentOrdersTable />

      {/* Row 4 — Low stock + Top medicines + Prescriptions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <LowStockAlert />
        </div>
        <div className="xl:col-span-1">
          <TopSellingMedicines />
        </div>
        <div className="xl:col-span-1">
          <RecentPrescriptions />
        </div>
      </div>
    </div>
  )
}
