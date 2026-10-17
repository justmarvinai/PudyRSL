// Section 2 "Phased roadmap" of rsl_data.md. Task text is verbatim; subtasks
// only split out the actions a task already names, and link them to the same
// progress used elsewhere (champion steps, tome counters, stages, gems).

export type CheckRef = { flag: string } | { num: string; min: number; floor?: number }

export interface Subtask {
  label: string
  refs: CheckRef[]
}

export interface RoadmapTask {
  id: string
  text: string
  /** When set, the task's own checkbox mirrors these refs. */
  refs?: CheckRef[]
  subtasks?: Subtask[]
  to?: string
}

export interface Phase {
  id: 'day1' | 'week1' | 'weeks2to4' | 'month2'
  title: string
  short: string
  /** Inclusive day range from the start date; null end = open-ended. */
  days: [number, number | null]
  ordered?: boolean
  tasks: RoadmapTask[]
}

const champSteps = (id: string, keys: string[]): CheckRef[] => keys.map((k) => ({ flag: `ch.${id}.${k}` }))

export const roadmapIntro =
  'Day 1 builds the 8; Weeks 1–4 farm Speed gear and climb Clan Boss to Brutal; Month 2+ pushes UNM, stage 25 dungeons, Hydra and Chimera.'

export const phases: Phase[] = [
  {
    id: 'day1',
    title: 'Day 1 checklist (in this order)',
    short: 'Day 1',
    days: [1, 1],
    ordered: true,
    tasks: [
      {
        id: 'rm.d1.clan',
        text: '**Join an active clan that already kills high-tier Demon Lord.** Demon Lord, Hydra and Chimera all need a clan, and difficulty tiers unlock clan-wide ([Plarium Demon Lord guide](https://raid-support.plarium.com/hc/en-us/articles/360014645900-Guide-Demon-Lord)).',
        to: '/clan-boss',
      },
      {
        id: 'rm.d1.barrel',
        text: "**XP Barrel on Gizmak.** He starts at Rank 6, Level 1; the Barrel maxes a champion's level for its current rank, worth about 2.0M XP on a fresh R6 ([Plarium Tavern](https://raid-support.plarium.com/hc/en-us/articles/360014648380-The-Tavern)).",
        refs: champSteps('gizmak', ['barrel']),
        to: '/champions/gizmak',
      },
      {
        id: 'rm.d1.galleus',
        text: '**Brew Galleus to 60 with about 108 Force brews.** He is Force affinity, so each brew gives 18,750 XP. Use the Instant Brew Upgrade screen with its affinity filter ([Plarium Brew Upgrade](https://raid-support.plarium.com/hc/en-us/articles/22806729480348-Guide-Brew-Upgrade)).',
        refs: champSteps('galleus', ['brew']),
        to: '/champions/galleus',
      },
      {
        id: 'rm.d1.gemmine',
        text: '**Buy the Gem Mine (3 × 500 = 1,500 gems).** 15 gems/day, pays back in about 100 days ([HH Gem Mine](https://hellhades.com/raid-shadow-legends-is-the-gem-mine-worth-it-in-2022/)).',
        refs: [{ flag: 'gem.gemmine' }],
        to: '/resources/gems',
      },
      {
        id: 'rm.d1.feasts',
        text: '**Feasts:** brew Maneater and Deacon to their rank cap (Lv40 if 4★) and Pain Keeper to hers (Lv30 if 3★). Use one Feast on each (→ R6 L1), then brew all three to 60.',
        subtasks: [
          { label: 'Maneater → Feast → 60', refs: champSteps('maneater', ['cap', 'feast', 'lv60']) },
          { label: 'Deacon → Feast → 60', refs: champSteps('deacon', ['cap', 'feast', 'lv60']) },
          { label: 'Pain Keeper → Feast → 60', refs: champSteps('painkeeper', ['cap', 'feast', 'lv60']) },
        ],
        to: '/rank-up',
      },
      {
        id: 'rm.d1.chickens',
        text: '**Chickens:** brew Ninja, Artak and Rathalos to Lv50, rank each up with 5 × 5★ chickens (15 of your 16), then brew to 60.',
        subtasks: [
          { label: 'Ninja → R6 → 60', refs: champSteps('ninja', ['lv50', 'rank6', 'lv60']) },
          { label: 'Artak → R6 → 60', refs: champSteps('artak', ['lv50', 'rank6', 'lv60']) },
          { label: 'Rathalos → R6 → 60', refs: champSteps('rathalos', ['lv50', 'rank6', 'lv60']) },
        ],
        to: '/rank-up',
      },
      {
        id: 'rm.d1.tomes',
        text: '**Tomes:** Legendary → Ninja A3 ×4, Ninja A2 ×5. Epic → Maneater A3 ×2, Deacon A3 ×2, then finish both. Rare → Pain Keeper A3 ×3 first, then all of her (15). Details in section 6.',
        subtasks: [
          { label: 'Ninja A3 ×4', refs: [{ num: 'tome.leg.ninjaA3', min: 4, floor: 0 }] },
          { label: 'Ninja A2 ×5', refs: [{ num: 'tome.leg.ninjaA2', min: 5, floor: 0 }] },
          { label: 'Maneater A3 ×2', refs: [{ num: 'tome.epic.maneater', min: 2, floor: 0 }] },
          { label: 'Deacon A3 ×2', refs: [{ num: 'tome.epic.deacon', min: 2, floor: 0 }] },
          {
            label: 'Finish both (Maneater 11, Deacon 13)',
            refs: [
              { num: 'tome.epic.maneater', min: 11, floor: 2 },
              { num: 'tome.epic.deacon', min: 13, floor: 2 },
            ],
          },
          { label: 'Pain Keeper A3 ×3', refs: [{ num: 'tome.rare.painkeeper', min: 3, floor: 0 }] },
          { label: 'Pain Keeper all 15', refs: [{ num: 'tome.rare.painkeeper', min: 15, floor: 3 }] },
        ],
        to: '/resources/tomes',
      },
      {
        id: 'rm.d1.masteries',
        text: '**Instant masteries (800 gems each) on Gizmak and Ninja** — your carry/farmer and your Clan Boss damage ([HH gems vs Minotaur](https://hellhades.com/gems-vs-farming-minotaurs-labyrinth/)).',
        subtasks: [
          { label: 'Gizmak (800 gems)', refs: [{ flag: 'ch.gizmak.masteries' }, { flag: 'gem.mast-gizmak' }] },
          { label: 'Ninja (800 gems)', refs: [{ flag: 'ch.ninja.masteries' }, { flag: 'gem.mast-ninja' }] },
        ],
        to: '/resources/gems',
      },
      {
        id: 'rm.d1.gear',
        text: '**Gear:** press Auto-Equip (added in 11.50) for a baseline ([Ayumilove 2026 patches](https://ayumilove.net/raid-shadow-legends-patch-notes-2026/)), then hand-place Speed boots, C.RATE gloves and ACC chests on supports and debuffers ([HH Nub tips](https://hellhades.com/nubs-top-50-tips-for-new-players-in-raid-shadow-legends/)).',
        subtasks: [
          { label: 'Auto-Equip baseline', refs: [{ flag: 'rm.d1.gear.auto' }] },
          { label: 'Hand-place Speed boots, C.RATE gloves, ACC chests', refs: [{ flag: 'rm.d1.gear.hand' }] },
        ],
      },
      {
        id: 'rm.d1.loops',
        text: '**Start daily loops:** Clan Boss with the starter team (section 3), Classic Arena for medals, campaign push with Galleus (Alt form clears waves) and Gizmak to raise account level.',
        to: '/',
      },
    ],
  },
  {
    id: 'week1',
    title: 'Week 1',
    short: 'Week 1',
    days: [2, 7],
    tasks: [
      {
        id: 'rm.w1.skull',
        text: '**Skullcrusher to 5★ Lv50** as the stun target: 4 × 4★ chickens plus about 76 matched brews; 1 Epic tome on his A2 (CD 4→3) ([HH Skullcrusher](https://hellhades.com/raid/champions/skullcrusher/)).',
        subtasks: [
          { label: '5★ Lv50 (4 × 4★ chickens, ~76 brews)', refs: champSteps('skullcrusher', ['r5']) },
          { label: 'A2 ×1 Epic tome', refs: [{ num: 'tome.epic.skullcrusher', min: 1, floor: 0 }] },
        ],
        to: '/champions/skullcrusher',
      },
      {
        id: 'rm.w1.keeps',
        text: '**Potion Keeps:** ascend Deacon to Asc 3 first (his A3 gains an Extra Turn) ([HH ascension](https://hellhades.com/raid/guide-to-champion-ascension/)), then Pain Keeper (Lesser/Greater potions only), Maneater, Ninja.',
        subtasks: [
          { label: 'Deacon → Asc 3', refs: champSteps('deacon', ['asc3']) },
          { label: 'Pain Keeper', refs: champSteps('painkeeper', ['asc']) },
          { label: 'Maneater', refs: champSteps('maneater', ['asc']) },
          { label: 'Ninja', refs: champSteps('ninja', ['asc']) },
        ],
      },
      {
        id: 'rm.w1.dragon',
        text: '**Dragon:** climb with Maneater, Deacon, Ninja, Rathalos, Galleus. Farm Speed sets above everything else; HellHades calls Speed gear critical on a fresh account ([HH Project Zero](https://hellhades.com/project-zero-my-first-two-days-on-a-fresh-raid-account/)).',
        to: '/dungeons/dragon',
      },
      {
        id: 'rm.w1.minotaur',
        text: '**Minotaur:** climb toward stage 15 for mastery scrolls (Maneater, Pain Keeper, Rathalos, Deacon, Artak).',
        to: '/resources/masteries',
      },
      {
        id: 'rm.w1.spider',
        text: '**Spider 10:** accessories and silver.',
        refs: [{ num: 'stage.spider', min: 10 }],
        to: '/dungeons/spider',
      },
      {
        id: 'rm.w1.cb',
        text: '**Clan Boss:** push the starter team to Brutal — books and shards only drop from Brutal up ([DWJ first CB team](https://deadwoodjedi.com/?p=3542)).',
        to: '/clan-boss',
      },
    ],
  },
  {
    id: 'weeks2to4',
    title: 'Weeks 2–4',
    short: 'Weeks 2–4',
    days: [8, 28],
    tasks: [
      {
        id: 'rm.w2.tune',
        text: '**Gear the Budget Maneater tune:** Maneater 240–241, Pain Keeper 218–222, Ninja 161–165, Rathalos 175–178, Skullcrusher 111–118. Check every build in the DeadwoodJedi calculator, then switch to the tune on Brutal.',
        subtasks: [
          { label: 'Maneater 240–241', refs: champSteps('maneater', ['speed']) },
          { label: 'Pain Keeper 218–222', refs: champSteps('painkeeper', ['speed']) },
          { label: 'Ninja 161–165', refs: champSteps('ninja', ['speed']) },
          { label: 'Rathalos 175–178', refs: champSteps('rathalos', ['speed']) },
          { label: 'Skullcrusher 111–118', refs: champSteps('skullcrusher', ['stun']) },
          { label: 'Check every build in the DWJ calculator', refs: [{ flag: 'rm.w2.tune.dwj' }] },
          { label: 'Switch to the tune on Brutal', refs: [{ flag: 'rm.w2.tune.switch' }] },
        ],
        to: '/clan-boss/demon-lord',
      },
      {
        id: 'rm.w2.wave2',
        text: '**Build Wave 2 in order:** Kymar → Ultimate Deathknight → Seer → Ruella → Skullcrusher 6★ (math in section 5).',
        subtasks: [
          { label: 'Prince Kymar', refs: champSteps('kymar', ['lv60']) },
          { label: 'Ultimate Deathknight', refs: champSteps('udk', ['lv60']) },
          { label: 'Seer', refs: champSteps('seer', ['lv60']) },
          { label: 'Ruella', refs: champSteps('ruella', ['lv60']) },
          { label: 'Skullcrusher 6★', refs: champSteps('skullcrusher', ['r6']) },
        ],
        to: '/rank-up',
      },
      {
        id: 'rm.w2.dungeons',
        text: '**Dungeons:** Spider and Dragon toward stage 20 (the efficiency sweet spot); start Fire Knight and Ice Golem at 10+.',
        subtasks: [
          { label: 'Spider stage 20', refs: [{ num: 'stage.spider', min: 20 }] },
          { label: 'Dragon stage 20', refs: [{ num: 'stage.dragon', min: 20 }] },
          { label: 'Fire Knight 10+', refs: [{ num: 'stage.fk', min: 10 }] },
          { label: 'Ice Golem 10+', refs: [{ num: 'stage.ig', min: 10 }] },
        ],
        to: '/dungeons',
      },
      {
        id: 'rm.w2.unlocks',
        text: '**Unlocks:** account level 33 → Chimera on Easy; 35 → Tag Team Arena and Advanced Quests; 40 → Doom Tower and +16 artifacts ([allthings.how](https://allthings.how/raid-shadow-legends-what-to-do-after-level-20-on-an-alt-account/)).',
        subtasks: [
          { label: 'Level 33 → Chimera on Easy', refs: [{ num: 'accountLevel', min: 33 }] },
          { label: 'Level 35 → Tag Team Arena, Advanced Quests', refs: [{ num: 'accountLevel', min: 35 }] },
          { label: 'Level 40 → Doom Tower, +16 artifacts', refs: [{ num: 'accountLevel', min: 40 }] },
        ],
        to: '/resources/hall',
      },
    ],
  },
  {
    id: 'month2',
    title: 'Month 2+',
    short: 'Month 2+',
    days: [29, null],
    tasks: [
      {
        id: 'rm.m2.cb',
        text: '**Clan Boss:** Budget Maneater on Nightmare (author expects 2 keys), then Ultra-Nightmare (the tune page claims 2 keys; the build article says 3–4) ([DWJ New Budget Unkillable](https://deadwoodjedi.com/new-budget-unkillable/)).',
        subtasks: [
          { label: 'Budget Maneater on Nightmare', refs: [{ flag: 'rm.m2.cb.nm' }] },
          { label: 'Ultra-Nightmare', refs: [{ flag: 'rm.m2.cb.unm' }] },
        ],
        to: '/clan-boss/demon-lord',
      },
      {
        id: 'rm.m2.dungeons',
        text: '**Dungeons:** Spider and Dragon to 25, then Fire Knight and Ice Golem to 20–25. Hard mode opens after 25 and drops Mythical gear from Hard 26+ ([InTeleria drop rates](https://www.inteleria.com/raid-dungeon-drop-rates/)).',
        subtasks: [
          { label: 'Spider 25', refs: [{ num: 'stage.spider', min: 25 }] },
          { label: 'Dragon 25', refs: [{ num: 'stage.dragon', min: 25 }] },
          { label: 'Fire Knight 20+', refs: [{ num: 'stage.fk', min: 20 }] },
          { label: 'Ice Golem 20+', refs: [{ num: 'stage.ig', min: 20 }] },
        ],
        to: '/dungeons',
      },
      {
        id: 'rm.m2.hydra',
        text: '**Hydra (level 45):** start on Normal ([BlueStacks Hydra](https://www.bluestacks.com/blog/game-guides/raid-shadow-legends/rsl-hydra-guide-en.html)).',
        to: '/clan-boss/hydra',
      },
      {
        id: 'rm.m2.twins',
        text: '**Iron Twins:** farm Soul Coins to awaken champions for blessings ([InTeleria blessings](https://www.inteleria.com/raid-shadow-legends-blessings-guide/)).',
      },
      {
        id: 'rm.m2.fw',
        text: '**Faction Wars:** start once you have levelled champions in several factions; it becomes the main gear and Perception-set source after month one.',
      },
      {
        id: 'rm.m2.arena',
        text: '**Arena:** push Classic to Gold V for Arbiter missions.',
        to: '/dungeons/arena',
      },
    ],
  },
]

// Daily loops named in the guide (Day 1 "Start daily loops", Arena "Daily",
// and the Clan Boss key plan "Each day").
export const dailyLoops = [
  {
    id: 'cb',
    title: 'Clan Boss',
    text: 'Use your free keys plus just enough stored keys to cross the next chest threshold at the highest difficulty you survive.',
    to: '/clan-boss/demon-lord',
  },
  {
    id: 'arena',
    title: 'Classic Arena',
    text: 'Easy Classic fights for Great Hall medals; push to Gold V for Arbiter missions.',
    to: '/dungeons/arena',
  },
  {
    id: 'campaign',
    title: 'Campaign push',
    text: 'Campaign push with Galleus (Alt form clears waves) and Gizmak to raise account level.',
    to: '/champions/galleus',
  },
]

export const weeklyKeys = [
  { id: 'hydra', title: 'Hydra keys', total: 3, note: 'Level 45 · 6 champions per key, each once per week', to: '/clan-boss/hydra' },
  { id: 'chimera', title: 'Chimera keys', total: 2, note: 'Level 33 · 5 champions · up to 65 boss turns', to: '/clan-boss/chimera' },
]
