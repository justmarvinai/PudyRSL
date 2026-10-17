import {
  Crown,
  Eye,
  Flame,
  Gauge,
  Hammer,
  Hourglass,
  RotateCcw,
  Shield,
  ShieldPlus,
  Skull,
  Sword,
  Swords,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router'
import { championById } from '../../data/champions'
import type { Affinity, ChampionId, Rarity } from '../../data/types'
import { cn } from '../../lib/cn'
import { useStore } from '../../lib/store'

export const rarityColor: Record<Rarity, { from: string; to: string; text: string; tone: 'mythical' | 'legendary' | 'epic' | 'rare' }> = {
  Mythical: { from: '#ff8fa5', to: '#d61f4a', text: 'text-mythical', tone: 'mythical' },
  Legendary: { from: '#ffe08a', to: '#e08a12', text: 'text-legendary', tone: 'legendary' },
  Epic: { from: '#dcbcff', to: '#8b45f0', text: 'text-epic', tone: 'epic' },
  Rare: { from: '#a8ccff', to: '#2f6fe0', text: 'text-rare', tone: 'rare' },
}

export const affinityTone: Record<Affinity, 'magic' | 'force' | 'spirit' | 'void'> = {
  Magic: 'magic',
  Force: 'force',
  Spirit: 'spirit',
  Void: 'void',
}

// Glyphs echo each champion's role in the guide (burns, cooldowns, speed…).
const glyph: Record<ChampionId, LucideIcon> = {
  gizmak: Crown,
  galleus: Shield,
  ninja: Swords,
  maneater: Skull,
  painkeeper: Hourglass,
  deacon: Gauge,
  rathalos: Sword,
  artak: Flame,
  skullcrusher: Hammer,
  kymar: RotateCcw,
  udk: ShieldPlus,
  seer: Eye,
  ruella: Zap,
}

/** Hexagonal champion emblem — no external art, rarity-coloured frame. */
export function Sigil({ id, size = 48, className, glow = false }: { id: ChampionId; size?: number; className?: string; glow?: boolean }) {
  const c = championById[id]
  const uid = 'sg' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const col = rarityColor[c.rarity]
  const Icon = glyph[id]
  return (
    <div
      className={cn('relative shrink-0 select-none', className)}
      style={{ width: size, height: size, filter: glow ? `drop-shadow(0 0 10px ${col.to}66)` : undefined }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0">
        <defs>
          <linearGradient id={`${uid}-f`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={col.from} />
            <stop offset="1" stopColor={col.to} />
          </linearGradient>
          <radialGradient id={`${uid}-b`} cx="0.5" cy="0.32" r="0.75">
            <stop offset="0" stopColor={col.to} stopOpacity="0.38" />
            <stop offset="0.6" stopColor="#0b0e15" stopOpacity="0.95" />
            <stop offset="1" stopColor="#06070b" />
          </radialGradient>
        </defs>
        <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill={`url(#${uid}-b)`} stroke={`url(#${uid}-f)`} strokeWidth="5" strokeLinejoin="round" />
        <polygon points="50,13 84,32 84,68 50,87 16,68 16,32" fill="none" stroke={col.from} strokeOpacity="0.18" strokeWidth="1.5" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display leading-none font-bold text-white" style={{ fontSize: size * 0.3, textShadow: `0 0 12px ${col.to}` }}>
          {c.monogram}
        </span>
        {size >= 40 && <Icon className="mt-[3%] opacity-80" style={{ width: size * 0.2, height: size * 0.2, color: col.from }} />}
      </div>
    </div>
  )
}

/** Sigil + name, linking to the champion page. */
export function ChampChip({ id, className, showRarity = false, size = 26 }: { id: ChampionId; className?: string; showRarity?: boolean; size?: number }) {
  const c = championById[id]
  return (
    <Link
      to={`/champions/${id}`}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] py-0.5 pr-2.5 pl-0.5 text-[0.8rem] font-medium text-fg transition hover:border-gold-400/40 hover:bg-gold-400/[0.06]',
        className,
      )}
    >
      <Sigil id={id} size={size} />
      <span className="whitespace-nowrap">{c.short}</span>
      {showRarity && <span className={cn('text-[0.65rem] font-semibold', rarityColor[c.rarity].text)}>{c.rarity}</span>}
    </Link>
  )
}

/** Affinity confirmed by the guide, else the one you recorded. */
export function useAffinity(id: ChampionId): { affinity: Affinity | null; fromGuide: boolean } {
  const mine = useStore((s) => s.champs[id]?.affinity ?? null)
  const guide = championById[id].affinity
  return guide ? { affinity: guide, fromGuide: true } : { affinity: mine, fromGuide: false }
}
