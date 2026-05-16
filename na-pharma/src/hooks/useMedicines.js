import { useState, useEffect, useCallback } from 'react'
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../api/medicineApi.js'
import showToast from '../utils/toast.js'

/**
 * Hook for fetching + managing medicines from the real backend.
 *
 * @param {object} [initialParams]  Initial query params (page, limit, search, category, sort)
 */
export function useMedicines(initialParams = {}) {
  const [medicines,   setMedicines]   = useState([])
  const [pagination,  setPagination]  = useState(null)
  const [isLoading,   setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [params,      setParams]      = useState({ page: 1, limit: 12, ...initialParams })

  const fetch = useCallback(async (overrides = {}) => {
    setLoading(true)
    setError(null)
    try {
      const query = { ...params, ...overrides }
      const data  = await getMedicines(query)
      setMedicines(data.medicines ?? [])
      setPagination(data.pagination ?? null)
    } catch (err) {
      setError(err?.message ?? 'Failed to load medicines.')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => { fetch() }, [fetch])

  // ── CRUD helpers ──────────────────────────────────────────────────────
  const create = useCallback(async (payload) => {
    const data = await createMedicine(payload)
    showToast.success('Medicine created successfully.')
    await fetch()
    return data
  }, [fetch])

  const update = useCallback(async (id, payload) => {
    const data = await updateMedicine(id, payload)
    showToast.success('Medicine updated successfully.')
    await fetch()
    return data
  }, [fetch])

  const remove = useCallback(async (id) => {
    await deleteMedicine(id)
    showToast.success('Medicine deleted.')
    await fetch()
  }, [fetch])

  const updateParams = useCallback((next) => {
    setParams((prev) => ({ ...prev, ...next }))
  }, [])

  return {
    medicines,
    pagination,
    isLoading,
    error,
    params,
    updateParams,
    refetch: fetch,
    create,
    update,
    remove,
  }
}
