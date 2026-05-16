import client from './client.js'

/**
 * Initiate an SSLCommerz payment session.
 *
 * POST /api/payments/initiate
 *
 * @param {{
 *   items: { medicine: string, name: string, quantity: number, price: number }[],
 *   shippingAddress: { address: string, city: string, country?: string },
 *   notes?: string,
 *   prescription?: string,
 * }} payload
 *
 * @returns {Promise<{ orderId: string, gatewayUrl: string }>}
 */
export async function initiatePayment(payload) {
  const res = await client.post('/payments/initiate', payload)
  return res.data.data   // { orderId, gatewayUrl }
}
