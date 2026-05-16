import client from './client.js'

/**
 * Medicine catalogue API — wired to the real backend.
 * All functions return the `data` payload from ApiResponse.
 */

/**
 * Fetch paginated medicine list with optional filters.
 * @param {{ page?: number, limit?: number, category?: string, search?: string, sort?: string }} params
 * @returns {Promise<{ medicines: object[], pagination: object }>}
 */
export async function getMedicines(params = {}) {
  const res = await client.get('/medicines', { params })
  return res.data.data   // { medicines, pagination }
}

/**
 * Fetch a single medicine by MongoDB ObjectId or slug.
 * @param {string} idOrSlug
 * @returns {Promise<{ medicine: object }>}
 */
export async function getMedicineById(idOrSlug) {
  const res = await client.get(`/medicines/${idOrSlug}`)
  return res.data.data   // { medicine }
}

/**
 * Create a new medicine (admin only).
 * @param {object} payload
 * @returns {Promise<{ medicine: object }>}
 */
export async function createMedicine(payload) {
  const res = await client.post('/medicines', payload)
  return res.data.data
}

/**
 * Update an existing medicine (admin only).
 * @param {string} id  MongoDB ObjectId
 * @param {object} payload
 * @returns {Promise<{ medicine: object }>}
 */
export async function updateMedicine(id, payload) {
  const res = await client.put(`/medicines/${id}`, payload)
  return res.data.data
}

/**
 * Delete a medicine (admin only).
 * @param {string} id  MongoDB ObjectId
 * @returns {Promise<{ id: string }>}
 */
export async function deleteMedicine(id) {
  const res = await client.delete(`/medicines/${id}`)
  return res.data.data
}
