import { Check, Minus } from 'lucide-react'
import { cn } from '../../lib/cn'

/** One cell of the 13-champion table, styled by its symbol. */
export function CoverageCell({ value, full = false }: { value: string; full?: boolean }) {
  const v = value.trim()
  if (v === '✓')
    return (
      <span title="Core slot" className="inline-grid size-6 place-items-center rounded-md bg-gradient-to-b from-gold-300 to-gold-600 text-ink-950 shadow-[0_0_10px_-2px_rgb(246_196_99/0.6)]">
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    )
  if (v === '(✓)')
    return (
      <span title="Flex/swap slot" className="inline-grid size-6 place-items-center rounded-md border border-gold-400/60 text-gold-300">
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
    )
  if (v === '–')
    return (
      <span title="Not used here" className="inline-grid size-6 place-items-center text-fg-subtle/50">
        <Minus className="size-3.5" />
      </span>
    )
  if (v === 'K2')
    return (
      <span title="Fills Hydra keys 2–3" className="inline-flex h-6 items-center rounded-md border border-epic/40 bg-epic/10 px-1.5 text-[0.68rem] font-bold text-epic">
        K2
      </span>
    )
  if (v === 'UK')
    return (
      <span title="Budget Maneater Unkillable team" className="inline-flex h-6 items-center rounded-md border border-mythical/40 bg-mythical/10 px-1.5 text-[0.68rem] font-bold text-mythical">
        UK
      </span>
    )
  const positive = v.startsWith('✓')
  const uk = v.startsWith('UK')
  return (
    <span
      title={v}
      className={cn(
        'inline-flex min-h-6 items-center rounded-md border px-1.5 py-0.5 text-[0.68rem] leading-tight font-semibold',
        full ? 'whitespace-normal' : 'max-w-[7.5rem] truncate whitespace-nowrap',
        uk
          ? 'border-mythical/35 bg-mythical/[0.08] text-mythical'
          : positive
            ? 'border-gold-400/40 bg-gold-400/[0.08] text-gold-300'
            : v.startsWith('–')
              ? 'border-white/10 bg-white/[0.03] text-fg-subtle'
              : 'border-info/30 bg-info/[0.07] text-info',
      )}
    >
      {v}
    </span>
  )
}

/** Compact dot for card rows. */
export function CoverageDot({ value, label }: { value: string; label: string }) {
  const v = value.trim()
  const on = v !== '–' && !v.startsWith('–')
  const core = v === '✓' || v.startsWith('✓') || v.startsWith('UK') || v === 'Starter lead (not in UK)'
  return (
    <span
      title={`${label}: ${v}`}
      className={cn(
        'inline-flex h-5 items-center rounded-[5px] px-1.5 text-[0.6rem] font-bold tracking-wide uppercase',
        !on && 'bg-white/[0.025] text-fg-subtle/40',
        on && core && 'bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/30',
        on && !core && 'bg-white/[0.06] text-fg-muted ring-1 ring-white/10',
      )}
    >
      {label}
    </span>
  )
}
