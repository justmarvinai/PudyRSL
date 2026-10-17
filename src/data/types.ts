// Shared types for the guide data. All text in src/data is transcribed from
// rsl_data.md. Strings may contain the guide's inline markdown: **bold** and
// [label](url). Render them with <Rich />.

export type Rarity = 'Mythical' | 'Legendary' | 'Epic' | 'Rare'
export type Affinity = 'Magic' | 'Spirit' | 'Force' | 'Void'

export type ChampionId =
  | 'gizmak'
  | 'galleus'
  | 'ninja'
  | 'maneater'
  | 'painkeeper'
  | 'deacon'
  | 'rathalos'
  | 'artak'
  | 'skullcrusher'
  | 'kymar'
  | 'udk'
  | 'seer'
  | 'ruella'

export type ContentKey = 'demonLord' | 'chimera' | 'hydra' | 'spider' | 'dragon' | 'fk' | 'ig' | 'arena'

export interface SourceRef {
  label: string
  url: string
}

/** A team slot. `text` is the cell exactly as written in the guide. */
export interface TeamSlot {
  slot: string
  text: string
  ids: ChampionId[]
}
