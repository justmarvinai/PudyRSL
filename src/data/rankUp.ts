import type { ChampionId } from './types'

// Section 5 "The 6★ plan with the math".

export const rankUpIntro =
  'Your stock makes 13 Rank 6s in total: 2 Mythicals + 3 Feasts + 3 from 5★ chickens on Day 1, then 5 more from 4★ chickens over weeks 2–6.'

export const rankRules =
  "**Rules** [Sourced]: a real champion at its rank's level cap must be the base — chickens are fodder only. Rank N→N+1 costs N fodder of rank N. Level caps: R3 = 30, R4 = 40, R5 = 50, R6 = 60. A Feast takes a max-level champion of any rank to R6 L1; the Barrel maxes the current rank ([Plarium Tavern](https://raid-support.plarium.com/hc/en-us/articles/360014648380-The-Tavern)). Mythicals arrive at Rank 6 ([HH Mythical preview](https://hellhades.com/raid-update-preview-mythical-champions/)). XP from level 1 to cap: 3★ 200,681 · 4★ 449,082 · 5★ 963,806 · 6★ 2,010,669 ([Ayumilove leveling](https://ayumilove.net/raid-shadow-legends-champion-leveling-guide/))."

export const levelCaps: Record<number, number> = { 3: 30, 4: 40, 5: 50, 6: 60 }

/** XP from level 1 to cap, per rank (Ayumilove leveling). */
export const xpToCap: Record<number, number> = { 3: 200_681, 4: 449_082, 5: 963_806, 6: 2_010_669 }

export const rankAssumption =
  "Assumed: Epics are at 4★, Legendaries at 5★, Rares at 3★. **Check each champion's current rank in-game** — anything already higher shortens the path."

export const whyFeasts =
  '**Why Feasts go on the Epics and the Rare:** a Feast on a 4★ Epic skips 4 × 4★ + 5 × 5★ fodder; on a Legendary it only skips 5 × 5★. Legendaries are the cheapest chicken targets.'

export interface Wave1Row {
  champ: string
  id: ChampionId
  path: string
  fodder: string
  xp: string
  /** Champion step that marks this path complete. */
  doneStep: string
}

export const wave1 = {
  title: 'Wave 1 (Days 1–3): 8 Rank 6s',
  rows: [
    { champ: 'Gizmak', id: 'gizmak', path: 'Already R6 → XP Barrel', fodder: '–', xp: '0 (Barrel)', doneStep: 'barrel' },
    { champ: 'Galleus', id: 'galleus', path: 'Already R6 → 60', fodder: '–', xp: '2.01M', doneStep: 'brew' },
    { champ: 'Maneater', id: 'maneater', path: '4★ L40 → Feast → 60', fodder: 'Feast', xp: '0.45M + 2.01M', doneStep: 'lv60' },
    { champ: 'Deacon Armstrong', id: 'deacon', path: '4★ L40 → Feast → 60', fodder: 'Feast', xp: '0.45M + 2.01M', doneStep: 'lv60' },
    { champ: 'Pain Keeper', id: 'painkeeper', path: '3★ L30 → Feast → 60', fodder: 'Feast', xp: '0.20M + 2.01M', doneStep: 'lv60' },
    { champ: 'Ninja', id: 'ninja', path: '5★ L50 → R6 → 60', fodder: '5 × 5★ chicken', xp: '0.96M + 2.01M', doneStep: 'lv60' },
    { champ: 'Artak', id: 'artak', path: '5★ L50 → R6 → 60', fodder: '5 × 5★ chicken', xp: '0.96M + 2.01M', doneStep: 'lv60' },
    {
      champ: 'Rathalos Blademaster',
      id: 'rathalos',
      path: '5★ L50 → R6 → 60',
      fodder: '5 × 5★ chicken',
      xp: '0.96M + 2.01M',
      doneStep: 'lv60',
    },
  ] as Wave1Row[],
  total: { fodder: '15 of 16 5★ chickens, 3 of 3 Feasts', xp: '≈18.1M XP' },
  skullNote: 'Plus **Skullcrusher to 5★ L50** in week 1 (4 × 4★ chickens, ~1.41M XP) as the stun target.',
}

export interface Wave2Row {
  target: string
  id: ChampionId
  needs: string
  units: number
  bases: number
  /** Crafted 5★ fodder this target needs. */
  crafted: number
  doneStep: string
}

