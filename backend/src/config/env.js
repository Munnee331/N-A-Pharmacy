/**
 * Centralised environment variable access.
 * Import from here — never use process.env directly in business logic.
 */
export const env = {
  NODE_ENV:      process.env.NODE_ENV      || 'development',
  PORT:          Number(process.env.PORT)  || 5000,
  MONGODB_URI:   process.env.MONGODB_URI,
  JWT_SECRET:    process.env.JWT_SECRET,
  JWT_EXPIRES:   process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  // ── SSLCommerz Payment Gateway ────────────────────────────────────────
  SSLCOMMERZ_STORE_ID:       process.env.SSLCOMMERZ_STORE_ID       || '',
  SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
  SSLCOMMERZ_IS_LIVE:        process.env.SSLCOMMERZ_IS_LIVE === 'true',
  FRONTEND_URL:              process.env.FRONTEND_URL || 'http://localhost:5173',
  // ── Email (Nodemailer) ─────────────────────────────────────────────────
  SMTP_HOST:    process.env.SMTP_HOST    || '',
  SMTP_PORT:    process.env.SMTP_PORT    || '587',
  SMTP_SECURE:  process.env.SMTP_SECURE  || 'false',
  SMTP_USER:    process.env.SMTP_USER    || '',
  SMTP_PASS:    process.env.SMTP_PASS    || '',
  EMAIL_FROM:   process.env.EMAIL_FROM   || '"N A Pharma" <noreply@napharma.com>',
  isDev:  process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
}

/**
 * Validate required env vars at startup.
 * Exits the process if any are missing so the server never starts broken.
 */
export function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'COOKIE_SECRET']
  const missing  = required.filter((k) => !process.env[k])

  if (missing.length > 0) {
    console.error(`\x1b[31m✖  Missing required env vars: ${missing.join(', ')}\x1b[0m`)
    process.exit(1)
  }
}
