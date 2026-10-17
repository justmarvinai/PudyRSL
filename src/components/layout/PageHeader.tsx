import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { cn } from '../../lib/cn'
import { LabelTag, Rich } from '../ui/Rich'
import { navItemFor } from './nav'

/** Page title block: section number + kicker, a huge display title, intro and actions. */
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
  const section = useLocation().pathname.split('/')[1] ?? ''
  const num = navItemFor(section)?.num
  return (
    <div className={cn('mb-10', className)}>
      <div className="t-label flex items-center gap-3 text-low">
        {num && <span className="text-hi">{num}</span>}
        <span className="h-px flex-1 bg-edge" />
        {eyebrow && <span>{eyebrow}</span>}
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="t-display mt-5 text-[clamp(2.3rem,5vw,4.4rem)] text-balance text-hi"
      >
        {title}
      </motion.h1>
      {(intro || label || actions) && (
        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-3xl min-w-0">
            {intro && <Rich as="p" text={intro} className="text-[0.95rem] leading-relaxed text-mid" />}
            {label && <LabelTag label={label} className="mt-2" />}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
