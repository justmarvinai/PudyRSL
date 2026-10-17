import { useEffect, useState } from 'react'
import { phases, type Phase } from '../data/roadmap'

const DAY = 86_400_000

/** Local calendar date as YYYY-MM-DD. */
export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Day 1 = the start date itself. 0 or less = the plan has not started yet. */
export function dayNumber(startIso: string, now: Date): number {
  const start = parseIsoDate(startIso)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((today.getTime() - start.getTime()) / DAY) + 1
}

export function inRange(day: number, range: [number, number | null]): boolean {
  return day >= range[0] && (range[1] === null || day <= range[1])
}

export function currentPhase(day: number): Phase | null {
  if (day < 1) return null
  return phases.find((p) => inRange(day, p.days)) ?? phases[phases.length - 1]
}

/** Daily period key: the local date, shifted back by the reset hour. */
export function dailyPeriod(now: Date, resetHour: number): string {
  return isoDate(new Date(now.getTime() - resetHour * 3_600_000))
}

/** Weekly period key: date of the latest reset weekday (at the reset hour). */
export function weeklyPeriod(now: Date, resetDay: number, resetHour: number): string {
  const shifted = new Date(now.getTime() - resetHour * 3_600_000)
  const back = (shifted.getDay() - resetDay + 7) % 7
  const start = new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate() - back)
  return isoDate(start)
}

export function nextDailyReset(now: Date, resetHour: number): Date {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), resetHour, 0, 0, 0)
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)
  return next
}

export function nextWeeklyReset(now: Date, resetDay: number, resetHour: number): Date {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), resetHour, 0, 0, 0)
  let add = (resetDay - now.getDay() + 7) % 7
  if (add === 0 && next.getTime() <= now.getTime()) add = 7
  next.setDate(next.getDate() + add)
  return next
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60_000))
  const d = Math.floor(total / 1440)
  const h = Math.floor((total % 1440) / 60)
  const m = total % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function formatLongDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

/** Re-renders on an interval so resets and day counters roll over live. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), intervalMs)
    const onFocus = () => setNow(new Date())
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(t)
      window.removeEventListener('focus', onFocus)
    }
  }, [intervalMs])
  return now
}
