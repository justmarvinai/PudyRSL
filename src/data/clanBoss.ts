import type { ChampionId } from './types'

// Section 3 "Clan Boss: Demon Lord, Hydra, Chimera (priority #1)".

export const clanBossIntro =
  "Run a free starter team now, then switch to DeadwoodJedi's **Budget Maneater Unkillable (Ninja variant)** — the only documented unkillable tune your roster can build, rated 2 keys on Ultra-Nightmare when fully geared ([DWJ](https://deadwoodjedi.com/speed-tunes/budget-maneater-unkillable-ninja/))."

export const demonLordRules = {
  label: 'Sourced',
  immunities: ['Stun', 'Freeze', 'Sleep', 'Decrease SPD', 'Provoke', 'Fear'],
  items: [
    'Immune to Stun, Freeze, Sleep, Decrease SPD, Provoke and Fear. Only **one** HP Burn counts at a time. From boss turn 50 it ignores Unkillable and Block Damage.',
    'For non-unkillable teams, Decrease ATK is the most important debuff; Weaken beats Decrease DEF early, Decrease DEF wins on NM/UNM ([HH CB guide](https://hellhades.com/ultimate-clan-boss-guide-everything-you-need-to-know/)). Decrease ATK is useless once you are unkillable ([DWJ](https://deadwoodjedi.com/clan-boss-its-easy-if-you-know-how/)).',
  ],
}

export type DifficultyKey = 'easy' | 'normal' | 'hard' | 'brutal' | 'nm' | 'unm'

export const difficultyNames: Record<DifficultyKey, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  brutal: 'Brutal',
  nm: 'Nightmare',
  unm: 'Ultra-Nightmare',
}

export const difficultyOrder: DifficultyKey[] = ['easy', 'normal', 'hard', 'brutal', 'nm', 'unm']

// Requirements table (DWJ + Ayumilove), top to bottom as in the guide.
export const difficultyRequirements = {
  rows: [
    { key: 'unm' as DifficultyKey, speed: '190+', accDwj: '230+', accAyu: '220' },
    { key: 'nm' as DifficultyKey, speed: '170+', accDwj: '200+', accAyu: '170' },
    { key: 'brutal' as DifficultyKey, speed: '160+', accDwj: '170+', accAyu: '140' },
    { key: 'hard' as DifficultyKey, speed: '150+', accDwj: '150+', accAyu: '–' },
  ],
  sources:
    'Sources: [DWJ](https://deadwoodjedi.com/clan-boss-its-easy-if-you-know-how/), [Ayumilove Demon Lord](https://ayumilove.net/raid-shadow-legends-champion-ranking-in-clan-boss/).',
}

export interface StarterSlot {
  slot: string
  champ: string
  ids: ChampionId[]
  role: string
  notes: string
}

export const starterTeam = {
  title: 'Step 1 — Starter team (Day 1 to about week 3)',
  label: 'My call',
  slots: [
    {
      slot: 'Leader',
      champ: 'Gizmak',
      ids: ['gizmak'],
      role: '+27% C.RATE aura, free HP Burn every round, team +30% C.RATE/C.DMG/SPD',
      notes: 'Get him to 100% C.RATE so his burns become unresistable',
    },
    { slot: 'DPS', champ: 'Ninja', ids: ['ninja'], role: 'Main damage; A2 activates burns vs bosses', notes: 'Set A3 as first AI priority' },
    { slot: 'DPS', champ: 'Rathalos', ids: ['rathalos'], role: 'Unresistable Decrease DEF on bosses, +50% vs burned', notes: '' },
    { slot: 'Debuff', champ: 'Artak', ids: ['artak'], role: 'AoE 50% Decrease ATK, burn activation', notes: 'Your most reliable Decrease ATK' },
    {
      slot: 'Flex',
      champ: 'Maneater or Galleus',
      ids: ['maneater', 'galleus'],
      role: 'Maneater: Unkillable/Block Debuffs on demand. Galleus (Base): 100% boss reflect + self-heal, team Revive on Death, +60% DEF',
      notes: 'Use Galleus if you die too early',
    },
  ] as StarterSlot[],
  after:
    'All five are Wave-1 6★s, so this costs nothing extra. Ayumilove places teams like this at Easy–Hard, reaching Brutal with tankier gear ([Ayumilove DL](https://ayumilove.net/raid-shadow-legends-champion-ranking-in-clan-boss/)). Other Decrease ATK options: UDK (Wave 2), Sigmund, Toragi, Jareg, Rearguard Sergeant.',
}

export type TuneSlotKey = 'unkillable' | 'cooldown' | 'keydps' | 'dps' | 'stun'

export interface TuneSlot {
  key: TuneSlotKey
  slot: string
  champ: string
  ids: ChampionId[]
  speed: string
  min: number
  max: number
  /** "(121 on NM)" — upper bound on Nightmare for the stun target. */
  nmMax?: number
  books: string
  gear: string
  masteries: string
}

