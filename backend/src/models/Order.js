import mongoose from 'mongoose'

// ── Order item sub-document ───────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    medicine: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Medicine',
      required: [true, 'Medicine reference is required'],
    },
    name: {
      type:     String,
      required: [true, 'Medicine name snapshot is required'],
      trim:     true,
    },
    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be at least 1'],
      validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
    },
    price: {
      type:     Number,
      required: [true, 'Unit price snapshot is required'],
      min:      [0, 'Price cannot be negative'],
    },
  },
  { _id: true }
)

// ── Shipping address sub-document ─────────────────────────────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, default: '' },
    city:    { type: String, trim: true, default: 'Dhaka' },
    country: { type: String, trim: true, default: 'Bangladesh' },
  },
  { _id: false }
)

// ── Order schema ──────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── References ───────────────────────────────────────────────────────
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Customer reference is required'],
    },

    prescription: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Prescription',
      default: null,
    },

    // ── Items ─────────────────────────────────────────────────────────────
    items: {
      type:     [orderItemSchema],
      required: [true, 'Order must have at least one item'],
      validate: {
        validator: (arr) => arr.length > 0,
        message:   'Order must contain at least one item',
      },
    },

    // ── Financials ────────────────────────────────────────────────────────
    totalAmount: {
      type:     Number,
      required: [true, 'Total amount is required'],
      min:      [0, 'Total amount cannot be negative'],
    },

    // ── Shipping ──────────────────────────────────────────────────────────
    shippingAddress: {
      type:    shippingAddressSchema,
      default: () => ({}),
    },

    // ── Order lifecycle status ────────────────────────────────────────────
    status: {
      type:    String,
      enum:    {
        values:  ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Invalid order status',
      },
      default: 'pending_payment',
    },

    // ── Payment ───────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: {
        values: ['bkash', 'nagad', 'card', 'cod'],
        message: 'Invalid payment method',
      },
      required: [true, 'Payment method is required'],
    },

    paymentStatus: {
      type:    String,
      enum:    {
        values:  ['unpaid', 'paid', 'failed', 'cancelled', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'unpaid',
    },

    // SSLCommerz transaction ID — set after a successful/failed attempt
    transactionId: {
      type:    String,
      default: null,
    },

    // Full SSLCommerz validation response — stored for audit / dispute
    paymentDetails: {
      type:    mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── Notes ─────────────────────────────────────────────────────────────
    notes: {
      type:      String,
      trim:      true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default:   '',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────
orderSchema.index({ customer: 1, createdAt: -1 })   // customer order history
orderSchema.index({ status: 1, createdAt: -1 })      // admin order queue
orderSchema.index({ paymentStatus: 1 })              // payment reconciliation
orderSchema.index({ transactionId: 1 })              // SSLCommerz lookup

// ── Virtual: isPaid ───────────────────────────────────────────────────────
orderSchema.virtual('isPaid').get(function () {
  return this.paymentStatus === 'paid'
})

const Order = mongoose.model('Order', orderSchema)

export default Order
