// Recognises Raid terms in guide text so <Rich> can colour-code them.

import { champions } from '../data/champions'
import type { Affinity, ChampionId, Rarity } from '../data/types'
import { raidData } from './rsl'

export type Term =
  | { kind: 'champ'; id: ChampionId }
  | { kind: 'raid'; name: string }
  | { kind: 'effect'; type: 'buff' | 'debuff'; icon?: string; name: string }
  | { kind: 'stat' }
  | { kind: 'skill' }
  | { kind: 'affinity'; affinity: Affinity }
  | { kind: 'rarity'; rarity: Rarity }
  | { kind: 'difficulty'; key: string }
  | { kind: 'content'; color: string }
  | { kind: 'set' }
  | { kind: 'mastery' }
  | { kind: 'resource'; res: 'gems' | 'silver' }

const terms = new Map<string, Term>()
const add = (words: string[], term: Term) => words.forEach((w) => terms.set(w, term))

// Core champions, by full name, short name and the guide's abbreviations.
for (const c of champions) add([c.name, c.short], { kind: 'champ', id: c.id })
add(['PK'], { kind: 'champ', id: 'painkeeper' })
add(['UDK'], { kind: 'champ', id: 'udk' })

// Other champions the bundled raid-data knows (guide spelling and full name).
for (const [guideName, c] of Object.entries(raidData.champions)) {
  if (champions.some((x) => x.name === guideName)) continue
  add(guideName === c.name ? [guideName] : [guideName, c.name], { kind: 'raid', name: guideName })
}

// Buffs and debuffs (game icons where raid-data has them).
for (const [name, icon] of Object.entries(raidData.icons)) add([name], { kind: 'effect', type: icon.kind, icon: icon.src, name })
const effect = (name: string, type: 'buff' | 'debuff') => ({ kind: 'effect' as const, type, icon: raidData.icons[name]?.src, name })
add(['shield', 'shields', 'Shields'], effect('Shield', 'buff'))
add(['Provokes'], effect('Provoke', 'debuff'))
add(['Counterattacks'], effect('Counterattack', 'buff'))
add(['Reflect', 'reflect'], { kind: 'effect', type: 'buff', name: 'Reflect Damage' })
add(['burn', 'burns', 'burned'], { kind: 'effect', type: 'debuff', name: 'HP Burn' })
add(['Taunt', 'Stoneskin', 'Increase C.RATE'], { kind: 'effect', type: 'buff', name: 'Buff' })
add(['Polymorph', 'Necrosis', 'Leech', 'Heal Reduction', 'Poison Cloud'], { kind: 'effect', type: 'debuff', name: 'Debuff' })

add(['SPD', 'ACC', 'RES', 'RESIST', 'C.RATE', 'C.DMG', 'HP', 'DEF', 'ATK', 'HP%', 'DEF%', 'ATK%'], { kind: 'stat' })
add(['A1', 'A2', 'A3'], { kind: 'skill' })

add(['Magic'], { kind: 'affinity', affinity: 'Magic' })
add(['Force'], { kind: 'affinity', affinity: 'Force' })
add(['Spirit'], { kind: 'affinity', affinity: 'Spirit' })
add(['Void'], { kind: 'affinity', affinity: 'Void' })

add(['Mythical', 'Mythicals', 'Mythic'], { kind: 'rarity', rarity: 'Mythical' })
add(['Legendary', 'Legendaries'], { kind: 'rarity', rarity: 'Legendary' })
add(['Epic', 'Epics'], { kind: 'rarity', rarity: 'Epic' })
add(['Rare', 'Rares'], { kind: 'rarity', rarity: 'Rare' })

add(['Ultra-Nightmare', 'UNM'], { kind: 'difficulty', key: 'unm' })
add(['Nightmare', 'NM'], { kind: 'difficulty', key: 'nm' })
add(['Brutal'], { kind: 'difficulty', key: 'brutal' })
add(['Hard'], { kind: 'difficulty', key: 'hard' })
add(['Normal'], { kind: 'difficulty', key: 'normal' })
add(['Easy'], { kind: 'difficulty', key: 'easy' })

const content = (color: string) => ({ kind: 'content' as const, color })
add(['Demon Lord', 'Clan Boss', 'CB'], content('var(--color-cb)'))
add(['Hydra'], content('var(--color-hydra)'))
add(['Chimera'], content('var(--color-chimera)'))
add(["Spider's Den", 'Spider'], content('var(--color-spider)'))
add(["Dragon's Lair", 'Dragon'], content('var(--color-dragon)'))
add(["Fire Knight's Castle", 'Fire Knight', 'FK'], content('var(--color-fk)'))
add(["Ice Golem's Peak", 'Ice Golem', 'IG'], content('var(--color-ig)'))
add(['Classic Arena', 'Tag Team Arena', 'Arena'], content('var(--color-arena)'))
add(['Minotaur'], content('var(--color-mino)'))
add(['Faction Wars', 'Doom Tower', 'Cursed City', 'Iron Twins', 'Potion Keeps', 'Sand Devil'], content('var(--color-hi)'))

add(
  [
    'Lifesteal',
    'Perception',
    'Relentless',
    'Reflex',
    'Savage',
    'Regeneration',
    'Lethal',
    'Merciless',
    'Cruel',
    'Immortal',
    'Speed set',
    'Speed sets',
    'Speed/Perception',
    'Speed/Accuracy/Perception',
    'Speed/Accuracy/Lifesteal',
    'Speed, Accuracy and Lifesteal',
  ],
  { kind: 'set' },
)

add(
  [
    'Warmaster',
    'Giant Slayer',
    'Lifedrinker',
    'Grim Resolve',
    'Heart of Glory',
    'Retribution',
    'Lore of Steel',
    'Deadly Precision',
    'Keen Strike',
    'Shield Breaker',
    'Single Out',
    'Bring it Down',
    'Methodical',
    'Steadfast',
    'Exalt in Death',
    'Rapid Response',
    'Arcane Celerity',
    'Cycle of Magic',
    'Master Hexer',
    'Lasting Gifts',
    'Kill Streak',
    'Pinpoint Accuracy',
    'Evil Eye',
  ],
  { kind: 'mastery' },
)

add(['gems', 'Gems'], { kind: 'resource', res: 'gems' })
add(['silver', 'Silver'], { kind: 'resource', res: 'silver' })

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const alternation = [...terms.keys()].sort((a, b) => b.length - a.length).map(escape).join('|')

/** Matches any known term on word boundaries (longest first). */
export const TERM_RE = new RegExp(`(?<![A-Za-z0-9])(?:${alternation})(?![A-Za-z0-9])`, 'g')

export const termFor = (text: string): Term | undefined => terms.get(text)
