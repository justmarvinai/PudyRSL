import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Star } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CoverageCell } from '../components/champion/Coverage'
import { AffinityTag, Portrait, RarityTag, useAffinity } from '../components/champion/Portrait'
import { SpeedGauge, speedMessage, speedStatus } from '../components/tools/SpeedGauge'
import { Check } from '../components/ui/Check'
import { NumberField, Stepper } from '../components/ui/Fields'
import { Segments } from '../components/ui/Progress'
import { highlightText, Rich } from '../components/ui/Rich'
import { Panel, Tag } from '../components/ui/primitives'
import { championById, champions, type Champion, type ChampionStep } from '../data/champions'
import { ukTeam, type TuneSlot } from '../data/clanBoss'
import { contentAreas } from '../data/guide'
import { epicTomes, legendaryTomes, rareTomes } from '../data/resources'
import type { Affinity, ChampionId } from '../data/types'
import { teamAppearances } from '../lib/appearances'
import { championProgress, championStatus, isRefDone, stepRef } from '../lib/checks'
import { cn } from '../lib/cn'
import { fmt, pct } from '../lib/format'
import { affinityColor, affinityFromRaid, affinityIcon, contentColor, raidForCore, raidSource, rarityColor, roleLabel } from '../lib/rsl'
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

const areaColor: Record<string, string> = {
  'Demon Lord': 'var(--color-cb)',
  Hydra: 'var(--color-hydra)',
  Chimera: 'var(--color-chimera)',
  "Spider's Den": 'var(--color-spider)',
  "Dragon's Lair": 'var(--color-dragon)',
  "Fire Knight's Castle": 'var(--color-fk)',
  "Ice Golem's Peak": 'var(--color-ig)',
  Arena: 'var(--color-arena)',
}

function StepRow({ c, step, index }: { c: Champion; step: ChampionStep; index: number }) {
  const ref = stepRef(c.id, step)
  const done = useStore((s) => isRefDone(s, ref))
  const setRefs = useStore((s) => s.setRefs)
  const count = useStore((s) => (step.tome ? (s.nums[`tome.${step.tome.counter}`] ?? 0) : 0))
  const setNum = useStore((s) => s.setNum)
  return (
    <div className={cn('flex items-center gap-3 rounded-[3px] border px-3.5 py-3 transition-colors', done ? 'border-edge' : 'border-edge bg-raised-2 hover:border-edge-2')}>
      <span className={cn('t-num w-6 shrink-0 text-[0.8rem]', done ? 'text-ok' : 'text-low')}>{String(index + 1).padStart(2, '0')}</span>
      <Check checked={done} onChange={(v) => setRefs([ref], v)} label={step.text} />
      <div className="min-w-0 flex-1">
        <Rich as="div" text={step.text} className={cn('text-[0.88rem]', done ? 'text-low line-through decoration-edge-2 [&_*]:!text-low' : 'text-hi')} />
        {step.status && <div className="mt-0.5 text-[0.7rem] text-low">Status after this step: {step.status}</div>}
      </div>
      {step.tome && <Stepper size="sm" value={count} max={tomeMax(step.tome.counter)} onChange={(v) => setNum(`tome.${step.tome!.counter}`, v)} />}
    </div>
  )
}

function Field({ label, children, aside }: { label: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="t-label text-low">{label}</span>
        {aside}
      </div>
      {children}
    </div>
  )
}

