import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ChevronRight, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export function SharedTrackers() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [peers, setPeers] = useState([])
  const [loading, setLoading] = useState(true)
  const isSharing = !!profile?.share_progress_general

  useEffect(() => {
    if (!isSharing) {
      setPeers([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('can_access_general_tracker', true)
        .eq('share_progress_general', true)
        .neq('id', user.id)
        .order('full_name')

      if (!error) setPeers(data)
      setLoading(false)
    }
    load()
  }, [user, isSharing])

  if (loading) return null

  if (!isSharing) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-5 flex items-center gap-3 mb-8 text-gray-500">
        <Lock size={18} className="text-gray-400 shrink-0" />
        <p className="text-sm">
          Turn on sharing above to see other members who are also sharing their tracker. Sharing is reciprocal — you can only view trackers from members who can see yours.
        </p>
      </div>
    )
  }

  if (peers.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-ieee-blue" />
        <h2 className="text-lg font-semibold text-gray-800">Members Sharing Their Tracker</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{peers.length}</span>
      </div>

      <div className="divide-y divide-gray-100">
        {peers.map(peer => (
          <button
            key={peer.id}
            onClick={() => navigate(`/tracker/member/${peer.id}`)}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{peer.full_name}</p>
              <p className="text-xs text-gray-400">{peer.email}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  )
}
