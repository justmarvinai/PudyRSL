import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Gauge, Hammer, ScrollText, Star, Swords, Target } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CoverageCell } from '../components/champion/Coverage'
import { affinityTone, rarityColor, Sigil, useAffinity } from '../components/champion/Sigil'
import { SpeedGauge, speedMessage, speedStatus } from '../components/tools/SpeedGauge'
import { Check } from '../components/ui/Check'
import { NumberField, Stepper } from '../components/ui/Fields'
import { ProgressRing } from '../components/ui/Progress'
import { Rich } from '../components/ui/Rich'
import { Card, Pill, SectionTitle } from '../components/ui/primitives'
import { championById, champions, type Champion, type ChampionStep } from '../data/champions'
import { ukTeam, type TuneSlot } from '../data/clanBoss'
import { contentAreas } from '../data/guide'
import { epicTomes, legendaryTomes, rareTomes } from '../data/resources'
import type { Affinity, ChampionId } from '../data/types'
import { teamAppearances } from '../lib/appearances'
import { championProgress, championStatus, isRefDone, stepRef } from '../lib/checks'
import { cn } from '../lib/cn'
import { pct } from '../lib/format'
import { useStore } from '../lib/store'
import { NotFound } from './NotFound'

export function tomeMax(counter: string): number {
  const leg = legendaryTomes.rows.find((r) => r.counter === counter)
  if (leg) return leg.tomes
  const epic = epicTomes.plans.find((p) => p.counter === counter)
  if (epic) return epic.total
  if (counter === rareTomes.counter) return rareTomes.full
  return 99
}

/** Budget Maneater slot for a champion (Artak covers the DPS slot on Force days). */
export function tuneSlotFor(id: ChampionId): TuneSlot | undefined {
  return ukTeam.slots.find((s) => s.ids.includes(id))
}

const affinityActive: Record<Affinity, string> = {
  Magic: 'border-magic/60 bg-magic/15 text-magic',
  Spirit: 'border-spirit/60 bg-spirit/15 text-spirit',
  Force: 'border-force/60 bg-force/15 text-force',
  Void: 'border-void/60 bg-void/15 text-void',
}

function StepRow({ c, step }: { c: Champion; step: ChampionStep }) {
  const ref = stepRef(c.id, step)
  const done = useStore((s) => isRefDone(s, ref))
  const setRefs = useStore((s) => s.setRefs)
  const count = useStore((s) => (step.tome ? (s.nums[`tome.${step.tome.counter}`] ?? 0) : 0))
  const setNum = useStore((s) => s.setNum)
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
        done ? 'border-white/[0.04] bg-white/[0.015]' : 'border-white/[0.07] bg-white/[0.025] hover:border-gold-400/20',
      )}
    >
      <Check checked={done} onChange={(v) => setRefs([ref], v)} label={step.text} />
      <div className="min-w-0 flex-1">
        <div className={cn('text-[0.86rem]', done ? 'text-fg-subtle line-through decoration-white/20' : 'text-fg')}>{step.text}</div>
        {step.status && <div className="mt-0.5 text-[0.7rem] text-fg-subtle">Status after this step: {step.status}</div>}
      </div>
      {step.tome && (
        <Stepper size="sm" value={count} max={tomeMax(step.tome.counter)} onChange={(v) => setNum(`tome.${step.tome!.counter}`, v)} />
      )}
    </div>
  )
}

