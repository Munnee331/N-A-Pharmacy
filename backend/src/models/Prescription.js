import mongoose from 'mongoose'

// ── Recommended medicine sub-document ────────────────────────────────────
const recommendedMedicineSchema = new mongoose.Schema(
  {
    medicine: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Medicine',
      required: [true, 'Medicine reference is required'],
    },

    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be at least 1'],
      max:      [999, 'Quantity cannot exceed 999'],
      validate: {
        validator: Number.isInteger,
        message:   'Quantity must be a whole number',
      },
    },

    dosageInstructions: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Dosage instructions cannot exceed 500 characters'],
      default:   '',
    },
  },
  { _id: true }
)

// ── Prescription schema ───────────────────────────────────────────────────
const prescriptionSchema = new mongoose.Schema(
  {
    // ── Core references ─────────────────────────────────────────────────
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Customer reference is required'],
      index:    true,
    },

    pharmacist: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
      index:   true,
    },

    // ── File information ─────────────────────────────────────────────────
    imageUrl: {
      type:     String,
      required: [true, 'Prescription image URL is required'],
      trim:     true,
      validate: {
        validator (v) {
          // Accept relative paths (e.g. /uploads/...) or full URLs
          return /^(https?:\/\/|\/uploads\/)/.test(v)
        },
        message: 'imageUrl must be a valid URL or an /uploads/ path',
      },
    },

    originalFileName: {
      type:      String,
      trim:      true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
      default:   '',
    },

    // ── Workflow status ──────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    {
        values:  ['pending', 'under_review', 'approved', 'rejected'],
        message: 'Status must be one of: pending, under_review, approved, rejected',
      },
      default: 'pending',
      index:   true,
    },

    // ── Communication fields ─────────────────────────────────────────────
    notes: {
      type:      String,
      trim:      true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default:   '',
    },

    rejectionReason: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
      default:   '',
      validate: {
        validator (v) {
          // rejectionReason is required when status is 'rejected'
          if (this.status === 'rejected' && (!v || v.trim() === '')) {
            return false
          }
          return true
        },
        message: 'Rejection reason is required when status is rejected',
      },
    },

    // ── Pharmacist output ────────────────────────────────────────────────
    recommendedMedicines: {
      type:    [recommendedMedicineSchema],
      default: [],
      validate: {
        validator (arr) {
          // When approved, at least one medicine must be recommended
          if (this.status === 'approved' && arr.length === 0) {
            return false
          }
          return true
        },
        message: 'At least one recommended medicine is required when status is approved',
      },
    },
  },
  {
    timestamps: true,   // adds createdAt and updatedAt
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
)

// ── Compound indexes for common query patterns ────────────────────────────
// Customer's prescriptions sorted by newest first
prescriptionSchema.index({ customer: 1, createdAt: -1 })

// Pharmacist's work queue — pending/under_review sorted by submission time
prescriptionSchema.index({ pharmacist: 1, status: 1 })

// Admin/pharmacist queue — all prescriptions by status + time
prescriptionSchema.index({ status: 1, createdAt: 1 })

// ── Pre-save hook: enforce business rules ─────────────────────────────────
prescriptionSchema.pre('save', async function () {
  // Clear pharmacist-specific fields when reverting to pending
  if (this.isModified('status') && this.status === 'pending') {
    this.rejectionReason      = ''
    this.recommendedMedicines = []
    this.pharmacist           = null
  }

  // Clear rejectionReason when approving
  if (this.isModified('status') && this.status === 'approved') {
    this.rejectionReason = ''
  }

  // Clear recommendedMedicines when rejecting
  if (this.isModified('status') && this.status === 'rejected') {
    this.recommendedMedicines = []
  }
})

// ── Virtual: isPending ────────────────────────────────────────────────────
prescriptionSchema.virtual('isPending').get(function () {
  return this.status === 'pending'
})

// ── Virtual: isResolved ───────────────────────────────────────────────────
prescriptionSchema.virtual('isResolved').get(function () {
  return this.status === 'approved' || this.status === 'rejected'
})

const Prescription = mongoose.model('Prescription', prescriptionSchema)

export default Prescription
