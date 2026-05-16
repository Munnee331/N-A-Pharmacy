import mongoose      from 'mongoose'
import path          from 'path'
import fs            from 'fs'
import Prescription   from '../models/Prescription.js'
import { ApiError }   from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import asyncHandler   from '../utils/asyncHandler.js'
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js'

// ── Helpers ───────────────────────────────────────────────────────────────

const isObjectId = (v) => /^[a-f\d]{24}$/i.test(v)

/** Fields populated on every prescription fetch */
const POPULATE_CUSTOMER    = { path: 'customer',   select: 'name email phone' }
const POPULATE_PHARMACIST  = { path: 'pharmacist',  select: 'name email' }
const POPULATE_MEDICINES   = { path: 'recommendedMedicines.medicine', select: 'name brand price image' }

/**
 * Delete a file from disk — used for cleanup on DB save failure.
 * Silently ignores errors (file may not exist).
 */
function deleteFile (filePath) {
  try { fs.unlinkSync(filePath) } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/prescriptions
// Customer uploads a prescription file (multipart/form-data).
// Field name: "prescription"
// Optional body fields: notes
// ─────────────────────────────────────────────────────────────────────────
export const uploadPrescription = asyncHandler(async (req, res) => {
  // multer has already validated MIME type, extension, and file size.
  // If no file was attached, req.file is undefined.
  if (!req.file) {
    throw new ApiError(400, 'Prescription file is required. Send a file in the "prescription" field.')
  }

  const notes            = (req.body.notes ?? '').trim()
  const imageUrl         = `/uploads/prescriptions/${req.file.filename}`
  const originalFileName = req.file.originalname

  let prescription
  try {
    prescription = await Prescription.create({
      customer:         req.user.userId,
      imageUrl,
      originalFileName,
      notes,
    })
  } catch (err) {
    // DB save failed — remove the uploaded file to avoid orphaned files
    deleteFile(req.file.path)
    throw err
  }

  res.status(201).json(
    new ApiResponse(201, { prescription, imageUrl }, 'Prescription submitted successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/my
// Customer sees their own prescriptions, newest first.
// Query: page, limit, status
// ─────────────────────────────────────────────────────────────────────────
export const getMyPrescriptions = asyncHandler(async (req, res) => {
  const { page = '1', limit = '10', status } = req.query

  const pageNum  = Math.max(1, parseInt(page,  10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const skip     = (pageNum - 1) * limitNum

  const filter = { customer: req.user.userId }
  if (status) {
    const allowed = ['pending', 'under_review', 'approved', 'rejected']
    if (!allowed.includes(status)) {
      throw new ApiError(400, `Invalid status filter. Must be one of: ${allowed.join(', ')}`)
    }
    filter.status = status
  }

  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate(POPULATE_PHARMACIST)
      .populate(POPULATE_MEDICINES)
      .lean(),
    Prescription.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.status(200).json(
    new ApiResponse(200, {
      prescriptions,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages,
        hasNext:    pageNum < totalPages,
        hasPrev:    pageNum > 1,
      },
    }, 'Prescriptions fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/pending
// Pharmacist / admin sees prescriptions that need attention.
// Returns: pending + under_review, oldest first (FIFO queue).
// Query: page, limit, status (override to see specific status)
// ─────────────────────────────────────────────────────────────────────────
export const getPendingPrescriptions = asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', status } = req.query

  const pageNum  = Math.max(1, parseInt(page,  10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  const skip     = (pageNum - 1) * limitNum

  // Default: show work queue (pending + under_review)
  const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected']
  let statusFilter

  if (status) {
    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`)
    }
    statusFilter = status
  } else {
    statusFilter = { $in: ['pending', 'under_review'] }
  }

  const filter = { status: statusFilter }

  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .sort({ createdAt: 1 })   // oldest first — FIFO
      .skip(skip)
      .limit(limitNum)
      .populate(POPULATE_CUSTOMER)
      .populate(POPULATE_PHARMACIST)
      .populate(POPULATE_MEDICINES)
      .lean(),
    Prescription.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.status(200).json(
    new ApiResponse(200, {
      prescriptions,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages,
        hasNext:    pageNum < totalPages,
        hasPrev:    pageNum > 1,
      },
    }, 'Prescriptions fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/:id
// View a single prescription.
// Customers can only view their own; pharmacists/admins can view any.
// ─────────────────────────────────────────────────────────────────────────
export const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!isObjectId(id)) {
    throw new ApiError(400, 'Invalid prescription ID')
  }

  const prescription = await Prescription.findById(id)
    .populate(POPULATE_CUSTOMER)
    .populate(POPULATE_PHARMACIST)
    .populate(POPULATE_MEDICINES)
    .lean()

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found')
  }

  // Customers can only see their own prescriptions
  const isOwner          = prescription.customer?._id?.toString() === req.user.userId
  const isPrivilegedRole = req.user.role === 'pharmacist' || req.user.role === 'admin'

  if (!isOwner && !isPrivilegedRole) {
    throw new ApiError(403, 'You do not have permission to view this prescription')
  }

  res.status(200).json(
    new ApiResponse(200, { prescription }, 'Prescription fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/:id/start-review
// Pharmacist claims a prescription and moves it to under_review.
// Prevents two pharmacists from reviewing the same prescription.
// ─────────────────────────────────────────────────────────────────────────
export const startReview = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!isObjectId(id)) {
    throw new ApiError(400, 'Invalid prescription ID')
  }

  const prescription = await Prescription.findById(id)
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found')
  }

  if (prescription.status !== 'pending') {
    throw new ApiError(409, `Cannot start review — prescription is already "${prescription.status}"`)
  }

  prescription.status     = 'under_review'
  prescription.pharmacist = req.user.userId
  await prescription.save()

  await prescription.populate([POPULATE_CUSTOMER, POPULATE_PHARMACIST])

  res.status(200).json(
    new ApiResponse(200, { prescription }, 'Review started')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/:id/approve
// Pharmacist approves a prescription and adds recommended medicines.
// Body: { recommendedMedicines: [{ medicine, quantity, dosageInstructions? }] }
// ─────────────────────────────────────────────────────────────────────────
export const approvePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { recommendedMedicines } = req.body

  if (!isObjectId(id)) {
    throw new ApiError(400, 'Invalid prescription ID')
  }

  // Validate recommendedMedicines
  if (!Array.isArray(recommendedMedicines) || recommendedMedicines.length === 0) {
    throw new ApiError(400, 'At least one recommended medicine is required to approve a prescription')
  }

  for (const [i, item] of recommendedMedicines.entries()) {
    if (!item.medicine || !isObjectId(String(item.medicine))) {
      throw new ApiError(400, `recommendedMedicines[${i}].medicine must be a valid Medicine ID`)
    }
    const qty = Number(item.quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      throw new ApiError(400, `recommendedMedicines[${i}].quantity must be an integer between 1 and 999`)
    }
  }

  const prescription = await Prescription.findById(id)
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found')
  }

  if (!['pending', 'under_review'].includes(prescription.status)) {
    throw new ApiError(409, `Cannot approve — prescription is already "${prescription.status}"`)
  }

  prescription.status               = 'approved'
  prescription.pharmacist           = req.user.userId
  prescription.recommendedMedicines = recommendedMedicines.map((item) => ({
    medicine:           new mongoose.Types.ObjectId(String(item.medicine)),
    quantity:           Number(item.quantity),
    dosageInstructions: item.dosageInstructions?.trim() ?? '',
  }))

  await prescription.save()

  await prescription.populate([POPULATE_CUSTOMER, POPULATE_PHARMACIST, POPULATE_MEDICINES])

  // ── Fire-and-forget approval email ────────────────────────────────────
  sendApprovalEmail({
    customerEmail:        prescription.customer?.email,
    customerName:         prescription.customer?.name  ?? 'Customer',
    prescriptionId:       prescription._id.toString(),
    pharmacistName:       prescription.pharmacist?.name ?? 'Pharmacist',
    recommendedMedicines: prescription.recommendedMedicines,
    notes:                prescription.notes,
  })

  res.status(200).json(
    new ApiResponse(200, { prescription }, 'Prescription approved successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/:id/reject
// Pharmacist rejects a prescription with a reason.
// Body: { rejectionReason }
// ─────────────────────────────────────────────────────────────────────────
export const rejectPrescription = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rejectionReason } = req.body

  if (!isObjectId(id)) {
    throw new ApiError(400, 'Invalid prescription ID')
  }

  if (!rejectionReason?.trim()) {
    throw new ApiError(400, 'rejectionReason is required when rejecting a prescription')
  }

  if (rejectionReason.trim().length > 500) {
    throw new ApiError(400, 'rejectionReason cannot exceed 500 characters')
  }

  const prescription = await Prescription.findById(id)
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found')
  }

  if (!['pending', 'under_review'].includes(prescription.status)) {
    throw new ApiError(409, `Cannot reject — prescription is already "${prescription.status}"`)
  }

  prescription.status          = 'rejected'
  prescription.pharmacist      = req.user.userId
  prescription.rejectionReason = rejectionReason.trim()

  await prescription.save()

  await prescription.populate([POPULATE_CUSTOMER, POPULATE_PHARMACIST])

  // ── Fire-and-forget rejection email ───────────────────────────────────
  sendRejectionEmail({
    customerEmail:   prescription.customer?.email,
    customerName:    prescription.customer?.name  ?? 'Customer',
    prescriptionId:  prescription._id.toString(),
    pharmacistName:  prescription.pharmacist?.name ?? 'Pharmacist',
    rejectionReason: prescription.rejectionReason,
  })

  res.status(200).json(
    new ApiResponse(200, { prescription }, 'Prescription rejected')
  )
})
