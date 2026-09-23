import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'

const STATUS_OPTIONS = ['applied', 'interview', 'offered', 'rejected', 'accepted']

const EMPTY_FORM = {
  date_applied: format(new Date(), 'yyyy-MM-dd'),
  company: '',
  position_name: '',
  reference_link: '',
  location: '',
  pay: '',
  status: 'applied',
}

export function ApplicationForm({ onClose, onSaved, existing = null, table = 'applications' }) {
  const { user } = useAuth()
  const [form, setForm] = useState(existing ? {
    date_applied: existing.date_applied,
    company: existing.company,
    position_name: existing.position_name,
    reference_link: existing.reference_link ?? '',
    location: existing.location ?? '',
    pay: existing.pay ?? '',
    status: existing.status,
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        reference_link: form.reference_link || null,
        location: form.location || null,
        pay: form.pay || null,
      }

      let result
      if (existing) {
        result = await supabase
          .from(table)
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from(table)
          .insert({ ...payload, user_id: user.id })
          .select()
          .single()
      }

      if (result.error) throw result.error
      onSaved(result.data)
    } catch (err) {
      setError(err.message ?? 'Failed to save application.')
    } finally {
      setSaving(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {existing ? 'Edit Application' : 'Add Application'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                required
                value={form.company}
                onChange={e => set('company', e.target.value)}
                className="input"
                placeholder="Google, Amazon…"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Applied *</label>
              <input
                type="date"
                required
                value={form.date_applied}
                onChange={e => set('date_applied', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position Name *</label>
            <input
              required
              value={form.position_name}
              onChange={e => set('position_name', e.target.value)}
              className="input"
              placeholder="Software Engineering Intern"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Link</label>
            <input
              type="url"
              value={form.reference_link}
              onChange={e => set('reference_link', e.target.value)}
              className="input"
              placeholder="https://careers.company.com/…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className="input"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay</label>
              <input
                value={form.pay}
                onChange={e => set('pay', e.target.value)}
                className="input"
                placeholder="$25/hr, Unpaid…"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="input"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
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
              {saving ? 'Saving…' : existing ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
