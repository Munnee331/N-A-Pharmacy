import { Router } from 'express'
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', registerUser)

// POST /api/auth/login
router.post('/login', loginUser)

// GET  /api/auth/me  — protected
router.get('/me', protect, getCurrentUser)

export default router
