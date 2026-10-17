import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { championById } from '../../data/champions'
import type { Affinity, ChampionId } from '../../data/types'
import { cn } from '../../lib/cn'
import { affinityColor, affinityFromRaid, affinityIcon, raidChampion, raidForCore, rarityColor, rarityFromRaid } from '../../lib/rsl'
import { useStore } from '../../lib/store'

export type AffinitySource = 'guide' | 'yours' | 'raid-data'

/** Affinity: the guide's, else the one you recorded, else raid-data's (2021). */
export function useAffinity(id: ChampionId): { affinity: Affinity | null; source: AffinitySource | null } {
  const mine = useStore((s) => s.champs[id]?.affinity ?? null)
  const guide = championById[id].affinity
  if (guide) return { affinity: guide, source: 'guide' }
  if (mine) return { affinity: mine, source: 'yours' }
  const raid = raidForCore(id)
  const fromRaid = raid ? affinityFromRaid(raid.affinity) : null
  return fromRaid ? { affinity: fromRaid, source: 'raid-data' } : { affinity: null, source: null }
}

function Frame({
  art,
  monogram,
  color,
  width,
  fluid = false,
  affinity,
  className,
  title,
}: {
  art: string | null
  monogram: string
  color: string
  width: number
  /** Fill the parent's width (3:4-ish card) instead of a fixed size. */
  fluid?: boolean
  affinity?: Affinity | null
  className?: string
  title?: string
}) {
  const small = !fluid && width < 40
  const box: CSSProperties = fluid ? { width: '100%', aspectRatio: '10 / 13' } : { width, height: Math.round(width * 1.3) }
  return (
    <span
      title={title}
      className={cn('relative inline-block shrink-0 overflow-hidden rounded-[3px] bg-raised-3 align-middle', className)}
      style={{ ...box, containerType: 'inline-size', boxShadow: `inset 0 -${small ? 2 : 3}px 0 ${color}` }}
    >
      {art ? (
        <img src={art} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span
          className="absolute inset-0 grid place-items-center"
          style={{ background: `repeating-linear-gradient(135deg, transparent 0 6px, rgb(255 255 255 / 0.035) 6px 7px)` }}
        >
          <span className="t-display" style={{ color, fontSize: small ? '42cqw' : '34cqw' }}>
            {monogram}
          </span>
        </span>
      )}
      {art && <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />}
      {affinity && !small && (
        <img
          src={affinityIcon[affinity]}
          alt={affinity}
          className="absolute top-[6%] right-[6%] drop-shadow-[0_1px_1px_rgb(0_0_0/0.9)]"
          style={{ height: 'max(10px, 16cqw)' }}
        />
      )}
    </span>
  )
}

/** Core champion portrait: raid-data art when available, else a monogram tile. */
export function Portrait({
  id,
  size = 48,
  fluid = false,
  className,
  showAffinity = true,
}: {
  id: ChampionId
  size?: number
  fluid?: boolean
  className?: string
  showAffinity?: boolean
}) {
  const c = championById[id]
  const raid = raidForCore(id)
  const { affinity } = useAffinity(id)
  return (
    <Frame
      art={raid?.portrait ?? null}
      monogram={c.monogram}
      color={rarityColor[c.rarity]}
      width={size}
      fluid={fluid}
      affinity={showAffinity ? affinity : null}
      className={className}
    />
  )
}

/** Portrait for any other champion raid-data knows, by guide name. */
export function RaidPortrait({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const rc = raidChampion(name)
  const rarity = rc ? rarityFromRaid(rc.rarity) : null
  const initials = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <Frame
      art={rc?.portrait ?? null}
      monogram={initials}
      color={rarity ? rarityColor[rarity] : 'var(--color-edge-2)'}
      width={size}
      affinity={rc ? affinityFromRaid(rc.affinity) : null}
      className={className}
    />
  )
}

/** Portrait + name, linking to the champion page. */
export function ChampChip({ id, className, size = 22 }: { id: ChampionId; className?: string; size?: number }) {
  const c = championById[id]
  return (
    <Link
      to={`/champions/${id}`}
      data-tip={`champ:${id}`}
      className={cn('inline-flex items-center gap-2 rounded-[3px] py-0.5 pr-2 text-[0.82rem] font-semibold text-hi transition-colors hover:bg-raised-3', className)}
    >
      <Portrait id={id} size={size} showAffinity={false} />
      <span style={{ color: rarityColor[c.rarity] }}>{c.short}</span>
    </Link>
  )
}

export function AffinityTag({ affinity, source }: { affinity: Affinity | null; source?: AffinitySource | null }) {
  if (!affinity)
    return (
      <span className="tag" title="The guide says: check in-game">
        Affinity ?
      </span>
    )
  return (
    <span
      className="tag"
      style={{ '--c': affinityColor[affinity] } as CSSProperties}
      title={source === 'guide' ? 'Confirmed in the guide' : source === 'yours' ? 'Recorded by you' : 'From raid-data (2021) — confirm in-game'}
    >
      <img src={affinityIcon[affinity]} alt="" className="h-2.5" />
      {affinity}
      {source === 'raid-data' && <span className="opacity-60">· data</span>}
      {source === 'yours' && <span className="opacity-60">· you</span>}
    </span>
  )
}

export function RarityTag({ rarity }: { rarity: keyof typeof rarityColor }) {
  return (
    <span className="tag" style={{ '--c': rarityColor[rarity] } as CSSProperties}>
      {rarity}
    </span>
  )
}
