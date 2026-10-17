import type { SourceRef } from './types'

export interface SourceGroup {
  name: string
  links: SourceRef[]
}

// "Sources" section of rsl_data.md, in the same order.
export const sourceGroups: SourceGroup[] = [
  {
    name: 'DeadwoodJedi',
    links: [
      { label: 'Budget Maneater Unkillable – Ninja', url: 'https://deadwoodjedi.com/speed-tunes/budget-maneater-unkillable-ninja/' },
      { label: 'Budget Maneater Unkillable', url: 'https://deadwoodjedi.com/speed-tunes/budget-maneater-unkillable/' },
      { label: 'New Budget Unkillable', url: 'https://deadwoodjedi.com/new-budget-unkillable/' },
      { label: 'Clan Boss basics', url: 'https://deadwoodjedi.com/clan-boss-its-easy-if-you-know-how/' },
      { label: 'First UNM team', url: 'https://deadwoodjedi.com/building-your-first-ultra-nightmare-clan-boss-team/' },
      { label: 'Top chest', url: 'https://deadwoodjedi.com/how-to-get-top-chest-in-clan-boss/' },
      { label: 'First CB team', url: 'https://deadwoodjedi.com/?p=3542' },
    ],
  },
  {
    name: 'HellHades guides',
    links: [
      { label: 'CB guide', url: 'https://hellhades.com/ultimate-clan-boss-guide-everything-you-need-to-know/' },
      { label: 'Hydra getting started', url: 'https://hellhades.com/getting-started-with-hydra-clan-boss-in-raid-shadow-legends/' },
      { label: 'Block Buffs for Hydra', url: 'https://hellhades.com/best-block-buffs-champions-for-hydra-in-raid-shadow-legends/' },
      { label: 'Chimera', url: 'https://hellhades.com/raid/boss-guide/chimera/' },
      { label: '10 epics for Chimera', url: 'https://hellhades.com/10-great-epic-champions-for-the-chimera/' },
      { label: 'Galleus spotlight', url: 'https://hellhades.com/galleus-bloodcrest-champion-spotlight/' },
      { label: 'Nub Mythical tier list', url: 'https://hellhades.com/nubs-mythical-tier-list-raid-shadow-legends/' },
      { label: 'Mythical preview', url: 'https://hellhades.com/raid-update-preview-mythical-champions/' },
      { label: 'HP Burn guide', url: 'https://hellhades.com/best-hp-burn-champions-in-raid-shadow-legends-complete-guide/' },
      { label: 'Zero to Hero Spider', url: 'https://hellhades.com/zero-to-hero-spider-build-we-need-silver/' },
      { label: 'Spider', url: 'https://hellhades.com/raid/boss-guide/skavag-the-spider-queen/' },
      { label: 'FK Hard', url: 'https://hellhades.com/understanding-fire-knight-hard-mode-mechanics-in-raid-shadow-legends/' },
      { label: 'FK Turn Meter', url: 'https://hellhades.com/best-turn-meter-champions-for-fire-knight-in-raid-shadow-legends/' },
      { label: 'Ice Golem', url: 'https://hellhades.com/raid/boss-guide/klyssus-the-ice-golem/' },
      { label: '2025 gear meta', url: 'https://hellhades.com/2025-gear-set-meta-in-raid-whats-still-worth-farming/' },
      { label: 'Sets & stats by role', url: 'https://hellhades.com/best-sets-and-stat-combinations-for-every-champion-role-in-raid-shadow-legends/' },
      { label: "Nub's Top 50 tips", url: 'https://hellhades.com/nubs-top-50-tips-for-new-players-in-raid-shadow-legends/' },
      { label: 'Project Zero', url: 'https://hellhades.com/project-zero-my-first-two-days-on-a-fresh-raid-account/' },
      { label: 'Ascension', url: 'https://hellhades.com/raid/guide-to-champion-ascension/' },
      { label: 'Gems vs Minotaur', url: 'https://hellhades.com/gems-vs-farming-minotaurs-labyrinth/' },
      { label: 'Gem Mine', url: 'https://hellhades.com/raid-shadow-legends-is-the-gem-mine-worth-it-in-2022/' },
      { label: 'Energy', url: 'https://hellhades.com/beginners-energy-guide-raid-shadow-legends/' },
    ],
  },
  {
    name: 'HellHades champion pages',
    links: [
      { label: 'Ninja', url: 'https://hellhades.com/raid/champions/ninja/' },
      { label: 'Artak', url: 'https://hellhades.com/raid/champions/artak/' },
      { label: 'Kymar', url: 'https://hellhades.com/raid/champions/prince-kymar/' },
      { label: 'UDK', url: 'https://hellhades.com/raid/champions/ultimate-deathknight/' },
      { label: 'Maneater', url: 'https://hellhades.com/raid/champions/maneater/' },
      { label: 'Deacon', url: 'https://hellhades.com/raid/champions/deacon-armstrong/' },
      { label: 'Seer', url: 'https://hellhades.com/raid/champions/seer/' },
      { label: 'Ruella', url: 'https://hellhades.com/raid/champions/ruella/' },
      { label: 'Skullcrusher', url: 'https://hellhades.com/raid/champions/skullcrusher/' },
      { label: 'Pain Keeper', url: 'https://hellhades.com/raid/champions/pain-keeper/' },
    ],
  },
  {
    name: 'Ayumilove',
    links: [
      { label: 'Demon Lord', url: 'https://ayumilove.net/raid-shadow-legends-champion-ranking-in-clan-boss/' },
      { label: 'Hydra', url: 'https://ayumilove.net/raid-shadow-legends-hydra-clan-boss-guide/' },
      { label: 'Chimera', url: 'https://ayumilove.net/raid-shadow-legends-chimera-clan-boss-guide/' },
      { label: 'Spider', url: 'https://ayumilove.net/raid-shadow-legends-champion-ranking-in-spiders-den/' },
      { label: 'Dragon', url: 'https://ayumilove.net/raid-shadow-legends-champion-ranking-in-dragons-lair/' },
      { label: 'Fire Knight', url: 'https://ayumilove.net/raid-shadow-legends-champion-ranking-in-fire-knights-castle/' },
      { label: 'Ice Golem', url: 'https://ayumilove.net/raid-shadow-legends-champion-ranking-in-ice-golems-peak/' },
      { label: 'Artifacts', url: 'https://ayumilove.net/raid-shadow-legends-artifact-and-accessory-guide/' },
      { label: 'Leveling', url: 'https://ayumilove.net/raid-shadow-legends-champion-leveling-guide/' },
      { label: 'Gem guide', url: 'https://ayumilove.net/?p=108879' },
      { label: '2026 patch notes', url: 'https://ayumilove.net/raid-shadow-legends-patch-notes-2026/' },
      { label: 'Galleus', url: 'https://ayumilove.net/raid-shadow-legends-galleus-bloodcrest-skill-mastery-equip-guide/' },
      { label: 'Gizmak', url: 'https://ayumilove.net/raid-shadow-legends-gizmak-the-terrible-skill-mastery-equip-guide/' },
      { label: 'Ninja', url: 'https://ayumilove.net/raid-shadow-legends-ninja-skill-mastery-equip-guide/' },
      { label: 'Rathalos', url: 'https://ayumilove.net/raid-shadow-legends-rathalos-blademaster-skill-mastery-equip-guide/' },
      { label: 'Deacon', url: 'https://ayumilove.net/raid-shadow-legends-deacon-armstrong-skill-mastery-equip-guide/' },
      { label: 'Pain Keeper', url: 'https://ayumilove.net/raid-shadow-legends-pain-keeper-skill-mastery-equip-guide/' },
      { label: 'Kymar', url: 'https://ayumilove.net/raid-shadow-legends-prince-kymar-skill-mastery-equip-guide/' },
    ],
  },
  {
    name: 'Plarium Support',
    links: [
      { label: 'The Tavern', url: 'https://raid-support.plarium.com/hc/en-us/articles/360014648380-The-Tavern' },
      { label: 'Brew Upgrade', url: 'https://raid-support.plarium.com/hc/en-us/articles/22806729480348-Guide-Brew-Upgrade' },
      { label: 'Demon Lord', url: 'https://raid-support.plarium.com/hc/en-us/articles/360014645900-Guide-Demon-Lord' },
    ],
  },
  {
    name: 'InTeleria',
    links: [
      { label: 'Beginner guide 2026', url: 'https://www.inteleria.com/raid-shadow-legends-beginner-guide-2026-fast-start-zero-regrets/' },
      { label: 'Food farming', url: 'https://www.inteleria.com/best-way-to-farm-food-raid-shadow-legends/' },
      { label: 'Dungeon drop rates', url: 'https://www.inteleria.com/raid-dungeon-drop-rates/' },
      { label: 'Keep drop rates', url: 'https://www.inteleria.com/raid-keep-drop-rates/' },
      { label: 'Warmaster vs Giant Slayer', url: 'https://www.inteleria.com/warmaster-or-giant-slayer/' },
      { label: 'Enhancement events', url: 'https://www.inteleria.com/raid-shadow-legends-artifact-enhancement-event-guide/' },
      { label: 'Blessings', url: 'https://www.inteleria.com/raid-shadow-legends-blessings-guide/' },
    ],
  },
  {
    name: 'Other',
    links: [
      { label: 'BlueStacks Hydra', url: 'https://www.bluestacks.com/blog/game-guides/raid-shadow-legends/rsl-hydra-guide-en.html' },
      { label: 'BlueStacks Chimera', url: 'https://www.bluestacks.com/blog/game-guides/raid-shadow-legends/rsl-chimera-guide-en.html' },
      { label: 'allthings.how', url: 'https://allthings.how/raid-shadow-legends-what-to-do-after-level-20-on-an-alt-account/' },
      { label: 'GamingNoble brews', url: 'https://gamingnoble.com/raid-shadow-legends-xp-brews/' },
    ],
  },
]
