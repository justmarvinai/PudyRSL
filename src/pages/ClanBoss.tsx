import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Ban, CalendarRange, Crosshair, KeyRound, Shield, Skull, Sparkles, Swords } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Sigil } from '../components/champion/Sigil'
import { TeamLineup } from '../components/champion/TeamLineup'
import { PageHeader } from '../components/layout/PageHeader'
import { KeyPlanner } from '../components/tools/KeyPlanner'
import { TuneChecker } from '../components/tools/TuneChecker'
import { Segmented } from '../components/ui/Fields'
import { LabelTag, Rich } from '../components/ui/Rich'
import { TabBar } from '../components/ui/Tabs'
import { Callout, Card, Pill, SectionTitle } from '../components/ui/primitives'
import {
  chimera,
  clanBossIntro,
  demonLordRules,
  difficultyNames,
  difficultyOrder,
  difficultyRequirements,
  difficultyTimeline,
  hydra,
  openers,
  starterTeam,
  ukTeam,
  type DifficultyKey,
} from '../data/clanBoss'
import { weeklyKeys } from '../data/roadmap'
import { cn } from '../lib/cn'
import { dayNumber, formatCountdown, inRange, nextWeeklyReset, useNow } from '../lib/dates'
import { useStore, useWeeklyCounts } from '../lib/store'

const tabs = [
  { key: 'demon-lord', label: 'Demon Lord', icon: <Skull className="size-4" />, to: '/clan-boss/demon-lord' },
  { key: 'hydra', label: 'Hydra', icon: <Swords className="size-4" />, to: '/clan-boss/hydra' },
  { key: 'chimera', label: 'Chimera', icon: <Sparkles className="size-4" />, to: '/clan-boss/chimera' },
]

