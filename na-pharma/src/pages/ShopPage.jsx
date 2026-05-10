import { ShoppingBag } from 'lucide-react'
import SectionContainer from '../components/ui/SectionContainer'

export default function ShopPage() {
  return (
    <div data-testid="shop-page">
      <SectionContainer py="lg">
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
            <ShoppingBag size={28} className="text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Shop</h1>
          <p className="text-neutral-500 max-w-md">
            Our medicine catalogue is coming soon. Browse thousands of certified
            healthcare products with fast delivery.
          </p>
          <span className="mt-6 inline-flex items-center px-4 py-2 rounded-full
                           bg-primary-50 text-primary-600 text-sm font-medium">
            Coming Soon
          </span>
        </div>
      </SectionContainer>
    </div>
  )
}
