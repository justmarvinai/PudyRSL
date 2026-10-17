import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { championById } from '../../data/champions'
import type { ChampionId } from '../../data/types'
import { cn } from '../../lib/cn'
import { TERM_RE, termFor } from '../../lib/lexicon'
import { affinityColor, affinityIcon, difficultyColor, raidChampion, raidForCore, rarityColor, rarityFromRaid, resourceIcon } from '../../lib/rsl'

// Renders the guide's inline markdown (**bold**, [label](url), [Sourced]/[My call])
// and colour-codes Raid terms: champions, buffs/debuffs, stats, skills, affinities,
// rarities, difficulties, content, gear sets and masteries.

const MD = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\[([^\]]+)\](?!\()/g

const cssVar = (c: string) => ({ '--c': c }) as CSSProperties

interface Ctx {
  links: boolean
  highlight: boolean
  lastChamp: { id: ChampionId; at: number } | null
  pos: number
}

function highlight(text: string, ctx: Ctx, key: string): ReactNode[] {
  if (!ctx.highlight) return [text]
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(TERM_RE)) {
    const at = m.index ?? 0
    const word = m[0]
    const term = termFor(word)
    if (!term) continue
    if (at > last) out.push(text.slice(last, at))
    const k = `${key}t${i++}`
    const abs = ctx.pos + at
    switch (term.kind) {
      case 'champ': {
        ctx.lastChamp = { id: term.id, at: abs + word.length }
        const style = cssVar(rarityColor[championById[term.id].rarity])
        out.push(
          ctx.links ? (
            <Link key={k} to={`/champions/${term.id}`} className="term-champ" style={style} data-tip={`champ:${term.id}`}>
              {word}
            </Link>
          ) : (
            <span key={k} className="term-champ" style={style} data-tip={`champ:${term.id}`}>
              {word}
            </span>
          ),
        )
        break
      }
      case 'raid': {
        const rc = raidChampion(term.name)
        const rarity = rc ? rarityFromRaid(rc.rarity) : null
        out.push(
          <span key={k} className="term-champ" style={cssVar(rarity ? rarityColor[rarity] : 'var(--color-hi)')} data-tip={`raid:${term.name}`}>
            {word}
          </span>,
        )
        break
      }
      case 'effect':
        out.push(
          <span key={k} className="term-effect" style={cssVar(term.type === 'buff' ? 'var(--color-buff)' : 'var(--color-debuff)')} title={term.type === 'buff' ? 'Buff' : 'Debuff'}>
            {term.icon && <img src={term.icon} alt="" />}
            {word}
          </span>,
        )
        break
      case 'stat':
        out.push(
          <span key={k} className="term-stat">
            {word}
          </span>,
        )
        break
      case 'skill': {
        const lc = ctx.lastChamp
        const near = lc && abs - lc.at <= 32
        const skills = near ? raidForCore(lc.id)?.skills : undefined
        const has = skills?.some((s) => s.slot === word)
        out.push(
          <span key={k} className="term-skill" data-tip={has ? `skill:${lc!.id}:${word}` : undefined}>
            {word}
          </span>,
        )
        break
      }
      case 'affinity':
        out.push(
          <span key={k} className="term term-aff" style={cssVar(affinityColor[term.affinity])}>
            <img src={affinityIcon[term.affinity]} alt="" />
            {word}
          </span>,
        )
        break
      case 'rarity':
        out.push(
          <span key={k} className="term" style={cssVar(rarityColor[term.rarity])}>
            {word}
          </span>,
        )
        break
      case 'difficulty':
        out.push(
          <span key={k} className="term" style={cssVar(difficultyColor[term.key])}>
            {word}
          </span>,
        )
        break
      case 'content':
        out.push(
          <span key={k} className="term" style={cssVar(term.color)}>
            {word}
          </span>,
        )
        break
      case 'set':
        out.push(
          <span key={k} className="term" style={cssVar('var(--color-gear)')} title="Gear set">
            {word}
          </span>,
        )
        break
      case 'mastery':
        out.push(
          <span key={k} className="term" style={cssVar('var(--color-hi)')} title="Mastery">
            {word}
          </span>,
        )
        break
      case 'resource':
        out.push(
          <span key={k} className="term-effect" style={cssVar(term.res === 'gems' ? 'var(--color-gems)' : 'var(--color-silver)')}>
            <img src={resourceIcon[term.res]} alt="" />
            {word}
          </span>,
        )
        break
    }
    last = at + word.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function parse(text: string, ctx: Ctx, keyPrefix = ''): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  const base = ctx.pos
  for (const m of text.matchAll(MD)) {
    const at = m.index ?? 0
    if (at > last) {
      ctx.pos = base + last
      out.push(...highlight(text.slice(last, at), ctx, `${keyPrefix}${i}p`))
    }
    const key = `${keyPrefix}${i++}`
    if (m[1] !== undefined) {
      ctx.pos = base + at + 2
      out.push(<strong key={key}>{parse(m[1], ctx, `${key}-`)}</strong>)
    } else if (m[2] !== undefined) {
      out.push(
        <a key={key} href={m[3]} target="_blank" rel="noreferrer noopener">
          {m[2]}
        </a>,
      )
    } else if (m[4] !== undefined) {
      out.push(<LabelTag key={key} label={m[4]} />)
    }
    last = at + m[0].length
  }
  if (last < text.length) {
    ctx.pos = base + last
    out.push(...highlight(text.slice(last), ctx, `${keyPrefix}e`))
  }
  ctx.pos = base + text.length
  return out
}

/** Highlight Raid terms in a plain string (no markdown), e.g. skill text from raid-data. */
export function highlightText(text: string, links = false, keyPrefix = 'h'): ReactNode[] {
  return highlight(text, { links, highlight: true, lastChamp: null, pos: 0 }, keyPrefix)
}

export function Rich({
  text,
  className,
  as = 'span',
  links = true,
  plain = false,
}: {
  text: string
  className?: string
  as?: 'span' | 'p' | 'div'
  /** Set false when the text sits inside another link. */
  links?: boolean
  /** Markdown only, no term colouring. */
  plain?: boolean
}) {
  const Tag = as
  return <Tag className={cn('rich', className)}>{parse(text, { links, highlight: !plain, lastChamp: null, pos: 0 })}</Tag>
}

/** The guide's [Sourced] / [My call] labels. */
export function LabelTag({ label, className }: { label: string; className?: string }) {
  const lower = label.toLowerCase()
  const sourced = lower.startsWith('sourced')
  const mine = lower.startsWith('my ')
  return (
    <span
      data-tip={sourced ? 'label:sourced' : mine ? 'label:mycall' : undefined}
      className={cn('tag mx-0.5 align-middle', label.length > 28 && 'h-auto py-0.5 whitespace-normal', className)}
      style={cssVar(sourced ? 'var(--color-sourced)' : mine ? 'var(--color-mycall)' : 'var(--color-mid)')}
    >
      {label}
    </span>
  )
}