function Tracker({ c }: { c: Champion }) {
  const prog = useStore((s) => s.champs[c.id])
  const setChamp = useStore((s) => s.setChamp)
  const { affinity, source } = useAffinity(c.id)
  const slot = tuneSlotFor(c.id)
  const asc = prog?.asc ?? 0
  const affinities: Affinity[] = ['Magic', 'Spirit', 'Force', 'Void']
  const raid = raidForCore(c.id)
  const raidAffinity = raid ? affinityFromRaid(raid.affinity) : null
  const mine = prog?.affinity ?? null
  const st = speedStatus(prog?.speed, slot?.min ?? 0, slot?.max ?? 0)

  return (
    <Panel kicker="Your account" title="Tracker" bodyClassName="space-y-6">
      <Field label="Affinity">
        {source === 'guide' ? (
          <div className="flex flex-wrap items-center gap-2 text-[0.84rem] text-mid">
            <AffinityTag affinity={affinity} source="guide" />
            confirmed in the guide
            {c.affinitySource && (
              <a href={c.affinitySource} target="_blank" rel="noreferrer noopener" className="text-hi hover:text-paper" title="Source">
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-1">
              {affinities.map((a) => {
                const on = mine === a
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setChamp(c.id, { affinity: on ? null : a })}
                    className={cn('flex h-9 items-center justify-center gap-1.5 rounded-[3px] border text-[0.76rem] font-bold transition-colors', on ? 'text-ink' : 'border-edge-2 hover:border-mid')}
                    style={on ? { background: affinityColor[a], borderColor: affinityColor[a] } : { color: affinityColor[a] }}
                  >
                    <img src={affinityIcon[a]} alt="" className="h-3.5" />
                    {a}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[0.74rem] text-low">The guide says “check in-game” — record it here to use matched brews.</p>
            {raidAffinity && !mine && (
              <div className="well mt-2 flex items-center justify-between gap-3 px-3 py-2 text-[0.76rem] text-mid">
                <span>
                  raid-data (2021) lists{' '}
                  <span className="font-bold" style={{ color: affinityColor[raidAffinity] }}>
                    {raidAffinity}
                  </span>{' '}
                  — confirm in-game.
                </span>
                <button type="button" className="btn h-7 px-2 text-[0.72rem]" onClick={() => setChamp(c.id, { affinity: raidAffinity })}>
                  Use
                </button>
              </div>
            )}
          </>
        )}
      </Field>

      <Field label="Ascension" aside={<span className="text-[0.72rem] font-bold text-hi tabular-nums">{asc}/6</span>}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.8 }}
              onClick={() => setChamp(c.id, { asc: asc === i + 1 ? i : i + 1 })}
              aria-label={`Ascension ${i + 1}`}
              className="p-0.5"
            >
              <Star className={cn('size-6 transition-colors', i < asc ? 'fill-paper text-paper' : 'text-edge-2 hover:text-mid')} />
            </motion.button>
          ))}
        </div>
        <p className="mt-1.5 text-[0.74rem] text-low">Order: Asc 3 first (Deacon&apos;s extra turn), then 5 (Amulet), then 6 (Banner).</p>
      </Field>

      {slot && (
        <Field
          label="True speed"
          aside={
            <span className="text-[0.72rem] text-low">
              target <span className="font-bold text-hi">{slot.speed}</span>
            </span>
          }
        >
          <NumberField value={prog?.speed ?? null} onChange={(v) => setChamp(c.id, { speed: v })} placeholder="e.g. 240" min={0} max={400} />
          <SpeedGauge value={prog?.speed} min={slot.min} max={slot.max} className="mt-3" />
          <div className={cn('mt-2 text-xs font-bold', st === 'ok' ? 'text-ok' : st === 'empty' ? 'text-low' : 'text-bad')}>{speedMessage(prog?.speed, slot.min, slot.max)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <NumberField label="HP" value={prog?.hp ?? null} onChange={(v) => setChamp(c.id, { hp: v })} placeholder="e.g. 35000" min={0} />
            <NumberField label="DEF" value={prog?.def ?? null} onChange={(v) => setChamp(c.id, { def: v })} placeholder="e.g. 2000" min={0} />
          </div>
          <Link to="/clan-boss/demon-lord#tune-checker" className="t-label mt-3 inline-flex items-center gap-1 text-mid transition-colors hover:text-hi">
            Open the speed tune checker <ArrowUpRight className="size-3.5" />
          </Link>
        </Field>
      )}

      <Field label="Notes">
        <textarea
          defaultValue={prog?.notes ?? ''}
          onBlur={(e) => setChamp(c.id, { notes: e.target.value })}
          placeholder="Current gear, rank, anything to remember…"
          className="input min-h-24 resize-y"
        />
      </Field>
    </Panel>
  )
}

