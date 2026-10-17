import { AnimatePresence, motion } from 'motion/react'
import { KeyRound, RotateCcw, Trash } from 'lucide-react'
import { useState } from 'react'
import { cbKeys, difficultyNames, difficultyOrder, type DifficultyKey } from '../../data/clanBoss'
import { cn } from '../../lib/cn'
import { formatLongDate } from '../../lib/dates'
import { useKeysUsed, useStore } from '../../lib/store'
import { difficultyColor } from '../../lib/rsl'
import { NumberField, Segmented } from '../ui/Fields'
import { Bar } from '../ui/Progress'
import { Rich } from '../ui/Rich'
import { Callout, EmptyHint, Panel } from '../ui/primitives'

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
    <Panel id="key-planner" className="scroll-mt-24" kicker="Tool" title={`Your ${cbKeys.total} Clan Boss keys`} label={cbKeys.label}>
      <Rich as="p" text={cbKeys.intro} className="mb-5 text-[0.86rem] leading-relaxed text-mid" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <div>
            <div className="t-label mb-2 text-low">Highest difficulty you survive</div>
            <Segmented
              size="sm"
              value={plan.difficulty}
              onChange={(d) => setPlan({ difficulty: d })}
              options={difficultyOrder.map((d) => ({ value: d, label: short[d], color: difficultyColor[d] }))}
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
                  className="mt-1 inline-flex items-center gap-1 text-[0.7rem] font-bold text-mid hover:text-hi"
                >
                  <RotateCcw className="size-3" /> Back to guide value {(guideThreshold / 1_000_000).toFixed(2)}M
                </button>
              )}
            </div>
          </div>
          <p className="text-[0.72rem] text-low">
            Thresholds default to DWJ&apos;s 2022 numbers ({difficultyNames[plan.difficulty]} {(guideThreshold / 1_000_000).toFixed(2)}M). They may have been retuned — overwrite
            them if you know the current value.
          </p>

          <div className="well p-4" style={{ boxShadow: `inset 3px 0 0 ${difficultyColor[plan.difficulty]}` }}>
            {keysNeeded === null ? (
              <div className="text-sm text-mid">Enter your damage per key to plan today&apos;s hits.</div>
            ) : (
              <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                <div>
                  <div className="t-label text-low">Keys for top chest</div>
                  <motion.div key={keysNeeded} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="t-num mt-2 text-[2.6rem] text-hi">
                    {keysNeeded}
                  </motion.div>
                </div>
                <div className="t-num pb-1 text-[1.6rem] text-low">−</div>
                <div>
                  <div className="t-label text-low">Free</div>
                  <div className="t-num mt-2 text-[2.6rem] text-mid">{plan.freeKeys}</div>
                </div>
                <div className="t-num pb-1 text-[1.6rem] text-low">=</div>
                <div>
                  <div className="t-label" style={{ color: difficultyColor[plan.difficulty] }}>
                    Stored keys today
                  </div>
                  <motion.div key={stored} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="t-num mt-2 text-[2.6rem]" style={{ color: difficultyColor[plan.difficulty] }}>
                    {stored}
                  </motion.div>
                </div>
                <div className="w-full text-[0.72rem] text-low">
                  {(threshold / 1_000_000).toFixed(2)}M ÷ {dmg}M per key = {(threshold / (dmg! * 1_000_000)).toFixed(2)} → {keysNeeded} keys, minus {plan.freeKeys} free.
                  {stored! > 0 && left > 0 && ` At ${stored}/day, your ${left} stored keys last about ${Math.floor(left / stored!)} days.`}
                </div>
              </div>
            )}
          </div>

          <ul className="space-y-1.5">
            {cbKeys.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-[0.82rem] leading-relaxed text-mid">
                <span className="mt-[0.55rem] size-1.5 shrink-0 bg-low" />
                <Rich text={b} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="well p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="t-label text-low">Stored keys left</div>
                <div className="t-num mt-2 text-[3rem] text-hi">{left}</div>
              </div>
              <div className="text-right text-[0.75rem] text-low tabular-nums">
                {used} used
                <br />of {cbKeys.total}
              </div>
            </div>
            <Bar value={(left / cbKeys.total) * 100} className="mt-3" color="var(--color-cb)" height={6} />
            <div className="mt-4 flex items-end gap-2">
              <NumberField label="Log stored keys used today" value={toLog} onChange={setLogCount} min={0} max={left} className="flex-1" />
              <button
                type="button"
                className="btn btn-primary"
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
            <div className="t-label mb-2 text-low">Key log</div>
            {keyLog.length === 0 ? (
              <EmptyHint>No stored keys used yet.</EmptyHint>
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
                        className="group flex items-center justify-between rounded-[3px] border border-edge px-3 py-2 text-[0.8rem]"
                      >
                        <span className="text-mid">{formatLongDate(e.date)}</span>
                        <span className="flex items-center gap-2">
                          <span className={cn('font-bold tabular-nums', e.used > 10 ? 'text-warn' : 'text-hi')}>−{e.used}</span>
                          <button type="button" onClick={() => removeKeyLog(i)} className="rounded-[3px] p-1 text-low opacity-0 transition group-hover:opacity-100 hover:text-bad" aria-label="Remove entry">
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
    </Panel>
  )
}
