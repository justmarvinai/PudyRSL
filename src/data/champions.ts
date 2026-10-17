import type { Affinity, ChampionId, ContentKey, Rarity } from './types'

export interface ChampionStep {
  /** Stable id, stored as `ch.<champion>.<key>` in progress state. */
  key: string
  text: string
  /** Shown as the champion's status once this step is the furthest one done. */
  status?: string
  /** Tome counter this step reads from instead of a plain checkbox. */
  tome?: { counter: string; min: number; floor: number }
}

export interface Champion {
  id: ChampionId
  name: string
  short: string
  monogram: string
  rarity: Rarity
  /** Only set where the guide confirms it (Galleus, Gizmak, Kymar). */
  affinity: Affinity | null
  affinitySource?: string
  wave: 1 | 2
  /** "6★ wave" column, verbatim. */
  waveLabel: string
  /** Row of the 13-champion table, verbatim. */
  coverage: Record<ContentKey, string>
  /** Short role line taken from the guide's own wording. */
  tagline: string
  why: string[]
  ratings: string[]
  brews: { matched: string; mismatched: string }
  gear: string[]
  masteries: string[]
  speed?: string
  steps: ChampionStep[]
  notes: string[]
}

const AYU_GALLEUS = 'https://ayumilove.net/raid-shadow-legends-galleus-bloodcrest-skill-mastery-equip-guide/'
const AYU_GIZMAK = 'https://ayumilove.net/raid-shadow-legends-gizmak-the-terrible-skill-mastery-equip-guide/'

const MYTHICALS_WHY =
  "**Your Mythicals carry but don't enable unkillable.** Neither gives team-wide Unkillable (both only self). Gizmak's team +30% SPD + Extra Turn and Galleus' Turn Meter steal + Extra Turn break Maneater tune timing ([Ayumilove Galleus](" +
  AYU_GALLEUS +
  '), [Ayumilove Gizmak](' +
  AYU_GIZMAK +
  ")). They carry you before the tune works, and afterwards carry Hydra, Chimera, Spider, Dragon, Ice Golem and Arena. HellHades' Nub calls Gizmak the most underrated Mythical ([HH Nub Mythical list](https://hellhades.com/nubs-mythical-tier-list-raid-shadow-legends/)); Galleus got a solid buff in patch 10.45 (May 2025)."

const RATHALOS_VS_KYMAR =
  '**Rathalos before Kymar** [My call]: Clan Boss is your #1 priority. Weighted by your priorities, Rathalos scores 8.98 vs Kymar 8.05 on HH ratings. Kymar is only HH CB 5 but Spider/Dragon/IG/Arena 10 ([HH Kymar](https://hellhades.com/raid/champions/prince-kymar/)), so he is the first Wave-2 build.'

const UK_MASTERIES =
  'UK team: Warmaster on all; Lifedrinker/Grim Resolve; no Heart of Glory; no Retribution on Pain Keeper; no speed masteries on Skullcrusher ([DWJ](https://deadwoodjedi.com/new-budget-unkillable/))'

const MINOTAUR_NOTE = 'Minotaur: climb toward stage 15 for mastery scrolls (Maneater, Pain Keeper, Rathalos, Deacon, Artak).'

const KEEP_OUT_UK =
  '**Keep out of the Budget Maneater team:** Gizmak, Deacon, Galleus, Seer, Apothecary, High Khatun — they change turn timing or strip buffs.'

const SUPPORT_MASTERIES =
  '[My call] Warmaster on boss-damage units (Artak); support/debuff path on supports — check each HellHades build page'

const GIANT_SLAYER =
  'Take Giant Slayer over Warmaster only for champions averaging 2+ hits per skill ([InTeleria](https://www.inteleria.com/warmaster-or-giant-slayer/)).'

