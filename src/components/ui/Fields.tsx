import { LayoutGroup, motion } from 'motion/react'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Number input that commits on blur/Enter and accepts empty = null. */
export function NumberField({
  value,
  onChange,
  placeholder,
  min,
  max,
  className,
  suffix,
  label,
  allowEmpty = true,
  inputClassName,
}: {
  value: number | null | undefined
  onChange: (v: number | null) => void
  placeholder?: string
  min?: number
  max?: number
  className?: string
  suffix?: ReactNode
  label?: string
  allowEmpty?: boolean
  inputClassName?: string
}) {
  const show = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v))
  const [text, setText] = useState(show(value))
  useEffect(() => setText(show(value)), [value])

  const commit = () => {
    const t = text.trim().replace(/,/g, '')
    if (t === '') {
      if (allowEmpty) onChange(null)
      else setText(show(value))
      return
    }
    let n = Number(t)
    if (!Number.isFinite(n)) {
      setText(show(value))
      return
    }
    if (min !== undefined) n = Math.max(min, n)
    if (max !== undefined) n = Math.min(max, n)
    onChange(n)
    setText(String(n))
  }

  return (
    <label className={cn('block', className)}>
      {label && <span className="t-label mb-1.5 block text-low">{label}</span>}
      <span className="relative block">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          className={cn('input tabular-nums', suffix ? 'pr-9' : '', inputClassName)}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs font-semibold text-low">{suffix}</span>}
      </span>
    </label>
  )
}

/** − value + counter. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max,
  className,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const btn = 'grid size-7 place-items-center text-mid transition-colors hover:bg-raised-3 hover:text-hi disabled:opacity-25'
  return (
    <div className={cn('inline-flex h-7 items-stretch overflow-hidden rounded-[3px] border border-edge-2', className)}>
      <button type="button" aria-label="Decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className={btn}>
        <Minus className="size-3.5" />
      </button>
      <span className="grid min-w-11 place-items-center border-x border-edge-2 px-1.5 text-[0.8rem] font-bold text-hi tabular-nums">
        <motion.span key={value} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {value}
          {max !== undefined && <span className="font-medium text-low">/{max}</span>}
        </motion.span>
      </span>
      <button type="button" aria-label="Increase" disabled={max !== undefined && value >= max} onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)} className={btn}>
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

export function Toggle({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; className?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn('group inline-flex items-center gap-2.5 text-[0.84rem] text-mid', className)}>
      <span className={cn('relative flex h-[18px] w-8 shrink-0 items-center rounded-[3px] border px-[2px] transition-colors', checked ? 'justify-end border-paper bg-paper' : 'justify-start border-edge-2')}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 38 }} className={cn('size-3 rounded-[2px]', checked ? 'bg-ink' : 'bg-mid')} />
      </span>
      {label && <span className="group-hover:text-hi">{label}</span>}
    </button>
  )
}

export interface SegOption<T extends string | number> {
  value: T
  label: ReactNode
  color?: string
}

/** Segmented control; options can carry a colour (e.g. difficulty). */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: SegOption<T>[]
  className?: string
  size?: 'sm' | 'md'
}) {
  const group = useId()
  return (
    <LayoutGroup id={group}>
      <div className={cn('inline-flex flex-wrap items-stretch rounded-[4px] border border-edge-2 p-[3px]', className)}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'relative rounded-[2px] font-bold transition-colors',
                size === 'sm' ? 'px-2.5 py-1 text-[0.72rem]' : 'px-3 py-1.5 text-[0.78rem]',
                active ? 'text-ink' : 'text-mid hover:text-hi',
              )}
              style={!active && o.color ? ({ color: o.color } as CSSProperties) : undefined}
            >
              {active && (
                <motion.span
                  layoutId="seg"
                  className="absolute inset-0 rounded-[2px]"
                  style={{ background: o.color ?? 'var(--color-paper)' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">{o.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  className?: string
  label?: string
}) {
  return (
    <label className={cn('block', className)}>
      {label && <span className="t-label mb-1.5 block text-low">{label}</span>}
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value as T)} className="input cursor-pointer appearance-none pr-8">
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-raised">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-low" />
      </span>
    </label>
  )
}

/** Row of clickable blocks for a 0…max count (stages, floors). Clicking the current top block steps back one. */
export function SegmentPicker({
  value,
  max,
  onChange,
  color = 'var(--color-paper)',
  marks,
  label,
  className,
}: {
  value: number
  max: number
  onChange: (v: number) => void
  color?: string
  marks?: number[]
  label: string
  className?: string
}) {
  return (
    <div className={cn('flex gap-[3px]', className)} role="group" aria-label={label}>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1
        const on = n <= value
        const mark = marks?.includes(n)
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? n - 1 : n)}
            title={`${n}`}
            aria-label={`${label} ${n}`}
            aria-pressed={on}
            className={cn('relative h-7 min-w-0 flex-1 rounded-[2px] transition-colors', !on && 'bg-white/[0.07] hover:bg-white/[0.16]')}
            style={on ? ({ background: color } as CSSProperties) : undefined}
          >
            {mark && <span className={cn('absolute -bottom-2 left-1/2 h-1 w-px -translate-x-1/2', on ? 'bg-hi' : 'bg-mid')} />}
          </button>
        )
      })}
    </div>
  )
}
