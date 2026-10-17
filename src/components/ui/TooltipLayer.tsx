import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { championById } from '../../data/champions'
import { labelLegend } from '../../data/guide'
import type { ChampionId } from '../../data/types'
import { championProgress, championStatus } from '../../lib/checks'
import { affinityFromRaid, raidChampion, raidForCore, raidSource, rarityColor, rarityFromRaid, roleLabel } from '../../lib/rsl'
import { useStore } from '../../lib/store'
import { AffinityTag, Portrait, RaidPortrait, RarityTag, useAffinity } from '../champion/Portrait'
import { highlightText } from './Rich'
import { Segments } from './Progress'

// One global tooltip for every element with a data-tip key:
//   champ:<id>  raid:<name>  skill:<id>:<A1|A2|A3>  label:sourced|mycall  text:<message>

function Foot({ children }: { children: ReactNode }) {
  return <div className="mt-3 border-t border-edge pt-2 text-[0.66rem] text-low">{children}</div>
}

function ChampTip({ id }: { id: ChampionId }) {
  const c = championById[id]
  const flags = useStore((s) => s.flags)
  const nums = useStore((s) => s.nums)
  const { affinity, source } = useAffinity(id)
  const p = championProgress({ flags, nums }, c)
  const raid = raidForCore(id)
  return (
    <div className="flex gap-3">
      <Portrait id={id} size={64} />
      <div className="min-w-0 flex-1">
        <div className="t-title text-[0.98rem]" style={{ color: rarityColor[c.rarity] }}>
          {c.name}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <RarityTag rarity={c.rarity} />
          <AffinityTag affinity={affinity} source={source} />
          <span className="tag">Wave {c.wave}</span>
        </div>
        <div className="mt-2 text-[0.78rem] text-mid">{c.tagline}</div>
        {raid && (
          <div className="mt-1 text-[0.72rem] text-low">
            {raid.faction} · {roleLabel(raid.role)}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between text-[0.7rem]">
          <span className="font-semibold text-hi">{championStatus({ flags, nums }, c)}</span>
          <span className="text-low tabular-nums">
            {p.done}/{p.total} steps
          </span>
        </div>
        <Segments value={p.done} total={p.total} className="mt-1.5" />
      </div>
    </div>
  )
}

function RaidTip({ name }: { name: string }) {
  const rc = raidChampion(name)
  if (!rc) return null
  const rarity = rarityFromRaid(rc.rarity)
  return (
    <div>
      <div className="flex gap-3">
        <RaidPortrait name={name} size={56} />
        <div className="min-w-0">
          <div className="t-title text-[0.95rem]" style={{ color: rarity ? rarityColor[rarity] : undefined }}>
            {rc.name}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {rarity && <RarityTag rarity={rarity} />}
            <AffinityTag affinity={affinityFromRaid(rc.affinity)} source="raid-data" />
          </div>
          <div className="mt-2 space-y-0.5 text-[0.75rem] text-mid">
            <div>
              <span className="text-low">Faction</span> {rc.faction}
            </div>
            <div>
              <span className="text-low">Role</span> {roleLabel(rc.role)}
            </div>
            {rc.aura && (
              <div>
                <span className="text-low">Aura</span> {rc.aura}
              </div>
            )}
          </div>
        </div>
      </div>
      <Foot>Champion info from raid-data (April 2021 snapshot) — not from your guide.</Foot>
    </div>
  )
}

function SkillTip({ id, slot }: { id: ChampionId; slot: string }) {
  const raid = raidForCore(id)
  const s = raid?.skills?.find((x) => x.slot === slot)
  if (!raid || !s) return null
  const c = championById[id]
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="term-skill">{slot}</span>
        <span className="t-title text-[0.95rem] text-hi">{s.name}</span>
      </div>
      <div className="mt-0.5 text-[0.72rem]" style={{ color: rarityColor[c.rarity] }}>
        {c.name}
      </div>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-mid">{highlightText(s.description.replace(/\[([^\]]+)\]/g, '$1'))}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {s.passive && <span className="tag">Passive</span>}
        {s.cooldown && (
          <span className="tag" style={{ '--c': 'var(--color-hi)' } as CSSProperties}>
            CD {s.cooldown}
            {s.minCooldown && s.minCooldown < s.cooldown ? ` → ${s.minCooldown} booked` : ''}
          </span>
        )}
        {s.books.length > 0 && <span className="tag">{s.books.length} books</span>}
      </div>
      <Foot>
        Skill text from {raidSource.name} (game v{raid.gameVersion}) — later reworks or ascension changes aren&apos;t included.
      </Foot>
    </div>
  )
}

function LabelTip({ which }: { which: string }) {
  return (
    <div className="text-[0.8rem] text-mid">
      <span className="font-bold text-hi">{which === 'sourced' ? '[Sourced]' : '[My call]'}</span> ={' '}
      {which === 'sourced' ? labelLegend.sourced : labelLegend.myCall}
      <div className="mt-1.5 text-[0.72rem] text-low">{labelLegend.ratings}</div>
    </div>
  )
}

function content(key: string): ReactNode {
  const [kind, a, b] = key.split(':')
  if (kind === 'champ' && a in championById) return <ChampTip id={a as ChampionId} />
  if (kind === 'raid') return <RaidTip name={key.slice(5)} />
  if (kind === 'skill') return <SkillTip id={a as ChampionId} slot={b} />
  if (kind === 'label') return <LabelTip which={a} />
  if (kind === 'text') return <div className="text-[0.8rem] text-mid">{decodeURIComponent(key.slice(5))}</div>
  return null
}

export function TooltipLayer() {
  const [tip, setTip] = useState<{ key: string; rect: DOMRect } | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const target = (e: Event) => (e.target instanceof Element ? e.target.closest('[data-tip]') : null)
    const show = (el: Element) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        const key = el.getAttribute('data-tip')
        if (key) setTip({ key, rect: el.getBoundingClientRect() })
      }, 140)
    }
    const hide = () => {
      window.clearTimeout(timer.current)
      setTip(null)
    }
    const over = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const el = target(e)
      if (el) show(el)
    }
    const out = (e: PointerEvent) => {
      const el = target(e)
      if (el && !(e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) hide()
    }
    const focusIn = (e: FocusEvent) => {
      const el = target(e)
      if (el) show(el)
    }
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)
    document.addEventListener('focusin', focusIn)
    document.addEventListener('focusout', hide)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('pointerdown', hide, true)
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
      document.removeEventListener('focusin', focusIn)
      document.removeEventListener('focusout', hide)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('pointerdown', hide, true)
    }
  }, [])

  useLayoutEffect(() => {
    if (!tip || !box.current) {
      setPos(null)
      return
    }
    const b = box.current.getBoundingClientRect()
    const gap = 8
    const below = tip.rect.bottom + gap + b.height < window.innerHeight
    const top = below ? tip.rect.bottom + gap : Math.max(8, tip.rect.top - gap - b.height)
    const left = Math.min(Math.max(8, tip.rect.left), window.innerWidth - b.width - 8)
    setPos({ top, left })
  }, [tip])

  const body = tip ? content(tip.key) : null

  return createPortal(
    <AnimatePresence>
      {tip && body && (
        <motion.div
          key={tip.key + tip.rect.top}
          ref={box}
          role="tooltip"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: pos ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          transition={{ duration: 0.12 }}
          className="panel pointer-events-none fixed z-[95] w-[300px] border-edge-2 p-3 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.9)]"
          style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
        >
          {body}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