export const ukTeam = {
  title: 'Step 2 — Budget Maneater Unkillable, Ninja variant (weeks 2–6)',
  label: 'Sourced tune; slot fills partly My call',
  slots: [
    {
      key: 'unkillable',
      slot: 'Unkillable',
      champ: 'Maneater',
      ids: ['maneater'],
      speed: '240–241',
      min: 240,
      max: 241,
      books: 'A3 ×2 (CD 7→5)',
      gear: 'Speed set, 100% C.RATE, ATK/C.DMG',
      masteries: 'Warmaster',
    },
    {
      key: 'cooldown',
      slot: 'Cooldown support',
      champ: 'Pain Keeper',
      ids: ['painkeeper'],
      speed: '218–222',
      min: 218,
      max: 222,
      books: 'Fully booked (A3 first)',
      gear: 'Speed set, 100% C.RATE; no Counterattack gear',
      masteries: 'Warmaster; no Retribution',
    },
    {
      key: 'keydps',
      slot: 'Key DPS',
      champ: 'Ninja',
      ids: ['ninja'],
      speed: '161–165',
      min: 161,
      max: 165,
      books: 'A3 fully booked (4), A2 next',
      gear: 'Damage stats; no Counterattack gear or masteries',
      masteries: 'Warmaster',
    },
    {
      key: 'dps',
      slot: 'DPS',
      champ: 'Rathalos (Artak on Force days)',
      ids: ['rathalos', 'artak'],
      speed: '175–178',
      min: 175,
      max: 178,
      books: '–',
      gear: '100% C.RATE, high C.DMG/ATK',
      masteries: 'Warmaster',
    },
    {
      key: 'stun',
      slot: 'Stun target',
      champ: 'Skullcrusher (5★ is fine)',
      ids: ['skullcrusher'],
      speed: '111–118 (121 on NM)',
      min: 111,
      max: 118,
      nmMax: 121,
      books: 'A2 ×1',
      gear: "Highest HP on the team but ≤125% of Pain Keeper's; DEF well below everyone else",
      masteries: 'Warmaster; no speed masteries',
    },
  ] as TuneSlot[],
  rulesIntro:
    'Tune rules from DWJ ([Ninja variant](https://deadwoodjedi.com/speed-tunes/budget-maneater-unkillable-ninja/), [standard](https://deadwoodjedi.com/speed-tunes/budget-maneater-unkillable/), [build notes](https://deadwoodjedi.com/new-budget-unkillable/)):',
  rules: [
    'No Relentless set. Lifedrinker and Grim Resolve on non-Pain Keeper slots; no Heart of Glory. Re-check speeds if you take Lore of Steel. Aim for tier-6 masteries on all five.',
    "**Stun target:** DWJ's example is about 1k DEF / 35–40k HP with everyone else at 2k+ DEF / 30–35k HP. It must never have strong affinity vs the boss — swap it on those days.",
    '**Force-affinity days:** take Ninja out and run the standard version with two DPS at 175–178 (Rathalos + Artak).',
    '**Later blessings:** 1 Brimstone, 1 Cruelty, rest Phantom Touch.',
    '**Keep out of this team:** Gizmak, Deacon, Galleus, Seer, Apothecary, High Khatun — they change turn timing or strip buffs.',
  ],
  openersText:
    '**Openers.** Brutal: Maneater A2, A1, A3 · PK A2, A1, A3 · Ninja A2, A3. NM: Maneater A2, A3 · PK A3, A1, A2 · Ninja A3, A2. UNM: Maneater A3 · PK A3 then A2 (vs Spirit, hold A2 to turn 5) · Ninja A3 then A2, then full auto.',
  caveat:
    "**Caveat** [My call]: DWJ lists Frozen Banshee and Urogrim (both on your roster) as the DPS options, not Rathalos/Artak, and doesn't confirm Skullcrusher's team Counterattack is safe here. Model the exact team in the DWJ calculator before relying on it; Frozen Banshee is the safe fallback DPS.",
  keepOut: ['Gizmak', 'Deacon', 'Galleus', 'Seer', 'Apothecary', 'High Khatun'],
  blessings: ['1 Brimstone', '1 Cruelty', 'rest Phantom Touch'],
}

export interface OpenerLine {
  champ: string
  id: ChampionId
  seq: string[]
  note?: string
}

