import client from './client.js'

/**
 * Upload a prescription file to the backend.
 *
 * Sends a multipart/form-data POST to POST /api/prescriptions.
 * The file must be in the "prescription" field.
 *
 * @param {File}     file         - The prescription image or PDF
 * @param {string}   [notes]      - Optional notes for the pharmacist
 * @param {Function} [onProgress] - (percent: number) => void — called during upload
 * @returns {Promise<{ prescription: object, imageUrl: string }>}
 */
export async function uploadPrescription(file, notes = '', onProgress) {
  const formData = new FormData()
  formData.append('prescription', file)
  if (notes.trim()) {
    formData.append('notes', notes.trim())
  }

  const res = await client.post('/prescriptions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) {
        onProgress?.(Math.round((e.loaded * 100) / e.total))
      }
    },
  })

  return res.data.data   // { prescription, imageUrl }
}

/**
 * Get all prescriptions for the currently authenticated user.
 *
 * @param {{ page?: number, limit?: number, status?: string }} [params]
 * @returns {Promise<{ prescriptions: object[], pagination: object }>}
 */
export async function getMyPrescriptions(params = {}) {
  const res = await client.get('/prescriptions/my', { params })
  return res.data.data   // { prescriptions, pagination }
}

/**
 * Get a single prescription by ID.
 * Customers can only fetch their own; pharmacists/admins can fetch any.
 *
 * @param {string} prescriptionId
 * @returns {Promise<{ prescription: object }>}
 */
export async function getPrescriptionById(prescriptionId) {
  const res = await client.get(`/prescriptions/${prescriptionId}`)
  return res.data.data   // { prescription }
}

/**
 * Pharmacist / admin: get the pending work queue.
 *
 * @param {{ page?: number, limit?: number, status?: string }} [params]
 * @returns {Promise<{ prescriptions: object[], pagination: object }>}
 */
export async function getPendingPrescriptions(params = {}) {
  const res = await client.get('/prescriptions/pending', { params })
  return res.data.data
}

/**
 * Pharmacist / admin: start reviewing a prescription.
 *
 * @param {string} prescriptionId
 * @returns {Promise<{ prescription: object }>}
 */
export async function startReview(prescriptionId) {
  const res = await client.patch(`/prescriptions/${prescriptionId}/start-review`)
  return res.data.data
}

/**
 * Pharmacist / admin: approve a prescription with recommended medicines.
 *
 * @param {string} prescriptionId
 * @param {{ medicine: string, quantity: number, dosageInstructions?: string }[]} recommendedMedicines
 * @returns {Promise<{ prescription: object }>}
 */
export async function approvePrescription(prescriptionId, recommendedMedicines) {
  const res = await client.patch(`/prescriptions/${prescriptionId}/approve`, {
    recommendedMedicines,
  })
  return res.data.data
}

/**
 * Pharmacist / admin: reject a prescription.
 *
 * @param {string} prescriptionId
 * @param {string} rejectionReason
 * @returns {Promise<{ prescription: object }>}
 */
export async function rejectPrescription(prescriptionId, rejectionReason) {
  const res = await client.patch(`/prescriptions/${prescriptionId}/reject`, {
    rejectionReason,
  })
  return res.data.data
}
