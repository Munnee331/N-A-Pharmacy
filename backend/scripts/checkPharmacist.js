import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import User from '../src/models/User.js'

// Load backend/.env explicitly (script may be run from repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set in environment')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('Connected to MongoDB')

    const user = await User.findOne({ email: 'pharmacist@napharma.com' }).lean()
    if (!user) {
      console.log('Pharmacist not found')
    } else {
      console.log('Pharmacist found:')
      console.log(JSON.stringify({ _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }, null, 2))
    }
  } catch (err) {
    console.error('Error querying MongoDB:', err.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

run()
