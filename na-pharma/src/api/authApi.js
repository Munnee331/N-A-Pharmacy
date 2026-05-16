import client from './client.js'

/**
 * Authentication API — wired to the real backend.
 * All functions return the `data` payload from ApiResponse.
 */

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login({ email, password }) {
  const res = await client.post('/auth/login', { email, password })
  return res.data.data   // { user, token }
}

/**
 * Register a new user account.
 * @param {{ name: string, email: string, phone: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function register({ name, email, phone, password }) {
  const res = await client.post('/auth/register', { name, email, phone, password })
  return res.data.data   // { user, token }
}

/**
 * Get the currently authenticated user profile.
 * Requires a valid JWT in localStorage (attached by the Axios interceptor).
 * @returns {Promise<{ user: object }>}
 */
export async function getProfile() {
  const res = await client.get('/auth/me')
  return res.data.data   // { user }
}

/**
 * Log out — clears token and user from localStorage.
 * No backend call needed (JWT is stateless).
 */
export function logout() {
  localStorage.removeItem('na_pharma_token')
  localStorage.removeItem('na_pharma_user')
}
