import { Link, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, ShieldCheck, FileText, ClipboardList, ImageIcon, KeyRound, Receipt } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const isAdmin = profile?.role === 'admin'
  const canFyc = !isAdmin && profile?.can_access_fyc
  const canGeneralTracker = !!profile?.can_access_general_tracker
  const canMediagen = isAdmin || profile?.can_access_mediagen

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-ieee-blue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-bold text-lg tracking-tight hover:text-white/90 transition-colors">
              UGA IEEE
            </Link>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Internal Platform</span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard size={15} />
              Home
            </Link>

            {canFyc && (
              <Link
                to="/fyc"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FileText size={15} />
                FYC Tracker
              </Link>
            )}

            {canGeneralTracker && (
              <Link
                to="/tracker"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ClipboardList size={15} />
                Application Tracker
              </Link>
            )}

            {canMediagen && (
              <Link
                to="/mediagen"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ImageIcon size={15} />
                MediaGen
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/reimbursement"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Receipt size={15} />
                Reimbursement
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ShieldCheck size={15} />
                Admin
              </Link>
            )}

            <div className="flex items-center gap-3 border-l border-white/30 pl-4 ml-2">
              <span className="text-sm font-medium">{profile?.full_name ?? 'Loading…'}</span>
              <Link
                to="/account/password"
                className="flex items-center hover:text-white/80 transition-colors"
                title="Change password"
              >
                <KeyRound size={16} />
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center hover:text-white/80 transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
