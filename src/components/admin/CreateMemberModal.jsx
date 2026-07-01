import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY = { full_name: '', email: '', password: '', role: 'member', can_access_mediagen: false, can_access_fyc: false }

export function CreateMemberModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleRoleChange(newRole) {
    if (newRole === 'admin') {
      setForm(f => ({ ...f, role: 'admin', can_access_mediagen: true, can_access_fyc: true }))
    } else {
      set('role', newRole)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(form),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create user')
      onCreated(json.user)
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Create Member Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              required
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              className="input"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="input"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className="input"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => handleRoleChange(e.target.value)}
              className="input"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tool Access</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.can_access_mediagen}
                  onChange={e => set('can_access_mediagen', e.target.checked)}
                  disabled={form.role === 'admin'}
                  className="w-4 h-4 rounded border-gray-300 text-ieee-blue focus:ring-ieee-blue"
                />
                <span className="text-sm text-gray-700">MediaGen</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.can_access_fyc}
                  onChange={e => set('can_access_fyc', e.target.checked)}
                  disabled={form.role === 'admin'}
                  className="w-4 h-4 rounded border-gray-300 text-ieee-blue focus:ring-ieee-blue"
                />
                <span className="text-sm text-gray-700">FYC Internship App Tracker</span>
              </label>
            </div>
            {form.role === 'admin' && (
              <p className="text-xs text-gray-400 mt-1.5">Admins have access to all tools.</p>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-ieee-blue hover:bg-ieee-blue-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
