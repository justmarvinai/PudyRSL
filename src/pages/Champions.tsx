import { AnimatePresence, motion } from 'motion/react'
import { LayoutGrid, Search, Table2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CoverageCell, CoverageDot } from '../components/champion/Coverage'
import { affinityTone, rarityColor, Sigil, useAffinity } from '../components/champion/Sigil'
import { PageHeader } from '../components/layout/PageHeader'
import { Segmented } from '../components/ui/Fields'
import { ProgressBar } from '../components/ui/Progress'
import { LabelTag, Rich } from '../components/ui/Rich'
import { Card, Pill, SectionTitle } from '../components/ui/primitives'
import { benchOptions, champions, notBuiltEarly, whyList, type Champion } from '../data/champions'
import { contentAreas, labelLegend } from '../data/guide'
import type { ContentKey } from '../data/types'
import { championProgress, championStatus } from '../lib/checks'
import { cn } from '../lib/cn'
import { pct } from '../lib/format'
import { useStore } from '../lib/store'

const shortArea: Record<ContentKey, string> = {
  demonLord: 'DL',
  chimera: 'Chim',
  hydra: 'Hyd',
  spider: 'Spi',
  dragon: 'Dra',
  fk: 'FK',
  ig: 'IG',
  arena: 'Arena',
}

const usedIn = (c: Champion, key: ContentKey) => {
  const v = c.coverage[key].trim()
  return v !== '–' && !v.startsWith('–')
}

