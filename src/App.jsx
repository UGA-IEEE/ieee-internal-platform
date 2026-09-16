import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { Navbar } from './components/shared/Navbar'
import { LoginPage } from './components/auth/LoginPage'
import { PlatformDashboard } from './components/platform/PlatformDashboard'
import { UserDashboard } from './components/fyc/UserDashboard'
import { PeerTrackerView } from './components/fyc/PeerTrackerView'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { AdminMemberDetail } from './components/admin/AdminMemberDetail'
import MediaGenApp from './components/mediagen/MediaGenApp'
import { ChangePasswordPage } from './components/account/ChangePasswordPage'
import ReimbursementApp from './reimbursement/ReimbursementApp'

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" replace />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navbar />
            <PlatformDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mediagen"
        element={
          <ProtectedRoute requirePermission="can_access_mediagen">
            <Navbar />
            <MediaGenApp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fyc"
        element={
          profile?.role === 'admin'
            ? <Navigate to="/admin" replace />
            : <ProtectedRoute requirePermission="can_access_fyc">
                <Navbar />
                <UserDashboard />
              </ProtectedRoute>
        }
      />

      <Route
        path="/fyc/member/:userId"
        element={
          <ProtectedRoute requirePermission="can_access_fyc">
            <Navbar />
            <PeerTrackerView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Navbar />
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/member/:userId"
        element={
          <ProtectedRoute requireAdmin>
            <Navbar />
            <AdminMemberDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reimbursement"
        element={
          <ProtectedRoute requireAdmin>
            <Navbar />
            <ReimbursementApp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account/password"
        element={
          <ProtectedRoute>
            <Navbar />
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          !user
            ? <Navigate to="/login" replace />
            : profile?.role === 'admin'
              ? <Navigate to="/admin" replace />
              : <Navigate to="/" replace />
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
