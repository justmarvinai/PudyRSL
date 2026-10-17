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
import { difficultyColor } from '../../lib/rsl'
import { useStore } from '../../lib/store'
import { Segments } from '../ui/Progress'
import { Kbd } from '../ui/primitives'
import { navGroups } from './nav'

/** Square paper mark with a heavy P. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0" aria-hidden>
      <rect width="64" height="64" rx="6" fill="var(--color-paper)" />
      <path d="M17 52V12h17.5C44.2 12 50 17.6 50 26.2S44.2 40.4 34.5 40.4H27.6V52Z" fill="var(--color-ink)" />
      <path d="M27.6 21v10.6h6c3.5 0 5.6-2 5.6-5.3S37.1 21 33.6 21Z" fill="var(--color-paper)" />
    </svg>
  )
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={collapsed ? 34 : 32} />
      {!collapsed && (
        <div className="min-w-0">
          <div className="t-display text-[1.32rem] leading-none text-hi">
            Pudy<span className="text-low">RSL</span>
          </div>
          <div className="t-label mt-1 text-[0.6rem] text-low">Progression companion</div>
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
    roadmap: { text: `${pct(roadmapDone, tasks.length)}%` },
    champions: { text: `${r6}/13` },
    'clan-boss': cbDifficulty
      ? { text: difficultyNames[cbDifficulty].replace('Ultra-Nightmare', 'UNM').replace('Nightmare', 'NM'), color: difficultyColor[cbDifficulty] }
      : undefined,
    rules: { text: `${verified}/${openQuestions.length}` },
  } as Record<string, { text: string; color?: string } | undefined>
}

function DayBlock({ onNavigate }: { onNavigate?: () => void }) {
  const now = useNow()
  const startDate = useStore((s) => s.startDate)
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const day = dayNumber(startDate, now)
  const phase = currentPhase(day)
  const prog = phase ? phaseProgress({ flags, nums }, phase) : null
  return (
    <NavLink to="/roadmap" onClick={onNavigate} className="group mx-4 mb-5 block border-y border-edge py-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="t-label text-low">{day >= 1 ? 'Day' : 'Starts in'}</div>
          <div className="t-num mt-1 text-[3.4rem] leading-[0.82] text-hi">{day >= 1 ? day : `${1 - day}d`}</div>
        </div>
        <div className="pb-0.5 text-right">
          <div className="t-label text-hi">{phase ? (phase.id === 'day1' ? 'Checklist' : phase.short) : 'Plan'}</div>
          {prog && (
            <div className="mt-1 text-[0.72rem] text-low tabular-nums">
              {prog.done}/{prog.total} tasks
            </div>
          )}
        </div>
      </div>
      {prog && <Segments value={prog.done} total={prog.total} className="mt-3" height={5} />}
    </NavLink>
  )
}

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation()
  const section = location.pathname.split('/')[1] ?? ''
  const badges = useNavBadges()
  const now = useNow()
  const startDate = useStore((s) => s.startDate)
  const day = dayNumber(startDate, now)

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center px-4', collapsed && 'justify-center px-0')}>
        <NavLink to="/" onClick={onNavigate} aria-label="PudyRSL dashboard">
          <Logo collapsed={collapsed} />
        </NavLink>
      </div>

      {collapsed ? (
        <NavLink to="/roadmap" title="Roadmap" className="mx-2 mb-4 block border-y border-edge py-3 text-center">
          <div className="t-label text-[0.56rem] text-low">Day</div>
          <div className="t-num mt-1 text-[1.35rem] text-hi">{day >= 1 ? day : '–'}</div>
        </NavLink>
      ) : (
        <DayBlock onNavigate={onNavigate} />
      )}

      <nav className={cn('flex-1 space-y-5 overflow-y-auto px-2 pb-4', collapsed && 'px-2')}>
        {navGroups.map((g) => (
          <div key={g.label}>
            {!collapsed && <div className="t-label mb-1.5 px-2.5 text-[0.6rem] text-low">{g.label}</div>}
            <div className="space-y-px">
              {g.items.map((it) => {
                const active = section === it.match
                const badge = badges[it.match]
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    onClick={onNavigate}
                    title={collapsed ? `${it.label} (${it.hotkey})` : undefined}
                    className={cn(
                      'group relative flex h-9 items-center gap-3 rounded-[3px] px-2.5 text-[0.86rem] font-semibold transition-colors',
                      active ? 'text-ink' : 'text-mid hover:bg-raised-3 hover:text-hi',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={collapsed ? 'nav-active-c' : 'nav-active'}
                        className="absolute inset-0 rounded-[3px] bg-paper"
                        transition={{ type: 'spring', stiffness: 520, damping: 44 }}
                      />
                    )}
                    <span className={cn('t-num relative shrink-0 text-[0.78rem]', !collapsed && 'w-5', active ? 'text-ink/55' : 'text-low group-hover:text-mid')}>{it.num}</span>
                    {!collapsed && (
                      <>
                        <span className="relative flex-1 truncate">{it.label}</span>
                        {badge ? (
                          <span
                            className={cn('relative text-[0.7rem] font-bold tabular-nums', active ? 'text-ink/70' : 'text-low')}
                            style={!active && badge.color ? { color: badge.color } : undefined}
                          >
                            {badge.text}
                          </span>
                        ) : (
                          <Kbd className={cn('relative opacity-0 transition-opacity group-hover:opacity-100', active && 'hidden')}>{it.hotkey}</Kbd>
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

      <div className={cn('space-y-px border-t border-edge px-2 py-3', collapsed && 'px-2')}>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          title={collapsed ? 'Settings & backup' : undefined}
          className={({ isActive }) =>
            cn(
              'flex h-9 items-center gap-3 rounded-[3px] px-2.5 text-[0.84rem] font-semibold transition-colors',
              isActive ? 'bg-raised-3 text-hi' : 'text-mid hover:bg-raised-3 hover:text-hi',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">Settings & backup</span>
              <Kbd>,</Kbd>
            </>
          )}
        </NavLink>
        <button
          type="button"
          onClick={lockSite}
          title={collapsed ? 'Lock' : undefined}
          className={cn(
            'flex h-9 w-full items-center gap-3 rounded-[3px] px-2.5 text-[0.84rem] font-semibold text-mid transition-colors hover:bg-raised-3 hover:text-hi',
            collapsed && 'justify-center px-0',
          )}
        >
          <LockKeyhole className="size-4 shrink-0" />
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
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
      className="sticky top-0 z-30 hidden h-dvh shrink-0 border-r border-edge bg-raised lg:block"
    >
      <SidebarContent collapsed={collapsed} />
      <button
        type="button"
        onClick={() => setUi({ sidebarCollapsed: !collapsed })}
        className="absolute top-5 -right-3 grid size-6 place-items-center rounded-[3px] border border-edge-2 bg-raised-2 text-mid transition-colors hover:border-paper hover:text-hi"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title="Toggle sidebar ( [ )"
      >
        {collapsed ? <ChevronsRight className="size-3.5" /> : <ChevronsLeft className="size-3.5" />}
      </button>
    </motion.aside>
  )
}
