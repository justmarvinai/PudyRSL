import { LayoutGroup, motion } from 'motion/react'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Number input that commits on blur/Enter and accepts empty = null. */
export function NumberField({
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
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
  step?: number
  className?: string
  suffix?: ReactNode
  label?: string
  allowEmpty?: boolean
  inputClassName?: string
}) {
  const [text, setText] = useState(value === null || value === undefined ? '' : String(value))
  useEffect(() => {
    setText(value === null || value === undefined ? '' : String(value))
  }, [value])

  const commit = () => {
    const t = text.trim().replace(/,/g, '')
    if (t === '') {
      if (allowEmpty) onChange(null)
      else setText(value === null || value === undefined ? '' : String(value))
      return
    }
    let n = Number(t)
    if (!Number.isFinite(n)) {
      setText(value === null || value === undefined ? '' : String(value))
      return
    }
    if (min !== undefined) n = Math.max(min, n)
    if (max !== undefined) n = Math.min(max, n)
    onChange(n)
    setText(String(n))
  }

  return (
    <label className={cn('relative block', className)}>
      {label && <span className="eyebrow mb-1 block">{label}</span>}
      <span className="relative block">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          step={step}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          className={cn('input tabular-nums', suffix ? 'pr-10' : '', inputClassName)}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-xs text-fg-subtle">{suffix}</span>}
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
  size = 'md',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const btn = size === 'sm' ? 'size-6' : 'size-7'
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-0.5', className)}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn('grid place-items-center rounded-md text-fg-muted transition hover:bg-white/10 hover:text-fg disabled:opacity-30', btn)}
      >
        <Minus className="size-3.5" />
      </button>
      <motion.span
        key={value}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="min-w-7 text-center text-sm font-semibold text-fg tabular-nums"
      >
        {value}
        {max !== undefined && <span className="text-fg-subtle">/{max}</span>}
      </motion.span>
      <button
        type="button"
        aria-label="Increase"
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className={cn('grid place-items-center rounded-md text-fg-muted transition hover:bg-white/10 hover:text-fg disabled:opacity-30', btn)}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('group inline-flex items-center gap-2.5 text-sm text-fg-muted', className)}
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-200',
          checked ? 'justify-end border-gold-400/70 bg-gold-500/40' : 'justify-start border-white/15 bg-white/[0.06]',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={cn('size-3.5 rounded-full shadow', checked ? 'bg-gold-200' : 'bg-fg-subtle')}
        />
      </span>
      {label && <span className="group-hover:text-fg">{label}</span>}
    </button>
  )
}

export interface SegOption<T extends string | number> {
  value: T
  label: ReactNode
}

/** Segmented control with a sliding highlight. */
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
      <div className={cn('inline-flex flex-wrap items-center gap-0.5 rounded-xl border border-white/[0.08] bg-black/25 p-1', className)}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'relative rounded-lg font-semibold transition-colors',
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[0.8rem]',
                active ? 'text-ink-950' : 'text-fg-muted hover:text-fg',
              )}
            >
              {active && (
                <motion.span
                  layoutId="seg"
                  className="absolute inset-0 rounded-lg bg-gradient-to-b from-gold-300 to-gold-500 shadow-[0_4px_16px_-6px_rgb(232_168_58/0.7)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
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
      {label && <span className="eyebrow mb-1 block">{label}</span>}
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value as T)} className="input cursor-pointer appearance-none pr-8">
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-850">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-subtle" />
      </span>
    </label>
  )
}
