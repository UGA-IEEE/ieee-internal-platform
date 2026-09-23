import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Users, TrendingDown, FileText, ClipboardList, ChevronRight, KeyRound, Trash2, Check, Minus, ImageIcon, UserX, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { isInCurrentWeek, getWeekStatus, WEEKLY_TARGET } from '../../utils/weekUtils'
import { CreateMemberModal } from './CreateMemberModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { EditAccessModal } from './EditAccessModal'

const STATUS_STYLES = {
  accepted:   'bg-emerald-100 text-emerald-800',
  completed:  'bg-green-100 text-green-700',
  'on-track': 'bg-blue-100 text-ieee-blue',
  behind:     'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  accepted:   'Accepted',
  completed:  'Completed',
  'on-track': 'On Track',
  behind:     'Behind',
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon size={18} className="text-gray-600" />
        </div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function PermissionToggle({ value, onChange, title }) {
  return (
    <button
      onClick={onChange}
      title={title}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
        value
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
    >
      {value ? <Check size={13} /> : <Minus size={13} />}
    </button>
  )
}

function RowActions({ member, onReset, onDelete, onEditAccess, onView }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => onEditAccess(member)}
        className="text-gray-400 hover:text-ieee-blue transition-colors"
        title="Edit access"
      >
        <ShieldCheck size={15} />
      </button>
      <button
        onClick={() => onReset(member)}
        className="text-gray-400 hover:text-ieee-blue transition-colors"
        title="Reset password"
      >
        <KeyRound size={15} />
      </button>
      <button
        onClick={() => onDelete(member)}
        className="text-gray-400 hover:text-red-500 transition-colors"
        title="Delete account"
      >
        <Trash2 size={15} />
      </button>
      {onView && (
        <button
          onClick={() => onView(member)}
          className="text-gray-400 hover:text-ieee-blue transition-colors"
          title="View applications"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const [members, setMembers] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [editAccessTarget, setEditAccessTarget] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [membersRes, adminsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select(`id, full_name, email, role, can_access_mediagen, can_access_fyc, can_access_general_tracker, weekly_goal, hidden_from_peers, applications (id, date_applied, status), general_applications (id, date_applied, status)`)
        .eq('role', 'member')
        .order('full_name'),
      supabase
        .from('profiles')
        .select(`id, full_name, email, role, can_access_general_tracker`)
        .eq('role', 'admin')
        .order('full_name'),
    ])

    if (!membersRes.error) {
      setMembers(membersRes.data.map(m => {
        const statusBreakdown = m.applications.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] ?? 0) + 1
          return acc
        }, {})
        const generalStatusBreakdown = m.general_applications.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] ?? 0) + 1
          return acc
        }, {})
        return {
          ...m,
          weeklyCount: m.applications.filter(a => isInCurrentWeek(a.date_applied)).length,
          totalCount: m.applications.length,
          statusBreakdown,
          offerCount: (statusBreakdown.offered ?? 0) + (statusBreakdown.accepted ?? 0),
          hasAcceptedOffer: (statusBreakdown.accepted ?? 0) > 0,
          generalWeeklyCount: m.general_applications.filter(a => isInCurrentWeek(a.date_applied)).length,
          generalTotalCount: m.general_applications.length,
          generalStatusBreakdown,
          generalOfferCount: (generalStatusBreakdown.offered ?? 0) + (generalStatusBreakdown.accepted ?? 0),
          generalHasAcceptedOffer: (generalStatusBreakdown.accepted ?? 0) > 0,
        }
      }))
    }
    if (!adminsRes.error) setAdmins(adminsRes.data)
    setLoading(false)
  }

  async function handleTogglePermission(memberId, field, currentValue) {
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: !currentValue })
      .eq('id', memberId)
    if (!error) {
      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, [field]: !currentValue } : m
      ))
      setAdmins(prev => prev.map(a =>
        a.id === memberId ? { ...a, [field]: !currentValue } : a
      ))
      if (memberId === profile?.id) await refreshProfile()
    }
  }

  async function handleDelete(member) {
    if (!window.confirm(`Delete ${member.full_name}'s account and ALL their data? This cannot be undone.`)) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: member.id }),
        }
      )
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to delete user')
      }
      setMembers(prev => prev.filter(m => m.id !== member.id))
      setAdmins(prev => prev.filter(a => a.id !== member.id))
    } catch (err) {
      alert(err.message)
    }
  }

  function handleAccessSaved(memberId, updates) {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m))
  }

  const fycMembers = members.filter(m => m.can_access_fyc)
  const generalTrackerMembers = members.filter(m => m.can_access_general_tracker)
  const mediagenMembers = members.filter(m => m.can_access_mediagen)
  const unassignedMembers = members.filter(m => !m.can_access_fyc && !m.can_access_mediagen && !m.can_access_general_tracker)

  const totalWeeklyApps = fycMembers.reduce((s, m) => s + m.weeklyCount, 0)
  const behind = fycMembers.filter(m => getWeekStatus(m.weeklyCount, m.hasAcceptedOffer) === 'behind')
  const completed = fycMembers.filter(m => m.weeklyCount >= WEEKLY_TARGET)

  const totalGeneralWeeklyApps = generalTrackerMembers.reduce((s, m) => s + m.generalWeeklyCount, 0)
  const generalBehind = generalTrackerMembers.filter(m => getWeekStatus(m.generalWeeklyCount, m.generalHasAcceptedOffer, m.weekly_goal) === 'behind')
  const generalCompleted = generalTrackerMembers.filter(m => m.generalWeeklyCount >= m.weekly_goal)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-ieee-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-ieee-blue hover:bg-ieee-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          Create Member
        </button>
      </div>

      {/* ── Admins ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-ieee-blue" />
          <h2 className="text-lg font-semibold text-gray-800">Admins</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{admins.length}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-center font-medium">Non-FYC Tracker</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400">
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          {admin.full_name}
                          <span className="text-xs bg-ieee-blue/10 text-ieee-blue px-1.5 py-0.5 rounded font-medium">Admin</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PermissionToggle
                            value={!!admin.can_access_general_tracker}
                            onChange={() => handleTogglePermission(admin.id, 'can_access_general_tracker', !!admin.can_access_general_tracker)}
                            title={admin.can_access_general_tracker ? 'Turn off non-FYC tracker' : 'Turn on non-FYC tracker'}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResetTarget(admin)}
                            className="text-gray-400 hover:text-ieee-blue transition-colors"
                            title="Reset password"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FYC Internship App Tracker ─────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-ieee-blue" />
          <h2 className="text-lg font-semibold text-gray-800">FYC Internship App Tracker</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{fycMembers.length}</span>
        </div>

        {/* FYC summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard icon={Users} label="FYC Members" value={fycMembers.length} />
          <StatCard icon={FileText} label="Apps This Week" value={totalWeeklyApps} sub="across all FYC members" />
          <StatCard
            icon={TrendingDown}
            label="Behind This Week"
            value={behind.length}
            color={behind.length > 0 ? 'text-red-600' : 'text-gray-800'}
          />
          <StatCard
            icon={FileText}
            label="Hit Goal This Week"
            value={completed.length}
            sub={`of ${fycMembers.length} members`}
            color={completed.length > 0 ? 'text-green-600' : 'text-gray-800'}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-center font-medium">Access</th>
                  <th className="px-6 py-3 text-center font-medium">This Week</th>
                  <th className="px-6 py-3 text-center font-medium">Total</th>
                  <th className="px-6 py-3 text-center font-medium">Interviews</th>
                  <th className="px-6 py-3 text-center font-medium">Offers</th>
                  <th className="px-6 py-3 text-center font-medium">Accepted</th>
                  <th className="px-6 py-3 text-center font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fycMembers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-gray-400">
                      No FYC members yet.
                    </td>
                  </tr>
                ) : (
                  fycMembers.map(member => {
                    const status = getWeekStatus(member.weeklyCount, member.hasAcceptedOffer)
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{member.full_name}</td>
                        <td className="px-6 py-4 text-gray-500">{member.email}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <PermissionToggle
                              value={member.can_access_fyc}
                              onChange={() => handleTogglePermission(member.id, 'can_access_fyc', member.can_access_fyc)}
                              title={member.can_access_fyc ? 'Revoke FYC access' : 'Grant FYC access'}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold">{member.weeklyCount}</span>
                          <span className="text-gray-400">/{WEEKLY_TARGET}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold">{member.totalCount}</td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {member.statusBreakdown.interview ?? 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={member.offerCount > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                            {member.offerCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={member.hasAcceptedOffer ? 'text-emerald-600 font-semibold' : 'text-gray-400'}>
                            {member.statusBreakdown.accepted ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
                            {STATUS_LABELS[status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <RowActions
                            member={member}
                            onReset={setResetTarget}
                            onDelete={handleDelete}
                            onEditAccess={setEditAccessTarget}
                            onView={m => navigate(`/admin/member/${m.id}`)}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Internship Application Tracker (non-FYC) ─────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={18} className="text-ieee-blue" />
          <h2 className="text-lg font-semibold text-gray-800">Internship App Tracker (Non-FYC)</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{generalTrackerMembers.length}</span>
        </div>

        {/* summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard icon={Users} label="Tracker Members" value={generalTrackerMembers.length} />
          <StatCard icon={FileText} label="Apps This Week" value={totalGeneralWeeklyApps} sub="across all tracker members" />
          <StatCard
            icon={TrendingDown}
            label="Behind This Week"
            value={generalBehind.length}
            color={generalBehind.length > 0 ? 'text-red-600' : 'text-gray-800'}
          />
          <StatCard
            icon={FileText}
            label="Hit Goal This Week"
            value={generalCompleted.length}
            sub={`of ${generalTrackerMembers.length} members`}
            color={generalCompleted.length > 0 ? 'text-green-600' : 'text-gray-800'}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-center font-medium">Access</th>
                  <th className="px-6 py-3 text-center font-medium">This Week</th>
                  <th className="px-6 py-3 text-center font-medium">Total</th>
                  <th className="px-6 py-3 text-center font-medium">Interviews</th>
                  <th className="px-6 py-3 text-center font-medium">Offers</th>
                  <th className="px-6 py-3 text-center font-medium">Accepted</th>
                  <th className="px-6 py-3 text-center font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {generalTrackerMembers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-gray-400">
                      No tracker members yet.
                    </td>
                  </tr>
                ) : (
                  generalTrackerMembers.map(member => {
                    const status = getWeekStatus(member.generalWeeklyCount, member.generalHasAcceptedOffer, member.weekly_goal)
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{member.full_name}</td>
                        <td className="px-6 py-4 text-gray-500">{member.email}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <PermissionToggle
                              value={member.can_access_general_tracker}
                              onChange={() => handleTogglePermission(member.id, 'can_access_general_tracker', member.can_access_general_tracker)}
                              title={member.can_access_general_tracker ? 'Revoke tracker access' : 'Grant tracker access'}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold">{member.generalWeeklyCount}</span>
                          <span className="text-gray-400">/{member.weekly_goal}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold">{member.generalTotalCount}</td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {member.generalStatusBreakdown.interview ?? 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={member.generalOfferCount > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                            {member.generalOfferCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={member.generalHasAcceptedOffer ? 'text-emerald-600 font-semibold' : 'text-gray-400'}>
                            {member.generalStatusBreakdown.accepted ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
                            {STATUS_LABELS[status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <RowActions
                            member={member}
                            onReset={setResetTarget}
                            onDelete={handleDelete}
                            onEditAccess={setEditAccessTarget}
                            onView={m => navigate(`/admin/general-member/${m.id}`)}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── MediaGen ───────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon size={18} className="text-uga-red" />
          <h2 className="text-lg font-semibold text-gray-800">MediaGen</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{mediagenMembers.length}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-center font-medium">Access</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mediagenMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400">
                      No MediaGen members yet.
                    </td>
                  </tr>
                ) : (
                  mediagenMembers.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{member.full_name}</td>
                      <td className="px-6 py-4 text-gray-500">{member.email}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PermissionToggle
                            value={member.can_access_mediagen}
                            onChange={() => handleTogglePermission(member.id, 'can_access_mediagen', member.can_access_mediagen)}
                            title={member.can_access_mediagen ? 'Revoke MediaGen access' : 'Grant MediaGen access'}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RowActions
                          member={member}
                          onReset={setResetTarget}
                          onDelete={handleDelete}
                          onEditAccess={setEditAccessTarget}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Unassigned ─────────────────────────────────────────────── */}
      {unassignedMembers.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <UserX size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800">Unassigned</h2>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">{unassignedMembers.length} no access</span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-center font-medium">MediaGen</th>
                    <th className="px-6 py-3 text-center font-medium">FYC Tracker</th>
                    <th className="px-6 py-3 text-center font-medium">Non-FYC Tracker</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unassignedMembers.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{member.full_name}</td>
                      <td className="px-6 py-4 text-gray-500">{member.email}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PermissionToggle
                            value={false}
                            onChange={() => handleTogglePermission(member.id, 'can_access_mediagen', false)}
                            title="Grant MediaGen access"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PermissionToggle
                            value={false}
                            onChange={() => handleTogglePermission(member.id, 'can_access_fyc', false)}
                            title="Grant FYC Tracker access"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <PermissionToggle
                            value={false}
                            onChange={() => handleTogglePermission(member.id, 'can_access_general_tracker', false)}
                            title="Grant Non-FYC Tracker access"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RowActions
                          member={member}
                          onReset={setResetTarget}
                          onDelete={handleDelete}
                          onEditAccess={setEditAccessTarget}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {showCreate && (
        <CreateMemberModal
          onClose={() => setShowCreate(false)}
          onCreated={newUser => {
            setMembers(prev => [...prev, {
              ...newUser,
              weekly_goal: newUser.weekly_goal ?? 10,
              hidden_from_peers: false,
              applications: [],
              weeklyCount: 0,
              totalCount: 0,
              statusBreakdown: {},
              offerCount: 0,
              hasAcceptedOffer: false,
              general_applications: [],
              generalWeeklyCount: 0,
              generalTotalCount: 0,
              generalStatusBreakdown: {},
              generalOfferCount: 0,
              generalHasAcceptedOffer: false,
            }].sort((a, b) => a.full_name.localeCompare(b.full_name)))
            setShowCreate(false)
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          member={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}

      {editAccessTarget && (
        <EditAccessModal
          member={editAccessTarget}
          onClose={() => setEditAccessTarget(null)}
          onSaved={handleAccessSaved}
        />
      )}
    </div>
  )
}
