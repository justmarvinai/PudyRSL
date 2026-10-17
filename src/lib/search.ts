import { benchOptions, champions, notBuiltEarly } from '../data/champions'
import { dungeons } from '../data/dungeons'
import { sacrifice } from '../data/rankUp'
import { phases } from '../data/roadmap'
import { dontRules, openQuestions } from '../data/rules'

export type SearchGroup = 'Pages' | 'Sections' | 'Tools' | 'Champions' | 'Roadmap' | 'Roster' | 'Rules' | 'Actions'

export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  group: SearchGroup
  to?: string
  action?: 'export' | 'sidebar' | 'shortcuts' | 'lock'
  keywords?: string
}

const plain = (md: string) =>
  md
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

/** First bold phrase of a guide bullet, used as its title. */
const boldTitle = (md: string) => {
  const m = md.match(/\*\*(.+?)\*\*/)
  return plain(m ? m[1] : md).replace(/[:.]$/, '')
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [
    { id: 'p-dash', title: 'Dashboard', group: 'Pages', to: '/', keywords: 'home today overview' },
    { id: 'p-road', title: 'Roadmap', group: 'Pages', to: '/roadmap', keywords: 'day 1 week checklist phases plan' },
    { id: 'p-cb', title: 'Clan Boss', group: 'Pages', to: '/clan-boss', keywords: 'demon lord cb hydra chimera' },
    { id: 'p-dun', title: 'Dungeons & Arena', group: 'Pages', to: '/dungeons', keywords: 'spider dragon fire knight ice golem arena' },
    { id: 'p-champ', title: 'Champions', group: 'Pages', to: '/champions', keywords: 'core 13 roster' },
    { id: 'p-rank', title: '6★ Plan', group: 'Pages', to: '/rank-up', keywords: 'rank six star feast chickens fodder wave' },
    { id: 'p-res', title: 'Resources', group: 'Pages', to: '/resources', keywords: 'brews tomes masteries energy gems silver' },
    { id: 'p-rules', title: 'Rules & Checks', group: 'Pages', to: '/rules', keywords: "don't what not to do open questions" },
    { id: 'p-guide', title: 'Full Guide', group: 'Pages', to: '/guide', keywords: 'document sources original markdown' },
    { id: 'p-set', title: 'Settings', group: 'Pages', to: '/settings', keywords: 'backup export import reset start date' },

    { id: 's-dl', title: 'Demon Lord', subtitle: 'Clan Boss', group: 'Sections', to: '/clan-boss/demon-lord', keywords: 'cb unkillable' },
    { id: 's-hydra', title: 'Hydra', subtitle: 'Clan Boss', group: 'Sections', to: '/clan-boss/hydra', keywords: 'heads decay torment wrath blight' },
    { id: 's-chim', title: 'Chimera', subtitle: 'Clan Boss', group: 'Sections', to: '/clan-boss/chimera', keywords: 'ram lion viper ultimate forms' },
    { id: 's-starter', title: 'Starter team', subtitle: 'Demon Lord · Step 1', group: 'Sections', to: '/clan-boss/demon-lord#starter-team' },
    {
      id: 's-uk',
      title: 'Budget Maneater Unkillable',
      subtitle: 'Demon Lord · Step 2',
      group: 'Sections',
      to: '/clan-boss/demon-lord#uk-team',
      keywords: 'tune ninja variant uk speed',
    },
    { id: 's-openers', title: 'Openers', subtitle: 'Budget Maneater tune', group: 'Sections', to: '/clan-boss/demon-lord#openers' },
    { id: 's-diff', title: 'Difficulty requirements', subtitle: 'Demon Lord speed & accuracy', group: 'Sections', to: '/clan-boss/demon-lord#difficulty' },
    ...dungeons.map((d) => ({
      id: `s-${d.id}`,
      title: d.name,
      subtitle: `Dungeon · priority #${d.priority}`,
      group: 'Sections' as const,
      to: `/dungeons/${d.id}`,
    })),
    { id: 's-arena', title: 'Arena', subtitle: 'Priority #6', group: 'Sections', to: '/dungeons/arena', keywords: 'classic gold medals' },
    { id: 's-brews', title: 'Brews', subtitle: 'Resources', group: 'Sections', to: '/resources/brews', keywords: 'xp affinity' },
    { id: 's-tomes', title: 'Skill tomes', subtitle: 'Resources', group: 'Sections', to: '/resources/tomes', keywords: 'books legendary epic rare mythic' },
    { id: 's-mast', title: 'Masteries', subtitle: 'Resources', group: 'Sections', to: '/resources/masteries', keywords: 'warmaster minotaur scrolls' },
    { id: 's-energy', title: 'Energy budget', subtitle: 'Resources', group: 'Sections', to: '/resources/energy' },
    { id: 's-gems', title: 'Gems', subtitle: 'Resources', group: 'Sections', to: '/resources/gems', keywords: 'gem mine' },
    { id: 's-silver', title: 'Silver', subtitle: 'Resources', group: 'Sections', to: '/resources/silver', keywords: 'upgrade +16 +12' },
    {
      id: 's-hall',
      title: 'Great Hall, unlocks & gear sets',
      subtitle: 'Resources',
      group: 'Sections',
      to: '/resources/hall',
      keywords: 'account level doom tower cursed city market',
    },
    { id: 's-matrix', title: 'Coverage matrix', subtitle: 'Champions × content', group: 'Sections', to: '/champions#matrix' },
    { id: 's-bench', title: 'Bench & alternatives', subtitle: 'Champions', group: 'Sections', to: '/champions#bench', keywords: 'luxury not built early' },
    { id: 's-w1', title: 'Wave 1 — 8 Rank 6s', subtitle: '6★ Plan', group: 'Sections', to: '/rank-up#wave-1' },
    { id: 's-w2', title: 'Wave 2 — 5 more Rank 6s', subtitle: '6★ Plan', group: 'Sections', to: '/rank-up#wave-2' },
    { id: 's-supply', title: 'Chicken supply math', subtitle: '6★ Plan', group: 'Sections', to: '/rank-up#supply', keywords: '128 units' },
    { id: 's-fodder', title: 'Safe-to-sacrifice Epics', subtitle: '6★ Plan', group: 'Sections', to: '/rank-up#fodder', keywords: 'keep list feed' },
    { id: 's-donts', title: 'What not to do', subtitle: 'Rules', group: 'Sections', to: '/rules#donts' },
    { id: 's-oq', title: 'Open questions to check in-game', subtitle: 'Rules', group: 'Sections', to: '/rules#open-questions' },
    { id: 's-sources', title: 'Sources', subtitle: 'Full Guide', group: 'Sections', to: '/guide#sources' },

    {
      id: 't-tune',
      title: 'Speed tune checker',
      subtitle: 'Budget Maneater true speeds, HP & DEF',
      group: 'Tools',
      to: '/clan-boss/demon-lord#tune-checker',
    },
    { id: 't-keys', title: 'Clan Boss key planner', subtitle: '133 stored keys, chest thresholds', group: 'Tools', to: '/clan-boss/demon-lord#key-planner' },
    { id: 't-brew', title: 'Brew calculator', subtitle: 'XP and brews per rank path', group: 'Tools', to: '/resources/brews#brew-calculator' },
    { id: 't-unlocks', title: 'Account level & unlocks', subtitle: 'What your level opens', group: 'Tools', to: '/resources/hall#unlocks' },
    { id: 't-notes', title: 'Notes', subtitle: 'Your scratchpad on the dashboard', group: 'Tools', to: '/#notes' },

    { id: 'a-export', title: 'Export backup', subtitle: 'Download your progress as a file', group: 'Actions', action: 'export' },
    { id: 'a-sidebar', title: 'Toggle sidebar', group: 'Actions', action: 'sidebar' },
    { id: 'a-keys', title: 'Keyboard shortcuts', group: 'Actions', action: 'shortcuts' },
    { id: 'a-lock', title: 'Lock PudyRSL', subtitle: 'Sign out on this device', group: 'Actions', action: 'lock' },
  ]

  for (const c of champions) {
    items.push({
      id: `c-${c.id}`,
      title: c.name,
      subtitle: `${c.rarity} · ${c.tagline}`,
      group: 'Champions',
      to: `/champions/${c.id}`,
      keywords: `${c.short} ${c.monogram}`,
    })
  }

  for (const p of phases) {
    for (const t of p.tasks) {
      items.push({ id: `r-${t.id}`, title: boldTitle(t.text), subtitle: p.short, group: 'Roadmap', to: `/roadmap#${t.id}`, keywords: plain(t.text) })
    }
  }

  for (const r of dontRules) items.push({ id: `d-${r.id}`, title: r.text, subtitle: `Don't · ${r.topic}`, group: 'Rules', to: '/rules#donts' })
  for (const q of openQuestions) items.push({ id: `q-${q.id}`, title: boldTitle(q.text), subtitle: 'Open question', group: 'Rules', to: '/rules#open-questions', keywords: plain(q.text) })

  const roster = (names: string[], subtitle: string, to: string) =>
    names.forEach((n) => items.push({ id: `n-${subtitle}-${n}`, title: n, subtitle, group: 'Roster', to }))
  roster(sacrifice.useFirst, 'Safe to sacrifice · use first', '/rank-up#fodder')
  roster(sacrifice.then, 'Safe to sacrifice · then', '/rank-up#fodder')
  roster(sacrifice.keep, "Keep · don't feed", '/rank-up#fodder')
  roster(sacrifice.keepHH7, "Keep · HH 7+ Epic, don't feed", '/rank-up#fodder')
  roster(['Bellower', 'Paragon', 'Bulwark', 'Apothecary', 'Frozen Banshee'], "Rare · keep, don't feed", '/rank-up#fodder')
  for (const n of notBuiltEarly.names) items.push({ id: `nb-${n.name}`, title: n.name, subtitle: `Not built early${n.note ? ` · ${n.note}` : ''}`, group: 'Roster', to: '/champions#bench' })
  for (const b of benchOptions) items.push({ id: `b-${b.name}`, title: b.name, subtitle: b.role, group: 'Roster', to: '/champions#bench' })

  return items
}

export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items.filter((i) => i.group === 'Pages' || i.group === 'Tools' || i.group === 'Actions')
  const tokens = q.split(/\s+/)
  const scored: { item: SearchItem; score: number }[] = []
  for (const item of items) {
    const title = item.title.toLowerCase()
    const hay = `${title} ${(item.subtitle ?? '').toLowerCase()} ${(item.keywords ?? '').toLowerCase()}`
    if (!tokens.every((t) => hay.includes(t))) continue
    let score = 0
    if (title === q) score += 100
    if (title.startsWith(q)) score += 50
    if (title.includes(q)) score += 25
    tokens.forEach((t) => {
      if (title.includes(t)) score += 8
    })
    score += { Pages: 6, Champions: 5, Tools: 5, Sections: 4, Roadmap: 2, Roster: 2, Rules: 1, Actions: 1 }[item.group]
    score -= title.length / 200
    scored.push({ item, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 40).map((s) => s.item)
}
