import { useState, useEffect } from 'react'
import { X, FileText, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function EditAccessModal({ member, onClose, onSaved }) {
  const [fyc, setFyc] = useState(member.can_access_fyc)
  const [mediagen, setMediagen] = useState(member.can_access_mediagen)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({ can_access_fyc: fyc, can_access_mediagen: mediagen })
      .eq('id', member.id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onSaved(member.id, { can_access_fyc: fyc, can_access_mediagen: mediagen })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Edit Access</h2>
            <p className="text-sm text-gray-400 mt-0.5">{member.full_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-ieee-blue" />
              <span className="text-sm font-medium text-gray-700">FYC Internship App Tracker</span>
            </div>
            <input
              type="checkbox"
              checked={fyc}
              onChange={e => setFyc(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-ieee-blue focus:ring-ieee-blue"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <ImageIcon size={16} className="text-uga-red" />
              <span className="text-sm font-medium text-gray-700">MediaGen</span>
            </div>
            <input
              type="checkbox"
              checked={mediagen}
              onChange={e => setMediagen(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-ieee-blue focus:ring-ieee-blue"
            />
          </label>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-ieee-blue hover:bg-ieee-blue-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
