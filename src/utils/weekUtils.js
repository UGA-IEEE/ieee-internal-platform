import { startOfISOWeek, endOfISOWeek, isWithinInterval, parseISO, getISODay } from 'date-fns'

export const WEEKLY_TARGET = 35

export function getCurrentWeekRange() {
  const now = new Date()
  return {
    start: startOfISOWeek(now), // Monday
    end: endOfISOWeek(now),     // Sunday
  }
}

export function isInCurrentWeek(dateString) {
  const { start, end } = getCurrentWeekRange()
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return isWithinInterval(date, { start, end })
}

/**
 * Returns 'accepted' | 'completed' | 'on-track' | 'behind'
 * A student who has accepted an offer is no longer held to the weekly
 * quota. Otherwise uses daily pace: expected = ceil(dayOfWeek / 7 * target)
 * `target` defaults to the fixed FYC WEEKLY_TARGET but callers with a
 * per-member adjustable goal (e.g. the general tracker) can pass their own.
 */
export function getWeekStatus(weeklyCount, hasAcceptedOffer = false, target = WEEKLY_TARGET) {
  if (hasAcceptedOffer) return 'accepted'
  if (weeklyCount >= target) return 'completed'
  const dayOfWeek = getISODay(new Date()) // 1=Mon … 7=Sun
  const expectedByNow = Math.ceil((dayOfWeek / 7) * target)
  return weeklyCount >= expectedByNow ? 'on-track' : 'behind'
}

export function getExpectedByNow(target = WEEKLY_TARGET) {
  const dayOfWeek = getISODay(new Date())
  return Math.ceil((dayOfWeek / 7) * target)
}
