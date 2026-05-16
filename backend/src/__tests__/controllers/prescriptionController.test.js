/**
 * Integration tests for Prescription API routes.
 *
 * Uses mongodb-memory-server + a real Express app instance.
 * No network calls — everything runs in-process.
 *
 * Test coverage:
 *  POST   /api/prescriptions
 *  GET    /api/prescriptions/my
 *  GET    /api/prescriptions/pending
 *  GET    /api/prescriptions/:id
 *  PATCH  /api/prescriptions/:id/start-review
 *  PATCH  /api/prescriptions/:id/approve
 *  PATCH  /api/prescriptions/:id/reject
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose              from 'mongoose'
import request               from 'supertest'
import jwt                   from 'jsonwebtoken'
import fs                    from 'fs'
import path                  from 'path'
import {
  describe, it, expect,
  beforeAll, afterAll, beforeEach, afterEach,
} from 'vitest'

import app          from '../../app.js'
import Prescription from '../../models/Prescription.js'
import User         from '../../models/User.js'
import Medicine     from '../../models/Medicine.js'
import { UPLOAD_DIR } from '../../middleware/upload.js'

// ── DB lifecycle ──────────────────────────────────────────────────────────

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

beforeEach(async () => {
  await Promise.all([
    Prescription.deleteMany({}),
    User.deleteMany({}),
    Medicine.deleteMany({}),
  ])
})

afterEach(() => {
  const files = fs.readdirSync(UPLOAD_DIR).filter((f) => f !== '.gitkeep')
  files.forEach((f) => {
    try { fs.unlinkSync(path.join(UPLOAD_DIR, f)) } catch { /* ignore */ }
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'na_pharma_dev_jwt_secret_change_in_production'

/** Create a user in the DB and return a signed JWT for them */
async function createUserWithToken(role = 'customer') {
  const user = await User.create({
    name:     `Test ${role}`,
    email:    `${role}-${Date.now()}@test.com`,
    password: 'Password123!',
    role,
  })
  const token = jwt.sign({ userId: user._id.toString(), role }, JWT_SECRET, { expiresIn: '1h' })
  return { user, token }
}

/** Create a medicine in the DB */
async function createMedicine (overrides = {}) {
  return Medicine.create({
    name:     `Medicine-${Date.now()}`,
    category: 'antibiotic',
    price:    50,
    ...overrides,
  })
}

/** Create a prescription in the DB */
async function createPrescription (customerId, overrides = {}) {
  return Prescription.create({
    customer:         customerId,
    imageUrl:         '/uploads/rx-test.jpg',
    originalFileName: 'rx.jpg',
    ...overrides,
  })
}

/** Auth header helper */
const auth = (token) => ({ Authorization: `Bearer ${token}` })

/** Minimal JPEG buffer for multipart uploads */
const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])

