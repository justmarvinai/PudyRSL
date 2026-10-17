// Section 7 "What not to do" and section 8 "Open questions to check in-game".

export interface DontRule {
  id: string
  text: string
  topic: string
  to: string
}

export const dontRules: DontRule[] = [
  {
    id: 'brews',
    text: "Don't treat brews as ascension material, and don't spend them on fodder bases while core champions still need XP.",
    topic: 'Brews',
    to: '/resources/brews',
  },
  {
    id: 'tune',
    text: "Don't put Gizmak, Deacon, Galleus, Seer, Apothecary or High Khatun in the Maneater tune; no Counterattack gear/masteries on Ninja or Pain Keeper; no Relentless anywhere in it.",
    topic: 'Clan Boss tune',
    to: '/clan-boss/demon-lord',
  },
  {
    id: 'keys',
    text: "Don't dump the 133 keys in one day — you only get one day's chest.",
    topic: 'Clan Boss keys',
    to: '/clan-boss/demon-lord',
  },
  {
    id: 'tomes',
    text: "Don't spread Legendary tomes past cooldown levels, and don't use higher-rarity tomes on lower-rarity champions.",
    topic: 'Tomes',
    to: '/resources/tomes',
  },
  {
    id: 'feasts',
    text: "Don't use Feasts on Legendaries or the XP Barrel on a low-rank champion.",
    topic: '6★ plan',
    to: '/rank-up',
  },
  {
    id: 'legendaries',
    text: "Don't 6★ Skeletor, Adelyn, Loki, Sun Wukong or other nice-to-have Legendaries before the 13 are done.",
    topic: 'Champions',
    to: '/champions',
  },
  {
    id: 'spider',
    text: "Don't build damage on Spider burners: keep Gizmak, Artak and Kymar on ACC/SPD/HP so spiderlings don't die early.",
    topic: 'Spider',
    to: '/dungeons/spider',
  },
  { id: 'ig', text: "Don't farm Ice Golem for gear early.", topic: 'Ice Golem', to: '/dungeons/ice-golem' },
  { id: 'gems', text: "Don't spend gems on energy, silver or shards.", topic: 'Gems', to: '/resources/gems' },
  { id: 'plus16', text: "Don't +16 off-set or badly rolled pieces.", topic: 'Silver', to: '/resources/silver' },
  {
    id: 'sacrifice',
    text: "Don't sacrifice Epics from the keep list or any Rare.",
    topic: 'Fodder',
    to: '/rank-up',
  },
]

export interface OpenQuestion {
  id: string
  text: string
  to?: string
}

export const openQuestions: OpenQuestion[] = [
  {
    id: 'tune-slots',
    text: "**Rathalos/Artak in the 175–178 slot and Skullcrusher as stun target** aren't DWJ-listed; model them in the DWJ calculator (Frozen Banshee/Urogrim are the listed DPS). One report says Maneater needs 256 instead of 240.",
    to: '/clan-boss/demon-lord',
  },
  {
    id: 'affinities',
    text: "**Affinities** of most core champions weren't confirmed (only Galleus Force, Gizmak and Kymar Magic). Check before spending brews.",
    to: '/champions',
  },
  {
    id: 'ranks',
    text: '**Starting ranks:** Epics at 4★ and Rares at 3★ are assumed; your champions may already be higher.',
    to: '/rank-up',
  },
  {
    id: 'stored-keys',
    text: '**Stored Clan Boss keys:** unverified whether they stack past the 2-key cap or pause natural regen.',
    to: '/clan-boss/demon-lord',
  },
  {
    id: 'thresholds',
    text: '**Clan Boss chest thresholds** date from 2022 and may have been retuned.',
    to: '/clan-boss/demon-lord',
  },
  {
    id: 'keeps',
    text: "**Ascension silver cost and energy per Keep run** weren't found, so the Keep budget is an estimate.",
    to: '/resources/energy',
  },
  { id: 'mythic-tomes', text: "**Mythic tome sources** in 2026 weren't confirmed.", to: '/resources/tomes' },
  { id: 'hydra', text: '**Hydra** rotation and stat benchmarks predate the 2024 rework.', to: '/clan-boss/hydra' },
  {
    id: 'ratings',
    text: '**Ratings are opinions:** HellHades and Ayumilove disagree on some picks (e.g. Ninja in Spider: HH 8 vs Ayumilove 2★).',
  },
]
