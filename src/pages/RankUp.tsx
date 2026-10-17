import { motion } from 'motion/react'
import { ArrowRight, Check as CheckIcon, Lock, Plus, Skull } from 'lucide-react'
import { Link } from 'react-router'
import { Sigil } from '../components/champion/Sigil'
import { PageHeader } from '../components/layout/PageHeader'
import { Check } from '../components/ui/Check'
import { Stepper } from '../components/ui/Fields'
import { ProgressBar, ProgressRing } from '../components/ui/Progress'
import { LabelTag, Rich } from '../components/ui/Rich'
import { Callout, Card, SectionTitle } from '../components/ui/primitives'
import { champions } from '../data/champions'
import {
  levelCaps,
  rankAssumption,
  rankRules,
  rankUpIntro,
  sacrifice,
  supply,
  wave1,
  wave2,
  wave2Cost,
  whyFeasts,
  xpToCap,
} from '../data/rankUp'
import type { ChampionId } from '../data/types'
import { isRankSix, stepFlag } from '../lib/checks'
import { cn } from '../lib/cn'
import { fmt, pct } from '../lib/format'
import { useStore } from '../lib/store'

function DoneCheck({ id, step }: { id: ChampionId; step: string }) {
  const flag = stepFlag(id, step)
  const done = useStore((s) => !!s.flags[flag])
  const setFlag = useStore((s) => s.setFlag)
  return <Check checked={done} onChange={(v) => setFlag(flag, v)} label="Done" />
}

