import type { ChampionId } from './types'

// Section 6 "Resource plans".

export const resourcesIntro =
  'XP and silver are plentiful; spend energy on Speed gear, potions and mastery scrolls, and put tomes only on cooldown levels.'

export const brews = {
  title: 'Brews are XP, not ascension material',
  label: 'Sourced',
  text: "Magic/Spirit/Force/Void brews are **XP Brews: 12,500 XP each, 18,750 if the affinity matches**. Ascension uses affinity + Arcane potions from the Potion Keeps ([GamingNoble](https://gamingnoble.com/raid-shadow-legends-xp-brews/), [Plarium Tavern](https://raid-support.plarium.com/hc/en-us/articles/360014648380-The-Tavern)). Your 2,351 brews are worth **29.4M–44.1M XP**; patch 10.80's Brew Upgrade screen levels several champions at once.",
  xp: 12_500,
  xpMatched: 18_750,
  table: [
    {
      champs: 'Galleus',
      ids: ['galleus'] as ChampionId[],
      affinity: 'Force',
      affinityLink: 'https://ayumilove.net/raid-shadow-legends-galleus-bloodcrest-skill-mastery-equip-guide/',
      matched: '108',
      mismatched: '161',
    },
    {
      champs: 'Gizmak',
      ids: ['gizmak'] as ChampionId[],
      affinity: 'Magic',
      affinityLink: 'https://ayumilove.net/raid-shadow-legends-gizmak-the-terrible-skill-mastery-equip-guide/',
      matched: '0 (Barrel)',
      mismatched: '0',
    },
    { champs: 'Prince Kymar', ids: ['kymar'] as ChampionId[], affinity: 'Magic', matched: '160', mismatched: '239' },
    {
      champs: 'Maneater, Deacon',
      ids: ['maneater', 'deacon'] as ChampionId[],
      affinity: 'check in-game',
      matched: '132 each',
      mismatched: '197 each',
    },
    { champs: 'Pain Keeper', ids: ['painkeeper'] as ChampionId[], affinity: 'check in-game', matched: '119', mismatched: '178' },
    {
      champs: 'Ninja, Artak, Rathalos',
      ids: ['ninja', 'artak', 'rathalos'] as ChampionId[],
      affinity: 'check in-game',
      matched: '160 each',
      mismatched: '239 each',
    },
    {
      champs: 'Skullcrusher (to 5★ L50; +108 later for R6)',
      ids: ['skullcrusher'] as ChampionId[],
      affinity: 'check in-game',
      matched: '76',
      mismatched: '114',
    },
    { champs: 'Ultimate Deathknight', ids: ['udk'] as ChampionId[], affinity: 'check in-game', matched: '160', mismatched: '239' },
    {
      champs: 'Seer, Ruella',
      ids: ['seer', 'ruella'] as ChampionId[],
      affinity: 'check in-game',
      matched: '184 each',
      mismatched: '276 each',
    },
  ] as { champs: string; ids: ChampionId[]; affinity: string; affinityLink?: string; matched: string; mismatched: string }[],
  myCall:
    '[My call] Spend brews only on the 13 core (~1,840 matched brews total, well inside your stock). Level fodder bases with campaign food runs instead: Brutal 12-3 gives ~10,362 XP per champion per run with an XP boost ([InTeleria](https://www.inteleria.com/best-way-to-farm-food-raid-shadow-legends/)); Bellower is your farmer. Use the affinity filter and spend Spirit/Void (your smallest piles) only on matching champions.',
}

export interface TomeRow {
  /** Counter id in progress state: `tome.<counter>`. */
  counter: string
  order: number
  skill: string
  tomes: number
  effect: string
  champ: ChampionId
}

