import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Minus, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Portrait } from '../components/champion/Portrait'
import { TeamLineup } from '../components/champion/TeamLineup'
import { PageHeader } from '../components/layout/PageHeader'
import { SegmentPicker, Segmented } from '../components/ui/Fields'
import { LabelTag, Rich } from '../components/ui/Rich'
import { TabBar } from '../components/ui/Tabs'
import { Callout, Panel, SectionHead, Tag } from '../components/ui/primitives'
import { arena, dungeons, dungeonsIntro, farmOrder, hardModeNote, iceGolemThresholds, statTargets, type Dungeon } from '../data/dungeons'
import { cn } from '../lib/cn'
import { stageOf } from '../lib/derived'
import { affinityColor, affinityIcon, dungeonColor } from '../lib/rsl'
import { useStore } from '../lib/store'

const tabs = [
  ...dungeons.map((d) => ({
    key: d.id,
    label: d.short,
    color: dungeonColor[d.id],
    to: `/dungeons/${d.id}`,
    badge: <span className="text-[0.66rem] text-low">#{d.priority}</span>,
  })),
  { key: 'arena', label: 'Arena', color: dungeonColor.arena, to: '/dungeons/arena', badge: <span className="text-[0.66rem] text-low">#6</span> },
]

function StageTracker({ d }: { d: Dungeon }) {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const stage = stageOf(nums, d.stageKey)
  const set = (v: number) => setNum(`stage.${d.stageKey}`, Math.max(0, Math.min(25, v)))
  const next = d.milestones.find((m) => m.stage > stage)
  const color = dungeonColor[d.id]
  return (
    <Panel
      kicker="Your progress"
      title="Highest stage cleared"
      action={
        <div className="flex items-center gap-1">
          <button type="button" className="btn size-8 p-0" onClick={() => set(stage - 1)} aria-label="Lower stage">
            <Minus className="size-3.5" />
          </button>
          <button type="button" className="btn size-8 p-0" onClick={() => set(stage + 1)} aria-label="Raise stage">
            <Plus className="size-3.5" />
          </button>
        </div>
      }
    >
      <div className="flex items-end gap-3">
        <motion.div key={stage} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="t-display text-[4.5rem] leading-[0.8]" style={{ color: stage ? color : 'var(--color-edge-2)' }}>
          {stage || '0'}
        </motion.div>
        <div className="pb-1 text-[0.8rem] font-semibold text-low">/ 25</div>
      </div>

      <SegmentPicker value={stage} max={25} onChange={set} color={color} marks={d.milestones.map((m) => m.stage)} label={`${d.short} stage`} className="mt-5" />
      <div className="relative mt-2 h-4">
        {d.milestones.map((m) => (
          <span
            key={m.label}
            className={cn('absolute -translate-x-1/2 text-[0.66rem] font-bold tabular-nums', stage >= m.stage ? 'text-hi' : 'text-low')}
            style={{ left: `${((m.stage - 0.5) / 25) * 100}%` }}
          >
            {m.stage}
          </span>
        ))}
      </div>

      <ul className="mt-3 space-y-1.5 text-[0.8rem]">
        {d.milestones.map((m) => {
          const hit = stage >= m.stage
          return (
            <li key={m.label} className={cn('flex items-center gap-2.5', hit ? 'text-hi' : 'text-low')}>
              <span className="size-2 shrink-0 rounded-[1px]" style={{ background: hit ? 'var(--color-ok)' : 'var(--color-edge-2)' }} />
              {m.label}
            </li>
          )
        })}
      </ul>
      {next && (
        <div className="mt-3 text-[0.76rem] text-low">
          Next milestone: stage <span className="font-bold text-hi">{next.stage}</span> ({next.stage - stage} to go).
        </div>
      )}
    </Panel>
  )
}

function DungeonView({ d }: { d: Dungeon }) {
  const teamWave = useStore((s) => s.ui.teamWave)
  const setUi = useStore((s) => s.setUi)
  const wave = d.hasWave1 ? teamWave : 2
  const isIG = d.id === 'ice-golem'
  const color = dungeonColor[d.id]

  return (
    <div className="space-y-14">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" kicker={`Priority #${d.priority} · ${d.name}`} title="Mechanics" label="Sourced" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
          <Rich as="p" text={`${d.mechanics.charAt(0).toUpperCase()}${d.mechanics.slice(1)}`} className="text-[0.9rem] leading-relaxed text-mid" />
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {d.stages.map((s) => (
              <div key={s.stage} className="well flex items-start gap-3 px-3 py-2.5" style={{ boxShadow: `inset 3px 0 0 ${affinityColor[s.affinity]}` }}>
                <div className="shrink-0">
                  <div className="t-label text-low">Stage</div>
                  <div className="t-num mt-1 text-[1.5rem] text-hi">{s.stage}</div>
                </div>
                <div className="min-w-0 pt-0.5">
                  <span className="tag" style={{ '--c': affinityColor[s.affinity] } as CSSProperties}>
                    <img src={affinityIcon[s.affinity]} alt="" className="h-2.5" />
                    {s.affinity} boss
                  </span>
                  {s.note && <Rich as="div" text={s.note} className="mt-1.5 text-[0.76rem] leading-snug text-mid" />}
                </div>
              </div>
            ))}
          </div>
          {isIG && (
            <div className="mt-6">
              <div className="t-label mb-2 text-low">Kill the minions before each threshold</div>
              <div className="relative h-9 overflow-hidden rounded-[3px] border border-edge-2 bg-raised-3">
                <div className="absolute inset-y-0 left-0 bg-ig/25" style={{ width: '100%' }} />
                {iceGolemThresholds.map((t) => (
                  <div key={t} className="absolute inset-y-0 w-[2px] bg-ig" style={{ left: `${t}%` }}>
                    <span className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[0.7rem] font-extrabold text-hi tabular-nums">{t}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[0.66rem] text-low">
                <span>0% HP</span>
                <span>100% HP</span>
              </div>
            </div>
          )}
        </Panel>
        <StageTracker d={d} />
      </div>

      <section>
        <SectionHead
          index="01"
          title={d.hasWave1 ? `Wave ${wave} team` : 'Team (Wave 2)'}
          action={
            d.hasWave1 ? (
              <Segmented
                size="sm"
                value={teamWave}
                onChange={(v) => setUi({ teamWave: v })}
                options={[
                  { value: 1, label: 'Wave 1' },
                  { value: 2, label: 'Wave 2' },
                ]}
              />
            ) : (
              <Tag>Wave 2 only</Tag>
            )
          }
        />
        <AnimatePresence mode="wait">
          <motion.div key={wave} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
            <TeamLineup
              slots={d.team.map((s) => {
                const useW1 = wave === 1 && s.w1 !== undefined
                const changed = d.hasWave1 && s.w1 !== undefined && s.w1 !== s.w2 && wave === 2
                return {
                  slot: s.slot,
                  text: useW1 ? s.w1! : s.w2,
                  ids: useW1 ? s.w1Ids! : s.w2Ids,
                  highlight: changed,
                  lines: [{ text: s.role }, ...(s.targets ? [{ label: 'Targets', text: s.targets }] : [])],
                }
              })}
            />
          </motion.div>
        </AnimatePresence>
        {d.hasWave1 && wave === 2 && <p className="mt-3 text-[0.74rem] text-low">Slots with a top bar are the Wave-2 upgrades.</p>}
        <Rich as="p" text={d.after} className="mt-4 max-w-4xl text-[0.88rem] leading-relaxed text-mid" />
      </section>
    </div>
  )
}

function ArenaView() {
  const color = dungeonColor.arena
  return (
    <div className="space-y-14">
      <Panel kicker="Priority #6" title="Arena" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
        <ul className="space-y-3">
          {arena.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[0.88rem] leading-relaxed text-mid">
              <span className="mt-[0.6rem] size-1.5 shrink-0 bg-arena" />
              <Rich text={b} />
            </li>
          ))}
        </ul>
      </Panel>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: 'Week-1 offense', label: 'My call', list: arena.week1, index: '01' },
          { title: 'Wave-2 offense', label: undefined, list: arena.wave2, index: '02' },
        ].map((t) => (
          <section key={t.title}>
            <SectionHead index={t.index} title={t.title} label={t.label} />
            <div className="space-y-1.5">
              {t.list.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="panel flex items-center gap-3 px-3 py-2.5">
                  <span className="t-num w-6 shrink-0 text-[0.85rem] text-low">{i + 1}</span>
                  <div className="flex gap-1">
                    {m.ids.map((id) => (
                      <Link key={id} to={`/champions/${id}`} data-tip={`champ:${id}`}>
                        <Portrait id={id} size={34} />
                      </Link>
                    ))}
                  </div>
                  <div>
                    <Rich as="div" text={m.name} className="text-[0.9rem] font-bold text-hi" />
                    {m.note && <Rich as="div" text={m.note} className="text-[0.76rem] text-low" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Callout tone="warn" text="**Watch out:** Polymorph and Stoneskin defenses counter both Mythicals." />
    </div>
  )
}

export function Dungeons() {
  const { tab } = useParams()
  if (!tab || !tabs.some((t) => t.key === tab)) return <Navigate to="/dungeons/spider" replace />
  const d = dungeons.find((x) => x.id === tab)

  return (
    <div>
      <PageHeader eyebrow="Section 4" title="Dungeons & Arena" intro={dungeonsIntro} />

      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel kicker="Gear" title="Farm order">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {farmOrder.map((f, i) => {
              const color = dungeonColor[f.id]
              const active = tab === f.id
              return (
                <Link
                  key={f.id}
                  to={`/dungeons/${f.id}`}
                  className={cn('relative block rounded-[3px] border px-3 py-2.5 transition-colors', active ? 'border-edge-2 bg-raised-3' : 'border-edge hover:border-edge-2')}
                  style={{ boxShadow: `inset 0 3px 0 ${color}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="t-num text-[1.3rem]" style={{ color }}>
                      {i + 1}
                    </span>
                    {i < farmOrder.length - 1 && <ArrowRight className="size-3.5 text-low" />}
                  </div>
                  <div className="mt-1 text-[0.86rem] font-bold text-hi">{f.name}</div>
                  <Rich as="div" text={f.reason} links={false} className="text-[0.72rem] text-low" />
                </Link>
              )
            })}
          </div>
        </Panel>
        <Panel
          kicker="HellHades"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              Early stat targets by role <LabelTag label="Sourced" />
            </span>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            {statTargets.roles.map((r) => (
              <div key={r.role} className="well px-3 py-2.5">
                <div className="t-label mb-2 text-low">{r.role}</div>
                <div className="flex flex-wrap gap-1">
                  {r.stats.map((s) => (
                    <Rich key={s} text={s} className="text-[0.8rem] font-semibold text-hi" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[0.74rem] text-low">{statTargets.stage20}.</div>
        </Panel>
      </div>

      <TabBar items={tabs} active={tab} className="mb-10" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {d ? <DungeonView d={d} /> : <ArenaView />}
        </motion.div>
      </AnimatePresence>
      {d && <Callout tone="info" className="mt-10" text={hardModeNote} />}
      <div className="mt-6">
        <Rich as="p" text={statTargets.text} className="max-w-5xl text-[0.74rem] leading-relaxed text-low" />
      </div>
    </div>
  )
}
