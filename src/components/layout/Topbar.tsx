import { motion } from 'motion/react'
import { CloudDownload, Menu, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { championById } from '../../data/champions'
import type { ChampionId } from '../../data/types'
import { downloadBackup } from '../../lib/backup'
import { cn } from '../../lib/cn'
import { currentPhase, dayNumber, useNow } from '../../lib/dates'
import { rarityColor } from '../../lib/rsl'
import { useStore } from '../../lib/store'
import { Kbd } from '../ui/primitives'
import { navItemFor, pageTitles } from './nav'

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
  const title = pageTitles[section] ?? 'Not found'
  const num = navItemFor(section)?.num
  const champ = section === 'champions' && parts[1] ? championById[parts[1] as ChampionId] : undefined
  const now = useNow()
  const startDate = useStore((s) => s.startDate)
  const day = dayNumber(startDate, now)
  const phase = currentPhase(day)
  const backupDue = useBackupDue(now)

  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-base">
      <div className="mx-auto flex h-14 w-full max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button type="button" onClick={onMenu} className="btn btn-ghost size-9 p-0 lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>

        <nav className="t-label flex min-w-0 items-center gap-2 text-[0.7rem]" aria-label="Breadcrumb">
          <Link to="/" className="hidden text-low transition-colors hover:text-hi sm:inline">
            PudyRSL
          </Link>
          <span className="hidden text-edge-2 sm:inline">/</span>
          <Link to={section ? `/${section}` : '/'} className={cn('truncate transition-colors', champ ? 'text-low hover:text-hi' : 'text-hi')}>
            {num && <span className="mr-1.5 text-low">{num}</span>}
            {title}
          </Link>
          {champ && (
            <>
              <span className="text-edge-2">/</span>
              <motion.span key={champ.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="truncate" style={{ color: rarityColor[champ.rarity] }}>
                {champ.name}
              </motion.span>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="t-label hidden items-center gap-1.5 text-hi sm:inline-flex lg:hidden">
            {day >= 1 ? `Day ${day}` : `Starts in ${1 - day}d`}
            {phase && <span className="text-low">· {phase.short}</span>}
          </span>

          {backupDue && (
            <button
              type="button"
              onClick={downloadBackup}
              className="btn hidden h-9 border-warn/50 text-warn hover:border-warn hover:bg-warn/10 md:inline-flex"
              title="Progress lives in this browser only — download a backup file"
            >
              <CloudDownload className="size-4" />
              Back up progress
            </button>
          )}

          <button
            type="button"
            onClick={onSearch}
            className="group flex h-9 items-center gap-2.5 rounded-[4px] border border-edge-2 bg-raised px-3 text-[0.84rem] text-low transition-colors hover:border-mid hover:text-mid sm:w-72"
          >
            <Search className="size-4" />
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