function Tracker({ c }: { c: Champion }) {
  const prog = useStore((s) => s.champs[c.id])
  const setChamp = useStore((s) => s.setChamp)
  const { affinity, fromGuide } = useAffinity(c.id)
  const slot = tuneSlotFor(c.id)
  const asc = prog?.asc ?? 0
  const affinities: Affinity[] = ['Magic', 'Spirit', 'Force', 'Void']

  return (
    <Card className="space-y-5">
      <SectionTitle eyebrow="Your account" title="Tracker" className="mb-0" />

      <div>
        <div className="eyebrow mb-2">Affinity</div>
        {fromGuide ? (
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Pill tone={affinityTone[affinity!]}>{affinity}</Pill>
            confirmed in the guide
            {c.affinitySource && (
              <a href={c.affinitySource} target="_blank" rel="noreferrer noopener" className="text-gold-400 hover:text-gold-300" title="Source">
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {affinities.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setChamp(c.id, { affinity: affinity === a ? null : a })}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs font-semibold transition',
                    affinity === a ? affinityActive[a] : 'border-white/10 text-fg-muted hover:text-fg',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.72rem] text-fg-subtle">The guide says “check in-game” — record it here to use matched brews.</p>
          </>
        )}
      </div>

      <div>
        <div className="eyebrow mb-2">Ascension</div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.12 }}
              onClick={() => setChamp(c.id, { asc: asc === i + 1 ? i : i + 1 })}
              aria-label={`Ascension ${i + 1}`}
              className="p-0.5"
            >
              <Star className={cn('size-6 transition-colors', i < asc ? 'fill-gold-400 text-gold-400 drop-shadow-[0_0_6px_rgb(246_196_99/0.7)]' : 'text-white/15')} />
            </motion.button>
          ))}
          <span className="ml-2 text-xs text-fg-subtle tabular-nums">{asc}/6</span>
        </div>
        <p className="mt-1.5 text-[0.72rem] text-fg-subtle">Order: Asc 3 first (Deacon&apos;s extra turn), then 5 (Amulet), then 6 (Banner).</p>
      </div>

      {slot && (
        <div>
          <div className="eyebrow mb-2 flex items-center justify-between">
            <span>True speed</span>
            <span className="text-gold-400 normal-case tracking-normal">target {slot.speed}</span>
          </div>
          <NumberField value={prog?.speed ?? null} onChange={(v) => setChamp(c.id, { speed: v })} placeholder="e.g. 240" min={0} max={400} />
          <SpeedGauge value={prog?.speed} min={slot.min} max={slot.max} className="mt-3" />
          <div
            className={cn(
              'mt-2 text-xs font-semibold',
              speedStatus(prog?.speed, slot.min, slot.max) === 'ok' ? 'text-ok' : speedStatus(prog?.speed, slot.min, slot.max) === 'empty' ? 'text-fg-subtle' : 'text-bad',
            )}
          >
            {speedMessage(prog?.speed, slot.min, slot.max)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <NumberField label="HP" value={prog?.hp ?? null} onChange={(v) => setChamp(c.id, { hp: v })} placeholder="e.g. 35000" min={0} />
            <NumberField label="DEF" value={prog?.def ?? null} onChange={(v) => setChamp(c.id, { def: v })} placeholder="e.g. 2000" min={0} />
          </div>
          <Link to="/clan-boss/demon-lord#tune-checker" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300">
            Open the speed tune checker <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      )}

      <div>
        <div className="eyebrow mb-2">Notes</div>
        <textarea
          defaultValue={prog?.notes ?? ''}
          onBlur={(e) => setChamp(c.id, { notes: e.target.value })}
          placeholder="Current gear, rank, anything to remember…"
          className="input min-h-24 resize-y"
        />
      </div>
    </Card>
  )
}

