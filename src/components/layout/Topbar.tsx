import { motion } from 'motion/react'
import { ChevronRight, CloudDownload, Menu, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { championById } from '../../data/champions'
import type { ChampionId } from '../../data/types'
import { downloadBackup } from '../../lib/backup'
import { cn } from '../../lib/cn'
import { currentPhase, dayNumber, useNow } from '../../lib/dates'
import { useStore } from '../../lib/store'
import { Kbd } from '../ui/primitives'
import { pageTitles } from './nav'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function useBackupDue(now: Date): boolean {
  const last = useStore((s) => s.ui.lastBackupAt)
  const hasProgress = useStore((s) => Object.keys(s.flags).length + Object.keys(s.nums).length > 0)
  if (!hasProgress) return false
  if (!last) return true
  return now.getTime() - new Date(last).getTime() > 14 * 86_400_000
}

export function Topbar({ onSearch, onMenu }: { onSearch: () => void; onMenu: () => void }) {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  const section = parts[0] ?? ''
  const title = pageTitles[section] ?? 'PudyRSL'
  const champ = section === 'champions' && parts[1] ? championById[parts[1] as ChampionId] : undefined
  const now = useNow()
  const startDate = useStore((s) => s.startDate)
  const day = dayNumber(startDate, now)
  const phase = currentPhase(day)
  const backupDue = useBackupDue(now)

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.05] bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} className="btn btn-ghost size-9 p-0 lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>

        <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link to={section ? `/${section}` : '/'} className={cn('truncate font-semibold', champ ? 'text-fg-muted hover:text-fg' : 'text-fg')}>
            {title}
          </Link>
          {champ && (
            <>
              <ChevronRight className="size-4 shrink-0 text-fg-subtle" />
              <motion.span key={champ.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="truncate font-semibold text-fg">
                {champ.name}
              </motion.span>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/[0.07] px-3 py-1 text-xs font-semibold text-gold-300 sm:inline-flex lg:hidden">
            {day >= 1 ? `Day ${day}` : `Starts in ${1 - day}d`}
            {phase && <span className="text-fg-subtle">· {phase.short}</span>}
          </span>

          {backupDue && (
            <button
              type="button"
              onClick={downloadBackup}
              className="hidden items-center gap-2 rounded-full border border-warn/30 bg-warn/[0.08] px-3 py-1.5 text-xs font-semibold text-warn transition hover:bg-warn/[0.14] md:inline-flex"
              title="Progress lives in this browser only — download a backup file"
            >
              <CloudDownload className="size-3.5" />
              Back up progress
            </button>
          )}

          <button
            type="button"
            onClick={onSearch}
            className="group flex h-9 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-fg-subtle transition hover:border-gold-400/30 hover:text-fg-muted sm:w-64"
          >
            <Search className="size-4 text-fg-subtle group-hover:text-gold-400" />
            <span className="hidden flex-1 text-left sm:inline">Search the guide…</span>
            <span className="hidden items-center gap-1 sm:flex">
              <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
