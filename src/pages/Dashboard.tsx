import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Coins,
  Flame,
  FlaskConical,
  Gauge,
  Gem,
  KeyRound,
  Lock,
  NotebookPen,
  Plus,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Star,
  Trash,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Sigil } from '../components/champion/Sigil'
import { Check } from '../components/ui/Check'
import { NumberField } from '../components/ui/Fields'
import { AnimatedNumber, ProgressBar, ProgressRing } from '../components/ui/Progress'
import { Rich } from '../components/ui/Rich'
import { Card, Pill, SectionTitle, Stat } from '../components/ui/primitives'
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
import { useDailyDone, useKeysUsed, useStore, useWeeklyCounts } from '../lib/store'
import { TaskItem } from '../components/roadmap/TaskItem'

const fade = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.04 * i, type: 'spring' as const, stiffness: 260, damping: 26 },
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
    <Card {...fade(0)} padded={false} className="overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(246_196_99/0.12),transparent_55%)]" />
      <div className="relative grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-7">
        <div className="min-w-0">
          <div className="eyebrow text-gold-500/90">
            {greet}, {profileName || 'Champion'}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="font-display text-4xl font-bold tracking-wide">
              <span className="shine-text">{day >= 1 ? `Day ${day}` : `T−${1 - day}`}</span>
            </h1>
            <span className="text-lg font-semibold text-fg">{phase ? phase.title : 'Your plan starts soon'}</span>
          </div>
          <Rich as="p" text={guideMeta.summary} className="mt-3 max-w-3xl text-[0.9rem] leading-relaxed text-fg-muted" />

          <div className="mt-6">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="eyebrow">Next up</span>
              <Link to="/roadmap" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300">
                Full roadmap <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {upNext.map((t) => (
                  <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <TaskItem task={t} compact />
                  </motion.div>
                ))}
              </AnimatePresence>
              {upNext.length === 0 && (
                <div className="rounded-xl border border-gold-500/25 bg-gold-500/[0.06] p-4 text-sm text-gold-200 xl:col-span-3">
                  Every roadmap task is done. Time for the luxury adds — see the bench on the Champions page.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-6 lg:flex-col lg:justify-center lg:pl-6">
          <ProgressRing value={pct(prog.done, prog.total)} size={148} stroke={10}>
            <div className="text-center">
              <div className="text-3xl font-bold text-fg tabular-nums">
                <AnimatedNumber value={pct(prog.done, prog.total)} />%
              </div>
              <div className="mt-0.5 text-[0.7rem] font-semibold tracking-wider text-fg-subtle uppercase">{phase?.short ?? 'Day 1'}</div>
            </div>
          </ProgressRing>
          <div className="text-center text-xs text-fg-subtle">
            <span className="font-semibold text-fg tabular-nums">
              {prog.done}/{prog.total}
            </span>{' '}
            tasks this phase
          </div>
        </div>
      </div>
    </Card>
  )
}

