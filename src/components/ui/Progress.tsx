import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { cn } from '../../lib/cn'

/** Segmented progress: one block per item (falls back to a bar above 40). */
export function Segments({
  value,
  total,
  color = 'var(--color-paper)',
  className,
  height = 6,
  marks,
}: {
  value: number
  total: number
  color?: string
  className?: string
  height?: number
  /** Item numbers (1-based) to mark, e.g. milestones. */
  marks?: number[]
}) {
  if (total > 40) return <Bar value={total ? (value / total) * 100 : 0} color={color} className={className} height={height} />
  return (
    <div className={cn('flex w-full gap-[2px]', className)} style={{ height }}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < value
        const mark = marks?.includes(i + 1)
        return (
          <motion.span
            key={i}
            className="relative flex-1 rounded-[1px]"
            initial={false}
            animate={{ backgroundColor: on ? color : 'rgb(255 255 255 / 0.08)' }}
            transition={{ duration: 0.25, delay: on ? i * 0.012 : 0 }}
          >
            {mark && <span className="absolute -top-1 left-1/2 h-1 w-px -translate-x-1/2 bg-mid" />}
          </motion.span>
        )
      })}
    </div>
  )
}

/** Thin continuous bar; `low` draws a tick (e.g. the low end of a budget range). */
export function Bar({
  value,
  color = 'var(--color-paper)',
  className,
  height = 4,
  ticks,
}: {
  /** 0–100 */
  value: number
  color?: string
  className?: string
  height?: number
  ticks?: number[]
}) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('relative w-full overflow-hidden rounded-[1px] bg-white/[0.08]', className)} style={{ height }}>
      <motion.div className="h-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      {ticks?.map((t) => (
        <span key={t} className="absolute top-0 h-full w-px bg-mid" style={{ left: `${t}%` }} />
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
    const controls = animate(mv, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, mv, reduce])
  return <motion.span>{text}</motion.span>
}
