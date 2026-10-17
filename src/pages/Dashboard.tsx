import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, CalendarClock, KeyRound, Lock, Plus, Trash, Unlock } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Portrait } from '../components/champion/Portrait'
import { TaskItem } from '../components/roadmap/TaskItem'
import { Check } from '../components/ui/Check'
import { NumberField } from '../components/ui/Fields'
import { AnimatedNumber, Segments } from '../components/ui/Progress'
import { Rich } from '../components/ui/Rich'
import { Panel } from '../components/ui/primitives'
import { champions } from '../data/champions'
import { difficultyNames } from '../data/clanBoss'
import { dungeons } from '../data/dungeons'
import { accountSnapshot, contentPriorities, guideMeta } from '../data/guide'
import { dailyLoops, phases, weeklyKeys, type RoadmapTask } from '../data/roadmap'
import { energy, masteries, unlocks } from '../data/resources'
import { dontRules, openQuestions } from '../data/rules'
import { championProgress, championStatus, isMaxLevel, isRankSix, isRefDone, isTaskDone, phaseProgress, stepRef, type CheckState } from '../lib/checks'
import { cn } from '../lib/cn'
import { currentPhase, dayNumber, formatCountdown, nextDailyReset, nextWeeklyReset, useNow } from '../lib/dates'
import { accountLevel, energySpent, gemsSpent, stageOf, tomesLeft } from '../lib/derived'
import { compact, fmt, pct } from '../lib/format'
import { difficultyColor, rarityColor, resourceIcon } from '../lib/rsl'
import { useDailyDone, useKeysUsed, useStore, useWeeklyCounts } from '../lib/store'

const rise = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.035 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
})

function nextTasks(st: CheckState, fromIndex: number, count: number): RoadmapTask[] {
  const out: RoadmapTask[] = []
  for (let i = Math.max(0, fromIndex); i < phases.length && out.length < count; i++) {
    for (const t of phases[i].tasks) {
      if (!isTaskDone(st, t)) out.push(t)
      if (out.length >= count) break
    }
  }
  return out
}

