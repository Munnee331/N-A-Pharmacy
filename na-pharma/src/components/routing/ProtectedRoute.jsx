import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to /login, preserving the intended destination.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner fullPage />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * Wraps routes that require admin role.
 * Redirects non-admins to /dashboard.
 */
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner fullPage />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

/**
 * Wraps routes that require pharmacist role.
 * Redirects non-pharmacists to /dashboard.
 */
export function PharmacistRoute({ children }) {
  const { isAuthenticated, isPharmacist, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner fullPage />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admins can also access pharmacist routes
  if (!isPharmacist && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