function WeeklyKeyTracker({ id }: { id: 'hydra' | 'chimera' }) {
  const now = useNow()
  const counts = useWeeklyCounts(now)
  const setWeekly = useStore((s) => s.setWeekly)
  const resetDay = useStore((s) => s.weeklyResetDay)
  const resetHour = useStore((s) => s.dailyResetHour)
  const w = weeklyKeys.find((k) => k.id === id)!
  const used = counts[id] ?? 0
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] px-4 py-3">
      <div>
        <div className="text-[0.84rem] font-semibold text-fg">This week&apos;s {w.title.toLowerCase()}</div>
        <div className="text-[0.72rem] text-fg-subtle">
          {used}/{w.total} used · resets in {formatCountdown(nextWeeklyReset(now, resetDay, resetHour).getTime() - now.getTime())}
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        {Array.from({ length: w.total }).map((_, i) => (
          <motion.button
            key={i}
            type="button"
            whileTap={{ scale: 0.85 }}
            whileHover={{ y: -2 }}
            onClick={() => setWeekly(id, used === i + 1 ? i : i + 1)}
            className={cn(
              'grid size-10 place-items-center rounded-xl border transition-colors',
              i < used ? 'border-gold-400/70 bg-gold-500/25 text-gold-200 shadow-[0_0_14px_-4px_rgb(246_196_99/0.8)]' : 'border-white/12 bg-white/[0.03] text-fg-subtle hover:border-gold-400/40',
            )}
            aria-label={`Key ${i + 1}`}
          >
            <KeyRound className="size-4" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function DemonLord() {
  const cbDifficulty = useStore((s) => s.cbDifficulty)
  const setCbDifficulty = useStore((s) => s.setCbDifficulty)
  const startDate = useStore((s) => s.startDate)
  const now = useNow()
  const day = dayNumber(startDate, now)
  const [opener, setOpener] = useState<'brutal' | 'nm' | 'unm'>('brutal')
  const op = openers.find((o) => o.key === opener)!

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Rich as="p" text={clanBossIntro} className="max-w-3xl text-[0.88rem] leading-relaxed text-fg-muted" />
          <div>
            <div className="eyebrow mb-1.5">Highest difficulty you clear</div>
            <Segmented
              size="sm"
              value={cbDifficulty ?? ('' as DifficultyKey)}
              onChange={(d) => setCbDifficulty(d === cbDifficulty ? null : d)}
              options={difficultyOrder.map((d) => ({ value: d, label: d === 'unm' ? 'UNM' : d === 'nm' ? 'NM' : difficultyNames[d] }))}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="Demon Lord" title="Rules that shape everything" label={demonLordRules.label} />
          <div className="mb-4 flex flex-wrap gap-1.5">
            {demonLordRules.immunities.map((im) => (
              <Pill key={im} tone="bad" icon={<Ban className="size-3" />}>
                {im}
              </Pill>
            ))}
          </div>
          <ul className="space-y-2.5">
            {demonLordRules.items.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.84rem] leading-relaxed text-fg-muted">
                <Shield className="mt-1 size-3.5 shrink-0 text-gold-500" />
                <Rich text={t} />
              </li>
            ))}
          </ul>
        </Card>

        <Card id="difficulty" className="scroll-mt-24 xl:col-span-3" padded={false}>
          <div className="p-5 pb-2">
            <SectionTitle eyebrow="Requirements" title="Speed & accuracy by difficulty" className="mb-0" />
          </div>
          <div className="overflow-x-auto">
            <table className="table-guide">
              <thead>
                <tr>
                  <th className="pl-5">Difficulty</th>
                  <th>Speed</th>
                  <th>Accuracy (DWJ)</th>
                  <th>Accuracy (Ayumilove)</th>
                </tr>
              </thead>
              <tbody>
                {difficultyRequirements.rows.map((r) => (
                  <tr key={r.key} className={cn(cbDifficulty === r.key && 'bg-gold-400/[0.06]')}>
                    <td className="pl-5 font-semibold text-fg">
                      {difficultyNames[r.key]}
                      {cbDifficulty === r.key && <Pill tone="gold" className="ml-2">You</Pill>}
                    </td>
                    <td className="tabular-nums">{r.speed}</td>
                    <td className="tabular-nums">{r.accDwj}</td>
                    <td className="tabular-nums">{r.accAyu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Rich as="p" text={difficultyRequirements.sources} className="px-5 pt-2 pb-4 text-[0.72rem] text-fg-subtle" />
        </Card>
      </div>

      <Card id="starter-team" className="scroll-mt-24">
        <SectionTitle eyebrow="Day 1 to about week 3" title={starterTeam.title} label={starterTeam.label} />
        <TeamLineup
          slots={starterTeam.slots.map((s) => ({
            slot: s.slot,
            text: s.champ,
            ids: s.ids,
            lines: [
              { text: s.role },
              { label: 'Note', text: s.notes },
            ],
          }))}
        />
        <Rich as="p" text={starterTeam.after} className="mt-4 text-[0.82rem] leading-relaxed text-fg-muted" />
      </Card>

      <Card id="uk-team" className="scroll-mt-24">
        <SectionTitle eyebrow="Weeks 2–6" title={ukTeam.title} label={ukTeam.label} />
        <TeamLineup
          slots={ukTeam.slots.map((s) => ({
            slot: `${s.slot} · ${s.speed}`,
            text: s.champ,
            ids: s.ids,
            highlight: true,
            lines: [
              { label: 'Books', text: s.books },
              { label: 'Gear', text: s.gear },
              { label: 'Masteries', text: s.masteries },
            ],
          }))}
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <Rich as="p" text={ukTeam.rulesIntro} className="mb-2 text-[0.8rem] font-semibold text-fg" />
            <ul className="space-y-2">
              {ukTeam.rules.map((r) => (
                <li key={r} className="flex gap-2.5 text-[0.82rem] leading-relaxed text-fg-muted">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" />
                  <Rich text={r} />
                </li>
              ))}
            </ul>
          </div>
          <div id="openers" className="scroll-mt-24">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[0.86rem] font-semibold text-fg">Openers</span>
              <Segmented size="sm" value={opener} onChange={setOpener} options={openers.map((o) => ({ value: o.key, label: o.key === 'brutal' ? 'Brutal' : o.key.toUpperCase() }))} />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={opener} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-2">
                {op.lines.map((l) => (
                  <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <Sigil id={l.id} size={32} />
                    <span className="w-24 text-[0.82rem] font-semibold text-fg">{l.champ}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {l.seq.map((a, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                          {i > 0 && <ArrowRight className="size-3.5 text-fg-subtle" />}
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.06 * i }}
                            className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-2 py-0.5 text-xs font-bold text-gold-300"
                          >
                            {a}
                          </motion.span>
                        </span>
                      ))}
                    </div>
                    {l.note && <span className="text-[0.72rem] text-fg-subtle">{l.note}</span>}
                  </div>
                ))}
                {op.after && <div className="pl-1 text-[0.75rem] text-fg-subtle">…{op.after}.</div>}
              </motion.div>
            </AnimatePresence>
            <Rich as="p" text={ukTeam.openersText} className="mt-3 text-[0.72rem] leading-relaxed text-fg-subtle" />
          </div>
        </div>
        <Callout tone="warn" className="mt-5" text={ukTeam.caveat} />
      </Card>

      <TuneChecker />

      <Card>
        <SectionTitle eyebrow="When to push" title="Difficulty timeline" label={difficultyTimeline.label} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {difficultyTimeline.rows.map((r, i) => {
            const now = inRange(day, r.days)
            return (
              <motion.div
                key={r.when}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn('relative rounded-2xl border p-4', now ? 'border-gold-400/35 bg-gold-400/[0.06]' : 'border-white/[0.07] bg-white/[0.02]')}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-fg-muted">
                    <CalendarRange className="size-3.5 text-gold-500" /> {r.when}
                  </span>
                  {now && <Pill tone="gold">Now</Pill>}
                </div>
                <div className="mt-2 text-lg font-bold text-fg">{r.difficulty}</div>
                <div className="text-[0.8rem] text-gold-300/90">{r.team}</div>
                <Rich as="p" text={r.why} className="mt-2 text-[0.78rem] leading-relaxed text-fg-subtle" />
              </motion.div>
            )
          })}
        </div>
      </Card>

      <KeyPlanner />
    </div>
  )
}

