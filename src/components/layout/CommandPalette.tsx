import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  CornerDownLeft,
  Download,
  Keyboard,
  ListChecks,
  LockKeyhole,
  PanelLeft,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { championById } from '../../data/champions'
import type { ChampionId } from '../../data/types'
import { downloadBackup, lockSite } from '../../lib/backup'
import { cn } from '../../lib/cn'
import { rarityColor } from '../../lib/rsl'
import { buildSearchIndex, searchItems, type SearchGroup, type SearchItem } from '../../lib/search'
import { useStore } from '../../lib/store'
import { Portrait } from '../champion/Portrait'
import { Kbd } from '../ui/primitives'

const groupIcon: Record<SearchGroup, LucideIcon> = {
  Pages: BookOpen,
  Sections: ArrowRight,
  Tools: Wrench,
  Champions: Users,
  Roadmap: ListChecks,
  Roster: Sparkles,
  Rules: ShieldAlert,
  Actions: Sparkles,
}

const actionIcon: Record<NonNullable<SearchItem['action']>, LucideIcon> = {
  export: Download,
  sidebar: PanelLeft,
  shortcuts: Keyboard,
  lock: LockKeyhole,
}

export function CommandPalette({ open, onClose, onShortcuts }: { open: boolean; onClose: () => void; onShortcuts: () => void }) {
  return createPortal(
    <AnimatePresence>{open && <PaletteDialog onClose={onClose} onShortcuts={onShortcuts} />}</AnimatePresence>,
    document.body,
  )
}

// Mounted fresh on every open, so the query always starts empty.
function PaletteDialog({ onClose, onShortcuts }: { onClose: () => void; onShortcuts: () => void }) {
  const index = useMemo(() => buildSearchIndex(), [])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const list = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchItems(index, query), [index, query])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    list.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (item: SearchItem) => {
    onClose()
    if (item.action === 'export') downloadBackup()
    else if (item.action === 'sidebar') useStore.getState().setUi({ sidebarCollapsed: !useStore.getState().ui.sidebarCollapsed })
    else if (item.action === 'shortcuts') onShortcuts()
    else if (item.action === 'lock') lockSite()
    else if (item.to) navigate(item.to)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = results[active]
      if (item) run(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  let lastGroup: SearchGroup | null = null

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-start justify-center p-4 pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
    >
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="panel relative w-full max-w-2xl overflow-hidden border-edge-2 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)]"
        role="dialog"
        aria-label="Search PudyRSL"
      >
        <div className="flex items-center gap-3 border-b border-edge px-4">
          <Search className="size-[18px] text-mid" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search champions, tasks, teams, tools, fodder…"
            className="h-14 w-full bg-transparent text-[1rem] font-medium text-hi outline-none placeholder:text-low"
            aria-label="Search"
            autoFocus
          />
          <Kbd>Esc</Kbd>
        </div>
        <div ref={list} className="max-h-[55vh] overflow-y-auto py-2">
          {results.length === 0 && <div className="px-3 py-10 text-center text-sm text-low">Nothing in the guide matches “{query}”.</div>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null
            lastGroup = item.group
            const Icon = item.action ? actionIcon[item.action] : groupIcon[item.group]
            const isActive = i === active
            const champId = item.group === 'Champions' ? item.to?.match(/^\/champions\/([a-z]+)$/)?.[1] : undefined
            const champ = champId && champId in championById ? (champId as ChampionId) : undefined
            return (
              <div key={item.id}>
                {header && <div className="t-label px-4 pt-3 pb-1.5 text-[0.62rem] text-low">{header}</div>}
                <button
                  type="button"
                  data-idx={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                  className={cn('relative flex w-full items-center gap-3 px-4 py-2 text-left transition-colors', isActive ? 'bg-raised-3 text-hi' : 'text-mid')}
                >
                  {isActive && <span className="absolute inset-y-0 left-0 w-[3px] bg-paper" />}
                  {champ ? <Portrait id={champ} size={22} showAffinity={false} /> : <Icon className={cn('size-4 shrink-0', isActive ? 'text-hi' : 'text-low')} />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.88rem] font-semibold" style={champ ? { color: rarityColor[championById[champ].rarity] } : undefined}>
                      {item.title}
                    </span>
                    {item.subtitle && <span className="block truncate text-[0.74rem] text-low">{item.subtitle}</span>}
                  </span>
                  {isActive && <CornerDownLeft className="size-4 text-mid" />}
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-edge px-4 py-2.5 text-[0.72rem] text-low">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> open
          </span>
          <span className="ml-auto tabular-nums">{results.length} results</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
