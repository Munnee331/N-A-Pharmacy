/**
 * Email service — Nodemailer-based transactional email for N A Pharma.
 *
 * In development (no SMTP credentials) the service uses Nodemailer's
 * built-in "ethereal" test account and logs the preview URL to the console
 * so you can inspect emails without a real mail server.
 *
 * In production set these env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM
 */

import nodemailer from 'nodemailer'
import { env }    from '../config/env.js'

// ── Transporter factory ───────────────────────────────────────────────────

let _transporter = null

/**
 * Returns (and lazily creates) the Nodemailer transporter.
 * Uses real SMTP when credentials are present, otherwise falls back to
 * Ethereal (test account) so development works without configuration.
 */
export async function getTransporter () {
  if (_transporter) return _transporter

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    // ── Production / staging SMTP ─────────────────────────────────────────
    _transporter = nodemailer.createTransport({
      host:   env.SMTP_HOST,
      port:   Number(env.SMTP_PORT) || 587,
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  } else {
    // ── Development fallback — Ethereal test account ──────────────────────
    const testAccount = await nodemailer.createTestAccount()
    _transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('\x1b[33m⚠  No SMTP credentials found — using Ethereal test account\x1b[0m')
    console.log(`   Ethereal user: ${testAccount.user}`)
  }

  return _transporter
}

/** Reset the cached transporter (used in tests). */
export function resetTransporter () {
  _transporter = null
}

// ── Sender address ────────────────────────────────────────────────────────

const FROM = env.EMAIL_FROM || '"N A Pharma" <noreply@napharma.com>'

// ── HTML helpers ──────────────────────────────────────────────────────────

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f9fafb;
  margin: 0;
  padding: 0;
`

function layout (content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>N A Pharma</title>
</head>
<body style="${baseStyle}">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;
              border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px">
        N A <span style="color:#bbf7d0">Pharma</span>
      </h1>
      <p style="margin:4px 0 0;color:#dcfce7;font-size:13px">Your trusted pharmacy partner</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6;padding:20px 32px;border-top:1px solid #e5e7eb">
      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center">
        © ${new Date().getFullYear()} N A Pharma. All rights reserved.<br/>
        This is an automated message — please do not reply.
      </p>
    </div>
  </div>
</body>
</html>`
}

