import { Link } from 'react-router-dom'
import { FileText, ClipboardList, ImageIcon, Receipt } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const TOOLS = [
  {
    id: 'fyc',
    title: 'FYC Internship App Tracker',
    description: 'Track internship applications and monitor weekly progress toward your 35-app goal.',
    href: '/fyc',
    icon: <FileText size={28} />,
    permission: 'can_access_fyc',
  },
  {
    id: 'tracker',
    title: 'Internship Application Tracker',
    description: 'Track internship applications and monitor weekly progress toward a goal you set yourself.',
    href: '/tracker',
    icon: <ClipboardList size={28} />,
    permission: 'can_access_general_tracker',
    adminNeedsFlag: true,
  },
  {
    id: 'mediagen',
    title: 'MediaGen',
    description: 'Create branded social media graphics for IEEE events, recaps, and announcements.',
    href: '/mediagen',
    icon: <ImageIcon size={28} />,
    permission: 'can_access_mediagen',
  },
  {
    id: 'reimbursement',
    title: 'Reimbursement Forms',
    description: 'Fill out and generate UGA finance forms — CENGR, Dean of Students, travel, and more.',
    href: '/reimbursement',
    icon: <Receipt size={28} />,
    adminOnly: true,
  },
]

export function PlatformDashboard() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const available = TOOLS.filter(t => {
    if (t.adminOnly) return isAdmin
    if (isAdmin && !t.adminNeedsFlag) return true
    return !!profile?.[t.permission]
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.full_name ?? '…'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">UGA IEEE Internal Platform</p>
      </div>

      {available.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-500 text-sm">
            You don't have access to any tools yet.
          </p>
          <p className="text-gray-400 text-xs mt-1">Contact an IEEE admin to get access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {available.map(tool => (
            <Link
              key={tool.id}
              to={tool.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-ieee-blue/30 transition-all"
            >
              <div className="text-ieee-blue mb-4">{tool.icon}</div>
              <h2 className="text-base font-semibold text-gray-900 group-hover:text-ieee-blue transition-colors">
                {tool.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{tool.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
