export interface NavItem {
  to: string
  label: string
  /** Two-digit section number shown in the sidebar and page headers. */
  num: string
  hotkey: string
  match: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', num: '01', hotkey: '1', match: '' },
      { to: '/roadmap', label: 'Roadmap', num: '02', hotkey: '2', match: 'roadmap' },
    ],
  },
  {
    label: 'Battle',
    items: [
      { to: '/clan-boss', label: 'Clan Boss', num: '03', hotkey: '3', match: 'clan-boss' },
      { to: '/dungeons', label: 'Dungeons & Arena', num: '04', hotkey: '4', match: 'dungeons' },
    ],
  },
  {
    label: 'Build',
    items: [
      { to: '/champions', label: 'Champions', num: '05', hotkey: '5', match: 'champions' },
      { to: '/rank-up', label: '6★ Plan', num: '06', hotkey: '6', match: 'rank-up' },
      { to: '/resources', label: 'Resources', num: '07', hotkey: '7', match: 'resources' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { to: '/rules', label: 'Rules & Checks', num: '08', hotkey: '8', match: 'rules' },
      { to: '/guide', label: 'Full Guide', num: '09', hotkey: '9', match: 'guide' },
    ],
  },
]

export const allNavItems = navGroups.flatMap((g) => g.items)

export const navItemFor = (section: string) => allNavItems.find((n) => n.match === section)

export const pageTitles: Record<string, string> = {
  '': 'Dashboard',
  roadmap: 'Roadmap',
  'clan-boss': 'Clan Boss',
  dungeons: 'Dungeons & Arena',
  champions: 'Champions',
  'rank-up': '6★ Plan',
  resources: 'Resources',
  rules: 'Rules & Checks',
  guide: 'Full Guide',
  settings: 'Settings',
}
