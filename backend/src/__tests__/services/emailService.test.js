/**
 * Unit tests for emailService.js
 *
 * Tests:
 *  - buildApprovalEmail: subject, HTML content, text content
 *  - buildRejectionEmail: subject, HTML content, text content
 *  - sendApprovalEmail: calls transporter.sendMail with correct args
 *  - sendRejectionEmail: calls transporter.sendMail with correct args
 *  - Error resilience: sendApprovalEmail / sendRejectionEmail never throw
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import nodemailer from 'nodemailer'

// ── Mock nodemailer ───────────────────────────────────────────────────────

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })

vi.mock('nodemailer', () => ({
  default: {
    createTransport:    vi.fn(() => ({ sendMail: mockSendMail })),
    createTestAccount:  vi.fn().mockResolvedValue({
      user: 'test@ethereal.email',
      pass: 'testpass',
    }),
    getTestMessageUrl:  vi.fn().mockReturnValue(null),
  },
}))

// Import AFTER mocking
import {
  buildApprovalEmail,
  buildRejectionEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  resetTransporter,
} from '../../services/emailService.js'

// ── Fixtures ──────────────────────────────────────────────────────────────

const APPROVAL_OPTS = {
  customerEmail:   'fatima@example.com',
  customerName:    'Fatima Rahman',
  prescriptionId:  '507f1f77bcf86cd799439011',
  pharmacistName:  'Dr. Karim',
  recommendedMedicines: [
    {
      medicine:           { name: 'Paracetamol 500mg', brand: 'Napa' },
      quantity:           2,
      dosageInstructions: 'Twice daily after meals',
    },
    {
      medicine:           { name: 'Amoxicillin 250mg', brand: 'Moxacil' },
      quantity:           1,
      dosageInstructions: '',
    },
  ],
  notes:        'Urgent — needed by evening',
  dashboardUrl: 'http://localhost:5173/prescriptions',
}

const REJECTION_OPTS = {
  customerEmail:   'rahim@example.com',
  customerName:    'Rahim Uddin',
  prescriptionId:  '507f1f77bcf86cd799439022',
  pharmacistName:  'Dr. Sadia',
  rejectionReason: 'Prescription is expired',
  dashboardUrl:    'http://localhost:5173/prescriptions',
}

// ── Setup ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  resetTransporter()
})

// ─────────────────────────────────────────────────────────────────────────
// 1. buildApprovalEmail
// ─────────────────────────────────────────────────────────────────────────

describe('buildApprovalEmail', () => {
  it('returns subject containing the reference ID and "Approved"', () => {
    const { subject } = buildApprovalEmail(APPROVAL_OPTS)
    expect(subject).toMatch(/99439011/i)   // last 8 chars of prescriptionId
    expect(subject).toMatch(/approved/i)
  })

  it('HTML contains customer name', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    expect(html).toContain('Fatima Rahman')
  })

  it('HTML contains pharmacist name', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    expect(html).toContain('Dr. Karim')
  })

  it('HTML contains all recommended medicine names', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    expect(html).toContain('Paracetamol 500mg')
    expect(html).toContain('Amoxicillin 250mg')
  })

  it('HTML contains medicine quantities', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    // Quantities appear in the table cells
    expect(html).toContain('>2<')
    expect(html).toContain('>1<')
  })

  it('HTML contains dosage instructions', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    expect(html).toContain('Twice daily after meals')
  })

  it('HTML contains patient notes', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    expect(html).toContain('Urgent — needed by evening')
  })

  it('HTML contains dashboard URL', () => {
    const { html } = buildApprovalEmail(APPROVAL_OPTS)
    expect(html).toContain('http://localhost:5173/prescriptions')
  })

  it('plain text contains medicine names', () => {
    const { text } = buildApprovalEmail(APPROVAL_OPTS)
    expect(text).toContain('Paracetamol 500mg')
    expect(text).toContain('Amoxicillin 250mg')
  })

  it('plain text contains APPROVED keyword', () => {
    const { text } = buildApprovalEmail(APPROVAL_OPTS)
    expect(text).toMatch(/approved/i)
  })

  it('works when recommendedMedicines is empty', () => {
    const { html, text } = buildApprovalEmail({ ...APPROVAL_OPTS, recommendedMedicines: [] })
    expect(html).toBeTruthy()
    expect(text).toBeTruthy()
  })

  it('works when notes is empty', () => {
    const { html } = buildApprovalEmail({ ...APPROVAL_OPTS, notes: '' })
    expect(html).not.toContain('Your notes:')
  })

  it('uses last 8 chars of prescriptionId as reference', () => {
    const { subject } = buildApprovalEmail({ ...APPROVAL_OPTS, prescriptionId: 'abcdef1234567890' })
    expect(subject).toContain('34567890'.toUpperCase())
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 2. buildRejectionEmail
// ─────────────────────────────────────────────────────────────────────────

describe('buildRejectionEmail', () => {
  it('returns subject containing the reference ID and "Could Not Be Approved"', () => {
    const { subject } = buildRejectionEmail(REJECTION_OPTS)
    expect(subject).toMatch(/99439022/i)
    expect(subject).toMatch(/could not be approved/i)
  })

  it('HTML contains customer name', () => {
    const { html } = buildRejectionEmail(REJECTION_OPTS)
    expect(html).toContain('Rahim Uddin')
  })

  it('HTML contains pharmacist name', () => {
    const { html } = buildRejectionEmail(REJECTION_OPTS)
    expect(html).toContain('Dr. Sadia')
  })

  it('HTML contains rejection reason', () => {
    const { html } = buildRejectionEmail(REJECTION_OPTS)
    expect(html).toContain('Prescription is expired')
  })

  it('HTML contains dashboard URL', () => {
    const { html } = buildRejectionEmail(REJECTION_OPTS)
    expect(html).toContain('http://localhost:5173/prescriptions')
  })

  it('plain text contains REJECTED keyword', () => {
    const { text } = buildRejectionEmail(REJECTION_OPTS)
    expect(text).toMatch(/rejected/i)
  })

  it('plain text contains rejection reason', () => {
    const { text } = buildRejectionEmail(REJECTION_OPTS)
    expect(text).toContain('Prescription is expired')
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 3. sendApprovalEmail
// ─────────────────────────────────────────────────────────────────────────

describe('sendApprovalEmail', () => {
  it('calls transporter.sendMail with correct to address', async () => {
    await sendApprovalEmail(APPROVAL_OPTS)
    expect(mockSendMail).toHaveBeenCalledOnce()
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'fatima@example.com' })
    )
  })

  it('calls transporter.sendMail with subject containing "Approved"', async () => {
    await sendApprovalEmail(APPROVAL_OPTS)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringMatching(/approved/i) })
    )
  })

  it('calls transporter.sendMail with both html and text', async () => {
    await sendApprovalEmail(APPROVAL_OPTS)
    const call = mockSendMail.mock.calls[0][0]
    expect(call.html).toBeTruthy()
    expect(call.text).toBeTruthy()
  })

  it('does NOT throw when sendMail rejects', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection refused'))
    await expect(sendApprovalEmail(APPROVAL_OPTS)).resolves.toBeUndefined()
  })

  it('does NOT throw when customerEmail is undefined', async () => {
    await expect(
      sendApprovalEmail({ ...APPROVAL_OPTS, customerEmail: undefined })
    ).resolves.toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 4. sendRejectionEmail
// ─────────────────────────────────────────────────────────────────────────

describe('sendRejectionEmail', () => {
  it('calls transporter.sendMail with correct to address', async () => {
    await sendRejectionEmail(REJECTION_OPTS)
    expect(mockSendMail).toHaveBeenCalledOnce()
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'rahim@example.com' })
    )
  })

  it('calls transporter.sendMail with subject containing rejection indicator', async () => {
    await sendRejectionEmail(REJECTION_OPTS)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringMatching(/could not be approved/i) })
    )
  })

  it('does NOT throw when sendMail rejects', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP timeout'))
    await expect(sendRejectionEmail(REJECTION_OPTS)).resolves.toBeUndefined()
  })

  it('does NOT throw when customerEmail is undefined', async () => {
    await expect(
      sendRejectionEmail({ ...REJECTION_OPTS, customerEmail: undefined })
    ).resolves.toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────
// 5. Integration — controller calls email service
// ─────────────────────────────────────────────────────────────────────────

describe('Email triggered from controller actions', () => {
  it('sendApprovalEmail is called with medicine data', async () => {
    // Verify the payload shape that the controller would pass
    await sendApprovalEmail({
      customerEmail:   'test@example.com',
      customerName:    'Test User',
      prescriptionId:  '000000000000000000000001',
      pharmacistName:  'Test Pharmacist',
      recommendedMedicines: [
        { medicine: { name: 'Napa', brand: 'Beximco' }, quantity: 3, dosageInstructions: 'Once daily' },
      ],
      notes: '',
    })

    const call = mockSendMail.mock.calls[0][0]
    expect(call.html).toContain('Napa')
    expect(call.html).toContain('Beximco')
    expect(call.html).toContain('>3<')
    expect(call.html).toContain('Once daily')
  })

  it('sendRejectionEmail is called with rejection reason', async () => {
    await sendRejectionEmail({
      customerEmail:   'test@example.com',
      customerName:    'Test User',
      prescriptionId:  '000000000000000000000002',
      pharmacistName:  'Test Pharmacist',
      rejectionReason: 'Illegible handwriting',
    })

    const call = mockSendMail.mock.calls[0][0]
    expect(call.html).toContain('Illegible handwriting')
    expect(call.text).toContain('Illegible handwriting')
  })
})
