import { motion, type HTMLMotionProps } from 'motion/react'
import { Info, Lightbulb, OctagonAlert, TriangleAlert } from 'lucide-react'
import { forwardRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { LabelTag, Rich } from './Rich'

function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

type CardProps = HTMLMotionProps<'div'> & { spotlight?: boolean; padded?: boolean }

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, spotlight = false, padded = true, onMouseMove, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (spotlight) trackSpotlight(e)
        onMouseMove?.(e)
      }}
      className={cn('card', spotlight && 'spotlight', padded && 'p-5', className)}
      {...rest}
    >
      {children}
    </motion.div>
  )
})

export function SectionTitle({
  eyebrow,
  title,
  label,
  action,
  className,
  id,
}: {
  eyebrow?: string
  title: ReactNode
  label?: string
  action?: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={cn('mb-4 flex scroll-mt-24 flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="flex flex-wrap items-center gap-2 text-[1.05rem] font-semibold tracking-tight text-fg">
          {title}
          {label && <LabelTag label={label} />}
        </h2>
      </div>
      {action}
    </div>
  )
}

const pillTones = {
  neutral: 'border-white/10 bg-white/[0.04] text-fg-muted',
  gold: 'border-gold-500/30 bg-gold-500/10 text-gold-300',
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  bad: 'border-bad/30 bg-bad/10 text-bad',
  info: 'border-info/30 bg-info/10 text-info',
  rare: 'border-rare/35 bg-rare/10 text-rare',
  epic: 'border-epic/35 bg-epic/10 text-epic',
  legendary: 'border-legendary/35 bg-legendary/10 text-legendary',
  mythical: 'border-mythical/35 bg-mythical/10 text-mythical',
  magic: 'border-magic/35 bg-magic/10 text-magic',
  force: 'border-force/35 bg-force/10 text-force',
  spirit: 'border-spirit/35 bg-spirit/10 text-spirit',
  void: 'border-void/35 bg-void/10 text-void',
}

export type PillTone = keyof typeof pillTones

export function Pill({
  tone = 'neutral',
  children,
  className,
  icon,
  title,
}: {
  tone?: PillTone
  children: ReactNode
  className?: string
  icon?: ReactNode
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap',
        pillTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] px-1.5 font-sans text-[0.68rem] font-semibold text-fg-muted shadow-[inset_0_-1px_0_rgb(255_255_255/0.06)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

const calloutTones = {
  info: { icon: Info, cls: 'border-info/25 bg-info/[0.06]', ic: 'text-info' },
  tip: { icon: Lightbulb, cls: 'border-gold-500/25 bg-gold-500/[0.06]', ic: 'text-gold-400' },
  warn: { icon: TriangleAlert, cls: 'border-warn/25 bg-warn/[0.06]', ic: 'text-warn' },
  danger: { icon: OctagonAlert, cls: 'border-bad/25 bg-bad/[0.06]', ic: 'text-bad' },
}

export function Callout({
  tone = 'info',
  title,
  text,
  children,
  className,
}: {
  tone?: keyof typeof calloutTones
  title?: string
  text?: string
  children?: ReactNode
  className?: string
}) {
  const t = calloutTones[tone]
  const Icon = t.icon
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3 text-[0.84rem] leading-relaxed text-fg-muted', t.cls, className)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', t.ic)} />
      <div className="min-w-0">
        {title && <div className="mb-0.5 font-semibold text-fg">{title}</div>}
        {text && <Rich text={text} />}
        {children}
      </div>
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('hairline my-4', className)} />
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = 'gold',
  className,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  tone?: 'gold' | 'ok' | 'info' | 'warn' | 'epic' | 'bad'
  className?: string
}) {
  const ring = {
    gold: 'from-gold-500/25 text-gold-300',
    ok: 'from-ok/20 text-ok',
    info: 'from-info/20 text-info',
    warn: 'from-warn/20 text-warn',
    epic: 'from-epic/20 text-epic',
    bad: 'from-bad/20 text-bad',
  }[tone]
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {icon && (
        <div className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br to-transparent ring-1 ring-white/10', ring)}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="eyebrow">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tracking-tight text-fg tabular-nums">{value}</div>
        {sub && <div className="mt-0.5 text-xs text-fg-subtle">{sub}</div>}
      </div>
    </div>
  )
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-fg-subtle">{children}</div>
}
