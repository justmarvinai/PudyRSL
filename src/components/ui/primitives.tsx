import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { LabelTag, Rich } from './Rich'

type PanelProps = Omit<HTMLMotionProps<'div'>, 'title'> & {
  title?: ReactNode
  /** Small label above the title. */
  kicker?: ReactNode
  label?: string
  action?: ReactNode
  /** Colour bar on the left edge (CSS colour). */
  accent?: string
  padded?: boolean
  bodyClassName?: string
}

/** Flat bordered surface with an optional header row. */
export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { title, kicker, label, action, accent, padded = true, className, bodyClassName, children, style, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={cn('panel relative', className)}
      style={{ ...(accent ? { boxShadow: `inset 3px 0 0 ${accent}` } : null), ...(style as CSSProperties) }}
      {...rest}
    >
      {(title || action || kicker) && (
        <div className="panel-head">
          <div className="min-w-0">
            {kicker && <div className="t-label mb-1 text-low">{kicker}</div>}
            {title && (
              <h3 className="t-title flex flex-wrap items-center gap-2 text-[1.02rem] text-hi">
                {title}
                {label && <LabelTag label={label} />}
              </h3>
            )}
          </div>
          {action}
        </div>
      )}
      {padded ? <div className={cn('panel-body', bodyClassName)}>{children as ReactNode}</div> : (children as ReactNode)}
    </motion.div>
  )
})

/** Big section heading with an optional index number. */
export function SectionHead({
  index,
  title,
  label,
  intro,
  action,
  id,
  className,
}: {
  index?: string
  title: ReactNode
  label?: string
  intro?: string
  action?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <div id={id} className={cn('mb-5 flex scroll-mt-24 flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-3xl min-w-0">
        <h2 className="t-headline flex items-baseline gap-x-3 text-[1.65rem] text-balance text-hi sm:text-[1.9rem]">
          {index && <span className="t-num shrink-0 text-[0.9em] text-low">{index}</span>}
          <span className="min-w-0">
            {title}
            {label && <LabelTag label={label} className="relative -top-[0.2em] ml-2.5" />}
          </span>
        </h2>
        {intro && <Rich as="p" text={intro} className="mt-2 text-[0.92rem] leading-relaxed text-mid" />}
      </div>
      {action}
    </div>
  )
}

/** Coloured tag; pass any CSS colour (e.g. var(--color-epic)). */
export function Tag({ color, children, className, solid = false, title }: { color?: string; children: ReactNode; className?: string; solid?: boolean; title?: string }) {
  return (
    <span title={title} className={cn('tag', solid && 'tag-solid', className)} style={color ? ({ '--c': color } as CSSProperties) : undefined}>
      {children}
    </span>
  )
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cn('kbd', className)}>{children}</kbd>
}

const calloutColor = {
  info: 'var(--color-buff)',
  tip: 'var(--color-paper)',
  warn: 'var(--color-warn)',
  danger: 'var(--color-bad)',
}

const calloutLabel = { info: 'Note', tip: 'Tip', warn: 'Careful', danger: "Don't" }

/** Flat note with a coloured edge and a short label. */
export function Callout({
  tone = 'info',
  title,
  text,
  children,
  className,
}: {
  tone?: keyof typeof calloutColor
  title?: string
  text?: string
  children?: ReactNode
  className?: string
}) {
  const c = calloutColor[tone]
  return (
    <div className={cn('well px-4 py-3 text-[0.86rem] leading-relaxed text-mid', className)} style={{ boxShadow: `inset 3px 0 0 ${c}` }}>
      <div className="t-label mb-1" style={{ color: c }}>
        {title ?? calloutLabel[tone]}
      </div>
      {text && <Rich text={text} />}
      {children}
    </div>
  )
}

/** Label + big number + note, used in stat strips. */
export function Stat({ label, value, sub, className, color }: { label: ReactNode; value: ReactNode; sub?: ReactNode; className?: string; color?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="t-label text-low">{label}</div>
      <div className="t-num mt-2 text-[2rem] sm:text-[2.3rem]" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className="mt-1.5 text-[0.75rem] text-low">{sub}</div>}
    </div>
  )
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <div className="rounded-[3px] border border-dashed border-edge-2 px-4 py-6 text-center text-sm text-low">{children}</div>
}
