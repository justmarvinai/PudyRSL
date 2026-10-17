import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  children,
  className,
  tone = 'gold',
}: {
  /** 0–100 */
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
  className?: string
  tone?: 'gold' | 'ok' | 'epic' | 'info'
}) {
  const id = 'ring' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  const stops = {
    gold: ['#ffe2a1', '#e8a83a'],
    ok: ['#9ff5cf', '#2fc987'],
    epic: ['#dcc2ff', '#9b5cff'],
    info: ['#bcd8ff', '#4f8cff'],
  }[tone]
  return (
    <div className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.07)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (v / 100) * c }}
          transition={{ type: 'spring', stiffness: 60, damping: 16 }}
          style={{ filter: v > 0 ? `drop-shadow(0 0 6px ${stops[1]}55)` : undefined }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function ProgressBar({
  value,
  className,
  tone = 'gold',
  height = 6,
  markers,
}: {
  value: number
  className?: string
  tone?: 'gold' | 'ok' | 'epic' | 'info' | 'warn' | 'bad'
  height?: number
  /** Percent positions for tick marks. */
  markers?: number[]
}) {
  const v = Math.max(0, Math.min(100, value))
  const fill = {
    gold: 'from-gold-300 to-gold-600',
    ok: 'from-[#9ff5cf] to-ok',
    epic: 'from-[#dcc2ff] to-epic',
    info: 'from-[#bcd8ff] to-info',
    warn: 'from-[#ffe3a6] to-warn',
    bad: 'from-[#ffb3b3] to-bad',
  }[tone]
  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-white/[0.06]', className)} style={{ height }}>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r', fill)}
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ type: 'spring', stiffness: 70, damping: 18 }}
      />
      {markers?.map((m) => (
        <span key={m} className="absolute top-0 h-full w-px bg-white/25" style={{ left: `${m}%` }} />
      ))}
    </div>
  )
}

/** Counts smoothly to the next value. */
export function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString('en-US') }: { value: number; format?: (n: number) => string }) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => format(v))
  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, mv, reduce])
  return <motion.span className="tabular-nums">{text}</motion.span>
}
