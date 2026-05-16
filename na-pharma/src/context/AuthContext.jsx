import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getProfile,
} from '../api/authApi.js'
import showToast from '../utils/toast.js'

/**
 * Authentication context — backed by the real API.
 *
 * On mount, if a token exists in localStorage the context calls GET /auth/me
 * to validate it and restore the session. This prevents stale/expired tokens
 * from keeping a user "logged in" after a server-side invalidation.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setLoading] = useState(true)

  // ── Restore + validate session on mount ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('na_pharma_token')
    if (!token) {
      setLoading(false)
      return
    }

    // Validate token with the backend — if it fails the interceptor clears storage
    getProfile()
      .then(({ user: freshUser }) => {
        setUser(freshUser)
        // Keep localStorage in sync with the freshest user data
        localStorage.setItem('na_pharma_user', JSON.stringify(freshUser))
      })
      .catch(() => {
        // Token invalid / expired — clear everything
        localStorage.removeItem('na_pharma_token')
        localStorage.removeItem('na_pharma_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await apiLogin(credentials)
    localStorage.setItem('na_pharma_token', token)
    localStorage.setItem('na_pharma_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    showToast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`)
    return loggedInUser
  }, [])

  // ── Register ──────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const { user: newUser, token } = await apiRegister(userData)
    localStorage.setItem('na_pharma_token', token)
    localStorage.setItem('na_pharma_user', JSON.stringify(newUser))
    setUser(newUser)
    showToast.success('Account created successfully!')
    return newUser
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
    showToast.info('You have been signed out.')
  }, [])

  const isAuthenticated = Boolean(user)
  const isAdmin         = user?.role === 'admin'
  const isPharmacist    = user?.role === 'pharmacist'

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, isAdmin, isPharmacist, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
