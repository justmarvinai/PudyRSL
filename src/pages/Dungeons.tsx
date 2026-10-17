import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Bug, Castle, Flame, Mountain, Snowflake, Swords, Target, Trophy } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { Sigil } from '../components/champion/Sigil'
import { TeamLineup } from '../components/champion/TeamLineup'
import { PageHeader } from '../components/layout/PageHeader'
import { Segmented } from '../components/ui/Fields'
import { LabelTag, Rich } from '../components/ui/Rich'
import { TabBar } from '../components/ui/Tabs'
import { Callout, Card, Pill, SectionTitle } from '../components/ui/primitives'
import { arena, dungeons, dungeonsIntro, farmOrder, hardModeNote, iceGolemThresholds, statTargets, type Dungeon } from '../data/dungeons'
import type { Affinity } from '../data/types'
import { cn } from '../lib/cn'
import { stageOf } from '../lib/derived'
import { useStore } from '../lib/store'

const icons = { spider: Bug, dragon: Flame, 'fire-knight': Castle, 'ice-golem': Snowflake }

const tabs = [
  ...dungeons.map((d) => {
    const Icon = icons[d.id]
    return { key: d.id, label: d.short, icon: <Icon className="size-4" />, to: `/dungeons/${d.id}`, badge: <span className="text-[0.62rem] text-fg-subtle">#{d.priority}</span> }
  }),
  { key: 'arena', label: 'Arena', icon: <Trophy className="size-4" />, to: '/dungeons/arena', badge: <span className="text-[0.62rem] text-fg-subtle">#6</span> },
]

const affinityTone: Record<Affinity, 'magic' | 'force' | 'spirit' | 'void'> = { Magic: 'magic', Force: 'force', Spirit: 'spirit', Void: 'void' }

function StageTracker({ d }: { d: Dungeon }) {
  const nums = useStore((s) => s.nums)
  const setNum = useStore((s) => s.setNum)
  const stage = stageOf(nums, d.stageKey)
  const set = (v: number) => setNum(`stage.${d.stageKey}`, Math.max(0, Math.min(25, v)))
  const next = d.milestones.find((m) => m.stage > stage)
  return (
    <Card>
      <SectionTitle
        eyebrow="Your progress"
        title="Highest stage cleared"
        action={
          <div className="flex items-center gap-2">
            <button type="button" className="btn size-8 p-0" onClick={() => set(stage - 1)} aria-label="Lower stage">
              −
            </button>
            <motion.div key={stage} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-12 text-center font-display text-2xl font-bold text-gold-300 tabular-nums">
              {stage || '–'}
            </motion.div>
            <button type="button" className="btn size-8 p-0" onClick={() => set(stage + 1)} aria-label="Raise stage">
              +
            </button>
          </div>
        }
      />
      <input
        type="range"
        min={0}
        max={25}
        value={stage}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full cursor-pointer accent-[#e8a83a]"
        aria-label={`${d.short} stage`}
      />
      <div className="relative mt-1 h-10">
        {d.milestones.map((m) => (
          <div key={m.label} className="absolute -translate-x-1/2 text-center" style={{ left: `${(m.stage / 25) * 100}%` }}>
            <div className={cn('mx-auto h-2 w-px', stage >= m.stage ? 'bg-gold-400' : 'bg-white/20')} />
            <div className={cn('mt-1 text-[0.68rem] font-bold tabular-nums', stage >= m.stage ? 'text-gold-300' : 'text-fg-subtle')}>{m.stage}</div>
          </div>
        ))}
      </div>
      <ul className="mt-1 space-y-1.5 text-[0.78rem]">
        {d.milestones.map((m) => (
          <li key={m.label} className={cn('flex items-center gap-2', stage >= m.stage ? 'text-ok' : 'text-fg-muted')}>
            <Target className="size-3.5 shrink-0" />
            {m.label}
          </li>
        ))}
      </ul>
      {next && <div className="mt-3 text-[0.75rem] text-fg-subtle">Next milestone: stage {next.stage} ({next.stage - stage} to go).</div>}
    </Card>
  )
}

function DungeonView({ d }: { d: Dungeon }) {
  const teamWave = useStore((s) => s.ui.teamWave)
  const setUi = useStore((s) => s.setUi)
  const wave = d.hasWave1 ? teamWave : 2
  const isIG = d.id === 'ice-golem'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionTitle eyebrow={`Priority #${d.priority}`} title="Mechanics" label="Sourced" />
          <Rich as="p" text={`${d.mechanics.charAt(0).toUpperCase()}${d.mechanics.slice(1)}`} className="text-[0.88rem] leading-relaxed text-fg-muted" />
          <div className="mt-4 flex flex-wrap gap-2">
            {d.stages.map((s) => (
              <div key={s.stage} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                <span className="text-[0.75rem] font-semibold text-fg">Stage {s.stage}</span>
                <Pill tone={affinityTone[s.affinity]}>{s.affinity}</Pill>
                {s.note && <span className="text-[0.72rem] text-fg-subtle">{s.note}</span>}
              </div>
            ))}
          </div>
          {isIG && (
            <div className="mt-5">
              <div className="eyebrow mb-2">Kill the minions before each threshold</div>
              <div className="relative h-8 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-bad/50 via-warn/40 to-ok/50">
                {iceGolemThresholds.map((t) => (
                  <div key={t} className="absolute inset-y-0 w-px bg-ink-950" style={{ left: `${t}%` }}>
                    <span className="absolute top-1/2 left-1 -translate-y-1/2 text-[0.68rem] font-bold text-ink-950">{t}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[0.65rem] text-fg-subtle">
                <span>0% HP</span>
                <span>100% HP</span>
              </div>
            </div>
          )}
        </Card>
        <StageTracker d={d} />
      </div>

      <Card>
        <SectionTitle
          eyebrow="Team"
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
              <Pill tone="neutral">Wave 2 only</Pill>
            )
          }
        />
        <AnimatePresence mode="wait">
          <motion.div key={wave} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
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
        {d.hasWave1 && wave === 2 && <p className="mt-3 text-[0.72rem] text-fg-subtle">Highlighted slots are the Wave-2 upgrades.</p>}
        <Rich as="p" text={d.after} className="mt-4 text-[0.84rem] leading-relaxed text-fg-muted" />
      </Card>
    </div>
  )
}

function ArenaView() {
  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle eyebrow="Priority #6" title="Arena" />
        <ul className="space-y-3">
          {arena.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[0.86rem] leading-relaxed text-fg-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500" />
              <Rich text={b} />
            </li>
          ))}
        </ul>
      </Card>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[
          { title: 'Week-1 offense', label: 'My call', list: arena.week1 },
          { title: 'Wave-2 offense', label: undefined, list: arena.wave2 },
        ].map((t) => (
          <Card key={t.title}>
            <SectionTitle eyebrow="Offense" title={t.title} label={t.label} />
            <div className="space-y-2">
              {t.list.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex -space-x-2">
                    {m.ids.map((id) => (
                      <Sigil key={id} id={id} size={36} />
                    ))}
                  </div>
                  <div>
                    <div className="text-[0.86rem] font-semibold text-fg">{m.name}</div>
                    {m.note && <div className="text-[0.75rem] text-fg-subtle">{m.note}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
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

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card padded={false} className="p-4">
          <div className="eyebrow mb-3 flex items-center gap-2">
            <Swords className="size-3.5" /> Farm order
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {farmOrder.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="size-4 text-gold-600" />}
                <Link
                  to={`/dungeons/${f.id}`}
                  className={cn(
                    'inline-flex flex-col rounded-xl border px-3 py-1.5 transition hover:border-gold-400/40',
                    tab === f.id ? 'border-gold-400/40 bg-gold-400/[0.08]' : 'border-white/[0.08] bg-white/[0.03]',
                  )}
                >
                  <span className="text-[0.82rem] font-semibold text-fg">
                    {i + 1}. {f.name}
                  </span>
                  <span className="text-[0.68rem] text-fg-subtle">{f.reason}</span>
                </Link>
              </div>
            ))}
          </div>
        </Card>
        <Card padded={false} className="p-4">
          <div className="eyebrow mb-3 flex items-center gap-2">
            <Mountain className="size-3.5" /> Early stat targets by role <LabelTag label="Sourced" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {statTargets.roles.map((r) => (
              <div key={r.role} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                <div className="text-[0.72rem] font-semibold text-gold-300">{r.role}</div>
                {r.stats.map((s) => (
                  <div key={s} className="text-[0.75rem] text-fg-muted tabular-nums">
                    {s}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 text-[0.7rem] text-fg-subtle">{statTargets.stage20}.</div>
        </Card>
      </div>

      <TabBar items={tabs} active={tab} className="mb-6" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {d ? <DungeonView d={d} /> : <ArenaView />}
        </motion.div>
      </AnimatePresence>
      {d && <Callout tone="info" className="mt-5" text={hardModeNote} />}
      <div className="mt-5">
        <Rich as="p" text={statTargets.text} className="text-[0.72rem] leading-relaxed text-fg-subtle" />
      </div>
    </div>
  )
}
