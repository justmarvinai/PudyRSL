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
import { downloadBackup, lockSite } from '../../lib/backup'
import { cn } from '../../lib/cn'
import { buildSearchIndex, searchItems, type SearchGroup, type SearchItem } from '../../lib/search'
import { useStore } from '../../lib/store'
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
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="card relative w-full max-w-2xl overflow-hidden"
        role="dialog"
        aria-label="Search PudyRSL"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <Search className="size-[18px] text-gold-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search champions, tasks, teams, tools, fodder…"
            className="h-14 w-full bg-transparent text-[0.95rem] text-fg outline-none placeholder:text-fg-subtle"
            aria-label="Search"
            autoFocus
          />
          <Kbd>Esc</Kbd>
        </div>
        <div ref={list} className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && <div className="px-3 py-10 text-center text-sm text-fg-subtle">Nothing in the guide matches “{query}”.</div>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null
            lastGroup = item.group
            const Icon = item.action ? actionIcon[item.action] : groupIcon[item.group]
            return (
              <div key={item.id}>
                {header && <div className="eyebrow px-3 pt-3 pb-1.5 text-[0.62rem]">{header}</div>}
                <button
                  type="button"
                  data-idx={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    i === active ? 'bg-gold-400/[0.1] text-fg' : 'text-fg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-lg border',
                      i === active ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-white/[0.07] bg-white/[0.03] text-fg-subtle',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.875rem] font-medium">{item.title}</span>
                    {item.subtitle && <span className="block truncate text-[0.75rem] text-fg-subtle">{item.subtitle}</span>}
                  </span>
                  {i === active && <CornerDownLeft className="size-4 text-gold-400" />}
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[0.72rem] text-fg-subtle">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> open
          </span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
