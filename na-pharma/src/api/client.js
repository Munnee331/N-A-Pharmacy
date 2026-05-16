import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Centralized Axios instance.
 * Reads base URL from VITE_API_BASE_URL env var (defaults to local backend).
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptor — attach auth token ───────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('na_pharma_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — normalise errors ───────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message || 'Something went wrong.'

    if (status === 401) {
      // Only hard-redirect if we're NOT on the startup profile check.
      // The AuthContext handles the /auth/me failure gracefully itself.
      const url = error.config?.url ?? ''
      const isProfileCheck = url.includes('/auth/me')
      if (!isProfileCheck) {
        localStorage.removeItem('na_pharma_token')
        localStorage.removeItem('na_pharma_user')
        window.location.href = '/login'
      }
      return Promise.reject({ status, message, raw: error })
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 404) {
      // Suppress — callers handle 404 themselves
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Check your internet connection.')
    }

    return Promise.reject({ status, message, raw: error })
  }
)

export default client
