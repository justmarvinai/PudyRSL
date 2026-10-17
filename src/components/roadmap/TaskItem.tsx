import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { CheckRef, RoadmapTask } from '../../data/roadmap'
import { allDone, isRefDone, taskRefs } from '../../lib/checks'
import { cn } from '../../lib/cn'
import { useStore } from '../../lib/store'
import { Check } from '../ui/Check'
import { Rich } from '../ui/Rich'

export function useTaskState(task: RoadmapTask) {
  const refs = taskRefs(task)
  const done = useStore((s) => allDone(s, refs))
  const partial = useStore((s) => !done && refs.some((r) => isRefDone(s, r)))
  const setRefs = useStore((s) => s.setRefs)
  return { done, partial, toggle: (v: boolean) => setRefs(refs, v) }
}

function SubtaskRow({ label, refs }: { label: string; refs: CheckRef[] }) {
  const done = useStore((s) => allDone(s, refs))
  const setRefs = useStore((s) => s.setRefs)
  return (
    <li className="flex items-center gap-2.5">
      <Check size="sm" checked={done} onChange={(v) => setRefs(refs, v)} label={label} />
      <button
        type="button"
        onClick={() => setRefs(refs, !done)}
        className={cn('text-left text-[0.8rem] transition-colors', done ? 'text-fg-subtle line-through decoration-white/20' : 'text-fg-muted hover:text-fg')}
      >
        {label}
      </button>
    </li>
  )
}

export function TaskItem({
  task,
  index,
  compact = false,
  defaultOpen = false,
}: {
  task: RoadmapTask
  index?: number
  compact?: boolean
  defaultOpen?: boolean
}) {
  const { done, partial, toggle } = useTaskState(task)
  const [open, setOpen] = useState(defaultOpen)
  const subDone = useStore((s) => (task.subtasks ? task.subtasks.filter((st) => allDone(s, st.refs)).length : 0))

  return (
    <motion.div
      id={task.id}
      layout="position"
      className={cn(
        'group relative scroll-mt-28 rounded-xl border transition-colors',
        compact ? 'p-3' : 'p-4',
        done ? 'border-white/[0.04] bg-white/[0.015]' : 'border-white/[0.07] bg-white/[0.025] hover:border-gold-400/20 hover:bg-white/[0.04]',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <Check checked={done} partial={partial} onChange={toggle} label="Mark task done" />
          {index !== undefined && <span className="text-[0.62rem] font-bold text-fg-subtle tabular-nums">{index + 1}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <Rich
            as="div"
            text={task.text}
            className={cn('leading-relaxed transition-opacity', compact ? 'text-[0.82rem]' : 'text-[0.875rem]', done ? 'text-fg-subtle opacity-70' : 'text-fg-muted')}
          />
          {(task.subtasks || task.to) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {task.subtasks && (
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-black/20 px-2 py-1 text-[0.72rem] font-semibold text-fg-muted transition hover:border-gold-400/30 hover:text-fg"
                >
                  <span className="tabular-nums">
                    {subDone}/{task.subtasks.length}
                  </span>
                  steps
                  <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
                </button>
              )}
              {task.to && (
                <Link
                  to={task.to}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.72rem] font-semibold text-gold-400/90 transition hover:bg-gold-400/10 hover:text-gold-300"
                >
                  Open <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          )}
          <AnimatePresence initial={false}>
            {open && task.subtasks && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-2 space-y-1.5 overflow-hidden border-l border-white/[0.08] pl-3"
              >
                {task.subtasks.map((st) => (
                  <SubtaskRow key={st.label} label={st.label} refs={st.refs} />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
