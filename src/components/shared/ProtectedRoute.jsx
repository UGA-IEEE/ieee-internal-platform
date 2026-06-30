import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute({ children, requireAdmin = false, requirePermission = null }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ieee-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const isAdmin = profile?.role === 'admin'

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />

  if (requirePermission && !isAdmin && !profile?.[requirePermission]) {
    return <Navigate to="/" replace />
  }

  return children
}