/** Helper: POST a prescription with a fake JPEG file */
function postPrescription (token, notes = '') {
  const req = request(app)
    .post('/api/prescriptions')
    .set(auth(token))
    .attach('prescription', fakeJpeg, { filename: 'rx.jpg', contentType: 'image/jpeg' })
  if (notes) req.field('notes', notes)
  return req
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/prescriptions
// ─────────────────────────────────────────────────────────────────────────

describe('POST /api/prescriptions', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/prescriptions')
      .attach('prescription', fakeJpeg, { filename: 'rx.jpg', contentType: 'image/jpeg' })

    expect(res.status).toBe(401)
  })

  it('creates a prescription and returns 201', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await postPrescription(token, 'Urgent')

    expect(res.status).toBe(201)
    expect(res.body.data.prescription.status).toBe('pending')
    expect(res.body.data.prescription.notes).toBe('Urgent')
    expect(res.body.data.imageUrl).toMatch(/^\/uploads\/prescriptions\//)
  })

  it('returns 400 when no file is attached', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(token))
      .field('notes', 'No file')

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/prescription file is required/i)
  })

  it('sets customer to the authenticated user', async () => {
    const { user, token } = await createUserWithToken('customer')

    const res = await postPrescription(token)

    expect(res.status).toBe(201)
    expect(res.body.data.prescription.customer.toString()).toBe(user._id.toString())
  })

  it('pharmacist can also upload a prescription', async () => {
    const { token } = await createUserWithToken('pharmacist')

    const res = await postPrescription(token)

    expect(res.status).toBe(201)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/my
// ─────────────────────────────────────────────────────────────────────────

describe('GET /api/prescriptions/my', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/prescriptions/my')
    expect(res.status).toBe(401)
  })

  it('returns only the authenticated customer\'s prescriptions', async () => {
    const { user: c1, token: t1 } = await createUserWithToken('customer')
    const { user: c2 }            = await createUserWithToken('customer')

    await createPrescription(c1._id)
    await createPrescription(c1._id)
    await createPrescription(c2._id)   // belongs to another customer

    const res = await request(app)
      .get('/api/prescriptions/my')
      .set(auth(t1))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(2)
    expect(res.body.data.pagination.total).toBe(2)
  })

  it('returns empty array when customer has no prescriptions', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .get('/api/prescriptions/my')
      .set(auth(token))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(0)
  })

  it('filters by status when status query param is provided', async () => {
    const { user, token } = await createUserWithToken('customer')

    await createPrescription(user._id, { status: 'pending' })
    await createPrescription(user._id, {
      status:          'rejected',
      rejectionReason: 'Bad image',
    })

    const res = await request(app)
      .get('/api/prescriptions/my?status=pending')
      .set(auth(token))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(1)
    expect(res.body.data.prescriptions[0].status).toBe('pending')
  })

  it('returns 400 for an invalid status filter', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .get('/api/prescriptions/my?status=processing')
      .set(auth(token))

    expect(res.status).toBe(400)
  })

  it('paginates results correctly', async () => {
    const { user, token } = await createUserWithToken('customer')

    // Create 5 prescriptions
    for (let i = 0; i < 5; i++) {
      await createPrescription(user._id)
    }

    const res = await request(app)
      .get('/api/prescriptions/my?page=1&limit=3')
      .set(auth(token))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(3)
    expect(res.body.data.pagination.total).toBe(5)
    expect(res.body.data.pagination.totalPages).toBe(2)
    expect(res.body.data.pagination.hasNext).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/pending
// ─────────────────────────────────────────────────────────────────────────

describe('GET /api/prescriptions/pending', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/prescriptions/pending')
    expect(res.status).toBe(401)
  })

  it('returns 403 when called by a customer', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .get('/api/prescriptions/pending')
      .set(auth(token))

    expect(res.status).toBe(403)
  })

  it('returns pending and under_review prescriptions for pharmacist', async () => {
    const { user: customer }      = await createUserWithToken('customer')
    const { token: pharmToken }   = await createUserWithToken('pharmacist')

    await createPrescription(customer._id, { status: 'pending' })
    await createPrescription(customer._id, { status: 'under_review' })
    await createPrescription(customer._id, {
      status:          'rejected',
      rejectionReason: 'Bad image',
    })

    const res = await request(app)
      .get('/api/prescriptions/pending')
      .set(auth(pharmToken))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(2)
    res.body.data.prescriptions.forEach((p) => {
      expect(['pending', 'under_review']).toContain(p.status)
    })
  })

  it('returns all prescriptions for admin', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: adminToken } = await createUserWithToken('admin')

    await createPrescription(customer._id, { status: 'pending' })
    await createPrescription(customer._id, { status: 'under_review' })

    const res = await request(app)
      .get('/api/prescriptions/pending')
      .set(auth(adminToken))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(2)
  })

  it('filters by specific status when status query param is provided', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: adminToken } = await createUserWithToken('admin')

    await createPrescription(customer._id, { status: 'pending' })
    await createPrescription(customer._id, { status: 'under_review' })

    const res = await request(app)
      .get('/api/prescriptions/pending?status=pending')
      .set(auth(adminToken))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions).toHaveLength(1)
    expect(res.body.data.prescriptions[0].status).toBe('pending')
  })

  it('returns 400 for an invalid status filter', async () => {
    const { token } = await createUserWithToken('pharmacist')

    const res = await request(app)
      .get('/api/prescriptions/pending?status=invalid')
      .set(auth(token))

    expect(res.status).toBe(400)
  })

  it('returns results in FIFO order (oldest first)', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: adminToken } = await createUserWithToken('admin')

    const first  = await createPrescription(customer._id)
    await new Promise((r) => setTimeout(r, 5))
    const second = await createPrescription(customer._id)

    const res = await request(app)
      .get('/api/prescriptions/pending')
      .set(auth(adminToken))

    expect(res.status).toBe(200)
    expect(res.body.data.prescriptions[0]._id).toBe(first._id.toString())
    expect(res.body.data.prescriptions[1]._id).toBe(second._id.toString())
  })
})