export const legendaryTomes = {
  total: 13,
  label: 'Sourced tome counts → My allocation',
  rows: [
    { counter: 'leg.ninjaA3', order: 1, skill: 'Ninja A3 Cyan Slash', tomes: 4, effect: 'CD 5→4; DWJ requires it fully booked for the tune', champ: 'ninja' },
    { counter: 'leg.ninjaA2', order: 2, skill: 'Ninja A2 Hailburn', tomes: 5, effect: 'Burn chance to 100%, CD 4→3 at the 5th tome', champ: 'ninja' },
    { counter: 'leg.kymarA3', order: 3, skill: 'Prince Kymar A3', tomes: 1, effect: 'Team cooldown reset 7→6 (when built)', champ: 'kymar' },
    { counter: 'leg.udkA3', order: 4, skill: 'Ultimate Deathknight A3', tomes: 2, effect: 'Team shield + heal, CD 5→3 (when built)', champ: 'udk' },
    { counter: 'leg.artakA3', order: 5, skill: 'Reserve', tomes: 1, effect: 'Toward Artak A3 (4 for 100% burn and CD 4→3)', champ: 'artak' },
  ] as TomeRow[],
  after:
    "Sources: [HH Ninja](https://hellhades.com/raid/champions/ninja/), [HH Kymar](https://hellhades.com/raid/champions/prince-kymar/), [HH UDK](https://hellhades.com/raid/champions/ultimate-deathknight/), [HH Artak](https://hellhades.com/raid/champions/artak/). Kymar A3 + UDK A3 buy three team-wide cooldown levels for 3 tomes; Artak's burn chance matters less while Gizmak burns every round (burns don't stack). Maxing even your top 7 Legendaries would need ~77 tomes, so Legendary tomes go to cooldown and chance levels only.",
}

export interface EpicTomePlan {
  counter: string
  champ: ChampionId
  name: string
  /** First milestone (cooldown levels) and its label. */
  first: { tomes: number; label: string }
  total: number
  totalNote?: string
}

export const epicTomes = {
  total: 120,
  label: 'Sourced cooldown levels',
  steps: [
    'Maneater A3 ×2 (CD 7→5).',
    'Deacon A3 ×2 (5→3).',
    'Skullcrusher A2 ×1 (4→3).',
    'Seer A2 ×1 (4→3) and A3 ×2 (6→4).',
    'Ruella A3 ×3 (6→3).',
    'Finish the core: Maneater to 11, Deacon to 13 (A2 Decrease DEF chance to 100%), Seer to 7, Skullcrusher to 5, Ruella to 13.',
  ],
  plans: [
    { counter: 'epic.maneater', champ: 'maneater', name: 'Maneater', first: { tomes: 2, label: 'A3 ×2 (CD 7→5)' }, total: 11 },
    {
      counter: 'epic.deacon',
      champ: 'deacon',
      name: 'Deacon',
      first: { tomes: 2, label: 'A3 ×2 (5→3)' },
      total: 13,
      totalNote: 'A2 Decrease DEF chance to 100%',
    },
    { counter: 'epic.skullcrusher', champ: 'skullcrusher', name: 'Skullcrusher', first: { tomes: 1, label: 'A2 ×1 (4→3)' }, total: 5 },
    { counter: 'epic.seer', champ: 'seer', name: 'Seer', first: { tomes: 3, label: 'A2 ×1 (4→3) and A3 ×2 (6→4)' }, total: 7 },
    { counter: 'epic.ruella', champ: 'ruella', name: 'Ruella', first: { tomes: 3, label: 'A3 ×3 (6→3)' }, total: 13 },
  ] as EpicTomePlan[],
  after:
    "That's ~49 tomes; the ~71 left wait for future builds (Toragi, Ursala, Criodan). Book Epics only when you actually build them ([HH Maneater](https://hellhades.com/raid/champions/maneater/), [HH Deacon](https://hellhades.com/raid/champions/deacon-armstrong/), [HH Seer](https://hellhades.com/raid/champions/seer/), [HH Ruella](https://hellhades.com/raid/champions/ruella/)).",
}

export const rareTomes = {
  total: 26,
  counter: 'rare.painkeeper',
  first: 3,
  full: 15,
  text: '**Rare (26):** Pain Keeper fully booked (15) — her cooldown skill is **A3 Combat Tactics**, 3 tomes take it 7→4, and DWJ wants all her skills booked ([HH Pain Keeper](https://hellhades.com/raid/champions/pain-keeper/)). Keep the other 11; Apothecary and Frozen Banshee only if you field them.',
}

export const mythicTomes = {
  total: 0,
  text: '**Mythic (0):** both Mythicals work unbooked — their key effects are passives or unresistable. HellHades still rates their books 10/10, so if you get Mythic tomes: Gizmak Base A3 (5→4), Gizmak Base A2 ×2 (4→3), then Galleus Base A3 (4→3).',
  order: ['Gizmak Base A3 (5→4)', 'Gizmak Base A2 ×2 (4→3)', 'Galleus Base A3 (4→3)'],
}

