import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DifficultyKey } from '../data/clanBoss'
import { guideMeta } from '../data/guide'
import type { CheckRef } from '../data/roadmap'
import type { Affinity, ChampionId } from '../data/types'
import { applyRefs } from './checks'
import { dailyPeriod, isoDate, weeklyPeriod } from './dates'

export interface ChampionProgress {
  affinity: Affinity | null
  asc: number
  speed: number | null
  hp: number | null
  def: number | null
  notes: string
}

export interface CustomTask {
  id: string
  text: string
  done: boolean
}

export interface PudyData {
  profileName: string
  startDate: string
  dailyResetHour: number
  weeklyResetDay: number
  flags: Record<string, boolean>
  nums: Record<string, number>
  champs: Partial<Record<ChampionId, Partial<ChampionProgress>>>
  questions: Record<string, { verified?: boolean; note?: string }>
  daily: { period: string; done: Record<string, boolean> }
  weekly: { period: string; counts: Record<string, number> }
  keyLog: { date: string; used: number }[]
  tasks: CustomTask[]
  notes: string
  tune: { difficulty: 'brutal' | 'nm' | 'unm'; forceDay: boolean }
  keyPlan: { difficulty: DifficultyKey; damageM: number | null; freeKeys: number; thresholds: Partial<Record<DifficultyKey, number>> }
  cbDifficulty: DifficultyKey | null
  ui: { sidebarCollapsed: boolean; teamWave: 1 | 2; lastBackupAt: string | null; hideDone: boolean }
}

