import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, KeyRound } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Portrait } from '../components/champion/Portrait'
import { TeamLineup } from '../components/champion/TeamLineup'
import { PageHeader } from '../components/layout/PageHeader'
import { KeyPlanner } from '../components/tools/KeyPlanner'
import { TuneChecker } from '../components/tools/TuneChecker'
import { Segmented } from '../components/ui/Fields'
import { LabelTag, Rich } from '../components/ui/Rich'
import { TabBar } from '../components/ui/Tabs'
import { Callout, Panel, SectionHead, Tag } from '../components/ui/primitives'
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
import { DEMON_LORD_ART, difficultyColor, raidData, raidForCore } from '../lib/rsl'
import { useStore, useWeeklyCounts } from '../lib/store'

const tabs = [
  { key: 'demon-lord', label: 'Demon Lord', color: 'var(--color-cb)', to: '/clan-boss/demon-lord' },
  { key: 'hydra', label: 'Hydra', color: 'var(--color-hydra)', to: '/clan-boss/hydra' },
  { key: 'chimera', label: 'Chimera', color: 'var(--color-chimera)', to: '/clan-boss/chimera' },
]

const diffShort = (d: DifficultyKey) => (d === 'unm' ? 'UNM' : d === 'nm' ? 'NM' : difficultyNames[d])

