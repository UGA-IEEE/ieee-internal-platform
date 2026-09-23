import { useState } from 'react'
import { Target, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const MIN_GOAL = 1
const MAX_GOAL = 200

export function GoalSettings() {
  const { profile, refreshProfile } = useAuth()
  const [value, setValue] = useState(profile?.weekly_goal ?? 10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const dirty = Number(value) !== profile?.weekly_goal

  async function handleSave() {
    const goal = Number(value)
    if (!Number.isInteger(goal) || goal < MIN_GOAL || goal > MAX_GOAL) {
      setError(`Goal must be a whole number between ${MIN_GOAL} and ${MAX_GOAL}.`)
      return
    }
    setError('')
    setSaving(true)
    const { error } = await supabase.rpc('set_weekly_goal', { new_goal: goal })
    if (error) {
      setError(error.message)
    } else {
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Target size={18} className="text-ieee-blue" />
        <div>
          <p className="text-sm font-medium text-gray-800">Weekly application goal</p>
          <p className="text-xs text-gray-500 mt-0.5">Set your own target — adjust it any time.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={MIN_GOAL}
          max={MAX_GOAL}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="input w-24 text-center"
        />
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-1.5 bg-ieee-blue hover:bg-ieee-blue-dark text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={15} /> : null}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Update Goal'}
        </button>
      </div>

      {error && (
        <p className="w-full text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