function InfoBlock({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  if (lines.length === 0) return null
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[0.8rem] font-semibold text-fg">
        <span className="text-gold-400">{icon}</span>
        {title}
      </div>
      <ul className="space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2 text-[0.8rem] leading-relaxed text-fg-muted">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-gold-600" />
            <Rich text={l} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ChampionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = id ? championById[id as ChampionId] : undefined
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const idx = c ? champions.indexOf(c) : -1
  const prev = idx >= 0 ? champions[(idx - 1 + champions.length) % champions.length] : undefined
  const next = idx >= 0 ? champions[(idx + 1) % champions.length] : undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft' && prev) navigate(`/champions/${prev.id}`)
      if (e.key === 'ArrowRight' && next) navigate(`/champions/${next.id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, navigate])

  if (!c) return <NotFound />

  const p = championProgress({ flags, nums }, c)
  const status = championStatus({ flags, nums }, c)
  const col = rarityColor[c.rarity]
  const apps = teamAppearances(c.id)

  return (
    <div className="space-y-5">
      <Card padded={false} className="overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(ellipse at 12% 0%, ${col.to}33, transparent 55%)` }} />
        <div className="relative flex flex-wrap items-center gap-6 p-6">
          <motion.div initial={{ scale: 0.8, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
            <Sigil id={c.id} size={104} glow />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              <Pill tone={col.tone}>{c.rarity}</Pill>
              <Pill tone="neutral">Wave {c.wave}</Pill>
              <Pill tone="neutral">6★ wave: {c.waveLabel}</Pill>
              <AffinityPill id={c.id} />
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-wide text-fg">{c.name}</h1>
            <p className="mt-1 text-[0.95rem] text-fg-muted">{c.tagline}</p>
            {c.ratings.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.ratings.map((r) => (
                  <span key={r} className="rounded-md border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[0.72rem] text-fg-muted">
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={pct(p.done, p.total)} size={96} stroke={7}>
              <div className="text-center">
                <div className="text-xl font-bold text-fg tabular-nums">{pct(p.done, p.total)}%</div>
                <div className="text-[0.6rem] tracking-wider text-fg-subtle uppercase">
                  {p.done}/{p.total}
                </div>
              </div>
            </ProgressRing>
            <div>
              <div className="eyebrow">Status</div>
              <div className={cn('mt-0.5 text-lg font-semibold', status === 'R6 · Lv 60' ? 'text-ok' : 'text-fg')}>{status}</div>
              <div className="mt-2 flex gap-1.5">
                {prev && (
                  <Link to={`/champions/${prev.id}`} className="btn px-2" title={`${prev.name} (←)`}>
                    <ArrowLeft className="size-4" />
                  </Link>
                )}
                {next && (
                  <Link to={`/champions/${next.id}`} className="btn px-2" title={`${next.name} (→)`}>
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-4 gap-px border-t border-white/[0.06] bg-white/[0.04] sm:grid-cols-8">
          {contentAreas.map((a) => (
            <div key={a.key} className="flex flex-col items-center gap-1.5 bg-ink-900/80 px-2 py-3 text-center" title={a.long}>
              <span className="text-[0.62rem] font-bold tracking-wider text-fg-subtle uppercase">{a.label}</span>
              <CoverageCell value={c.coverage[a.key]} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <Card>
            <SectionTitle eyebrow="From the guide" title="Build journey" action={<span className="text-xs text-fg-subtle">Ticking a rank step also ticks the steps before it</span>} />
            <div className="space-y-2">
              {c.steps.map((st) => (
                <StepRow key={st.key} c={c} step={st} />
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Teams" title={`Where ${c.short} fights`} action={<span className="text-xs text-fg-subtle">{apps.length} team slots</span>} />
            {apps.length === 0 ? (
              <div className="text-sm text-fg-subtle">Not listed in any team table.</div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {apps.map((a, i) => (
                  <Link key={i} to={a.to} className="group card-flat block p-3.5 transition hover:border-gold-400/25 hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.8rem] font-semibold text-gold-300">{a.area}</span>
                      <span className="text-[0.68rem] text-fg-subtle">{a.context}</span>
                    </div>
                    <div className="mt-1 text-[0.78rem] text-fg">
                      <span className="text-fg-subtle">{/^\d+$/.test(a.slot) ? `Slot ${a.slot}` : a.slot}:</span> <Rich text={a.cell} />
                    </div>
                    {a.role && <div className="mt-1 text-[0.76rem] leading-snug text-fg-muted">{a.role}</div>}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {(c.why.length > 0 || c.notes.length > 0) && (
            <Card className="space-y-5">
              {c.why.length > 0 && (
                <div>
                  <SectionTitle eyebrow="Section 1" title="Why this champion" className="mb-3" />
                  <div className="space-y-3">
                    {c.why.map((w, i) => (
                      <Rich key={i} as="p" text={w} className="text-[0.86rem] leading-relaxed text-fg-muted" />
                    ))}
                  </div>
                </div>
              )}
              {c.notes.length > 0 && <InfoBlock icon={<ScrollText className="size-4" />} title="Guide notes" lines={c.notes} />}
            </Card>
          )}
        </div>

        <div className="space-y-5 xl:col-span-4">
          <Tracker c={c} />
          <Card className="space-y-5">
            <SectionTitle eyebrow="From the guide" title="Build" className="mb-0" />
            {c.speed && (
              <div className="flex items-center gap-2 text-sm">
                <Gauge className="size-4 text-gold-400" />
                <span className="text-fg-muted">Budget Maneater true speed:</span>
                <span className="font-semibold text-fg">{c.speed}</span>
              </div>
            )}
            <InfoBlock icon={<Hammer className="size-4" />} title="Gear" lines={c.gear} />
            <InfoBlock icon={<Swords className="size-4" />} title="Masteries" lines={c.masteries} />
            <div>
              <div className="mb-2 flex items-center gap-2 text-[0.8rem] font-semibold text-fg">
                <Target className="size-4 text-gold-400" /> Brews to 60
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="card-flat px-3 py-2">
                  <div className="eyebrow">Matched</div>
                  <div className="mt-0.5 text-sm font-semibold text-fg">{c.brews.matched}</div>
                </div>
                <div className="card-flat px-3 py-2">
                  <div className="eyebrow">Mismatched</div>
                  <div className="mt-0.5 text-sm font-semibold text-fg">{c.brews.mismatched}</div>
                </div>
              </div>
              <Link to="/resources/brews#brew-calculator" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300">
                Brew calculator <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AffinityPill({ id }: { id: ChampionId }) {
  const { affinity, fromGuide } = useAffinity(id)
  if (!affinity)
    return (
      <Pill tone="neutral" className="text-fg-subtle">
        Affinity: check in-game
      </Pill>
    )
  return (
    <Pill tone={affinityTone[affinity]} title={fromGuide ? 'Confirmed in the guide' : 'Recorded by you'}>
      {affinity}
      {!fromGuide && ' (yours)'}
    </Pill>
  )
}
