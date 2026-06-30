import { WEEKLY_TARGET, getWeekStatus, getExpectedByNow, getCurrentWeekRange } from '../../utils/weekUtils'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'

const statusConfig = {
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

export function WeeklyProgress({ weeklyCount }) {
  const status = getWeekStatus(weeklyCount)
  const expectedByNow = getExpectedByNow()
  const { start, end } = getCurrentWeekRange()
  const pct = Math.min((weeklyCount / WEEKLY_TARGET) * 100, 100)
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
        <span className="text-gray-400 text-lg mb-1">/ {WEEKLY_TARGET}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Expected pace by today: <span className="font-semibold">{expectedByNow}</span>
      </p>
    </div>
  )
}
