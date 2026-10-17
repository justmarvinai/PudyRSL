import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Info, Lock, Unlock } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { AffinityTag, Portrait, useAffinity } from '../components/champion/Portrait'
import { PageHeader } from '../components/layout/PageHeader'
import { Check } from '../components/ui/Check'
import { NumberField, SegmentPicker, Select, Stepper, Toggle } from '../components/ui/Fields'
import { Bar } from '../components/ui/Progress'
import { LabelTag, Rich } from '../components/ui/Rich'
import { TabBar } from '../components/ui/Tabs'
import { Callout, Panel, SectionHead, Tag } from '../components/ui/primitives'
import { championById, champions } from '../data/champions'
import { accountSnapshot } from '../data/guide'
import { levelCaps } from '../data/rankUp'
import {
  brews,
  energy,
  epicTomes,
  gearByChampion,
  gems,
  greatHall,
  legendaryTomes,
  masteries,
  mythicTomes,
  rareTomes,
  resourcesIntro,
  setSources,
  silver,
  unlocks,
  type BudgetRow,
} from '../data/resources'
import type { Affinity, ChampionId, Rarity } from '../data/types'
import { brewPaths, brewPlan, pathProblem, XP_PER_BREW, XP_PER_BREW_MATCHED } from '../lib/brews'
import { stepFlag } from '../lib/checks'
import { cn } from '../lib/cn'
import { accountLevel, brewsUsed, gemsSpent, tomeStock, tomesUsed } from '../lib/derived'
import { compact, fmt, pct } from '../lib/format'
import { rarityColor, resourceIcon, tomeIcon } from '../lib/rsl'
import { useStore } from '../lib/store'

const tabs = [
  { key: 'brews', label: 'Brews', to: '/resources/brews' },
  { key: 'tomes', label: 'Tomes', color: 'var(--color-legendary)', to: '/resources/tomes' },
  { key: 'masteries', label: 'Masteries', to: '/resources/masteries' },
  { key: 'energy', label: 'Energy', to: '/resources/energy' },
  { key: 'gems', label: 'Gems', color: 'var(--color-gems)', to: '/resources/gems' },
  { key: 'silver', label: 'Silver', color: 'var(--color-silver)', to: '/resources/silver' },
  { key: 'hall', label: 'Great Hall & gear', color: 'var(--color-gear)', to: '/resources/hall' },
]

function ChampLink({ id, size = 26, children }: { id: ChampionId; size?: number; children?: ReactNode }) {
  const c = championById[id]
  return (
    <Link to={`/champions/${id}`} data-tip={`champ:${id}`} className="flex items-center gap-2.5 font-bold" style={{ color: rarityColor[c.rarity] }}>
      <Portrait id={id} size={size} showAffinity={false} />
      {children ?? c.short}
    </Link>
  )
}

// ---------------- Brews ----------------

const assumedRank: Record<Rarity, number> = { Mythical: 6, Legendary: 5, Epic: 4, Rare: 3 }

function AffinityCell({ ids, guide }: { ids: ChampionId[]; guide: string }) {
  const champs = useStore((s) => s.champs)
  if (guide !== 'check in-game') return <AffinityTag affinity={guide as Affinity} source="guide" />
  const mine = ids.map((id) => ({ id, a: champs[id]?.affinity })).filter((x) => x.a)
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-low italic">check in-game</span>
      {mine.map((m) => (
        <span key={m.id} className="inline-flex items-center gap-1">
          <span className="text-[0.72rem] text-low">{championById[m.id].short}:</span>
          <AffinityTag affinity={m.a!} source="yours" />
        </span>
      ))}
    </div>
  )
}

