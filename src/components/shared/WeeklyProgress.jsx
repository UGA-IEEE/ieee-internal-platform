import { WEEKLY_TARGET, getWeekStatus, getExpectedByNow, getCurrentWeekRange } from '../../utils/weekUtils'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, CheckCircle, Award } from 'lucide-react'

const statusConfig = {
  accepted: {
    label: 'Accepted',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-500',
    Icon: Award,
  },
  completed: {
    label: 'Goal Reached!',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    bar: 'bg-green-500',
    Icon: CheckCircle,
  },
  'on-track': {
    label: 'On Track',
    color: 'text-ieee-blue',
    bg: 'bg-ieee-blue-light border-blue-200',
    bar: 'bg-ieee-blue',
    Icon: TrendingUp,
  },
  behind: {
    label: 'Behind',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    bar: 'bg-red-500',
    Icon: TrendingDown,
  },
}

export function WeeklyProgress({ weeklyCount, hasAcceptedOffer = false, weeklyTarget = WEEKLY_TARGET }) {
  const status = getWeekStatus(weeklyCount, hasAcceptedOffer, weeklyTarget)
  const expectedByNow = getExpectedByNow(weeklyTarget)
  const { start, end } = getCurrentWeekRange()
  const pct = Math.min((weeklyCount / weeklyTarget) * 100, 100)
  const { label, color, bg, bar, Icon } = statusConfig[status]

  return (
    <div className={`rounded-xl border p-5 ${bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">This Week</p>
          <p className="text-sm text-gray-400 mt-0.5">
            {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 font-semibold text-sm ${color}`}>
          <Icon size={16} />
          {label}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-end gap-1 mb-3">
        <span className={`text-4xl font-bold ${color}`}>{weeklyCount}</span>
        <span className="text-gray-400 text-lg mb-1">/ {weeklyTarget}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {hasAcceptedOffer
          ? "Weekly quotas no longer apply — congrats on the offer!"
          : <>Expected pace by today: <span className="font-semibold">{expectedByNow}</span></>}
      </p>
    </div>
  )
}
