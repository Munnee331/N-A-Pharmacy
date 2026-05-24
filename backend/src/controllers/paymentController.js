import Order            from '../models/Order.js'
import Medicine         from '../models/Medicine.js'
import { initiatePayment, validatePayment } from '../services/paymentService.js'
import { ApiError }    from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import asyncHandler    from '../utils/asyncHandler.js'
import { env }         from '../config/env.js'

// ── Helpers ───────────────────────────────────────────────────────────────

const isObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v))

/**
 * Build a safe frontend redirect URL, stripping any injected characters.
 */
function frontendRedirect(res, path, params = {}) {
  const url = new URL(path, env.FRONTEND_URL)
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v))
  })
  return res.redirect(url.toString())
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/initiate
//
// Accepts order information, creates a pending Order document, initiates
// an SSLCommerz session, and returns the GatewayPageURL.
//
// Body (JSON):
//   items[]          – array of { medicine, name, quantity, price }
//   shippingAddress  – { address?, city?, country? }
//   notes?           – optional order notes
//   prescription?    – optional Prescription ObjectId
//
// The customer identity comes from the JWT (req.user), so no customer
// fields need to be sent from the frontend.
// ─────────────────────────────────────────────────────────────────────────
export const initiatePaymentSession = asyncHandler(async (req, res) => {
  const { items, shippingAddress = {}, notes = '', prescription, paymentMethod } = req.body
  const allowedMethods = ['bkash', 'nagad', 'card', 'cod']

  if (!allowedMethods.includes(paymentMethod)) {
    throw new ApiError(400, `paymentMethod must be one of: ${allowedMethods.join(', ')}`)
  }

  // ── Validate items ────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'items must be a non-empty array')
  }

  for (const [i, item] of items.entries()) {
    if (!item.medicine || !isObjectId(item.medicine)) {
      throw new ApiError(400, `items[${i}].medicine must be a valid Medicine ID`)
    }
    if (!item.name?.trim()) {
      throw new ApiError(400, `items[${i}].name is required`)
    }
    const qty = Number(item.quantity)
    if (!Number.isInteger(qty) || qty < 1) {
      throw new ApiError(400, `items[${i}].quantity must be a positive integer`)
    }
    const price = Number(item.price)
    if (isNaN(price) || price < 0) {
      throw new ApiError(400, `items[${i}].price must be a non-negative number`)
    }
  }

  if (prescription && !isObjectId(prescription)) {
    throw new ApiError(400, 'prescription must be a valid Prescription ID')
  }

  // ── Prescription filtering: if the customer did NOT provide a prescription
  // (either a Prescription id or an uploaded prescriptionImage url), remove
  // any prescription-required medicines from the items list so the customer
  // can still purchase non-prescription items.
  const medicineIds = items.map((item) => item.medicine)
  const prescriptionItems = await Medicine.find(
    { _id: { $in: medicineIds }, prescriptionRequired: true },
    '_id'
  ).lean()

  const restrictedIds = new Set(prescriptionItems.map((m) => String(m._id)))
  const providedPrescription = Boolean(prescription) || Boolean(req.body.prescriptionImage)

  // Build arrays for processing vs filtered out
  let processingItems = items
  let filteredOutItems = []
  if (!providedPrescription && restrictedIds.size > 0) {
    processingItems = items.filter((it) => !restrictedIds.has(String(it.medicine)))
    filteredOutItems = items
      .filter((it) => restrictedIds.has(String(it.medicine)))
      .map((it) => ({ medicine: it.medicine, name: it.name, quantity: Number(it.quantity) }))
  }

  // If nothing remains to process, return a successful response noting the
  // filtered items so the frontend can update the cart accordingly.
  if (processingItems.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { filteredOutItems }, 'No eligible non-prescription items to process. Restricted items were removed due to missing prescription.')
    )
  }

  // ── Calculate total for items that will actually be processed ─────────
  const totalAmount = processingItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  )

  if (totalAmount <= 0) {
    throw new ApiError(400, 'Total order amount must be greater than 0')
  }

  const orderPayload = {
    customer: req.user.userId,
    items:    processingItems.map((item) => ({
      medicine: item.medicine,
      name:     item.name.trim(),
      quantity: Number(item.quantity),
      price:    Number(item.price),
    })),
    totalAmount,
    shippingAddress: {
      address: shippingAddress.address ?? '',
      city:    shippingAddress.city    ?? 'Dhaka',
      country: shippingAddress.country ?? 'Bangladesh',
    },
    notes:          notes.trim(),
    prescription:   prescription ?? null,
    paymentMethod,
    paymentStatus:  'unpaid',
  }

  if (paymentMethod === 'cod') {
    orderPayload.status = 'processing'
  } else {
    orderPayload.status = 'pending_payment'
  }


  const order = await Order.create(orderPayload)

  if (paymentMethod === 'cod') {
    return res.status(200).json(
      new ApiResponse(200, { orderId: order._id, gatewayUrl: null, filteredOutItems }, 'Cash on delivery order placed successfully')
    )
  }

  // ── Initiate SSLCommerz session ───────────────────────────────────────
  let gatewayUrl
  try {
    gatewayUrl = await initiatePayment({
      orderId:         order._id.toString(),
      amount:          totalAmount,
      customerName:    req.user.name  ?? 'Customer',
      customerEmail:   req.user.email ?? '',
      customerPhone:   req.user.phone ?? '01700000000',
      customerAddress: shippingAddress.address ?? 'N/A',
      customerCity:    shippingAddress.city    ?? 'Dhaka',
      productName:     `Order #${order._id.toString().slice(-6).toUpperCase()}`,
    })
  } catch (err) {
    // Roll back the order so the customer can retry cleanly
    await Order.findByIdAndDelete(order._id)
    throw new ApiError(502, `Payment gateway error: ${err.message}`)
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { orderId: order._id, gatewayUrl, filteredOutItems },
      'Payment session initiated — redirect user to gatewayUrl'
    )
  )
})

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/success
// SSLCommerz POSTs here after a successful payment.
// Validates the transaction hash, marks the order as paid, then redirects
// the user to the frontend success page.
// ─────────────────────────────────────────────────────────────────────────
export const paymentSuccess = asyncHandler(async (req, res) => {
  const payload = req.body
  const { tran_id, val_id, amount, card_type, bank_tran_id, status } = payload

  if (!tran_id) {
    return frontendRedirect(res, '/payment/fail', { reason: 'missing_tran_id' })
  }

  // ── Verify hash with SSLCommerz ───────────────────────────────────────
  const isValid = await validatePayment(payload)

  if (!isValid) {
    // Mark order as failed so the customer knows to retry
    await Order.findByIdAndUpdate(tran_id, {
      paymentStatus:  'failed',
      transactionId:  val_id ?? tran_id,
      paymentDetails: payload,
    })
    return frontendRedirect(res, '/payment/fail', {
      tran_id,
      reason: 'validation_failed',
    })
  }

  // ── Update order to paid ──────────────────────────────────────────────
  const order = await Order.findByIdAndUpdate(
    tran_id,
    {
      paymentStatus:  'paid',
      status:         'processing',
      transactionId:  val_id ?? tran_id,
      paymentDetails: {
        val_id,
        amount,
        card_type,
        bank_tran_id,
        status,
        validatedAt: new Date().toISOString(),
      },
    },
    { new: true }
  )

  if (!order) {
    // Payment was valid but we couldn't find the order — log and redirect
    console.error(`[Payment Success] Order not found for tran_id: ${tran_id}`)
    return frontendRedirect(res, '/payment/fail', {
      tran_id,
      reason: 'order_not_found',
    })
  }

  console.log(`[Payment Success] Order ${tran_id} marked as paid (val_id: ${val_id})`)

  return frontendRedirect(res, '/payment/success', { tran_id, orderId: order._id })
})

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/fail
// SSLCommerz POSTs here when the payment fails at the gateway.
// ─────────────────────────────────────────────────────────────────────────
export const paymentFail = asyncHandler(async (req, res) => {
  const { tran_id } = req.body

  if (tran_id) {
    await Order.findByIdAndUpdate(tran_id, {
      paymentStatus:  'failed',
      paymentDetails: req.body,
    })
    console.log(`[Payment Fail] Order ${tran_id} marked as failed`)
  }

  return frontendRedirect(res, '/payment/fail', { tran_id: tran_id ?? '' })
})

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/cancel
// SSLCommerz POSTs here when the user cancels on the gateway page.
// ─────────────────────────────────────────────────────────────────────────
export const paymentCancel = asyncHandler(async (req, res) => {
  const { tran_id } = req.body

  if (tran_id) {
    await Order.findByIdAndUpdate(tran_id, {
      paymentStatus:  'cancelled',
      paymentDetails: req.body,
    })
    console.log(`[Payment Cancel] Order ${tran_id} marked as cancelled`)
  }

  return frontendRedirect(res, '/payment/cancel', { tran_id: tran_id ?? '' })
})

