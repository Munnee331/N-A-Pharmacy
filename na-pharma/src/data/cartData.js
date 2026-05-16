/**
 * Initial dummy cart items.
 * Replace with context/store in a future phase.
 */
export const INITIAL_CART_ITEMS = [
  {
    id: 1,
    name: 'Napa Extra 500mg Paracetamol Tablet',
    brand: 'Beximco Pharmaceuticals',
    category: 'Tablet',
    price: 35,
    originalPrice: 40,
    quantity: 2,
    inStock: true,
    requiresPrescription: false,
  },
  {
    id: 2,
    name: 'Seclo 20mg Omeprazole Capsule',
    brand: 'Square Pharmaceuticals',
    category: 'Capsule',
    price: 120,
    originalPrice: 140,
    quantity: 1,
    inStock: true,
    requiresPrescription: true,
  },
  {
    id: 3,
    name: 'Vitamin D3 1000 IU Softgel Capsule',
    brand: 'Opsonin Pharma',
    category: 'Capsule',
    price: 180,
    originalPrice: 200,
    quantity: 1,
    inStock: true,
    requiresPrescription: false,
  },
  {
    id: 4,
    name: 'Tussex Cough Syrup with Honey 100ml',
    brand: 'Aristopharma',
    category: 'Syrup',
    price: 65,
    originalPrice: null,
    quantity: 1,
    inStock: true,
    requiresPrescription: false,
  },
]

export const VALID_COUPONS = {
  HEALTH10:  { discount: 0.10, label: '10% off your order' },
  PHARMA20:  { discount: 0.20, label: '20% off your order' },
  WELCOME15: { discount: 0.15, label: '15% welcome discount' },
}

export const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery',  eta: '2–3 business days',          fee: 60 },
  { id: 'express',  label: 'Express Delivery',   eta: 'Same day (order before 2 PM)', fee: 120 },
  { id: 'free',     label: 'Free Delivery',       eta: '3–5 business days',           fee: 0, minOrder: 500 },
]

export const PAYMENT_METHODS = [
  { id: 'bkash', label: 'bKash',              icon: '📱', description: 'Pay via bKash mobile banking' },
  { id: 'nagad', label: 'Nagad',              icon: '💳', description: 'Pay via Nagad digital wallet' },
  { id: 'card',  label: 'Credit / Debit Card', icon: '💳', description: 'Visa, Mastercard, AMEX' },
  { id: 'cod',   label: 'Cash on Delivery',   icon: '💵', description: 'Pay when your order arrives' },
]
