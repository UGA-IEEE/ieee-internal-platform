import { useState } from 'react'
import { Eye, EyeOff, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export function SharingToggle() {
  const { profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const shared = !!profile?.share_progress_general
  const pendingOffAt = profile?.share_off_requested_at_general ? new Date(profile.share_off_requested_at_general) : null
  const isPendingOff = shared && !!pendingOffAt

  async function updateSharing(nextValue) {
    setSaving(true)
    const { error } = await supabase.rpc('set_share_progress_general', { new_value: nextValue })
    if (!error) await refreshProfile()
    setSaving(false)
  }

  function handleToggle() {
    if (shared && !isPendingOff) {
      if (!window.confirm(
        "Turning sharing off has a 2-day cooldown — your tracker (and your ability to view others') stays visible until then. Continue?"
      )) return
    } else if (!shared) {
      if (!window.confirm(
        'Turning sharing on lets other tracker members view your applications right away. ' +
        "If you later turn it off, that takes 2 days to go into effect — your tracker stays visible until then. Continue?"
      )) return
    }
    updateSharing(!shared)
  }

  return (
    <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${shared ? 'bg-ieee-blue-light border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-3">
        {shared ? <Eye size={18} className="text-ieee-blue" /> : <EyeOff size={18} className="text-gray-400" />}
        <div>
          <p className="text-sm font-medium text-gray-800">Share my tracker with other members</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPendingOff
              ? "Other members can still view your applications until sharing turns off."
              : shared
                ? 'Other members can view your applications (read-only).'
                : 'Your applications are private — only you and admins can see them.'}
          </p>
          {isPendingOff && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-1.5">
              <Clock size={13} />
              Turning off {formatDistanceToNow(pendingOffAt, { addSuffix: true })}
              <button
                onClick={() => updateSharing(true)}
                disabled={saving}
                className="text-ieee-blue hover:underline font-medium disabled:opacity-60"
              >
                Cancel
              </button>
            </p>
          )}
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={saving}
        role="switch"
        aria-checked={shared}
        title={isPendingOff ? 'Sharing turns off soon — click Cancel to keep it on' : undefined}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${shared ? 'bg-ieee-blue' : 'bg-gray-300'} ${isPendingOff ? 'opacity-70' : ''}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shared ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
