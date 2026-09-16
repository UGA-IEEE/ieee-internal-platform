import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isInCurrentWeek } from '../../utils/weekUtils'
import { WeeklyProgress } from './WeeklyProgress'
import { ApplicationTable } from './ApplicationTable'

export function PeerTrackerView() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: profileData }, { data: appData }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').eq('id', userId).single(),
        supabase.from('applications').select('*').eq('user_id', userId)
          .order('date_applied', { ascending: false })
          .order('created_at', { ascending: false }),
      ])
      setMember(profileData)
      setApplications(appData ?? [])
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-ieee-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
        This tracker isn't shared with you, or the member wasn't found.
      </div>
    )
  }

  const weeklyCount = applications.filter(a => isInCurrentWeek(a.date_applied)).length
  const hasAcceptedOffer = applications.some(a => a.status === 'accepted')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/fyc')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ieee-blue transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to My Tracker
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{member.full_name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{member.email}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800">{applications.length}</p>
          <p className="text-xs text-gray-400">total applications</p>
        </div>
      </div>

      <div className="max-w-sm mb-8">
        <WeeklyProgress weeklyCount={weeklyCount} hasAcceptedOffer={hasAcceptedOffer} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Applications</h2>
        <ApplicationTable
          applications={applications}
          onEdit={() => {}}
          onDeleted={() => {}}
          readOnly
        />
      </div>
    </div>
  )
}
