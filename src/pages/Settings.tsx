import { motion } from 'motion/react'
import { CalendarDays, Download, HardDrive, Keyboard, LockKeyhole, RotateCcw, ShieldCheck, Upload, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Select } from '../components/ui/Fields'
import { Modal } from '../components/ui/Overlay'
import { Callout, Card, Kbd, SectionTitle } from '../components/ui/primitives'
import { guideMeta } from '../data/guide'
import { downloadBackup, importBackupFile, lockSite } from '../lib/backup'
import { formatLongDate, weekdays } from '../lib/dates'
import { pickData, useStore } from '../lib/store'
import { toast } from '../lib/toast'

const hours = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: `${String(h).padStart(2, '0')}:00` }))

export function Settings() {
  const s = useStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [dragging, setDragging] = useState(false)
  const size = new Blob([JSON.stringify(pickData(s))]).size

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="PudyRSL" title="Settings & backup" intro="Your progress is saved in this browser only. Download a backup now and then, and restore it on another device or browser." />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <SectionTitle eyebrow="You" title={<span className="inline-flex items-center gap-2"><User className="size-4 text-gold-400" /> Profile & plan</span>} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-1 block">Display name</span>
              <input className="input" value={s.profileName} onChange={(e) => s.setSettings({ profileName: e.target.value })} placeholder="Your name" />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">Plan start date (Day 1)</span>
              <input
                type="date"
                className="input [color-scheme:dark]"
                value={s.startDate}
                onChange={(e) => e.target.value && s.setSettings({ startDate: e.target.value })}
              />
            </label>
          </div>
          <p className="mt-2 text-[0.75rem] text-fg-subtle">
            The guide is dated {guideMeta.date}, so Day 1 defaults to {formatLongDate(guideMeta.dateISO)}. The day counter decides which roadmap phase is
            highlighted.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Daily checklist resets at (local time)"
              value={String(s.dailyResetHour)}
              onChange={(v) => s.setSettings({ dailyResetHour: Number(v) })}
              options={hours}
            />
            <Select
              label="Weekly keys reset on"
              value={String(s.weeklyResetDay)}
              onChange={(v) => s.setSettings({ weeklyResetDay: Number(v) })}
              options={weekdays.map((d, i) => ({ value: String(i), label: d }))}
            />
          </div>
          <p className="mt-2 text-[0.75rem] text-fg-subtle">Set these to match when your game day and Hydra/Chimera week roll over.</p>
        </Card>

        <Card>
          <SectionTitle eyebrow="Your data" title={<span className="inline-flex items-center gap-2"><HardDrive className="size-4 text-gold-400" /> Backup & restore</span>} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-gold" onClick={downloadBackup}>
              <Download className="size-4" /> Download backup
            </button>
            <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
              <Upload className="size-4" /> Restore from file
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) await importBackupFile(f)
                e.target.value = ''
              }}
            />
          </div>
          <motion.div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={async (e) => {
              e.preventDefault()
              setDragging(false)
              const f = e.dataTransfer.files?.[0]
              if (f) await importBackupFile(f)
            }}
            animate={{ scale: dragging ? 1.01 : 1 }}
            className={`mt-4 rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors ${dragging ? 'border-gold-400/70 bg-gold-400/[0.06] text-gold-200' : 'border-white/12 text-fg-subtle'}`}
          >
            Drop a <span className="text-fg-muted">pudyrsl-backup-….json</span> file here to restore it
          </motion.div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.8rem]">
            <div className="card-flat px-3 py-2">
              <dt className="eyebrow">Last backup</dt>
              <dd className="mt-0.5 text-fg">{s.ui.lastBackupAt ? new Date(s.ui.lastBackupAt).toLocaleString('en-US') : 'Never'}</dd>
            </div>
            <div className="card-flat px-3 py-2">
              <dt className="eyebrow">Saved data</dt>
              <dd className="mt-0.5 text-fg">
                {(size / 1024).toFixed(1)} KB {persisted ? <span className="text-ok">· protected</span> : null}
              </dd>
            </div>
          </dl>
          <Callout tone="info" className="mt-4" text="Restoring replaces everything currently saved in this browser with the file's contents." />
        </Card>

        <Card>
          <SectionTitle eyebrow="Access" title={<span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-gold-400" /> Password lock</span>} />
          <p className="text-[0.84rem] leading-relaxed text-fg-muted">
            On Vercel, every page and file sits behind the PudyRSL lock screen. The password is the <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-gold-200">PUDY_PASSWORD</code>{' '}
            environment variable in your Vercel project. Changing it signs out every device.
          </p>
          <button type="button" className="btn mt-4" onClick={lockSite}>
            <LockKeyhole className="size-4" /> Lock this device now
          </button>
        </Card>

        <Card>
          <SectionTitle eyebrow="Faster" title={<span className="inline-flex items-center gap-2"><Keyboard className="size-4 text-gold-400" /> Keyboard shortcuts</span>} />
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-[0.82rem] text-fg-muted sm:grid-cols-2">
            {[
              [['Ctrl', 'K'], 'Search'],
              [['/'], 'Search'],
              [['1–9'], 'Jump to a section'],
              [[','], 'Settings'],
              [['['], 'Toggle sidebar'],
              [['←', '→'], 'Prev / next champion'],
              [['?'], 'All shortcuts'],
              [['Esc'], 'Close dialogs'],
            ].map(([keys, label], i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <span>{label as string}</span>
                <span className="flex gap-1">
                  {(keys as string[]).map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-bad/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[0.95rem] font-semibold text-fg">Reset all progress</div>
            <div className="text-[0.8rem] text-fg-subtle">Clears every tick, counter, note and setting in this browser. Download a backup first.</div>
          </div>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="size-4" /> Reset…
          </button>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-[0.72rem] text-fg-subtle">
        <CalendarDays className="size-3.5" /> Built from “{guideMeta.title}” ({guideMeta.date}).
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reset all progress?">
        <div className="space-y-4 p-5">
          <p className="text-sm text-fg-muted">
            This can&apos;t be undone. Type <span className="font-mono font-semibold text-bad">RESET</span> to confirm.
          </p>
          <input className="input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="RESET" autoFocus />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => setConfirmOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={confirmText !== 'RESET'}
              onClick={() => {
                s.resetAll()
                setConfirmOpen(false)
                setConfirmText('')
                toast('All progress cleared', 'info')
              }}
            >
              Reset everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