function ChampionCard({ c, index }: { c: Champion; index: number }) {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const p = championProgress({ flags, nums }, c)
  const status = championStatus({ flags, nums }, c)
  const { affinity, fromGuide } = useAffinity(c.id)
  const col = rarityColor[c.rarity]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.025, type: 'spring', stiffness: 280, damping: 26 }}
    >
      <Link to={`/champions/${c.id}`} className="block h-full">
        <Card spotlight whileHover={{ y: -4 }} className="flex h-full flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <Sigil id={c.id} size={60} glow />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.98rem] font-semibold text-fg">{c.name}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Pill tone={col.tone}>{c.rarity}</Pill>
                <Pill tone="neutral">Wave {c.wave}</Pill>
                {affinity ? (
                  <Pill tone={affinityTone[affinity]} title={fromGuide ? 'Confirmed in the guide' : 'Recorded by you'}>
                    {affinity}
                    {!fromGuide && ' ✎'}
                  </Pill>
                ) : (
                  <Pill tone="neutral" className="text-fg-subtle" title="The guide says: check in-game">
                    Affinity?
                  </Pill>
                )}
              </div>
            </div>
          </div>
          <div className="text-[0.82rem] leading-snug text-fg-muted">{c.tagline}</div>
          <div className="mt-auto space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[0.72rem]">
                <span className={cn('font-semibold', status === 'R6 · Lv 60' ? 'text-ok' : 'text-fg-muted')}>{status}</span>
                <span className="text-fg-subtle tabular-nums">
                  {p.done}/{p.total} steps
                </span>
              </div>
              <ProgressBar value={pct(p.done, p.total)} height={5} tone={p.done === p.total ? 'ok' : 'gold'} />
            </div>
            <div className="flex flex-wrap gap-1">
              {contentAreas.map((a) => (
                <CoverageDot key={a.key} value={c.coverage[a.key]} label={shortArea[a.key]} />
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

function Matrix({ list }: { list: Champion[] }) {
  const [hoverCol, setHoverCol] = useState<ContentKey | null>(null)
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-guide min-w-[1050px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-ink-850">Champion</th>
              <th>Rarity</th>
              {contentAreas.map((a) => (
                <th key={a.key} className={cn('text-center transition-colors', hoverCol === a.key && 'text-gold-300')} title={a.long}>
                  {a.label}
                </th>
              ))}
              <th>6★ wave</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="group">
                <td className="sticky left-0 z-10 bg-ink-850 group-hover:bg-ink-800">
                  <Link to={`/champions/${c.id}`} className="flex items-center gap-2.5 font-semibold text-fg hover:text-gold-300">
                    <Sigil id={c.id} size={30} />
                    <span className="whitespace-nowrap">{c.name}</span>
                  </Link>
                </td>
                <td>
                  <span className={cn('text-xs font-semibold', rarityColor[c.rarity].text)}>{c.rarity}</span>
                </td>
                {contentAreas.map((a) => (
                  <td
                    key={a.key}
                    onMouseEnter={() => setHoverCol(a.key)}
                    onMouseLeave={() => setHoverCol(null)}
                    className={cn('text-center transition-colors', hoverCol === a.key && 'bg-gold-400/[0.04]')}
                  >
                    <CoverageCell value={c.coverage[a.key]} full />
                  </td>
                ))}
                <td className="text-xs whitespace-nowrap text-fg-muted">{c.waveLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] px-5 py-3 text-[0.75rem] text-fg-subtle">
        {labelLegend.table.map((l) => (
          <span key={l.sym} className="inline-flex items-center gap-2">
            <CoverageCell value={l.sym} /> = {l.text}
          </span>
        ))}
      </div>
    </Card>
  )
}

export function Champions() {
  const [view, setView] = useState<'cards' | 'matrix'>('cards')
  const [wave, setWave] = useState<'all' | '1' | '2'>('all')
  const [area, setArea] = useState<ContentKey | 'all'>('all')
  const [query, setQuery] = useState('')

  const list = useMemo(
    () =>
      champions.filter((c) => {
        if (wave !== 'all' && String(c.wave) !== wave) return false
        if (area !== 'all' && !usedIn(c, area)) return false
        if (query && !`${c.name} ${c.rarity} ${c.tagline}`.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [wave, area, query],
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Section 1"
        title="Your 13-champion core"
        intro={labelLegend.intro}
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'cards', label: <><LayoutGrid className="size-3.5" /> Cards</> },
              { value: 'matrix', label: <><Table2 className="size-3.5" /> Matrix</> },
            ]}
          />
        }
      >
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.78rem] text-fg-subtle">
          <span>
            <LabelTag label="Sourced" /> = {labelLegend.sourced}
          </span>
          <span>
            <LabelTag label="My call" /> = {labelLegend.myCall}
          </span>
          <span>{labelLegend.ratings}</span>
        </div>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          size="sm"
          value={wave}
          onChange={setWave}
          options={[
            { value: 'all', label: 'All 13' },
            { value: '1', label: 'Wave 1' },
            { value: '2', label: 'Wave 2' },
          ]}
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setArea('all')}
            className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold transition', area === 'all' ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/10 text-fg-muted hover:text-fg')}
          >
            Any content
          </button>
          {contentAreas.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setArea(area === a.key ? 'all' : a.key)}
              title={a.long}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                area === a.key ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/10 text-fg-muted hover:text-fg',
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter champions…" className="input pl-9" />
        </label>
      </div>

      <div id="matrix" className="scroll-mt-24">
        {view === 'cards' ? (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {list.map((c, i) => (
                <ChampionCard key={c.id} c={c} index={i} />
              ))}
            </AnimatePresence>
            {list.length === 0 && <div className="col-span-full py-12 text-center text-sm text-fg-subtle">No champion matches these filters.</div>}
          </motion.div>
        ) : (
          <Matrix list={list} />
        )}
      </div>

      <Card>
        <SectionTitle eyebrow="In priority order" title="Why these" label="Sourced ratings → My call" />
        <ol className="space-y-3">
          {whyList.map((w, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-3 text-[0.86rem] leading-relaxed text-fg-muted"
            >
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold-500/10 text-[0.7rem] font-bold text-gold-300 ring-1 ring-gold-500/25">{i + 1}</span>
              <Rich text={w} />
            </motion.li>
          ))}
        </ol>
      </Card>

      <div id="bench" className="scroll-mt-24 space-y-4">
        <SectionTitle eyebrow="Beyond the 13" title="Bench & alternatives" />
        <Card>
          <Rich as="p" text={notBuiltEarly.text} className="text-[0.86rem] leading-relaxed text-fg-muted" />
          <div className="mt-4 flex flex-wrap gap-2">
            {notBuiltEarly.names.map((n) => (
              <span key={n.name} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.78rem] text-fg-muted">
                <span className="font-semibold text-fg">{n.name}</span>
                {n.note && <span className="text-fg-subtle">· {n.note}</span>}
              </span>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {benchOptions.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 3) * 0.05 }}
              className="card-flat p-4"
            >
              <div className="eyebrow text-gold-500/80">{b.role}</div>
              <div className="mt-1 text-[0.92rem] font-semibold text-fg">{b.name}</div>
              <Rich as="p" text={b.text} className="mt-1.5 text-[0.8rem] leading-relaxed text-fg-subtle" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
