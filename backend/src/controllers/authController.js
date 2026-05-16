import User          from '../models/User.js'
import generateToken  from '../utils/generateToken.js'
import { ApiError }   from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import asyncHandler   from '../utils/asyncHandler.js'
import { env }        from '../config/env.js'

// ── Cookie options ────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,                    // not accessible via JS
  secure:   env.isProd,              // HTTPS only in production
  sameSite: env.isProd ? 'strict' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

// ── Helper: strip password from user object ───────────────────────────────
const sanitiseUser = (user) => {
  const obj = user.toObject()
  delete obj.password
  return obj
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body

  // ── Validation ──────────────────────────────────────────────────────────
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required')
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters')
  }

  // ── Duplicate email check ───────────────────────────────────────────────
  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  // ── Prevent self-assigning privileged roles ─────────────────────────────
  const allowedSelfRoles = ['customer']
  const assignedRole = allowedSelfRoles.includes(role) ? role : 'customer'

  // ── Create user (password hashed by pre-save hook) ──────────────────────
  const user  = await User.create({ name, email, phone, password, role: assignedRole })
  const token = generateToken(user)

  res
    .status(201)
    .cookie('token', token, cookieOptions)
    .json(
      new ApiResponse(201, { user: sanitiseUser(user), token }, 'Account created successfully')
    )
})

// ─────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // ── Validation ──────────────────────────────────────────────────────────
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  // ── Find user — explicitly select password (it's excluded by default) ───
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // ── Compare password ────────────────────────────────────────────────────
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = generateToken(user)

  res
    .status(200)
    .cookie('token', token, cookieOptions)
    .json(
      new ApiResponse(200, { user: sanitiseUser(user), token }, 'Logged in successfully')
    )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected)
// ─────────────────────────────────────────────────────────────────────────
export const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is attached by the protect middleware
  const user = await User.findById(req.user.userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res
    .status(200)
    .json(new ApiResponse(200, { user }, 'User fetched successfully'))
})
