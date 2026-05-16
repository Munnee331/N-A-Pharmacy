/**
 * Centralised mock data for the Admin Dashboard.
 * All arrays and objects live here — components stay clean.
 * Replace with API calls (src/api/) when the backend is ready.
 */

// ── Stats cards ───────────────────────────────────────────────────────────
export const ADMIN_STATS = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '৳2,41,850',
    iconName: 'DollarSign',
    trend: 'up',
    trendValue: '+8.2% vs last month',
    color: 'primary',
    sub: 'This month',
  },
  {
    id: 'orders',
    title: 'Total Orders',
    value: '1,284',
    iconName: 'ShoppingCart',
    trend: 'up',
    trendValue: '+124 this week',
    color: 'secondary',
    sub: 'All time',
  },
  {
    id: 'customers',
    title: 'Active Customers',
    value: '3,891',
    iconName: 'Users',
    trend: 'up',
    trendValue: '+120 this month',
    color: 'success',
    sub: 'Registered accounts',
  },
  {
    id: 'lowstock',
    title: 'Low Stock Items',
    value: '14',
    iconName: 'AlertTriangle',
    trend: 'down',
    trendValue: '3 critical',
    color: 'warning',
    sub: 'Need reorder',
  },
]

// ── Sales chart data ──────────────────────────────────────────────────────
export const WEEKLY_SALES = [
  { day: 'Mon', revenue: 28400, orders: 87 },
  { day: 'Tue', revenue: 35200, orders: 112 },
  { day: 'Wed', revenue: 31800, orders: 98 },
  { day: 'Thu', revenue: 42600, orders: 134 },
  { day: 'Fri', revenue: 38900, orders: 121 },
  { day: 'Sat', revenue: 51200, orders: 158 },
  { day: 'Sun', revenue: 13750, orders: 43 },
]

export const MONTHLY_SALES = [
  { month: 'Jan', revenue: 182000, orders: 540 },
  { month: 'Feb', revenue: 210000, orders: 620 },
  { month: 'Mar', revenue: 195000, orders: 580 },
  { month: 'Apr', revenue: 240000, orders: 710 },
  { month: 'May', revenue: 228000, orders: 680 },
  { month: 'Jun', revenue: 265000, orders: 790 },
  { month: 'Jul', revenue: 241850, orders: 720 },
]

// ── Recent orders ─────────────────────────────────────────────────────────
export const RECENT_ORDERS = [
  { id: 'ORD-7821', customer: 'Fatima Rahman',  avatar: 'FR', items: 3, total: '৳485',   payment: 'paid',    delivery: 'delivered',  date: '10 May 2026' },
  { id: 'ORD-7820', customer: 'Karim Hossain',  avatar: 'KH', items: 1, total: '৳120',   payment: 'paid',    delivery: 'in_transit', date: '10 May 2026' },
  { id: 'ORD-7819', customer: 'Nusrat Jahan',   avatar: 'NJ', items: 5, total: '৳1,240', payment: 'pending', delivery: 'processing', date: '09 May 2026' },
  { id: 'ORD-7818', customer: 'Arif Chowdhury', avatar: 'AC', items: 2, total: '৳350',   payment: 'paid',    delivery: 'delivered',  date: '09 May 2026' },
  { id: 'ORD-7817', customer: 'Sadia Islam',    avatar: 'SI', items: 4, total: '৳890',   payment: 'failed',  delivery: 'cancelled',  date: '08 May 2026' },
  { id: 'ORD-7816', customer: 'Rahim Uddin',    avatar: 'RU', items: 2, total: '৳275',   payment: 'paid',    delivery: 'in_transit', date: '08 May 2026' },
  { id: 'ORD-7815', customer: 'Mitu Begum',     avatar: 'MB', items: 1, total: '৳65',    payment: 'paid',    delivery: 'delivered',  date: '07 May 2026' },
  { id: 'ORD-7814', customer: 'Tanvir Ahmed',   avatar: 'TA', items: 3, total: '৳540',   payment: 'pending', delivery: 'processing', date: '07 May 2026' },
]

// ── Low stock inventory ───────────────────────────────────────────────────
export const LOW_STOCK_ITEMS = [
  { id: 1, name: 'Zimax 500mg Tablet',          category: 'Tablet',         stock: 12,  threshold: 100, status: 'critical' },
  { id: 2, name: 'Seclo 20mg Capsule',           category: 'Capsule',        stock: 87,  threshold: 100, status: 'low' },
  { id: 3, name: 'Omron BP Monitor',             category: 'Medical Device', stock: 24,  threshold: 30,  status: 'low' },
  { id: 4, name: 'Pediatric Paracetamol Syrup',  category: 'Syrup',          stock: 0,   threshold: 100, status: 'out' },
  { id: 5, name: 'Amoxil 500mg Capsule',         category: 'Capsule',        stock: 43,  threshold: 150, status: 'low' },
]

// ── Recent prescriptions ──────────────────────────────────────────────────
export const RECENT_PRESCRIPTIONS = [
  { id: 'RX-4421', patient: 'Fatima Rahman',  avatar: 'FR', doctor: 'Dr. Karim Hossain', medicines: ['Amoxil 500mg × 14', 'Napa Extra × 10'], submitted: '10 May, 09:14 AM', urgency: 'normal' },
  { id: 'RX-4420', patient: 'Arif Chowdhury', avatar: 'AC', doctor: 'Dr. Sadia Islam',   medicines: ['Metformin 500mg × 30', 'Vitamin D3 × 30'], submitted: '10 May, 08:52 AM', urgency: 'urgent' },
  { id: 'RX-4419', patient: 'Nusrat Jahan',   avatar: 'NJ', doctor: 'Dr. Rahim Uddin',   medicines: ['Seclo 20mg × 14'], submitted: '09 May, 06:30 PM', urgency: 'normal' },
]

// ── Top selling medicines ─────────────────────────────────────────────────
export const TOP_MEDICINES = [
  { id: 1, name: 'Napa Extra 500mg',     category: 'Tablet',  sold: 1240, revenue: '৳43,400', pct: 92 },
  { id: 2, name: 'Vitamin D3 1000 IU',   category: 'Capsule', sold: 987,  revenue: '৳1,77,660', pct: 78 },
  { id: 3, name: 'Seclo 20mg Capsule',   category: 'Capsule', sold: 876,  revenue: '৳1,05,120', pct: 70 },
  { id: 4, name: 'Amoxil 500mg',         category: 'Capsule', sold: 654,  revenue: '৳55,590', pct: 55 },
  { id: 5, name: 'Omron BP Monitor',     category: 'Device',  sold: 345,  revenue: '৳12,07,500', pct: 40 },
]

// ── Sidebar navigation links ──────────────────────────────────────────────
export const SIDEBAR_LINKS = [
  { label: 'Dashboard',     to: '/admin',               iconName: 'LayoutDashboard' },
  { label: 'Orders',        to: '/admin/orders',        iconName: 'ShoppingBag' },
  { label: 'Medicines',     to: '/admin/medicines',     iconName: 'Pill' },
  { label: 'Customers',     to: '/admin/customers',     iconName: 'Users' },
  { label: 'Prescriptions', to: '/admin/prescriptions', iconName: 'ClipboardList' },
  { label: 'Analytics',     to: '/admin/analytics',     iconName: 'BarChart3' },
  { label: 'Settings',      to: '/admin/settings',      iconName: 'Settings' },
]

// ── Avatar colour cycle ───────────────────────────────────────────────────
export const AVATAR_COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-secondary-100 text-secondary-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
]
