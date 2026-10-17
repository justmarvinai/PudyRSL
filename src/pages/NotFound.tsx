import { motion } from 'motion/react'
import { Compass } from 'lucide-react'
import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <motion.div
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 12 }}
          className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-gold-500/10 text-gold-300 ring-1 ring-gold-500/30"
        >
          <Compass className="size-8" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-fg">Lost in the campaign</h1>
        <p className="mt-2 text-sm text-fg-muted">This page isn&apos;t part of your guide.</p>
        <Link to="/" className="btn btn-gold mt-6">
          Back to the dashboard
        </Link>
      </div>
    </div>
  )
}