export const masteries = {
  rows: [
    {
      champs: 'Maneater, Pain Keeper, Ninja, Rathalos, Skullcrusher (UK team)',
      ids: ['maneater', 'painkeeper', 'ninja', 'rathalos', 'skullcrusher'] as ChampionId[],
      lines: [
        'Warmaster on all; Lifedrinker/Grim Resolve; no Heart of Glory; no Retribution on Pain Keeper; no speed masteries on Skullcrusher ([DWJ](https://deadwoodjedi.com/new-budget-unkillable/))',
      ],
    },
    {
      champs: 'Gizmak (PvE)',
      ids: ['gizmak'] as ChampionId[],
      lines: [
        'Offense: Deadly Precision, Keen Strike, Shield Breaker, Single Out, Bring it Down, Methodical, Warmaster.',
        'Support: Steadfast, Exalt in Death, Rapid Response, Arcane Celerity, Lore of Steel, Cycle of Magic, Master Hexer, Lasting Gifts ([Ayumilove](https://ayumilove.net/raid-shadow-legends-gizmak-the-terrible-skill-mastery-equip-guide/))',
      ],
    },
    {
      champs: 'Galleus (PvE)',
      ids: ['galleus'] as ChampionId[],
      lines: [
        'Offense: Deadly Precision, Keen Strike, Heart of Glory, Single Out, Bring it Down, Methodical, Kill Streak, Warmaster.',
        'Support: Pinpoint Accuracy, Exalt in Death, Rapid Response, Arcane Celerity, Lore of Steel, Evil Eye, Master Hexer ([Ayumilove](https://ayumilove.net/raid-shadow-legends-galleus-bloodcrest-skill-mastery-equip-guide/))',
      ],
    },
    {
      champs: 'Artak, Deacon, Kymar, UDK, Seer, Ruella',
      ids: ['artak', 'deacon', 'kymar', 'udk', 'seer', 'ruella'] as ChampionId[],
      lines: ['[My call] Warmaster on boss-damage units (Artak); support/debuff path on supports — check each HellHades build page'],
    },
  ],
  after:
    'Take Giant Slayer over Warmaster only for champions averaging 2+ hits per skill ([InTeleria](https://www.inteleria.com/warmaster-or-giant-slayer/)). A full set costs 1,650 scrolls: ~150–160 Minotaur 15 runs at 14 energy, or 800 gems ([HH Minotaur](https://hellhades.com/gems-vs-farming-minotaurs-labyrinth/)).',
  scrollsPerSet: 1650,
  minotaurRuns: '~150–160',
  energyPerRun: 14,
  gemCost: 800,
  minotaurList: ['Maneater', 'Pain Keeper', 'Rathalos', 'Deacon', 'Artak'],
}

export interface BudgetRow {
  id: string
  use: string
  display: string
  /** Budget used for the progress bar (upper end of a range). */
  value: number
  /** Lower end when the guide gives a range. */
  low?: number
  why?: string
}

export const energy = {
  total: 104_890,
  label: 'My budget, built on sourced costs',
  rows: [
    {
      id: 'keeps',
      use: 'Potion Keeps (stage 20+)',
      display: '~28k',
      value: 28_000,
      why: 'The 13 core need ~380 Superior potions; stage 20+ gives ~1.7 Superior per 5 runs ([InTeleria Keeps](https://www.inteleria.com/raid-keep-drop-rates/))',
    },
    { id: 'minotaur', use: 'Minotaur 15', display: '~20k', value: 20_000, why: '~2.2k per champion × 9 (2 bought with gems, 2 from overflow)' },
    { id: 'dragon', use: 'Dragon', display: '~15k', value: 15_000, why: 'Speed, Accuracy, Lifesteal' },
    {
      id: 'campaign',
      use: 'Campaign Brutal 12-3 (8/run)',
      display: '~12k',
      value: 12_000,
      why: 'Fodder bases + account levels; always with XP boosts',
    },
    { id: 'spider', use: 'Spider', display: '~12k', value: 12_000, why: 'Accessories + silver' },
    { id: 'fk', use: 'Fire Knight', display: '~5k', value: 5_000, why: 'Savage/Regeneration' },
    { id: 'ig', use: 'Ice Golem', display: '~4k', value: 4_000, why: 'IG for quests' },
    { id: 'reserve', use: 'Reserve for events/tournaments', display: '~9k', value: 9_000, why: 'Points multiply rewards' },
  ] as BudgetRow[],
  combinedNote: 'The guide budgets Fire Knight / Ice Golem together as ~5k / ~4k (Savage/Regeneration; IG for quests).',
  after:
    "Energy above the cap doesn't decay — only regen pauses ([HH energy](https://hellhades.com/beginners-energy-guide-raid-shadow-legends/)), so there is no rush. Ascension order: Asc 3 first (Deacon's extra turn), then 5 (Amulet), then 6 (Banner); Pain Keeper, Deacon and Maneater ascend cheapest.",
}