export const wave2 = {
  title: 'Wave 2 (weeks 2–6): 5 more Rank 6s',
  intro:
    'Each crafted 5★ fodder = 1 real 4★ champion levelled to 40 + 4 × 4★ units (a "4★ unit" is a 4★ chicken or any 4★ champion).',
  rows: [
    {
      target: 'Prince Kymar (Legendary)',
      id: 'kymar',
      needs: '1 leftover 5★ chicken + 4 crafted 5★',
      units: 20,
      bases: 4,
      crafted: 4,
      doneStep: 'rank6',
    },
    { target: 'Ultimate Deathknight (Legendary)', id: 'udk', needs: '5 crafted 5★', units: 25, bases: 5, crafted: 5, doneStep: 'rank6' },
    { target: 'Seer (Epic)', id: 'seer', needs: '4 units (4→5) + 5 crafted 5★', units: 29, bases: 5, crafted: 5, doneStep: 'rank6' },
    { target: 'Ruella (Epic)', id: 'ruella', needs: '4 units (4→5) + 5 crafted 5★', units: 29, bases: 5, crafted: 5, doneStep: 'rank6' },
    { target: 'Skullcrusher 5★→6★', id: 'skullcrusher', needs: '5 crafted 5★', units: 25, bases: 5, crafted: 5, doneStep: 'r6' },
  ] as Wave2Row[],
  total: { units: 128, bases: 24 },
}

export const supply = {
  text: "**Supply:** 79 × 4★ chickens left after Skullcrusher's 4. Your 68 × 3★ chickens plus 7 × 3★ made from 14 of your 2★ chickens = 75 × 3★ fodder → **25 more 4★ units** (costs 25 real 3★ campaign food champions at Lv30 and 7 real 2★ at Lv20). The 24 real bases count as units too. 79 + 25 + 24 = **128, exactly enough for Wave 2**. Short on campaign food? Use one junk Epic as a direct 4★ unit per missing crafted unit.",
  parts: [
    { label: '4★ chickens left after Skullcrusher', value: 79 },
    { label: '4★ units crafted from 75 × 3★ fodder', value: 25 },
    { label: 'Real Lv40 bases (count as units)', value: 24 },
  ],
  needed: 128,
  threeStar: { chickens: 68, crafted: 7, fromTwoStar: 14, total: 75 },
  foodCost: { threeStarAt30: 25, twoStarAt20: 7 },
}

export const wave2Cost =
  '**Wave-2 cost:** ≈31M XP (targets ~14.8M, Epic bases ~10.8M, food bases ~5.6M) and ~1.2M silver for all rank-ups.'

export const sacrifice = {
  title: 'Safe-to-sacrifice Epics (bases/fodder)',
  label: 'My call from HH and Ayumilove ratings; none is in any recommended team',
  basesNeeded: 24,
  useFirst: [
    'Terrorbeast',
    'Masked Fearmonger',
    'Snorting Thug',
    'Ursine Icecrusher',
    'Yaga the Insatiable',
    'Vildrax',
    'Bushi',
    'BroodLord',
    'Deathless',
    'Bergoth the Malformed',
    'Flesh-Tearer',
    'Jurojin',
    'Kytis',
    'Nogoryo',
    'Maeve',
  ],
  then: [
    'Baerdal Fellhammer',
    'Dark Athel',
    'Hope',
    'Jinglehunter',
    'Jizoh',
    'Marksman',
    'Romero',
    'Shaman',
    'Tainix Hateflower',
    'Theresc',
    'Lordly Legionary',
    'Bonekeeper',
  ],
  thenNote: '15 + 12 = 27 ≥ the 24 needed.',
  keep: [
    'Toragi',
    'Ursala',
    'Rearguard Sergeant',
    'Jareg',
    'Urogrim',
    'Kaiden',
    'Fenax',
    'Criodan',
    'Fenshi',
    'Alure',
    'Fodbor',
    'Magnarr',
    'Melga',
    'Tayrel',
    'Visionary',
    'Old Hermit Jorrg',
    'Runekeeper Dazdurk',
    'High Khatun',
    'Lightsworn',
    'Jotun',
  ],
  keepHH7: ['Gorlos', 'Dirandil', 'Dark Elhain', 'Oathbound', 'Skytouched Shaman', 'Weregren'],
  keepRares: 'all 6 Rares (Bellower is a top 12-3 campaign farmer, Paragon is HH Spider 10, Bulwark is HH CB 9)',
  factionWars:
    '**Faction Wars caveat:** it later needs several levelled champions per faction, so sacrifice the weakest first and check factions in-game before feeding.',
}
