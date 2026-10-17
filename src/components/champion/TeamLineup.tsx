import { motion } from 'motion/react'
import { Link } from 'react-router'
import type { ChampionId } from '../../data/types'
import { cn } from '../../lib/cn'
import { Rich } from '../ui/Rich'
import { Portrait } from './Portrait'

export interface LineupSlot {
  slot: string
  /** Champion cell exactly as the guide writes it. */
  text: string
  ids: ChampionId[]
  lines?: { label?: string; text: string }[]
  highlight?: boolean
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } } }

export function TeamLineup({ slots, className, cols = 5 }: { slots: LineupSlot[]; className?: string; cols?: 4 | 5 | 6 }) {
  const grid = { 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6' }[cols]
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3', grid, className)}>
      {slots.map((s, i) => (
        <motion.div
          key={`${s.slot}-${i}`}
          variants={item}
          className={cn('panel relative flex flex-col gap-3 p-4 transition-colors hover:border-edge-2', s.highlight && 'border-edge-2 bg-raised-2')}
          style={s.highlight ? { boxShadow: 'inset 0 3px 0 var(--color-paper)' } : undefined}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="t-label text-low">{/^\d+$/.test(s.slot) ? `Slot ${s.slot}` : s.slot}</span>
            <span className="t-num text-[0.78rem] text-edge-2">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-3">
            {s.ids.length > 0 && (
              <div className="flex shrink-0 gap-1">
                {s.ids.map((id) => (
                  <Link key={id} to={`/champions/${id}`} data-tip={`champ:${id}`} className="transition-transform hover:-translate-y-0.5">
                    <Portrait id={id} size={s.ids.length > 1 ? 36 : 44} />
                  </Link>
                ))}
              </div>
            )}
            <Rich text={s.text} className="text-[0.92rem] leading-snug font-semibold text-hi" />
          </div>
          {s.lines && s.lines.length > 0 && (
            <div className="space-y-2 border-t border-edge pt-3 text-[0.8rem] leading-relaxed text-mid">
              {s.lines.map((l, j) =>
                l.text ? (
                  <div key={j}>
                    {l.label && <span className="t-label mr-1.5 text-low">{l.label}</span>}
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