function BrewCalculator() {
  const [champ, setChamp] = useState<ChampionId | 'custom'>('maneater')
  const [ranks, setRanks] = useState<number[]>(brewPaths.maneater.ranks)
  const [matched, setMatched] = useState(true)
  const c = champ === 'custom' ? null : championById[champ]
  const { affinity } = useAffinity(champ === 'custom' ? 'maneater' : champ)
  const sorted = [...ranks].sort((a, b) => a - b)
  const res = brewPlan(sorted, matched ? XP_PER_BREW_MATCHED : XP_PER_BREW)
  const other = brewPlan(sorted, matched ? XP_PER_BREW : XP_PER_BREW_MATCHED)
  const problem = pathProblem(sorted)
  const isPreset = c !== null && brewPaths[c.id].ranks.join() === sorted.join()

  const toggleRank = (r: number) => setRanks((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]))

  return (
    <Panel id="brew-calculator" className="scroll-mt-24" kicker="Tool" title="Brew calculator" label="Calculated from the guide's XP table">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <Select
            label="Champion"
            value={champ}
            onChange={(v) => {
              setChamp(v)
              if (v !== 'custom') setRanks(brewPaths[v].ranks)
            }}
            options={[...champions.map((x) => ({ value: x.id, label: `${x.name} (${x.rarity})` })), { value: 'custom' as const, label: 'Custom path' }]}
          />
          <div>
            <div className="t-label mb-2 text-low">Ranks you level (Lv 1 → cap)</div>
            <div className="grid grid-cols-4 gap-1">
              {[3, 4, 5, 6].map((r) => {
                const on = ranks.includes(r)
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRank(r)}
                    aria-pressed={on}
                    className={cn('h-10 rounded-[3px] border text-[0.8rem] font-bold transition-colors', on ? 'border-paper bg-paper text-ink' : 'border-edge-2 text-low hover:border-mid hover:text-hi')}
                  >
                    {r}★ <span className={cn('font-semibold', on ? 'text-ink/60' : 'text-low')}>Lv {levelCaps[r]}</span>
                  </button>
                )
              })}
            </div>
            {sorted.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.76rem]">
                {sorted.map((r, i) => (
                  <span key={r} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <Tag color={r - sorted[i - 1] > 1 ? 'var(--color-epic)' : undefined}>{r - sorted[i - 1] > 1 ? 'Feast' : 'rank up'}</Tag>
                    )}
                    <span className="font-semibold text-hi">
                      {r}★ L{levelCaps[r]}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {c && <div className="mt-2 text-[0.74rem] text-low">Guide path: {brewPaths[c.id].path}</div>}
          </div>
          <Toggle checked={matched} onChange={setMatched} label={`Brew affinity matches${c ? ` ${c.short}` : ''} (18,750 XP each)`} />
          {c && (
            <div className="text-[0.76rem] text-low">
              {affinity ? (
                <>
                  {c.short} is <Rich text={affinity} /> — use {affinity} brews for the matched rate.
                </>
              ) : (
                <>
                  {c.short}&apos;s affinity isn&apos;t confirmed —{' '}
                  <Link to={`/champions/${c.id}`} className="font-bold text-hi underline decoration-edge-2 underline-offset-4 hover:decoration-paper">
                    record it on the champion page
                  </Link>
                  .
                </>
              )}{' '}
              The guide assumes {c.rarity}s start at {assumedRank[c.rarity]}★.
            </div>
          )}
        </div>
        <div className="well p-5">
          {sorted.length === 0 ? (
            <div className="text-sm text-mid">{c?.id === 'gizmak' ? 'Gizmak needs no brews — the XP Barrel maxes him at Rank 6.' : 'Pick the ranks you will level.'}</div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <div className="t-label text-low">{matched ? 'Matched' : 'Mismatched'} brews</div>
                  <motion.div key={`${res.brews}-${matched}`} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="t-display mt-2 text-[3.4rem] leading-[0.85] text-hi">
                    {res.brews}
                  </motion.div>
                </div>
                <div>
                  <div className="t-label text-low">XP needed</div>
                  <div className="t-num mt-2 text-[1.35rem] text-hi">{fmt(res.xp)}</div>
                </div>
                <div>
                  <div className="t-label text-low">{matched ? 'Mismatched' : 'Matched'} instead</div>
                  <div className="t-num mt-2 text-[1.35rem] text-mid">{other.brews}</div>
                </div>
              </div>
              <div className="mt-5 space-y-1">
                {res.parts.map((p) => (
                  <div key={p.rank} className="flex items-center justify-between rounded-[3px] border border-edge px-3 py-2 text-[0.82rem]">
                    <span className="font-semibold text-mid">
                      {p.rank}★ Lv 1 → {levelCaps[p.rank]}
                    </span>
                    <span className="text-low tabular-nums">
                      {fmt(p.xp)} XP → <span className="font-bold text-hi">{p.brews}</span> brews
                    </span>
                  </div>
                ))}
              </div>
              {problem && <div className="mt-3 text-[0.76rem] font-bold text-warn">{problem}</div>}
              {isPreset && c && (
                <div className="mt-3 text-[0.76rem] text-mid">
                  Guide table for {c.short}: <span className="font-bold text-hi">{c.brews.matched}</span> matched · <span className="font-bold text-hi">{c.brews.mismatched}</span> mismatched.
                </div>
              )}
              <div className="mt-2 text-[0.72rem] text-low">Rounded up per rank, the same way the guide&apos;s brew table is built. Rank-ups need fodder (see the 6★ plan).</div>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}

function BrewsTab() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const used = brewsUsed(nums)
  const [add, setAdd] = useState<number | null>(null)
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" kicker="Section 6" title={brews.title} label={brews.label}>
          <Rich as="p" text={brews.text} className="text-[0.9rem] leading-relaxed text-mid" />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="well p-4">
              <div className="t-label text-low">Per brew</div>
              <div className="t-num mt-2 text-[1.6rem] text-hi">{fmt(brews.xp)} XP</div>
            </div>
            <div className="well p-4" style={{ boxShadow: 'inset 3px 0 0 var(--color-ok)' }}>
              <div className="t-label text-ok">Affinity matches</div>
              <div className="t-num mt-2 text-[1.6rem] text-hi">{fmt(brews.xpMatched)} XP</div>
            </div>
          </div>
        </Panel>
        <Panel kicker="Your stock" title="Brews left">
          <div className="t-display text-[3.4rem] leading-[0.85] text-hi">{fmt(accountSnapshot.brews - used)}</div>
          <div className="mt-2 text-[0.76rem] text-low">
            {fmt(used)} used of {fmt(accountSnapshot.brews)} ({accountSnapshot.brewXp})
          </div>
          <Bar value={((accountSnapshot.brews - used) / accountSnapshot.brews) * 100} className="mt-3" height={6} />
          <form
            className="mt-5 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (add) setNum('spent.brews', Math.max(0, used + add))
              setAdd(null)
            }}
          >
            <NumberField label="Log brews used" value={add} onChange={setAdd} placeholder="e.g. 108" className="flex-1" />
            <button type="submit" className="btn btn-primary h-9" disabled={!add}>
              Log
            </button>
          </form>
          {used > 0 && (
            <button type="button" onClick={() => setNum('spent.brews', 0)} className="mt-2 text-[0.74rem] font-semibold text-low hover:text-bad">
              Reset brew count
            </button>
          )}
        </Panel>
      </div>

      <section>
        <SectionHead index="01" title="Brews per core champion" intro="Brews to Level 60, by affinity." />
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl min-w-[720px]">
              <thead>
                <tr>
                  <th className="pl-5">Champion</th>
                  <th>Affinity</th>
                  <th>Matched brews</th>
                  <th>Mismatched</th>
                </tr>
              </thead>
              <tbody>
                {brews.table.map((r) => (
                  <tr key={r.champs}>
                    <td className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {r.ids.map((id) => (
                            <Link key={id} to={`/champions/${id}`} data-tip={`champ:${id}`}>
                              <Portrait id={id} size={24} showAffinity={false} />
                            </Link>
                          ))}
                        </div>
                        <Rich text={r.champs} className="font-semibold text-hi" />
                      </div>
                    </td>
                    <td>
                      <AffinityCell ids={r.ids} guide={r.affinity} />
                    </td>
                    <td className="t-num text-[1rem] text-hi">{r.matched}</td>
                    <td className="tabular-nums">
                      {r.mismatched}
                      {r.champs === 'Seer, Ruella' && (
                        <span
                          className="ml-1.5 inline-flex translate-y-0.5 cursor-help text-low"
                          data-tip={`text:${encodeURIComponent('Per-rank rounding (as used for every other row) gives 36 + 78 + 161 = 275. The guide lists 276.')}`}
                        >
                          <Info className="size-3.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-edge px-5 py-4">
            <Rich as="p" text={brews.myCall} className="text-[0.86rem] leading-relaxed text-mid" />
          </div>
        </div>
      </section>

      <section>
        <SectionHead index="02" title="Calculate any path" />
        <BrewCalculator />
      </section>
    </div>
  )
}

// ---------------- Tomes ----------------

function TomeSummary() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const used = tomesUsed(nums)
  const stock = tomeStock(nums)
  const rows: { key: 'legendary' | 'epic' | 'rare' | 'mythic'; label: string; color: string; icon?: string }[] = [
    { key: 'legendary', label: 'Legendary', color: 'var(--color-legendary)', icon: tomeIcon.legendary },
    { key: 'epic', label: 'Epic', color: 'var(--color-epic)', icon: tomeIcon.epic },
    { key: 'rare', label: 'Rare', color: 'var(--color-rare)', icon: tomeIcon.rare },
    { key: 'mythic', label: 'Mythic', color: 'var(--color-mythical)' },
  ]
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-edge bg-edge lg:grid-cols-4">
      {rows.map((r) => {
        const left = stock[r.key] - used[r.key]
        return (
          <div key={r.key} className="bg-raised p-5" style={{ boxShadow: `inset 0 3px 0 ${r.color}` }}>
            <div className="flex items-center gap-2">
              {r.icon && <img src={r.icon} alt="" className="size-5" />}
              <span className="t-label" style={{ color: r.color }}>
                {r.label} tomes
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={cn('t-display text-[3rem] leading-[0.85]', left < 0 ? 'text-bad' : 'text-hi')}>{left}</span>
              <span className="text-[0.8rem] font-semibold text-low">left</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[0.74rem] text-low">
              <span className="tabular-nums">{used[r.key]} used</span>
              <span className="flex items-center gap-1.5">
                stock
                <NumberField
                  value={stock[r.key]}
                  onChange={(v) => setNum(`stock.tomes.${r.key}`, v ?? 0)}
                  allowEmpty={false}
                  min={0}
                  className="w-16"
                  inputClassName="h-7 px-2 text-xs"
                />
              </span>
            </div>
            {left < 0 && <div className="mt-1 text-[0.72rem] font-semibold text-bad">More tomes assigned than you own.</div>}
          </div>
        )
      })}
    </div>
  )
}

function OtherCounter({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[3px] border border-dashed border-edge-2 px-3 py-2.5 text-[0.82rem] text-mid">
      <Rich text={label} />
      <Stepper size="sm" value={value} onChange={onChange} />
    </div>
  )
}

function TomesTab() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const val = (k: string) => nums[`tome.${k}`] ?? 0
  return (
    <div className="space-y-12">
      <TomeSummary />

      <section>
        <SectionHead index="01" title={`Legendary tomes (${legendaryTomes.total})`} label={legendaryTomes.label} />
        <div className="panel overflow-hidden" style={{ boxShadow: 'inset 3px 0 0 var(--color-legendary)' }}>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[760px]">
              <thead>
                <tr>
                  <th className="pl-5">Order</th>
                  <th>Skill</th>
                  <th>Tomes</th>
                  <th>Effect</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {legendaryTomes.rows.map((r) => {
                  const v = val(r.counter)
                  const done = v >= r.tomes
                  return (
                    <tr key={r.counter}>
                      <td className={cn('t-num pl-5 text-[1rem]', done ? 'text-ok' : 'text-low')}>{r.order}</td>
                      <td>
                        <ChampLink id={r.champ}>
                          <Rich text={r.skill} links={false} />
                        </ChampLink>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 font-bold text-legendary tabular-nums">
                          <img src={tomeIcon.legendary} alt="" className="size-4" />
                          {r.tomes}
                        </span>
                      </td>
                      <td>
                        <Rich text={r.effect} />
                      </td>
                      <td>
                        <Stepper size="sm" value={v} max={r.tomes} onChange={(n) => setNum(`tome.${r.counter}`, n)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-edge px-5 py-4">
            <Rich as="p" text={legendaryTomes.after} className="text-[0.84rem] leading-relaxed text-mid" />
          </div>
        </div>
      </section>

      <section>
        <SectionHead index="02" title={`Epic tomes (${epicTomes.total})`} label={epicTomes.label} />
        <Panel style={{ boxShadow: 'inset 3px 0 0 var(--color-epic)' }}>
          <ol className="mb-6 grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
            {epicTomes.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[0.86rem] text-mid">
                <span className="t-num w-5 shrink-0 text-[0.95rem] text-epic">{i + 1}</span>
                <Rich text={s} />
              </li>
            ))}
          </ol>
          <div className="space-y-1.5">
            {epicTomes.plans.map((p) => {
              const v = val(p.counter)
              return (
                <div key={p.counter} className="well grid grid-cols-1 items-center gap-4 px-3 py-3 md:grid-cols-[220px_1fr_auto]">
                  <div>
                    <ChampLink id={p.champ} size={30}>
                      <span>
                        {p.name}
                        <span className="block text-[0.7rem] font-semibold text-low">
                          first {p.first.label} · then to {p.total}
                        </span>
                      </span>
                    </ChampLink>
                  </div>
                  <div>
                    <Bar value={(v / p.total) * 100} color={v >= p.total ? 'var(--color-ok)' : 'var(--color-epic)'} height={6} ticks={[(p.first.tomes / p.total) * 100]} />
                    <div className="mt-1.5 flex justify-between text-[0.7rem] text-low">
                      <span className={cn(v >= p.first.tomes && 'font-semibold text-ok')}>Cooldown levels at {p.first.tomes}</span>
                      <span>{p.totalNote ? `${p.total} — ${p.totalNote}` : `Done at ${p.total}`}</span>
                    </div>
                  </div>
                  <Stepper size="sm" value={v} max={p.total} onChange={(n) => setNum(`tome.${p.counter}`, n)} />
                </div>
              )
            })}
            <OtherCounter label="Other Epic tomes used (future builds: Toragi, Ursala, Criodan)" value={val('epic.other')} onChange={(n) => setNum('tome.epic.other', n)} />
          </div>
          <Rich as="p" text={epicTomes.after} className="mt-5 text-[0.84rem] leading-relaxed text-mid" />
        </Panel>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <SectionHead index="03" title={`Rare tomes (${rareTomes.total})`} />
          <Panel style={{ boxShadow: 'inset 3px 0 0 var(--color-rare)' }}>
            <div className="well flex items-center gap-3 px-3 py-3">
              <Link to="/champions/painkeeper" data-tip="champ:painkeeper">
                <Portrait id="painkeeper" size={36} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="text-[0.88rem] font-bold text-epic">Pain Keeper</div>
                <Bar value={(val(rareTomes.counter) / rareTomes.full) * 100} color="var(--color-rare)" className="mt-1.5" height={5} ticks={[(rareTomes.first / rareTomes.full) * 100]} />
                <div className="mt-1 text-[0.7rem] text-low">
                  A3 Combat Tactics first ({rareTomes.first}), then fully booked ({rareTomes.full})
                </div>
              </div>
              <Stepper size="sm" value={val(rareTomes.counter)} max={rareTomes.full} onChange={(n) => setNum(`tome.${rareTomes.counter}`, n)} />
            </div>
            <div className="mt-1.5">
              <OtherCounter label="Other Rare tomes (Apothecary / Frozen Banshee, only if fielded)" value={val('rare.other')} onChange={(n) => setNum('tome.rare.other', n)} />
            </div>
            <Rich as="p" text={rareTomes.text} className="mt-4 text-[0.84rem] leading-relaxed text-mid" />
          </Panel>
        </section>
        <section>
          <SectionHead index="04" title={`Mythic tomes (${mythicTomes.total})`} />
          <Panel style={{ boxShadow: 'inset 3px 0 0 var(--color-mythical)' }}>
            <Rich as="p" text={mythicTomes.text} className="text-[0.84rem] leading-relaxed text-mid" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {mythicTomes.order.map((o, i) => (
                <span key={o} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="size-4 text-low" />}
                  <span className="rounded-[3px] border border-mythical/40 px-2.5 py-1 text-[0.8rem] font-semibold text-hi">
                    <Rich text={o} />
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-4">
              <OtherCounter label="Mythic tomes used" value={val('mythic.used')} onChange={(n) => setNum('tome.mythic.used', n)} />
            </div>
            <p className="mt-2 text-[0.74rem] text-low">Open question: Mythic tome sources in 2026 weren&apos;t confirmed.</p>
          </Panel>
        </section>
      </div>
    </div>
  )
}

// ---------------- Masteries ----------------

function MasteriesTab() {
  const flags = useStore((s) => s.flags)
  const setFlag = useStore((s) => s.setFlag)
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const withStep = champions.filter((c) => c.steps.some((s) => s.key === 'masteries'))
  const minotaur = nums['stage.minotaur'] ?? 0
  const done = withStep.filter((c) => flags[stepFlag(c.id, 'masteries')]).length
  return (
    <div className="space-y-12">
      <section>
        <SectionHead index="01" title="Masteries" />
        <div className="panel divide-y divide-edge">
          {masteries.rows.map((r) => (
            <div key={r.champs} className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[300px_1fr]">
              <div>
                <div className="mb-2.5 flex flex-wrap gap-1">
                  {r.ids.map((id) => (
                    <Link key={id} to={`/champions/${id}`} data-tip={`champ:${id}`}>
                      <Portrait id={id} size={30} showAffinity={false} />
                    </Link>
                  ))}
                </div>
                <Rich as="div" text={r.champs} className="text-[0.86rem] font-semibold text-hi" />
              </div>
              <div className="space-y-2">
                {r.lines.map((l) => (
                  <Rich key={l} as="p" text={l} className="text-[0.86rem] leading-relaxed text-mid" />
                ))}
              </div>
            </div>
          ))}
          <div className="px-5 py-4">
            <Rich as="p" text={masteries.after} className="text-[0.86rem] leading-relaxed text-mid" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          kicker="Your progress"
          title="Masteries done"
          action={
            <span className="t-num text-[1.3rem] text-hi">
              {done}
              <span className="text-low">/{withStep.length}</span>
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {withStep.map((c) => {
              const f = stepFlag(c.id, 'masteries')
              return (
                <div key={c.id} className="flex items-center gap-2.5 rounded-[3px] border border-edge px-3 py-2">
                  <Check checked={!!flags[f]} onChange={(v) => setFlag(f, v)} label={`${c.short} masteries`} />
                  <ChampLink id={c.id} size={24} />
                </div>
              )
            })}
          </div>
        </Panel>
        <Panel kicker="Mastery scrolls" title="Minotaur climb">
          <p className="text-[0.86rem] leading-relaxed text-mid">
            <strong className="text-mino">Minotaur:</strong> climb toward stage 15 for mastery scrolls ({masteries.minotaurList.join(', ')}).
          </p>
          <div className="mt-5 flex items-end gap-3">
            <span className="t-display text-[3.2rem] leading-[0.8]" style={{ color: minotaur ? 'var(--color-mino)' : 'var(--color-edge-2)' }}>
              {minotaur}
            </span>
            <span className="pb-0.5 text-[0.8rem] font-semibold text-low">/ 15</span>
          </div>
          <SegmentPicker value={minotaur} max={15} onChange={(v) => setNum('stage.minotaur', v)} color="var(--color-mino)" label="Minotaur stage" className="mt-4" />
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              [fmt(masteries.scrollsPerSet), 'scrolls per set'],
              [String(masteries.minotaurRuns), 'Minotaur 15 runs'],
              [String(masteries.gemCost), 'gems instead'],
            ].map(([v, l]) => (
              <div key={l} className="well p-3">
                <div className="t-num text-[1.3rem] text-hi">{v}</div>
                <div className="mt-1 text-[0.7rem] text-low">{l}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ---------------- Budgets ----------------

function BudgetTable({
  rows,
  total,
  prefix,
  unit,
  format,
  inputScale = 1,
  inputSuffix,
  color = 'var(--color-paper)',
  icon,
}: {
  rows: BudgetRow[]
  total: number
  prefix: string
  unit: string
  format: (n: number) => string
  inputScale?: number
  inputSuffix?: string
  color?: string
  icon?: string
}) {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const spent = rows.reduce((a, r) => a + (nums[`${prefix}.${r.id}`] ?? 0), 0)
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <div className="t-label text-low">Spent so far</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="t-display text-[2.6rem] leading-[0.85] text-hi">{format(spent)}</span>
            <span className="text-[0.86rem] font-semibold text-low">
              / {format(total)} {unit}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="t-label text-low">Left</div>
          <div className={cn('t-num mt-2 inline-flex items-center gap-2 text-[1.8rem]', total - spent < 0 && 'text-bad')} style={total - spent < 0 ? undefined : { color }}>
            {icon && <img src={icon} alt="" className="size-6" />}
            {format(total - spent)}
          </div>
        </div>
        <Bar value={pct(spent, total)} className="w-full" color={color} height={6} />
      </div>
      <div className="hidden grid-cols-[1.4fr_90px_1.1fr_140px] gap-3 border-t border-edge px-5 py-2 lg:grid">
        {['Use', 'Budget', 'Spent', 'Log total'].map((h) => (
          <span key={h} className="t-label text-low">
            {h}
          </span>
        ))}
      </div>
      <div className="divide-y divide-edge border-t border-edge">
        {rows.map((r, i) => {
          const v = nums[`${prefix}.${r.id}`] ?? 0
          const over = v > r.value
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 lg:grid-cols-[1.4fr_90px_1.1fr_140px]"
            >
              <div>
                <Rich as="div" text={r.use} className="text-[0.88rem] font-bold text-hi" />
                {r.why && <Rich as="div" text={r.why} className="mt-0.5 text-[0.76rem] leading-snug text-low" />}
              </div>
              <div className="t-num text-[1rem] text-hi">{r.display}</div>
              <div>
                <Bar value={(v / r.value) * 100} color={over ? 'var(--color-bad)' : color} height={5} ticks={r.low ? [(r.low / r.value) * 100] : undefined} />
                <div className="mt-1 text-[0.7rem] text-low tabular-nums">
                  {format(v)} spent{over && <span className="font-semibold text-bad"> · over budget</span>}
                </div>
              </div>
              <NumberField
                value={v ? +(v / inputScale).toFixed(2) : null}
                onChange={(n) => setNum(`${prefix}.${r.id}`, Math.round((n ?? 0) * inputScale))}
                placeholder="Total spent"
                min={0}
                suffix={inputSuffix}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function EnergyTab() {
  return (
    <div className="space-y-6">
      <Panel kicker="Section 6" title={`Energy: ${fmt(energy.total)}`} label={energy.label}>
        <Rich as="p" text={energy.after} className="text-[0.88rem] leading-relaxed text-mid" />
      </Panel>
      <BudgetTable rows={energy.rows} total={energy.total} prefix="spent.energy" unit="energy" format={fmt} />
      <p className="text-[0.74rem] text-low">{energy.combinedNote}</p>
    </div>
  )
}

function SilverTab() {
  return (
    <div className="space-y-6">
      <Panel kicker="Section 6" title={`Silver: ${compact(silver.total)}`} style={{ boxShadow: 'inset 3px 0 0 var(--color-silver)' }}>
        <Rich as="p" text={silver.intro} className="text-[0.88rem] leading-relaxed text-mid" />
        <Callout tone="tip" className="mt-4" text={silver.after} />
      </Panel>
      <BudgetTable
        rows={silver.rows}
        total={silver.total}
        prefix="spent.silver"
        unit="silver"
        format={compact}
        inputScale={1_000_000}
        inputSuffix="M"
        color="var(--color-silver)"
        icon={resourceIcon.silver}
      />
    </div>
  )
}

function GemsTab() {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const setFlag = useStore((s) => s.setFlag)
  const setNum = useStore((s) => s.setNum)
  const spent = gemsSpent(flags, nums)
  const left = gems.total - spent
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <Panel className="xl:col-span-3" kicker="Section 6" title={`Gems: ${fmt(gems.total)}`} style={{ boxShadow: 'inset 3px 0 0 var(--color-gems)' }}>
        <div className="space-y-1.5">
          {gems.spend.map((g) => {
            const on = !!flags[g.id]
            return (
              <div key={g.id} className={cn('flex items-center gap-3 rounded-[3px] border px-3 py-3 transition-colors', on ? 'border-edge opacity-70' : 'border-edge bg-raised-2')}>
                <Check checked={on} onChange={(v) => setFlag(g.id, v)} label={g.label} />
                <div className="min-w-0 flex-1">
                  <div className={cn('text-[0.88rem] font-bold', on ? 'text-low line-through' : 'text-hi')}>
                    {g.label} {g.optional && <Tag className="ml-1">optional</Tag>}
                  </div>
                  {g.note && <div className="text-[0.76rem] text-low">{g.note}</div>}
                </div>
                <div className="inline-flex items-center gap-1.5 font-extrabold text-gems tabular-nums">
                  <img src={resourceIcon.gems} alt="" className="size-4" />
                  {fmt(g.cost)}
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between gap-3 rounded-[3px] border border-dashed border-edge-2 px-3 py-2.5">
            <span className="text-[0.84rem] text-mid">Other gem spending (champion / storage slots…)</span>
            <NumberField value={nums['spent.gems.other'] ?? null} onChange={(v) => setNum('spent.gems.other', v ?? 0)} placeholder="0" min={0} className="w-28" />
          </div>
        </div>
        <ul className="mt-6 space-y-2.5">
          {gems.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[0.86rem] leading-relaxed text-mid">
              <span className="mt-[0.6rem] size-1.5 shrink-0 bg-gems" />
              <Rich text={b} />
            </li>
          ))}
        </ul>
      </Panel>
      <div className="space-y-6 xl:col-span-2">
        <Panel kicker="Your stock" title="Gems left">
          <div className={cn('t-display inline-flex items-center gap-3 text-[3.4rem] leading-[0.85]', left < gems.keep ? 'text-warn' : 'text-gems')}>
            <img src={resourceIcon.gems} alt="" className="size-10" />
            {fmt(left)}
          </div>
          <div className="relative mt-5">
            <Bar value={(left / gems.total) * 100} color="var(--color-gems)" height={10} ticks={[(gems.keep / gems.total) * 100]} />
            <div className="relative mt-1.5 h-4 text-[0.68rem] font-semibold text-low">
              <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(gems.keep / gems.total) * 100}%` }}>
                ▲ keep ~{fmt(gems.keep)}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[0.78rem] text-mid">
            {left >= gems.keep ? `${fmt(left - gems.keep)} above the ~4,500 keep line.` : `${fmt(gems.keep - left)} below the ~4,500 keep line.`}
          </div>
        </Panel>
        <Panel kicker="Don't" title="Never buy" style={{ boxShadow: 'inset 3px 0 0 var(--color-bad)' }}>
          <div className="grid grid-cols-2 gap-1.5">
            {gems.never.map((n) => (
              <div key={n} className="rounded-[3px] border border-bad/30 px-3 py-2 text-[0.86rem] font-bold text-hi line-through decoration-bad decoration-2">
                {n}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ---------------- Hall & gear ----------------

function HallTab() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const level = accountLevel(nums)
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel kicker="Great Hall" title="Upgrade priority">
          <div className="flex flex-wrap items-center gap-2">
            {greatHall.priority.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-4 text-low" />}
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn('inline-flex h-9 items-center gap-2 rounded-[3px] border px-3 text-[0.86rem] font-extrabold', i === 0 ? 'border-paper bg-paper text-ink' : 'border-edge-2 text-hi')}
                >
                  <span className={cn('t-num text-[0.75rem]', i === 0 ? 'text-ink/50' : 'text-low')}>{i + 1}</span>
                  {p}
                </motion.span>
              </span>
            ))}
          </div>
          <Rich as="p" text={greatHall.text} className="mt-5 text-[0.86rem] leading-relaxed text-mid" />
        </Panel>

        <Panel
          id="unlocks"
          className="scroll-mt-24"
          kicker="Account level"
          title="Unlocks"
          action={<NumberField value={level || null} onChange={(v) => setNum('accountLevel', v ?? 0)} placeholder="Level" min={1} max={100} className="w-24" />}
        >
          <div className="space-y-px">
            {unlocks.map((u) => {
              const reached = level >= u.level
              return (
                <div key={u.level} className="flex items-center gap-3 rounded-[3px] px-2 py-1.5">
                  <span className={cn('t-num w-14 text-[0.95rem]', reached ? 'text-ok' : 'text-low')}>Lv {u.level}</span>
                  <Rich as="span" text={u.what} className={cn('flex-1 text-[0.86rem]', reached ? 'text-hi' : 'text-mid')} />
                  {reached ? <Unlock className="size-3.5 text-ok" /> : <Lock className="size-3.5 text-edge-2" />}
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <section>
        <SectionHead index="01" title="Gear by champion" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {gearByChampion.map((g) => (
            <Panel key={g.id}>
              <Link to={`/champions/${g.id}`} data-tip={`champ:${g.id}`} className="flex items-center gap-3">
                <Portrait id={g.id} size={44} />
                <div>
                  <div className="t-label text-low">Gear</div>
                  <div className="t-title text-[1.05rem]" style={{ color: rarityColor[championById[g.id].rarity] }}>
                    {g.name}
                  </div>
                </div>
              </Link>
              <Rich as="p" text={g.text} className="mt-4 text-[0.86rem] leading-relaxed text-mid" />
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <SectionHead index="02" title="Where each set comes from" />
        <div className="panel overflow-hidden">
          <table className="tbl">
            <thead>
              <tr>
                <th className="pl-5">Sets</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {setSources.rows.map((r) => (
                <tr key={r.sets}>
                  <td className="pl-5 font-bold text-gear">{r.sets}</td>
                  <td>
                    <Rich text={r.from} className="font-semibold text-hi" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Rich as="p" text={setSources.text} className="block border-t border-edge px-5 py-4 text-[0.8rem] leading-relaxed text-low" />
        </div>
      </section>
    </div>
  )
}

export function Resources() {
  const { tab } = useParams()
  if (!tab || !tabs.some((t) => t.key === tab)) return <Navigate to="/resources/brews" replace />
  return (
    <div>
      <PageHeader eyebrow="Section 6" title="Resource plans" intro={resourcesIntro} actions={<LabelTag label="Calculators use only the guide's numbers" />} />
      <TabBar items={tabs} active={tab} className="mb-10" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === 'brews' && <BrewsTab />}
          {tab === 'tomes' && <TomesTab />}
          {tab === 'masteries' && <MasteriesTab />}
          {tab === 'energy' && <EnergyTab />}
          {tab === 'gems' && <GemsTab />}
          {tab === 'silver' && <SilverTab />}
          {tab === 'hall' && <HallTab />}
        </motion.div>
      </AnimatePresence>
      <div className="t-label mt-10 text-low">Spending you log here is saved in this browser only.</div>
    </div>
  )
}