function KpiRow() {
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

  const tiles = [
    {
      to: '/champions',
      icon: <Star className="size-5" />,
      tone: 'gold' as const,
      label: 'Core 13 at Rank 6',
      value: (
        <>
          <AnimatedNumber value={r6} />
          <span className="text-fg-subtle">/13</span>
        </>
      ),
      sub: `${maxed} at Lv 60`,
    },
    {
      to: '/roadmap',
      icon: <Trophy className="size-5" />,
      tone: 'ok' as const,
      label: 'Roadmap',
      value: (
        <>
          <AnimatedNumber value={tasksDone} />
          <span className="text-fg-subtle">/{allTasks.length}</span>
        </>
      ),
      sub: `${pct(tasksDone, allTasks.length)}% of all tasks`,
    },
    {
      to: '/clan-boss/demon-lord#key-planner',
      icon: <KeyRound className="size-5" />,
      tone: 'epic' as const,
      label: 'Stored CB keys',
      value: <AnimatedNumber value={accountSnapshot.cbKeys - keysUsed} />,
      sub: `${keysUsed} used of ${accountSnapshot.cbKeys}`,
    },
    {
      to: '/resources/energy',
      icon: <Zap className="size-5" />,
      tone: 'info' as const,
      label: 'Energy budget left',
      value: <AnimatedNumber value={energyLeft} />,
      sub: `of ${fmt(energy.total)}`,
    },
    {
      to: '/resources/gems',
      icon: <Gem className="size-5" />,
      tone: 'bad' as const,
      label: 'Gems left',
      value: <AnimatedNumber value={gemsLeft} />,
      sub: 'Keep ~4,500 for slots',
    },
    {
      to: '/resources/tomes',
      icon: <BookOpen className="size-5" />,
      tone: 'warn' as const,
      label: 'Tomes left',
      value: (
        <span className="text-[1.05rem]">
          <span className="text-legendary">{left.legendary}</span>
          <span className="text-fg-subtle"> · </span>
          <span className="text-epic">{left.epic}</span>
          <span className="text-fg-subtle"> · </span>
          <span className="text-rare">{left.rare}</span>
        </span>
      ),
      sub: 'Legendary · Epic · Rare',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map((t, i) => (
        <Link key={t.label} to={t.to} className="block">
          <Card {...fade(i + 1)} spotlight whileHover={{ y: -3 }} className="h-full p-4">
            <Stat icon={t.icon} tone={t.tone} label={t.label} value={t.value} sub={t.sub} />
          </Card>
        </Link>
      ))}
    </div>
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
    <div className="mt-5 border-t border-white/[0.06] pt-4">
      <div className="mb-2.5 flex items-baseline gap-2">
        <span className="text-[0.8rem] font-semibold text-fg">Next champion steps</span>
        <span className="text-[0.72rem] text-fg-subtle">first open step per champion</span>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {next.map(({ c, step }) => (
            <motion.div
              key={`${c.id}-${step.key}`}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <Check size="sm" checked={false} onChange={(v) => setRefs([stepRef(c.id, step)], v)} label={step.text} />
              <Link to={`/champions/${c.id}`} className="shrink-0">
                <Sigil id={c.id} size={26} />
              </Link>
              <span className="min-w-0 flex-1 truncate text-[0.78rem] text-fg-muted" title={step.text}>
                <span className="font-semibold text-fg">{c.short}:</span> {step.text}
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
    <Card {...fade(7)} className="xl:col-span-8">
      <SectionTitle
        eyebrow="Section 1"
        title="Your 13-champion core"
        action={
          <Link to="/champions" className="btn btn-ghost text-xs">
            All champions <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <div className="space-y-5">
        {waves.map((w) => (
          <div key={w.label}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-[0.8rem] font-semibold text-fg">{w.label}</span>
              <span className="text-[0.72rem] text-fg-subtle">{w.note}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {w.ids.map((c) => {
                const p = championProgress(st, c)
                const status = championStatus(st, c)
                return (
                  <Link key={c.id} to={`/champions/${c.id}`} className="group">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-2 py-3 text-center transition-colors group-hover:border-gold-400/25 group-hover:bg-white/[0.04]"
                    >
                      <ProgressRing value={pct(p.done, p.total)} size={62} stroke={3}>
                        <Sigil id={c.id} size={46} />
                      </ProgressRing>
                      <div className="min-w-0">
                        <div className="truncate text-[0.78rem] font-semibold text-fg">{c.short}</div>
                        <div className={cn('truncate text-[0.66rem]', status.startsWith('R6 · Lv 60') ? 'text-ok' : 'text-fg-subtle')}>{status}</div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <NextChampionSteps />
    </Card>
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

  return (
    <Card {...fade(8)} className="flex flex-col xl:col-span-4">
      <SectionTitle
        eyebrow="Daily loops"
        title="Today"
        action={
          <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-fg-subtle" title="Change the reset time in Settings">
            <CalendarClock className="size-3.5" /> resets in {formatCountdown(nextDailyReset(now, resetHour).getTime() - now.getTime())}
          </span>
        }
      />
      <div className="space-y-2">
        {dailyLoops.map((d) => (
          <div
            key={d.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 transition-colors',
              done[d.id] ? 'border-white/[0.04] bg-white/[0.015]' : 'border-white/[0.07] bg-white/[0.025]',
            )}
          >
            <Check checked={!!done[d.id]} onChange={() => toggleDaily(d.id)} label={d.title} />
            <div className="min-w-0 flex-1">
              <Link to={d.to} className={cn('text-[0.84rem] font-semibold hover:text-gold-300', done[d.id] ? 'text-fg-subtle line-through' : 'text-fg')}>
                {d.title}
              </Link>
              <div className="mt-0.5 text-[0.76rem] leading-snug text-fg-subtle">{d.text}</div>
            </div>
          </div>
        ))}
      </div>
      <ProgressBar value={pct(dailyDone, dailyLoops.length)} className="mt-3" height={4} tone="ok" />

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Weekly keys</span>
          <span className="text-[0.72rem] text-fg-subtle">resets in {formatCountdown(nextWeeklyReset(now, resetDay, resetHour).getTime() - now.getTime())}</span>
        </div>
        <div className="space-y-2">
          {weeklyKeys.map((w) => {
            const used = counts[w.id] ?? 0
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <Link to={w.to} className="min-w-0 flex-1">
                  <div className="text-[0.82rem] font-semibold text-fg hover:text-gold-300">{w.title}</div>
                  <div className="truncate text-[0.7rem] text-fg-subtle">{w.note}</div>
                </Link>
                <div className="flex gap-1.5">
                  {Array.from({ length: w.total }).map((_, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setWeekly(w.id, used === i + 1 ? i : i + 1)}
                      aria-label={`${w.title}: ${i + 1} used`}
                      className={cn(
                        'grid size-7 place-items-center rounded-lg border transition-colors',
                        i < used ? 'border-gold-400/70 bg-gold-500/25 text-gold-200' : 'border-white/12 bg-white/[0.03] text-fg-subtle hover:border-gold-400/40',
                      )}
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

      <div className="mt-5 flex-1">
        <div className="eyebrow mb-2">My tasks</div>
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
        <ul className="mt-2 space-y-1">
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5"
              >
                <Check size="sm" checked={t.done} onChange={() => toggleTask(t.id)} label={t.text} />
                <span className={cn('min-w-0 flex-1 text-[0.82rem]', t.done ? 'text-fg-subtle line-through' : 'text-fg-muted')}>{t.text}</span>
                <button
                  type="button"
                  onClick={() => removeTask(t.id)}
                  className="rounded p-1 text-fg-subtle opacity-0 transition group-hover:opacity-100 hover:text-bad"
                  aria-label="Delete task"
                >
                  <Trash className="size-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Card>
  )
}

function Priorities() {
  const nums = useStore((s) => s.nums)
  const cbDifficulty = useStore((s) => s.cbDifficulty)
  const stageKeys: Record<number, string> = { 2: 'spider', 3: 'dragon', 4: 'fk', 5: 'ig' }
  return (
    <Card {...fade(9)}>
      <SectionTitle eyebrow="Content priorities" title="What matters most" />
      <div className="space-y-1.5">
        {contentPriorities.map((p) => {
          const key = stageKeys[p.rank]
          const stage = key ? stageOf(nums, key) : null
          const dungeon = key ? dungeons.find((d) => d.stageKey === key) : null
          return (
            <Link key={p.rank} to={p.to} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.03]">
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-lg font-display text-sm font-bold',
                  p.rank === 1 ? 'bg-gradient-to-b from-gold-300 to-gold-600 text-ink-950' : 'border border-white/10 bg-white/[0.03] text-fg-muted',
                )}
              >
                {p.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.84rem] font-semibold text-fg group-hover:text-gold-300">{p.name}</span>
                  <span className="text-[0.7rem] text-fg-subtle tabular-nums">
                    {p.rank === 1 ? (cbDifficulty ? difficultyNames[cbDifficulty] : 'Set difficulty') : stage !== null ? `Stage ${stage || '–'}` : ''}
                  </span>
                </div>
                {stage !== null && dungeon ? (
                  <ProgressBar value={(stage / 25) * 100} className="mt-1.5" height={4} markers={dungeon.milestones.map((m) => (m.stage / 25) * 100)} />
                ) : (
                  <div className="truncate text-[0.72rem] text-fg-subtle">{p.detail}</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

function Bottlenecks() {
  const items = [
    {
      icon: <Gauge className="size-4" />,
      title: 'Speed gear',
      text: 'Farm Dragon first for Speed, Accuracy and Lifesteal sets. HellHades calls Speed gear critical on a fresh account.',
      to: '/dungeons/dragon',
    },
    {
      icon: <FlaskConical className="size-4" />,
      title: 'Ascension potions',
      text: 'Potion Keeps (stage 20+): the 13 core need ~380 Superior potions; stage 20+ gives ~1.7 Superior per 5 runs.',
      to: '/resources/energy',
    },
    {
      icon: <ScrollText className="size-4" />,
      title: 'Masteries',
      text: `A full set costs ${fmt(masteries.scrollsPerSet)} scrolls: ${masteries.minotaurRuns} Minotaur 15 runs at ${masteries.energyPerRun} energy, or ${masteries.gemCost} gems.`,
      to: '/resources/masteries',
    },
  ]
  return (
    <Card {...fade(10)}>
      <SectionTitle eyebrow="From the guide" title="Your real bottlenecks" />
      <div className="space-y-2.5">
        {items.map((it) => (
          <Link key={it.title} to={it.to} className="group flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-gold-400/25">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold-500/10 text-gold-300 ring-1 ring-gold-500/20">{it.icon}</span>
            <div className="min-w-0">
              <div className="text-[0.84rem] font-semibold text-fg group-hover:text-gold-300">{it.title}</div>
              <div className="text-[0.76rem] leading-snug text-fg-subtle">{it.text}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[0.75rem] text-fg-subtle">
        <Sparkles className="size-3.5 text-gold-500" /> Not XP or energy — those are plentiful.
      </div>
    </Card>
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
    <Card {...fade(11)} className="flex flex-col">
      <SectionTitle eyebrow="Don't forget" title="Rule of the day" />
      <Link to="/rules#donts" className="group block rounded-xl border border-bad/20 bg-bad/[0.05] p-4 transition hover:border-bad/35">
        <div className="mb-1.5 flex items-center gap-2 text-[0.7rem] font-bold tracking-wider text-bad uppercase">
          <ShieldAlert className="size-3.5" /> {rule.topic}
        </div>
        <div className="text-[0.86rem] leading-relaxed text-fg">{rule.text}</div>
      </Link>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Link to="/rules#open-questions" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-gold-400/25">
          <div className="eyebrow">Open questions</div>
          <div className="mt-1 text-lg font-semibold text-fg tabular-nums">
            {verified}
            <span className="text-fg-subtle">/{openQuestions.length}</span>
          </div>
          <div className="text-[0.7rem] text-fg-subtle">checked in-game</div>
        </Link>
        <Link to="/champions" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-gold-400/25">
          <div className="eyebrow">Affinities</div>
          <div className="mt-1 text-lg font-semibold text-fg tabular-nums">
            {affinitiesSet}
            <span className="text-fg-subtle">/{needAffinity}</span>
          </div>
          <div className="text-[0.7rem] text-fg-subtle">confirmed by you</div>
        </Link>
      </div>
    </Card>
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
    <Card {...fade(12)} id="notes" className="scroll-mt-24 xl:col-span-7">
      <SectionTitle
        eyebrow="Scratchpad"
        title={
          <span className="inline-flex items-center gap-2">
            <NotebookPen className="size-4 text-gold-400" /> Notes
          </span>
        }
        action={<span className="text-[0.72rem] text-fg-subtle">{text === notes ? 'Saved' : 'Saving…'}</span>}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Speeds you rolled, clan info, things to check in-game…"
        className="input min-h-44 resize-y leading-relaxed"
        aria-label="Notes"
      />
    </Card>
  )
}

function Unlocks() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const level = accountLevel(nums)
  const next = unlocks.find((u) => u.level > level)
  return (
    <Card {...fade(13)} className="xl:col-span-5">
      <SectionTitle
        eyebrow="Account level"
        title="Unlocks"
        action={
          <NumberField
            value={level || null}
            onChange={(v) => setNum('accountLevel', v ?? 0)}
            placeholder="Level"
            min={1}
            max={100}
            className="w-24"
            allowEmpty
          />
        }
      />
      <div className="relative space-y-1">
        {unlocks.map((u) => {
          const reached = level >= u.level
          const isNext = next?.level === u.level
          return (
            <div
              key={u.level}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors',
                isNext && 'bg-gold-500/[0.07] ring-1 ring-gold-500/25',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-lg text-[0.7rem] font-bold tabular-nums',
                  reached ? 'bg-ok/15 text-ok' : isNext ? 'bg-gold-500/15 text-gold-300' : 'bg-white/[0.04] text-fg-subtle',
                )}
              >
                {u.level}
              </span>
              <span className={cn('flex-1 text-[0.82rem]', reached ? 'text-fg-muted' : isNext ? 'font-semibold text-fg' : 'text-fg-subtle')}>{u.what}</span>
              {reached ? <Unlock className="size-3.5 text-ok" /> : <Lock className="size-3.5 text-fg-subtle" />}
            </div>
          )
        })}
      </div>
      {next && level > 0 && (
        <div className="mt-3 text-[0.75rem] text-fg-subtle">
          {next.level - level} level{next.level - level === 1 ? '' : 's'} to <span className="text-gold-300">{next.what}</span>.
        </div>
      )}
    </Card>
  )
}

function StockStrip() {
  const items = [
    { icon: <Zap className="size-3.5" />, label: 'Energy', value: fmt(accountSnapshot.energy) },
    { icon: <Gem className="size-3.5" />, label: 'Gems', value: fmt(accountSnapshot.gems) },
    { icon: <Coins className="size-3.5" />, label: 'Silver', value: compact(accountSnapshot.silver) },
    { icon: <FlaskConical className="size-3.5" />, label: 'Brews', value: fmt(accountSnapshot.brews) },
    { icon: <KeyRound className="size-3.5" />, label: 'CB keys', value: fmt(accountSnapshot.cbKeys) },
    { icon: <Flame className="size-3.5" />, label: 'Feasts', value: String(accountSnapshot.feasts) },
    { icon: <Star className="size-3.5" />, label: '5★ chickens', value: String(accountSnapshot.chickens5) },
    { icon: <Star className="size-3.5" />, label: '4★ chickens', value: String(accountSnapshot.chickens4) },
    { icon: <Star className="size-3.5" />, label: '3★ chickens', value: String(accountSnapshot.chickens3) },
  ]
  return (
    <motion.div {...fade(14)} className="card-flat flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
      <span className="eyebrow">Starting stock (from the guide)</span>
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-[0.78rem] text-fg-subtle">
          <span className="text-gold-500">{it.icon}</span>
          {it.label}
          <span className="font-semibold text-fg-muted tabular-nums">{it.value}</span>
        </span>
      ))}
      <Pill className="ml-auto" tone="neutral">
        Tomes {accountSnapshot.tomes.legendary} L · {accountSnapshot.tomes.epic} E · {accountSnapshot.tomes.rare} R · {accountSnapshot.tomes.mythic} M
      </Pill>
    </motion.div>
  )
}

export function Dashboard() {
  const now = useNow()
  return (
    <div className="space-y-5">
      <Hero now={now} />
      <KpiRow />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <CoreStrip />
        <TodayPanel now={now} />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Priorities />
        <Bottlenecks />
        <Reminders now={now} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Notes />
        <Unlocks />
      </div>
      <StockStrip />
    </div>
  )
}
