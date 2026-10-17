import { Fragment, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

// Renders the guide's inline markdown: **bold**, [label](url) and bracket
// labels such as [Sourced] or [My call].
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\[([^\]]+)\](?!\()/g

function parse(text: string, keyPrefix = ''): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const key = `${keyPrefix}${i++}`
    if (m[1] !== undefined) {
      out.push(<strong key={key}>{parse(m[1], `${key}-`)}</strong>)
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
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Rich({ text, className, as = 'span' }: { text: string; className?: string; as?: 'span' | 'p' | 'div' }) {
  const Tag = as
  return <Tag className={cn('rich', className)}>{parse(text).map((n, i) => <Fragment key={i}>{n}</Fragment>)}</Tag>
}

/** Pill for the guide's [Sourced] / [My call] labels. */
export function LabelTag({ label, className }: { label: string; className?: string }) {
  const lower = label.toLowerCase()
  const sourced = lower.startsWith('sourced')
  const mine = lower.startsWith('my ')
  return (
    <span
      title={sourced ? 'Sourced = a cited fact or a published team/speed tune' : mine ? 'My call = a recommendation built from cited ratings and kits' : undefined}
      className={cn(
        'mx-0.5 inline-flex translate-y-[-1px] items-center rounded-md border px-1.5 py-px align-middle text-[0.68rem] font-semibold tracking-wide',
        label.length > 28 ? 'max-w-full whitespace-normal' : 'whitespace-nowrap',
        sourced && 'border-sourced/30 bg-sourced/10 text-sourced',
        mine && 'border-mycall/30 bg-mycall/10 text-mycall',
        !sourced && !mine && 'border-white/10 bg-white/5 text-fg-muted',
        className,
      )}
    >
      {label}
    </span>
  )
}
