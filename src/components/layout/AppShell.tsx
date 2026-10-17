import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router'
import { requestPersistentStorage } from '../../lib/backup'
import { useStore } from '../../lib/store'
import { Modal, Toaster } from '../ui/Overlay'
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

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-48 left-[12%] h-[520px] w-[720px] rounded-full bg-gold-500/[0.07] blur-[120px]" />
      <div className="absolute -top-32 right-[-10%] h-[460px] w-[620px] rounded-full bg-[#7a3cff]/[0.07] blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[30%] h-[420px] w-[680px] rounded-full bg-ember-500/[0.045] blur-[140px]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.025) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.025) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%)',
        }}
      />
      {[
        { l: '18%', t: '22%', d: '0s', s: 3 },
        { l: '72%', t: '14%', d: '2.2s', s: 2 },
        { l: '85%', t: '48%', d: '4.1s', s: 3 },
        { l: '40%', t: '64%', d: '1.3s', s: 2 },
        { l: '9%', t: '78%', d: '3.4s', s: 2 },
      ].map((e, i) => (
        <span
          key={i}
          className="absolute animate-float rounded-full bg-gold-300/60 blur-[1px]"
          style={{ left: e.l, top: e.t, width: e.s, height: e.s, animationDelay: e.d, boxShadow: '0 0 12px 2px rgb(246 196 99 / 0.5)' }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
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
      <Backdrop />
      <Sidebar />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar onSearch={() => setPaletteOpen(true)} onMenu={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-6 pb-20 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="absolute inset-y-0 left-0 w-[280px] border-r border-white/[0.07] bg-ink-925"
            >
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn btn-ghost absolute top-5 right-3 z-10 size-8 p-0" aria-label="Close menu">
                <X className="size-4" />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onShortcuts={() => setShortcutsOpen(true)} />

      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
        <div className="divide-y divide-white/[0.05] px-5 py-2">
          {shortcutRows.map(([keys, label]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-sm text-fg-muted">
              <span>{label}</span>
              <span className="flex items-center gap-1">
                {keys.map((k) => (k === '…' ? <span key={k} className="text-fg-subtle">…</span> : <Kbd key={k}>{k}</Kbd>))}
              </span>
            </div>
          ))}
        </div>
      </Modal>

      <Toaster />
    </div>
  )
}
