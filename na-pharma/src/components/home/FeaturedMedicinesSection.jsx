import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import MedicineCard from '../shop/MedicineCard'
import Button from '../ui/Button'

// Realistic dummy medicine data
const FEATURED_MEDICINES = [
  {
    id: 1,
    name: 'Napa Extra 500mg Paracetamol Tablet',
    brand: 'Beximco Pharmaceuticals',
    price: 35,
    originalPrice: 40,
    category: 'Tablet',
    inStock: true,
    rating: 4.8,
    reviewCount: 1240,
    badge: 'Bestseller',
    image: null,
  },
  {
    id: 2,
    name: 'Seclo 20mg Omeprazole Capsule',
    brand: 'Square Pharmaceuticals',
    price: 120,
    originalPrice: 140,
    category: 'Capsule',
    inStock: true,
    rating: 4.6,
    reviewCount: 876,
    badge: null,
    image: null,
  },
  {
    id: 3,
    name: 'Amoxil 500mg Amoxicillin Capsule',
    brand: 'GlaxoSmithKline',
    price: 85,
    originalPrice: null,
    category: 'Capsule',
    inStock: true,
    rating: 4.7,
    reviewCount: 654,
    badge: null,
    image: null,
  },
  {
    id: 4,
    name: 'Zimax 500mg Azithromycin Tablet',
    brand: 'ACI Limited',
    price: 280,
    originalPrice: 320,
    category: 'Tablet',
    inStock: false,
    rating: 4.5,
    reviewCount: 432,
    badge: null,
    image: null,
  },
  {
    id: 5,
    name: 'Rennie Antacid Chewable Tablet',
    brand: 'Bayer Healthcare',
    price: 95,
    originalPrice: 110,
    category: 'Tablet',
    inStock: true,
    rating: 4.4,
    reviewCount: 389,
    badge: 'New',
    image: null,
  },
  {
    id: 6,
    name: 'Vitamin D3 1000 IU Softgel Capsule',
    brand: 'Opsonin Pharma',
    price: 180,
    originalPrice: 200,
    category: 'Capsule',
    inStock: true,
    rating: 4.9,
    reviewCount: 2100,
    badge: 'Top Rated',
    image: null,
  },
  {
    id: 7,
    name: 'Cough Syrup with Honey & Ginger 100ml',
    brand: 'Aristopharma',
    price: 65,
    originalPrice: null,
    category: 'Syrup',
    inStock: true,
    rating: 4.3,
    reviewCount: 215,
    badge: null,
    image: null,
  },
  {
    id: 8,
    name: 'Omega-3 Fish Oil 1000mg Softgel',
    brand: 'Healthcare Pharma',
    price: 350,
    originalPrice: 420,
    category: 'Capsule',
    inStock: true,
    rating: 4.7,
    reviewCount: 987,
    badge: 'Popular',
    image: null,
  },
]

export default function FeaturedMedicinesSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-primary-600 text-sm
                             font-medium mb-2">
              <Sparkles size={14} />
              Handpicked for You
            </span>
            <h2 className="text-3xl font-semibold text-neutral-900">
              Featured Medicines
            </h2>
            <p className="text-neutral-500 mt-2 max-w-md">
              Certified, quality-checked medicines from trusted manufacturers —
              delivered fast.
            </p>
          </div>

          <Button
            as={Link}
            to="/shop"
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight size={15} />}
            className="flex-shrink-0 self-start sm:self-auto"
          >
            View All
          </Button>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURED_MEDICINES.map((medicine, i) => (
            <motion.div
              key={medicine.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <MedicineCard
                {...medicine}
                onAddToCart={() => console.log('Add to cart:', medicine.name)}
                onAddToWishlist={() => console.log('Wishlist:', medicine.name)}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center mt-10"
        >
          <Button as={Link} to="/shop" size="lg" rightIcon={<ArrowRight size={18} />}>
            Browse Full Catalogue
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
