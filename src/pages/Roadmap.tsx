import { motion } from 'motion/react'
import { CalendarDays, Check as CheckIcon, Flag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/layout/PageHeader'
import { TaskItem } from '../components/roadmap/TaskItem'
import { Toggle } from '../components/ui/Fields'
import { Burst } from '../components/ui/Overlay'
import { ProgressRing } from '../components/ui/Progress'
import { Pill } from '../components/ui/primitives'
import { phases, roadmapIntro, type Phase } from '../data/roadmap'
import { isTaskDone, phaseProgress } from '../lib/checks'
import { cn } from '../lib/cn'
import { currentPhase, dayNumber, formatLongDate, useNow } from '../lib/dates'
import { pct } from '../lib/format'
import { useStore } from '../lib/store'
import { toast } from '../lib/toast'

const dayLabel = (p: Phase) => {
  const [a, b] = p.days
  if (b === null) return `Day ${a}+`
  if (a === b) return `Day ${a}`
  return `Days ${a}–${b}`
}

function PhaseBlock({ phase, isCurrent, hideDone }: { phase: Phase; isCurrent: boolean; hideDone: boolean }) {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const st = { flags, nums }
  const { done, total } = phaseProgress(st, phase)
  const complete = done === total
  const [burst, setBurst] = useState(false)
  const prev = useRef(complete)

  useEffect(() => {
    if (complete && !prev.current) {
      setBurst(true)
      toast(`${phase.short} complete — great work!`)
    }
    prev.current = complete
  }, [complete, phase.short])

  const tasks = hideDone ? phase.tasks.filter((t) => !isTaskDone(st, t)) : phase.tasks

  return (
    <section id={phase.id} className="relative scroll-mt-24 pl-12 sm:pl-16">
      {/* timeline node */}
      <div className="absolute top-1 left-0 sm:left-2">
        <div className="relative">
          <Burst show={burst} onDone={() => setBurst(false)} />
          <motion.div
            className={cn(
              'grid size-9 place-items-center rounded-full border-2',
              complete
                ? 'border-gold-400 bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-[0_0_20px_rgb(246_196_99/0.6)]'
                : isCurrent
                  ? 'animate-pulse-ring border-gold-400 bg-ink-900 text-gold-300'
                  : 'border-white/15 bg-ink-900 text-fg-subtle',
            )}
            animate={complete ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {complete ? <CheckIcon className="size-4" strokeWidth={3} /> : <Flag className="size-4" />}
          </motion.div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold tracking-wide text-fg">{phase.title}</h2>
            {isCurrent && <Pill tone="gold">You are here</Pill>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-fg-subtle">
            <CalendarDays className="size-3.5" /> {dayLabel(phase)} from your start date
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-fg tabular-nums">
              {done}/{total}
            </div>
            <div className="text-[0.7rem] text-fg-subtle">tasks done</div>
          </div>
          <ProgressRing value={pct(done, total)} size={46} stroke={4}>
            <span className="text-[0.68rem] font-bold text-fg tabular-nums">{pct(done, total)}%</span>
          </ProgressRing>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} index={phase.ordered ? phase.tasks.indexOf(t) : undefined} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-gold-500/20 px-4 py-5 text-center text-sm text-gold-300/80 xl:col-span-2">All {phase.short} tasks are done.</div>
        )}
      </div>
    </section>
  )
}

export function Roadmap() {
  const now = useNow()
  const startDate = useStore((s) => s.startDate)
  const hideDone = useStore((s) => s.ui.hideDone)
  const setUi = useStore((s) => s.setUi)
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const day = dayNumber(startDate, now)
  const cur = currentPhase(day)
  const all = phases.flatMap((p) => p.tasks)
  const doneAll = all.filter((t) => isTaskDone({ flags, nums }, t)).length

  return (
    <div>
      <PageHeader
        eyebrow="Section 2 · Phased roadmap"
        title="Roadmap"
        intro={roadmapIntro}
        actions={
          <>
            <Toggle checked={hideDone} onChange={(v) => setUi({ hideDone: v })} label="Hide completed" />
          </>
        }
      >
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {phases.map((p) => {
            const pr = phaseProgress({ flags, nums }, p)
            return (
              <a
                key={p.id}
                href={`#${p.id}`}
                className={cn(
                  'group flex items-center gap-2.5 rounded-xl border px-3 py-2 transition',
                  cur?.id === p.id ? 'border-gold-400/35 bg-gold-400/[0.07]' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15',
                )}
              >
                <ProgressRing value={pct(pr.done, pr.total)} size={28} stroke={3} />
                <span>
                  <span className="block text-[0.8rem] font-semibold text-fg">{p.short}</span>
                  <span className="block text-[0.68rem] text-fg-subtle tabular-nums">
                    {pr.done}/{pr.total} done
                  </span>
                </span>
              </a>
            )
          })}
          <div className="ml-auto text-right text-xs text-fg-subtle">
            Started {formatLongDate(startDate)} ·{' '}
            <Link to="/settings" className="text-gold-400 hover:text-gold-300">
              change
            </Link>
            <div className="mt-0.5 text-fg-muted">
              <span className="font-semibold text-fg tabular-nums">{doneAll}</span> of {all.length} roadmap tasks done
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="relative space-y-12">
        <div aria-hidden className="absolute top-3 bottom-3 left-[17px] w-px bg-gradient-to-b from-gold-500/50 via-white/10 to-transparent sm:left-[25px]" />
        {phases.map((p) => (
          <PhaseBlock key={p.id} phase={p} isCurrent={cur?.id === p.id} hideDone={hideDone} />
        ))}
      </div>
    </div>
  )
}
