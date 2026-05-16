import { ApiError } from '../utils/ApiError.js'

const isDev = process.env.NODE_ENV !== 'production'

// ── ANSI colours ──────────────────────────────────────────────────────────
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET  = '\x1b[0m'

/**
 * 404 handler — catches requests to undefined routes.
 * Register AFTER all routes, BEFORE errorHandler.
 */
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

/**
 * Global error-handling middleware.
 * Must be the LAST middleware registered in app.js.
 *
 * Handles:
 *  - ApiError (our custom errors)
 *  - Mongoose CastError       → 400 Invalid ID
 *  - Mongoose ValidationError → 422 Validation failed
 *  - Mongoose duplicate key   → 409 Conflict
 *  - JWT errors               → 401 Unauthorized
 *  - Everything else          → 500 Internal Server Error
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err

  // ── Normalise known error types ───────────────────────────────────────

  // Mongoose: invalid ObjectId (e.g. /medicines/not-an-id)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`)
  }

  // Mongoose: schema validation failure
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    error = new ApiError(422, 'Validation failed', messages)
  }

  // Mongoose: duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    error = new ApiError(409, `Duplicate value for "${field}". Please use a different value.`)
  }

  // JWT: invalid signature
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please log in again.')
  }

  // JWT: expired
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired. Please log in again.')
  }

  // ── Build response ────────────────────────────────────────────────────
  const statusCode = error.statusCode || 500
  const message    = error.message    || 'Internal Server Error'

  // Log 5xx errors to console in all environments
  if (statusCode >= 500) {
    console.error(`${RED}✖  [${statusCode}] ${req.method} ${req.originalUrl}${RESET}`)
    console.error(err.stack || err)
  } else if (isDev) {
    console.warn(`${YELLOW}⚠  [${statusCode}] ${req.method} ${req.originalUrl} — ${message}${RESET}`)
  }

  res.status(statusCode).json({
    success:    false,
    statusCode,
    message,
    errors:     error.errors?.length ? error.errors : undefined,
    // Stack trace only in development
    ...(isDev && statusCode >= 500 && { stack: error.stack }),
  })
}
