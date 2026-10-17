import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { requestPersistentStorage } from '../../lib/backup'
import { useStore } from '../../lib/store'
import { Modal, Toaster } from '../ui/Overlay'
import { TooltipLayer } from '../ui/TooltipLayer'
import { Kbd } from '../ui/primitives'
import { CommandPalette } from './CommandPalette'
import { allNavItems } from './nav'
import { Sidebar, SidebarContent } from './Sidebar'
import { Topbar } from './Topbar'

const isTyping = (el: EventTarget | null) => {
  const t = el as HTMLElement | null
  if (!t) return false
  return t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)
}

/** Scrolls to and flashes the element named in the URL hash. */
function useHashFocus() {
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const id = decodeURIComponent(location.hash.slice(1))
    const timers = [80, 360, 720].map((ms) =>
      window.setTimeout(() => {
        const el = document.getElementById(id)
        if (!el || el.dataset.flashed === location.key) return
        el.dataset.flashed = location.key
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.remove('flash')
        void el.offsetWidth
        el.classList.add('flash')
      }, ms),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [location.hash, location.key])
}

const shortcutRows: [string[], string][] = [
  [['Ctrl', 'K'], 'Search everything (also /)'],
  [['1', '…', '9'], 'Jump to a section'],
  [[','], 'Settings & backup'],
  [['['], 'Collapse / expand the sidebar'],
  [['←', '→'], 'Previous / next champion (on a champion page)'],
  [['?'], 'Show this list'],
  [['Esc'], 'Close dialogs'],
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  useHashFocus()

  useEffect(() => requestPersistentStorage(), [])

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      if (paletteOpen || shortcutsOpen) return
      if (e.key === '/') {
        e.preventDefault()
        setPaletteOpen(true)
      } else if (e.key === '?') {
        setShortcutsOpen(true)
      } else if (e.key === '[') {
        const s = useStore.getState()
        s.setUi({ sidebarCollapsed: !s.ui.sidebarCollapsed })
      } else if (e.key === ',') {
        navigate('/settings')
      } else {
        const item = allNavItems.find((n) => n.hotkey === e.key)
        if (item) navigate(item.to)
      }
    },
    [navigate, paletteOpen, shortcutsOpen],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  const parts = location.pathname.split('/').filter(Boolean)
  const section = parts[0] ?? 'home'
  const pageKey = section === 'champions' ? `champions/${parts[1] ?? ''}` : section

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 })
    setDrawerOpen(false)
  }, [pageKey, location.hash])

  return (
    <div className="relative flex min-h-dvh">
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar onSearch={() => setPaletteOpen(true)} onMenu={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-8 pb-24 sm:px-6 lg:px-10 lg:pt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/75" onClick={() => setDrawerOpen(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              className="absolute inset-y-0 left-0 w-[272px] border-r border-edge bg-raised"
            >
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn btn-ghost absolute top-4 right-3 z-10 size-8 p-0" aria-label="Close menu">
                <X className="size-4" />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onShortcuts={() => setShortcutsOpen(true)} />

      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
        <div className="divide-y divide-edge px-5 py-2">
          {shortcutRows.map(([keys, label]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-[0.86rem] text-mid">
              <span>{label}</span>
              <span className="flex items-center gap-1">
                {keys.map((k) => (k === '…' ? <span key={k} className="text-low">…</span> : <Kbd key={k}>{k}</Kbd>))}
              </span>
            </div>
          ))}
        </div>
      </Modal>

      <Toaster />
      <TooltipLayer />
    </div>
  )
}
