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
        className={cn('text-left text-[0.82rem] transition-colors', done ? 'text-low line-through decoration-edge-2' : 'text-mid hover:text-hi')}
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
        'group relative scroll-mt-28 rounded-[3px] border transition-colors',
        compact ? 'p-3' : 'px-4 py-3.5',
        done ? 'border-edge bg-transparent' : 'border-edge bg-raised-2 hover:border-edge-2',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          <Check checked={done} partial={partial} onChange={toggle} label="Mark task done" />
          {index !== undefined && <span className="t-num text-[0.66rem] text-low">{String(index + 1).padStart(2, '0')}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <Rich
            as="div"
            text={task.text}
            className={cn('leading-relaxed transition-opacity', compact ? 'text-[0.84rem]' : 'text-[0.9rem]', done ? 'text-low opacity-60 [&_*]:!text-low' : 'text-mid')}
          />
          {(task.subtasks || task.to) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {task.subtasks && (
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="inline-flex h-6 items-center gap-1.5 rounded-[3px] border border-edge-2 px-2 text-[0.72rem] font-bold text-mid transition-colors hover:border-mid hover:text-hi"
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
                  className="inline-flex h-6 items-center gap-1 rounded-[3px] px-2 text-[0.72rem] font-bold text-hi transition-colors hover:bg-raised-3"
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
                className="mt-2.5 space-y-1.5 overflow-hidden border-l border-edge-2 pl-3"
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
