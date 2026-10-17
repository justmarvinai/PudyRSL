import type { Affinity, ChampionId } from './types'

// Section 4 "Dungeons and Arena".

export const dungeonsIntro =
  'The same core runs all four dungeons: Deacon and Maneater appear in almost every team, Gizmak and Artak carry the burn teams, and Wave 2 (Kymar, Seer, UDK, Ruella, Skullcrusher) upgrades each one. Farm order: **Dragon (Speed) → Spider (accessories, silver) → Fire Knight (Savage, Regeneration) → Ice Golem (quests, Reflex)**.'

export const farmOrder = [
  { id: 'dragon', name: 'Dragon', reason: 'Speed' },
  { id: 'spider', name: 'Spider', reason: 'accessories, silver' },
  { id: 'fire-knight', name: 'Fire Knight', reason: 'Savage, Regeneration' },
  { id: 'ice-golem', name: 'Ice Golem', reason: 'quests, Reflex' },
]

export const statTargets = {
  text: 'Early stat targets by role, per HellHades (Oct 2026): damage dealers 170 SPD, 100% C.RATE, 150% C.DMG; debuffers 200 SPD, 200 ACC; buffers 200 SPD ([HH sets & stats](https://hellhades.com/best-sets-and-stat-combinations-for-every-champion-role-in-raid-shadow-legends/)). Stage 20 is the most efficient early farm (~73% 5★ / 27% 6★ drops) ([InTeleria](https://www.inteleria.com/raid-dungeon-drop-rates/)).',
  roles: [
    { role: 'Damage dealers', stats: ['170 SPD', '100% C.RATE', '150% C.DMG'] },
    { role: 'Debuffers', stats: ['200 SPD', '200 ACC'] },
    { role: 'Buffers', stats: ['200 SPD'] },
  ],
  stage20: 'Stage 20 is the most efficient early farm (~73% 5★ / 27% 6★ drops)',
}

export interface DungeonSlot {
  slot: string
  w1?: string
  w1Ids?: ChampionId[]
  w2: string
  w2Ids: ChampionId[]
  role: string
  targets?: string
}

export interface StageNote {
  stage: number
  affinity: Affinity
  note?: string
}

export interface Dungeon {
  id: 'spider' | 'dragon' | 'fire-knight' | 'ice-golem'
  stageKey: 'spider' | 'dragon' | 'fk' | 'ig'
  name: string
  short: string
  priority: number
  mechanics: string
  stages: StageNote[]
  hasWave1: boolean
  team: DungeonSlot[]
  after: string
  /** Stage milestones the roadmap names for this dungeon. */
  milestones: { stage: number; label: string }[]
}

