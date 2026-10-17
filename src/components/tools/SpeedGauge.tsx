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
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-white/[0.08]" />
      <div
        className="absolute top-1/2 h-2.5 -translate-y-1/2 bg-ok/35 outline outline-1 outline-ok"
        style={{ left: `${pos(min)}%`, width: `${Math.max(1.5, pos(max) - pos(min))}%` }}
      />
      {value !== null && value !== undefined && (
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ left: `${pos(value)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className={cn('h-4 w-[5px] rounded-[1px] outline outline-2 outline-base', st === 'ok' ? 'bg-ok' : 'bg-bad')} />
        </motion.div>
      )}
      {pos(max) - pos(min) < 12 ? (
        <div className="absolute -bottom-1.5 text-[0.6rem] font-semibold text-low tabular-nums" style={{ left: `${(pos(min) + pos(max)) / 2}%`, transform: 'translateX(-50%)' }}>
          {min === max ? min : `${min}–${max}`}
        </div>
      ) : (
        <>
          <div className="absolute -bottom-1.5 text-[0.6rem] font-semibold text-low tabular-nums" style={{ left: `${pos(min)}%`, transform: 'translateX(-50%)' }}>
            {min}
          </div>
          <div className="absolute -bottom-1.5 text-[0.6rem] font-semibold text-low tabular-nums" style={{ left: `${pos(max)}%`, transform: 'translateX(-50%)' }}>
            {max}
          </div>
        </>
      )}
    </div>
  )
}
