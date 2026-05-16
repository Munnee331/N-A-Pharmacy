/**
 * Unit + integration tests for the Multer upload middleware.
 *
 * Tests:
 *  - ALLOWED_MIMES / ALLOWED_EXTS constants
 *  - MAX_FILE_SIZE constant
 *  - UPLOAD_DIR constant
 *  - File filter: accepts valid types, rejects invalid types
 *  - File size limit enforcement
 *  - Unique filename generation (no collisions)
 *  - handleUploadError: normalises MulterError codes to ApiError
 *  - Integration: POST /api/prescriptions with real multipart upload
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose              from 'mongoose'
import request               from 'supertest'
import jwt                   from 'jsonwebtoken'
import path                  from 'path'
import fs                    from 'fs'
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

import app from '../../app.js'
import User from '../../models/User.js'
import Prescription from '../../models/Prescription.js'
import {
  ALLOWED_MIMES,
  ALLOWED_EXTS,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
} from '../../middleware/upload.js'

// ── DB lifecycle ──────────────────────────────────────────────────────────

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  // Ensure upload directory exists for tests
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Prescription.deleteMany({})])
})

// Clean up any files written during tests
afterEach(() => {
  const files = fs.readdirSync(UPLOAD_DIR).filter((f) => f !== '.gitkeep')
  files.forEach((f) => {
    try { fs.unlinkSync(path.join(UPLOAD_DIR, f)) } catch { /* ignore */ }
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'na_pharma_dev_jwt_secret_change_in_production'

async function createUserWithToken (role = 'customer') {
  const user = await User.create({
    name:     `Test ${role}`,
    email:    `${role}-${Date.now()}@test.com`,
    password: 'Password123!',
    role,
  })
  const token = jwt.sign({ userId: user._id.toString(), role }, JWT_SECRET, { expiresIn: '1h' })
  return { user, token }
}

const auth = (token) => ({ Authorization: `Bearer ${token}` })

