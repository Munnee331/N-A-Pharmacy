/**
 * Multer middleware for prescription file uploads.
 *
 * Rules:
 *  - Accepted MIME types: image/jpeg, image/png, image/webp, application/pdf
 *  - Maximum file size: 10 MB
 *  - Storage destination: uploads/prescriptions/
 *  - File name: {timestamp}-{random6hex}.{ext}
 *
 * Usage:
 *   import { uploadRx } from '../middleware/upload.js'
 *   router.post('/', protect, uploadRx.single('prescription'), handler)
 */

import path    from 'path'
import crypto  from 'crypto'
import multer  from 'multer'
import { ApiError } from '../utils/ApiError.js'

// ── Constants ─────────────────────────────────────────────────────────────

export const UPLOAD_DIR      = 'uploads/prescriptions'
export const MAX_FILE_SIZE   = 10 * 1024 * 1024   // 10 MB in bytes
export const ALLOWED_MIMES   = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
export const ALLOWED_EXTS    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf'])

// ── Storage engine ────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination (_req, _file, cb) {
    cb(null, UPLOAD_DIR)
  },

  filename (_req, file, cb) {
    const ext      = path.extname(file.originalname).toLowerCase()
    const random   = crypto.randomBytes(6).toString('hex')
    const filename = `${Date.now()}-${random}${ext}`
    cb(null, filename)
  },
})

// ── MIME + extension filter ───────────────────────────────────────────────

function fileFilter (_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase()

  if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
    return cb(
      new ApiError(
        415,
        'Unsupported file type. Only JPEG, PNG, WEBP, and PDF files are accepted.'
      )
    )
  }

  cb(null, true)
}

// ── Multer instance ───────────────────────────────────────────────────────

export const uploadRx = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:  MAX_FILE_SIZE,
    files:     1,
    fields:    5,
  },
})

// ── Error normaliser ──────────────────────────────────────────────────────
// Converts multer-specific errors into ApiError so the global handler
// returns a consistent JSON shape.

export function handleUploadError (err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(413, 'File is too large. Maximum allowed size is 10 MB.'))
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Only one file can be uploaded at a time.'))
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(400, 'Unexpected field name. Use "prescription" as the field name.'))
    }
    return next(new ApiError(400, `Upload error: ${err.message}`))
  }

  // Pass through ApiError from fileFilter and everything else
  next(err)
}