function badge (text, color) {
  const colors = {
    green: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    red:   { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
  }
  const c = colors[color] || colors.green
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;
    background:${c.bg};color:${c.text};border:1px solid ${c.border};
    font-size:12px;font-weight:600">${text}</span>`
}

function medicineTable (medicines) {
  if (!medicines?.length) return ''

  const rows = medicines.map((item) => {
    const name    = item.medicine?.name  ?? 'Unknown'
    const brand   = item.medicine?.brand ?? ''
    const qty     = item.quantity
    const dosage  = item.dosageInstructions || '—'
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">
          <strong style="color:#111827">${name}</strong>
          ${brand ? `<br/><span style="color:#9ca3af;font-size:12px">${brand}</span>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151">${qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">${dosage}</td>
      </tr>`
  }).join('')

  return `
    <div style="margin-top:20px">
      <p style="margin:0 0 10px;font-weight:600;color:#111827;font-size:14px">
        💊 Recommended Medicines
      </p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Medicine</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Qty</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Dosage</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

// ── Email templates ───────────────────────────────────────────────────────

/**
 * Build the HTML + text for a prescription-approved email.
 *
 * @param {object} opts
 * @param {string} opts.customerName
 * @param {string} opts.prescriptionId   - last 8 chars used as reference
 * @param {string} opts.pharmacistName
 * @param {object[]} opts.recommendedMedicines
 * @param {string} [opts.notes]          - patient's original notes
 * @param {string} [opts.dashboardUrl]
 */
export function buildApprovalEmail ({
  customerName,
  prescriptionId,
  pharmacistName,
  recommendedMedicines = [],
  notes = '',
  dashboardUrl = `${env.CLIENT_ORIGIN}/prescriptions`,
}) {
  const ref = prescriptionId?.slice(-8).toUpperCase() ?? '—'

  const html = layout(`
    <p style="margin:0 0 6px;color:#6b7280;font-size:13px">Hello,</p>
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700">
      Your prescription has been approved ✅
    </h2>

    ${badge('Approved', 'green')}

    <p style="margin:16px 0;color:#374151;line-height:1.6">
      Dear <strong>${customerName}</strong>, your prescription
      <strong>#${ref}</strong> has been reviewed and approved by
      <strong>${pharmacistName}</strong>.
    </p>

    ${notes ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:16px">
      <p style="margin:0;font-size:13px;color:#92400e">
        <strong>Your notes:</strong> ${notes}
      </p>
    </div>` : ''}

    ${medicineTable(recommendedMedicines)}

    <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
      <p style="margin:0;color:#15803d;font-size:13px">
        🛒 You can now add these medicines to your cart directly from your prescription history.
      </p>
    </div>

    <div style="margin-top:24px;text-align:center">
      <a href="${dashboardUrl}"
         style="display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;
                border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
        View My Prescriptions
      </a>
    </div>
  `)

  const text = [
    `Hello ${customerName},`,
    '',
    `Your prescription #${ref} has been APPROVED by ${pharmacistName}.`,
    '',
    notes ? `Your notes: ${notes}` : '',
    '',
    recommendedMedicines.length
      ? 'Recommended medicines:\n' + recommendedMedicines.map(
          (m) => `  - ${m.medicine?.name ?? 'Unknown'} x${m.quantity}${m.dosageInstructions ? ` (${m.dosageInstructions})` : ''}`
        ).join('\n')
      : '',
    '',
    `View your prescriptions: ${dashboardUrl}`,
  ].filter((l) => l !== undefined).join('\n')

  return { html, text, subject: `✅ Prescription #${ref} Approved — N A Pharma` }
}

/**
 * Build the HTML + text for a prescription-rejected email.
 *
 * @param {object} opts
 * @param {string} opts.customerName
 * @param {string} opts.prescriptionId
 * @param {string} opts.pharmacistName
 * @param {string} opts.rejectionReason
 * @param {string} [opts.dashboardUrl]
 */
export function buildRejectionEmail ({
  customerName,
  prescriptionId,
  pharmacistName,
  rejectionReason,
  dashboardUrl = `${env.CLIENT_ORIGIN}/prescriptions`,
}) {
  const ref = prescriptionId?.slice(-8).toUpperCase() ?? '—'

  const html = layout(`
    <p style="margin:0 0 6px;color:#6b7280;font-size:13px">Hello,</p>
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700">
      Your prescription could not be approved ❌
    </h2>

    ${badge('Rejected', 'red')}

    <p style="margin:16px 0;color:#374151;line-height:1.6">
      Dear <strong>${customerName}</strong>, your prescription
      <strong>#${ref}</strong> has been reviewed by
      <strong>${pharmacistName}</strong> and unfortunately could not be approved.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 6px;font-weight:600;color:#b91c1c;font-size:13px">Reason for rejection:</p>
      <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6">${rejectionReason}</p>
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.6">
      If you believe this is an error or have a new prescription, please upload it again
      from your dashboard.
    </p>

    <div style="margin-top:24px;text-align:center">
      <a href="${dashboardUrl}"
         style="display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;
                border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
        Upload New Prescription
      </a>
    </div>
  `)

  const text = [
    `Hello ${customerName},`,
    '',
    `Your prescription #${ref} has been REJECTED by ${pharmacistName}.`,
    '',
    `Reason: ${rejectionReason}`,
    '',
    `Upload a new prescription: ${dashboardUrl}`,
  ].join('\n')

  return { html, text, subject: `❌ Prescription #${ref} Could Not Be Approved — N A Pharma` }
}

// ── Send helpers ──────────────────────────────────────────────────────────

/**
 * Send a prescription-approved notification to the customer.
 * Errors are caught and logged — never thrown — so a mail failure
 * never breaks the HTTP response.
 */
export async function sendApprovalEmail (opts) {
  try {
    const transporter = await getTransporter()
    const { html, text, subject } = buildApprovalEmail(opts)

    const info = await transporter.sendMail({
      from:    FROM,
      to:      opts.customerEmail,
      subject,
      text,
      html,
    })

    const preview = nodemailer.getTestMessageUrl(info)
    if (preview) {
      console.log(`\x1b[36m📧 Approval email preview: ${preview}\x1b[0m`)
    }
  } catch (err) {
    console.error('\x1b[31m✖  Failed to send approval email:\x1b[0m', err.message)
  }
}

/**
 * Send a prescription-rejected notification to the customer.
 * Errors are caught and logged — never thrown.
 */
export async function sendRejectionEmail (opts) {
  try {
    const transporter = await getTransporter()
    const { html, text, subject } = buildRejectionEmail(opts)

    const info = await transporter.sendMail({
      from:    FROM,
      to:      opts.customerEmail,
      subject,
      text,
      html,
    })

    const preview = nodemailer.getTestMessageUrl(info)
    if (preview) {
      console.log(`\x1b[36m📧 Rejection email preview: ${preview}\x1b[0m`)
    }
  } catch (err) {
    console.error('\x1b[31m✖  Failed to send rejection email:\x1b[0m', err.message)
  }
}
