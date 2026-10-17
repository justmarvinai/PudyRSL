import { motion } from 'motion/react'
import { ChevronDown, ChevronUp, Download, Search } from 'lucide-react'
import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import guideMarkdown from '../../rsl_data.md?raw'
import { PageHeader } from '../components/layout/PageHeader'
import { highlightText, LabelTag } from '../components/ui/Rich'
import { Kbd } from '../components/ui/primitives'
import { guideMeta } from '../data/guide'
import { cn } from '../lib/cn'

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

function buildToc(md: string): TocItem[] {
  return md
    .split('\n')
    .filter((l) => /^#{2,3}\s/.test(l))
    .map((l) => {
      const level = l.startsWith('### ') ? 3 : 2
      const text = l.replace(/^#{2,3}\s+/, '').replace(/\\/g, '')
      return { id: slug(text), text: text.replace(/\s*\[[^\]]*\]\s*$/, ''), level: level as 2 | 3 }
    })
}

const LABEL = /\[((?:Sourced|My )[^\]]*)\]/g

/** Colour-codes Raid terms and turns [Sourced] / [My call] into tags, leaving links and code alone. */
function hl(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    const out: ReactNode[] = []
    let last = 0
    for (const m of child.matchAll(LABEL)) {
      const at = m.index ?? 0
      if (at > last) out.push(...highlightText(child.slice(last, at), true, `s${last}-`))
      out.push(<LabelTag key={`l${at}`} label={m[1]} />)
      last = at + m[0].length
    }
    if (last < child.length) out.push(...highlightText(child.slice(last), true, `s${last}-`))
    return out
  })
}

const headingComponents: Components = {
  h2: ({ children }) => {
    const t = textOf(Children.toArray(children))
    return <h2 id={slug(t)}>{children}</h2>
  },
  h3: ({ children }) => {
    const t = textOf(Children.toArray(children))
    return <h3 id={slug(t)}>{children}</h3>
  },
  p: ({ children }) => <p>{hl(children)}</p>,
  li: ({ children, className }) => <li className={className}>{hl(children)}</li>,
  td: ({ children }) => <td>{hl(children)}</td>,
  strong: ({ children }) => <strong>{hl(children)}</strong>,
  em: ({ children }) => <em>{hl(children)}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  ),
}

type HighlightRegistry = { set: (name: string, h: unknown) => void; delete: (name: string) => void }

export default function Guide() {
  const toc = useMemo(() => buildToc(guideMarkdown), [])
  const article = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Range[]>([])
  const [current, setCurrent] = useState(0)
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '')

  // Search with the CSS Custom Highlight API (no DOM rewriting).
  useEffect(() => {
    const root = article.current
    const highlights = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
    const HighlightCtor = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight
    if (!root) return
    const q = query.trim().toLowerCase()
    if (q.length < 2) {
      setMatches([])
      highlights?.delete('guide-search')
      highlights?.delete('guide-current')
      return
    }
    const found: Range[] = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node.textContent?.toLowerCase() ?? ''
      let at = text.indexOf(q)
      while (at !== -1) {
        const r = document.createRange()
        r.setStart(node, at)
        r.setEnd(node, at + q.length)
        found.push(r)
        at = text.indexOf(q, at + q.length)
      }
    }
    setMatches(found)
    setCurrent(0)
    if (highlights && HighlightCtor) highlights.set('guide-search', new HighlightCtor(...found))
  }, [query])

  useEffect(() => {
    const highlights = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
    const HighlightCtor = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight
    const r = matches[current]
    if (!r) return
    if (highlights && HighlightCtor) highlights.set('guide-current', new HighlightCtor(r))
    const rect = r.getBoundingClientRect()
    window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 3, behavior: 'smooth' })
  }, [current, matches])

  useEffect(
    () => () => {
      const highlights = (CSS as unknown as { highlights?: HighlightRegistry }).highlights
      highlights?.delete('guide-search')
      highlights?.delete('guide-current')
    },
    [],
  )

  // Scroll spy for the table of contents.
  useEffect(() => {
    const root = article.current
    if (!root) return
    const heads = Array.from(root.querySelectorAll('h2[id], h3[id]'))
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActiveId(vis[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    heads.forEach((h) => obs.observe(h))
    return () => obs.disconnect()
  }, [])

  const step = (d: number) => {
    if (matches.length === 0) return
    setCurrent((c) => (c + d + matches.length) % matches.length)
  }

  const download = () => {
    const blob = new Blob([guideMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rsl_data.md'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div>
      <style>{`::highlight(guide-search){background:rgb(243 239 230 / 0.22);color:#fff}::highlight(guide-current){background:#f3efe6;color:#0b0b0c}`}</style>
      <PageHeader
        eyebrow={`${guideMeta.date} · ${guideMeta.author}`}
        title="Full guide"
        intro="The original rsl_data.md, word for word — every page in PudyRSL is built from this document."
        actions={
          <button type="button" className="btn" onClick={download}>
            <Download className="size-4" /> rsl_data.md
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[260px_1fr]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <div className="t-label mb-3 text-low">Contents</div>
            <nav className="space-y-0.5 border-l border-edge">
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    history.replaceState(null, '', `#${t.id}`)
                  }}
                  className={cn(
                    '-ml-px block border-l-2 py-1 text-[0.8rem] leading-snug transition-colors',
                    t.level === 3 ? 'pl-6' : 'pl-3 font-bold',
                    activeId === t.id ? 'border-paper text-hi' : 'border-transparent text-low hover:text-hi',
                  )}
                >
                  {t.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="sticky top-[4.25rem] z-10 mb-6 flex items-center gap-2 rounded-[4px] border border-edge-2 bg-raised p-1.5 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.9)]">
            <Search className="ml-2 size-4 text-low" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') step(e.shiftKey ? -1 : 1)
              }}
              placeholder="Find in the guide…"
              className="h-9 flex-1 bg-transparent text-[0.9rem] font-medium text-hi outline-none placeholder:text-low"
            />
            {query.trim().length >= 2 && (
              <span className="text-xs font-semibold text-low tabular-nums">{matches.length ? `${current + 1}/${matches.length}` : 'No matches'}</span>
            )}
            <button type="button" className="btn btn-ghost size-8 p-0" onClick={() => step(-1)} aria-label="Previous match">
              <ChevronUp className="size-4" />
            </button>
            <button type="button" className="btn btn-ghost size-8 p-0" onClick={() => step(1)} aria-label="Next match">
              <ChevronDown className="size-4" />
            </button>
            <Kbd className="mr-1 hidden sm:inline-flex">↵</Kbd>
          </div>

          <motion.article ref={article} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel prose-guide rich px-6 py-8 sm:px-12 sm:py-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingComponents}>
              {guideMarkdown}
            </ReactMarkdown>
          </motion.article>
        </div>
      </div>
    </div>
  )
}
