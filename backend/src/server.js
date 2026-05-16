// Load .env FIRST — before any other imports read process.env
import 'dotenv/config'

import { validateEnv, env } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'
import app from './app.js'

// ── ANSI colour helpers ───────────────────────────────────────────────────
const CYAN   = '\x1b[36m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BOLD   = '\x1b[1m'
const RESET  = '\x1b[0m'

// ── Validate env vars before anything else ────────────────────────────────
validateEnv()

// ── Async startup ─────────────────────────────────────────────────────────
async function startServer() {
  // 1. Connect to MongoDB
  await connectDB()

  // 2. Start HTTP server
  const server = app.listen(env.PORT, () => {
    console.log('')
    console.log(`${BOLD}${CYAN}  ╔══════════════════════════════════════╗${RESET}`)
    console.log(`${BOLD}${CYAN}  ║      N A Pharma API Server           ║${RESET}`)
    console.log(`${BOLD}${CYAN}  ╚══════════════════════════════════════╝${RESET}`)
    console.log(`${GREEN}  ✔  Server   ${RESET}→  ${YELLOW}http://localhost:${env.PORT}${RESET}`)
    console.log(`${GREEN}  ✔  API      ${RESET}→  ${YELLOW}http://localhost:${env.PORT}/api/test${RESET}`)
    console.log(`${GREEN}  ✔  Health   ${RESET}→  ${YELLOW}http://localhost:${env.PORT}/health${RESET}`)
    console.log(`${GREEN}  ✔  Env      ${RESET}→  ${YELLOW}${env.NODE_ENV}${RESET}`)
    console.log('')
  })

  // ── Graceful shutdown ─────────────────────────────────────────────────
  async function shutdown(signal) {
    console.log(`\n${YELLOW}⚠  ${signal} received — shutting down gracefully…${RESET}`)
    server.close(async () => {
      await disconnectDB()
      console.log(`${GREEN}✔  Server closed cleanly${RESET}`)
      process.exit(0)
    })
  }

  process.on('SIGINT',  () => shutdown('SIGINT'))   // Ctrl+C
  process.on('SIGTERM', () => shutdown('SIGTERM'))  // kill / Docker stop

  // ── Safety nets ───────────────────────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    console.error(`${RED}✖  Unhandled Rejection:${RESET}`, reason)
    server.close(() => process.exit(1))
  })

  process.on('uncaughtException', (err) => {
    console.error(`${RED}✖  Uncaught Exception:${RESET}`, err.message)
    process.exit(1)
  })
}

startServer()
