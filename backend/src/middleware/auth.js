import jwt          from 'jsonwebtoken'
import { env }      from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

// ─────────────────────────────────────────────────────────────────────────
// protect — verify JWT and attach decoded payload to req.user
// Accepts token from:  Authorization: Bearer <token>  OR  cookie "token"
// ─────────────────────────────────────────────────────────────────────────
export const protect = asyncHandler(async (req, _res, next) => {
  let token

  // 1. Check Authorization header
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  // 2. Fall back to signed cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token
  }

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.')
  }

  // Verify — jsonwebtoken throws JsonWebTokenError / TokenExpiredError
  // which are caught and normalised by the global error handler
  const decoded = jwt.verify(token, env.JWT_SECRET)

  // Attach minimal payload — controllers/middleware can use req.user.userId / req.user.role
  req.user = { userId: decoded.userId, role: decoded.role }

  next()
})

// ─────────────────────────────────────────────────────────────────────────
// adminOnly — must be used AFTER protect
// ─────────────────────────────────────────────────────────────────────────
export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admins only.')
  }
  next()
}

// ─────────────────────────────────────────────────────────────────────────
// pharmacistOnly — must be used AFTER protect
// ─────────────────────────────────────────────────────────────────────────
export const pharmacistOnly = (req, _res, next) => {
  if (req.user?.role !== 'pharmacist') {
    throw new ApiError(403, 'Access denied. Pharmacists only.')
  }
  next()
}

// ─────────────────────────────────────────────────────────────────────────
// pharmacistOrAdmin — must be used AFTER protect
// Allows both pharmacists and admins (e.g. prescription review)
// ─────────────────────────────────────────────────────────────────────────
export const pharmacistOrAdmin = (req, _res, next) => {
  if (req.user?.role !== 'pharmacist' && req.user?.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Pharmacists or admins only.')
  }
  next()
}
