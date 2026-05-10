import { ShoppingBag, Heart, Package, Clock } from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'
import DashboardCard from '../components/ui/DashboardCard'

const stats = [
  { title: 'Total Orders',    value: '24',   icon: <ShoppingBag size={18} className="text-primary-600" />,   trend: 'up',      trendValue: '+3 this month', color: 'primary' },
  { title: 'Wishlist Items',  value: '12',   icon: <Heart size={18} className="text-secondary-600" />,        trend: 'neutral', trendValue: 'No change',     color: 'secondary' },
  { title: 'Active Orders',   value: '2',    icon: <Package size={18} className="text-primary-600" />,        trend: 'up',      trendValue: 'In transit',    color: 'success' },
  { title: 'Pending Reviews', value: '5',    icon: <Clock size={18} className="text-amber-600" />,            trend: 'down',    trendValue: '-2 this week',  color: 'warning' },
]

export default function DashboardPage() {
  return (
    <div data-testid="dashboard-page">
      <SectionContainer py="lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Dashboard</h1>
          <p className="text-neutral-500">Welcome back! Here's an overview of your account.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <DashboardCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Orders</h3>
            <p className="text-neutral-400 text-sm">Your order history will appear here.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Saved Addresses</h3>
            <p className="text-neutral-400 text-sm">Your saved delivery addresses will appear here.</p>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