export const dungeons: Dungeon[] = [
  {
    id: 'spider',
    stageKey: 'spider',
    name: "Spider's Den",
    short: 'Spider',
    priority: 2,
    mechanics:
      'the queen eats spiderlings to heal 3% and gain +10% ATK each. She is immune to Stun, Freeze, Provoke and Block Active Skills, but spiderlings can be controlled. Stage 20: Spirit boss, 200 ACC / 200 RES → you need **225 ACC** (250 safe). Stage 25: Magic boss, spiderlings at 155 SPD → everyone **faster than 155**. Stages 21–25 halve Turn Meter reduction. Keep AoE damage low: dead spiderlings waste burn ticks ([Ayumilove Spider](https://ayumilove.net/raid-shadow-legends-champion-ranking-in-spiders-den/), [HH zero-to-hero Spider](https://hellhades.com/zero-to-hero-spider-build-we-need-silver/)).',
    stages: [
      { stage: 20, affinity: 'Spirit', note: '200 ACC / 200 RES → you need 225 ACC (250 safe)' },
      { stage: 25, affinity: 'Magic', note: 'Spiderlings at 155 SPD → everyone faster than 155' },
    ],
    hasWave1: true,
    team: [
      {
        slot: 'Lead',
        w1: 'Deacon',
        w1Ids: ['deacon'],
        w2: 'Deacon',
        w2Ids: ['deacon'],
        role: '+19% SPD aura, team TM up, enemy TM down',
        targets: '200+ SPD, 225–250 ACC',
      },
      {
        slot: 'Burn',
        w1: 'Gizmak (Base)',
        w1Ids: ['gizmak'],
        w2: 'Gizmak',
        w2Ids: ['gizmak'],
        role: 'Unresistable AoE burn each round at 100% C.RATE; A2 detonates and extends',
        targets: '100% C.RATE, SPD, HP/DEF (not ATK)',
      },
      {
        slot: 'Burn',
        w1: 'Artak',
        w1Ids: ['artak'],
        w2: 'Artak',
        w2Ids: ['artak'],
        role: 'AoE burn, activation, Decrease ATK; Spider Hard 5★',
        targets: '175+ SPD, 225+ ACC',
      },
      {
        slot: 'Control',
        w1: 'Maneater',
        w1Ids: ['maneater'],
        w2: 'Maneater',
        w2Ids: ['maneater'],
        role: 'Drains boss TM; Unkillable + Block Debuffs',
        targets: '240 SPD build carries over',
      },
      {
        slot: 'Flex',
        w1: 'Rathalos',
        w1Ids: ['rathalos'],
        w2: '**Prince Kymar**',
        w2Ids: ['kymar'],
        role: 'Rathalos: burst vs burned. Kymar: team cooldown reset + AoE Sleep on spiderlings',
        targets: 'Kymar: SPD/ACC/HP',
      },
    ],
    after:
      'Spider is the only accessory source and the best silver farm ([HH Spider guide](https://hellhades.com/raid/boss-guide/skavag-the-spider-queen/)). Farm stage 10 early, then 20+.',
    milestones: [
      { stage: 10, label: 'Week 1: Spider 10' },
      { stage: 20, label: 'Weeks 2–4: toward 20' },
      { stage: 25, label: 'Month 2+: to 25' },
    ],
  },
  {
    id: 'dragon',
    stageKey: 'dragon',
    name: "Dragon's Lair",
    short: 'Dragon',
    priority: 3,
    mechanics:
      'Inhale empties his TM and opens a purple bar — break it before Scorch (AoE + team Stun). Wall of Fire applies Poison + Weaken. Immune to Decrease SPD and TM reduction. Counters: Decrease ATK/DEF, Weaken, burst, Block Debuffs. Stage 20 = Magic, stage 25 = Force ([Ayumilove Dragon](https://ayumilove.net/raid-shadow-legends-champion-ranking-in-dragons-lair/)).',
    stages: [
      { stage: 20, affinity: 'Magic' },
      { stage: 25, affinity: 'Force' },
    ],
    hasWave1: true,
    team: [
      {
        slot: '1',
        w1: 'Maneater',
        w1Ids: ['maneater'],
        w2: 'Maneater',
        w2Ids: ['maneater'],
        role: 'Time Unkillable + Block Debuffs for Scorch',
      },
      { slot: '2', w1: 'Deacon', w1Ids: ['deacon'], w2: 'Deacon', w2Ids: ['deacon'], role: 'AoE Decrease DEF, Turn Meter' },
      { slot: '3', w1: 'Ninja', w1Ids: ['ninja'], w2: 'Ninja', w2Ids: ['ninja'], role: 'Burst for the Scorch bar' },
      {
        slot: '4',
        w1: 'Galleus',
        w1Ids: ['galleus'],
        w2: '**Seer**',
        w2Ids: ['seer'],
        role: 'Galleus: Force (edge vs the Magic stage-20 boss), unresistable Alt Decrease DEF, wave clear; Ayumilove Dragon Hard 5. Seer: waves, Weaken, team C.RATE',
      },
      {
        slot: '5',
        w1: 'Rathalos (or Gizmak)',
        w1Ids: ['rathalos', 'gizmak'],
        w2: '**Ultimate Deathknight**',
        w2Ids: ['udk'],
        role: 'UDK: AoE Decrease ATK, shield, heal; HH Dragon 10',
      },
    ],
    after:
      'Farm Dragon first for Speed, Accuracy and Lifesteal sets ([Ayumilove artifacts](https://ayumilove.net/raid-shadow-legends-artifact-and-accessory-guide/), [HH 2025 gear meta](https://hellhades.com/2025-gear-set-meta-in-raid-whats-still-worth-farming/)).',
    milestones: [
      { stage: 20, label: 'Weeks 2–4: toward 20' },
      { stage: 25, label: 'Month 2+: to 25' },
    ],
  },
  {
    id: 'fire-knight',
    stageKey: 'fk',
    name: "Fire Knight's Castle",
    short: 'Fire Knight',
    priority: 4,
    mechanics:
      "his shield needs **10 hits (stages 10–20) / 12 hits (21–25)** to break. While it's up he takes 80% less damage and is immune to debuffs; if it survives to his turn he heals, AoEs and destroys your max HP. Counterattacks and Reflect also strip shield hits. Multi-hitters should act before debuffers. Stage 20 = Force, stage 25 = Spirit ([Ayumilove FK](https://ayumilove.net/raid-shadow-legends-champion-ranking-in-fire-knights-castle/), [HH FK TM](https://hellhades.com/best-turn-meter-champions-for-fire-knight-in-raid-shadow-legends/)).",
    stages: [
      { stage: 20, affinity: 'Force' },
      { stage: 25, affinity: 'Spirit' },
    ],
    hasWave1: false,
    team: [
      {
        slot: '1',
        w2: 'Skullcrusher',
        w2Ids: ['skullcrusher'],
        role: 'Team Counterattack + Ally Protection → every ally counter strips hits',
      },
      { slot: '2', w2: 'Ruella', w2Ids: ['ruella'], role: '3-hit A1/A2, Decrease DEF, team +20% TM and C.RATE' },
      { slot: '3', w2: 'Deacon', w2Ids: ['deacon'], role: '2-hit A1, enemy TM down' },
      { slot: '4', w2: 'Seer', w2Ids: ['seer'], role: 'Waves (HH FK 10)' },
      {
        slot: '5',
        w2: 'Galleus (Base) or Ninja',
        w2Ids: ['galleus', 'ninja'],
        role: 'Galleus: Counterattack + reflect. Ninja: 3-hit A2',
      },
    ],
    after:
      "[My call] Before Wave 2, Pain Keeper (2-hit A1) can fill a slot. If you can't break 12 hits at 21–25, add one cheap multi-hitter at 5★ Lv50 instead of a 6★: Fenshi, Alure, Fodbor or Ronda (all Ayumilove FK 5★). Avoid Gizmak here (FK 2★).",
    milestones: [
      { stage: 10, label: 'Weeks 2–4: start at 10+' },
      { stage: 20, label: 'Month 2+: to 20–25' },
    ],
  },
  {
    id: 'ice-golem',
    stageKey: 'ig',
    name: "Ice Golem's Peak",
    short: 'Ice Golem',
    priority: 5,
    mechanics:
      'at 80/60/45/30/15% HP he revives his minions and hits an AoE that ignores 50% DEF per living minion, with a scaling Freeze chance — **kill the minions before each threshold**. Stage 20 = Spirit (favours Magic champions), stage 25 = Magic. Hard mode is immune to Poison and takes +10% from HP Burn ([Ayumilove IG](https://ayumilove.net/raid-shadow-legends-champion-ranking-in-ice-golems-peak/)).',
    stages: [
      { stage: 20, affinity: 'Spirit', note: 'Favours Magic champions' },
      { stage: 25, affinity: 'Magic' },
    ],
    hasWave1: true,
    team: [
      {
        slot: '1',
        w1: 'Maneater',
        w1Ids: ['maneater'],
        w2: 'Maneater',
        w2Ids: ['maneater'],
        role: 'Unkillable + Block Debuffs at thresholds',
      },
      { slot: '2', w1: 'Deacon', w1Ids: ['deacon'], w2: '**Kymar** (Magic, IG 10)', w2Ids: ['kymar'], role: 'TM / cooldown reset' },
      { slot: '3', w1: 'Ninja', w1Ids: ['ninja'], w2: 'Ninja', w2Ids: ['ninja'], role: 'Damage; IG Hard burn pick' },
      {
        slot: '4',
        w1: 'Artak',
        w1Ids: ['artak'],
        w2: '**Seer**',
        w2Ids: ['seer'],
        role: 'Artak: burn route that still works in Hard. Seer: waves and minions',
      },
      {
        slot: '5',
        w1: 'Gizmak (Magic)',
        w1Ids: ['gizmak'],
        w2: '**Ultimate Deathknight** (IG 10)',
        w2Ids: ['udk'],
        role: 'Burns/buffs → shield, heal, Decrease ATK',
      },
    ],
    after:
      'Fenax (Block Revive) is optional. Ice Golem is the least valuable farm ([HH IG](https://hellhades.com/raid/boss-guide/klyssus-the-ice-golem/)), so clear it for quests and the Reflex set only.',
    milestones: [
      { stage: 10, label: 'Weeks 2–4: start at 10+' },
      { stage: 20, label: 'Month 2+: to 20–25' },
    ],
  },
]

