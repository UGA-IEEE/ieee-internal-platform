import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export function ChangePasswordPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setNewPassword('')
      setConfirm('')
    }
    setLoading(false)
  }

  const backTo = profile?.role === 'admin' ? '/admin' : '/'

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ieee-blue transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Change Password</h1>
      <p className="text-sm text-gray-400 mb-8">{profile?.full_name} · {profile?.email}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {success ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold text-sm">Password updated successfully.</p>
            <button
              onClick={() => navigate(backTo)}
              className="mt-4 text-sm text-ieee-blue hover:underline"
            >
              Go back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ieee-blue hover:bg-ieee-blue-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
