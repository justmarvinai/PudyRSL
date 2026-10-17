import { motion } from 'motion/react'
import { Download, ExternalLink, LockKeyhole, RotateCcw, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Select } from '../components/ui/Fields'
import { Modal } from '../components/ui/Overlay'
import { Callout, Kbd, Panel } from '../components/ui/primitives'
import { guideMeta } from '../data/guide'
import { downloadBackup, importBackupFile, lockSite } from '../lib/backup'
import { formatLongDate, weekdays } from '../lib/dates'
import { raidData, raidSource } from '../lib/rsl'
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
    <div className="space-y-6">
      <PageHeader eyebrow="PudyRSL" title="Settings & backup" intro="Your progress is saved in this browser only. Download a backup now and then, and restore it on another device or browser." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel kicker="You" title="Profile & plan">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="t-label mb-1.5 block text-low">Display name</span>
              <input className="input" value={s.profileName} onChange={(e) => s.setSettings({ profileName: e.target.value })} placeholder="Your name" />
            </label>
            <label className="block">
              <span className="t-label mb-1.5 block text-low">Plan start date (Day 1)</span>
              <input
                type="date"
                className="input [color-scheme:dark]"
                value={s.startDate}
                onChange={(e) => e.target.value && s.setSettings({ startDate: e.target.value })}
              />
            </label>
          </div>
          <p className="mt-2 text-[0.76rem] text-low">
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
          <p className="mt-2 text-[0.76rem] text-low">Set these to match when your game day and Hydra/Chimera week roll over.</p>
        </Panel>

        <Panel kicker="Your data" title="Backup & restore">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={downloadBackup}>
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
            className={`mt-4 rounded-[3px] border border-dashed px-4 py-7 text-center text-sm transition-colors ${dragging ? 'border-paper bg-raised-3 text-hi' : 'border-edge-2 text-low'}`}
          >
            Drop a <span className="font-semibold text-mid">pudyrsl-backup-….json</span> file here to restore it
          </motion.div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-[0.82rem]">
            <div className="well px-3 py-2.5">
              <dt className="t-label text-low">Last backup</dt>
              <dd className="mt-1 font-semibold text-hi">{s.ui.lastBackupAt ? new Date(s.ui.lastBackupAt).toLocaleString('en-US') : 'Never'}</dd>
            </div>
            <div className="well px-3 py-2.5">
              <dt className="t-label text-low">Saved data</dt>
              <dd className="mt-1 font-semibold text-hi">
                {(size / 1024).toFixed(1)} KB {persisted ? <span className="text-ok">· protected</span> : null}
              </dd>
            </div>
          </dl>
          <Callout tone="info" className="mt-4" text="Restoring replaces everything currently saved in this browser with the file's contents." />
        </Panel>

        <Panel kicker="Access" title="Password lock">
          <p className="text-[0.86rem] leading-relaxed text-mid">
            On Vercel, every page and file sits behind the PudyRSL lock screen. The password is the{' '}
            <code className="rounded-[3px] border border-edge-2 px-1.5 py-0.5 text-[0.8rem] font-semibold text-hi">PUDY_PASSWORD</code> environment variable in your Vercel project. Changing it
            signs out every device.
          </p>
          <button type="button" className="btn mt-4" onClick={lockSite}>
            <LockKeyhole className="size-4" /> Lock this device now
          </button>
        </Panel>

        <Panel kicker="Faster" title="Keyboard shortcuts">
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-[0.84rem] text-mid sm:grid-cols-2">
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
        </Panel>

        <Panel kicker="Credits" title="Game data & type" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="text-[0.86rem] leading-relaxed text-mid">
              <p>
                Champion portraits, buff/debuff icons, skill tooltips and base stats come from{' '}
                <a href={raidSource.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-bold text-hi underline decoration-edge-2 underline-offset-4 hover:decoration-paper">
                  {raidSource.name} {raidSource.version} <ExternalLink className="size-3" />
                </a>{' '}
                ({raidSource.license}) — a free, open dataset. {raidSource.credits}
              </p>
              <p className="mt-2 text-low">
                It is an April 2021 snapshot bundled into this site ({Object.keys(raidData.champions).length} champions, {Object.keys(raidData.icons).length} effect icons). Champions that
                aren&apos;t in it — Gizmak, Galleus, Ninja, Rathalos, Artak, Ultimate Deathknight and Ruella — show a monogram instead of art. Your guide always wins where they differ.
              </p>
            </div>
            <div className="text-[0.86rem] leading-relaxed text-mid">
              <p>
                Type is <span className="font-bold text-hi">Mona Sans</span> by GitHub (SIL Open Font License), self-hosted. There is no official Raid: Shadow Legends API; Raid and its art are
                © Plarium. PudyRSL is a private fan tool.
              </p>
              <p className="mt-2 text-low">
                Built from “{guideMeta.title}” ({guideMeta.date}).
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel style={{ boxShadow: 'inset 3px 0 0 var(--color-bad)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="t-title text-[1rem] text-hi">Reset all progress</div>
            <div className="text-[0.82rem] text-low">Clears every tick, counter, note and setting in this browser. Download a backup first.</div>
          </div>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
            <RotateCcw className="size-4" /> Reset…
          </button>
        </div>
      </Panel>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reset all progress?">
        <div className="space-y-4 p-5">
          <p className="text-sm text-mid">
            This can&apos;t be undone. Type <span className="font-extrabold text-bad">RESET</span> to confirm.
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