// Shared rank-up steps for Legendaries that start at 5★ (guide assumption).
const legendaryChickenSteps = (): ChampionStep[] => [
  { key: 'lv50', text: 'Brew to Lv50 (5★ cap)', status: '5★ · Lv 50' },
  { key: 'rank6', text: 'Rank up with 5 × 5★ chickens', status: 'R6 · Lv 1' },
  { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
]

export const champions: Champion[] = [
  {
    id: 'gizmak',
    name: 'Gizmak the Terrible',
    short: 'Gizmak',
    monogram: 'GZ',
    rarity: 'Mythical',
    affinity: 'Magic',
    affinitySource: AYU_GIZMAK,
    wave: 1,
    waveLabel: 'Already R6',
    coverage: {
      demonLord: 'Starter lead (not in UK)',
      chimera: '✓',
      hydra: '✓',
      spider: '✓',
      dragon: '(✓)',
      fk: '–',
      ig: '✓',
      arena: '✓',
    },
    tagline: 'Starter Clan Boss lead · your carry/farmer',
    why: [MYTHICALS_WHY],
    ratings: ['HH Nub: most underrated Mythical', 'FK 2★ (avoid in Fire Knight)', 'HellHades rates his books 10/10'],
    brews: { matched: '0 (Barrel)', mismatched: '0' },
    gear: [
      'SPD, C.RATE to 100%, HP%/DEF%, then ACC — Speed/Perception early, Relentless/Reflex later.',
      'Clan Boss: get him to 100% C.RATE so his burns become unresistable.',
      'Spider: 100% C.RATE, SPD, HP/DEF (not ATK).',
    ],
    masteries: [
      'Offense: Deadly Precision, Keen Strike, Shield Breaker, Single Out, Bring it Down, Methodical, Warmaster.',
      'Support: Steadfast, Exalt in Death, Rapid Response, Arcane Celerity, Lore of Steel, Cycle of Magic, Master Hexer, Lasting Gifts ([Ayumilove](' +
        AYU_GIZMAK +
        ')).',
    ],
    steps: [
      { key: 'barrel', text: 'XP Barrel — maxes his level for Rank 6 (he starts at Rank 6, Level 1)', status: 'R6 · Lv 60' },
      { key: 'masteries', text: 'Instant masteries (800 gems)' },
      { key: 'crate', text: 'Gear to 100% C.RATE so his burns become unresistable' },
      { key: 'boots', text: '+16 Speed boots (key main-stat piece)' },
    ],
    notes: [
      '**XP Barrel on Gizmak.** He starts at Rank 6, Level 1; the Barrel maxes a champion\'s level for its current rank, worth about 2.0M XP on a fresh R6 ([Plarium Tavern](https://raid-support.plarium.com/hc/en-us/articles/360014648380-The-Tavern)).',
      'Starter Clan Boss leader: +27% C.RATE aura, free HP Burn every round, team +30% C.RATE/C.DMG/SPD.',
      KEEP_OUT_UK,
      "**Don't rely on Gizmak's Taunt** to stop digestion (Hydra); the 2024 rework reportedly removed that.",
      'Avoid Gizmak in Fire Knight (FK 2★).',
      "Don't build damage on Spider burners: keep Gizmak, Artak and Kymar on ACC/SPD/HP so spiderlings don't die early.",
      'Arena: Polymorph and Stoneskin defenses counter both Mythicals.',
      'Mythic tomes (if you get them): Gizmak Base A3 (5→4), Gizmak Base A2 ×2 (4→3), then Galleus Base A3 (4→3).',
    ],
  },
  {
    id: 'galleus',
    name: 'Galleus Bloodcrest',
    short: 'Galleus',
    monogram: 'GB',
    rarity: 'Mythical',
    affinity: 'Force',
    affinitySource: AYU_GALLEUS,
    wave: 1,
    waveLabel: 'Already R6',
    coverage: {
      demonLord: 'Starter flex',
      chimera: '✓',
      hydra: '✓',
      spider: '–',
      dragon: '✓',
      fk: '(✓)',
      ig: '–',
      arena: '✓',
    },
    tagline: 'Starter flex · Alt form clears waves',
    why: [MYTHICALS_WHY],
    ratings: ['HH Arena 10', 'Ayumilove Dragon Hard 5'],
    brews: { matched: '108', mismatched: '161' },
    gear: ['DEF%, 100% C.RATE, C.DMG, SPD, ACC — Speed/Perception early, Savage/Lethal/Merciless later.'],
    masteries: [
      'Offense: Deadly Precision, Keen Strike, Heart of Glory, Single Out, Bring it Down, Methodical, Kill Streak, Warmaster.',
      'Support: Pinpoint Accuracy, Exalt in Death, Rapid Response, Arcane Celerity, Lore of Steel, Evil Eye, Master Hexer ([Ayumilove](' +
        AYU_GALLEUS +
        ')).',
    ],
    steps: [{ key: 'brew', text: 'Brew to 60 with about 108 Force brews', status: 'R6 · Lv 60' }],
    notes: [
      '**Brew Galleus to 60 with about 108 Force brews.** He is Force affinity, so each brew gives 18,750 XP. Use the Instant Brew Upgrade screen with its affinity filter ([Plarium Brew Upgrade](https://raid-support.plarium.com/hc/en-us/articles/22806729480348-Guide-Brew-Upgrade)).',
      'Starter Clan Boss flex — Galleus (Base): 100% boss reflect + self-heal, team Revive on Death, +60% DEF. Use Galleus if you die too early.',
      'Campaign push with Galleus (Alt form clears waves) and Gizmak to raise account level.',
      KEEP_OUT_UK,
      'Arena: Polymorph and Stoneskin defenses counter both Mythicals.',
      'Mythic tomes (if you get them): after Gizmak Base A3 and A2 ×2, Galleus Base A3 (4→3).',
    ],
  },
  {
    id: 'ninja',
    name: 'Ninja',
    short: 'Ninja',
    monogram: 'NJ',
    rarity: 'Legendary',
    affinity: null,
    wave: 1,
    waveLabel: '1 (chickens)',
    coverage: {
      demonLord: 'UK key DPS',
      chimera: '✓',
      hydra: '✓',
      spider: '–',
      dragon: '✓',
      fk: '(✓)',
      ig: '✓',
      arena: '–',
    },
    tagline: 'The Clan Boss anchor',
    why: [
      '**Ninja is the Clan Boss anchor.** HellHades rates him 10/10/10 for Demon Lord/Hydra/Chimera, Ayumilove 5/5/5 ([HH Ninja](https://hellhades.com/raid/champions/ninja/), [Ayumilove Ninja](https://ayumilove.net/raid-shadow-legends-ninja-skill-mastery-equip-guide/)). He has a dedicated speed slot (161–165) in the Budget Maneater tune.',
    ],
    ratings: ['HH DL 10 · Hydra 10 · Chimera 10', 'Ayumilove 5/5/5', 'Ayumilove Chimera 5/5', 'Spider: HH 8 vs Ayumilove 2★'],
    brews: { matched: '160', mismatched: '239' },
    speed: '161–165',
    gear: [
      'Budget Maneater tune: damage stats; no Counterattack gear or masteries.',
      '+16 C.RATE gloves (key main-stat piece).',
    ],
    masteries: ['Instant masteries (800 gems) on Day 1 — your Clan Boss damage.', UK_MASTERIES],
    steps: [
      ...legendaryChickenSteps(),
      { key: 'a3', text: 'Legendary tomes: A3 Cyan Slash ×4 (CD 5→4)', tome: { counter: 'leg.ninjaA3', min: 4, floor: 0 } },
      { key: 'a2', text: 'Legendary tomes: A2 Hailburn ×5 (burn chance 100%, CD 4→3)', tome: { counter: 'leg.ninjaA2', min: 5, floor: 0 } },
      { key: 'masteries', text: 'Instant masteries (800 gems) — Warmaster' },
      { key: 'asc', text: 'Potion Keeps: ascend him (after Deacon, Pain Keeper, Maneater)' },
      { key: 'speed', text: 'Budget Maneater tune: true speed 161–165' },
      { key: 'gloves', text: '+16 C.RATE gloves' },
    ],
    notes: [
      'Starter Clan Boss DPS: main damage; A2 activates burns vs bosses. Set A3 as first AI priority.',
      '**Force-affinity days:** take Ninja out and run the standard version with two DPS at 175–178 (Rathalos + Artak).',
      'Clan Boss openers — Brutal: Ninja A2, A3 · NM: Ninja A3, A2 · UNM: Ninja A3 then A2, then full auto.',
      'No Counterattack gear/masteries on Ninja or Pain Keeper.',
    ],
  },
  {
    id: 'maneater',
    name: 'Maneater',
    short: 'Maneater',
    monogram: 'ME',
    rarity: 'Epic',
    affinity: null,
    wave: 1,
    waveLabel: '1 (Feast)',
    coverage: {
      demonLord: 'UK',
      chimera: '–',
      hydra: 'K2',
      spider: '✓',
      dragon: '✓',
      fk: '–',
      ig: '✓',
      arena: '–',
    },
    tagline: 'The unkillable engine',
    why: [
      "**Maneater + Pain Keeper are the unkillable engine.** Maneater's A3 gives the team Unkillable + Block Debuffs; Pain Keeper's A3 cuts all ally cooldowns by 1 ([HH Maneater](https://hellhades.com/champion-spotlight-maneater/), [Ayumilove Pain Keeper](https://ayumilove.net/raid-shadow-legends-pain-keeper-skill-mastery-equip-guide/)). Both are HH Clan Boss 10; Maneater is also Spider 10.",
    ],
    ratings: ['HH Clan Boss 10', 'HH Spider 10'],
    brews: { matched: '132', mismatched: '197' },
    speed: '240–241',
    gear: ['Budget Maneater tune: Speed set, 100% C.RATE, ATK/C.DMG.', '+16 Speed boots (key main-stat piece).'],
    masteries: [UK_MASTERIES, 'Optional: instant masteries for 800 gems.'],
    steps: [
      { key: 'cap', text: 'Brew to rank cap (Lv40 if 4★)', status: 'Rank cap' },
      { key: 'feast', text: 'Feast → R6 L1', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'a3', text: 'Epic tomes: A3 ×2 (CD 7→5)', tome: { counter: 'epic.maneater', min: 2, floor: 0 } },
      { key: 'books', text: 'Finish books (11 Epic tomes)', tome: { counter: 'epic.maneater', min: 11, floor: 2 } },
      { key: 'masteries', text: 'Masteries — Warmaster (Minotaur scrolls, or 800 gems)' },
      { key: 'asc', text: 'Potion Keeps: ascend him (after Deacon and Pain Keeper)' },
      { key: 'speed', text: 'Budget Maneater tune: true speed 240–241' },
      { key: 'boots', text: '+16 Speed boots' },
    ],
    notes: [
      'One report says Maneater needs 256 instead of 240.',
      'Clan Boss openers — Brutal: Maneater A2, A1, A3 · NM: Maneater A2, A3 · UNM: Maneater A3.',
      'Spider: drains boss TM; Unkillable + Block Debuffs — the 240 SPD build carries over.',
      MINOTAUR_NOTE,
      'Pain Keeper, Deacon and Maneater ascend cheapest.',
    ],
  },
  {
    id: 'painkeeper',
    name: 'Pain Keeper',
    short: 'Pain Keeper',
    monogram: 'PK',
    rarity: 'Rare',
    affinity: null,
    wave: 1,
    waveLabel: '1 (Feast)',
    coverage: {
      demonLord: 'UK',
      chimera: '–',
      hydra: 'K2',
      spider: '–',
      dragon: '–',
      fk: '(✓)',
      ig: '–',
      arena: '–',
    },
    tagline: 'Cooldown support',
    why: [
      "**Maneater + Pain Keeper are the unkillable engine.** Maneater's A3 gives the team Unkillable + Block Debuffs; Pain Keeper's A3 cuts all ally cooldowns by 1 ([HH Maneater](https://hellhades.com/champion-spotlight-maneater/), [Ayumilove Pain Keeper](https://ayumilove.net/raid-shadow-legends-pain-keeper-skill-mastery-equip-guide/)). Both are HH Clan Boss 10; Maneater is also Spider 10.",
    ],
    ratings: ['HH Clan Boss 10'],
    brews: { matched: '119', mismatched: '178' },
    speed: '218–222',
    gear: ['Budget Maneater tune: Speed set, 100% C.RATE; no Counterattack gear.', '+16 Speed boots (key main-stat piece).'],
    masteries: [UK_MASTERIES],
    steps: [
      { key: 'cap', text: 'Brew to rank cap (Lv30 if 3★)', status: 'Rank cap' },
      { key: 'feast', text: 'Feast → R6 L1', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'a3', text: 'Rare tomes: A3 Combat Tactics ×3 first (CD 7→4)', tome: { counter: 'rare.painkeeper', min: 3, floor: 0 } },
      { key: 'books', text: 'Fully booked (15 Rare tomes)', tome: { counter: 'rare.painkeeper', min: 15, floor: 3 } },
      { key: 'masteries', text: 'Masteries — Warmaster; no Retribution (Minotaur scrolls)' },
      { key: 'asc', text: 'Potion Keeps: ascend her after Deacon (Lesser/Greater potions only)' },
      { key: 'speed', text: 'Budget Maneater tune: true speed 218–222' },
      { key: 'boots', text: '+16 Speed boots' },
    ],
    notes: [
      '**Rare (26):** Pain Keeper fully booked (15) — her cooldown skill is **A3 Combat Tactics**, 3 tomes take it 7→4, and DWJ wants all her skills booked ([HH Pain Keeper](https://hellhades.com/raid/champions/pain-keeper/)).',
      'Clan Boss openers — Brutal: PK A2, A1, A3 · NM: PK A3, A1, A2 · UNM: PK A3 then A2 (vs Spirit, hold A2 to turn 5).',
      "Stun target rule: Skullcrusher has the highest HP on the team but ≤125% of Pain Keeper's.",
      'Fire Knight: before Wave 2, Pain Keeper (2-hit A1) can fill a slot.',
      MINOTAUR_NOTE,
      'No Counterattack gear/masteries on Ninja or Pain Keeper.',
    ],
  },
  {
    id: 'deacon',
    name: 'Deacon Armstrong',
    short: 'Deacon',
    monogram: 'DA',
    rarity: 'Epic',
    affinity: null,
    wave: 1,
    waveLabel: '1 (Feast)',
    coverage: {
      demonLord: 'Starter',
      chimera: '–',
      hydra: 'K2',
      spider: '✓',
      dragon: '✓',
      fk: '✓',
      ig: '✓',
      arena: '✓',
    },
    tagline: 'The #1 dungeon all-rounder',
    why: [
      '**Deacon is the #1 dungeon all-rounder.** Ayumilove 5★ in all four dungeons plus Clan Boss and Arena; HH CB 10 / Spider 10 ([Ayumilove Deacon](https://ayumilove.net/raid-shadow-legends-deacon-armstrong-skill-mastery-equip-guide/)).',
    ],
    ratings: ['Ayumilove 5★ in all four dungeons + Clan Boss + Arena', 'HH CB 10', 'HH Spider 10'],
    brews: { matched: '132', mismatched: '197' },
    gear: [
      'ACC, SPD, HP%, DEF% — Speed/Accuracy/Perception.',
      'Spider lead: 200+ SPD, 225–250 ACC.',
      '+16 Speed boots (key main-stat piece).',
    ],
    masteries: [SUPPORT_MASTERIES],
    steps: [
      { key: 'cap', text: 'Brew to rank cap (Lv40 if 4★)', status: 'Rank cap' },
      { key: 'feast', text: 'Feast → R6 L1', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'a3', text: 'Epic tomes: A3 ×2 (CD 5→3)', tome: { counter: 'epic.deacon', min: 2, floor: 0 } },
      { key: 'books', text: 'Finish books (13 — A2 Decrease DEF chance to 100%)', tome: { counter: 'epic.deacon', min: 13, floor: 2 } },
      { key: 'asc3', text: 'Potion Keeps: Ascension 3 first (his A3 gains an Extra Turn)' },
      { key: 'masteries', text: 'Masteries (Minotaur scrolls)' },
      { key: 'boots', text: '+16 Speed boots' },
    ],
    notes: [
      'Spider lead: +19% SPD aura, team TM up, enemy TM down.',
      'Arena week-1 lead (+19% SPD).',
      KEEP_OUT_UK,
      MINOTAUR_NOTE,
      "Ascension order: Asc 3 first (Deacon's extra turn), then 5 (Amulet), then 6 (Banner).",
    ],
  },
  {
    id: 'rathalos',
    name: 'Rathalos Blademaster',
    short: 'Rathalos',
    monogram: 'RB',
    rarity: 'Legendary',
    affinity: null,
    wave: 1,
    waveLabel: '1 (chickens)',
    coverage: {
      demonLord: 'UK DPS (175–178)',
      chimera: '✓',
      hydra: '✓',
      spider: '✓ until Kymar',
      dragon: '(✓)',
      fk: '–',
      ig: '–',
      arena: '–',
    },
    tagline: 'Second Clan Boss DPS · Spider/Hydra carry',
    why: [
      '**Rathalos is the second Clan Boss DPS and a Spider/Hydra carry.** His A1 Decrease DEF is unresistable vs bosses, his A2 ignores 100% boss DEF, and he deals +50% vs burned targets ([Ayumilove Rathalos](https://ayumilove.net/raid-shadow-legends-rathalos-blademaster-skill-mastery-equip-guide/)). HH: CB 9 / Hydra 10 / Spider 10 / Dragon 9.',
      RATHALOS_VS_KYMAR,
    ],
    ratings: ['HH CB 9 · Hydra 10 · Spider 10 · Dragon 9', 'Ayumilove Chimera 4/5', 'Weighted score 8.98 (vs Kymar 8.05)'],
    brews: { matched: '160', mismatched: '239' },
    speed: '175–178',
    gear: ['Budget Maneater tune: 100% C.RATE, high C.DMG/ATK.', '+16 C.RATE gloves (key main-stat piece).'],
    masteries: [UK_MASTERIES],
    steps: [
      ...legendaryChickenSteps(),
      { key: 'masteries', text: 'Masteries — Warmaster (Minotaur scrolls)' },
      { key: 'speed', text: 'Budget Maneater tune: true speed 175–178' },
      { key: 'gloves', text: '+16 C.RATE gloves' },
    ],
    notes: [
      "Caveat [My call]: DWJ lists Frozen Banshee and Urogrim (both on your roster) as the DPS options, not Rathalos/Artak. Model the exact team in the DWJ calculator before relying on it; Frozen Banshee is the safe fallback DPS.",
      'Spider flex until Kymar: burst vs burned.',
      MINOTAUR_NOTE,
    ],
  },
  {
    id: 'artak',
    name: 'Artak',
    short: 'Artak',
    monogram: 'AR',
    rarity: 'Legendary',
    affinity: null,
    wave: 1,
    waveLabel: '1 (chickens)',
    coverage: {
      demonLord: 'Starter / Force-day DPS',
      chimera: '–',
      hydra: '✓',
      spider: '✓',
      dragon: '–',
      fk: '–',
      ig: '✓',
      arena: '–',
    },
    tagline: 'The multi-dungeon burner',
    why: [
      '**Artak is the multi-dungeon burner.** HH Hydra/Spider/Dragon/IG 10, CB 9 ([HH Artak](https://hellhades.com/raid/champions/artak/)). AoE HP Burn, burn activation and AoE Decrease ATK; HellHades calls him a top Ice Golem Hard pick ([HH HP Burn guide](https://hellhades.com/best-hp-burn-champions-in-raid-shadow-legends-complete-guide/)).',
    ],
    ratings: ['HH Hydra 10 · Spider 10 · Dragon 10 · IG 10', 'HH CB 9', 'Spider Hard 5★', 'Top Ice Golem Hard pick (HellHades)'],
    brews: { matched: '160', mismatched: '239' },
    speed: '175–178 (Force days)',
    gear: [
      'Spider: 175+ SPD, 225+ ACC.',
      "Don't build damage on Spider burners: keep him on ACC/SPD/HP so spiderlings don't die early.",
    ],
    masteries: [SUPPORT_MASTERIES],
    steps: [
      ...legendaryChickenSteps(),
      { key: 'masteries', text: 'Masteries — Warmaster (boss-damage unit; Minotaur scrolls)' },
      { key: 'spider', text: 'Spider build: 175+ SPD, 225+ ACC (ACC/SPD/HP, not damage)' },
      { key: 'a3', text: 'Reserve Legendary tome toward A3 (4 for 100% burn and CD 4→3)', tome: { counter: 'leg.artakA3', min: 1, floor: 0 } },
    ],
    notes: [
      'Starter Clan Boss debuffer: AoE 50% Decrease ATK, burn activation — your most reliable Decrease ATK.',
      '**Force-affinity days:** take Ninja out and run the standard version with two DPS at 175–178 (Rathalos + Artak).',
      "Artak's burn chance matters less while Gizmak burns every round (burns don't stack).",
      MINOTAUR_NOTE,
    ],
  },
  {
    id: 'skullcrusher',
    name: 'Skullcrusher',
    short: 'Skullcrusher',
    monogram: 'SC',
    rarity: 'Epic',
    affinity: null,
    wave: 2,
    waveLabel: '5★ early, 6★ last',
    coverage: {
      demonLord: 'UK stun target',
      chimera: '–',
      hydra: 'K2',
      spider: '–',
      dragon: '–',
      fk: '✓',
      ig: '–',
      arena: '–',
    },
    tagline: 'Budget Maneater stun target',
    why: [],
    ratings: [],
    brews: { matched: '76 (to 5★ L50; +108 later for R6)', mismatched: '114' },
    speed: '111–118 (121 on NM)',
    gear: [
      "Highest HP on the team but ≤125% of Pain Keeper's; DEF well below everyone else.",
      "DWJ's example is about 1k DEF / 35–40k HP with everyone else at 2k+ DEF / 30–35k HP.",
    ],
    masteries: ['Warmaster; no speed masteries.', UK_MASTERIES],
    steps: [
      { key: 'r5', text: 'To 5★ Lv50: 4 × 4★ chickens plus about 76 matched brews (week 1)', status: '5★ · Lv 50' },
      { key: 'a2', text: 'Epic tome: A2 ×1 (CD 4→3)', tome: { counter: 'epic.skullcrusher', min: 1, floor: 0 } },
      { key: 'books', text: 'Finish books (5 Epic tomes)', tome: { counter: 'epic.skullcrusher', min: 5, floor: 1 } },
      { key: 'masteries', text: 'Masteries — Warmaster; no speed masteries' },
      { key: 'stun', text: 'Stun target: true speed 111–118 (121 on NM), HP/DEF rules met' },
      { key: 'r6', text: 'Wave 2 (last): 5★ → 6★ with 5 crafted 5★ fodder', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60 (+108 matched brews)', status: 'R6 · Lv 60' },
    ],
    notes: [
      'It must never have strong affinity vs the boss — swap it on those days.',
      "Caveat [My call]: DWJ doesn't confirm Skullcrusher's team Counterattack is safe here. Model the exact team in the DWJ calculator before relying on it.",
      'Fire Knight: Team Counterattack + Ally Protection → every ally counter strips hits.',
    ],
  },
  {
    id: 'kymar',
    name: 'Prince Kymar',
    short: 'Kymar',
    monogram: 'KY',
    rarity: 'Legendary',
    affinity: 'Magic',
    wave: 2,
    waveLabel: '2',
    coverage: {
      demonLord: '–',
      chimera: '–',
      hydra: 'K2',
      spider: '✓',
      dragon: '(✓)',
      fk: '–',
      ig: '✓',
      arena: '✓ lead',
    },
    tagline: 'First Wave-2 build · Arena lead',
    why: [RATHALOS_VS_KYMAR],
    ratings: ['HH CB 5', 'HH Spider 10 · Dragon 10 · IG 10 · Arena 10', 'Weighted score 8.05 (vs Rathalos 8.98)'],
    brews: { matched: '160', mismatched: '239' },
    gear: [
      'Spider: SPD/ACC/HP.',
      "Don't build damage on Spider burners: keep Gizmak, Artak and Kymar on ACC/SPD/HP so spiderlings don't die early.",
    ],
    masteries: [SUPPORT_MASTERIES],
    steps: [
      { key: 'lv50', text: 'Brew to Lv50 (5★ cap)', status: '5★ · Lv 50' },
      { key: 'fodder', text: 'Fodder: 1 leftover 5★ chicken + 4 crafted 5★', status: 'Fodder ready' },
      { key: 'rank6', text: 'Rank up to 6★', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'a3', text: 'Legendary tome: A3 ×1 (team cooldown reset 7→6)', tome: { counter: 'leg.kymarA3', min: 1, floor: 0 } },
    ],
    notes: [
      'Spider (Wave 2 flex): team cooldown reset + AoE Sleep on spiderlings.',
      'Arena Wave-2 offense: Kymar lead (+30% SPD in Arena).',
      'Ice Golem Wave 2: Kymar (Magic, IG 10) — TM / cooldown reset.',
    ],
  },
  {
    id: 'udk',
    name: 'Ultimate Deathknight',
    short: 'UDK',
    monogram: 'UD',
    rarity: 'Legendary',
    affinity: null,
    wave: 2,
    waveLabel: '2',
    coverage: {
      demonLord: 'Starter',
      chimera: '✓',
      hydra: '✓',
      spider: '–',
      dragon: '✓',
      fk: '–',
      ig: '✓',
      arena: '–',
    },
    tagline: 'Heal, shield, Decrease ATK',
    why: [],
    ratings: ['HH Dragon 10', 'IG 10'],
    brews: { matched: '160', mismatched: '239' },
    gear: [],
    masteries: [SUPPORT_MASTERIES],
    steps: [
      { key: 'lv50', text: 'Brew to Lv50 (5★ cap)', status: '5★ · Lv 50' },
      { key: 'fodder', text: 'Fodder: 5 crafted 5★', status: 'Fodder ready' },
      { key: 'rank6', text: 'Rank up to 6★', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'a3', text: 'Legendary tomes: A3 ×2 (team shield + heal, CD 5→3)', tome: { counter: 'leg.udkA3', min: 2, floor: 0 } },
    ],
    notes: [
      'Other Decrease ATK options for the starter team: UDK (Wave 2), Sigmund, Toragi, Jareg, Rearguard Sergeant.',
      'Chimera: heal, shield, Decrease ATK, a deliberate low-C.DMG Duel target.',
      'Dragon (Wave 2): AoE Decrease ATK, shield, heal; HH Dragon 10.',
      'Hydra key 1: Artak + UDK cover Decrease ATK and shields vs Wrath.',
      'Kymar A3 + UDK A3 buy three team-wide cooldown levels for 3 tomes.',
    ],
  },
  {
    id: 'seer',
    name: 'Seer',
    short: 'Seer',
    monogram: 'SE',
    rarity: 'Epic',
    affinity: null,
    wave: 2,
    waveLabel: '2',
    coverage: {
      demonLord: '– (weak)',
      chimera: '–',
      hydra: 'K2',
      spider: '–',
      dragon: '✓',
      fk: '✓',
      ig: '✓',
      arena: '✓',
    },
    tagline: 'Waves, Weaken, team C.RATE',
    why: [],
    ratings: ['HH FK 10'],
    brews: { matched: '184', mismatched: '276' },
    gear: [],
    masteries: [SUPPORT_MASTERIES],
    steps: [
      { key: 'lv40', text: 'Brew to Lv40 (4★ cap)', status: '4★ · Lv 40' },
      { key: 'rank5', text: 'Rank up 4→5 with 4 × 4★ units', status: '5★ · Lv 1' },
      { key: 'lv50', text: 'Brew to Lv50', status: '5★ · Lv 50' },
      { key: 'fodder', text: 'Fodder: 5 crafted 5★', status: 'Fodder ready' },
      { key: 'rank6', text: 'Rank up to 6★', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'cd', text: 'Epic tomes: A2 ×1 (4→3) and A3 ×2 (6→4)', tome: { counter: 'epic.seer', min: 3, floor: 0 } },
      { key: 'books', text: 'Finish books (7 Epic tomes)', tome: { counter: 'epic.seer', min: 7, floor: 3 } },
    ],
    notes: [KEEP_OUT_UK, 'Dragon (Wave 2): waves, Weaken, team C.RATE.', 'Ice Golem (Wave 2): waves and minions.'],
  },
  {
    id: 'ruella',
    name: 'Ruella',
    short: 'Ruella',
    monogram: 'RU',
    rarity: 'Epic',
    affinity: null,
    wave: 2,
    waveLabel: '2',
    coverage: {
      demonLord: '–',
      chimera: '(✓)',
      hydra: '–',
      spider: '–',
      dragon: '–',
      fk: '✓',
      ig: '–',
      arena: '–',
    },
    tagline: 'Fire Knight pick with Chimera overlap',
    why: [
      "**Ruella or Criodan for Fire Knight** [My call]: Ruella is HH FK 10 / CB 8 / Chimera 8 and on HellHades' best Chimera epics list ([HH Chimera epics](https://hellhades.com/10-great-epic-champions-for-the-chimera/)). Criodan the Blue (HH FK 8) is better if you later push Fire Knight Hard, where Freeze matters ([HH FK Hard](https://hellhades.com/understanding-fire-knight-hard-mode-mechanics-in-raid-shadow-legends/)), and in Spider/IG. Pick Ruella for Chimera overlap, Criodan for FK Hard.",
    ],
    ratings: ['HH FK 10 · CB 8 · Chimera 8', "On HellHades' best Chimera epics list"],
    brews: { matched: '184', mismatched: '276' },
    gear: [],
    masteries: [SUPPORT_MASTERIES],
    steps: [
      { key: 'lv40', text: 'Brew to Lv40 (4★ cap)', status: '4★ · Lv 40' },
      { key: 'rank5', text: 'Rank up 4→5 with 4 × 4★ units', status: '5★ · Lv 1' },
      { key: 'lv50', text: 'Brew to Lv50', status: '5★ · Lv 50' },
      { key: 'fodder', text: 'Fodder: 5 crafted 5★', status: 'Fodder ready' },
      { key: 'rank6', text: 'Rank up to 6★', status: 'R6 · Lv 1' },
      { key: 'lv60', text: 'Brew to 60', status: 'R6 · Lv 60' },
      { key: 'cd', text: 'Epic tomes: A3 ×3 (6→3)', tome: { counter: 'epic.ruella', min: 3, floor: 0 } },
      { key: 'books', text: 'Finish books (13 Epic tomes)', tome: { counter: 'epic.ruella', min: 13, floor: 3 } },
    ],
    notes: [
      'Fire Knight: 3-hit A1/A2, Decrease DEF, team +20% TM and C.RATE.',
      'Chimera slot 5 after UDK: Decrease DEF / Weaken / Decrease SPD.',
    ],
  },
]

export const championById = Object.fromEntries(champions.map((c) => [c.id, c])) as Record<ChampionId, Champion>

/** Guide masteries notes that apply to everyone. */
export const masteryFootnote = GIANT_SLAYER

// "Deliberately not built early" and other roster names the guide mentions.
export const notBuiltEarly = {
  label: 'My call',
  text: "**Deliberately not built early** [My call]: Skeletor (HH 6, weakest Legendary here), Chronicler Adelyn (a Sand Devil specialist, though Ayumilove rates her Chimera 5/5), Aleksandr, Leminisi, Loki (CB 4), Sun Wukong (CB 5), Alice, Michelangelo, Ezio, Xenomorph, Dorothy, Graal and Visix. Several are good (Michelangelo, Dorothy and Ezio are HH 9), but each would be a 14th+ build. **Loki** (Hydra Block Buffs) and **Graal** (Spider) are the first luxury adds once the 13 are done.",
  names: [
    { name: 'Skeletor', note: 'HH 6, weakest Legendary here' },
    { name: 'Chronicler Adelyn', note: 'a Sand Devil specialist, though Ayumilove rates her Chimera 5/5' },
    { name: 'Aleksandr' },
    { name: 'Leminisi' },
    { name: 'Loki', note: 'CB 4' },
    { name: 'Sun Wukong', note: 'CB 5' },
    { name: 'Alice' },
    { name: 'Michelangelo', note: 'HH 9' },
    { name: 'Ezio', note: 'HH 9' },
    { name: 'Xenomorph' },
    { name: 'Dorothy', note: 'HH 9' },
    { name: 'Graal' },
    { name: 'Visix' },
  ],
}

export interface BenchOption {
  name: string
  role: string
  text: string
}

// Alternatives and luxury adds named in the guide, quoted from where they appear.
export const benchOptions: BenchOption[] = [
  {
    name: 'Loki',
    role: 'First luxury add · Hydra',
    text: '**Loki** (Block Buffs, one-ally Veil, +60 ACC aura) is the best single Hydra add later.',
  },
  { name: 'Graal', role: 'First luxury add · Spider', text: '**Loki** (Hydra Block Buffs) and **Graal** (Spider) are the first luxury adds once the 13 are done.' },
  {
    name: 'Criodan the Blue',
    role: 'Fire Knight Hard alternative',
    text: 'Criodan the Blue (HH FK 8) is better if you later push Fire Knight Hard, where Freeze matters, and in Spider/IG. Pick Ruella for Chimera overlap, Criodan for FK Hard.',
  },
  {
    name: 'Frozen Banshee',
    role: 'Safe fallback DPS (Budget Maneater)',
    text: 'DWJ lists Frozen Banshee and Urogrim (both on your roster) as the DPS options … Frozen Banshee is the safe fallback DPS.',
  },
  { name: 'Urogrim', role: 'DWJ-listed DPS option', text: 'DWJ lists Frozen Banshee and Urogrim (both on your roster) as the DPS options, not Rathalos/Artak.' },
  {
    name: 'Chronicler Adelyn',
    role: 'Strongest unused Chimera option',
    text: 'Chronicler Adelyn (Ayumilove Chimera 5/5) is the strongest unused Chimera option if you want a 14th build.',
  },
  {
    name: 'Fenshi · Alure · Fodbor · Ronda',
    role: 'Cheap Fire Knight multi-hitters',
    text: "If you can't break 12 hits at 21–25, add one cheap multi-hitter at 5★ Lv50 instead of a 6★: Fenshi, Alure, Fodbor or Ronda (all Ayumilove FK 5★).",
  },
  { name: 'Fenax', role: 'Ice Golem (optional)', text: 'Fenax (Block Revive) is optional.' },
  {
    name: 'Sigmund · Toragi · Jareg · Rearguard Sergeant',
    role: 'Other Decrease ATK options',
    text: 'Other Decrease ATK options: UDK (Wave 2), Sigmund, Toragi, Jareg, Rearguard Sergeant.',
  },
  {
    name: 'Toragi · Ursala · Criodan',
    role: 'Future Epic tome builds',
    text: "That's ~49 tomes; the ~71 left wait for future builds (Toragi, Ursala, Criodan).",
  },
  { name: 'Bellower', role: 'Campaign farmer (Rare)', text: 'Bellower is a top 12-3 campaign farmer.' },
]

/** "Why these, in priority order" — the eight bullets, in the guide's order. */
export const whyList: string[] = [
  championById.ninja.why[0],
  championById.maneater.why[0],
  championById.rathalos.why[0],
  championById.artak.why[0],
  championById.deacon.why[0],
  RATHALOS_VS_KYMAR,
  championById.ruella.why[0],
  MYTHICALS_WHY,
]
