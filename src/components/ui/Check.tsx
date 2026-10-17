import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

/** Square checkbox: paper fill + ink check when done. */
export function Check({
  checked,
  onChange,
  size = 'md',
  label,
  className,
  partial = false,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
  partial?: boolean
}) {
  const dim = { sm: 'size-4', md: 'size-[18px]', lg: 'size-6' }[size]
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={partial && !checked ? 'mixed' : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      whileTap={{ scale: 0.85 }}
      className={cn(
        'relative grid shrink-0 cursor-pointer place-items-center rounded-[3px] border-[1.5px] transition-colors duration-150',
        dim,
        checked ? 'border-paper bg-paper' : partial ? 'border-mid bg-raised-3' : 'border-edge-2 bg-transparent hover:border-mid',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-[80%]" fill="none" aria-hidden>
        {checked ? (
          <motion.path
            d="M3.2 8.3 6.5 11.4 12.8 4.6"
            stroke="#0b0b0c"
            strokeWidth={2.6}
            strokeLinecap="square"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        ) : partial ? (
          <path d="M4 8h8" stroke="#a3a3ab" strokeWidth={2.4} />
        ) : null}
      </svg>
    </motion.button>
  )
}