function SixStarBar() {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const st = { flags, nums }
  const groups = [
    { label: '2 Mythicals', ids: ['gizmak', 'galleus'] as ChampionId[], cls: 'from-mythical/80 to-mythical/50' },
    { label: '3 Feasts', ids: ['maneater', 'deacon', 'painkeeper'] as ChampionId[], cls: 'from-epic/80 to-epic/50' },
    { label: '3 from 5★ chickens', ids: ['ninja', 'artak', 'rathalos'] as ChampionId[], cls: 'from-legendary/80 to-legendary/50' },
    { label: '5 from 4★ chickens', ids: ['kymar', 'udk', 'seer', 'ruella', 'skullcrusher'] as ChampionId[], cls: 'from-gold-400/80 to-gold-600/50' },
  ]
  const total = champions.filter((c) => isRankSix(st, c)).length
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle eyebrow="13 Rank 6s in total" title="Where every Rank 6 comes from" className="mb-0" />
        <div className="text-right">
          <div className="text-2xl font-bold text-fg tabular-nums">
            {total}
            <span className="text-fg-subtle">/13</span>
          </div>
          <div className="text-[0.7rem] text-fg-subtle">at Rank 6 now</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[2fr_3fr_3fr_5fr]">
        {groups.map((g) => (
          <div key={g.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="mb-2 text-[0.72rem] font-semibold text-fg-muted">{g.label}</div>
            <div className="flex gap-1.5">
              {g.ids.map((id) => {
                const c = champions.find((x) => x.id === id)!
                const on = isRankSix(st, c)
                return (
                  <Link key={id} to={`/champions/${id}`} className="relative flex-1" title={c.name}>
                    <div className={cn('h-2 rounded-full bg-gradient-to-r transition-opacity', g.cls, on ? 'opacity-100' : 'opacity-15')} />
                    <div className={cn('mt-1.5 truncate text-center text-[0.65rem]', on ? 'text-fg' : 'text-fg-subtle')}>{c.short}</div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Wave1Table() {
  return (
    <Card id="wave-1" padded={false} className="scroll-mt-24">
      <div className="p-5 pb-2">
        <SectionTitle eyebrow="Days 1–3" title={wave1.title} className="mb-0" />
      </div>
      <div className="overflow-x-auto">
        <table className="table-guide min-w-[720px]">
          <thead>
            <tr>
              <th className="w-12 pl-5">Done</th>
              <th>Champion</th>
              <th>Path</th>
              <th>Fodder</th>
              <th>XP needed</th>
            </tr>
          </thead>
          <tbody>
            {wave1.rows.map((r) => (
              <tr key={r.id}>
                <td className="pl-5">
                  <DoneCheck id={r.id} step={r.doneStep} />
                </td>
                <td>
                  <Link to={`/champions/${r.id}`} className="flex items-center gap-2.5 font-semibold text-fg hover:text-gold-300">
                    <Sigil id={r.id} size={28} />
                    {r.champ}
                  </Link>
                </td>
                <td className="text-fg">{r.path}</td>
                <td>{r.fodder}</td>
                <td className="tabular-nums">{r.xp}</td>
              </tr>
            ))}
            <tr className="bg-white/[0.02]">
              <td className="pl-5" />
              <td className="font-bold text-fg">Total</td>
              <td />
              <td className="font-semibold text-fg">{wave1.total.fodder}</td>
              <td className="font-bold text-gold-300">{wave1.total.xp}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-3">
        <DoneCheck id="skullcrusher" step="r5" />
        <Rich text={wave1.skullNote} className="text-[0.82rem] text-fg-muted" />
      </div>
    </Card>
  )
}

function Wave2Table() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const crafted = wave2.rows.reduce((a, r) => a + Math.min(r.crafted, nums[`craft.${r.id}`] ?? 0), 0)
  const craftedTotal = wave2.rows.reduce((a, r) => a + r.crafted, 0)
  return (
    <Card id="wave-2" padded={false} className="scroll-mt-24">
      <div className="p-5 pb-2">
        <SectionTitle
          eyebrow="Weeks 2–6"
          title={wave2.title}
          className="mb-1"
          action={
            <span className="text-xs text-fg-subtle">
              Crafted 5★ fodder: <span className="font-semibold text-fg tabular-nums">{crafted}</span>/{craftedTotal}
            </span>
          }
        />
        <Rich as="p" text={wave2.intro} className="text-[0.8rem] text-fg-subtle" />
      </div>
      <div className="overflow-x-auto">
        <table className="table-guide min-w-[860px]">
          <thead>
            <tr>
              <th className="w-12 pl-5">Done</th>
              <th>Target</th>
              <th>Needs</th>
              <th>4★ units used (incl. bases)</th>
              <th>Real Lv40 bases</th>
              <th>Crafted 5★</th>
            </tr>
          </thead>
          <tbody>
            {wave2.rows.map((r) => (
              <tr key={r.id}>
                <td className="pl-5">
                  <DoneCheck id={r.id} step={r.doneStep} />
                </td>
                <td>
                  <Link to={`/champions/${r.id}`} className="flex items-center gap-2.5 font-semibold text-fg hover:text-gold-300">
                    <Sigil id={r.id} size={28} />
                    {r.target}
                  </Link>
                </td>
                <td className="text-fg">{r.needs}</td>
                <td className="tabular-nums">{r.units}</td>
                <td className="tabular-nums">{r.bases}</td>
                <td>
                  <Stepper size="sm" value={Math.min(r.crafted, nums[`craft.${r.id}`] ?? 0)} max={r.crafted} onChange={(v) => setNum(`craft.${r.id}`, v)} />
                </td>
              </tr>
            ))}
            <tr className="bg-white/[0.02]">
              <td className="pl-5" />
              <td className="font-bold text-fg">Total</td>
              <td />
              <td className="font-bold text-gold-300 tabular-nums">{wave2.total.units}</td>
              <td className="font-bold text-gold-300 tabular-nums">{wave2.total.bases}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Supply() {
  const colors = ['from-gold-300 to-gold-500', 'from-epic to-[#7b3fe0]', 'from-info to-[#3a6fd8]']
  return (
    <Card id="supply" className="scroll-mt-24">
      <SectionTitle eyebrow="Chicken math" title="Supply: exactly enough for Wave 2" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex h-12 overflow-hidden rounded-xl border border-white/10">
            {supply.parts.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ width: 0 }}
                animate={{ width: `${(p.value / supply.needed) * 100}%` }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 60, damping: 18 }}
                className={cn('flex items-center justify-center bg-gradient-to-b text-sm font-bold text-ink-950', colors[i])}
              >
                {p.value}
              </motion.div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {supply.parts.map((p, i) => (
              <div key={p.label} className="flex items-center gap-2.5 text-[0.8rem] text-fg-muted">
                <span className={cn('size-3 rounded-sm bg-gradient-to-b', colors[i])} />
                <span className="w-8 font-semibold text-fg tabular-nums">{p.value}</span> {p.label}
              </div>
            ))}
            <div className="flex items-center gap-2.5 border-t border-white/[0.06] pt-2 text-[0.84rem] font-semibold text-gold-300">
              <span className="size-3" />
              <span className="w-8 tabular-nums">{supply.needed}</span> 4★ units = exactly what Wave 2 uses
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="eyebrow">How the 25 crafted 4★ units are made</div>
          <div className="flex flex-wrap items-center gap-2 text-[0.8rem]">
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-fg">
              {supply.threeStar.chickens} × 3★ chickens
            </span>
            <Plus className="size-4 text-fg-subtle" />
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-fg">
              {supply.threeStar.crafted} × 3★ from {supply.threeStar.fromTwoStar} × 2★ chickens
            </span>
            <ArrowRight className="size-4 text-gold-500" />
            <span className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-2.5 py-1.5 font-semibold text-gold-300">{supply.threeStar.total} × 3★ fodder</span>
            <ArrowRight className="size-4 text-gold-500" />
            <span className="rounded-lg border border-epic/40 bg-epic/10 px-2.5 py-1.5 font-semibold text-epic">25 × 4★ units</span>
          </div>
          <div className="text-[0.75rem] text-fg-subtle">
            Costs {supply.foodCost.threeStarAt30} real 3★ campaign food champions at Lv30 and {supply.foodCost.twoStarAt20} real 2★ at Lv20.
          </div>
        </div>
      </div>
      <Rich as="p" text={supply.text} className="mt-5 text-[0.82rem] leading-relaxed text-fg-muted" />
      <Rich as="p" text={wave2Cost} className="mt-3 text-[0.82rem] leading-relaxed text-fg-muted" />
    </Card>
  )
}

function FodderChip({ name }: { name: string }) {
  const flag = `fodder.${name}`
  const used = useStore((s) => !!s.flags[flag])
  const setFlag = useStore((s) => s.setFlag)
  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.92 }}
      onClick={() => setFlag(flag, !used)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.78rem] font-medium transition-colors',
        used ? 'border-ok/40 bg-ok/10 text-ok' : 'border-white/10 bg-white/[0.03] text-fg-muted hover:border-gold-400/40 hover:text-fg',
      )}
      title={used ? 'Used as a base / fodder — click to undo' : 'Mark as used'}
    >
      {used ? <CheckIcon className="size-3.5" /> : <Skull className="size-3.5 opacity-50" />}
      <span className={cn(used && 'line-through decoration-ok/40')}>{name}</span>
    </motion.button>
  )
}

function Fodder() {
  const flags = useStore((s) => s.flags)
  const usedCount = [...sacrifice.useFirst, ...sacrifice.then].filter((n) => flags[`fodder.${n}`]).length
  return (
    <Card id="fodder" className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle eyebrow="Bases & fodder" title={sacrifice.title} label={sacrifice.label} className="mb-0" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xl font-bold text-fg tabular-nums">
              {usedCount}
              <span className="text-fg-subtle">/{sacrifice.basesNeeded}</span>
            </div>
            <div className="text-[0.7rem] text-fg-subtle">bases used</div>
          </div>
          <ProgressRing value={pct(usedCount, sacrifice.basesNeeded)} size={44} stroke={4} tone="ok" />
        </div>
      </div>
      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[0.82rem] font-semibold text-fg">
            Use first <span className="text-fg-subtle">({sacrifice.useFirst.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sacrifice.useFirst.map((n) => (
              <FodderChip key={n} name={n} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-[0.82rem] font-semibold text-fg">
            Then <span className="text-fg-subtle">({sacrifice.then.length})</span>
            <span className="text-[0.75rem] font-normal text-fg-subtle">{sacrifice.thenNote}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sacrifice.then.map((n) => (
              <FodderChip key={n} name={n} />
            ))}
          </div>
        </div>
        <ProgressBar value={pct(usedCount, sacrifice.basesNeeded)} tone="ok" />
        <div className="rounded-2xl border border-bad/20 bg-bad/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-[0.82rem] font-semibold text-bad">
            <Lock className="size-4" /> Keep — never feed
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[...sacrifice.keep, ...sacrifice.keepHH7].map((n) => (
              <span key={n} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2.5 py-0.5 text-[0.75rem] text-fg-muted">
                <Lock className="size-3 text-fg-subtle" /> {n}
                {sacrifice.keepHH7.includes(n) && <span className="text-[0.65rem] text-gold-500">HH 7+</span>}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[0.78rem] text-fg-muted">
            Also keep any HH 7+ Epic and <Rich text={sacrifice.keepRares} />.
          </div>
        </div>
        <Callout tone="warn" text={sacrifice.factionWars} />
      </div>
    </Card>
  )
}

export function RankUp() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Section 5" title="The 6★ plan with the math" intro={rankUpIntro} />
      <SixStarBar />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <Rich as="p" text={rankRules} className="text-[0.84rem] leading-relaxed text-fg-muted" />
          <Callout tone="tip" className="mt-4" text={rankAssumption} />
          <Rich as="p" text={whyFeasts} className="mt-4 text-[0.84rem] leading-relaxed text-fg-muted" />
        </Card>
        <Card className="xl:col-span-2" padded={false}>
          <div className="p-5 pb-2">
            <SectionTitle eyebrow="Ayumilove leveling" title="XP from level 1 to cap" label="Sourced" className="mb-0" />
          </div>
          <div className="overflow-x-auto">
          <table className="table-guide">
            <thead>
              <tr>
                <th className="pl-5">Rank</th>
                <th>Level cap</th>
                <th>XP to cap</th>
                <th>Brews (matched)</th>
              </tr>
            </thead>
            <tbody>
              {[3, 4, 5, 6].map((r) => (
                <tr key={r}>
                  <td className="pl-5 font-semibold text-fg">{r}★</td>
                  <td className="tabular-nums">{levelCaps[r]}</td>
                  <td className="tabular-nums">{fmt(xpToCap[r])}</td>
                  <td className="tabular-nums">{Math.ceil(xpToCap[r] / 18_750)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-5 py-3 text-[0.72rem] text-fg-subtle">
            Brews column = XP ÷ 18,750 (a matched brew), rounded up. <LabelTag label="Calculated" />
          </div>
        </Card>
      </div>
      <Wave1Table />
      <Wave2Table />
      <Supply />
      <Fodder />
    </div>
  )
}
