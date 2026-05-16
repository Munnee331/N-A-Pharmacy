import mongoose from 'mongoose'
import bcrypt    from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type:  String,
      trim:  true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false,   // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ['customer', 'pharmacist', 'admin'],
      default: 'customer',
    },

    avatar: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
)

// ── Hash password before saving ───────────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash when the password field was actually modified
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// ── Instance method: compare plain-text password with stored hash ─────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