export const openers: { key: 'brutal' | 'nm' | 'unm'; label: string; lines: OpenerLine[]; after?: string }[] = [
  {
    key: 'brutal',
    label: 'Brutal',
    lines: [
      { champ: 'Maneater', id: 'maneater', seq: ['A2', 'A1', 'A3'] },
      { champ: 'Pain Keeper', id: 'painkeeper', seq: ['A2', 'A1', 'A3'] },
      { champ: 'Ninja', id: 'ninja', seq: ['A2', 'A3'] },
    ],
  },
  {
    key: 'nm',
    label: 'Nightmare',
    lines: [
      { champ: 'Maneater', id: 'maneater', seq: ['A2', 'A3'] },
      { champ: 'Pain Keeper', id: 'painkeeper', seq: ['A3', 'A1', 'A2'] },
      { champ: 'Ninja', id: 'ninja', seq: ['A3', 'A2'] },
    ],
  },
  {
    key: 'unm',
    label: 'Ultra-Nightmare',
    lines: [
      { champ: 'Maneater', id: 'maneater', seq: ['A3'] },
      { champ: 'Pain Keeper', id: 'painkeeper', seq: ['A3', 'A2'], note: 'then A2 (vs Spirit, hold A2 to turn 5)' },
      { champ: 'Ninja', id: 'ninja', seq: ['A3', 'A2'], note: 'then A2' },
    ],
    after: 'then full auto',
  },
]

export const difficultyTimeline = {
  label: 'My estimate from sourced thresholds',
  rows: [
    {
      when: 'Days 1–7',
      days: [1, 7] as [number, number | null],
      team: 'Starter',
      difficulty: 'Hard → Brutal',
      why: 'Brutal needs ~160 SPD / 140–170 ACC; books and shards start there',
    },
    {
      when: 'Weeks 2–6',
      days: [8, 42] as [number, number | null],
      team: 'Budget Maneater',
      difficulty: 'Brutal (1 key) → NM (2 keys)',
      why: "Author's expected keys ([DWJ](https://deadwoodjedi.com/new-budget-unkillable/))",
    },
    {
      when: 'Months 2–3',
      days: [29, null] as [number, number | null],
      team: 'Budget Maneater + better damage gear and masteries',
      difficulty: 'UNM (2–4 keys)',
      why: 'Needs true 240/218 speeds plus damage',
    },
  ],
}

export const cbKeys = {
  total: 133,
  label: 'Sourced mechanics → My call plan',
  intro:
    "Rewards are **one set of chests per day, based on that day's total damage**, so dumping all 133 keys in one day earns a single day's chest ([Plarium DL](https://raid-support.plarium.com/hc/en-us/articles/360014645900-Guide-Demon-Lord)). DWJ's top-chest thresholds (from 2022): Easy 1.11M, Normal 3.63M, Hard 11.64M, Brutal 21.69M, NM 39.16M, UNM 70.27M ([DWJ top chest](https://deadwoodjedi.com/how-to-get-top-chest-in-clan-boss/)).",
  thresholds: {
    easy: 1_110_000,
    normal: 3_630_000,
    hard: 11_640_000,
    brutal: 21_690_000,
    nm: 39_160_000,
    unm: 70_270_000,
  } as Record<DifficultyKey, number>,
  bullets: [
    '**Each day:** use your free keys plus just enough stored keys to cross the next chest threshold at the highest difficulty you survive. Keys needed = threshold ÷ damage per key, minus free keys.',
    '**Example:** a starter team doing ~5M per Brutal key needs ~5 keys for Brutal top chest → 2–3 stored keys per day.',
    '**Pacing:** 133 keys last roughly 30–60 days of bonus hits, covering the whole Brutal → NM climb when extra chests matter most.',
    "**Don't waste regen:** you hold at most 2 natural keys, refreshed every 6 hours.",
  ],
  maxNaturalKeys: 2,
}

