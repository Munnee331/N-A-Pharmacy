import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import DashboardCard from '../components/ui/DashboardCard'

const stats = [
  { title: 'Total Products',  value: '1,248', icon: <Package size={18} className="text-primary-600" />,   trend: 'up',   trendValue: '+24 this week', color: 'primary' },
  { title: 'Total Users',     value: '3,891', icon: <Users size={18} className="text-secondary-600" />,    trend: 'up',   trendValue: '+120 this month', color: 'secondary' },
  { title: 'Orders Today',    value: '87',    icon: <ShoppingCart size={18} className="text-primary-600" />, trend: 'up', trendValue: '+12 vs yesterday', color: 'success' },
  { title: 'Monthly Revenue', value: '৳2.4M', icon: <TrendingUp size={18} className="text-amber-600" />,   trend: 'up',   trendValue: '+8.2%',          color: 'warning' },
]

export default function AdminPage() {
  return (
    <div data-testid="admin-page">
      <SectionContainer py="lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage your pharmacy operations from one place.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <DashboardCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Placeholder panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Orders</h3>
            <p className="text-neutral-400 text-sm">Order management table will appear here.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Low Stock Alerts</h3>
            <p className="text-neutral-400 text-sm">Products running low will be listed here.</p>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