export const gems = {
  total: 7_600,
  spend: [
    { id: 'gem.gemmine', label: 'Gem Mine', cost: 1_500, note: '3 × 500 · 15 gems/day, pays back in about 100 days' },
    { id: 'gem.mast-gizmak', label: 'Instant masteries — Gizmak', cost: 800 },
    { id: 'gem.mast-ninja', label: 'Instant masteries — Ninja', cost: 800 },
    { id: 'gem.mast-maneater', label: 'Instant masteries — Maneater (optional)', cost: 800, optional: true },
  ],
  keep: 4_500,
  bullets: [
    '**Spend:** Gem Mine 1,500; instant masteries on Gizmak + Ninja 1,600 (optionally Maneater +800).',
    '**Keep:** ~4,500 for champion and storage slots.',
    '**Never** buy energy, silver, shards or market slots ([Ayumilove gem guide](https://ayumilove.net/?p=108879), [InTeleria 2026](https://www.inteleria.com/raid-shadow-legends-beginner-guide-2026-fast-start-zero-regrets/)).',
  ],
  never: ['Energy', 'Silver', 'Shards', 'Market slots'],
}

export const silver = {
  total: 63_000_000,
  intro:
    'Upgrades cost about 200–400k per piece to +12 and 1.5–2M to +16 ([InTeleria enhancement](https://www.inteleria.com/raid-shadow-legends-artifact-enhancement-event-guide/)).',
  rows: [
    { id: 'plus12', use: '+12 on 5–6★ gear for the 8 Wave-1 champions (~48 pieces)', display: '~14M', value: 14_000_000 },
    {
      id: 'plus16',
      use: '+16 on ~10 key main-stat pieces (Speed boots on Maneater/Pain Keeper/Deacon/Gizmak, C.RATE gloves on Ninja/Rathalos), from level 40, ideally in an Enhancement event',
      display: '~15–20M',
      value: 20_000_000,
      low: 15_000_000,
    },
    { id: 'mixer', use: 'Potion Mixer (10 Greater → 1 Superior for 100k)', display: '~3M', value: 3_000_000 },
    { id: 'rankups', use: 'Rank-ups', display: '~1.2M', value: 1_200_000 },
    { id: 'reserve', use: 'Reserve for events', display: '~15–20M', value: 20_000_000, low: 15_000_000 },
  ] as BudgetRow[],
  after: 'Stop levelling a piece when its substats roll badly.',
}

export const greatHall = {
  priority: ['ACC', 'C.DMG', 'RES', 'DEF', 'HP', 'ATK'],
  text: '**Great Hall:** ACC > C.DMG > RES > DEF > HP > ATK; focus Force (Galleus), Magic (Gizmak, Kymar) and the other core affinities as you confirm them.',
}

export const unlocks = [
  { level: 6, what: 'Great Hall' },
  { level: 18, what: 'Market' },
  { level: 33, what: 'Chimera' },
  { level: 35, what: 'Tag Team Arena + Advanced Quests' },
  { level: 40, what: 'Doom Tower + +16 artifacts' },
  { level: 45, what: 'Hydra' },
  { level: 52, what: 'Cursed City' },
]

export const gearByChampion = [
  { id: 'gizmak' as ChampionId, name: 'Gizmak', text: 'SPD, C.RATE to 100%, HP%/DEF%, then ACC — Speed/Perception early, Relentless/Reflex later.' },
  { id: 'galleus' as ChampionId, name: 'Galleus', text: 'DEF%, 100% C.RATE, C.DMG, SPD, ACC — Speed/Perception early, Savage/Lethal/Merciless later.' },
  { id: 'deacon' as ChampionId, name: 'Deacon', text: 'ACC, SPD, HP%, DEF% — Speed/Accuracy/Perception.' },
]

export const setSources = {
  rows: [
    { sets: 'Speed / Accuracy / Lifesteal', from: 'Dragon' },
    { sets: 'Savage / Regeneration', from: 'Fire Knight' },
    { sets: 'Perception', from: 'Faction Wars forge' },
    { sets: 'Relentless', from: 'Only from tournaments' },
    { sets: 'Cruel / Immortal', from: 'Demon Lord chests' },
  ],
  text: '**Set sources:** Speed/Accuracy/Lifesteal from Dragon, Savage/Regeneration from Fire Knight, Perception from the Faction Wars forge, Relentless only from tournaments, Cruel/Immortal from Demon Lord chests ([Ayumilove artifacts](https://ayumilove.net/raid-shadow-legends-artifact-and-accessory-guide/)).',
}