export const hydra = {
  facts: ['Level 45', '3 keys/week', '6 champions per key', 'Each champion once per week'],
  label: 'Sourced mechanics; team My call',
  heads: [
    { names: ['Decay'], counter: 'Provoke' },
    { names: ['Torment'], counter: 'Perfect Veil / fear cleanse' },
    { names: ['Mischief', 'Suffering', 'Blight'], counter: "Block Buffs (HP Burn also cancels Blight's Poison Cloud)" },
    { names: ['Wrath'], counter: 'Decrease ATK, shields, revives' },
  ],
  countersText:
    "Head counters: **Decay** → Provoke · **Torment** → Perfect Veil / fear cleanse · **Mischief / Suffering / Blight** → Block Buffs (HP Burn also cancels Blight's Poison Cloud) · **Wrath** → Decrease ATK, shields, revives ([HH getting started](https://hellhades.com/getting-started-with-hydra-clan-boss-in-raid-shadow-legends/), [HH Block Buffs](https://hellhades.com/best-block-buffs-champions-for-hydra-in-raid-shadow-legends/)). HP Burn is capped at 20k per tick; Blight takes double burn damage ([Ayumilove Hydra](https://ayumilove.net/raid-shadow-legends-hydra-clan-boss-guide/)).",
  burnNote:
    'HP Burn is capped at 20k per tick; Blight takes double burn damage ([Ayumilove Hydra](https://ayumilove.net/raid-shadow-legends-hydra-clan-boss-guide/)).',
  keys: [
    {
      key: 'Key 1',
      team: 'Galleus (Base), Gizmak, Ninja, Rathalos, Artak, Ultimate Deathknight',
      ids: ['galleus', 'gizmak', 'ninja', 'rathalos', 'artak', 'udk'] as ChampionId[],
      roles:
        "Galleus Provokes Decay and gives team Revive on Death; Gizmak's unresistable burn counters Blight; Artak + UDK cover Decrease ATK and shields vs Wrath; Ninja + Rathalos deal damage",
    },
    {
      key: 'Keys 2–3',
      team: 'Maneater, Pain Keeper, Deacon, Kymar, Seer, Skullcrusher/Ruella',
      ids: ['maneater', 'painkeeper', 'deacon', 'kymar', 'seer', 'skullcrusher', 'ruella'] as ChampionId[],
      roles: 'Whatever is built; accept lower chests',
    },
  ],
  notes: [
    '**Gap:** no roster champion gives team-wide Perfect Veil or a fear cleanse, so Torment is your weak head. **Loki** (Block Buffs, one-ally Veil, +60 ACC aura) is the best single Hydra add later.',
    "**Don't rely on Gizmak's Taunt** to stop digestion; the 2024 rework reportedly removed that.",
    'Chest floors: Normal ~1.67M, Hard ~5.1M ([Ayumilove Hydra](https://ayumilove.net/raid-shadow-legends-hydra-clan-boss-guide/)). Start on Normal.',
  ],
}

export const chimera = {
  facts: ['Level 33', '2 keys/week', '5 champions', 'Up to 65 boss turns'],
  label: 'Sourced mechanics; team My call',
  cycle: ['Ultimate', 'Ram', 'Ultimate', 'Lion', 'Ultimate', 'Viper', 'Ultimate'],
  cycleText:
    'Forms cycle every 5 turns: Ultimate → Ram → Ultimate → Lion → Ultimate → Viper → Ultimate. **Ram** duels your lowest-C.DMG champion; **Lion** marks your highest-DEF champion, ignores Shield/Unkillable/Block Damage, but takes 5× Reflect damage; **Viper** stacks Necrosis per death, cleared by revives; **Ultimate** takes less damage while you keep buffs up ([Ayumilove Chimera](https://ayumilove.net/raid-shadow-legends-chimera-clan-boss-guide/), [BlueStacks Chimera](https://www.bluestacks.com/blog/game-guides/raid-shadow-legends/rsl-chimera-guide-en.html)).',
  forms: [
    { form: 'Ultimate', text: 'takes less damage while you keep buffs up' },
    { form: 'Ram', text: 'duels your lowest-C.DMG champion' },
    { form: 'Lion', text: 'marks your highest-DEF champion, ignores Shield/Unkillable/Block Damage, but takes 5× Reflect damage' },
    { form: 'Viper', text: 'stacks Necrosis per death, cleared by revives' },
  ],
  sources:
    '[Ayumilove Chimera](https://ayumilove.net/raid-shadow-legends-chimera-clan-boss-guide/), [BlueStacks Chimera](https://www.bluestacks.com/blog/game-guides/raid-shadow-legends/rsl-chimera-guide-en.html)',
  team: [
    {
      slot: '1',
      champ: 'Galleus (Base)',
      ids: ['galleus'] as ChampionId[],
      why: 'Likely Lion target (very high DEF); 100% boss reflect + self-heal; team Revive on Death clears Viper stacks',
    },
    { slot: '2', champ: 'Gizmak', ids: ['gizmak'] as ChampionId[], why: 'Team C.RATE/C.DMG/SPD buffs keep buffs up; free burn' },
    { slot: '3', champ: 'Ninja', ids: ['ninja'] as ChampionId[], why: 'Ayumilove Chimera 5/5' },
    { slot: '4', champ: 'Rathalos', ids: ['rathalos'] as ChampionId[], why: 'Chimera 4/5; unresistable Decrease DEF on bosses' },
    {
      slot: '5',
      champ: 'Ultimate Deathknight (Wave 2) → Ruella',
      ids: ['udk', 'ruella'] as ChampionId[],
      why: 'UDK: heal, shield, Decrease ATK, a deliberate low-C.DMG Duel target. Ruella: Decrease DEF / Weaken / Decrease SPD',
    },
  ],
  after:
    'Chronicler Adelyn (Ayumilove Chimera 5/5) is the strongest unused Chimera option if you want a 14th build. Start on **Easy** (lowest milestone ~900K). Chimera is also the only source of the Mythical Embrys ([HH Chimera](https://hellhades.com/raid/boss-guide/chimera/)).',
}