export const iceGolemThresholds = [80, 60, 45, 30, 15]

export const hardModeNote =
  'Hard mode opens after 25 and drops Mythical gear from Hard 26+ ([InTeleria drop rates](https://www.inteleria.com/raid-dungeon-drop-rates/)).'

export const arena = {
  name: 'Arena',
  priority: 6,
  bullets: [
    "**Daily:** easy Classic fights for Great Hall medals; push to Gold V for Arbiter missions. Don't build Arena-only champions yet ([HH Nub tips](https://hellhades.com/nubs-top-50-tips-for-new-players-in-raid-shadow-legends/)).",
    '**Week-1 offense** [My call]: Deacon (lead, +19% SPD), Gizmak (team buff + Extra Turn opener), Galleus (Alt form nukes; HH Arena 10), Ninja or Rathalos.',
    '**Wave-2 offense:** **Kymar lead** (+30% SPD in Arena), Deacon, Seer, Gizmak/Galleus ([Ayumilove Kymar](https://ayumilove.net/raid-shadow-legends-prince-kymar-skill-mastery-equip-guide/)).',
    '**Watch out:** Polymorph and Stoneskin defenses counter both Mythicals.',
  ],
  week1: [
    { name: 'Deacon', ids: ['deacon'] as ChampionId[], note: 'lead, +19% SPD' },
    { name: 'Gizmak', ids: ['gizmak'] as ChampionId[], note: 'team buff + Extra Turn opener' },
    { name: 'Galleus', ids: ['galleus'] as ChampionId[], note: 'Alt form nukes; HH Arena 10' },
    { name: 'Ninja or Rathalos', ids: ['ninja', 'rathalos'] as ChampionId[], note: '' },
  ],
  wave2: [
    { name: 'Kymar', ids: ['kymar'] as ChampionId[], note: 'lead (+30% SPD in Arena)' },
    { name: 'Deacon', ids: ['deacon'] as ChampionId[], note: '' },
    { name: 'Seer', ids: ['seer'] as ChampionId[], note: '' },
    { name: 'Gizmak/Galleus', ids: ['gizmak', 'galleus'] as ChampionId[], note: '' },
  ],
}
