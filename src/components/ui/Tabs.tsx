import { LayoutGroup, motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

export interface TabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  to?: string
}

/** Underlined tab bar; items with `to` render as links. */
export function TabBar({
  items,
  active,
  onSelect,
  className,
}: {
  items: TabItem[]
  active: string
  onSelect?: (key: string) => void
  className?: string
}) {
  const group = useId()
  return (
    <LayoutGroup id={group}>
      <div
        role="tablist"
        className={cn('-mx-1 flex gap-1 overflow-x-auto border-b border-white/[0.07] px-1 [scrollbar-width:none]', className)}
      >
        {items.map((it) => {
          const isActive = it.key === active
          const inner = (
            <>
              <span className={cn('inline-flex items-center gap-2', isActive ? 'text-fg' : 'text-fg-muted group-hover:text-fg')}>
                {it.icon}
                {it.label}
                {it.badge}
              </span>
              {isActive && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 shadow-[0_0_12px_rgb(246_196_99/0.7)]"
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                />
              )}
            </>
          )
          const cls = cn(
            'group relative shrink-0 rounded-t-lg px-3 py-2.5 text-[0.84rem] font-semibold whitespace-nowrap transition-colors',
            isActive ? '' : 'hover:bg-white/[0.03]',
          )
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
