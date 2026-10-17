// Raid: Shadow Legends vocabulary: semantic colours for the UI and the
// bundled raid-data subset (portraits, icons, skills, factions).

import raw from '../data/raid-data.json'
import { champions } from '../data/champions'
import type { Affinity, ChampionId, ContentKey, Rarity } from '../data/types'

export interface RaidSkill {
  slot: string
  name: string
  description: string
  cooldown: number | null
  minCooldown: number | null
  passive: boolean
  books: string[]
}

export interface RaidChampion {
  name: string
  rarity: string
  affinity: string
  faction: string
  role: string
  aura: string | null
  portrait: string | null
  gameVersion?: string
  auraText?: string | null
  stats?: Record<string, number>
  skills?: RaidSkill[]
}

interface RaidData {
  source: { name: string; version: string; license: string; url: string; credits: string }
  champions: Record<string, RaidChampion>
  icons: Record<string, { src: string; kind: 'buff' | 'debuff' }>
}

export const raidData = raw as RaidData

export const raidSource = raidData.source

/** raid-data entry for a guide name ("Maneater", "Graal", …). */
export const raidChampion = (guideName: string): RaidChampion | undefined => raidData.champions[guideName]

const coreByName = Object.fromEntries(champions.map((c) => [c.name, c.id])) as Record<string, ChampionId>

/** raid-data entry for a core champion id, when the 2021 snapshot has it. */
export function raidForCore(id: ChampionId): RaidChampion | undefined {
  const c = champions.find((x) => x.id === id)
  return c ? raidData.champions[c.name] : undefined
}

export const isCoreName = (name: string) => name in coreByName

/** raid-data role key ("hp", "attack", …) as shown in the game. */
export const roleLabel = (role: string) => (role === 'hp' ? 'HP' : role.charAt(0).toUpperCase() + role.slice(1))

// ---------- colours (CSS custom properties defined in index.css) ----------

export const rarityColor: Record<Rarity, string> = {
  Mythical: 'var(--color-mythical)',
  Legendary: 'var(--color-legendary)',
  Epic: 'var(--color-epic)',
  Rare: 'var(--color-rare)',
}

export const rarityFromRaid = (r: string): Rarity | null =>
  ({ mythical: 'Mythical', legendary: 'Legendary', epic: 'Epic', rare: 'Rare' })[r.toLowerCase()] as Rarity | null

export const affinityColor: Record<Affinity, string> = {
  Magic: 'var(--color-magic)',
  Force: 'var(--color-force)',
  Spirit: 'var(--color-spirit)',
  Void: 'var(--color-void)',
}

export const affinityIcon: Record<Affinity, string> = {
  Magic: '/rsl/icons/affinity-magic.png',
  Force: '/rsl/icons/affinity-force.png',
  Spirit: '/rsl/icons/affinity-spirit.png',
  Void: '/rsl/icons/affinity-void.png',
}

export const affinityFromRaid = (a: string): Affinity | null =>
  ({ magic: 'Magic', force: 'Force', spirit: 'Spirit', void: 'Void' })[a.toLowerCase()] as Affinity | null

export const contentColor: Record<ContentKey, string> = {
  demonLord: 'var(--color-cb)',
  chimera: 'var(--color-chimera)',
  hydra: 'var(--color-hydra)',
  spider: 'var(--color-spider)',
  dragon: 'var(--color-dragon)',
  fk: 'var(--color-fk)',
  ig: 'var(--color-ig)',
  arena: 'var(--color-arena)',
}

export const dungeonColor: Record<string, string> = {
  spider: 'var(--color-spider)',
  dragon: 'var(--color-dragon)',
  'fire-knight': 'var(--color-fk)',
  'ice-golem': 'var(--color-ig)',
  arena: 'var(--color-arena)',
}

export const difficultyColor: Record<string, string> = {
  easy: 'var(--color-easy)',
  normal: 'var(--color-normal)',
  hard: 'var(--color-hard)',
  brutal: 'var(--color-brutal)',
  nm: 'var(--color-nm)',
  unm: 'var(--color-unm)',
}

export const tomeIcon = {
  legendary: '/rsl/icons/tome-legendary.webp',
  epic: '/rsl/icons/tome-epic.webp',
  rare: '/rsl/icons/tome-rare.webp',
}

export const resourceIcon = {
  gems: '/rsl/icons/gems.webp',
  silver: '/rsl/icons/silver.webp',
}

export const DEMON_LORD_ART = '/rsl/demon-lord.webp'
