import { LayoutGroup, motion } from 'motion/react'
import { useId, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

export interface TabItem {
  key: string
  label: ReactNode
  badge?: ReactNode
  /** Colour for the active underline (defaults to paper). */
  color?: string
  to?: string
}

/** Big uppercase tabs with a sliding underline; items with `to` are links. */
export function TabBar({ items, active, onSelect, className }: { items: TabItem[]; active: string; onSelect?: (key: string) => void; className?: string }) {
  const group = useId()
  return (
    <LayoutGroup id={group}>
      <div role="tablist" className={cn('-mx-1 flex gap-1 overflow-x-auto border-b border-edge-2 px-1 [scrollbar-width:none]', className)}>
        {items.map((it) => {
          const isActive = it.key === active
          const inner = (
            <>
              <span className={cn('inline-flex items-center gap-2', isActive ? 'text-hi' : 'text-low group-hover:text-mid')}>
                {it.color && <span className="dot" style={{ '--c': it.color } as CSSProperties} />}
                {it.label}
                {it.badge}
              </span>
              {isActive && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-[3px]"
                  style={{ background: it.color ?? 'var(--color-paper)' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                />
              )}
            </>
          )
          const cls = 'group relative shrink-0 px-3 pt-2 pb-3 text-[0.8rem] font-extrabold tracking-[0.04em] whitespace-nowrap uppercase [font-stretch:108%]'
          return it.to ? (
            <Link key={it.key} to={it.to} role="tab" aria-selected={isActive} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={it.key} type="button" role="tab" aria-selected={isActive} className={cls} onClick={() => onSelect?.(it.key)}>
              {inner}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