interface Actions {
  setRefs: (refs: CheckRef[], value: boolean) => void
  setFlag: (id: string, value: boolean) => void
  setNum: (key: string, value: number) => void
  setChamp: (id: ChampionId, patch: Partial<ChampionProgress>) => void
  setQuestion: (id: string, patch: { verified?: boolean; note?: string }) => void
  toggleDaily: (id: string) => void
  setWeekly: (id: string, count: number) => void
  logKeys: (used: number) => void
  removeKeyLog: (index: number) => void
  addTask: (text: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  clearDoneTasks: () => void
  setNotes: (text: string) => void
  setSettings: (patch: Partial<Pick<PudyData, 'profileName' | 'startDate' | 'dailyResetHour' | 'weeklyResetDay'>>) => void
  setTune: (patch: Partial<PudyData['tune']>) => void
  setKeyPlan: (patch: Partial<PudyData['keyPlan']>) => void
  setCbDifficulty: (d: DifficultyKey | null) => void
  setUi: (patch: Partial<PudyData['ui']>) => void
  importData: (data: PudyData) => void
  resetAll: () => void
}

export type PudyState = PudyData & Actions

export const defaultData = (): PudyData => ({
  profileName: guideMeta.author.replace('@', ''),
  startDate: guideMeta.dateISO,
  dailyResetHour: 0,
  weeklyResetDay: 1,
  flags: {},
  nums: {},
  champs: {},
  questions: {},
  daily: { period: '', done: {} },
  weekly: { period: '', counts: {} },
  keyLog: [],
  tasks: [],
  notes: '',
  tune: { difficulty: 'brutal', forceDay: false },
  keyPlan: { difficulty: 'brutal', damageM: null, freeKeys: 2, thresholds: {} },
  cbDifficulty: null,
  ui: { sidebarCollapsed: false, teamWave: 1, lastBackupAt: null, hideDone: false },
})

const DATA_KEYS = Object.keys(defaultData()) as (keyof PudyData)[]

export function pickData(s: PudyData): PudyData {
  const out = {} as Record<string, unknown>
  for (const k of DATA_KEYS) out[k] = s[k]
  return out as unknown as PudyData
}

/** Fill gaps from defaults so older saves and imports keep working. */
export function normalizeData(raw: Partial<PudyData>): PudyData {
  const d = defaultData()
  return {
    ...d,
    ...raw,
    flags: { ...(raw.flags ?? {}) },
    nums: { ...(raw.nums ?? {}) },
    champs: { ...(raw.champs ?? {}) },
    questions: { ...(raw.questions ?? {}) },
    daily: { ...d.daily, ...(raw.daily ?? {}) },
    weekly: { ...d.weekly, ...(raw.weekly ?? {}) },
    keyLog: Array.isArray(raw.keyLog) ? raw.keyLog : [],
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    tune: { ...d.tune, ...(raw.tune ?? {}) },
    keyPlan: { ...d.keyPlan, ...(raw.keyPlan ?? {}), thresholds: { ...(raw.keyPlan?.thresholds ?? {}) } },
    ui: { ...d.ui, ...(raw.ui ?? {}) },
  }
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useStore = create<PudyState>()(
  persist(
    (set, get) => ({
      ...defaultData(),

      setRefs: (refs, value) => set((s) => applyRefs(s, refs, value)),
      setFlag: (id, value) => set((s) => applyRefs(s, [{ flag: id }], value)),
      setNum: (key, value) => set((s) => ({ nums: { ...s.nums, [key]: Number.isFinite(value) ? value : 0 } })),

      setChamp: (id, patch) => set((s) => ({ champs: { ...s.champs, [id]: { ...s.champs[id], ...patch } } })),
      setQuestion: (id, patch) => set((s) => ({ questions: { ...s.questions, [id]: { ...s.questions[id], ...patch } } })),

      toggleDaily: (id) =>
        set((s) => {
          const period = dailyPeriod(new Date(), s.dailyResetHour)
          const done = s.daily.period === period ? { ...s.daily.done } : {}
          done[id] = !done[id]
          return { daily: { period, done } }
        }),

      setWeekly: (id, count) =>
        set((s) => {
          const period = weeklyPeriod(new Date(), s.weeklyResetDay, s.dailyResetHour)
          const counts = s.weekly.period === period ? { ...s.weekly.counts } : {}
          counts[id] = Math.max(0, count)
          return { weekly: { period, counts } }
        }),

      logKeys: (used) =>
        set((s) => {
          if (!Number.isFinite(used) || used <= 0) return {}
          const date = isoDate(new Date())
          const log = [...s.keyLog]
          const last = log[log.length - 1]
          if (last && last.date === date) log[log.length - 1] = { date, used: last.used + used }
          else log.push({ date, used })
          return { keyLog: log }
        }),
      removeKeyLog: (index) => set((s) => ({ keyLog: s.keyLog.filter((_, i) => i !== index) })),

      addTask: (text) => {
        const t = text.trim()
        if (!t) return
        set((s) => ({ tasks: [...s.tasks, { id: uid(), text: t, done: false }] }))
      },
      toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      clearDoneTasks: () => set((s) => ({ tasks: s.tasks.filter((t) => !t.done) })),

      setNotes: (text) => set({ notes: text }),
      setSettings: (patch) => set(patch),
      setTune: (patch) => set((s) => ({ tune: { ...s.tune, ...patch } })),
      setKeyPlan: (patch) => set((s) => ({ keyPlan: { ...s.keyPlan, ...patch } })),
      setCbDifficulty: (d) => set({ cbDifficulty: d }),
      setUi: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),

      importData: (data) => set(normalizeData(data)),
      resetAll: () => {
        const keepUi = get().ui
        set({ ...defaultData(), ui: { ...defaultData().ui, sidebarCollapsed: keepUi.sidebarCollapsed } })
      },
    }),
    {
      name: 'pudyrsl',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => pickData(s),
      merge: (persisted, current) => ({ ...current, ...normalizeData((persisted ?? {}) as Partial<PudyData>) }),
    },
  ),
)

// ---------- selectors ----------

export function useDailyDone(now: Date): Record<string, boolean> {
  return useStore((s) => (s.daily.period === dailyPeriod(now, s.dailyResetHour) ? s.daily.done : EMPTY))
}

export function useWeeklyCounts(now: Date): Record<string, number> {
  return useStore((s) => (s.weekly.period === weeklyPeriod(now, s.weeklyResetDay, s.dailyResetHour) ? s.weekly.counts : EMPTY_NUMS))
}

const EMPTY: Record<string, boolean> = {}
const EMPTY_NUMS: Record<string, number> = {}

export const useKeysUsed = () => useStore((s) => s.keyLog.reduce((a, e) => a + e.used, 0))

// ---------- backup ----------

export interface BackupFile {
  app: 'PudyRSL'
  schema: 1
  exportedAt: string
  data: PudyData
}

export function exportBackup(): BackupFile {
  const s = useStore.getState()
  return { app: 'PudyRSL', schema: 1, exportedAt: new Date().toISOString(), data: pickData(s) }
}

export function parseBackup(text: string): PudyData {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const file = json as Partial<BackupFile>
  if (!file || file.app !== 'PudyRSL' || typeof file.data !== 'object' || file.data === null) {
    throw new Error('That file is not a PudyRSL backup.')
  }
  return normalizeData(file.data as Partial<PudyData>)
}
