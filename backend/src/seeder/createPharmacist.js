/**
 * Pharmacist seeder — run once to bootstrap the first pharmacist account.
 *
 * Usage:
 *   npm run seed:pharmacist
 *
 * Safe to re-run: exits early if a pharmacist with this email already exists.
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

// ── Pharmacist credentials ────────────────────────────────────────────────
const PHARMACIST = {
  name:     'Pharmacist',
  email:    'pharmacist@napharma.com',
  password: 'Pharma123!',
  role:     'pharmacist',
}

async function seed () {
  console.log(`\n${CYAN}━━━  N A Pharma — Pharmacist Seeder  ━━━${RESET}\n`)

  await connectDB()

  try {
    // ── Check if pharmacist already exists ─────────────────────────────────
    const existing = await User.findOne({ email: PHARMACIST.email })

    if (existing) {
      console.log(
        `${YELLOW}⚠  Pharmacist already exists:${RESET} ${existing.email} (role: ${existing.role})`
      )
      console.log(`${YELLOW}   No changes made.${RESET}\n`)
      return
    }

    // ── Create pharmacist (password hashed by User pre-save hook) ──────────
    const pharmacist = await User.create(PHARMACIST)

    console.log(`${GREEN}✔  Pharmacist created successfully${RESET}`)
    console.log(`   Name  : ${pharmacist.name}`)
    console.log(`   Email : ${pharmacist.email}`)
    console.log(`   Role  : ${pharmacist.role}`)
    console.log(`   ID    : ${pharmacist._id}\n`)

  } catch (err) {
    console.error(`${RED}✖  Seeder failed:${RESET}`, err.message)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

seed()
