import { BookOpen, Castle, Gem, LayoutDashboard, Route, ShieldAlert, Skull, Star, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
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
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, hotkey: '1', match: '' },
      { to: '/roadmap', label: 'Roadmap', icon: Route, hotkey: '2', match: 'roadmap' },
    ],
  },
  {
    label: 'Battle',
    items: [
      { to: '/clan-boss', label: 'Clan Boss', icon: Skull, hotkey: '3', match: 'clan-boss' },
      { to: '/dungeons', label: 'Dungeons & Arena', icon: Castle, hotkey: '4', match: 'dungeons' },
    ],
  },
  {
    label: 'Build',
    items: [
      { to: '/champions', label: 'Champions', icon: Users, hotkey: '5', match: 'champions' },
      { to: '/rank-up', label: '6★ Plan', icon: Star, hotkey: '6', match: 'rank-up' },
      { to: '/resources', label: 'Resources', icon: Gem, hotkey: '7', match: 'resources' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { to: '/rules', label: 'Rules & Checks', icon: ShieldAlert, hotkey: '8', match: 'rules' },
      { to: '/guide', label: 'Full Guide', icon: BookOpen, hotkey: '9', match: 'guide' },
    ],
  },
]

export const allNavItems = navGroups.flatMap((g) => g.items)

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
