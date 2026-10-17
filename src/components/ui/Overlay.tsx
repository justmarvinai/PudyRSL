import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { useToasts } from '../../lib/toast'

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    window.setTimeout(() => panel.current?.focus(), 10)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={cn('card relative w-full overflow-hidden outline-none', wide ? 'max-w-3xl' : 'max-w-lg', className)}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
                <div className="text-[0.95rem] font-semibold text-fg">{title}</div>
                <button type="button" onClick={onClose} className="btn btn-ghost size-8 p-0" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

const toastIcon = {
  success: <CircleCheck className="size-4 text-ok" />,
  info: <Info className="size-4 text-info" />,
  warn: <TriangleAlert className="size-4 text-warn" />,
  error: <CircleAlert className="size-4 text-bad" />,
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  const dismiss = useToasts((s) => s.dismiss)
  return createPortal(
    <div className="pointer-events-none fixed right-4 bottom-4 z-[90] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="card pointer-events-auto flex items-center gap-3 px-4 py-3 text-sm text-fg"
            onClick={() => dismiss(t.id)}
          >
            {toastIcon[t.kind]}
            <span className="min-w-0 flex-1">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

/** Small celebratory particle burst, centred on its parent. */
export function Burst({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const colors = ['#ffdc96', '#f6c463', '#e8a83a', '#ff7a6b', '#b47cff', '#3ee09a']
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div className="pointer-events-none absolute inset-0 z-20 overflow-visible" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {Array.from({ length: 26 }).map((_, i) => {
            const angle = (i / 26) * Math.PI * 2
            const dist = 60 + ((i * 37) % 70)
            return (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 size-1.5 rounded-full"
                style={{ background: colors[i % colors.length] }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: 0 }}
                transition={{ duration: 0.9 + (i % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