function Hydra() {
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {hydra.facts.map((f) => (
            <Pill key={f} tone="gold">
              {f}
            </Pill>
          ))}
          <LabelTag label={hydra.label} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {hydra.heads.map((h, i) => {
            const weak = h.names.includes('Torment')
            return (
              <motion.div
                key={h.names.join()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className={cn('relative overflow-hidden rounded-2xl border p-4', weak ? 'border-bad/30 bg-bad/[0.05]' : 'border-white/[0.07] bg-white/[0.025]')}
              >
                <div className="absolute -top-6 -right-6 size-20 rounded-full bg-gold-500/10 blur-2xl" />
                <div className="eyebrow">{h.names.length > 1 ? 'Heads' : 'Head'}</div>
                <div className="mt-1 font-display text-lg font-bold text-fg">{h.names.join(' / ')}</div>
                <div className="mt-3 flex items-start gap-2 text-[0.82rem] text-fg-muted">
                  <Crosshair className="mt-0.5 size-3.5 shrink-0 text-gold-400" />
                  <span>{h.counter}</span>
                </div>
                {weak && <Pill tone="bad" className="mt-3">Your weak head</Pill>}
              </motion.div>
            )
          })}
        </div>
        <Rich as="p" text={hydra.countersText} className="mt-4 text-[0.75rem] leading-relaxed text-fg-subtle" />
      </Card>

      <WeeklyKeyTracker id="hydra" />

      <Card padded={false}>
        <div className="p-5 pb-2">
          <SectionTitle eyebrow="Teams" title="Hydra keys" className="mb-0" />
        </div>
        <div className="divide-y divide-white/[0.05]">
          {hydra.keys.map((k) => (
            <div key={k.key} className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[120px_1fr_1.2fr]">
              <div className="font-display text-lg font-bold text-gold-300">{k.key}</div>
              <div>
                <div className="mb-2 flex flex-wrap -space-x-2">
                  {k.ids.map((id) => (
                    <Sigil key={id} id={id} size={38} />
                  ))}
                </div>
                <div className="text-[0.82rem] text-fg">{k.team}</div>
              </div>
              <div className="text-[0.82rem] leading-relaxed text-fg-muted">{k.roles}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {hydra.notes.map((n, i) => (
          <Callout key={i} tone={i === 0 ? 'warn' : i === 1 ? 'danger' : 'info'} text={n} />
        ))}
      </div>
    </div>
  )
}

const formStyle: Record<string, { ring: string; soft: string; text: string; glow: string }> = {
  Ultimate: { ring: 'border-gold-400/60', soft: 'border-gold-400/25', text: 'text-gold-300', glow: 'rgb(246 196 99 / 0.55)' },
  Ram: { ring: 'border-info/60', soft: 'border-info/25', text: 'text-info', glow: 'rgb(106 168 255 / 0.55)' },
  Lion: { ring: 'border-ember-400/60', soft: 'border-ember-400/25', text: 'text-ember-400', glow: 'rgb(255 122 107 / 0.55)' },
  Viper: { ring: 'border-spirit/60', soft: 'border-spirit/25', text: 'text-spirit', glow: 'rgb(79 224 143 / 0.55)' },
}

function Chimera() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = window.setInterval(() => setActive((a) => (a + 1) % chimera.cycle.length), 1600)
    return () => window.clearInterval(t)
  }, [paused])
  const form = chimera.cycle[active]
  const desc = chimera.forms.find((f) => f.form === form)!

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {chimera.facts.map((f) => (
            <Pill key={f} tone="gold">
              {f}
            </Pill>
          ))}
          <LabelTag label={chimera.label} />
        </div>

        <div className="mt-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="eyebrow mb-3">Forms cycle every 5 turns</div>
          <div className="flex flex-wrap items-center gap-2">
            {chimera.cycle.map((f, i) => {
              const st = formStyle[f]
              const on = i === active
              return (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight className={cn('size-4 transition-colors', i <= active ? 'text-gold-500' : 'text-fg-subtle/40')} />}
                  <motion.button
                    type="button"
                    onClick={() => setActive(i)}
                    animate={on ? { scale: 1.08, boxShadow: `0 0 24px -4px ${st.glow}` } : { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn('rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition-colors', on ? `${st.ring} ${st.text} bg-white/[0.05]` : 'border-white/10 text-fg-subtle')}
                  >
                    {f}
                  </motion.button>
                </div>
              )
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={form}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[0.86rem] text-fg-muted"
            >
              <span className={cn('font-bold', formStyle[form].text)}>{form}</span> {desc.text}.
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {chimera.forms.map((f) => (
            <div key={f.form} className={cn('rounded-2xl border bg-white/[0.02] p-4', formStyle[f.form].soft)}>
              <div className={cn('font-display text-lg font-bold', formStyle[f.form].text)}>{f.form}</div>
              <div className="mt-1 text-[0.8rem] leading-relaxed text-fg-muted">{f.text}</div>
            </div>
          ))}
        </div>
        <Rich as="p" text={`Sources: ${chimera.sources}`} className="mt-4 text-[0.72rem] text-fg-subtle" />
      </Card>

      <WeeklyKeyTracker id="chimera" />

      <Card>
        <SectionTitle eyebrow="Team" title="Chimera team" />
        <TeamLineup slots={chimera.team.map((s) => ({ slot: `Slot ${s.slot}`, text: s.champ, ids: s.ids, lines: [{ text: s.why }] }))} />
        <Rich as="p" text={chimera.after} className="mt-4 text-[0.82rem] leading-relaxed text-fg-muted" />
      </Card>
    </div>
  )
}

export function ClanBoss() {
  const { tab } = useParams()
  if (!tab) return <Navigate to="/clan-boss/demon-lord" replace />
  if (!tabs.some((t) => t.key === tab)) return <Navigate to="/clan-boss/demon-lord" replace />
  return (
    <div>
      <PageHeader eyebrow="Section 3 · Priority #1" title="Clan Boss" intro="Clan Boss is your #1 priority: Demon Lord, Hydra and Chimera." />
      <TabBar items={tabs} active={tab} className="mb-6" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'demon-lord' && <DemonLord />}
          {tab === 'hydra' && <Hydra />}
          {tab === 'chimera' && <Chimera />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
