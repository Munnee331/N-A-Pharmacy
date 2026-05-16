import { Router } from 'express'
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  downloadInvoice,
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// ── Customer routes ───────────────────────────────────────────────────────
router.get('/me',           protect, getMyOrders)
router.get('/:id/invoice',  protect, downloadInvoice)
router.get('/:id',          protect, getOrderById)

// ── Admin routes ──────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, getAllOrders)

export default router