function InfoBlock({ title, lines }: { title: string; lines: string[] }) {
  if (lines.length === 0) return null
  return (
    <div>
      <div className="t-label mb-2 text-low">{title}</div>
      <ul className="space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2.5 text-[0.84rem] leading-relaxed text-mid">
            <span className="mt-[0.6rem] size-1.5 shrink-0 bg-low" />
            <Rich text={l} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const statLabels: [string, string][] = [
  ['hp', 'HP'],
  ['atk', 'ATK'],
  ['def', 'DEF'],
  ['spd', 'SPD'],
  ['crate', 'C.RATE'],
  ['cdmg', 'C.DMG'],
  ['resist', 'RES'],
  ['acc', 'ACC'],
]

/** Skills, base stats and faction from the bundled raid-data snapshot. */
function GameData({ c }: { c: Champion }) {
  const raid = raidForCore(c.id)
  if (!raid?.skills) return null
  const role = roleLabel(raid.role)
  return (
    <Panel
      kicker="Game data"
      title="Skills & base stats"
      action={<Tag title={`${raidSource.name} ${raidSource.version} · ${raidSource.license}`}>raid-data · game v{raid.gameVersion}</Tag>}
      padded={false}
    >
      <div className="grid grid-cols-2 gap-px border-b border-edge bg-edge sm:grid-cols-4">
        {[
          ['Faction', raid.faction],
          ['Role', role],
          ['Rarity', raid.rarity.charAt(0).toUpperCase() + raid.rarity.slice(1)],
          ['Aura', raid.auraText ?? raid.aura ?? '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-raised px-5 py-3">
            <div className="t-label text-low">{k}</div>
            <div className="mt-1 text-[0.82rem] font-semibold text-hi">{v}</div>
          </div>
        ))}
      </div>
      <div className="divide-y divide-edge">
        {raid.skills.map((s) => (
          <div key={s.slot} className="grid grid-cols-[auto_1fr] gap-x-4 px-5 py-4">
            <span className="term-skill mt-0.5 self-start text-[0.8rem]">{s.slot}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="t-title text-[0.98rem] text-hi">{s.name}</span>
                {s.passive && <Tag>Passive</Tag>}
                {s.cooldown && (
                  <Tag color="var(--color-hi)">
                    CD {s.cooldown}
                    {s.minCooldown && s.minCooldown < s.cooldown ? ` → ${s.minCooldown} booked` : ''}
                  </Tag>
                )}
                {s.books.length > 0 && <Tag>{s.books.length} books</Tag>}
              </div>
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-mid">{highlightText(s.description.replace(/\[([^\]]+)\]/g, '$1'))}</p>
              {s.books.length > 0 && <div className="mt-1.5 text-[0.72rem] text-low">{s.books.join(' · ')}</div>}
            </div>
          </div>
        ))}
      </div>
      {raid.stats && (
        <div className="border-t border-edge px-5 py-4">
          <div className="t-label mb-3 text-low">Base stats · 6★ Lv 60 · no gear</div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-3 sm:grid-cols-8">
            {statLabels.map(([k, label]) => (
              <div key={k}>
                <span className="term-stat text-[0.7rem]">{label}</span>
                <div className="t-num mt-1.5 text-[1.15rem] text-hi">
                  {fmt(raid.stats![k] ?? 0)}
                  {k === 'crate' || k === 'cdmg' ? '%' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="border-t border-edge px-5 py-3 text-[0.72rem] text-low">
        From {raidSource.name} {raidSource.version} ({raidSource.license}) — an April 2021 snapshot, not from your guide. Later reworks aren&apos;t included; your guide wins where they differ.
      </div>
    </Panel>
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
  const { affinity, source } = useAffinity((c?.id ?? 'maneater') as ChampionId)

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
  const complete = p.done === p.total
  const apps = teamAppearances(c.id)
  const raid = raidForCore(c.id)

  return (
    <div className="space-y-8">
      <section>
        <div className="t-label flex items-center gap-3 text-low">
          <Link to="/champions" className="text-hi transition-colors hover:text-paper">
            05
          </Link>
          <span className="h-px flex-1 bg-edge" />
          <span>
            Champion {String(idx + 1).padStart(2, '0')} of {champions.length}
          </span>
          <span className="flex gap-1">
            {prev && (
              <Link to={`/champions/${prev.id}`} className="btn h-7 px-1.5" title={`${prev.name} (←)`}>
                <ArrowLeft className="size-3.5" />
              </Link>
            )}
            {next && (
              <Link to={`/champions/${next.id}`} className="btn h-7 px-1.5" title={`${next.name} (→)`}>
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-[96px_1fr] items-end gap-x-6 gap-y-6 sm:grid-cols-[160px_1fr]">
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <Portrait id={c.id} fluid className="block" />
          </motion.div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1">
              <RarityTag rarity={c.rarity} />
              <AffinityTag affinity={affinity} source={source} />
              <Tag>Wave {c.wave}</Tag>
              <Tag>6★ wave: {c.waveLabel}</Tag>
              {raid && (
                <Tag title="From raid-data (2021)">
                  {raid.faction}
                </Tag>
              )}
            </div>
            <motion.h1
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="t-display mt-3 text-[clamp(2.2rem,5.4vw,4.6rem)] text-balance"
              style={{ color: rarityColor[c.rarity] }}
            >
              {c.name}
            </motion.h1>
            <p className="mt-3 max-w-3xl text-[1rem] text-mid">{c.tagline}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            {c.ratings.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {c.ratings.map((r) => (
                  <span key={r} className="rounded-[3px] border border-edge-2 px-2 py-0.5 text-[0.74rem] font-semibold text-mid">
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="min-w-[260px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="t-label text-low">Status</span>
              <span className="text-[0.74rem] text-low tabular-nums">
                {p.done}/{p.total} · {pct(p.done, p.total)}%
              </span>
            </div>
            <div className={cn('t-headline mt-1 text-[1.4rem]', complete ? 'text-ok' : 'text-hi')}>{status}</div>
            <Segments value={p.done} total={p.total} className="mt-2" height={6} color={complete ? 'var(--color-ok)' : 'var(--color-paper)'} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-[4px] border border-edge bg-edge sm:grid-cols-8">
          {contentAreas.map((a) => (
            <div key={a.key} className="flex flex-col items-center gap-2 bg-raised px-2 py-3 text-center" title={a.long}>
              <span className="t-label text-[0.62rem]" style={{ color: contentColor[a.key] }}>
                {a.label}
              </span>
              <CoverageCell value={c.coverage[a.key]} color={contentColor[a.key]} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Panel kicker="From the guide" title="Build journey" action={<span className="text-[0.74rem] text-low">Ticking a rank step also ticks the steps before it</span>}>
            <div className="space-y-1.5">
              {c.steps.map((st, i) => (
                <StepRow key={st.key} c={c} step={st} index={i} />
              ))}
            </div>
          </Panel>

          <Panel kicker="Teams" title={`Where ${c.short} fights`} action={<span className="text-[0.74rem] text-low tabular-nums">{apps.length} team slots</span>}>
            {apps.length === 0 ? (
              <div className="text-sm text-low">Not listed in any team table.</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {apps.map((a, i) => {
                  const color = areaColor[a.area] ?? 'var(--color-hi)'
                  return (
                    <Link
                      key={i}
                      to={a.to}
                      className="block rounded-[3px] border border-edge bg-raised-2 p-3.5 transition-colors hover:border-edge-2"
                      style={{ boxShadow: `inset 3px 0 0 ${color}` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="t-label" style={{ color }}>
                          {a.area}
                        </span>
                        <span className="truncate text-[0.68rem] text-low">{a.context}</span>
                      </div>
                      <div className="mt-1.5 text-[0.82rem] text-hi">
                        <span className="text-low">{/^\d+$/.test(a.slot) ? `Slot ${a.slot}` : a.slot}:</span> <Rich text={a.cell} links={false} />
                      </div>
                      {a.role && <Rich as="div" text={a.role} links={false} className="mt-1 text-[0.77rem] leading-snug text-mid" />}
                    </Link>
                  )
                })}
              </div>
            )}
          </Panel>

          <GameData c={c} />

          {(c.why.length > 0 || c.notes.length > 0) && (
            <Panel kicker="Section 1" title="Why this champion" bodyClassName="space-y-5">
              {c.why.length > 0 && (
                <div className="space-y-3">
                  {c.why.map((w, i) => (
                    <Rich key={i} as="p" text={w} className="text-[0.9rem] leading-relaxed text-mid" />
                  ))}
                </div>
              )}
              {c.notes.length > 0 && <InfoBlock title="Guide notes" lines={c.notes} />}
            </Panel>
          )}
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Tracker c={c} />
          <Panel kicker="From the guide" title="Build" bodyClassName="space-y-6">
            {c.speed && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="t-label text-low">Budget Maneater true speed</span>
                <span className="t-num text-[1.4rem] text-hi">{c.speed}</span>
              </div>
            )}
            <InfoBlock title="Gear" lines={c.gear} />
            <InfoBlock title="Masteries" lines={c.masteries} />
            <div>
              <div className="t-label mb-2 text-low">Brews to 60</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="well px-3 py-2.5" style={{ boxShadow: `inset 3px 0 0 ${affinity ? affinityColor[affinity] : 'var(--color-edge-2)'}` }}>
                  <div className="t-label text-low">Matched</div>
                  <div className="mt-1 text-[0.95rem] font-bold text-hi">{c.brews.matched}</div>
                </div>
                <div className="well px-3 py-2.5">
                  <div className="t-label text-low">Mismatched</div>
                  <div className="mt-1 text-[0.95rem] font-bold text-hi">{c.brews.mismatched}</div>
                </div>
              </div>
              <Link to="/resources/brews#brew-calculator" className="t-label mt-3 inline-flex items-center gap-1 text-mid transition-colors hover:text-hi">
                Brew calculator <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
