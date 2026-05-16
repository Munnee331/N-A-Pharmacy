import client from './client.js'

/**
 * Fetch orders for the currently authenticated user.
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
export async function getMyOrders(params = {}) {
  const res = await client.get('/orders/me', { params })
  return res.data.data   // { data: orders[], pagination }
}

/**
 * Fetch a single order by ID.
 * @param {string} orderId
 * @returns {Promise<{ order: object }>}
 */
export async function getOrderById(orderId) {
  const res = await client.get(`/orders/${orderId}`)
  return res.data.data   // { order }
}

/**
 * Fetch all orders (admin only).
 * @param {{ page?: number, limit?: number, status?: string, paymentStatus?: string }} params
 * @returns {Promise<{ orders: object[], pagination: object }>}
 */
export async function getAllOrders(params = {}) {
  const res = await client.get('/orders', { params })
  return res.data.data
}

/**
 * Download the PDF invoice for an order.
 * Triggers a browser file download.
 *
 * @param {string} orderId
 * @returns {Promise<void>}
 */
export async function downloadInvoice(orderId) {
  const token = localStorage.getItem('na_pharma_token')
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/orders/${orderId}/invoice`,
    {
      method:  'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json?.message || `Failed to download invoice (${res.status})`)
  }

  const blob     = await res.blob()
  const url      = URL.createObjectURL(blob)
  const anchor   = document.createElement('a')
  anchor.href    = url
  anchor.download = `NA-Pharma-Invoice-${orderId.slice(-8).toUpperCase()}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
