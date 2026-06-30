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
 * Returns 'completed' | 'on-track' | 'behind'
 * Uses daily pace: expected = ceil(dayOfWeek / 7 * 35)
 */
export function getWeekStatus(weeklyCount) {
  if (weeklyCount >= WEEKLY_TARGET) return 'completed'
  const dayOfWeek = getISODay(new Date()) // 1=Mon … 7=Sun
  const expectedByNow = Math.ceil((dayOfWeek / 7) * WEEKLY_TARGET)
  return weeklyCount >= expectedByNow ? 'on-track' : 'behind'
}

export function getExpectedByNow() {
  const dayOfWeek = getISODay(new Date())
  return Math.ceil((dayOfWeek / 7) * WEEKLY_TARGET)
}
