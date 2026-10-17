import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

export type SpeedStatus = 'empty' | 'ok' | 'slow' | 'fast'

export function speedStatus(value: number | null | undefined, min: number, max: number): SpeedStatus {
  if (value === null || value === undefined) return 'empty'
  if (value < min) return 'slow'
  if (value > max) return 'fast'
  return 'ok'
}

export function speedMessage(value: number | null | undefined, min: number, max: number): string {
  const st = speedStatus(value, min, max)
  if (st === 'empty') return 'Enter the true speed'
  if (st === 'ok') return 'In range'
  if (st === 'slow') return `${min - (value as number)} too slow`
  return `${(value as number) - max} too fast`
}

/** Horizontal gauge: target window in green, your value as a marker. */
export function SpeedGauge({ value, min, max, className }: { value: number | null | undefined; min: number; max: number; className?: string }) {
  const pad = Math.max(12, Math.round((max - min) * 2))
  const lo = min - pad
  const hi = max + pad
  const pos = (v: number) => ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * 100
  const st = speedStatus(value, min, max)
  return (
    <div className={cn('relative h-7', className)}>
      <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/[0.06]" />
      <div
        className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-ok/30 ring-1 ring-ok/60"
        style={{ left: `${pos(min)}%`, width: `${Math.max(1.5, pos(max) - pos(min))}%` }}
      />
      {value !== null && value !== undefined && (
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ left: `${pos(value)}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div
            className={cn(
              'size-3.5 rounded-full border-2 border-ink-950 shadow-[0_0_10px]',
              st === 'ok' ? 'bg-ok shadow-ok/70' : 'bg-bad shadow-bad/70',
            )}
          />
        </motion.div>
      )}
      {pos(max) - pos(min) < 12 ? (
        <div className="absolute -bottom-1.5 text-[0.6rem] text-fg-subtle tabular-nums" style={{ left: `${(pos(min) + pos(max)) / 2}%`, transform: 'translateX(-50%)' }}>
          {min === max ? min : `${min}–${max}`}
        </div>
      ) : (
        <>
          <div className="absolute -bottom-1.5 text-[0.6rem] text-fg-subtle tabular-nums" style={{ left: `${pos(min)}%`, transform: 'translateX(-50%)' }}>
            {min}
          </div>
          <div className="absolute -bottom-1.5 text-[0.6rem] text-fg-subtle tabular-nums" style={{ left: `${pos(max)}%`, transform: 'translateX(-50%)' }}>
            {max}
          </div>
        </>
      )}
    </div>
  )
}
