import mongoose from 'mongoose'

const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET  = '\x1b[0m'

/**
 * Connect to MongoDB.
 * Exits the process on failure — server must not start without a DB connection.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error(`${RED}✖  MONGODB_URI is not defined in .env${RESET}`)
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(
      `${GREEN}✔  MongoDB connected${RESET}  →  ${YELLOW}${conn.connection.host}${RESET}`
    )
  } catch (err) {
    console.error(`${RED}✖  MongoDB connection failed:${RESET}`, err.message)
    process.exit(1)
  }
}

/**
 * Gracefully close the MongoDB connection.
 * Called during SIGINT / SIGTERM shutdown.
 */
export async function disconnectDB() {
  await mongoose.connection.close()
  console.log(`${YELLOW}⚠  MongoDB connection closed${RESET}`)
}
