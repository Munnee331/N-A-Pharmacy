import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User reference is required'],
      index:    true,
    },
    medicine: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Medicine',
      required: [true, 'Medicine reference is required'],
      index:    true,
    },
    quantity: {
      type:    Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min:     [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message:   'Quantity must be a whole number',
      },
    },
  },
  {
    timestamps: true,
  }
)

// Ensure each user has only one wishlist entry per medicine
wishlistSchema.index({ user: 1, medicine: 1 }, { unique: true })

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist
