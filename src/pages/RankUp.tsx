import { motion } from 'motion/react'
import { ArrowRight, Check as CheckIcon, Lock, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Portrait, RaidPortrait } from '../components/champion/Portrait'
import { PageHeader } from '../components/layout/PageHeader'
import { Check } from '../components/ui/Check'
import { Stepper } from '../components/ui/Fields'
import { Segments } from '../components/ui/Progress'
import { LabelTag, Rich } from '../components/ui/Rich'
import { Callout, Panel, SectionHead } from '../components/ui/primitives'
import { champions } from '../data/champions'
import { levelCaps, rankAssumption, rankRules, rankUpIntro, sacrifice, supply, wave1, wave2, wave2Cost, whyFeasts, xpToCap } from '../data/rankUp'
import type { ChampionId } from '../data/types'
import { isRankSix, stepFlag } from '../lib/checks'
import { cn } from '../lib/cn'
import { fmt } from '../lib/format'
import { raidChampion, rarityColor } from '../lib/rsl'
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
    { label: '2 Mythicals', ids: ['gizmak', 'galleus'] as ChampionId[] },
    { label: '3 Feasts', ids: ['maneater', 'deacon', 'painkeeper'] as ChampionId[] },
    { label: '3 from 5★ chickens', ids: ['ninja', 'artak', 'rathalos'] as ChampionId[] },
    { label: '5 from 4★ chickens', ids: ['kymar', 'udk', 'seer', 'ruella', 'skullcrusher'] as ChampionId[] },
  ]
  const total = champions.filter((c) => isRankSix(st, c)).length
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="t-label text-low">13 Rank 6s in total</div>
          <h2 className="t-headline mt-1.5 text-[1.65rem] text-hi sm:text-[1.9rem]">Where every Rank 6 comes from</h2>
        </div>
        <div className="flex items-end gap-2">
          <span className="t-display text-[3.6rem] leading-[0.8] text-hi">{total}</span>
          <span className="pb-1 text-[0.8rem] font-semibold text-low">/13 at Rank 6</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_3fr_3fr_5fr]">
        {groups.map((g) => (
          <div key={g.label} className="panel p-3">
            <div className="t-label mb-3 text-low">{g.label}</div>
            <div className="flex gap-2">
              {g.ids.map((id) => {
                const c = champions.find((x) => x.id === id)!
                const on = isRankSix(st, c)
                return (
                  <Link key={id} to={`/champions/${id}`} data-tip={`champ:${id}`} className="group min-w-0 flex-1">
                    <div className={cn('transition-opacity', on ? 'opacity-100' : 'opacity-40 group-hover:opacity-70')}>
                      <Portrait id={id} fluid showAffinity={false} className="block" />
                    </div>
                    <div className="mt-1.5 h-1 rounded-[1px]" style={{ background: on ? rarityColor[c.rarity] : 'rgb(255 255 255 / 0.08)' }} />
                    <div className={cn('mt-1 truncate text-center text-[0.68rem] font-bold', on ? 'text-hi' : 'text-low')}>{c.short}</div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Wave1Table() {
  return (
    <section id="wave-1" className="scroll-mt-24">
      <SectionHead index="01" title={wave1.title} />
      <Panel padded={false}>
        <div className="overflow-x-auto">
          <table className="tbl min-w-[720px]">
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
                    <ChampCell id={r.id} label={r.champ} />
                  </td>
                  <td>
                    <Rich text={r.path} className="font-semibold text-hi" />
                  </td>
                  <td>
                    <Rich text={r.fodder} />
                  </td>
                  <td className="tabular-nums">{r.xp}</td>
                </tr>
              ))}
              <tr className="bg-raised-2">
                <td className="pl-5" />
                <td className="t-label text-hi">Total</td>
                <td />
                <td className="font-bold text-hi">{wave1.total.fodder}</td>
                <td className="font-extrabold text-hi">{wave1.total.xp}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 border-t border-edge px-5 py-3">
          <DoneCheck id="skullcrusher" step="r5" />
          <Rich text={wave1.skullNote} className="text-[0.84rem] text-mid" />
        </div>
      </Panel>
    </section>
  )
}

function Wave2Table() {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const crafted = wave2.rows.reduce((a, r) => a + Math.min(r.crafted, nums[`craft.${r.id}`] ?? 0), 0)
  const craftedTotal = wave2.rows.reduce((a, r) => a + r.crafted, 0)
  return (
    <section id="wave-2" className="scroll-mt-24">
      <SectionHead
        index="02"
        title={wave2.title}
        intro={wave2.intro}
        action={
          <span className="text-[0.78rem] text-low">
            Crafted 5★ fodder: <span className="font-bold text-hi tabular-nums">{crafted}</span>/{craftedTotal}
          </span>
        }
      />
      <Panel padded={false}>
        <div className="overflow-x-auto">
          <table className="tbl min-w-[860px]">
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
                    <ChampCell id={r.id} label={r.target} />
                  </td>
                  <td>
                    <Rich text={r.needs} className="font-semibold text-hi" />
                  </td>
                  <td className="tabular-nums">{r.units}</td>
                  <td className="tabular-nums">{r.bases}</td>
                  <td>
                    <Stepper size="sm" value={Math.min(r.crafted, nums[`craft.${r.id}`] ?? 0)} max={r.crafted} onChange={(v) => setNum(`craft.${r.id}`, v)} />
                  </td>
                </tr>
              ))}
              <tr className="bg-raised-2">
                <td className="pl-5" />
                <td className="t-label text-hi">Total</td>
                <td />
                <td className="font-extrabold text-hi tabular-nums">{wave2.total.units}</td>
                <td className="font-extrabold text-hi tabular-nums">{wave2.total.bases}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function Supply() {
  const colors = ['var(--color-paper)', 'var(--color-epic)', 'var(--color-rare)']
  return (
    <section id="supply" className="scroll-mt-24">
      <SectionHead index="03" title="Supply: exactly enough for Wave 2" />
      <Panel>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex h-12 gap-[2px] overflow-hidden rounded-[3px]">
              {supply.parts.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.value / supply.needed) * 100}%` }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="t-num flex items-center justify-center text-[1rem] text-ink"
                  style={{ background: colors[i] }}
                >
                  {p.value}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {supply.parts.map((p, i) => (
                <div key={p.label} className="flex items-center gap-3 text-[0.84rem] text-mid">
                  <span className="size-3 rounded-[1px]" style={{ background: colors[i] }} />
                  <span className="t-num w-8 text-[1rem] text-hi">{p.value}</span>
                  <Rich text={p.label} />
                </div>
              ))}
              <div className="flex items-center gap-3 border-t border-edge pt-2.5 text-[0.86rem] font-bold text-hi">
                <span className="size-3" />
                <span className="t-num w-8 text-[1rem]">{supply.needed}</span> 4★ units = exactly what Wave 2 uses
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="t-label text-low">How the 25 crafted 4★ units are made</div>
            <div className="flex flex-wrap items-center gap-2 text-[0.82rem]">
              <span className="rounded-[3px] border border-edge-2 px-2.5 py-1.5 text-hi">{supply.threeStar.chickens} × 3★ chickens</span>
              <Plus className="size-4 text-low" />
              <span className="rounded-[3px] border border-edge-2 px-2.5 py-1.5 text-hi">
                {supply.threeStar.crafted} × 3★ from {supply.threeStar.fromTwoStar} × 2★ chickens
              </span>
              <ArrowRight className="size-4 text-low" />
              <span className="rounded-[3px] border border-paper px-2.5 py-1.5 font-bold text-hi">{supply.threeStar.total} × 3★ fodder</span>
              <ArrowRight className="size-4 text-low" />
              <span className="rounded-[3px] bg-epic px-2.5 py-1.5 font-bold text-ink">25 × 4★ units</span>
            </div>
            <div className="text-[0.76rem] text-low">
              Costs {supply.foodCost.threeStarAt30} real 3★ campaign food champions at Lv30 and {supply.foodCost.twoStarAt20} real 2★ at Lv20.
            </div>
          </div>
        </div>
        <Rich as="p" text={supply.text} className="mt-6 text-[0.86rem] leading-relaxed text-mid" />
        <Rich as="p" text={wave2Cost} className="mt-3 text-[0.86rem] leading-relaxed text-mid" />
      </Panel>
    </section>
  )
}

function FodderChip({ name }: { name: string }) {
  const flag = `fodder.${name}`
  const used = useStore((s) => !!s.flags[flag])
  const setFlag = useStore((s) => s.setFlag)
  const known = !!raidChampion(name)
  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.94 }}
      onClick={() => setFlag(flag, !used)}
      data-tip={known ? `raid:${name}` : undefined}
      aria-pressed={used}
      title={known ? undefined : used ? 'Used as a base / fodder — click to undo' : 'Mark as used'}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-[3px] border text-[0.8rem] font-semibold transition-colors',
        known ? 'pr-3 pl-1' : 'px-3',
        used ? 'border-ok/50 bg-ok/10 text-ok' : 'border-edge-2 text-mid hover:border-mid hover:text-hi',
      )}
    >
      {known && <RaidPortrait name={name} size={18} className={cn(used && 'opacity-50')} />}
      {used && <CheckIcon className="size-3.5" />}
      <span className={cn(used && 'line-through decoration-ok/50')}>{name}</span>
    </motion.button>
  )
}

function Fodder() {
  const flags = useStore((s) => s.flags)
  const usedCount = [...sacrifice.useFirst, ...sacrifice.then].filter((n) => flags[`fodder.${n}`]).length
  return (
    <section id="fodder" className="scroll-mt-24">
      <SectionHead
        index="04"
        title={sacrifice.title}
        label={sacrifice.label}
        action={
          <div className="flex items-end gap-1.5">
            <span className="t-num text-[1.6rem] text-hi">{usedCount}</span>
            <span className="pb-0.5 text-[0.78rem] text-low">/{sacrifice.basesNeeded} bases used</span>
          </div>
        }
      />
      <Panel>
        <div className="space-y-6">
          <div>
            <div className="t-label mb-2 text-hi">
              Use first <span className="text-low">({sacrifice.useFirst.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sacrifice.useFirst.map((n) => (
                <FodderChip key={n} name={n} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-baseline gap-2">
              <span className="t-label text-hi">
                Then <span className="text-low">({sacrifice.then.length})</span>
              </span>
              <span className="text-[0.76rem] text-low">{sacrifice.thenNote}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sacrifice.then.map((n) => (
                <FodderChip key={n} name={n} />
              ))}
            </div>
          </div>
          <Segments value={usedCount} total={sacrifice.basesNeeded} color="var(--color-ok)" height={6} />
          <div className="well p-4" style={{ boxShadow: 'inset 3px 0 0 var(--color-bad)' }}>
            <div className="t-label mb-3 flex items-center gap-2 text-bad">
              <Lock className="size-3.5" /> Keep — never feed
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...sacrifice.keep, ...sacrifice.keepHH7].map((n) => (
                <span
                  key={n}
                  data-tip={raidChampion(n) ? `raid:${n}` : undefined}
                  className={cn('inline-flex h-7 items-center gap-1.5 rounded-[3px] border border-edge-2 text-[0.78rem] font-semibold text-hi', raidChampion(n) ? 'pr-2.5 pl-1' : 'px-2.5')}
                >
                  {raidChampion(n) && <RaidPortrait name={n} size={16} />}
                  {n}
                  {sacrifice.keepHH7.includes(n) && <span className="t-label text-[0.6rem] text-low">HH 7+</span>}
                </span>
              ))}
            </div>
            <div className="mt-3 text-[0.8rem] text-mid">
              Also keep any HH 7+ Epic and <Rich text={sacrifice.keepRares} />.
            </div>
          </div>
          <Callout tone="warn" text={sacrifice.factionWars} />
        </div>
      </Panel>
    </section>
  )
}

function ChampCell({ id, label }: { id: ChampionId; label: string }) {
  const c = champions.find((x) => x.id === id)!
  return (
    <Link to={`/champions/${id}`} data-tip={`champ:${id}`} className="flex items-center gap-2.5 font-bold" style={{ color: rarityColor[c.rarity] }}>
      <Portrait id={id} size={26} showAffinity={false} />
      {label}
    </Link>
  )
}

export function RankUp() {
  return (
    <div className="space-y-14">
      <PageHeader eyebrow="Section 5" title="The 6★ plan with the math" intro={rankUpIntro} />
      <SixStarBar />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Panel className="xl:col-span-3" kicker="Rules" title="How ranking up works">
          <Rich as="p" text={rankRules} className="text-[0.88rem] leading-relaxed text-mid" />
          <Callout tone="tip" className="mt-4" text={rankAssumption} />
          <Rich as="p" text={whyFeasts} className="mt-4 text-[0.88rem] leading-relaxed text-mid" />
        </Panel>
        <Panel className="xl:col-span-2" kicker="Ayumilove leveling" title="XP from level 1 to cap" label="Sourced" padded={false}>
          <div className="overflow-x-auto">
            <table className="tbl">
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
                    <td className="t-num pl-5 text-[1rem] text-hi">{r}★</td>
                    <td className="tabular-nums">{levelCaps[r]}</td>
                    <td className="font-semibold text-hi tabular-nums">{fmt(xpToCap[r])}</td>
                    <td className="tabular-nums">{Math.ceil(xpToCap[r] / 18_750)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-edge px-5 py-3 text-[0.74rem] text-low">
            Brews column = XP ÷ 18,750 (a matched brew), rounded up. <LabelTag label="Calculated" />
          </div>
        </Panel>
      </div>
      <Wave1Table />
      <Wave2Table />
      <Supply />
      <Fodder />
    </div>
  )
}
