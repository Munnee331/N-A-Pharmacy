import { Router } from 'express'
import {
  initiatePaymentSession,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// ── Initiate a payment session ────────────────────────────────────────────
// Requires authentication — customer identity is taken from the JWT.
router.post('/initiate', protect, initiatePaymentSession)

// ── SSLCommerz callback URLs ──────────────────────────────────────────────
// These are called by SSLCommerz servers (no auth header), so protect() is
// intentionally omitted. They are POST-only as required by SSLCommerz.
router.post('/success', paymentSuccess)
router.post('/fail',    paymentFail)
router.post('/cancel',  paymentCancel)
router.post('/ipn',     paymentIPN)

export default router
