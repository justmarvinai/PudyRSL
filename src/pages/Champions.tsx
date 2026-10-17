import { AnimatePresence, motion } from 'motion/react'
import { LayoutGrid, Search, Table2 } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { CoverageCell, CoverageDot } from '../components/champion/Coverage'
import { AffinityTag, Portrait, RaidPortrait, RarityTag, useAffinity } from '../components/champion/Portrait'
import { PageHeader } from '../components/layout/PageHeader'
import { Segmented } from '../components/ui/Fields'
import { Segments } from '../components/ui/Progress'
import { LabelTag, Rich } from '../components/ui/Rich'
import { Panel, SectionHead, Tag } from '../components/ui/primitives'
import { benchOptions, champions, notBuiltEarly, whyList, type Champion } from '../data/champions'
import { contentAreas, labelLegend } from '../data/guide'
import type { ContentKey } from '../data/types'
import { championProgress, championStatus } from '../lib/checks'
import { cn } from '../lib/cn'
import { contentColor, raidChampion, rarityColor } from '../lib/rsl'
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
  const { affinity, source } = useAffinity(c.id)
  const complete = p.done === p.total
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/champions/${c.id}`} className="panel group flex h-full gap-4 p-4 transition-colors hover:border-edge-2 hover:bg-raised-2">
        <div className="w-[84px] shrink-0">
          <Portrait id={c.id} fluid className="block" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="t-title line-clamp-2 text-[1.05rem] leading-tight" style={{ color: rarityColor[c.rarity] }}>
            {c.name}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <RarityTag rarity={c.rarity} />
            <AffinityTag affinity={affinity} source={source} />
            <Tag>Wave {c.wave}</Tag>
          </div>
          <div className="mt-2 text-[0.8rem] leading-snug text-mid">{c.tagline}</div>
          <div className="mt-auto pt-3">
            <div className="mb-1.5 flex items-center justify-between text-[0.72rem]">
              <span className={cn('font-bold', complete ? 'text-ok' : 'text-hi')}>{status}</span>
              <span className="text-low tabular-nums">
                {p.done}/{p.total}
              </span>
            </div>
            <Segments value={p.done} total={p.total} height={4} color={complete ? 'var(--color-ok)' : 'var(--color-paper)'} />
            <div className="mt-3 flex flex-wrap gap-1">
              {contentAreas.map((a) => (
                <CoverageDot key={a.key} value={c.coverage[a.key]} label={shortArea[a.key]} color={contentColor[a.key]} />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Matrix({ list }: { list: Champion[] }) {
  const [hoverCol, setHoverCol] = useState<ContentKey | null>(null)
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="tbl min-w-[1050px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-raised">Champion</th>
              <th>Rarity</th>
              {contentAreas.map((a) => (
                <th key={a.key} className="text-center" title={a.long} style={{ color: hoverCol === a.key ? contentColor[a.key] : undefined }}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="dot" style={{ '--c': contentColor[a.key] } as CSSProperties} />
                    {a.label}
                  </span>
                </th>
              ))}
              <th>6★ wave</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="group">
                <td className="sticky left-0 z-10 bg-raised group-hover:bg-raised-2">
                  <Link to={`/champions/${c.id}`} data-tip={`champ:${c.id}`} className="flex items-center gap-2.5 font-bold" style={{ color: rarityColor[c.rarity] }}>
                    <Portrait id={c.id} size={28} showAffinity={false} />
                    <span className="whitespace-nowrap">{c.name}</span>
                  </Link>
                </td>
                <td>
                  <RarityTag rarity={c.rarity} />
                </td>
                {contentAreas.map((a) => (
                  <td
                    key={a.key}
                    onMouseEnter={() => setHoverCol(a.key)}
                    onMouseLeave={() => setHoverCol(null)}
                    className="text-center transition-colors"
                    style={hoverCol === a.key ? { background: 'var(--color-raised-2)' } : undefined}
                  >
                    <CoverageCell value={c.coverage[a.key]} full color={contentColor[a.key]} />
                  </td>
                ))}
                <td className="text-xs whitespace-nowrap text-mid">{c.waveLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-edge px-5 py-3 text-[0.76rem] text-low">
        {labelLegend.table.map((l) => (
          <span key={l.sym} className="inline-flex items-center gap-2">
            <CoverageCell value={l.sym} /> = {l.text}
          </span>
        ))}
      </div>
    </div>
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
    <div className="space-y-12">
      <PageHeader
        eyebrow="Section 1"
        title="Your 13-champion core"
        intro={labelLegend.intro}
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              {
                value: 'cards',
                label: (
                  <>
                    <LayoutGrid className="size-3.5" /> Cards
                  </>
                ),
              },
              {
                value: 'matrix',
                label: (
                  <>
                    <Table2 className="size-3.5" /> Matrix
                  </>
                ),
              },
            ]}
          />
        }
      >
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.78rem] text-low">
          <span>
            <LabelTag label="Sourced" /> = {labelLegend.sourced}
          </span>
          <span>
            <LabelTag label="My call" /> = {labelLegend.myCall}
          </span>
          <span>{labelLegend.ratings}</span>
        </div>
      </PageHeader>

      <div className="space-y-5">
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
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setArea('all')}
              className={cn('tag h-7 cursor-pointer px-2.5 text-[0.68rem]', area === 'all' && 'tag-solid')}
              style={{ '--c': 'var(--color-paper)' } as CSSProperties}
            >
              Any content
            </button>
            {contentAreas.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setArea(area === a.key ? 'all' : a.key)}
                title={a.long}
                className={cn('tag h-7 cursor-pointer px-2.5 text-[0.68rem]', area === a.key && 'tag-solid')}
                style={{ '--c': contentColor[a.key] } as CSSProperties}
              >
                {a.label}
              </button>
            ))}
          </div>
          <label className="relative ml-auto w-full sm:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-low" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter champions…" className="input pl-9" />
          </label>
        </div>

        <div id="matrix" className="scroll-mt-24">
          {view === 'cards' ? (
            <motion.div layout className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {list.map((c, i) => (
                  <ChampionCard key={c.id} c={c} index={i} />
                ))}
              </AnimatePresence>
              {list.length === 0 && <div className="col-span-full py-12 text-center text-sm text-low">No champion matches these filters.</div>}
            </motion.div>
          ) : (
            <Matrix list={list} />
          )}
        </div>
      </div>

      <section>
        <SectionHead title="Why these" label="Sourced ratings → My call" />
        <ol className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-2">
          {whyList.map((w, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className="flex gap-4 border-t border-edge pt-4 text-[0.88rem] leading-relaxed text-mid"
            >
              <span className="t-num w-8 shrink-0 text-[1.5rem] text-low">{String(i + 1).padStart(2, '0')}</span>
              <Rich text={w} />
            </motion.li>
          ))}
        </ol>
      </section>

      <section id="bench" className="scroll-mt-24">
        <SectionHead title="Bench & alternatives" intro="Beyond the 13 — names the guide mentions, with game info where raid-data has it (hover)." />
        <Panel>
          <Rich as="p" text={notBuiltEarly.text} className="text-[0.88rem] leading-relaxed text-mid" />
          <div className="mt-4 flex flex-wrap gap-2">
            {notBuiltEarly.names.map((n) => {
              const known = !!raidChampion(n.name)
              return (
                <span
                  key={n.name}
                  data-tip={known ? `raid:${n.name}` : undefined}
                  className="inline-flex items-center gap-2 rounded-[3px] border border-edge py-1 pr-3 pl-1 text-[0.8rem] text-low"
                >
                  {known ? <RaidPortrait name={n.name} size={22} /> : <span className="w-1" />}
                  <span className="font-bold text-hi">{n.name}</span>
                  {n.note && <span>· {n.note}</span>}
                </span>
              )
            })}
          </div>
        </Panel>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {benchOptions.map((b, i) => {
            const names = b.name.split(' · ')
            return (
              <motion.div key={b.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 3) * 0.04 }} className="panel p-4">
                <div className="t-label text-low">{b.role}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {names.map((n) =>
                    raidChampion(n) ? (
                      <span key={n} data-tip={`raid:${n}`} className="inline-flex items-center gap-2">
                        <RaidPortrait name={n} size={28} />
                        <span className="text-[0.94rem] font-bold text-hi">{n}</span>
                      </span>
                    ) : (
                      <span key={n} className="text-[0.94rem] font-bold text-hi">
                        {n}
                      </span>
                    ),
                  )}
                </div>
                <Rich as="p" text={b.text} className="mt-2 text-[0.8rem] leading-relaxed text-low" />
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
