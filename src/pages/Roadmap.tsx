import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/layout/PageHeader'
import { TaskItem } from '../components/roadmap/TaskItem'
import { Toggle } from '../components/ui/Fields'
import { Segments } from '../components/ui/Progress'
import { Tag } from '../components/ui/primitives'
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

function PhaseBlock({ phase, index, isCurrent, hideDone }: { phase: Phase; index: number; isCurrent: boolean; hideDone: boolean }) {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const st = { flags, nums }
  const { done, total } = phaseProgress(st, phase)
  const complete = done === total
  const prev = useRef(complete)

  useEffect(() => {
    if (complete && !prev.current) toast(`${phase.short} complete — great work!`)
    prev.current = complete
  }, [complete, phase.short])

  const tasks = hideDone ? phase.tasks.filter((t) => !isTaskDone(st, t)) : phase.tasks

  return (
    <section id={phase.id} className="scroll-mt-24 border-t border-edge-2 pt-6">
      <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-start gap-4 lg:block">
            <motion.div
              className={cn('t-display text-[4.2rem] leading-[0.8] lg:text-[5.2rem]', complete ? 'text-ok' : isCurrent ? 'text-hi' : 'text-edge-2')}
              animate={complete ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.45 }}
            >
              {String(index + 1).padStart(2, '0')}
            </motion.div>
            <div className="min-w-0 lg:mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="t-label text-low">{dayLabel(phase)}</span>
                {isCurrent && (
                  <Tag color="var(--color-paper)" solid>
                    You are here
                  </Tag>
                )}
                {complete && <Tag color="var(--color-ok)">Complete</Tag>}
              </div>
              <h2 className="t-headline mt-2 text-[1.45rem] text-hi">{phase.title}</h2>
              <div className="mt-3 text-[0.78rem] text-low tabular-nums">
                <span className="font-bold text-hi">{done}</span>/{total} tasks · {pct(done, total)}%
              </div>
              <Segments value={done} total={total} className="mt-2" height={5} color={complete ? 'var(--color-ok)' : 'var(--color-paper)'} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 content-start gap-2 xl:grid-cols-2">
          {tasks.map((t) => (
            <TaskItem key={t.id} task={t} index={phase.ordered ? phase.tasks.indexOf(t) : undefined} />
          ))}
          {tasks.length === 0 && (
            <div className="well px-4 py-5 text-center text-sm font-semibold text-ok xl:col-span-2" style={{ boxShadow: 'inset 3px 0 0 var(--color-ok)' }}>
              All {phase.short} tasks are done.
            </div>
          )}
        </div>
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
      <PageHeader eyebrow="Section 2 · Phased roadmap" title="Roadmap" intro={roadmapIntro} actions={<Toggle checked={hideDone} onChange={(v) => setUi({ hideDone: v })} label="Hide completed" />}>
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-edge bg-edge md:grid-cols-4">
          {phases.map((p, i) => {
            const pr = phaseProgress({ flags, nums }, p)
            const isCur = cur?.id === p.id
            const complete = pr.done === pr.total
            return (
              <a key={p.id} href={`#${p.id}`} className={cn('group block px-4 py-3.5 transition-colors', isCur ? 'bg-raised-3' : 'bg-raised hover:bg-raised-2')}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn('t-num text-[1.5rem]', complete ? 'text-ok' : isCur ? 'text-hi' : 'text-low')}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[0.7rem] text-low tabular-nums">
                    {pr.done}/{pr.total}
                  </span>
                </div>
                <div className="mt-1 truncate text-[0.86rem] font-bold text-hi">{p.short}</div>
                <Segments value={pr.done} total={pr.total} className="mt-2" height={3} color={complete ? 'var(--color-ok)' : 'var(--color-paper)'} />
              </a>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.76rem] text-low">
          <span>
            Started {formatLongDate(startDate)} ·{' '}
            <Link to="/settings" className="font-bold text-hi underline decoration-edge-2 underline-offset-4 hover:decoration-paper">
              change
            </Link>
          </span>
          <span>
            <span className="font-bold text-hi tabular-nums">{doneAll}</span> of {all.length} roadmap tasks done
          </span>
        </div>
      </PageHeader>

      <div className="space-y-14">
        {phases.map((p, i) => (
          <PhaseBlock key={p.id} phase={p} index={i} isCurrent={cur?.id === p.id} hideDone={hideDone} />
        ))}
      </div>
    </div>
  )
}