// ─────────────────────────────────────────────────────────────────────────
// GET /api/prescriptions/:id
// ─────────────────────────────────────────────────────────────────────────

describe('GET /api/prescriptions/:id', () => {
  it('returns 401 when not authenticated', async () => {
    const { user } = await createUserWithToken('customer')
    const rx       = await createPrescription(user._id)

    const res = await request(app).get(`/api/prescriptions/${rx._id}`)
    expect(res.status).toBe(401)
  })

  it('returns 400 for an invalid ObjectId', async () => {
    const { token } = await createUserWithToken('customer')

    const res = await request(app)
      .get('/api/prescriptions/not-an-id')
      .set(auth(token))

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid prescription id/i)
  })

  it('returns 404 when prescription does not exist', async () => {
    const { token } = await createUserWithToken('customer')
    const fakeId    = new mongoose.Types.ObjectId()

    const res = await request(app)
      .get(`/api/prescriptions/${fakeId}`)
      .set(auth(token))

    expect(res.status).toBe(404)
  })

  it('allows customer to view their own prescription', async () => {
    const { user, token } = await createUserWithToken('customer')
    const rx              = await createPrescription(user._id)

    const res = await request(app)
      .get(`/api/prescriptions/${rx._id}`)
      .set(auth(token))

    expect(res.status).toBe(200)
    expect(res.body.data.prescription._id).toBe(rx._id.toString())
  })

  it('returns 403 when customer tries to view another customer\'s prescription', async () => {
    const { user: owner }         = await createUserWithToken('customer')
    const { token: otherToken }   = await createUserWithToken('customer')
    const rx                      = await createPrescription(owner._id)

    const res = await request(app)
      .get(`/api/prescriptions/${rx._id}`)
      .set(auth(otherToken))

    expect(res.status).toBe(403)
  })

  it('allows pharmacist to view any prescription', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .get(`/api/prescriptions/${rx._id}`)
      .set(auth(pharmToken))

    expect(res.status).toBe(200)
  })

  it('allows admin to view any prescription', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: adminToken } = await createUserWithToken('admin')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .get(`/api/prescriptions/${rx._id}`)
      .set(auth(adminToken))

    expect(res.status).toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/:id/start-review
// ─────────────────────────────────────────────────────────────────────────