/** Create a minimal in-memory Buffer for a given MIME type */
function fakeFile (mimeType) {
  // Minimal valid file bytes per type
  const buffers = {
    'image/jpeg':    Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
    'image/png':     Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'image/webp':    Buffer.from('RIFF....WEBPVP8 ', 'ascii'),
    'application/pdf': Buffer.from('%PDF-1.4\n', 'ascii'),
  }
  return buffers[mimeType] ?? Buffer.from('fake content')
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Constants
// ─────────────────────────────────────────────────────────────────────────

describe('Upload middleware constants', () => {
  it('ALLOWED_MIMES contains exactly the four accepted types', () => {
    expect(ALLOWED_MIMES.has('image/jpeg')).toBe(true)
    expect(ALLOWED_MIMES.has('image/png')).toBe(true)
    expect(ALLOWED_MIMES.has('image/webp')).toBe(true)
    expect(ALLOWED_MIMES.has('application/pdf')).toBe(true)
    expect(ALLOWED_MIMES.size).toBe(4)
  })

  it('ALLOWED_EXTS contains the expected extensions', () => {
    expect(ALLOWED_EXTS.has('.jpg')).toBe(true)
    expect(ALLOWED_EXTS.has('.jpeg')).toBe(true)
    expect(ALLOWED_EXTS.has('.png')).toBe(true)
    expect(ALLOWED_EXTS.has('.webp')).toBe(true)
    expect(ALLOWED_EXTS.has('.pdf')).toBe(true)
  })

  it('MAX_FILE_SIZE is exactly 10 MB', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })

  it('UPLOAD_DIR is uploads/prescriptions', () => {
    expect(UPLOAD_DIR).toBe('uploads/prescriptions')
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. POST /api/prescriptions — file upload integration
// ─────────────────────────────────────────────────────────────────────────

describe('POST /api/prescriptions — file upload', () => {
  it('returns 400 when no file is attached', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .field('notes', 'test')   // send form data but no file

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/prescription file is required/i)
  })

  it('accepts a JPEG file and returns 201 with imageUrl', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('image/jpeg'), {
        filename:    'rx.jpg',
        contentType: 'image/jpeg',
      })
      .field('notes', 'Urgent')

    expect(res.status).toBe(201)
    expect(res.body.data.imageUrl).toMatch(/^\/uploads\/prescriptions\//)
    expect(res.body.data.prescription.originalFileName).toBe('rx.jpg')
    expect(res.body.data.prescription.notes).toBe('Urgent')
    expect(res.body.data.prescription.status).toBe('pending')
  })

  it('accepts a PNG file', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('image/png'), {
        filename:    'rx.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.imageUrl).toMatch(/\.png$/)
  })

  it('accepts a WEBP file', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('image/webp'), {
        filename:    'rx.webp',
        contentType: 'image/webp',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.imageUrl).toMatch(/\.webp$/)
  })

  it('accepts a PDF file', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('application/pdf'), {
        filename:    'rx.pdf',
        contentType: 'application/pdf',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.imageUrl).toMatch(/\.pdf$/)
  })

  it('rejects a GIF file with 415', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', Buffer.from('GIF89a'), {
        filename:    'rx.gif',
        contentType: 'image/gif',
      })

    expect(res.status).toBe(415)
    expect(res.body.message).toMatch(/unsupported file type/i)
  })

  it('rejects a .txt file with 415', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', Buffer.from('plain text'), {
        filename:    'rx.txt',
        contentType: 'text/plain',
      })

    expect(res.status).toBe(415)
  })

  it('rejects a file with mismatched extension (.jpg but text/plain MIME)', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', Buffer.from('not an image'), {
        filename:    'rx.jpg',
        contentType: 'text/plain',   // MIME doesn't match extension
      })

    expect(res.status).toBe(415)
  })

  it('rejects a file exceeding 10 MB with 413', async () => {
    const { token } = await createUserWithToken('customer')

    // Create a buffer just over 10 MB
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 0xff)

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', oversized, {
        filename:    'big.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(413)
    expect(res.body.message).toMatch(/too large/i)
  })

  it('returns 400 when wrong field name is used', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('file', fakeFile('image/jpeg'), {   // wrong field name
        filename:    'rx.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/unexpected field/i)
  })

  it('saves the file to disk in uploads/prescriptions/', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('image/jpeg'), {
        filename:    'rx.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(201)

    // Extract filename from imageUrl and verify it exists on disk
    const filename = path.basename(res.body.data.imageUrl)
    const filePath = path.join(UPLOAD_DIR, filename)
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('generates unique filenames for concurrent uploads', async () => {
    const { token } = await createUserWithToken('customer')

    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/prescriptions')
        .set(auth(token))
        .attach('prescription', fakeFile('image/jpeg'), {
          filename: 'rx.jpg', contentType: 'image/jpeg',
        }),
      request(app)
        .post('/api/prescriptions')
        .set(auth(token))
        .attach('prescription', fakeFile('image/jpeg'), {
          filename: 'rx.jpg', contentType: 'image/jpeg',
        }),
    ])

    expect(res1.status).toBe(201)
    expect(res2.status).toBe(201)
    expect(res1.body.data.imageUrl).not.toBe(res2.body.data.imageUrl)
  })

  it('stores originalFileName from the uploaded file', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('image/jpeg'), {
        filename:    'my-prescription-2026.jpg',
        contentType: 'image/jpeg',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.prescription.originalFileName).toBe('my-prescription-2026.jpg')
  })

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/prescriptions')
      .attach('prescription', fakeFile('image/jpeg'), {
        filename: 'rx.jpg', contentType: 'image/jpeg',
      })

    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. Static file serving — GET /uploads/prescriptions/:filename
// ─────────────────────────────────────────────────────────────────────────

describe('GET /uploads/prescriptions/:filename — static serving', () => {
  it('serves an uploaded file at its imageUrl path', async () => {
    const { token } = await createUserWithToken('customer')

    // Upload a file first
    const uploadRes = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .attach('prescription', fakeFile('image/jpeg'), {
        filename: 'rx.jpg', contentType: 'image/jpeg',
      })

    expect(uploadRes.status).toBe(201)

    const imageUrl = uploadRes.body.data.imageUrl   // e.g. /uploads/prescriptions/1234-abc.jpg

    // Fetch the file via the static route
    const fileRes = await request(app).get(imageUrl)

    expect(fileRes.status).toBe(200)
  })

  it('returns 404 for a non-existent file', async () => {
    const res = await request(app).get('/uploads/prescriptions/does-not-exist.jpg')
    expect(res.status).toBe(404)
  })
})
