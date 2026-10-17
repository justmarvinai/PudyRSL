import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { useToasts, type ToastKind } from '../../lib/toast'

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
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          <div className="absolute inset-0 bg-black/75" onClick={onClose} />
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn('panel relative w-full overflow-hidden border-edge-2 outline-none', wide ? 'max-w-3xl' : 'max-w-lg', className)}
          >
            {title !== undefined && (
              <div className="panel-head">
                <div className="t-title text-[1rem] text-hi">{title}</div>
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

const toastColor: Record<ToastKind, string> = {
  success: 'var(--color-ok)',
  info: 'var(--color-buff)',
  warn: 'var(--color-warn)',
  error: 'var(--color-bad)',
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
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18 }}
            className="panel pointer-events-auto cursor-pointer border-edge-2 px-4 py-3 text-[0.86rem] font-semibold text-hi"
            style={{ boxShadow: `inset 3px 0 0 ${toastColor[t.kind]}` }}
            onClick={() => dismiss(t.id)}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
