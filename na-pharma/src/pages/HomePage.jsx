import HeroSection from '../components/home/HeroSection'
import FeaturedMedicinesSection from '../components/home/FeaturedMedicinesSection'
import CategoriesSection from '../components/home/CategoriesSection'
import WhyChooseUsSection from '../components/home/WhyChooseUsSection'
import PrescriptionUploadSection from '../components/home/PrescriptionUploadSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import NewsletterSection from '../components/home/NewsletterSection'

/**
 * Home page — composed from focused section components.
 * Section order: Hero → Featured → Categories → Why Us → Prescription Upload → Testimonials → Newsletter
 */
export default function HomePage() {
  return (
    <div data-testid="home-page">
      <HeroSection />
      <FeaturedMedicinesSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <PrescriptionUploadSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  )
}
