/**
 * Admin seeder — run once to bootstrap the first admin account.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Safe to re-run: exits early if an admin already exists.
 */

import 'dotenv/config'
import { connectDB, disconnectDB } from '../config/db.js'
import User from '../models/User.js'

// ── ANSI colours ──────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const RESET  = '\x1b[0m'

// ── Admin credentials ─────────────────────────────────────────────────────
const ADMIN = {
  name:     'Admin',
  email:    'admin@napharma.com',
  password: 'Admin123!',
  role:     'admin',
}

async function seed () {
  console.log(`\n${CYAN}━━━  N A Pharma — Admin Seeder  ━━━${RESET}\n`)

  await connectDB()

  try {
    // ── Check if admin already exists ──────────────────────────────────────
    const existing = await User.findOne({ email: ADMIN.email })

    if (existing) {
      console.log(
        `${YELLOW}⚠  Admin already exists:${RESET} ${existing.email} (role: ${existing.role})`
      )
      console.log(`${YELLOW}   No changes made.${RESET}\n`)
      return
    }

    // ── Create admin (password hashed by User pre-save hook) ───────────────
    const admin = await User.create(ADMIN)

    console.log(`${GREEN}✔  Admin created successfully${RESET}`)
    console.log(`   Name  : ${admin.name}`)
    console.log(`   Email : ${admin.email}`)
    console.log(`   Role  : ${admin.role}`)
    console.log(`   ID    : ${admin._id}\n`)

  } catch (err) {
    console.error(`${RED}✖  Seeder failed:${RESET}`, err.message)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

seed()
