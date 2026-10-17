import { motion } from 'motion/react'
import { Link } from 'react-router'
import type { ChampionId } from '../../data/types'
import { cn } from '../../lib/cn'
import { Rich } from '../ui/Rich'
import { Sigil } from './Sigil'

export interface LineupSlot {
  slot: string
  /** Champion cell exactly as the guide writes it. */
  text: string
  ids: ChampionId[]
  lines?: { label?: string; text: string }[]
  highlight?: boolean
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } } }

export function TeamLineup({ slots, className, cols = 5 }: { slots: LineupSlot[]; className?: string; cols?: 4 | 5 | 6 }) {
  const grid = { 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6' }[cols]
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3', grid, className)}
    >
      {slots.map((s, i) => (
        <motion.div
          key={`${s.slot}-${i}`}
          variants={item}
          whileHover={{ y: -3 }}
          className={cn(
            'card-flat group relative flex flex-col gap-3 p-4 transition-colors hover:border-gold-400/25 hover:bg-white/[0.04]',
            s.highlight && 'border-gold-400/30 bg-gold-400/[0.04]',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow text-gold-500/90">{s.slot}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {s.ids.map((id) => (
                <Link key={id} to={`/champions/${id}`} className="transition hover:z-10 hover:scale-105" title="Open champion">
                  <Sigil id={id} size={s.ids.length > 1 ? 40 : 46} />
                </Link>
              ))}
            </div>
            <Rich text={s.text} className="text-[0.92rem] leading-snug font-semibold text-fg" />
          </div>
          {s.lines && s.lines.length > 0 && (
            <div className="space-y-2 border-t border-white/[0.06] pt-3 text-[0.8rem] leading-relaxed text-fg-muted">
              {s.lines.map((l, j) =>
                l.text ? (
                  <div key={j}>
                    {l.label && <span className="mr-1 text-[0.68rem] font-bold tracking-wider text-fg-subtle uppercase">{l.label}</span>}
                    <Rich text={l.text} />
                  </div>
                ) : null,
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
