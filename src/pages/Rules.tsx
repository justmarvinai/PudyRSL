import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, NotebookPen } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/layout/PageHeader'
import { Check } from '../components/ui/Check'
import { Segments } from '../components/ui/Progress'
import { Rich } from '../components/ui/Rich'
import { SectionHead } from '../components/ui/primitives'
import { dontRules, openQuestions } from '../data/rules'
import { cn } from '../lib/cn'
import { useStore } from '../lib/store'

function QuestionRow({ id, index, text, to }: { id: string; index: number; text: string; to?: string }) {
  const q = useStore((s) => s.questions[id])
  const setQuestion = useStore((s) => s.setQuestion)
  const [open, setOpen] = useState(!!q?.note)
  const verified = !!q?.verified
  return (
    <motion.div
      layout
      className={cn('rounded-[3px] border px-4 py-3.5 transition-colors', verified ? 'border-edge' : 'border-edge bg-raised-2')}
      style={verified ? { boxShadow: 'inset 3px 0 0 var(--color-ok)' } : undefined}
    >
      <div className="flex items-start gap-3">
        <span className={cn('t-num w-6 shrink-0 pt-0.5 text-[0.85rem]', verified ? 'text-ok' : 'text-low')}>{String(index + 1).padStart(2, '0')}</span>
        <Check checked={verified} onChange={(v) => setQuestion(id, { verified: v })} label="Checked in-game" />
        <div className="min-w-0 flex-1">
          <Rich as="div" text={text} className={cn('text-[0.88rem] leading-relaxed', verified ? 'text-low' : 'text-mid')} />
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setOpen((o) => !o)} className="t-label inline-flex items-center gap-1.5 text-low transition-colors hover:text-hi">
              <NotebookPen className="size-3.5" /> {q?.note ? 'Your finding' : 'Add what you found'}
            </button>
            {to && (
              <Link to={to} className="t-label inline-flex items-center gap-1 text-mid transition-colors hover:text-hi">
                Related <ArrowUpRight className="size-3.5" />
              </Link>
            )}
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <textarea
                  defaultValue={q?.note ?? ''}
                  onBlur={(e) => setQuestion(id, { note: e.target.value })}
                  placeholder="What did you see in-game?"
                  className="input mt-2 min-h-20 resize-y text-[0.84rem]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export function Rules() {
  const questions = useStore((s) => s.questions)
  const verified = openQuestions.filter((q) => questions[q.id]?.verified).length
  return (
    <div className="space-y-16">
      <PageHeader eyebrow="Sections 7 & 8" title="Rules & checks" intro="The guide's hard don'ts, and the open questions to check in-game before you rely on a number." />

      <section id="donts" className="scroll-mt-24">
        <SectionHead index="07" title="What not to do" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dontRules.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
              <Link
                to={r.to}
                className="panel group flex h-full flex-col gap-3 p-5 transition-colors hover:border-edge-2 hover:bg-raised-2"
                style={{ boxShadow: 'inset 0 3px 0 var(--color-bad)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="t-label text-bad">{r.topic}</span>
                  <span className="t-num text-[0.85rem] text-edge-2">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <Rich as="p" text={r.text} links={false} className="text-[0.9rem] leading-relaxed text-hi" />
                <span className="t-label mt-auto inline-flex items-center gap-1 pt-1 text-low transition-colors group-hover:text-hi">
                  Go to {r.topic} <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="open-questions" className="scroll-mt-24">
        <SectionHead
          index="08"
          title="Open questions to check in-game"
          action={
            <div className="w-52">
              <div className="mb-1.5 flex items-baseline justify-between text-[0.78rem] text-low">
                <span className="t-label">Checked</span>
                <span>
                  <span className="font-bold text-hi tabular-nums">{verified}</span>/{openQuestions.length}
                </span>
              </div>
              <Segments value={verified} total={openQuestions.length} color="var(--color-ok)" height={6} />
            </div>
          }
        />
        <div className="space-y-1.5">
          {openQuestions.map((q, i) => (
            <QuestionRow key={q.id} id={q.id} index={i} text={q.text} to={q.to} />
          ))}
        </div>
      </section>
    </div>
  )
}
