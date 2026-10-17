import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { LabelTag, Rich } from '../ui/Rich'

export function PageHeader({
  eyebrow,
  title,
  intro,
  label,
  actions,
  className,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  intro?: string
  label?: string
  actions?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn('mb-7', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl min-w-0">
          {eyebrow && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="eyebrow mb-2 text-gold-500/90">
              {eyebrow}
            </motion.div>
          )}
          <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-wide text-fg sm:text-[2rem]">
            {title}
            {label && <LabelTag label={label} className="ml-2 align-middle" />}
          </h1>
          {intro && <Rich as="p" text={intro} className="mt-2.5 text-[0.92rem] leading-relaxed text-fg-muted" />}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
