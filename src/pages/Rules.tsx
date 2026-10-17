import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpRight,
  BookOpen,
  Bug,
  Coins,
  FlaskConical,
  Gem,
  KeyRound,
  NotebookPen,
  ShieldX,
  Skull,
  Snowflake,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/layout/PageHeader'
import { Check } from '../components/ui/Check'
import { ProgressRing } from '../components/ui/Progress'
import { Rich } from '../components/ui/Rich'
import { Card, SectionTitle } from '../components/ui/primitives'
import { dontRules, openQuestions } from '../data/rules'
import { cn } from '../lib/cn'
import { pct } from '../lib/format'
import { useStore } from '../lib/store'

const ruleIcon: Record<string, LucideIcon> = {
  brews: FlaskConical,
  tune: Skull,
  keys: KeyRound,
  tomes: BookOpen,
  feasts: Star,
  legendaries: Users,
  spider: Bug,
  ig: Snowflake,
  gems: Gem,
  plus16: Coins,
  sacrifice: ShieldX,
}

function QuestionRow({ id, text, to }: { id: string; text: string; to?: string }) {
  const q = useStore((s) => s.questions[id])
  const setQuestion = useStore((s) => s.setQuestion)
  const [open, setOpen] = useState(!!q?.note)
  return (
    <motion.div layout className={cn('rounded-xl border p-4 transition-colors', q?.verified ? 'border-ok/25 bg-ok/[0.03]' : 'border-white/[0.07] bg-white/[0.02]')}>
      <div className="flex items-start gap-3">
        <Check checked={!!q?.verified} onChange={(v) => setQuestion(id, { verified: v })} label="Checked in-game" />
        <div className="min-w-0 flex-1">
          <Rich as="div" text={text} className={cn('text-[0.86rem] leading-relaxed', q?.verified ? 'text-fg-subtle' : 'text-fg-muted')} />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-fg-subtle transition hover:text-fg"
            >
              <NotebookPen className="size-3.5" /> {q?.note ? 'Your finding' : 'Add what you found'}
            </button>
            {to && (
              <Link to={to} className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-400 hover:text-gold-300">
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
                  className="input mt-2 min-h-20 resize-y text-[0.82rem]"
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
    <div className="space-y-8">
      <PageHeader eyebrow="Sections 7 & 8" title="Rules & checks" intro="The guide's hard don'ts, and the open questions to check in-game before you rely on a number." />

      <section id="donts" className="scroll-mt-24">
        <SectionTitle eyebrow="Section 7" title="What not to do" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dontRules.map((r, i) => {
            const Icon = ruleIcon[r.id] ?? ShieldX
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3 }}
              >
                <Link to={r.to} className="group card spotlight flex h-full flex-col gap-3 p-4" onMouseMove={(e) => {
                  const el = e.currentTarget
                  const rect = el.getBoundingClientRect()
                  el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
                  el.style.setProperty('--my', `${e.clientY - rect.top}px`)
                }}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-bad/10 text-bad ring-1 ring-bad/25">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-[0.7rem] font-bold tracking-wider text-bad/90 uppercase">{r.topic}</span>
                  </div>
                  <p className="text-[0.86rem] leading-relaxed text-fg">{r.text}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-[0.72rem] font-semibold text-fg-subtle transition group-hover:text-gold-300">
                    Go to {r.topic} <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section id="open-questions" className="scroll-mt-24">
        <Card>
          <SectionTitle
            eyebrow="Section 8"
            title="Open questions to check in-game"
            action={
              <div className="flex items-center gap-3">
                <span className="text-sm text-fg-muted">
                  <span className="font-semibold text-fg tabular-nums">{verified}</span>/{openQuestions.length} checked
                </span>
                <ProgressRing value={pct(verified, openQuestions.length)} size={40} stroke={4} tone="ok" />
              </div>
            }
          />
          <div className="space-y-2.5">
            {openQuestions.map((q) => (
              <QuestionRow key={q.id} id={q.id} text={q.text} to={q.to} />
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
