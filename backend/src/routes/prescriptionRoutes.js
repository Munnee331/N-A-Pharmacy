import { Router } from 'express'
import {
  uploadPrescription,
  getMyPrescriptions,
  getPendingPrescriptions,
  getPrescriptionById,
  startReview,
  approvePrescription,
  rejectPrescription,
} from '../controllers/prescriptionController.js'
import { protect, pharmacistOrAdmin }    from '../middleware/auth.js'
import { uploadRx, handleUploadError }   from '../middleware/upload.js'

const router = Router()

// ── All prescription routes require authentication ────────────────────────
router.use(protect)

// ── Customer routes ───────────────────────────────────────────────────────

// POST   /api/prescriptions
//   multipart/form-data, field name: "prescription"
//   optional text field: "notes"
router.post(
  '/',
  uploadRx.single('prescription'),
  handleUploadError,
  uploadPrescription
)

// GET    /api/prescriptions/my
// NOTE: /my must be registered BEFORE /:id to avoid "my" being treated as an ID
router.get('/my', getMyPrescriptions)

// ── Pharmacist / admin routes ─────────────────────────────────────────────

// GET    /api/prescriptions/pending
router.get('/pending', pharmacistOrAdmin, getPendingPrescriptions)

// PATCH  /api/prescriptions/:id/start-review
router.patch('/:id/start-review', pharmacistOrAdmin, startReview)

// PATCH  /api/prescriptions/:id/approve
router.patch('/:id/approve', pharmacistOrAdmin, approvePrescription)

// PATCH  /api/prescriptions/:id/reject
router.patch('/:id/reject', pharmacistOrAdmin, rejectPrescription)

// ── Shared route (ownership check inside controller) ─────────────────────

// GET    /api/prescriptions/:id
router.get('/:id', getPrescriptionById)

export default router
