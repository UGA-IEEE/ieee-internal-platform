import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { isInCurrentWeek } from '../../utils/weekUtils'
import { WeeklyProgress } from './WeeklyProgress'
import { ApplicationTable } from './ApplicationTable'
import { ApplicationForm } from './ApplicationForm'

export function UserDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [user])

  async function fetchApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('date_applied', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error) setApplications(data)
    setLoading(false)
  }

  function handleSaved(app) {
    setApplications(prev => {
      const exists = prev.find(a => a.id === app.id)
      if (exists) return prev.map(a => a.id === app.id ? app : a)
      return [app, ...prev]
    })
    setShowForm(false)
    setEditTarget(null)
  }

  function handleEdit(app) {
    setEditTarget(app)
    setShowForm(true)
  }

  function handleDeleted(id) {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  const weeklyCount = applications.filter(a => isInCurrentWeek(a.date_applied)).length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-ieee-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Weekly progress */}
      <div className="max-w-sm mb-8">
        <WeeklyProgress weeklyCount={weeklyCount} />
      </div>

      {/* Applications section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My Applications</h2>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-ieee-blue hover:bg-ieee-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>

        <ApplicationTable
          applications={applications}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      </div>

      {showForm && (
        <ApplicationForm
          existing={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
