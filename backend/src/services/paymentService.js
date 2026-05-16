/**
 * SSLCommerz Payment Service
 * Handles payment session initialisation and validation via sslcommerz-lts.
 */
import SSLCommerzPayment from 'sslcommerz-lts'
import { env } from '../config/env.js'

/**
 * Initialise an SSLCommerz payment session.
 *
 * @param {Object} params
 * @param {string} params.orderId           - Unique order / transaction ID (tran_id)
 * @param {number} params.amount            - Total payable amount in BDT
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.customerPhone
 * @param {string} [params.customerAddress]
 * @param {string} [params.customerCity]
 * @param {string} [params.productName]     - Short label shown on the gateway page
 *
 * @returns {Promise<string>} GatewayPageURL — redirect the user here
 * @throws  {Error} when SSLCommerz rejects the session request
 */
export async function initiatePayment({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress = 'N/A',
  customerCity    = 'Dhaka',
  productName     = 'Medicine Order',
}) {
  const backendUrl = `http://localhost:${env.PORT}`

  const data = {
    total_amount: amount,
    currency:     'BDT',
    tran_id:      orderId,

    // ── Callback URLs ────────────────────────────────────────────────────
    success_url: `${backendUrl}/api/payments/success`,
    fail_url:    `${backendUrl}/api/payments/fail`,
    cancel_url:  `${backendUrl}/api/payments/cancel`,
    ipn_url:     `${backendUrl}/api/payments/ipn`,

    // ── Product info (required by SSLCommerz) ────────────────────────────
    shipping_method:  'NO',
    product_name:     productName,
    product_category: 'Medicine',
    product_profile:  'general',

    // ── Customer info ────────────────────────────────────────────────────
    cus_name:    customerName,
    cus_email:   customerEmail,
    cus_add1:    customerAddress,
    cus_city:    customerCity,
    cus_country: 'Bangladesh',
    cus_phone:   customerPhone,

    // ── Shipping address (mirrors customer) ──────────────────────────────
    ship_name:     customerName,
    ship_add1:     customerAddress,
    ship_city:     customerCity,
    ship_country:  'Bangladesh',
    ship_postcode: '1000',
  }

  const sslcz = new SSLCommerzPayment(
    env.SSLCOMMERZ_STORE_ID,
    env.SSLCOMMERZ_STORE_PASSWORD,
    env.SSLCOMMERZ_IS_LIVE,
  )

  const response = await sslcz.init(data)

  if (!response?.GatewayPageURL) {
    throw new Error(
      `SSLCommerz session init failed: ${response?.failedreason ?? 'Unknown error'}`
    )
  }

  return response.GatewayPageURL
}

/**
 * Validate an IPN / callback payload using SSLCommerz's hash verification.
 *
 * @param {Object} payload  - req.body from an SSLCommerz callback
 * @returns {Promise<boolean>}
 */
export async function validatePayment(payload) {
  const sslcz = new SSLCommerzPayment(
    env.SSLCOMMERZ_STORE_ID,
    env.SSLCOMMERZ_STORE_PASSWORD,
    env.SSLCOMMERZ_IS_LIVE,
  )

  const response = await sslcz.validate(payload)
  return response?.status === 'VALID' || response?.status === 'VALIDATED'
}