// ─────────────────────────────────────────────────────────────────────────
// POST /api/payments/ipn
// Instant Payment Notification — server-to-server async callback.
// SSLCommerz may call this independently of the success/fail redirects.
// Must respond 200 quickly; all work is done synchronously here since
// Express async errors are caught by asyncHandler.
// ─────────────────────────────────────────────────────────────────────────
export const paymentIPN = asyncHandler(async (req, res) => {
  const payload = req.body
  const { tran_id, val_id, status } = payload

  if (!tran_id) {
    // Respond 200 so SSLCommerz doesn't keep retrying a malformed request
    return res.status(200).json({ received: true, processed: false })
  }

  const isValid = await validatePayment(payload)

  if (!isValid) {
    console.warn(`[IPN] Invalid notification for tran_id: ${tran_id}`)
    return res.status(200).json({ received: true, processed: false })
  }

  // ── Idempotent update — only change if not already paid ──────────────
  if (status === 'VALID' || status === 'VALIDATED') {
    const order = await Order.findById(tran_id)

    if (order && order.paymentStatus !== 'paid') {
      await Order.findByIdAndUpdate(tran_id, {
        paymentStatus:  'paid',
        status:         'processing',
        transactionId:  val_id ?? tran_id,
        paymentDetails: {
          ...payload,
          ipnReceivedAt: new Date().toISOString(),
        },
      })
      console.log(`[IPN] Order ${tran_id} updated to paid via IPN`)
    } else if (order?.paymentStatus === 'paid') {
      console.log(`[IPN] Order ${tran_id} already paid — skipping duplicate IPN`)
    } else {
      console.warn(`[IPN] Order not found for tran_id: ${tran_id}`)
    }
  } else {
    // FAILED or other terminal status from IPN
    await Order.findByIdAndUpdate(tran_id, {
      paymentStatus:  'failed',
      paymentDetails: { ...payload, ipnReceivedAt: new Date().toISOString() },
    })
    console.log(`[IPN] Order ${tran_id} marked failed via IPN (status: ${status})`)
  }

  return res.status(200).json({ received: true, processed: true })
})
