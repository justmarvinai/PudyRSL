import { AnimatePresence, motion } from 'motion/react'
import { KeyRound, RotateCcw, Trash } from 'lucide-react'
import { useState } from 'react'
import { cbKeys, difficultyNames, difficultyOrder, type DifficultyKey } from '../../data/clanBoss'
import { cn } from '../../lib/cn'
import { formatLongDate } from '../../lib/dates'
import { useKeysUsed, useStore } from '../../lib/store'
import { NumberField, Segmented } from '../ui/Fields'
import { ProgressBar } from '../ui/Progress'
import { Rich } from '../ui/Rich'
import { Callout, Card, SectionTitle } from '../ui/primitives'

const short: Record<DifficultyKey, string> = { easy: 'Easy', normal: 'Normal', hard: 'Hard', brutal: 'Brutal', nm: 'NM', unm: 'UNM' }

/** Daily key plan: threshold ÷ damage per key − free keys, plus the stored-key bank. */
export function KeyPlanner() {
  const plan = useStore((s) => s.keyPlan)
  const setPlan = useStore((s) => s.setKeyPlan)
  const keyLog = useStore((s) => s.keyLog)
  const logKeys = useStore((s) => s.logKeys)
  const removeKeyLog = useStore((s) => s.removeKeyLog)
  const used = useKeysUsed()
  const left = cbKeys.total - used

  const guideThreshold = cbKeys.thresholds[plan.difficulty]
  const threshold = plan.thresholds[plan.difficulty] ?? guideThreshold
  const dmg = plan.damageM
  const keysNeeded = dmg && dmg > 0 ? Math.ceil(threshold / (dmg * 1_000_000)) : null
  const stored = keysNeeded !== null ? Math.max(0, keysNeeded - plan.freeKeys) : null
  const [logCount, setLogCount] = useState<number | null>(null)
  const toLog = logCount ?? stored ?? 0

  return (
    <Card id="key-planner" className="scroll-mt-24">
      <SectionTitle eyebrow="Tool" title={`Your ${cbKeys.total} Clan Boss keys`} label={cbKeys.label} />
      <Rich as="p" text={cbKeys.intro} className="mb-5 text-[0.84rem] leading-relaxed text-fg-muted" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <div>
            <div className="eyebrow mb-2">Highest difficulty you survive</div>
            <Segmented
              size="sm"
              value={plan.difficulty}
              onChange={(d) => setPlan({ difficulty: d })}
              options={difficultyOrder.map((d) => ({ value: d, label: short[d] }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NumberField label="Damage per key" value={dmg} onChange={(v) => setPlan({ damageM: v })} placeholder="e.g. 5" min={0} suffix="M" />
            <NumberField label="Free keys today" value={plan.freeKeys} onChange={(v) => setPlan({ freeKeys: v ?? 0 })} min={0} allowEmpty={false} />
            <div>
              <NumberField
                label="Top-chest threshold"
                value={+(threshold / 1_000_000).toFixed(2)}
                onChange={(v) => setPlan({ thresholds: { ...plan.thresholds, [plan.difficulty]: v === null ? undefined : Math.round(v * 1_000_000) } })}
                min={0}
                suffix="M"
              />
              {threshold !== guideThreshold && (
                <button
                  type="button"
                  onClick={() => setPlan({ thresholds: { ...plan.thresholds, [plan.difficulty]: undefined } })}
                  className="mt-1 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-gold-400 hover:text-gold-300"
                >
                  <RotateCcw className="size-3" /> Back to guide value {(guideThreshold / 1_000_000).toFixed(2)}M
                </button>
              )}
            </div>
          </div>
          <p className="text-[0.72rem] text-fg-subtle">
            Thresholds default to DWJ&apos;s 2022 numbers ({difficultyNames[plan.difficulty]} {(guideThreshold / 1_000_000).toFixed(2)}M). They may have been retuned — overwrite
            them if you know the current value.
          </p>

          <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.08] to-transparent p-4">
            {keysNeeded === null ? (
              <div className="text-sm text-fg-muted">Enter your damage per key to plan today&apos;s hits.</div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <div className="eyebrow">Keys for top chest</div>
                  <motion.div key={keysNeeded} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl font-bold text-fg tabular-nums">
                    {keysNeeded}
                  </motion.div>
                </div>
                <div className="text-2xl text-fg-subtle">−</div>
                <div>
                  <div className="eyebrow">Free</div>
                  <div className="text-3xl font-bold text-fg-muted tabular-nums">{plan.freeKeys}</div>
                </div>
                <div className="text-2xl text-fg-subtle">=</div>
                <div>
                  <div className="eyebrow text-gold-400">Stored keys today</div>
                  <motion.div key={stored} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl font-bold text-gold-300 tabular-nums">
                    {stored}
                  </motion.div>
                </div>
                <div className="w-full text-[0.72rem] text-fg-subtle">
                  {(threshold / 1_000_000).toFixed(2)}M ÷ {dmg}M per key = {(threshold / (dmg! * 1_000_000)).toFixed(2)} → {keysNeeded} keys, minus {plan.freeKeys} free.
                  {stored! > 0 && left > 0 && ` At ${stored}/day, your ${left} stored keys last about ${Math.floor(left / stored!)} days.`}
                </div>
              </div>
            )}
          </div>

          <ul className="space-y-1.5">
            {cbKeys.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-[0.8rem] leading-relaxed text-fg-muted">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-gold-600" />
                <Rich text={b} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="card-flat p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="eyebrow">Stored keys left</div>
                <div className="text-4xl font-bold text-fg tabular-nums">{left}</div>
              </div>
              <div className="text-right text-[0.75rem] text-fg-subtle">
                {used} used
                <br />of {cbKeys.total}
              </div>
            </div>
            <ProgressBar value={(left / cbKeys.total) * 100} className="mt-3" tone="epic" />
            <div className="mt-4 flex items-end gap-2">
              <NumberField label="Log stored keys used today" value={toLog} onChange={setLogCount} min={0} max={left} className="flex-1" />
              <button
                type="button"
                className="btn btn-gold"
                disabled={toLog <= 0 || left <= 0}
                onClick={() => {
                  logKeys(Math.min(toLog, left))
                  setLogCount(null)
                }}
              >
                <KeyRound className="size-4" /> Log
              </button>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-2">Key log</div>
            {keyLog.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-fg-subtle">No stored keys used yet.</div>
            ) : (
              <ul className="max-h-60 space-y-1 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {[...keyLog].reverse().map((e, ri) => {
                    const i = keyLog.length - 1 - ri
                    return (
                      <motion.li
                        key={`${e.date}-${i}`}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="group flex items-center justify-between rounded-lg bg-white/[0.025] px-3 py-2 text-[0.8rem]"
                      >
                        <span className="text-fg-muted">{formatLongDate(e.date)}</span>
                        <span className="flex items-center gap-2">
                          <span className={cn('font-semibold tabular-nums', e.used > 10 ? 'text-warn' : 'text-fg')}>−{e.used}</span>
                          <button type="button" onClick={() => removeKeyLog(i)} className="rounded p-1 text-fg-subtle opacity-0 transition group-hover:opacity-100 hover:text-bad" aria-label="Remove entry">
                            <Trash className="size-3.5" />
                          </button>
                        </span>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
          <Callout tone="danger" text="Don't dump the 133 keys in one day — you only get one day's chest." />
          <Callout tone="info" text="**Open question:** unverified whether stored keys stack past the 2-key cap or pause natural regen." />
        </div>
      </div>
    </Card>
  )
}