function Hero({ now }: { now: Date }) {
  const profileName = useStore((s) => s.profileName)
  const startDate = useStore((s) => s.startDate)
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const st = { flags, nums }
  const day = dayNumber(startDate, now)
  const phase = currentPhase(day)
  const phaseIdx = phase ? phases.indexOf(phase) : 0
  const prog = phase ? phaseProgress(st, phase) : phaseProgress(st, phases[0])
  const upNext = nextTasks(st, phaseIdx, 3)
  const hour = now.getHours()
  const greet = hour < 5 ? 'Late-night grind' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <section>
      <div className="t-label flex items-center gap-3 text-low">
        <span className="text-hi">01</span>
        <span className="h-px flex-1 bg-edge" />
        <span>
          {greet}, {profileName || 'Champion'}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 items-end gap-x-12 gap-y-6 lg:grid-cols-[auto_1fr]">
        <motion.div {...rise(0)} className="flex items-end gap-4">
          <div>
            <div className="t-label text-low">{day >= 1 ? 'Day' : 'Starts in'}</div>
            <div className="t-display mt-2 text-[clamp(6rem,13vw,10.5rem)] leading-[0.78] text-hi">
              {day >= 1 ? <AnimatedNumber value={day} /> : `${1 - day}D`}
            </div>
          </div>
        </motion.div>

        <motion.div {...rise(1)} className="min-w-0 pb-1">
          <div className="t-label text-low">{phase ? `Phase ${phaseIdx + 1} of ${phases.length} · ${phase.short}` : 'Before the plan starts'}</div>
          <h1 className="t-headline mt-2 text-[clamp(1.6rem,2.6vw,2.35rem)] text-balance text-hi">{phase ? phase.title : 'Your plan starts soon'}</h1>
          <Rich as="p" text={guideMeta.summary} className="mt-3 max-w-3xl text-[0.92rem] leading-relaxed text-mid" />
          <div className="mt-5 flex items-center gap-4">
            <Segments value={prog.done} total={prog.total} height={8} className="max-w-xl" />
            <span className="shrink-0 text-[0.8rem] font-bold text-hi tabular-nums">
              {prog.done}/{prog.total}
              <span className="ml-1.5 font-semibold text-low">{pct(prog.done, prog.total)}%</span>
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div {...rise(2)} className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="t-headline text-[1.35rem] text-hi">Next up</h2>
          <Link to="/roadmap" className="t-label inline-flex items-center gap-1 text-mid transition-colors hover:text-hi">
            Full roadmap <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {upNext.map((t, i) => (
              <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <TaskItem task={t} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
          {upNext.length === 0 && (
            <div className="well px-4 py-4 text-sm text-hi xl:col-span-3" style={{ boxShadow: 'inset 3px 0 0 var(--color-ok)' }}>
              Every roadmap task is done. Time for the luxury adds — see the bench on the Champions page.
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function StatCell({ to, label, value, sub, color }: { to: string; label: string; value: ReactNode; sub: ReactNode; color?: string }) {
  return (
    <Link to={to} className="group relative block min-w-0 bg-raised px-5 py-4 transition-colors hover:bg-raised-2">
      <div className="flex items-center justify-between gap-2">
        <span className="t-label truncate text-low group-hover:text-mid">{label}</span>
        <ArrowUpRight className="size-3.5 shrink-0 text-edge-2 transition-colors group-hover:text-hi" />
      </div>
      <div className="t-num mt-3 truncate text-[1.7rem] sm:text-[2.15rem]" style={{ color: color ?? 'var(--color-hi)' }}>
        {value}
      </div>
      <div className="mt-1.5 truncate text-[0.74rem] text-low">{sub}</div>
    </Link>
  )
}

function StatStrip() {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const st = { flags, nums }
  const keysUsed = useKeysUsed()
  const r6 = champions.filter((c) => isRankSix(st, c)).length
  const maxed = champions.filter((c) => isMaxLevel(st, c)).length
  const allTasks = phases.flatMap((p) => p.tasks)
  const tasksDone = allTasks.filter((t) => isTaskDone(st, t)).length
  const left = tomesLeft(nums)
  const energyLeft = energy.total - energySpent(nums)
  const gemsLeft = accountSnapshot.gems - gemsSpent(flags, nums)

  return (
    <motion.div {...rise(3)} className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-edge bg-edge md:grid-cols-3 xl:grid-cols-6">
      <StatCell
        to="/champions"
        label="Core 13 at Rank 6"
        value={
          <>
            <AnimatedNumber value={r6} />
            <span className="text-low">/13</span>
          </>
        }
        sub={`${maxed} at Lv 60`}
      />
      <StatCell
        to="/roadmap"
        label="Roadmap"
        color={tasksDone === allTasks.length ? 'var(--color-ok)' : undefined}
        value={
          <>
            <AnimatedNumber value={tasksDone} />
            <span className="text-low">/{allTasks.length}</span>
          </>
        }
        sub={`${pct(tasksDone, allTasks.length)}% of all tasks`}
      />
      <StatCell
        to="/clan-boss/demon-lord#key-planner"
        label="Stored CB keys"
        color="var(--color-cb)"
        value={<AnimatedNumber value={accountSnapshot.cbKeys - keysUsed} />}
        sub={`${keysUsed} used of ${accountSnapshot.cbKeys}`}
      />
      <StatCell to="/resources/energy" label="Energy budget left" value={<AnimatedNumber value={energyLeft} />} sub={`of ${fmt(energy.total)}`} />
      <StatCell
        to="/resources/gems"
        label="Gems left"
        color="var(--color-gems)"
        value={
          <span className="inline-flex items-center gap-2">
            <img src={resourceIcon.gems} alt="" className="size-6" />
            <AnimatedNumber value={gemsLeft} />
          </span>
        }
        sub="Keep ~4,500 for slots"
      />
      <StatCell
        to="/resources/tomes"
        label="Tomes left"
        value={
          <span className="inline-flex items-baseline gap-2.5">
            <span className="text-legendary">{left.legendary}</span>
            <span className="text-epic">{left.epic}</span>
            <span className="text-rare">{left.rare}</span>
          </span>
        }
        sub="Legendary · Epic · Rare"
      />
    </motion.div>
  )
}

function NextChampionSteps() {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const setRefs = useStore((s) => s.setRefs)
  const st = { flags, nums }
  const next = champions
    .map((c) => {
      const step = c.steps.find((x) => !isRefDone(st, stepRef(c.id, x)))
      return step ? { c, step } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 6)
  if (next.length === 0) return null
  return (
    <div className="mt-6 border-t border-edge pt-5">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="t-label text-hi">Next champion steps</span>
        <span className="text-[0.74rem] text-low">first open step per champion</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {next.map(({ c, step }) => (
            <motion.div
              key={`${c.id}-${step.key}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-[3px] border border-edge px-3 py-2 transition-colors hover:border-edge-2"
            >
              <Check size="sm" checked={false} onChange={(v) => setRefs([stepRef(c.id, step)], v)} label={step.text} />
              <Link to={`/champions/${c.id}`} data-tip={`champ:${c.id}`} className="shrink-0">
                <Portrait id={c.id} size={22} showAffinity={false} />
              </Link>
              <span className="min-w-0 flex-1 truncate text-[0.8rem] text-mid" title={step.text}>
                <span className="font-bold" style={{ color: rarityColor[c.rarity] }}>
                  {c.short}
                </span>{' '}
                {step.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CoreStrip() {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const st = { flags, nums }
  const waves: { label: string; note: string; ids: typeof champions }[] = [
    { label: 'Wave 1', note: 'Days 1–3 · 8 Rank 6s', ids: champions.filter((c) => c.wave === 1) },
    { label: 'Wave 2', note: 'Weeks 2–6 · 5 more', ids: champions.filter((c) => c.wave === 2) },
  ]
  return (
    <Panel
      {...rise(4)}
      className="xl:col-span-8"
      kicker="Section 1"
      title="Your 13-champion core"
      action={
        <Link to="/champions" className="btn btn-ghost h-8 text-xs">
          All champions <ArrowRight className="size-3.5" />
        </Link>
      }
    >
      <div className="space-y-6">
        {waves.map((w) => (
          <div key={w.label}>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="t-label text-hi">{w.label}</span>
              <span className="text-[0.74rem] text-low">{w.note}</span>
            </div>
            <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-8">
              {w.ids.map((c) => {
                const p = championProgress(st, c)
                const status = championStatus(st, c)
                const complete = p.done === p.total
                return (
                  <Link key={c.id} to={`/champions/${c.id}`} data-tip={`champ:${c.id}`} className="group min-w-0">
                    <div className="transition-transform duration-200 group-hover:-translate-y-1">
                      <Portrait id={c.id} fluid className="block" />
                    </div>
                    <Segments value={p.done} total={p.total} height={3} className="mt-2" color={complete ? 'var(--color-ok)' : 'var(--color-paper)'} />
                    <div className="mt-1.5 truncate text-[0.8rem] font-bold" style={{ color: rarityColor[c.rarity] }}>
                      {c.short}
                    </div>
                    <div className={cn('truncate text-[0.68rem]', status.startsWith('R6 · Lv 60') ? 'text-ok' : 'text-low')}>{status}</div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <NextChampionSteps />
    </Panel>
  )
}

function TodayPanel({ now }: { now: Date }) {
  const done = useDailyDone(now)
  const counts = useWeeklyCounts(now)
  const toggleDaily = useStore((s) => s.toggleDaily)
  const setWeekly = useStore((s) => s.setWeekly)
  const resetHour = useStore((s) => s.dailyResetHour)
  const resetDay = useStore((s) => s.weeklyResetDay)
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const [draft, setDraft] = useState('')
  const dailyDone = dailyLoops.filter((d) => done[d.id]).length
  const loopColor: Record<string, string> = { cb: 'var(--color-cb)', arena: 'var(--color-arena)', campaign: 'var(--color-hi)' }
  const keyColor: Record<string, string> = { hydra: 'var(--color-hydra)', chimera: 'var(--color-chimera)' }

  return (
    <Panel
      {...rise(5)}
      className="flex flex-col xl:col-span-4"
      bodyClassName="flex flex-1 flex-col"
      kicker="Daily loops"
      title="Today"
      action={
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-low tabular-nums" title="Change the reset time in Settings">
          <CalendarClock className="size-3.5" /> resets in {formatCountdown(nextDailyReset(now, resetHour).getTime() - now.getTime())}
        </span>
      }
    >
      <div className="space-y-1.5">
        {dailyLoops.map((d) => (
          <div
            key={d.id}
            className={cn('flex items-start gap-3 rounded-[3px] border px-3 py-2.5 transition-colors', done[d.id] ? 'border-edge opacity-60' : 'border-edge bg-raised-2')}
            style={{ boxShadow: `inset 3px 0 0 ${loopColor[d.id] ?? 'var(--color-hi)'}` }}
          >
            <Check checked={!!done[d.id]} onChange={() => toggleDaily(d.id)} label={d.title} />
            <div className="min-w-0 flex-1">
              <Link to={d.to} className={cn('text-[0.86rem] font-bold transition-colors hover:underline', done[d.id] ? 'text-low line-through' : 'text-hi')}>
                {d.title}
              </Link>
              <Rich as="div" text={d.text} links={false} className="mt-0.5 text-[0.77rem] leading-snug text-low" />
            </div>
          </div>
        ))}
      </div>
      <Segments value={dailyDone} total={dailyLoops.length} className="mt-3" height={4} color="var(--color-ok)" />

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="t-label text-hi">Weekly keys</span>
          <span className="text-[0.72rem] text-low tabular-nums">resets in {formatCountdown(nextWeeklyReset(now, resetDay, resetHour).getTime() - now.getTime())}</span>
        </div>
        <div className="space-y-1.5">
          {weeklyKeys.map((w) => {
            const used = counts[w.id] ?? 0
            const color = keyColor[w.id] ?? 'var(--color-paper)'
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-[3px] border border-edge px-3 py-2.5">
                <Link to={w.to} className="min-w-0 flex-1">
                  <div className="text-[0.84rem] font-bold hover:underline" style={{ color }}>
                    {w.title}
                  </div>
                  <div className="truncate text-[0.7rem] text-low">{w.note}</div>
                </Link>
                <div className="flex gap-1">
                  {Array.from({ length: w.total }).map((_, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setWeekly(w.id, used === i + 1 ? i : i + 1)}
                      aria-label={`${w.title}: ${i + 1} used`}
                      className={cn('grid size-7 place-items-center rounded-[3px] border transition-colors', i < used ? 'text-ink' : 'border-edge-2 text-low hover:border-mid')}
                      style={i < used ? { background: color, borderColor: color } : undefined}
                    >
                      <KeyRound className="size-3.5" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex-1">
        <div className="t-label mb-2 text-hi">My tasks</div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addTask(draft)
            setDraft('')
          }}
          className="flex gap-2"
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add your own reminder…" className="input" aria-label="New task" />
          <button type="submit" className="btn shrink-0 px-2.5" aria-label="Add task">
            <Plus className="size-4" />
          </button>
        </form>
        <ul className="mt-2 space-y-0.5">
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-2.5 rounded-[3px] px-1 py-1.5 hover:bg-raised-2"
              >
                <Check size="sm" checked={t.done} onChange={() => toggleTask(t.id)} label={t.text} />
                <span className={cn('min-w-0 flex-1 text-[0.84rem]', t.done ? 'text-low line-through' : 'text-mid')}>{t.text}</span>
                <button type="button" onClick={() => removeTask(t.id)} className="rounded-[3px] p-1 text-low opacity-0 transition group-hover:opacity-100 hover:text-bad" aria-label="Delete task">
                  <Trash className="size-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Panel>
  )
}

const priorityColor: Record<number, string> = {
  1: 'var(--color-cb)',
  2: 'var(--color-spider)',
  3: 'var(--color-dragon)',
  4: 'var(--color-fk)',
  5: 'var(--color-ig)',
  6: 'var(--color-arena)',
}

function Priorities() {
  const nums = useStore((s) => s.nums)
  const cbDifficulty = useStore((s) => s.cbDifficulty)
  const stageKeys: Record<number, string> = { 2: 'spider', 3: 'dragon', 4: 'fk', 5: 'ig' }
  return (
    <Panel {...rise(6)} kicker="Content priorities" title="What matters most" padded={false}>
      <div className="divide-y divide-edge">
        {contentPriorities.map((p) => {
          const key = stageKeys[p.rank]
          const stage = key ? stageOf(nums, key) : null
          const dungeon = key ? dungeons.find((d) => d.stageKey === key) : null
          const color = priorityColor[p.rank]
          return (
            <Link key={p.rank} to={p.to} className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-raised-2">
              <span className="t-num w-7 shrink-0 text-[1.7rem]" style={{ color }}>
                {p.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.9rem] font-bold text-hi">{p.name}</span>
                  {p.rank === 1 ? (
                    <span className="text-[0.72rem] font-bold" style={{ color: cbDifficulty ? difficultyColor[cbDifficulty] : 'var(--color-low)' }}>
                      {cbDifficulty ? difficultyNames[cbDifficulty] : 'Set difficulty'}
                    </span>
                  ) : stage !== null ? (
                    <span className="text-[0.72rem] font-semibold text-low tabular-nums">Stage {stage || '–'}/25</span>
                  ) : null}
                </div>
                {stage !== null && dungeon ? (
                  <Segments value={stage} total={25} className="mt-2" height={4} color={color} marks={dungeon.milestones.map((m) => m.stage)} />
                ) : (
                  <Rich as="div" text={p.detail} links={false} className="truncate text-[0.74rem] text-low" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </Panel>
  )
}

function Bottlenecks() {
  const items = [
    {
      title: 'Speed gear',
      text: 'Farm Dragon first for Speed, Accuracy and Lifesteal sets. HellHades calls Speed gear critical on a fresh account.',
      to: '/dungeons/dragon',
    },
    {
      title: 'Ascension potions',
      text: 'Potion Keeps (stage 20+): the 13 core need ~380 Superior potions; stage 20+ gives ~1.7 Superior per 5 runs.',
      to: '/resources/energy',
    },
    {
      title: 'Masteries',
      text: `A full set costs ${fmt(masteries.scrollsPerSet)} scrolls: ${masteries.minotaurRuns} Minotaur 15 runs at ${masteries.energyPerRun} energy, or ${masteries.gemCost} gems.`,
      to: '/resources/masteries',
    },
  ]
  return (
    <Panel {...rise(7)} kicker="From the guide" title="Your real bottlenecks" padded={false}>
      <div className="divide-y divide-edge">
        {items.map((it, i) => (
          <Link key={it.title} to={it.to} className="group flex gap-4 px-5 py-3.5 transition-colors hover:bg-raised-2">
            <span className="t-num w-7 shrink-0 pt-0.5 text-[1.1rem] text-low">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0">
              <div className="text-[0.9rem] font-bold text-hi">{it.title}</div>
              <Rich as="div" text={it.text} links={false} className="mt-0.5 text-[0.78rem] leading-snug text-low" />
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-edge px-5 py-3 text-[0.76rem] font-semibold text-mid">Not XP or energy — those are plentiful.</div>
    </Panel>
  )
}

function Reminders({ now }: { now: Date }) {
  const startDate = useStore((s) => s.startDate)
  const questions = useStore((s) => s.questions)
  const day = Math.max(1, dayNumber(startDate, now))
  const rule = dontRules[(day - 1) % dontRules.length]
  const verified = openQuestions.filter((q) => questions[q.id]?.verified).length
  const affinitiesSet = useStore((s) => champions.filter((c) => !c.affinity && s.champs[c.id]?.affinity).length)
  const needAffinity = champions.filter((c) => !c.affinity).length
  return (
    <Panel {...rise(8)} className="flex flex-col" kicker="Don't forget" title="Rule of the day">
      <Link to="/rules#donts" className="well group block px-4 py-3.5 transition-colors hover:border-edge-2" style={{ boxShadow: 'inset 3px 0 0 var(--color-bad)' }}>
        <div className="t-label mb-1.5 text-bad">{rule.topic}</div>
        <Rich as="div" text={rule.text} links={false} className="text-[0.88rem] leading-relaxed text-hi" />
      </Link>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to="/rules#open-questions" className="rounded-[3px] border border-edge p-3 transition-colors hover:border-edge-2">
          <div className="t-label text-low">Open questions</div>
          <div className="t-num mt-2 text-[1.6rem] text-hi">
            {verified}
            <span className="text-low">/{openQuestions.length}</span>
          </div>
          <div className="mt-1 text-[0.7rem] text-low">checked in-game</div>
        </Link>
        <Link to="/champions" className="rounded-[3px] border border-edge p-3 transition-colors hover:border-edge-2">
          <div className="t-label text-low">Affinities</div>
          <div className="t-num mt-2 text-[1.6rem] text-hi">
            {affinitiesSet}
            <span className="text-low">/{needAffinity}</span>
          </div>
          <div className="mt-1 text-[0.7rem] text-low">confirmed by you</div>
        </Link>
      </div>
    </Panel>
  )
}

function Notes() {
  const notes = useStore((s) => s.notes)
  const setNotes = useStore((s) => s.setNotes)
  const [text, setText] = useState(notes)
  useEffect(() => setText(notes), [notes])
  useEffect(() => {
    if (text === notes) return
    const t = window.setTimeout(() => setNotes(text), 400)
    return () => window.clearTimeout(t)
  }, [text, notes, setNotes])
  return (
    <Panel
      {...rise(9)}
      id="notes"
      className="scroll-mt-24 xl:col-span-7"
      kicker="Scratchpad"
      title="Notes"
      action={<span className={cn('t-label', text === notes ? 'text-low' : 'text-warn')}>{text === notes ? 'Saved' : 'Saving…'}</span>}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Speeds you rolled, clan info, things to check in-game…"
        className="input min-h-48 resize-y leading-relaxed"
        aria-label="Notes"
      />
    </Panel>
  )
}

function Unlocks() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const level = accountLevel(nums)
  const next = unlocks.find((u) => u.level > level)
  return (
    <Panel
      {...rise(10)}
      className="xl:col-span-5"
      kicker="Account level"
      title="Unlocks"
      action={<NumberField value={level || null} onChange={(v) => setNum('accountLevel', v ?? 0)} placeholder="Level" min={1} max={100} className="w-24" allowEmpty />}
    >
      <div className="space-y-px">
        {unlocks.map((u) => {
          const reached = level >= u.level
          const isNext = next?.level === u.level
          return (
            <div
              key={u.level}
              className={cn('flex items-center gap-3 rounded-[3px] px-2 py-1.5 transition-colors', isNext && 'bg-raised-3')}
              style={isNext ? { boxShadow: 'inset 3px 0 0 var(--color-paper)' } : undefined}
            >
              <span className={cn('t-num w-8 shrink-0 text-[0.95rem]', reached ? 'text-ok' : isNext ? 'text-hi' : 'text-low')}>{u.level}</span>
              <Rich as="span" text={u.what} links={false} className={cn('flex-1 text-[0.84rem]', reached ? 'text-mid' : isNext ? 'font-bold text-hi' : 'text-low')} />
              {reached ? <Unlock className="size-3.5 text-ok" /> : <Lock className="size-3.5 text-edge-2" />}
            </div>
          )
        })}
      </div>
      {next && level > 0 && (
        <div className="mt-3 text-[0.76rem] text-low">
          {next.level - level} level{next.level - level === 1 ? '' : 's'} to <span className="font-bold text-hi">{next.what}</span>.
        </div>
      )}
    </Panel>
  )
}

function StockStrip() {
  const items: { label: string; value: string; icon?: string; color?: string }[] = [
    { label: 'Energy', value: fmt(accountSnapshot.energy) },
    { label: 'Gems', value: fmt(accountSnapshot.gems), icon: resourceIcon.gems, color: 'var(--color-gems)' },
    { label: 'Silver', value: compact(accountSnapshot.silver), icon: resourceIcon.silver, color: 'var(--color-silver)' },
    { label: 'Brews', value: fmt(accountSnapshot.brews) },
    { label: 'CB keys', value: fmt(accountSnapshot.cbKeys), color: 'var(--color-cb)' },
    { label: 'Feasts', value: String(accountSnapshot.feasts) },
    { label: '5★ chickens', value: String(accountSnapshot.chickens5) },
    { label: '4★ chickens', value: String(accountSnapshot.chickens4) },
    { label: '3★ chickens', value: String(accountSnapshot.chickens3) },
  ]
  const t = accountSnapshot.tomes
  return (
    <motion.div {...rise(11)} className="panel px-5 py-4">
      <div className="t-label mb-3 text-low">Starting stock · from the guide</div>
      <div className="flex flex-wrap items-end gap-x-7 gap-y-3">
        {items.map((it) => (
          <div key={it.label}>
            <div className="text-[0.7rem] font-semibold text-low">{it.label}</div>
            <div className="mt-0.5 inline-flex items-center gap-1.5 text-[1.05rem] font-extrabold tabular-nums" style={{ color: it.color ?? 'var(--color-hi)' }}>
              {it.icon && <img src={it.icon} alt="" className="size-4" />}
              {it.value}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[0.7rem] font-semibold text-low">Tomes L · E · R · M</div>
          <div className="mt-0.5 inline-flex items-center gap-2 text-[1.05rem] font-extrabold tabular-nums">
            <span className="text-legendary">{t.legendary}</span>
            <span className="text-epic">{t.epic}</span>
            <span className="text-rare">{t.rare}</span>
            <span className="text-mythical">{t.mythic}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const now = useNow()
  return (
    <div className="space-y-6">
      <Hero now={now} />
      <div className="pt-4">
        <StatStrip />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <CoreStrip />
        <TodayPanel now={now} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Priorities />
        <Bottlenecks />
        <Reminders now={now} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Notes />
        <Unlocks />
      </div>
      <StockStrip />
    </div>
  )
}