describe('PATCH /api/prescriptions/:id/start-review', () => {
  it('returns 403 when called by a customer', async () => {
    const { user, token } = await createUserWithToken('customer')
    const rx              = await createPrescription(user._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/start-review`)
      .set(auth(token))

    expect(res.status).toBe(403)
  })

  it('moves prescription to under_review and assigns pharmacist', async () => {
    const { user: customer }      = await createUserWithToken('customer')
    const { user: pharm, token }  = await createUserWithToken('pharmacist')
    const rx                      = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/start-review`)
      .set(auth(token))

    expect(res.status).toBe(200)
    expect(res.body.data.prescription.status).toBe('under_review')
    expect(res.body.data.prescription.pharmacist._id).toBe(pharm._id.toString())
  })

  it('returns 409 when prescription is not pending', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id, { status: 'under_review' })

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/start-review`)
      .set(auth(pharmToken))

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already "under_review"/i)
  })

  it('returns 404 for a non-existent prescription', async () => {
    const { token } = await createUserWithToken('pharmacist')
    const fakeId    = new mongoose.Types.ObjectId()

    const res = await request(app)
      .patch(`/api/prescriptions/${fakeId}/start-review`)
      .set(auth(token))

    expect(res.status).toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/:id/approve
// ─────────────────────────────────────────────────────────────────────────

describe('PATCH /api/prescriptions/:id/approve', () => {
  it('returns 403 when called by a customer', async () => {
    const { user, token } = await createUserWithToken('customer')
    const rx              = await createPrescription(user._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(token))
      .send({ recommendedMedicines: [] })

    expect(res.status).toBe(403)
  })

  it('approves a prescription with valid recommendedMedicines', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const medicine              = await createMedicine()
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(pharmToken))
      .send({
        recommendedMedicines: [
          {
            medicine:           medicine._id.toString(),
            quantity:           2,
            dosageInstructions: 'Twice daily',
          },
        ],
      })

    expect(res.status).toBe(200)
    expect(res.body.data.prescription.status).toBe('approved')
    expect(res.body.data.prescription.recommendedMedicines).toHaveLength(1)
    expect(res.body.data.prescription.recommendedMedicines[0].quantity).toBe(2)
  })

  it('returns 400 when recommendedMedicines is empty', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(pharmToken))
      .send({ recommendedMedicines: [] })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/at least one/i)
  })

  it('returns 400 when recommendedMedicines is missing', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(pharmToken))
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid medicine ID in recommendedMedicines', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(pharmToken))
      .send({
        recommendedMedicines: [{ medicine: 'not-an-id', quantity: 1 }],
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/valid Medicine ID/i)
  })

  it('returns 400 for quantity out of range', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const medicine              = await createMedicine()
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(pharmToken))
      .send({
        recommendedMedicines: [{ medicine: medicine._id.toString(), quantity: 0 }],
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/between 1 and 999/i)
  })

  it('returns 409 when prescription is already approved', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const medicine              = await createMedicine()
    const rx                    = await createPrescription(customer._id, {
      status:               'approved',
      recommendedMedicines: [{ medicine: medicine._id, quantity: 1 }],
    })

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(pharmToken))
      .send({
        recommendedMedicines: [{ medicine: medicine._id.toString(), quantity: 1 }],
      })

    expect(res.status).toBe(409)
  })

  it('admin can also approve a prescription', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: adminToken } = await createUserWithToken('admin')
    const medicine              = await createMedicine()
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/approve`)
      .set(auth(adminToken))
      .send({
        recommendedMedicines: [{ medicine: medicine._id.toString(), quantity: 1 }],
      })

    expect(res.status).toBe(200)
    expect(res.body.data.prescription.status).toBe('approved')
  })
})

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/prescriptions/:id/reject
// ─────────────────────────────────────────────────────────────────────────

describe('PATCH /api/prescriptions/:id/reject', () => {
  it('returns 403 when called by a customer', async () => {
    const { user, token } = await createUserWithToken('customer')
    const rx              = await createPrescription(user._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(token))
      .send({ rejectionReason: 'Bad image' })

    expect(res.status).toBe(403)
  })

  it('rejects a prescription with a reason', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(pharmToken))
      .send({ rejectionReason: 'Prescription is expired' })

    expect(res.status).toBe(200)
    expect(res.body.data.prescription.status).toBe('rejected')
    expect(res.body.data.prescription.rejectionReason).toBe('Prescription is expired')
  })

  it('returns 400 when rejectionReason is missing', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(pharmToken))
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/rejectionReason is required/i)
  })

  it('returns 400 when rejectionReason is empty string', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(pharmToken))
      .send({ rejectionReason: '   ' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when rejectionReason exceeds 500 characters', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id)

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(pharmToken))
      .send({ rejectionReason: 'x'.repeat(501) })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/500/i)
  })

  it('returns 409 when prescription is already rejected', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const rx                    = await createPrescription(customer._id, {
      status:          'rejected',
      rejectionReason: 'Already rejected',
    })

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(pharmToken))
      .send({ rejectionReason: 'Trying again' })

    expect(res.status).toBe(409)
  })

  it('clears recommendedMedicines when rejecting an under_review prescription', async () => {
    const { user: customer }    = await createUserWithToken('customer')
    const { token: pharmToken } = await createUserWithToken('pharmacist')
    const medicine              = await createMedicine()

    // Create as under_review with a pharmacist assigned
    const rx = await createPrescription(customer._id, {
      status:               'under_review',
      recommendedMedicines: [{ medicine: medicine._id, quantity: 1 }],
    })

    const res = await request(app)
      .patch(`/api/prescriptions/${rx._id}/reject`)
      .set(auth(pharmToken))
      .send({ rejectionReason: 'Changed decision' })

    expect(res.status).toBe(200)
    expect(res.body.data.prescription.recommendedMedicines).toHaveLength(0)
  })
})
