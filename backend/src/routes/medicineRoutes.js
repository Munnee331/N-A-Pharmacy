import { Router } from 'express'
import {
  getAllMedicines,
  getSingleMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────────────
router.get('/',    getAllMedicines)
router.get('/:id', getSingleMedicine)   // accepts ObjectId or slug

// ── Admin-only routes ─────────────────────────────────────────────────────
router.post(  '/',    protect, adminOnly, createMedicine)
router.put(   '/:id', protect, adminOnly, updateMedicine)
router.delete('/:id', protect, adminOnly, deleteMedicine)

export default router
