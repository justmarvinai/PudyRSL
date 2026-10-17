import { AnimatePresence, motion } from 'motion/react'
import { Ban, BookOpen, Calculator, ChevronRight, Coins, FlaskConical, Gem, Info, Landmark, Lock, ScrollText, Unlock, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { affinityTone, Sigil, useAffinity } from '../components/champion/Sigil'
import { PageHeader } from '../components/layout/PageHeader'
import { Check } from '../components/ui/Check'
import { NumberField, Select, Stepper, Toggle } from '../components/ui/Fields'
import { ProgressBar } from '../components/ui/Progress'
import { LabelTag, Rich } from '../components/ui/Rich'
import { TabBar } from '../components/ui/Tabs'
import { Callout, Card, Pill, SectionTitle } from '../components/ui/primitives'
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
import type { ChampionId, Rarity } from '../data/types'
import { brewPaths, brewPlan, pathProblem, XP_PER_BREW, XP_PER_BREW_MATCHED } from '../lib/brews'
import { stepFlag } from '../lib/checks'
import { cn } from '../lib/cn'
import { accountLevel, brewsUsed, gemsSpent, tomeStock, tomesUsed } from '../lib/derived'
import { compact, fmt, pct } from '../lib/format'
import { useStore } from '../lib/store'

const tabs = [
  { key: 'brews', label: 'Brews', icon: <FlaskConical className="size-4" />, to: '/resources/brews' },
  { key: 'tomes', label: 'Tomes', icon: <BookOpen className="size-4" />, to: '/resources/tomes' },
  { key: 'masteries', label: 'Masteries', icon: <ScrollText className="size-4" />, to: '/resources/masteries' },
  { key: 'energy', label: 'Energy', icon: <Zap className="size-4" />, to: '/resources/energy' },
  { key: 'gems', label: 'Gems', icon: <Gem className="size-4" />, to: '/resources/gems' },
  { key: 'silver', label: 'Silver', icon: <Coins className="size-4" />, to: '/resources/silver' },
  { key: 'hall', label: 'Great Hall & gear', icon: <Landmark className="size-4" />, to: '/resources/hall' },
]

// ---------------- Brews ----------------

const assumedRank: Record<Rarity, number> = { Mythical: 6, Legendary: 5, Epic: 4, Rare: 3 }

function AffinityCell({ ids, guide }: { ids: ChampionId[]; guide: string }) {
  const champs = useStore((s) => s.champs)
  if (guide !== 'check in-game') return <Pill tone={affinityTone[guide as keyof typeof affinityTone]}>{guide}</Pill>
  const mine = ids.map((id) => ({ id, a: champs[id]?.affinity })).filter((x) => x.a)
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-fg-subtle italic">check in-game</span>
      {mine.map((m) => (
        <Pill key={m.id} tone={affinityTone[m.a!]} title="Recorded by you">
          {championById[m.id].short}: {m.a}
        </Pill>
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
    <Card id="brew-calculator" className="scroll-mt-24">
      <SectionTitle eyebrow="Tool" title="Brew calculator" label="Calculated from the guide's XP table" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
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
            <div className="eyebrow mb-1.5">Ranks you level (Lv 1 → cap)</div>
            <div className="flex flex-wrap gap-1.5">
              {[3, 4, 5, 6].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRank(r)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold transition',
                    ranks.includes(r) ? 'border-gold-400/60 bg-gold-400/15 text-gold-200' : 'border-white/10 text-fg-subtle hover:text-fg',
                  )}
                >
                  {r}★ · Lv {levelCaps[r]}
                </button>
              ))}
            </div>
            {sorted.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[0.75rem]">
                {sorted.map((r, i) => (
                  <span key={r} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span className={cn('rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold', r - sorted[i - 1] > 1 ? 'bg-epic/15 text-epic' : 'bg-white/[0.05] text-fg-subtle')}>
                        {r - sorted[i - 1] > 1 ? 'Feast' : 'rank up'}
                      </span>
                    )}
                    <span className="text-fg-muted">
                      {r}★ L{levelCaps[r]}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {c && <div className="mt-1.5 text-[0.72rem] text-fg-subtle">Guide path: {brewPaths[c.id].path}</div>}
          </div>
          <Toggle checked={matched} onChange={setMatched} label={`Brew affinity matches${c ? ` ${c.short}` : ''} (18,750 XP each)`} />
          {c && (
            <div className="text-[0.75rem] text-fg-subtle">
              {affinity ? (
                <>
                  {c.short} is <span className="text-fg-muted">{affinity}</span> — use {affinity} brews for the matched rate.
                </>
              ) : (
                <>
                  {c.short}&apos;s affinity isn&apos;t confirmed —{' '}
                  <Link to={`/champions/${c.id}`} className="text-gold-400 hover:text-gold-300">
                    record it on the champion page
                  </Link>
                  .
                </>
              )}{' '}
              The guide assumes {c.rarity}s start at {assumedRank[c.rarity]}★.
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.07] to-transparent p-5">
          {sorted.length === 0 ? (
            <div className="text-sm text-fg-muted">{c?.id === 'gizmak' ? 'Gizmak needs no brews — the XP Barrel maxes him at Rank 6.' : 'Pick the ranks you will level.'}</div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <div className="eyebrow">{matched ? 'Matched' : 'Mismatched'} brews</div>
                  <motion.div key={`${res.brews}-${matched}`} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-bold text-gold-300 tabular-nums">
                    {res.brews}
                  </motion.div>
                </div>
                <div>
                  <div className="eyebrow">XP needed</div>
                  <div className="text-xl font-semibold text-fg tabular-nums">{fmt(res.xp)}</div>
                </div>
                <div>
                  <div className="eyebrow">{matched ? 'Mismatched' : 'Matched'} instead</div>
                  <div className="text-xl font-semibold text-fg-muted tabular-nums">{other.brews}</div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {res.parts.map((p) => (
                  <div key={p.rank} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-1.5 text-[0.8rem]">
                    <span className="text-fg-muted">
                      {p.rank}★ Lv 1 → {levelCaps[p.rank]}
                    </span>
                    <span className="text-fg-subtle tabular-nums">
                      {fmt(p.xp)} XP → <span className="font-semibold text-fg">{p.brews}</span> brews
                    </span>
                  </div>
                ))}
              </div>
              {problem && <div className="mt-3 text-[0.75rem] font-semibold text-warn">{problem}</div>}
              {isPreset && c && (
                <div className="mt-3 text-[0.75rem] text-fg-muted">
                  Guide table for {c.short}: <span className="font-semibold text-gold-300">{c.brews.matched}</span> matched ·{' '}
                  <span className="font-semibold text-fg">{c.brews.mismatched}</span> mismatched.
                </div>
              )}
              <div className="mt-2 text-[0.72rem] text-fg-subtle">Rounded up per rank, the same way the guide&apos;s brew table is built. Rank-ups need fodder (see the 6★ plan).</div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

function BrewsTab() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const used = brewsUsed(nums)
  const [add, setAdd] = useState<number | null>(null)
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow="Section 6" title={brews.title} label={brews.label} />
          <Rich as="p" text={brews.text} className="text-[0.86rem] leading-relaxed text-fg-muted" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="card-flat p-3">
              <div className="eyebrow">Per brew</div>
              <div className="mt-1 text-xl font-semibold text-fg tabular-nums">{fmt(brews.xp)} XP</div>
            </div>
            <div className="card-flat border-gold-500/25 p-3">
              <div className="eyebrow text-gold-400">Affinity matches</div>
              <div className="mt-1 text-xl font-semibold text-gold-300 tabular-nums">{fmt(brews.xpMatched)} XP</div>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Your stock" title="Brews left" />
          <div className="text-4xl font-bold text-fg tabular-nums">{fmt(accountSnapshot.brews - used)}</div>
          <div className="text-xs text-fg-subtle">
            {fmt(used)} used of {fmt(accountSnapshot.brews)} ({accountSnapshot.brewXp})
          </div>
          <ProgressBar value={((accountSnapshot.brews - used) / accountSnapshot.brews) * 100} className="mt-3" tone="info" />
          <form
            className="mt-4 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (add) setNum('spent.brews', Math.max(0, used + add))
              setAdd(null)
            }}
          >
            <NumberField label="Log brews used" value={add} onChange={setAdd} placeholder="e.g. 108" className="flex-1" />
            <button type="submit" className="btn btn-gold" disabled={!add}>
              Log
            </button>
          </form>
          {used > 0 && (
            <button type="button" onClick={() => setNum('spent.brews', 0)} className="mt-2 text-[0.72rem] text-fg-subtle hover:text-bad">
              Reset brew count
            </button>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-2">
          <SectionTitle eyebrow="Brews to Level 60" title="Brews per core champion" className="mb-0" />
        </div>
        <div className="overflow-x-auto">
          <table className="table-guide min-w-[720px]">
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
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {r.ids.map((id) => (
                          <Sigil key={id} id={id} size={26} />
                        ))}
                      </div>
                      <span className="font-semibold text-fg">{r.champs}</span>
                    </div>
                  </td>
                  <td>
                    <AffinityCell ids={r.ids} guide={r.affinity} />
                  </td>
                  <td className="font-semibold text-gold-300 tabular-nums">{r.matched}</td>
                  <td className="tabular-nums">
                    {r.mismatched}
                    {r.champs === 'Seer, Ruella' && (
                      <span
                        className="ml-1.5 inline-flex translate-y-0.5 text-fg-subtle"
                        title="Per-rank rounding (as used for every other row) gives 36 + 78 + 161 = 275. The guide lists 276."
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
        <div className="border-t border-white/[0.06] px-5 py-4">
          <Rich as="p" text={brews.myCall} className="text-[0.82rem] leading-relaxed text-fg-muted" />
        </div>
      </Card>

      <BrewCalculator />
    </div>
  )
}

// ---------------- Tomes ----------------

function TomeSummary() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const used = tomesUsed(nums)
  const stock = tomeStock(nums)
  const rows: { key: 'legendary' | 'epic' | 'rare' | 'mythic'; label: string; tone: string }[] = [
    { key: 'legendary', label: 'Legendary', tone: 'text-legendary' },
    { key: 'epic', label: 'Epic', tone: 'text-epic' },
    { key: 'rare', label: 'Rare', tone: 'text-rare' },
    { key: 'mythic', label: 'Mythic', tone: 'text-mythical' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {rows.map((r) => {
        const left = stock[r.key] - used[r.key]
        return (
          <Card key={r.key} className="p-4">
            <div className={cn('eyebrow', r.tone)}>{r.label} tomes</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={cn('text-3xl font-bold tabular-nums', left < 0 ? 'text-bad' : 'text-fg')}>{left}</span>
              <span className="text-sm text-fg-subtle">left</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.72rem] text-fg-subtle">
              <span>{used[r.key]} used</span>
              <span className="flex items-center gap-1.5">
                stock
                <NumberField
                  value={stock[r.key]}
                  onChange={(v) => setNum(`stock.tomes.${r.key}`, v ?? 0)}
                  allowEmpty={false}
                  min={0}
                  className="w-16"
                  inputClassName="py-0.5 px-2 text-xs"
                />
              </span>
            </div>
            {left < 0 && <div className="mt-1 text-[0.7rem] text-bad">More tomes assigned than you own.</div>}
          </Card>
        )
      })}
    </div>
  )
}

function TomesTab() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const val = (k: string) => nums[`tome.${k}`] ?? 0
  return (
    <div className="space-y-5">
      <TomeSummary />

      <Card padded={false}>
        <div className="p-5 pb-2">
          <SectionTitle eyebrow={`Legendary (${legendaryTomes.total})`} title="Legendary tomes" label={legendaryTomes.label} className="mb-0" />
        </div>
        <div className="overflow-x-auto">
          <table className="table-guide min-w-[760px]">
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
                return (
                  <tr key={r.counter} className={cn(v >= r.tomes && 'bg-ok/[0.03]')}>
                    <td className="pl-5 font-bold text-fg-subtle">{r.order}</td>
                    <td>
                      <Link to={`/champions/${r.champ}`} className="flex items-center gap-2 font-semibold text-fg hover:text-gold-300">
                        <Sigil id={r.champ} size={26} /> {r.skill}
                      </Link>
                    </td>
                    <td className="font-semibold text-legendary tabular-nums">{r.tomes}</td>
                    <td>{r.effect}</td>
                    <td>
                      <Stepper size="sm" value={v} max={r.tomes} onChange={(n) => setNum(`tome.${r.counter}`, n)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.06] px-5 py-4">
          <Rich as="p" text={legendaryTomes.after} className="text-[0.8rem] leading-relaxed text-fg-muted" />
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow={`Epic (${epicTomes.total})`} title="Epic tomes" label={epicTomes.label} />
        <ol className="mb-5 grid grid-cols-1 gap-2 md:grid-cols-2">
          {epicTomes.steps.map((s, i) => (
            <li key={s} className="flex gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[0.82rem] text-fg-muted">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-epic/15 text-[0.65rem] font-bold text-epic">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="space-y-3">
          {epicTomes.plans.map((p) => {
            const v = val(p.counter)
            return (
              <div key={p.counter} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 md:grid-cols-[200px_1fr_auto]">
                <Link to={`/champions/${p.champ}`} className="flex items-center gap-2.5 font-semibold text-fg hover:text-gold-300">
                  <Sigil id={p.champ} size={32} />
                  <span>
                    {p.name}
                    <span className="block text-[0.7rem] font-normal text-fg-subtle">
                      first {p.first.label} · then to {p.total}
                    </span>
                  </span>
                </Link>
                <div>
                  <ProgressBar value={(v / p.total) * 100} tone={v >= p.total ? 'ok' : 'epic'} markers={[(p.first.tomes / p.total) * 100]} />
                  <div className="mt-1 flex justify-between text-[0.68rem] text-fg-subtle">
                    <span className={cn(v >= p.first.tomes && 'text-ok')}>Cooldown levels at {p.first.tomes}</span>
                    <span>{p.totalNote ? `${p.total} — ${p.totalNote}` : `Done at ${p.total}`}</span>
                  </div>
                </div>
                <Stepper size="sm" value={v} max={p.total} onChange={(n) => setNum(`tome.${p.counter}`, n)} />
              </div>
            )
          })}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-[0.8rem] text-fg-muted">
            <span>Other Epic tomes used (future builds: Toragi, Ursala, Criodan)</span>
            <Stepper size="sm" value={val('epic.other')} onChange={(n) => setNum('tome.epic.other', n)} />
          </div>
        </div>
        <Rich as="p" text={epicTomes.after} className="mt-4 text-[0.8rem] leading-relaxed text-fg-muted" />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle eyebrow={`Rare (${rareTomes.total})`} title="Rare tomes" />
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
            <Sigil id="painkeeper" size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[0.86rem] font-semibold text-fg">Pain Keeper</div>
              <ProgressBar value={(val(rareTomes.counter) / rareTomes.full) * 100} tone="info" className="mt-1.5" markers={[(rareTomes.first / rareTomes.full) * 100]} />
              <div className="mt-1 text-[0.68rem] text-fg-subtle">A3 Combat Tactics first ({rareTomes.first}), then fully booked ({rareTomes.full})</div>
            </div>
            <Stepper size="sm" value={val(rareTomes.counter)} max={rareTomes.full} onChange={(n) => setNum(`tome.${rareTomes.counter}`, n)} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-[0.8rem] text-fg-muted">
            <span>Other Rare tomes (Apothecary / Frozen Banshee, only if fielded)</span>
            <Stepper size="sm" value={val('rare.other')} onChange={(n) => setNum('tome.rare.other', n)} />
          </div>
          <Rich as="p" text={rareTomes.text} className="mt-4 text-[0.8rem] leading-relaxed text-fg-muted" />
        </Card>
        <Card>
          <SectionTitle eyebrow={`Mythic (${mythicTomes.total})`} title="Mythic tomes" />
          <Rich as="p" text={mythicTomes.text} className="text-[0.8rem] leading-relaxed text-fg-muted" />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {mythicTomes.order.map((o, i) => (
              <span key={o} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-4 text-fg-subtle" />}
                <span className="rounded-lg border border-mythical/30 bg-mythical/[0.07] px-2.5 py-1 text-[0.78rem] text-mythical">{o}</span>
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-[0.8rem] text-fg-muted">
            <span>Mythic tomes used</span>
            <Stepper size="sm" value={val('mythic.used')} onChange={(n) => setNum('tome.mythic.used', n)} />
          </div>
          <p className="mt-2 text-[0.72rem] text-fg-subtle">Open question: Mythic tome sources in 2026 weren&apos;t confirmed.</p>
        </Card>
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
    <div className="space-y-5">
      <Card padded={false}>
        <div className="p-5 pb-2">
          <SectionTitle eyebrow="Section 6" title="Masteries" className="mb-0" />
        </div>
        <div className="divide-y divide-white/[0.05]">
          {masteries.rows.map((r) => (
            <div key={r.champs} className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[280px_1fr]">
              <div>
                <div className="mb-2 flex -space-x-2">
                  {r.ids.map((id) => (
                    <Sigil key={id} id={id} size={30} />
                  ))}
                </div>
                <div className="text-[0.84rem] font-semibold text-fg">{r.champs}</div>
              </div>
              <div className="space-y-1.5">
                {r.lines.map((l) => (
                  <Rich key={l} as="p" text={l} className="text-[0.82rem] leading-relaxed text-fg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] px-5 py-4">
          <Rich as="p" text={masteries.after} className="text-[0.82rem] leading-relaxed text-fg-muted" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Your progress" title="Masteries done" action={<span className="text-sm font-semibold text-fg tabular-nums">{done}/{withStep.length}</span>} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {withStep.map((c) => {
              const f = stepFlag(c.id, 'masteries')
              return (
                <div key={c.id} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <Check checked={!!flags[f]} onChange={(v) => setFlag(f, v)} label={`${c.short} masteries`} />
                  <Sigil id={c.id} size={26} />
                  <span className="text-[0.82rem] text-fg">{c.short}</span>
                </div>
              )
            })}
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow="Mastery scrolls" title="Minotaur climb" />
          <p className="text-[0.82rem] leading-relaxed text-fg-muted">
            <strong className="text-fg">Minotaur:</strong> climb toward stage 15 for mastery scrolls ({masteries.minotaurList.join(', ')}).
          </p>
          <div className="mt-4 flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={15}
              value={minotaur}
              onChange={(e) => setNum('stage.minotaur', Number(e.target.value))}
              className="flex-1 cursor-pointer accent-[#e8a83a]"
              aria-label="Minotaur stage"
            />
            <span className="w-16 text-right font-display text-xl font-bold text-gold-300 tabular-nums">{minotaur ? `${minotaur}/15` : '–'}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="card-flat p-2.5">
              <div className="text-lg font-semibold text-fg tabular-nums">{fmt(masteries.scrollsPerSet)}</div>
              <div className="text-[0.68rem] text-fg-subtle">scrolls per set</div>
            </div>
            <div className="card-flat p-2.5">
              <div className="text-lg font-semibold text-fg tabular-nums">{masteries.minotaurRuns}</div>
              <div className="text-[0.68rem] text-fg-subtle">Minotaur 15 runs</div>
            </div>
            <div className="card-flat p-2.5">
              <div className="text-lg font-semibold text-fg tabular-nums">{masteries.gemCost}</div>
              <div className="text-[0.68rem] text-fg-subtle">gems instead</div>
            </div>
          </div>
        </Card>
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
}: {
  rows: BudgetRow[]
  total: number
  prefix: string
  unit: string
  format: (n: number) => string
  inputScale?: number
  inputSuffix?: string
}) {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const spent = rows.reduce((a, r) => a + (nums[`${prefix}.${r.id}`] ?? 0), 0)
  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <div className="eyebrow">Spent so far</div>
          <div className="text-3xl font-bold text-fg tabular-nums">
            {format(spent)} <span className="text-base font-medium text-fg-subtle">/ {format(total)} {unit}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="eyebrow">Left</div>
          <div className={cn('text-2xl font-semibold tabular-nums', total - spent < 0 ? 'text-bad' : 'text-gold-300')}>{format(total - spent)}</div>
        </div>
        <ProgressBar value={pct(spent, total)} className="w-full" />
      </div>
      <div className="divide-y divide-white/[0.05] border-t border-white/[0.06]">
        {rows.map((r, i) => {
          const v = nums[`${prefix}.${r.id}`] ?? 0
          const over = v > r.value
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 lg:grid-cols-[1.4fr_90px_1.1fr_140px]"
            >
              <div>
                <div className="text-[0.86rem] font-semibold text-fg">{r.use}</div>
                {r.why && <Rich as="div" text={r.why} className="mt-0.5 text-[0.74rem] leading-snug text-fg-subtle" />}
              </div>
              <div className="text-[0.86rem] font-semibold text-gold-300 tabular-nums">{r.display}</div>
              <div>
                <ProgressBar value={(v / r.value) * 100} tone={over ? 'bad' : 'gold'} markers={r.low ? [(r.low / r.value) * 100] : undefined} />
                <div className="mt-1 text-[0.68rem] text-fg-subtle tabular-nums">
                  {format(v)} spent{over && <span className="text-bad"> · over budget</span>}
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
    </Card>
  )
}

function EnergyTab() {
  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle eyebrow="Section 6" title={`Energy: ${fmt(energy.total)}`} label={energy.label} />
        <Rich as="p" text={energy.after} className="text-[0.84rem] leading-relaxed text-fg-muted" />
      </Card>
      <BudgetTable rows={energy.rows} total={energy.total} prefix="spent.energy" unit="energy" format={fmt} />
      <p className="text-[0.72rem] text-fg-subtle">{energy.combinedNote}</p>
    </div>
  )
}

function SilverTab() {
  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle eyebrow="Section 6" title={`Silver: ${compact(silver.total)}`} />
        <Rich as="p" text={silver.intro} className="text-[0.84rem] leading-relaxed text-fg-muted" />
        <Callout tone="tip" className="mt-4" text={silver.after} />
      </Card>
      <BudgetTable rows={silver.rows} total={silver.total} prefix="spent.silver" unit="silver" format={compact} inputScale={1_000_000} inputSuffix="M" />
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
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <SectionTitle eyebrow="Section 6" title={`Gems: ${fmt(gems.total)}`} />
        <div className="space-y-2">
          {gems.spend.map((g) => (
            <div key={g.id} className={cn('flex items-center gap-3 rounded-xl border px-3 py-3', flags[g.id] ? 'border-ok/25 bg-ok/[0.04]' : 'border-white/[0.07] bg-white/[0.02]')}>
              <Check checked={!!flags[g.id]} onChange={(v) => setFlag(g.id, v)} label={g.label} />
              <div className="min-w-0 flex-1">
                <div className="text-[0.86rem] font-semibold text-fg">
                  {g.label} {g.optional && <Pill className="ml-1">optional</Pill>}
                </div>
                {g.note && <div className="text-[0.74rem] text-fg-subtle">{g.note}</div>}
              </div>
              <div className="font-semibold text-gold-300 tabular-nums">{fmt(g.cost)}</div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 px-3 py-2.5">
            <span className="text-[0.82rem] text-fg-muted">Other gem spending (champion / storage slots…)</span>
            <NumberField value={nums['spent.gems.other'] ?? null} onChange={(v) => setNum('spent.gems.other', v ?? 0)} placeholder="0" min={0} className="w-28" />
          </div>
        </div>
        <ul className="mt-5 space-y-2">
          {gems.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[0.84rem] leading-relaxed text-fg-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" />
              <Rich text={b} />
            </li>
          ))}
        </ul>
      </Card>
      <div className="space-y-5 xl:col-span-2">
        <Card>
          <div className="eyebrow">Gems left</div>
          <div className={cn('text-4xl font-bold tabular-nums', left < gems.keep ? 'text-warn' : 'text-fg')}>{fmt(left)}</div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#ffb3c1] to-mythical" animate={{ width: `${(left / gems.total) * 100}%` }} />
          </div>
          <div className="relative mt-1 h-4 text-[0.65rem] text-fg-subtle">
            <span className="absolute -translate-x-1/2" style={{ left: `${(gems.keep / gems.total) * 100}%` }}>
              ▲ keep ~{fmt(gems.keep)}
            </span>
          </div>
          <div className="mt-2 text-[0.75rem] text-fg-subtle">
            {left >= gems.keep ? `${fmt(left - gems.keep)} above the ~4,500 keep line.` : `${fmt(gems.keep - left)} below the ~4,500 keep line.`}
          </div>
        </Card>
        <Card>
          <div className="eyebrow mb-3 text-bad">Never buy</div>
          <div className="grid grid-cols-2 gap-2">
            {gems.never.map((n) => (
              <div key={n} className="flex items-center gap-2 rounded-xl border border-bad/20 bg-bad/[0.05] px-3 py-2 text-[0.84rem] font-semibold text-fg">
                <Ban className="size-4 text-bad" /> {n}
              </div>
            ))}
          </div>
        </Card>
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
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="Great Hall" title="Upgrade priority" />
          <div className="flex flex-wrap items-center gap-2">
            {greatHall.priority.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-4 text-fg-subtle" />}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn('rounded-xl border px-3 py-1.5 text-sm font-bold', i === 0 ? 'border-gold-400/50 bg-gold-400/15 text-gold-200' : 'border-white/10 bg-white/[0.03] text-fg-muted')}
                >
                  {p}
                </motion.span>
              </span>
            ))}
          </div>
          <Rich as="p" text={greatHall.text} className="mt-4 text-[0.82rem] leading-relaxed text-fg-muted" />
        </Card>

        <Card id="unlocks" className="scroll-mt-24">
          <SectionTitle
            eyebrow="Account level"
            title="Unlocks"
            action={<NumberField value={level || null} onChange={(v) => setNum('accountLevel', v ?? 0)} placeholder="Level" min={1} max={100} className="w-24" />}
          />
          <div className="relative pl-4">
            <div className="absolute top-2 bottom-2 left-[7px] w-px bg-white/10" />
            {unlocks.map((u) => {
              const reached = level >= u.level
              return (
                <div key={u.level} className="relative flex items-center gap-3 py-1.5">
                  <span className={cn('absolute -left-4 size-3.5 rounded-full border-2', reached ? 'border-ok bg-ok/40' : 'border-white/20 bg-ink-900')} />
                  <span className={cn('w-14 text-[0.8rem] font-bold tabular-nums', reached ? 'text-ok' : 'text-fg-subtle')}>Lv {u.level}</span>
                  <span className={cn('flex-1 text-[0.84rem]', reached ? 'text-fg' : 'text-fg-muted')}>{u.what}</span>
                  {reached ? <Unlock className="size-3.5 text-ok" /> : <Lock className="size-3.5 text-fg-subtle" />}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {gearByChampion.map((g) => (
          <Card key={g.id} spotlight>
            <Link to={`/champions/${g.id}`} className="flex items-center gap-3">
              <Sigil id={g.id} size={44} />
              <div>
                <div className="eyebrow">Gear</div>
                <div className="font-semibold text-fg">{g.name}</div>
              </div>
            </Link>
            <p className="mt-3 text-[0.84rem] leading-relaxed text-fg-muted">{g.text}</p>
          </Card>
        ))}
      </div>

      <Card padded={false}>
        <div className="p-5 pb-2">
          <SectionTitle eyebrow="Artifacts" title="Where each set comes from" className="mb-0" />
        </div>
        <table className="table-guide">
          <thead>
            <tr>
              <th className="pl-5">Sets</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {setSources.rows.map((r) => (
              <tr key={r.sets}>
                <td className="pl-5 font-semibold text-fg">{r.sets}</td>
                <td>{r.from}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Rich as="p" text={setSources.text} className="border-t border-white/[0.06] px-5 py-4 text-[0.78rem] leading-relaxed text-fg-subtle" />
      </Card>
    </div>
  )
}

export function Resources() {
  const { tab } = useParams()
  if (!tab || !tabs.some((t) => t.key === tab)) return <Navigate to="/resources/brews" replace />
  return (
    <div>
      <PageHeader eyebrow="Section 6" title="Resource plans" intro={resourcesIntro} actions={<LabelTag label="Calculators use only the guide's numbers" />} />
      <TabBar items={tabs} active={tab} className="mb-6" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'brews' && <BrewsTab />}
          {tab === 'tomes' && <TomesTab />}
          {tab === 'masteries' && <MasteriesTab />}
          {tab === 'energy' && <EnergyTab />}
          {tab === 'gems' && <GemsTab />}
          {tab === 'silver' && <SilverTab />}
          {tab === 'hall' && <HallTab />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center gap-2 text-[0.72rem] text-fg-subtle">
        <Calculator className="size-3.5" /> Spending you log here is saved in this browser only.
      </div>
    </div>
  )
}
