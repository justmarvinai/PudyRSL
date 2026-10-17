import { isoDate } from './dates'
import { exportBackup, parseBackup, useStore } from './store'
import { toast } from './toast'

export function downloadBackup() {
  const file = exportBackup()
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pudyrsl-backup-${isoDate(new Date())}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  useStore.getState().setUi({ lastBackupAt: new Date().toISOString() })
  toast('Backup downloaded')
}

export async function importBackupFile(file: File): Promise<boolean> {
  try {
    const text = await file.text()
    const data = parseBackup(text)
    useStore.getState().importData(data)
    toast('Backup restored')
    return true
  } catch (e) {
    toast(e instanceof Error ? e.message : 'Could not read that file.', 'error')
    return false
  }
}

export const LOCK_LOGOUT_PATH = '/__pudy/logout'

export function lockSite() {
  if (import.meta.env.DEV) {
    toast('The password lock only runs on Vercel — nothing to lock in local dev.', 'info')
    return
  }
  window.location.href = LOCK_LOGOUT_PATH
}

/** Ask the browser to keep localStorage even under storage pressure. */
export function requestPersistentStorage() {
  try {
    void navigator.storage?.persist?.()
  } catch {
    // Not supported — progress still saves normally.
  }
}
