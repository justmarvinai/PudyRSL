import { motion } from 'motion/react'
import { ChevronsLeft, ChevronsRight, LockKeyhole, Settings } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { champions } from '../../data/champions'
import { difficultyNames } from '../../data/clanBoss'
import { phases } from '../../data/roadmap'
import { openQuestions } from '../../data/rules'
import { lockSite } from '../../lib/backup'
import { isRankSix, isTaskDone, phaseProgress } from '../../lib/checks'
import { cn } from '../../lib/cn'
import { currentPhase, dayNumber, useNow } from '../../lib/dates'
import { pct } from '../../lib/format'
import { useStore } from '../../lib/store'
import { ProgressBar } from '../ui/Progress'
import { Kbd } from '../ui/primitives'
import { navGroups } from './nav'

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="relative grid size-10 shrink-0 place-items-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-400/30 via-gold-600/10 to-transparent blur-md" />
        <svg viewBox="0 0 64 64" className="relative size-10">
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe2a1" />
              <stop offset="0.55" stopColor="#e8a83a" />
              <stop offset="1" stopColor="#a8571a" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="15" fill="#0b0e15" stroke="rgb(255 255 255 / 0.08)" />
          <path d="M32 9 50 16v13c0 12-7.8 20.6-18 24.6C21.8 49.6 14 41 14 29V16z" fill="none" stroke="url(#logo-g)" strokeWidth="3.6" strokeLinejoin="round" />
          <path d="M26 42V22h8.2a6.2 6.2 0 0 1 0 12.4H26" fill="none" stroke="url(#logo-g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <div className="font-display text-[1.2rem] font-bold tracking-wide">
            <span className="text-gold-gradient">Pudy</span>
            <span className="text-fg">RSL</span>
          </div>
          <div className="text-[0.68rem] font-medium tracking-wide text-fg-subtle">Progression companion</div>
        </div>
      )}
    </div>
  )
}

function useNavBadges() {
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const questions = useStore((s) => s.questions)
  const cbDifficulty = useStore((s) => s.cbDifficulty)
  const st = { flags, nums }
  const tasks = phases.flatMap((p) => p.tasks)
  const roadmapDone = tasks.filter((t) => isTaskDone(st, t)).length
  const r6 = champions.filter((c) => isRankSix(st, c)).length
  const verified = openQuestions.filter((q) => questions[q.id]?.verified).length
  return {
    roadmap: `${pct(roadmapDone, tasks.length)}%`,
    champions: `${r6}/13`,
    'clan-boss': cbDifficulty ? difficultyNames[cbDifficulty].replace('Ultra-Nightmare', 'UNM').replace('Nightmare', 'NM') : undefined,
    rules: `${verified}/${openQuestions.length}`,
  } as Record<string, string | undefined>
}

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation()
  const section = location.pathname.split('/')[1] ?? ''
  const badges = useNavBadges()
  const now = useNow()
  const startDate = useStore((s) => s.startDate)
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const day = dayNumber(startDate, now)
  const phase = currentPhase(day)
  const prog = phase ? phaseProgress({ flags, nums }, phase) : null

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center px-4 pt-5 pb-4', collapsed && 'justify-center px-0')}>
        <NavLink to="/" onClick={onNavigate} aria-label="PudyRSL dashboard">
          <Logo collapsed={collapsed} />
        </NavLink>
      </div>

      {!collapsed && (
        <NavLink
          to="/roadmap"
          onClick={onNavigate}
          className="group mx-3 mb-3 block rounded-xl border border-gold-500/15 bg-gradient-to-br from-gold-500/[0.08] to-transparent p-3 transition hover:border-gold-400/35"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[0.95rem] font-bold text-gold-300">{day >= 1 ? `Day ${day}` : `Starts in ${1 - day}d`}</span>
            <span className="text-[0.68rem] font-semibold tracking-wide text-fg-subtle uppercase">{phase ? (phase.id === 'day1' ? 'Checklist' : phase.short) : 'Plan'}</span>
          </div>
          {prog && (
            <>
              <ProgressBar value={pct(prog.done, prog.total)} className="mt-2" height={4} />
              <div className="mt-1.5 text-[0.7rem] text-fg-subtle">
                {prog.done}/{prog.total} {phase?.short} tasks done
              </div>
            </>
          )}
        </NavLink>
      )}

      <nav className={cn('flex-1 space-y-4 overflow-y-auto px-3 pb-4', collapsed && 'px-2')}>
        {navGroups.map((g) => (
          <div key={g.label}>
            {!collapsed && <div className="eyebrow mb-1.5 px-2.5 text-[0.62rem]">{g.label}</div>}
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = section === it.match
                const Icon = it.icon
                const badge = badges[it.match]
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    onClick={onNavigate}
                    title={collapsed ? `${it.label} (${it.hotkey})` : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[0.86rem] font-medium transition-colors',
                      active ? 'text-fg' : 'text-fg-muted hover:bg-white/[0.035] hover:text-fg',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={collapsed ? 'nav-active-c' : 'nav-active'}
                        className="absolute inset-0 rounded-xl border border-gold-400/20 bg-gradient-to-r from-gold-500/[0.14] via-gold-500/[0.05] to-transparent"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      >
                        <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-gold-300 to-gold-600 shadow-[0_0_10px_rgb(246_196_99/0.8)]" />
                      </motion.span>
                    )}
                    <Icon className={cn('relative size-[18px] shrink-0', active ? 'text-gold-300' : 'text-fg-subtle group-hover:text-fg-muted')} />
                    {!collapsed && (
                      <>
                        <span className="relative flex-1 truncate">{it.label}</span>
                        {badge ? (
                          <span className="relative rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[0.66rem] font-semibold text-fg-muted tabular-nums">{badge}</span>
                        ) : (
                          <Kbd className="relative opacity-0 transition group-hover:opacity-100">{it.hotkey}</Kbd>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('space-y-0.5 border-t border-white/[0.06] px-3 py-3', collapsed && 'px-2')}>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-2.5 py-2 text-[0.84rem] font-medium transition-colors',
              isActive ? 'bg-white/[0.06] text-fg' : 'text-fg-muted hover:bg-white/[0.035] hover:text-fg',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Settings className="size-[18px] shrink-0" />
          {!collapsed && 'Settings & backup'}
        </NavLink>
        <button
          type="button"
          onClick={lockSite}
          title={collapsed ? 'Lock' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[0.84rem] font-medium text-fg-muted transition-colors hover:bg-white/[0.035] hover:text-fg',
            collapsed && 'justify-center px-0',
          )}
        >
          <LockKeyhole className="size-[18px] shrink-0" />
          {!collapsed && 'Lock'}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useStore((s) => s.ui.sidebarCollapsed)
  const setUi = useStore((s) => s.setUi)
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="sticky top-0 z-30 hidden h-dvh shrink-0 border-r border-white/[0.06] bg-ink-925/80 backdrop-blur-xl lg:block"
    >
      <SidebarContent collapsed={collapsed} />
      <button
        type="button"
        onClick={() => setUi({ sidebarCollapsed: !collapsed })}
        className="absolute top-7 -right-3 grid size-6 place-items-center rounded-full border border-white/10 bg-ink-800 text-fg-muted shadow-lg transition hover:border-gold-400/50 hover:text-gold-300"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title="Toggle sidebar ( [ )"
      >
        {collapsed ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
      </button>
    </motion.aside>
  )
}
