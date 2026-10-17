import type { ContentKey } from './types'

// Header of rsl_data.md.
export const guideMeta = {
  title: 'RAID Starter Account Progression Guide',
  date: 'Oct 17, 2026',
  dateISO: '2026-10-17',
  author: '@Marvin',
  summary:
    'Build 8 champions to Rank 6 on Day 1 (Gizmak, Galleus, Maneater, Pain Keeper, Deacon Armstrong, Ninja, Artak, Rathalos), then 5 more over the next weeks. These 13 cover every content area you listed. Your real bottlenecks are Speed gear, ascension potions and masteries, not XP or energy.',
  bottlenecks: ['Speed gear', 'Ascension potions', 'Masteries'],
  notBottlenecks: ['XP', 'Energy'],
}

// Section 1 label definitions.
export const labelLegend = {
  intro:
    'Thirteen champions carry everything you listed. Eight are buildable on Day 1 (Wave 1); five follow in weeks 2–6 (Wave 2). That is also the most Rank 6s your chicken stock can produce.',
  sourced: 'a cited fact or a published team/speed tune.',
  myCall: 'my recommendation, built from cited ratings and kits.',
  ratings: "Ratings (HellHades 1–10, Ayumilove 1–5★) are those sites' opinions.",
  table: [
    { sym: '✓', text: 'core slot' },
    { sym: '(✓)', text: 'flex/swap slot' },
    { sym: 'UK', text: 'the Budget Maneater Unkillable Clan Boss team' },
    { sym: 'K2', text: 'fills Hydra keys 2–3' },
  ],
}

// Account stock as stated across the guide. The 4★ chicken count is the
// guide's "79 × 4★ chickens left after Skullcrusher's 4" (79 + 4).
export const accountSnapshot = {
  energy: 104_890,
  gems: 7_600,
  silver: 63_000_000,
  brews: 2_351,
  brewXp: '29.4M–44.1M XP',
  cbKeys: 133,
  tomes: { legendary: 13, epic: 120, rare: 26, mythic: 0 },
  feasts: 3,
  chickens5: 16,
  chickens4: 83,
  chickens3: 68,
}

export interface ContentArea {
  key: ContentKey
  label: string
  long: string
}

// Column order of the 13-champion table.
export const contentAreas: ContentArea[] = [
  { key: 'demonLord', label: 'Demon Lord', long: 'Demon Lord (Clan Boss)' },
  { key: 'chimera', label: 'Chimera', long: 'Chimera' },
  { key: 'hydra', label: 'Hydra', long: 'Hydra' },
  { key: 'spider', label: 'Spider', long: "Spider's Den" },
  { key: 'dragon', label: 'Dragon', long: "Dragon's Lair" },
  { key: 'fk', label: 'FK', long: "Fire Knight's Castle" },
  { key: 'ig', label: 'IG', long: "Ice Golem's Peak" },
  { key: 'arena', label: 'Arena', long: 'Arena' },
]

// Priorities from the section headings (#1 Clan Boss ... #6 Arena).
export const contentPriorities = [
  { rank: 1, name: 'Clan Boss', detail: 'Demon Lord, Hydra, Chimera', to: '/clan-boss' },
  { rank: 2, name: "Spider's Den", detail: 'Accessories, silver', to: '/dungeons/spider' },
  { rank: 3, name: "Dragon's Lair", detail: 'Speed, Accuracy, Lifesteal', to: '/dungeons/dragon' },
  { rank: 4, name: "Fire Knight's Castle", detail: 'Savage, Regeneration', to: '/dungeons/fire-knight' },
  { rank: 5, name: "Ice Golem's Peak", detail: 'Quests, Reflex', to: '/dungeons/ice-golem' },
  { rank: 6, name: 'Arena', detail: 'Great Hall medals', to: '/dungeons/arena' },
]
