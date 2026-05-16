import Order            from '../models/Order.js'
import { ApiError }    from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import asyncHandler    from '../utils/asyncHandler.js'
import { generateInvoicePDF } from '../services/invoiceService.js'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/me
// Returns the authenticated customer's orders, newest first.
// Query: page, limit
// ─────────────────────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = '1', limit = '10' } = req.query

  const pageNum  = Math.max(1, parseInt(page,  10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const skip     = (pageNum - 1) * limitNum

  const filter = { customer: req.user.userId }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.status(200).json(
    new ApiResponse(200, {
      data: orders,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages,
        hasNext:    pageNum < totalPages,
        hasPrev:    pageNum > 1,
      },
    }, 'Orders fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Returns a single order. Customers can only view their own.
// ─────────────────────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const order = await Order.findById(id).lean()

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Customers can only see their own orders
  if (
    order.customer.toString() !== req.user.userId &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError(403, 'You do not have permission to view this order')
  }

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders  (admin only)
// Returns all orders with pagination.
// ─────────────────────────────────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', status, paymentStatus } = req.query

  const pageNum  = Math.max(1, parseInt(page,  10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  const skip     = (pageNum - 1) * limitNum

  const filter = {}
  if (status)        filter.status        = status
  if (paymentStatus) filter.paymentStatus = paymentStatus

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('customer', 'name email phone')
      .lean(),
    Order.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, page: pageNum, limit: limitNum, totalPages },
    }, 'Orders fetched successfully')
  )
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id/invoice
// Streams a PDF invoice for the given order.
// Allowed: the customer who owns the order, or any admin.
// ─────────────────────────────────────────────────────────────────────────
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Populate customer so the invoice can show name / email / phone
  const order = await Order.findById(id)
    .populate('customer', 'name email phone')
    .lean()

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  // Authorization: owner or admin only
  if (
    order.customer._id.toString() !== req.user.userId &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError(403, 'You do not have permission to download this invoice')
  }

  // Generate and stream the PDF
  generateInvoicePDF(order, res)
})
