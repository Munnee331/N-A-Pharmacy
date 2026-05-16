/**
 * Invoice PDF generation service.
 * Uses pdfkit to build a professional A4 invoice and pipe it to the response.
 */
import PDFDocument from 'pdfkit'

// ── Brand colours (RGB) ───────────────────────────────────────────────────
const GREEN_DARK  = '#15803d'   // primary-700
const GREEN_MID   = '#16a34a'   // primary-600
const GREEN_LIGHT = '#dcfce7'   // primary-100
const NEUTRAL_900 = '#111827'
const NEUTRAL_600 = '#4b5563'
const NEUTRAL_400 = '#9ca3af'
const NEUTRAL_200 = '#e5e7eb'
const WHITE       = '#ffffff'

// ── Helpers ───────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatCurrency(amount) {
  return `BDT ${Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`
}

function capitalize(str = '') {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Main generator ────────────────────────────────────────────────────────

/**
 * Generate a PDF invoice and pipe it directly to an Express response.
 *
 * @param {object} order   - Populated Order document (customer populated)
 * @param {object} res     - Express response object
 */
export function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({
    size:    'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title:   `Invoice #${order._id.toString().slice(-8).toUpperCase()}`,
      Author:  'N A Pharma',
      Subject: 'Order Invoice',
    },
  })

  // ── Stream headers ────────────────────────────────────────────────────
  const filename = `NA-Pharma-Invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf`
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  doc.pipe(res)

  const pageW  = doc.page.width
  const margin = 50
  const contentW = pageW - margin * 2

  // ── HEADER BAND ───────────────────────────────────────────────────────
  doc.rect(0, 0, pageW, 110).fill(GREEN_DARK)

  // Logo circle
  doc.circle(margin + 22, 55, 22)
     .fill(WHITE)
  doc.fontSize(18).fillColor(GREEN_DARK).font('Helvetica-Bold')
     .text('N', margin + 13, 46)

  // Brand name
  doc.fontSize(22).fillColor(WHITE).font('Helvetica-Bold')
     .text('N A Pharma', margin + 54, 38)
  doc.fontSize(9).fillColor('#bbf7d0').font('Helvetica')
     .text('Your Trusted Online Pharmacy', margin + 54, 64)
  doc.fontSize(8).fillColor('#86efac')
     .text('Dhaka, Bangladesh  |  noreply@napharma.com  |  +880 1700-000000', margin + 54, 78)

  // INVOICE label (right side)
  doc.fontSize(28).fillColor(WHITE).font('Helvetica-Bold')
     .text('INVOICE', pageW - margin - 120, 38, { width: 120, align: 'right' })
  doc.fontSize(9).fillColor('#bbf7d0').font('Helvetica')
     .text(`#${order._id.toString().slice(-8).toUpperCase()}`, pageW - margin - 120, 72, { width: 120, align: 'right' })

  // ── META ROW ──────────────────────────────────────────────────────────
  const metaY = 125
  doc.fontSize(8).fillColor(NEUTRAL_600).font('Helvetica')

  const metaItems = [
    { label: 'Invoice Date',    value: formatDate(order.createdAt) },
    { label: 'Order ID',        value: `#${order._id.toString().slice(-8).toUpperCase()}` },
    { label: 'Transaction ID',  value: order.transactionId ?? 'N/A' },
    { label: 'Payment Status',  value: capitalize(order.paymentStatus) },
    { label: 'Order Status',    value: capitalize(order.status) },
  ]

  const colW = contentW / metaItems.length
  metaItems.forEach(({ label, value }, i) => {
    const x = margin + i * colW
    doc.fillColor(NEUTRAL_400).text(label.toUpperCase(), x, metaY, { width: colW - 4 })
    doc.fillColor(NEUTRAL_900).font('Helvetica-Bold')
       .text(value, x, metaY + 13, { width: colW - 4 })
    doc.font('Helvetica')
  })

  // Divider
  doc.moveTo(margin, metaY + 34).lineTo(pageW - margin, metaY + 34)
     .strokeColor(NEUTRAL_200).lineWidth(0.5).stroke()

  // ── BILL TO / SHIP TO ─────────────────────────────────────────────────
  const addrY = metaY + 46
  const halfW = contentW / 2 - 10

  // Bill To
  doc.fontSize(8).fillColor(GREEN_MID).font('Helvetica-Bold')
     .text('BILL TO', margin, addrY)
  doc.fillColor(NEUTRAL_900).fontSize(10).font('Helvetica-Bold')
     .text(order.customer?.name ?? 'Customer', margin, addrY + 14)
  doc.fillColor(NEUTRAL_600).fontSize(8).font('Helvetica')
     .text(order.customer?.email ?? '', margin, addrY + 28)
     .text(order.customer?.phone ?? '', margin, addrY + 40)

  // Ship To
  const shipX = margin + halfW + 20
  doc.fontSize(8).fillColor(GREEN_MID).font('Helvetica-Bold')
     .text('SHIP TO', shipX, addrY)
  const addr = order.shippingAddress
  doc.fillColor(NEUTRAL_900).fontSize(10).font('Helvetica-Bold')
     .text(order.customer?.name ?? 'Customer', shipX, addrY + 14)
  doc.fillColor(NEUTRAL_600).fontSize(8).font('Helvetica')
     .text(addr?.address || 'N/A', shipX, addrY + 28)
     .text(`${addr?.city || 'Dhaka'}, ${addr?.country || 'Bangladesh'}`, shipX, addrY + 40)

  // ── ITEMS TABLE ───────────────────────────────────────────────────────
  const tableY = addrY + 68

  // Table header background
  doc.rect(margin, tableY, contentW, 22).fill(GREEN_DARK)

  const cols = {
    no:       { x: margin + 6,              w: 24 },
    name:     { x: margin + 34,             w: contentW - 34 - 80 - 70 - 70 - 6 },
    qty:      { x: margin + contentW - 220, w: 80 },
    unit:     { x: margin + contentW - 140, w: 70 },
    subtotal: { x: margin + contentW - 70,  w: 64 },
  }

  doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold')
  doc.text('#',         cols.no.x,       tableY + 7, { width: cols.no.w })
  doc.text('MEDICINE',  cols.name.x,     tableY + 7, { width: cols.name.w })
  doc.text('QTY',       cols.qty.x,      tableY + 7, { width: cols.qty.w,      align: 'center' })
  doc.text('UNIT PRICE',cols.unit.x,     tableY + 7, { width: cols.unit.w,     align: 'right' })
  doc.text('SUBTOTAL',  cols.subtotal.x, tableY + 7, { width: cols.subtotal.w, align: 'right' })

  // Table rows
  let rowY = tableY + 22
  const DELIVERY_CHARGE = 60

  order.items.forEach((item, idx) => {
    const isEven = idx % 2 === 0
    if (isEven) {
      doc.rect(margin, rowY, contentW, 20).fill('#f9fafb')
    }

    const subtotal = item.price * item.quantity

    doc.fillColor(NEUTRAL_600).fontSize(8).font('Helvetica')
    doc.text(String(idx + 1),                cols.no.x,       rowY + 6, { width: cols.no.w })
    doc.fillColor(NEUTRAL_900).font('Helvetica-Bold')
    doc.text(item.name,                      cols.name.x,     rowY + 6, { width: cols.name.w, lineBreak: false })
    doc.fillColor(NEUTRAL_600).font('Helvetica')
    doc.text(String(item.quantity),          cols.qty.x,      rowY + 6, { width: cols.qty.w,      align: 'center' })
    doc.text(formatCurrency(item.price),     cols.unit.x,     rowY + 6, { width: cols.unit.w,     align: 'right' })
    doc.fillColor(NEUTRAL_900).font('Helvetica-Bold')
    doc.text(formatCurrency(subtotal),       cols.subtotal.x, rowY + 6, { width: cols.subtotal.w, align: 'right' })

    rowY += 20
  })

  // Bottom border of table
  doc.moveTo(margin, rowY).lineTo(pageW - margin, rowY)
     .strokeColor(NEUTRAL_200).lineWidth(0.5).stroke()

  // ── TOTALS ────────────────────────────────────────────────────────────
  const totalsX  = margin + contentW - 200
  const totalsLW = 130
  const totalsVW = 64
  let totY = rowY + 12

  function totalsRow(label, value, bold = false, highlight = false) {
    if (highlight) {
      doc.rect(totalsX - 6, totY - 4, 206, 22).fill(GREEN_LIGHT)
    }
    doc.fillColor(bold ? NEUTRAL_900 : NEUTRAL_600)
       .font(bold ? 'Helvetica-Bold' : 'Helvetica')
       .fontSize(bold ? 10 : 8)
       .text(label, totalsX, totY, { width: totalsLW })
    doc.fillColor(bold ? GREEN_DARK : NEUTRAL_900)
       .font(bold ? 'Helvetica-Bold' : 'Helvetica')
       .fontSize(bold ? 10 : 8)
       .text(value, totalsX + totalsLW, totY, { width: totalsVW, align: 'right' })
    totY += bold ? 26 : 18
  }

  const subtotalAmt = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  totalsRow('Subtotal',         formatCurrency(subtotalAmt))
  totalsRow('Delivery Charge',  formatCurrency(DELIVERY_CHARGE))
  doc.moveTo(totalsX, totY - 4).lineTo(totalsX + totalsLW + totalsVW, totY - 4)
     .strokeColor(NEUTRAL_200).lineWidth(0.5).stroke()
  totY += 4
  totalsRow('GRAND TOTAL',      formatCurrency(order.totalAmount + DELIVERY_CHARGE), true, true)

  // ── PAYMENT METHOD ────────────────────────────────────────────────────
  const pmY = rowY + 12
  doc.fillColor(NEUTRAL_400).fontSize(8).font('Helvetica')
     .text('PAYMENT METHOD', margin, pmY)
  doc.fillColor(NEUTRAL_900).font('Helvetica-Bold').fontSize(9)
     .text(capitalize(order.paymentDetails?.card_type ?? 'Online Payment'), margin, pmY + 13)

  // ── THANK YOU FOOTER ──────────────────────────────────────────────────
  const footerY = doc.page.height - 90
  doc.rect(0, footerY, pageW, 90).fill(GREEN_DARK)

  doc.fontSize(13).fillColor(WHITE).font('Helvetica-Bold')
     .text('Thank you for choosing N A Pharma!', margin, footerY + 16, { align: 'center', width: contentW })
  doc.fontSize(8).fillColor('#bbf7d0').font('Helvetica')
     .text(
       'For support, contact us at support@napharma.com or call +880 1700-000000',
       margin, footerY + 36, { align: 'center', width: contentW }
     )
  doc.fontSize(7).fillColor('#86efac')
     .text(
       'N A Pharma · Dhaka, Bangladesh · www.napharma.com',
       margin, footerY + 54, { align: 'center', width: contentW }
     )

  doc.end()
}
