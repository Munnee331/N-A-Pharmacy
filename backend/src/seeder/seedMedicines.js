/**
 * Medicine seeder — populates the medicines collection with realistic data.
 *
 * Usage:
 *   npm run seed:medicines
 *
 * Safe to re-run: clears existing medicines and re-inserts fresh data.
 */

import 'dotenv/config'
import { connectDB, disconnectDB } from '../config/db.js'
import Medicine from '../models/Medicine.js'

const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const RESET  = '\x1b[0m'

const MEDICINES = [
  // ── Tablets ──────────────────────────────────────────────────────────────
  {
    name: 'Napa Extra 500mg Paracetamol Tablet',
    genericName: 'Paracetamol',
    brand: 'Beximco Pharmaceuticals',
    category: 'tablet',
    description: 'Fast-acting pain relief and fever reducer. Suitable for headache, toothache, and mild fever.',
    price: 35,
    discountPrice: null,
    stock: 500,
    prescriptionRequired: false,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    dosage: '1–2 tablets every 4–6 hours. Max 8 tablets/day.',
    ratings: { average: 4.8, count: 1240 },
    isFeatured: true,
  },
  {
    name: 'Seclo 20mg Omeprazole Capsule',
    genericName: 'Omeprazole',
    brand: 'Square Pharmaceuticals',
    category: 'capsule',
    description: 'Proton pump inhibitor for acid reflux, GERD, and peptic ulcer treatment.',
    price: 120,
    discountPrice: 105,
    stock: 300,
    prescriptionRequired: true,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    dosage: '1 capsule daily before breakfast.',
    ratings: { average: 4.6, count: 876 },
    isFeatured: true,
  },
  {
    name: 'Amoxil 500mg Amoxicillin Capsule',
    genericName: 'Amoxicillin',
    brand: 'GlaxoSmithKline',
    category: 'capsule',
    description: 'Broad-spectrum antibiotic for bacterial infections of the ear, nose, throat, and urinary tract.',
    price: 85,
    discountPrice: null,
    stock: 200,
    prescriptionRequired: true,
    manufacturer: 'GlaxoSmithKline Bangladesh Ltd.',
    dosage: '1 capsule 3 times daily for 7–10 days.',
    ratings: { average: 4.7, count: 654 },
    isFeatured: true,
  },
  {
    name: 'Zimax 500mg Azithromycin Tablet',
    genericName: 'Azithromycin',
    brand: 'ACI Limited',
    category: 'tablet',
    description: 'Macrolide antibiotic for respiratory tract infections, skin infections, and STIs.',
    price: 280,
    discountPrice: 250,
    stock: 0,
    prescriptionRequired: true,
    manufacturer: 'ACI Limited',
    dosage: '1 tablet daily for 3–5 days.',
    ratings: { average: 4.5, count: 432 },
    isFeatured: true,
  },
  {
    name: 'Rennie Antacid Chewable Tablet',
    genericName: 'Calcium Carbonate + Magnesium Carbonate',
    brand: 'Bayer Healthcare',
    category: 'tablet',
    description: 'Fast-acting antacid for heartburn, indigestion, and acid stomach relief.',
    price: 95,
    discountPrice: 85,
    stock: 400,
    prescriptionRequired: false,
    manufacturer: 'Bayer Healthcare',
    dosage: '1–2 tablets after meals and at bedtime.',
    ratings: { average: 4.4, count: 389 },
    isFeatured: true,
  },
  {
    name: 'Vitamin D3 1000 IU Softgel Capsule',
    genericName: 'Cholecalciferol',
    brand: 'Opsonin Pharma',
    category: 'capsule',
    description: 'Essential vitamin D3 supplement for bone health, immune support, and calcium absorption.',
    price: 180,
    discountPrice: 160,
    stock: 600,
    prescriptionRequired: false,
    manufacturer: 'Opsonin Pharma Ltd.',
    dosage: '1 softgel daily with a meal.',
    ratings: { average: 4.9, count: 2100 },
    isFeatured: true,
  },
  {
    name: 'Tussex Cough Syrup with Honey 100ml',
    genericName: 'Dextromethorphan + Guaifenesin',
    brand: 'Aristopharma',
    category: 'syrup',
    description: 'Soothing cough syrup with honey for dry and productive cough relief.',
    price: 65,
    discountPrice: null,
    stock: 350,
    prescriptionRequired: false,
    manufacturer: 'Aristopharma Ltd.',
    dosage: '10ml every 6–8 hours. Max 4 doses/day.',
    ratings: { average: 4.3, count: 215 },
    isFeatured: true,
  },
  {
    name: 'Omega-3 Fish Oil 1000mg Softgel',
    genericName: 'Omega-3 Fatty Acids (EPA + DHA)',
    brand: 'Healthcare Pharma',
    category: 'capsule',
    description: 'Premium fish oil supplement for heart health, brain function, and joint support.',
    price: 350,
    discountPrice: 310,
    stock: 250,
    prescriptionRequired: false,
    manufacturer: 'Healthcare Pharma Ltd.',
    dosage: '1–2 softgels daily with meals.',
    ratings: { average: 4.7, count: 987 },
    isFeatured: true,
  },
  // ── More medicines ────────────────────────────────────────────────────────
  {
    name: 'Metformin 500mg Tablet',
    genericName: 'Metformin Hydrochloride',
    brand: 'Incepta Pharmaceuticals',
    category: 'tablet',
    description: 'First-line oral antidiabetic medication for type 2 diabetes management.',
    price: 45,
    discountPrice: null,
    stock: 800,
    prescriptionRequired: true,
    manufacturer: 'Incepta Pharmaceuticals Ltd.',
    dosage: '1 tablet twice daily with meals.',
    ratings: { average: 4.5, count: 1100 },
    isFeatured: false,
  },
  {
    name: 'Amlodipine 5mg Tablet',
    genericName: 'Amlodipine Besylate',
    brand: 'Renata Limited',
    category: 'tablet',
    description: 'Calcium channel blocker for hypertension and angina treatment.',
    price: 60,
    discountPrice: null,
    stock: 600,
    prescriptionRequired: true,
    manufacturer: 'Renata Limited',
    dosage: '1 tablet once daily.',
    ratings: { average: 4.6, count: 780 },
    isFeatured: false,
  },
  {
    name: 'Cetirizine 10mg Tablet',
    genericName: 'Cetirizine Hydrochloride',
    brand: 'Drug International',
    category: 'tablet',
    description: 'Non-drowsy antihistamine for allergic rhinitis, urticaria, and hay fever.',
    price: 25,
    discountPrice: null,
    stock: 1000,
    prescriptionRequired: false,
    manufacturer: 'Drug International Ltd.',
    dosage: '1 tablet once daily at bedtime.',
    ratings: { average: 4.7, count: 1560 },
    isFeatured: false,
  },
  {
    name: 'Pantoprazole 40mg Tablet',
    genericName: 'Pantoprazole Sodium',
    brand: 'Square Pharmaceuticals',
    category: 'tablet',
    description: 'Proton pump inhibitor for erosive esophagitis and Zollinger-Ellison syndrome.',
    price: 140,
    discountPrice: 120,
    stock: 400,
    prescriptionRequired: true,
    manufacturer: 'Square Pharmaceuticals Ltd.',
    dosage: '1 tablet daily before breakfast.',
    ratings: { average: 4.5, count: 620 },
    isFeatured: false,
  },
  {
    name: 'Paediatric Paracetamol Syrup 60ml',
    genericName: 'Paracetamol',
    brand: 'Beximco Pharmaceuticals',
    category: 'syrup',
    description: 'Children\'s fever and pain relief syrup. Strawberry flavoured.',
    price: 55,
    discountPrice: null,
    stock: 450,
    prescriptionRequired: false,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    dosage: '5–10ml every 4–6 hours based on weight.',
    ratings: { average: 4.8, count: 930 },
    isFeatured: false,
  },
  {
    name: 'Calcium + Vitamin D3 Tablet',
    genericName: 'Calcium Carbonate + Cholecalciferol',
    brand: 'Opsonin Pharma',
    category: 'tablet',
    description: 'Combined calcium and vitamin D3 supplement for bone density and osteoporosis prevention.',
    price: 220,
    discountPrice: 195,
    stock: 300,
    prescriptionRequired: false,
    manufacturer: 'Opsonin Pharma Ltd.',
    dosage: '1 tablet twice daily with meals.',
    ratings: { average: 4.6, count: 445 },
    isFeatured: false,
  },
  {
    name: 'Atorvastatin 10mg Tablet',
    genericName: 'Atorvastatin Calcium',
    brand: 'ACI Limited',
    category: 'tablet',
    description: 'Statin medication for lowering LDL cholesterol and reducing cardiovascular risk.',
    price: 75,
    discountPrice: null,
    stock: 500,
    prescriptionRequired: true,
    manufacturer: 'ACI Limited',
    dosage: '1 tablet once daily at any time.',
    ratings: { average: 4.4, count: 670 },
    isFeatured: false,
  },
  {
    name: 'Salbutamol 100mcg Inhaler',
    genericName: 'Salbutamol Sulphate',
    brand: 'GlaxoSmithKline',
    category: 'inhaler',
    description: 'Bronchodilator inhaler for quick relief of asthma and COPD symptoms.',
    price: 320,
    discountPrice: 290,
    stock: 150,
    prescriptionRequired: true,
    manufacturer: 'GlaxoSmithKline Bangladesh Ltd.',
    dosage: '1–2 puffs as needed. Max 8 puffs/day.',
    ratings: { average: 4.8, count: 540 },
    isFeatured: false,
  },
  {
    name: 'Multivitamin + Minerals Tablet',
    genericName: 'Multivitamin Complex',
    brand: 'Incepta Pharmaceuticals',
    category: 'tablet',
    description: 'Complete daily multivitamin with 12 vitamins and 9 minerals for overall health.',
    price: 280,
    discountPrice: 250,
    stock: 700,
    prescriptionRequired: false,
    manufacturer: 'Incepta Pharmaceuticals Ltd.',
    dosage: '1 tablet daily with breakfast.',
    ratings: { average: 4.5, count: 1230 },
    isFeatured: false,
  },
  {
    name: 'Ibuprofen 400mg Tablet',
    genericName: 'Ibuprofen',
    brand: 'Renata Limited',
    category: 'tablet',
    description: 'NSAID for pain, inflammation, and fever. Effective for arthritis and menstrual pain.',
    price: 40,
    discountPrice: null,
    stock: 600,
    prescriptionRequired: false,
    manufacturer: 'Renata Limited',
    dosage: '1 tablet 3 times daily after meals.',
    ratings: { average: 4.3, count: 890 },
    isFeatured: false,
  },
  {
    name: 'Zinc 20mg Tablet',
    genericName: 'Zinc Sulphate',
    brand: 'Drug International',
    category: 'tablet',
    description: 'Zinc supplement for immune support, wound healing, and growth in children.',
    price: 90,
    discountPrice: 80,
    stock: 400,
    prescriptionRequired: false,
    manufacturer: 'Drug International Ltd.',
    dosage: '1 tablet daily with water.',
    ratings: { average: 4.4, count: 320 },
    isFeatured: false,
  },
  {
    name: 'ORS Oral Rehydration Sachet',
    genericName: 'Oral Rehydration Salts',
    brand: 'Beximco Pharmaceuticals',
    category: 'sachet',
    description: 'WHO-formula ORS for dehydration from diarrhoea, vomiting, and heat exhaustion.',
    price: 15,
    discountPrice: null,
    stock: 2000,
    prescriptionRequired: false,
    manufacturer: 'Beximco Pharmaceuticals Ltd.',
    dosage: 'Dissolve 1 sachet in 250ml water. Drink as needed.',
    ratings: { average: 4.9, count: 2800 },
    isFeatured: false,
  },
]

async function seed() {
  console.log(`\n${CYAN}━━━  N A Pharma — Medicine Seeder  ━━━${RESET}\n`)

  await connectDB()

  try {
    // Clear existing medicines
    const deleted = await Medicine.deleteMany({})
    console.log(`${YELLOW}⚠  Cleared ${deleted.deletedCount} existing medicine(s)${RESET}`)

    // Insert one by one so pre-save hooks (slug generation) run on each
    let count = 0
    for (const data of MEDICINES) {
      await Medicine.create(data)
      count++
    }
    console.log(`${GREEN}✔  Inserted ${count} medicines successfully${RESET}`)

    // Summary by category
    const categories = {}
    MEDICINES.forEach((m) => {
      categories[m.category] = (categories[m.category] || 0) + 1
    })
    console.log('\n  By category:')
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   - ${cat.padEnd(12)} ${count}`)
    })
    console.log()

  } catch (err) {
    console.error(`${RED}✖  Seeder failed:${RESET}`, err.message)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

seed()
