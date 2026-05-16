import mongoose from 'mongoose'

// ── Ratings sub-document ──────────────────────────────────────────────────
const ratingsSchema = new mongoose.Schema(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0, min: 0 },
  },
  { _id: false }
)

// ── Medicine schema ───────────────────────────────────────────────────────
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Medicine name is required'],
      trim:     true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },

    // URL-friendly identifier — auto-generated from name if not supplied
    slug: {
      type:   String,
      unique: true,
      trim:   true,
      lowercase: true,
    },

    genericName: {
      type:  String,
      trim:  true,
      default: '',
    },

    brand: {
      type:  String,
      trim:  true,
      default: '',
    },

    category: {
      type:     String,
      required: [true, 'Category is required'],
      trim:     true,
      lowercase: true,
    },

    description: {
      type:    String,
      default: '',
    },

    price: {
      type:     Number,
      required: [true, 'Price is required'],
      min:      [0, 'Price cannot be negative'],
    },

    discountPrice: {
      type:    Number,
      default: null,
      min:     [0, 'Discount price cannot be negative'],
      validate: {
        validator (v) {
          // discountPrice must be less than price when set
          return v == null || v < this.price
        },
        message: 'Discount price must be less than the regular price',
      },
    },

    stock: {
      type:    Number,
      default: 0,
      min:     [0, 'Stock cannot be negative'],
    },

    prescriptionRequired: {
      type:    Boolean,
      default: false,
    },

    manufacturer: {
      type:  String,
      trim:  true,
      default: '',
    },

    dosage: {
      type:  String,
      trim:  true,
      default: '',
    },

    image: {
      type:    String,
      default: '',
    },

    ratings: {
      type:    ratingsSchema,
      default: () => ({}),
    },

    isFeatured: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// ── Indexes for common query patterns ─────────────────────────────────────
medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' })
medicineSchema.index({ category: 1 })
medicineSchema.index({ price: 1 })
medicineSchema.index({ isFeatured: 1 })
medicineSchema.index({ createdAt: -1 })

// ── Auto-generate slug from name before saving ────────────────────────────
medicineSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name)
  }
})

// Simple slug helper — no extra dependency needed
function slugify (str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const Medicine = mongoose.model('Medicine', medicineSchema)

export default Medicine