function WeeklyKeyTracker({ id, color }: { id: 'hydra' | 'chimera'; color: string }) {
  const now = useNow()
  const counts = useWeeklyCounts(now)
  const setWeekly = useStore((s) => s.setWeekly)
  const resetDay = useStore((s) => s.weeklyResetDay)
  const resetHour = useStore((s) => s.dailyResetHour)
  const w = weeklyKeys.find((k) => k.id === id)!
  const used = counts[id] ?? 0
  return (
    <div className="panel flex flex-wrap items-center gap-4 px-5 py-4" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
      <div>
        <div className="t-label" style={{ color }}>
          This week
        </div>
        <div className="mt-1 text-[0.95rem] font-bold text-hi">{w.title}</div>
        <div className="text-[0.74rem] text-low tabular-nums">
          {used}/{w.total} used · resets in {formatCountdown(nextWeeklyReset(now, resetDay, resetHour).getTime() - now.getTime())}
        </div>
      </div>
      <div className="ml-auto flex gap-1.5">
        {Array.from({ length: w.total }).map((_, i) => (
          <motion.button
            key={i}
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setWeekly(id, used === i + 1 ? i : i + 1)}
            className={cn('grid size-11 place-items-center rounded-[4px] border transition-colors', i < used ? 'text-ink' : 'border-edge-2 text-low hover:border-mid hover:text-hi')}
            style={i < used ? { background: color, borderColor: color } : undefined}
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
    <div className="space-y-14">
      <div className="panel grid grid-cols-1 overflow-hidden sm:grid-cols-[180px_1fr]">
        <div className="relative hidden sm:block" style={{ boxShadow: 'inset -3px 0 0 var(--color-cb)' }}>
          <img src={DEMON_LORD_ART} alt="Demon Lord" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="p-5 sm:p-6">
          <div className="t-label text-cb">Demon Lord · daily</div>
          <Rich as="p" text={clanBossIntro} className="mt-2 max-w-3xl text-[0.92rem] leading-relaxed text-mid" />
          <div className="mt-5">
            <div className="t-label mb-2 text-low">Highest difficulty you clear</div>
            <Segmented
              size="sm"
              value={cbDifficulty ?? ('' as DifficultyKey)}
              onChange={(d) => setCbDifficulty(d === cbDifficulty ? null : d)}
              options={difficultyOrder.map((d) => ({ value: d, label: diffShort(d), color: difficultyColor[d] }))}
            />
          </div>
        </div>
      </div>

      <section>
        <SectionHead index="01" title="Rules that shape everything" label={demonLordRules.label} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Panel className="xl:col-span-2" kicker="Demon Lord" title="Immune to">
            <div className="mb-5 flex flex-wrap gap-1.5">
              {demonLordRules.immunities.map((im) => {
                const icon = raidData.icons[im]?.src
                return (
                  <span key={im} className="tag h-7 px-2 text-[0.7rem]" style={{ '--c': 'var(--color-debuff)' } as CSSProperties}>
                    {icon && <img src={icon} alt="" className="size-4 opacity-90 grayscale-[0.2]" />}
                    <span className="line-through decoration-1">{im}</span>
                  </span>
                )
              })}
            </div>
            <ul className="space-y-3">
              {demonLordRules.items.map((t) => (
                <li key={t} className="flex gap-2.5 text-[0.86rem] leading-relaxed text-mid">
                  <span className="mt-[0.6rem] size-1.5 shrink-0 bg-cb" />
                  <Rich text={t} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel id="difficulty" className="scroll-mt-24 xl:col-span-3" kicker="Requirements" title="Speed & accuracy by difficulty" padded={false}>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="pl-5">Difficulty</th>
                    <th>Speed</th>
                    <th>Accuracy (DWJ)</th>
                    <th>Accuracy (Ayumilove)</th>
                  </tr>
                </thead>
                <tbody>
                  {difficultyRequirements.rows.map((r) => {
                    const mine = cbDifficulty === r.key
                    return (
                      <tr key={r.key} style={mine ? { boxShadow: `inset 3px 0 0 ${difficultyColor[r.key]}` } : undefined}>
                        <td className="pl-5">
                          <span className="inline-flex items-center gap-2 font-bold" style={{ color: difficultyColor[r.key] }}>
                            <span className="dot" style={{ '--c': difficultyColor[r.key] } as CSSProperties} />
                            {difficultyNames[r.key]}
                          </span>
                          {mine && (
                            <Tag color={difficultyColor[r.key]} solid className="ml-2">
                              You
                            </Tag>
                          )}
                        </td>
                        <td className="font-bold text-hi tabular-nums">{r.speed}</td>
                        <td className="font-bold text-hi tabular-nums">{r.accDwj}</td>
                        <td className="tabular-nums">{r.accAyu}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Rich as="p" text={difficultyRequirements.sources} className="border-t border-edge px-5 py-3 text-[0.74rem] text-low" />
          </Panel>
        </div>
      </section>

      <section id="starter-team" className="scroll-mt-24">
        <SectionHead index="02" title={starterTeam.title} label={starterTeam.label} />
        <TeamLineup
          slots={starterTeam.slots.map((s) => ({
            slot: s.slot,
            text: s.champ,
            ids: s.ids,
            lines: [{ text: s.role }, { label: 'Note', text: s.notes }],
          }))}
        />
        <Rich as="p" text={starterTeam.after} className="mt-4 max-w-4xl text-[0.86rem] leading-relaxed text-mid" />
      </section>

      <section id="uk-team" className="scroll-mt-24">
        <SectionHead index="03" title={ukTeam.title} label={ukTeam.label} />
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
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel kicker="DeadwoodJedi" title="Tune rules">
            <Rich as="p" text={ukTeam.rulesIntro} className="mb-3 text-[0.82rem] text-low" />
            <ul className="space-y-2.5">
              {ukTeam.rules.map((r) => (
                <li key={r} className="flex gap-2.5 text-[0.86rem] leading-relaxed text-mid">
                  <span className="mt-[0.6rem] size-1.5 shrink-0 bg-paper" />
                  <Rich text={r} />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel
            id="openers"
            className="scroll-mt-24"
            kicker="Turn order"
            title="Openers"
            action={
              <Segmented
                size="sm"
                value={opener}
                onChange={setOpener}
                options={openers.map((o) => ({ value: o.key, label: o.key === 'brutal' ? 'Brutal' : o.key.toUpperCase(), color: difficultyColor[o.key] }))}
              />
            }
          >
            <AnimatePresence mode="wait">
              <motion.div key={opener} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="space-y-1.5">
                {op.lines.map((l) => {
                  const hasSkills = !!raidForCore(l.id)?.skills
                  return (
                    <div key={l.id} className="well flex flex-wrap items-center gap-3 px-3 py-2.5">
                      <Link to={`/champions/${l.id}`} data-tip={`champ:${l.id}`}>
                        <Portrait id={l.id} size={30} showAffinity={false} />
                      </Link>
                      <span className="w-24 text-[0.86rem] font-bold text-hi">{l.champ}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {l.seq.map((a, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            {i > 0 && <ArrowRight className="size-3.5 text-low" />}
                            <motion.span
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * i }}
                              className="term-skill text-[0.8rem]"
                              data-tip={hasSkills ? `skill:${l.id}:${a}` : undefined}
                            >
                              {a}
                            </motion.span>
                          </span>
                        ))}
                      </div>
                      {l.note && <span className="text-[0.74rem] text-low">{l.note}</span>}
                    </div>
                  )
                })}
                {op.after && <div className="pl-1 text-[0.76rem] text-low">…{op.after}.</div>}
              </motion.div>
            </AnimatePresence>
            <Rich as="p" text={ukTeam.openersText} className="mt-4 text-[0.74rem] leading-relaxed text-low" />
          </Panel>
        </div>
        <Callout tone="warn" className="mt-6" text={ukTeam.caveat} />
      </section>

      <section>
        <SectionHead index="04" title="Check your tune" />
        <TuneChecker />
      </section>

      <section>
        <SectionHead index="05" title="Difficulty timeline" label={difficultyTimeline.label} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {difficultyTimeline.rows.map((r, i) => {
            const isNow = inRange(day, r.days)
            return (
              <motion.div
                key={r.when}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn('panel p-5', isNow && 'border-edge-2 bg-raised-2')}
                style={isNow ? { boxShadow: 'inset 0 3px 0 var(--color-paper)' } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="t-label text-low">{r.when}</span>
                  {isNow && (
                    <Tag color="var(--color-paper)" solid>
                      Now
                    </Tag>
                  )}
                </div>
                <Rich as="div" text={r.difficulty} className="t-headline mt-3 text-[1.3rem] text-hi" />
                <Rich as="div" text={r.team} className="mt-1 text-[0.84rem] font-semibold text-mid" />
                <Rich as="p" text={r.why} className="mt-3 text-[0.8rem] leading-relaxed text-low" />
              </motion.div>
            )
          })}
        </div>
      </section>

      <section>
        <SectionHead index="06" title="Plan your keys" />
        <KeyPlanner />
      </section>
    </div>
  )
}

function Facts({ facts, label, color }: { facts: string[]; label: string; color: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {facts.map((f) => (
        <Tag key={f} color={color}>
          {f}
        </Tag>
      ))}
      <LabelTag label={label} />
    </div>
  )
}

function Hydra() {
  const color = 'var(--color-hydra)'
  return (
    <div className="space-y-14">
      <section>
        <Facts facts={hydra.facts} label={hydra.label} color={color} />
        <SectionHead index="01" title="Heads & counters" className="mt-8" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {hydra.heads.map((h, i) => {
            const weak = h.names.includes('Torment')
            return (
              <motion.div
                key={h.names.join()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="panel p-5"
                style={{ boxShadow: `inset 0 3px 0 ${weak ? 'var(--color-bad)' : color}` }}
              >
                <div className="t-label text-low">{h.names.length > 1 ? 'Heads' : 'Head'}</div>
                <div className="t-headline mt-2 text-[1.35rem] text-hi">{h.names.join(' / ')}</div>
                <div className="mt-4 border-t border-edge pt-3">
                  <div className="t-label mb-1 text-low">Counter</div>
                  <Rich as="div" text={h.counter} className="text-[0.86rem] leading-snug text-mid" />
                </div>
                {weak && (
                  <Tag color="var(--color-bad)" className="mt-4">
                    Your weak head
                  </Tag>
                )}
              </motion.div>
            )
          })}
        </div>
        <Rich as="p" text={hydra.countersText} className="mt-4 max-w-5xl text-[0.78rem] leading-relaxed text-low" />
      </section>

      <WeeklyKeyTracker id="hydra" color={color} />

      <section>
        <SectionHead index="02" title="Hydra keys" />
        <div className="panel divide-y divide-edge">
          {hydra.keys.map((k) => (
            <div key={k.key} className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[150px_1fr_1.1fr]">
              <div className="t-headline text-[1.4rem]" style={{ color }}>
                {k.key}
              </div>
              <div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {k.ids.map((id) => (
                    <Link key={id} to={`/champions/${id}`} data-tip={`champ:${id}`} className="transition-transform hover:-translate-y-0.5">
                      <Portrait id={id} size={40} />
                    </Link>
                  ))}
                </div>
                <Rich as="div" text={k.team} className="text-[0.86rem] font-semibold text-hi" />
              </div>
              <Rich as="div" text={k.roles} className="text-[0.86rem] leading-relaxed text-mid" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {hydra.notes.map((n, i) => (
          <Callout key={i} tone={i === 0 ? 'warn' : i === 1 ? 'danger' : 'info'} text={n} />
        ))}
      </div>
    </div>
  )
}

const formColor: Record<string, string> = {
  Ultimate: 'var(--color-chimera)',
  Ram: 'var(--color-rare)',
  Lion: 'var(--color-legendary)',
  Viper: 'var(--color-spirit)',
}

function Chimera() {
  const color = 'var(--color-chimera)'
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
    <div className="space-y-14">
      <section>
        <Facts facts={chimera.facts} label={chimera.label} color={color} />
        <SectionHead index="01" title="Forms cycle every 5 turns" className="mt-8" />
        <Panel onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="flex flex-wrap items-center gap-2">
            {chimera.cycle.map((f, i) => {
              const on = i === active
              const c = formColor[f]
              return (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight className={cn('size-4 transition-colors', i <= active ? 'text-mid' : 'text-edge-2')} />}
                  <motion.button
                    type="button"
                    onClick={() => setActive(i)}
                    animate={{ scale: on ? 1.06 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                    className={cn('rounded-[3px] border-2 px-3.5 py-2 text-[0.82rem] font-extrabold uppercase transition-colors [font-stretch:110%]', on ? 'text-ink' : 'text-low')}
                    style={on ? { background: c, borderColor: c } : { borderColor: 'var(--color-edge-2)' }}
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
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="well mt-4 px-4 py-3 text-[0.9rem] text-mid"
              style={{ boxShadow: `inset 3px 0 0 ${formColor[form]}` }}
            >
              <span className="font-extrabold" style={{ color: formColor[form] }}>
                {form}
              </span>{' '}
              <Rich text={desc.text} />.
            </motion.div>
          </AnimatePresence>
        </Panel>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {chimera.forms.map((f) => (
            <div key={f.form} className="panel p-5" style={{ boxShadow: `inset 0 3px 0 ${formColor[f.form]}` }}>
              <div className="t-headline text-[1.3rem]" style={{ color: formColor[f.form] }}>
                {f.form}
              </div>
              <Rich as="div" text={f.text} className="mt-2 text-[0.84rem] leading-relaxed text-mid" />
            </div>
          ))}
        </div>
        <Rich as="p" text={`Sources: ${chimera.sources}`} className="mt-4 text-[0.74rem] text-low" />
      </section>

      <WeeklyKeyTracker id="chimera" color={color} />

      <section>
        <SectionHead index="02" title="Chimera team" />
        <TeamLineup slots={chimera.team.map((s) => ({ slot: `Slot ${s.slot}`, text: s.champ, ids: s.ids, lines: [{ text: s.why }] }))} />
        <Rich as="p" text={chimera.after} className="mt-4 max-w-4xl text-[0.86rem] leading-relaxed text-mid" />
      </section>
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
      <TabBar items={tabs} active={tab} className="mb-10" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === 'demon-lord' && <DemonLord />}
          {tab === 'hydra' && <Hydra />}
          {tab === 'chimera' && <Chimera />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
