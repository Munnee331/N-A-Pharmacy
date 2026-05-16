/**
 * Unit tests for the Prescription Mongoose model.
 *
 * Uses mongodb-memory-server to spin up an in-process MongoDB instance —
 * no real database connection required.
 *
 * Test coverage:
 *  - Schema field validation (required, enum, min/max, custom validators)
 *  - Default values
 *  - Compound indexes
 *  - Pre-save hook business rules
 *  - Virtual properties (isPending, isResolved)
 *  - recommendedMedicines sub-document validation
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose              from 'mongoose'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import Prescription from '../../models/Prescription.js'

// ── Test helpers ──────────────────────────────────────────────────────────

/** Generate a fresh ObjectId for use as a reference */
const id = () => new mongoose.Types.ObjectId()

/** Minimal valid prescription payload */
function validPayload (overrides = {}) {
  return {
    customer:         id(),
    imageUrl:         '/uploads/rx-test.jpg',
    originalFileName: 'prescription.jpg',
    ...overrides,
  }
}

// ── DB lifecycle ──────────────────────────────────────────────────────────

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await Prescription.deleteMany({})
})

// ─────────────────────────────────────────────────────────────────────────
// 1. Required fields
// ─────────────────────────────────────────────────────────────────────────

describe('Required field validation', () => {
  it('saves successfully with all required fields', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc._id).toBeDefined()
    expect(doc.customer).toBeDefined()
    expect(doc.imageUrl).toBe('/uploads/rx-test.jpg')
  })

  it('rejects when customer is missing', async () => {
    const payload = validPayload()
    delete payload.customer
    await expect(Prescription.create(payload)).rejects.toThrow(/customer.*required/i)
  })

  it('rejects when imageUrl is missing', async () => {
    const payload = validPayload()
    delete payload.imageUrl
    await expect(Prescription.create(payload)).rejects.toThrow(/imageUrl.*required/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. Default values
// ─────────────────────────────────────────────────────────────────────────

describe('Default values', () => {
  it('defaults status to "pending"', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.status).toBe('pending')
  })

  it('defaults pharmacist to null', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.pharmacist).toBeNull()
  })

  it('defaults notes to empty string', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.notes).toBe('')
  })

  it('defaults rejectionReason to empty string', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.rejectionReason).toBe('')
  })

  it('defaults recommendedMedicines to empty array', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.recommendedMedicines).toEqual([])
  })

  it('defaults originalFileName to empty string', async () => {
    const doc = await Prescription.create(validPayload({ originalFileName: undefined }))
    expect(doc.originalFileName).toBe('')
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. Status enum validation
// ─────────────────────────────────────────────────────────────────────────

describe('Status enum validation', () => {
  const validStatuses = ['pending', 'under_review', 'approved', 'rejected']

  it.each(validStatuses)('accepts status "%s"', async (status) => {
    // approved needs recommendedMedicines; rejected needs rejectionReason
    const extra = {}
    if (status === 'approved') {
      extra.recommendedMedicines = [{ medicine: id(), quantity: 1 }]
    }
    if (status === 'rejected') {
      extra.rejectionReason = 'Invalid prescription'
    }
    const doc = await Prescription.create(validPayload({ status, ...extra }))
    expect(doc.status).toBe(status)
  })

  it('rejects an invalid status value', async () => {
    await expect(
      Prescription.create(validPayload({ status: 'processing' }))
    ).rejects.toThrow(/pending.*under_review.*approved.*rejected/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 4. imageUrl validation
// ─────────────────────────────────────────────────────────────────────────

describe('imageUrl validation', () => {
  it('accepts a full https URL', async () => {
    const doc = await Prescription.create(
      validPayload({ imageUrl: 'https://cdn.example.com/rx/abc.jpg' })
    )
    expect(doc.imageUrl).toContain('https://')
  })

  it('accepts an /uploads/ relative path', async () => {
    const doc = await Prescription.create(
      validPayload({ imageUrl: '/uploads/prescriptions/rx-001.png' })
    )
    expect(doc.imageUrl).toContain('/uploads/')
  })

  it('rejects a plain filename without a valid prefix', async () => {
    await expect(
      Prescription.create(validPayload({ imageUrl: 'rx-001.jpg' }))
    ).rejects.toThrow(/imageUrl must be a valid URL/i)
  })

  it('rejects an ftp:// URL', async () => {
    await expect(
      Prescription.create(validPayload({ imageUrl: 'ftp://files.example.com/rx.jpg' }))
    ).rejects.toThrow(/imageUrl must be a valid URL/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 5. rejectionReason business rule
// ─────────────────────────────────────────────────────────────────────────

describe('rejectionReason validation', () => {
  it('requires rejectionReason when status is "rejected"', async () => {
    await expect(
      Prescription.create(validPayload({ status: 'rejected', rejectionReason: '' }))
    ).rejects.toThrow(/rejection reason is required/i)
  })

  it('saves successfully when status is "rejected" and reason is provided', async () => {
    const doc = await Prescription.create(
      validPayload({ status: 'rejected', rejectionReason: 'Illegible handwriting' })
    )
    expect(doc.status).toBe('rejected')
    expect(doc.rejectionReason).toBe('Illegible handwriting')
  })

  it('does not require rejectionReason for non-rejected statuses', async () => {
    const doc = await Prescription.create(validPayload({ status: 'pending' }))
    expect(doc.rejectionReason).toBe('')
  })

  it('enforces maxlength of 500 on rejectionReason', async () => {
    await expect(
      Prescription.create(
        validPayload({
          status:          'rejected',
          rejectionReason: 'x'.repeat(501),
        })
      )
    ).rejects.toThrow(/500/)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 6. recommendedMedicines sub-document validation
// ─────────────────────────────────────────────────────────────────────────

describe('recommendedMedicines validation', () => {
  it('requires at least one medicine when status is "approved"', async () => {
    await expect(
      Prescription.create(validPayload({ status: 'approved', recommendedMedicines: [] }))
    ).rejects.toThrow(/at least one recommended medicine/i)
  })

  it('saves approved prescription with valid recommendedMedicines', async () => {
    const medicineId = id()
    const doc = await Prescription.create(
      validPayload({
        status: 'approved',
        recommendedMedicines: [
          {
            medicine:           medicineId,
            quantity:           2,
            dosageInstructions: 'Take twice daily after meals',
          },
        ],
      })
    )
    expect(doc.recommendedMedicines).toHaveLength(1)
    expect(doc.recommendedMedicines[0].quantity).toBe(2)
    expect(doc.recommendedMedicines[0].dosageInstructions).toBe('Take twice daily after meals')
  })

  it('rejects quantity less than 1', async () => {
    await expect(
      Prescription.create(
        validPayload({
          status: 'approved',
          recommendedMedicines: [{ medicine: id(), quantity: 0 }],
        })
      )
    ).rejects.toThrow(/at least 1/)
  })

  it('rejects quantity greater than 999', async () => {
    await expect(
      Prescription.create(
        validPayload({
          status: 'approved',
          recommendedMedicines: [{ medicine: id(), quantity: 1000 }],
        })
      )
    ).rejects.toThrow(/999/)
  })

  it('rejects non-integer quantity', async () => {
    await expect(
      Prescription.create(
        validPayload({
          status: 'approved',
          recommendedMedicines: [{ medicine: id(), quantity: 1.5 }],
        })
      )
    ).rejects.toThrow(/whole number/)
  })

  it('requires medicine reference in each sub-document', async () => {
    await expect(
      Prescription.create(
        validPayload({
          status: 'approved',
          recommendedMedicines: [{ quantity: 1 }],
        })
      )
    ).rejects.toThrow(/medicine reference is required/i)
  })

  it('defaults dosageInstructions to empty string', async () => {
    const doc = await Prescription.create(
      validPayload({
        status: 'approved',
        recommendedMedicines: [{ medicine: id(), quantity: 1 }],
      })
    )
    expect(doc.recommendedMedicines[0].dosageInstructions).toBe('')
  })

  it('enforces maxlength of 500 on dosageInstructions', async () => {
    await expect(
      Prescription.create(
        validPayload({
          status: 'approved',
          recommendedMedicines: [
            { medicine: id(), quantity: 1, dosageInstructions: 'x'.repeat(501) },
          ],
        })
      )
    ).rejects.toThrow(/500/)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 7. Pre-save hook business rules
// ─────────────────────────────────────────────────────────────────────────

describe('Pre-save hook', () => {
  it('clears pharmacist, rejectionReason, and recommendedMedicines when reverted to pending', async () => {
    const pharmacistId = id()
    const medicineId   = id()

    // Create as under_review with a pharmacist assigned
    const doc = await Prescription.create(
      validPayload({ status: 'under_review', pharmacist: pharmacistId })
    )

    // Manually add some data then revert to pending
    doc.rejectionReason      = 'test'
    doc.recommendedMedicines = [{ medicine: medicineId, quantity: 1 }]
    doc.status               = 'pending'
    await doc.save()

    expect(doc.pharmacist).toBeNull()
    expect(doc.rejectionReason).toBe('')
    expect(doc.recommendedMedicines).toHaveLength(0)
  })

  it('clears rejectionReason when status changes to approved', async () => {
    const doc = await Prescription.create(
      validPayload({ status: 'rejected', rejectionReason: 'Bad image' })
    )

    doc.status               = 'approved'
    doc.rejectionReason      = 'Bad image'   // still set before save
    doc.recommendedMedicines = [{ medicine: id(), quantity: 1 }]
    await doc.save()

    expect(doc.rejectionReason).toBe('')
  })

  it('clears recommendedMedicines when status changes to rejected', async () => {
    const doc = await Prescription.create(
      validPayload({
        status:               'approved',
        recommendedMedicines: [{ medicine: id(), quantity: 2 }],
      })
    )

    doc.status          = 'rejected'
    doc.rejectionReason = 'Expired prescription'
    await doc.save()

    expect(doc.recommendedMedicines).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 8. Virtual properties
// ─────────────────────────────────────────────────────────────────────────

describe('Virtual properties', () => {
  it('isPending returns true when status is "pending"', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.isPending).toBe(true)
  })

  it('isPending returns false when status is not "pending"', async () => {
    const doc = await Prescription.create(
      validPayload({ status: 'under_review' })
    )
    expect(doc.isPending).toBe(false)
  })

  it('isResolved returns true when status is "approved"', async () => {
    const doc = await Prescription.create(
      validPayload({
        status:               'approved',
        recommendedMedicines: [{ medicine: id(), quantity: 1 }],
      })
    )
    expect(doc.isResolved).toBe(true)
  })

  it('isResolved returns true when status is "rejected"', async () => {
    const doc = await Prescription.create(
      validPayload({ status: 'rejected', rejectionReason: 'Illegible' })
    )
    expect(doc.isResolved).toBe(true)
  })

  it('isResolved returns false when status is "pending"', async () => {
    const doc = await Prescription.create(validPayload())
    expect(doc.isResolved).toBe(false)
  })

  it('isResolved returns false when status is "under_review"', async () => {
    const doc = await Prescription.create(
      validPayload({ status: 'under_review' })
    )
    expect(doc.isResolved).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 9. Timestamps
// ─────────────────────────────────────────────────────────────────────────

describe('Timestamps', () => {
  it('sets createdAt on creation', async () => {
    const before = new Date()
    const doc    = await Prescription.create(validPayload())
    const after  = new Date()
    expect(doc.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(doc.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('updates updatedAt on modification', async () => {
    const doc = await Prescription.create(validPayload())
    const originalUpdatedAt = doc.updatedAt

    // Small delay to ensure updatedAt changes
    await new Promise((r) => setTimeout(r, 10))

    doc.notes = 'Updated note'
    await doc.save()

    expect(doc.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 10. Indexes
// ─────────────────────────────────────────────────────────────────────────

describe('Indexes', () => {
  it('has the expected compound indexes defined on the schema', () => {
    const indexes = Prescription.schema.indexes()

    // Extract index key objects for comparison
    const indexKeys = indexes.map(([key]) => JSON.stringify(key))

    expect(indexKeys).toContain(JSON.stringify({ customer: 1, createdAt: -1 }))
    expect(indexKeys).toContain(JSON.stringify({ pharmacist: 1, status: 1 }))
    expect(indexKeys).toContain(JSON.stringify({ status: 1, createdAt: 1 }))
  })

  it('has single-field indexes on customer, pharmacist, and status', () => {
    const paths = Prescription.schema.paths

    expect(paths.customer.options.index).toBe(true)
    expect(paths.pharmacist.options.index).toBe(true)
    expect(paths.status.options.index).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 11. Field length constraints
// ─────────────────────────────────────────────────────────────────────────

describe('Field length constraints', () => {
  it('enforces maxlength of 255 on originalFileName', async () => {
    await expect(
      Prescription.create(validPayload({ originalFileName: 'x'.repeat(256) }))
    ).rejects.toThrow(/255/)
  })

  it('enforces maxlength of 1000 on notes', async () => {
    await expect(
      Prescription.create(validPayload({ notes: 'x'.repeat(1001) }))
    ).rejects.toThrow(/1000/)
  })

  it('accepts notes at exactly 1000 characters', async () => {
    const doc = await Prescription.create(validPayload({ notes: 'x'.repeat(1000) }))
    expect(doc.notes).toHaveLength(1000)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 12. Multiple recommended medicines
// ─────────────────────────────────────────────────────────────────────────

describe('Multiple recommended medicines', () => {
  it('saves multiple recommended medicines on an approved prescription', async () => {
    const doc = await Prescription.create(
      validPayload({
        status: 'approved',
        recommendedMedicines: [
          { medicine: id(), quantity: 1, dosageInstructions: 'Once daily' },
          { medicine: id(), quantity: 2, dosageInstructions: 'Twice daily' },
          { medicine: id(), quantity: 3 },
        ],
      })
    )
    expect(doc.recommendedMedicines).toHaveLength(3)
    expect(doc.recommendedMedicines[1].quantity).toBe(2)
  })

  it('each sub-document gets its own _id', async () => {
    const doc = await Prescription.create(
      validPayload({
        status: 'approved',
        recommendedMedicines: [
          { medicine: id(), quantity: 1 },
          { medicine: id(), quantity: 2 },
        ],
      })
    )
    const [a, b] = doc.recommendedMedicines
    expect(a._id.toString()).not.toBe(b._id.toString())
  })
})
