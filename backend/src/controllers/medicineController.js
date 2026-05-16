import Medicine      from '../models/Medicine.js'
import { ApiError }   from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import asyncHandler   from '../utils/asyncHandler.js'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/medicines
// Query params:
//   search   — partial match on name / genericName / brand (text index)
//   category — exact match (case-insensitive)
//   sort     — "price_asc" | "price_desc" | "latest" | "oldest"
//   page     — page number (default 1)
//   limit    — items per page (default 12, max 50)
// ─────────────────────────────────────────────────────────────────────────
export const getAllMedicines = asyncHandler(async (req, res) => {
  const {
    search   = '',
    category = '',
    sort     = 'latest',
    page     = '1',
    limit    = '12',
  } = req.query

  // ── Build filter ────────────────────────────────────────────────────────
  const filter = {}

  if (search.trim()) {
    // Use regex so partial matches work even without a full-text index hit
    const regex = new RegExp(search.trim(), 'i')
    filter.$or = [
      { name:        regex },
      { genericName: regex },
      { brand:       regex },
    ]
  }

  if (category.trim()) {
    filter.category = category.trim().toLowerCase()
  }

  // ── Sort map ────────────────────────────────────────────────────────────
  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    latest:     { createdAt: -1 },
    oldest:     { createdAt: 1 },
  }
  const sortOption = sortMap[sort] ?? { createdAt: -1 }

  // ── Pagination ──────────────────────────────────────────────────────────
  const pageNum   = Math.max(1, parseInt(page,  10) || 1)
  const limitNum  = Math.min(50, Math.max(1, parseInt(limit, 10) || 12))
  const skip      = (pageNum - 1) * limitNum

  // ── Execute query + count in parallel ───────────────────────────────────
  const [medicines, total] = await Promise.all([
    Medicine.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Medicine.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.status(200).json(
    new ApiResponse(200, {
      medicines,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages,
        hasNext:    pageNum < totalPages,
        hasPrev:    pageNum > 1,
      },
    }, 'Medicines fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/medicines/:id
// Accepts MongoDB ObjectId OR slug
// ─────────────────────────────────────────────────────────────────────────
export const getSingleMedicine = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Try ObjectId first, fall back to slug
  const isObjectId = /^[a-f\d]{24}$/i.test(id)
  const medicine   = isObjectId
    ? await Medicine.findById(id).lean()
    : await Medicine.findOne({ slug: id }).lean()

  if (!medicine) {
    throw new ApiError(404, 'Medicine not found')
  }

  res.status(200).json(
    new ApiResponse(200, { medicine }, 'Medicine fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// POST /api/medicines          (admin only)
// ─────────────────────────────────────────────────────────────────────────
export const createMedicine = asyncHandler(async (req, res) => {
  const {
    name, genericName, brand, category, description,
    price, discountPrice, stock, prescriptionRequired,
    manufacturer, dosage, image, isFeatured, slug,
  } = req.body

  // ── Required field validation ───────────────────────────────────────────
  if (!name?.trim()) {
    throw new ApiError(400, 'Medicine name is required')
  }
  if (category === undefined || category === '') {
    throw new ApiError(400, 'Category is required')
  }
  if (price === undefined || price === null) {
    throw new ApiError(400, 'Price is required')
  }
  if (Number(price) < 0) {
    throw new ApiError(400, 'Price cannot be negative')
  }

  // ── Duplicate name check ────────────────────────────────────────────────
  const existing = await Medicine.findOne({ name: name.trim() })
  if (existing) {
    throw new ApiError(409, `A medicine named "${name.trim()}" already exists`)
  }

  const medicine = await Medicine.create({
    name, genericName, brand, category, description,
    price, discountPrice, stock, prescriptionRequired,
    manufacturer, dosage, image, isFeatured,
    // Only set slug from body if explicitly provided; pre-save hook handles auto-gen
    ...(slug ? { slug } : {}),
  })

  res.status(201).json(
    new ApiResponse(201, { medicine }, 'Medicine created successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/medicines/:id       (admin only)
// ─────────────────────────────────────────────────────────────────────────
export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id)
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found')
  }

  // Whitelist updatable fields
  const allowed = [
    'name', 'genericName', 'brand', 'category', 'description',
    'price', 'discountPrice', 'stock', 'prescriptionRequired',
    'manufacturer', 'dosage', 'image', 'isFeatured', 'slug',
  ]

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      medicine[field] = req.body[field]
    }
  })

  // Re-generate slug if name changed and no explicit slug provided
  if (req.body.name && !req.body.slug) {
    medicine.slug = undefined   // triggers pre-save auto-gen
  }

  const updated = await medicine.save()

  res.status(200).json(
    new ApiResponse(200, { medicine: updated }, 'Medicine updated successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/medicines/:id    (admin only)
// ─────────────────────────────────────────────────────────────────────────
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id)
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found')
  }

  await medicine.deleteOne()

  res.status(200).json(
    new ApiResponse(200, { id: req.params.id }, 'Medicine deleted successfully')
  )
})
