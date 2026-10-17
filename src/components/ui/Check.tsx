import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

/** Animated checkbox button. */
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
  const dim = { sm: 'size-4 rounded-[5px]', md: 'size-5 rounded-md', lg: 'size-6 rounded-lg' }[size]
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
      whileTap={{ scale: 0.82 }}
      className={cn(
        'relative grid shrink-0 cursor-pointer place-items-center border transition-colors duration-200',
        dim,
        checked
          ? 'border-gold-400 bg-gradient-to-b from-gold-400 to-gold-600 shadow-[0_0_14px_-2px_rgb(246_196_99/0.65)]'
          : partial
            ? 'border-gold-500/60 bg-gold-500/15'
            : 'border-white/20 bg-white/[0.03] hover:border-gold-400/70 hover:bg-gold-400/10',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-[78%]" fill="none" aria-hidden>
        {checked ? (
          <motion.path
            d="M3.5 8.4 6.6 11.3 12.6 4.9"
            stroke="#1b1206"
            strokeWidth={2.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          />
        ) : partial ? (
          <path d="M4.5 8h7" stroke="#f6c463" strokeWidth={2.2} strokeLinecap="round" />
        ) : null}
      </svg>
    </motion.button>
  )
}
