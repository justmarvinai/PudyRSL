import { motion } from 'motion/react'
import { CircleCheck, CircleX, ExternalLink, Info } from 'lucide-react'
import { Link } from 'react-router'
import { Portrait } from '../champion/Portrait'
import { Segmented, Toggle, NumberField } from '../ui/Fields'
import { Panel } from '../ui/primitives'
import { ukTeam, type TuneSlot } from '../../data/clanBoss'
import { championById } from '../../data/champions'
import type { ChampionId } from '../../data/types'
import { cn } from '../../lib/cn'
import { difficultyColor, rarityColor } from '../../lib/rsl'
import { useStore } from '../../lib/store'
import { SpeedGauge, speedMessage, speedStatus } from './SpeedGauge'

interface Row {
  slot: TuneSlot
  id: ChampionId
  min: number
  max: number
  label: string
}

const DWJ_CALC = 'https://deadwoodjedi.com/speed-tunes/budget-maneater-unkillable-ninja/'

/** Checks true speeds and the stun-target HP/DEF rules of the Budget Maneater tune. */
export function TuneChecker() {
  const tune = useStore((s) => s.tune)
  const setTune = useStore((s) => s.setTune)
  const champs = useStore((s) => s.champs)
  const setChamp = useStore((s) => s.setChamp)

  const rows: Row[] = []
  for (const slot of ukTeam.slots) {
    if (slot.key === 'keydps' && tune.forceDay) continue
    if (slot.key === 'dps') {
      rows.push({ slot, id: 'rathalos', min: slot.min, max: slot.max, label: 'DPS' })
      if (tune.forceDay) rows.push({ slot, id: 'artak', min: slot.min, max: slot.max, label: 'DPS (Force day)' })
      continue
    }
    const max = slot.key === 'stun' && tune.difficulty === 'nm' && slot.nmMax ? slot.nmMax : slot.max
    rows.push({ slot, id: slot.ids[0], min: slot.min, max, label: slot.slot })
  }

  const inRange = rows.filter((r) => speedStatus(champs[r.id]?.speed, r.min, r.max) === 'ok').length
  const filled = rows.filter((r) => champs[r.id]?.speed != null).length

  // Stun target rules: highest HP on the team but ≤125% of Pain Keeper's; DEF below everyone else.
  const team = rows.map((r) => r.id)
  const skull = champs.skullcrusher
  const pk = champs.painkeeper
  const others = team.filter((id) => id !== 'skullcrusher')
  const otherHp = others.map((id) => champs[id]?.hp).filter((v): v is number => v != null)
  const otherDef = others.map((id) => champs[id]?.def).filter((v): v is number => v != null)
  const hpHighest = skull?.hp != null && otherHp.length === others.length ? skull.hp > Math.max(...otherHp) : null
  const hpCap = skull?.hp != null && pk?.hp != null ? skull.hp <= pk.hp * 1.25 : null
  const defLowest = skull?.def != null && otherDef.length === others.length ? skull.def < Math.min(...otherDef) : null

  const Rule = ({ ok, text, hint }: { ok: boolean | null; text: string; hint: string }) => (
    <div
      className="well flex items-start gap-2.5 px-3 py-2.5"
      style={ok === null ? undefined : { boxShadow: `inset 3px 0 0 ${ok ? 'var(--color-ok)' : 'var(--color-bad)'}` }}
    >
      {ok === null ? <Info className="mt-0.5 size-4 shrink-0 text-low" /> : ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-bad" />}
      <div>
        <div className={cn('text-[0.82rem] font-semibold', ok === null ? 'text-mid' : ok ? 'text-ok' : 'text-bad')}>{text}</div>
        <div className="text-[0.72rem] text-low">{hint}</div>
      </div>
    </div>
  )

  return (
    <Panel
      id="tune-checker"
      className="scroll-mt-24"
      kicker="Tool"
      title="Speed tune checker"
      action={
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            size="sm"
            value={tune.difficulty}
            onChange={(v) => setTune({ difficulty: v })}
            options={[
              { value: 'brutal', label: 'Brutal', color: difficultyColor.brutal },
              { value: 'nm', label: 'NM', color: difficultyColor.nm },
              { value: 'unm', label: 'UNM', color: difficultyColor.unm },
            ]}
          />
          <Toggle checked={tune.forceDay} onChange={(v) => setTune({ forceDay: v })} label="Force-affinity day" />
        </div>
      }
    >
      <p className="mb-4 text-[0.82rem] text-low">
        Enter each champion&apos;s <span className="font-semibold text-hi">true speed</span> (and HP/DEF for the stun-target rules). Values are shared with each champion&apos;s tracker.
        {tune.forceDay && ' Force days: Ninja is out; Rathalos + Artak both run at 175–178.'}
      </p>

      <div className="hidden grid-cols-[minmax(170px,1.1fr)_110px_minmax(180px,1.4fr)_90px_90px] gap-3 px-3 pb-2 md:grid">
        {['Slot', 'True SPD', 'Target window', 'HP', 'DEF'].map((h) => (
          <span key={h} className="t-label text-low">
            {h}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => {
          const v = champs[r.id]?.speed
          const st = speedStatus(v, r.min, r.max)
          const c = championById[r.id]
          return (
            <motion.div
              key={`${r.id}-${r.label}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="well grid grid-cols-1 items-center gap-3 px-3 py-3 md:grid-cols-[minmax(170px,1.1fr)_110px_minmax(180px,1.4fr)_90px_90px]"
              style={st === 'empty' ? undefined : { boxShadow: `inset 3px 0 0 ${st === 'ok' ? 'var(--color-ok)' : 'var(--color-bad)'}` }}
            >
              <div className="flex items-center gap-3">
                <Link to={`/champions/${r.id}`} data-tip={`champ:${r.id}`}>
                  <Portrait id={r.id} size={36} />
                </Link>
                <div className="min-w-0">
                  <div className="t-label text-low">{r.label}</div>
                  <div className="text-[0.86rem] font-bold" style={{ color: rarityColor[c.rarity] }}>
                    {r.slot.key === 'dps' ? (r.id === 'artak' ? 'Artak' : 'Rathalos') : r.slot.champ}
                  </div>
                  <div className="text-[0.72rem] text-low">
                    target <span className="font-bold text-hi tabular-nums">{r.slot.speed}</span>
                    {r.slot.key === 'stun' && tune.difficulty === 'nm' && <span> · checking up to 121</span>}
                  </div>
                </div>
              </div>
              <NumberField value={v ?? null} onChange={(val) => setChamp(r.id, { speed: val })} placeholder="Speed" min={0} max={400} />
              <div>
                <SpeedGauge value={v} min={r.min} max={r.max} />
                <div className={cn('mt-1 text-[0.7rem] font-bold', st === 'ok' ? 'text-ok' : st === 'empty' ? 'text-low' : 'text-bad')}>{speedMessage(v, r.min, r.max)}</div>
              </div>
              <NumberField value={champs[r.id]?.hp ?? null} onChange={(val) => setChamp(r.id, { hp: val })} placeholder="HP" min={0} />
              <NumberField value={champs[r.id]?.def ?? null} onChange={(val) => setChamp(r.id, { def: val })} placeholder="DEF" min={0} />
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-4">
        <div className="well flex items-center gap-3 px-4 py-3">
          <div className={cn('t-num text-[1.9rem]', inRange === rows.length ? 'text-ok' : 'text-hi')}>
            {inRange}/{rows.length}
          </div>
          <div className="text-[0.75rem] leading-tight text-mid">
            speeds in range
            <div className="text-low">{filled < rows.length ? `${rows.length - filled} still empty` : 'all entered'}</div>
          </div>
        </div>
        <Rule ok={hpHighest} text="Stun target has the highest HP" hint="Enter HP for all five to check." />
        <Rule ok={hpCap} text="…but ≤125% of Pain Keeper's HP" hint="Needs Skullcrusher and Pain Keeper HP." />
        <Rule ok={defLowest} text="DEF well below everyone else" hint="DWJ example: ~1k DEF vs 2k+ on the rest." />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-low">
        <span>Check every build in the DeadwoodJedi calculator before switching on Brutal.</span>
        <a href={DWJ_CALC} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-bold text-hi underline decoration-edge-2 underline-offset-4 hover:decoration-paper">
          DWJ Ninja-variant tune <ExternalLink className="size-3.5" />
        </a>
        <span>One report says Maneater needs 256 instead of 240.</span>
      </div>
    </Panel>
  )
}
