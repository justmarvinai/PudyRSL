import { Check, Minus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

const cssVar = (c: string) => ({ '--c': c }) as CSSProperties

/** One cell of the 13-champion table, styled by its symbol. */
export function CoverageCell({ value, full = false, color }: { value: string; full?: boolean; color?: string }) {
  const v = value.trim()
  if (v === '✓')
    return (
      <span title="Core slot" className="inline-grid size-6 place-items-center rounded-[3px] text-ink" style={{ background: color ?? 'var(--color-paper)' }}>
        <Check className="size-3.5" strokeWidth={3.2} />
      </span>
    )
  if (v === '(✓)')
    return (
      <span title="Flex/swap slot" className="inline-grid size-6 place-items-center rounded-[3px] border-[1.5px]" style={{ borderColor: color ?? 'var(--color-paper)', color: color ?? 'var(--color-paper)' }}>
        <Check className="size-3.5" strokeWidth={2.8} />
      </span>
    )
  if (v === '–')
    return (
      <span title="Not used here" className="inline-grid size-6 place-items-center text-edge-2">
        <Minus className="size-3.5" />
      </span>
    )
  if (v === 'K2')
    return (
      <span title="Fills Hydra keys 2–3" className="tag" style={cssVar('var(--color-hydra)')}>
        K2
      </span>
    )
  if (v === 'UK')
    return (
      <span title="Budget Maneater Unkillable team" className="tag" style={cssVar('var(--color-cb)')}>
        UK
      </span>
    )
  const positive = v.startsWith('✓')
  const uk = v.startsWith('UK')
  const off = v.startsWith('–')
  return (
    <span
      title={v}
      className={cn('tag h-auto min-h-6 py-0.5 leading-tight normal-case tracking-normal', full ? 'whitespace-normal' : 'max-w-[7.5rem] truncate')}
      style={cssVar(uk ? 'var(--color-cb)' : positive ? (color ?? 'var(--color-paper)') : off ? 'var(--color-low)' : 'var(--color-mid)')}
    >
      {v}
    </span>
  )
}

/** Compact content marker for card rows, coloured by content when used. */
export function CoverageDot({ value, label, color }: { value: string; label: string; color: string }) {
  const v = value.trim()
  const on = v !== '–' && !v.startsWith('–')
  const core = v === '✓' || v.startsWith('✓') || v.startsWith('UK') || v === 'Starter lead (not in UK)'
  return (
    <span
      title={`${label}: ${v}`}
      className={cn('tag h-[1.15rem] px-1.5 text-[0.58rem]', !on && 'border-transparent bg-transparent text-edge-2')}
      style={on ? ({ ...cssVar(color), ...(core ? null : { background: 'transparent' }) } as CSSProperties) : undefined}
    >
      {label}
    </span>
  )
}
