import express    from 'express'
import cors       from 'cors'
import morgan     from 'morgan'
import cookieParser from 'cookie-parser'
import path        from 'path'
import { fileURLToPath } from 'url'
import { env }   from './config/env.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import authRoutes         from './routes/authRoutes.js'
import medicineRoutes     from './routes/medicineRoutes.js'
import prescriptionRoutes from './routes/prescriptionRoutes.js'
import paymentRoutes      from './routes/paymentRoutes.js'
import orderRoutes        from './routes/orderRoutes.js'

// ── __dirname equivalent for ES modules ───────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  if (env.isDev) {
    return /^(https?:\/\/localhost(:\d+)?|https?:\/\/127\.0\.0\.1(:\d+)?)$/.test(origin)
  }
  return false
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'), false)
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Cookie parser ─────────────────────────────────────────────────────────
app.use(cookieParser(env.COOKIE_SECRET))

// ── HTTP request logger (dev only) ───────────────────────────────────────
if (env.isDev) {
  app.use(morgan('dev'))
}

// ── Static file serving — uploaded prescription images ───────────────────
// Files are stored at  <project-root>/uploads/
// Served at            GET /uploads/<filename>
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    // Prevent directory listing
    index: false,
    // Cache uploaded files for 1 day in production
    maxAge: env.isProd ? '1d' : 0,
  })
)

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'N A Pharma API',
    version: '1.0.0',
    env:     env.NODE_ENV,
    time:    new Date().toISOString(),
  })
})

// ── API test route ────────────────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'N A Pharma API running',
  })
})

// ── API routes ────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/medicines',     medicineRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/payments',      paymentRoutes)
app.use('/api/orders',        orderRoutes)

// ── 404 — must come after all routes ─────────────────────────────────────
app.use(notFound)

// ── Global error handler — must be last ──────────────────────────────────
app.use(errorHandler)

export default app
