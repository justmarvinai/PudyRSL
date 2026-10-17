import { champions, championById, type Champion, type ChampionStep } from '../data/champions'
import type { CheckRef, Phase, RoadmapTask } from '../data/roadmap'
import type { ChampionId } from '../data/types'

/** The slice of progress state that checks read and write. */
export interface CheckState {
  flags: Record<string, boolean>
  nums: Record<string, number>
}

export const stepFlag = (champ: ChampionId, key: string) => `ch.${champ}.${key}`

export function stepRef(champ: ChampionId, step: ChampionStep): CheckRef {
  if (step.tome) return { num: `tome.${step.tome.counter}`, min: step.tome.min, floor: step.tome.floor }
  return { flag: stepFlag(champ, step.key) }
}

export function isRefDone(s: CheckState, r: CheckRef): boolean {
  if ('flag' in r) return !!s.flags[r.flag]
  return (s.nums[r.num] ?? 0) >= r.min
}

export const allDone = (s: CheckState, refs: CheckRef[]) => refs.length > 0 && refs.every((r) => isRefDone(s, r))

// Rank-progression steps (the ones with a status label) form a chain per
// champion: ticking one ticks the earlier ones, unticking clears later ones.
const chainIndex = new Map<string, { order: number; chain: string[] }>()
for (const c of champions) {
  const chain = c.steps.filter((st) => st.status && !st.tome).map((st) => stepFlag(c.id, st.key))
  chain.forEach((id, order) => chainIndex.set(id, { order, chain }))
}

function setFlagWithChain(flags: Record<string, boolean>, id: string, value: boolean) {
  const link = chainIndex.get(id)
  if (!link) {
    flags[id] = value
    return
  }
  link.chain.forEach((cid, i) => {
    if (value && i <= link.order) flags[cid] = true
    if (!value && i >= link.order) flags[cid] = false
  })
}

/** Returns new flags/nums with every ref set to `value`. */
export function applyRefs(s: CheckState, refs: CheckRef[], value: boolean): CheckState {
  const flags = { ...s.flags }
  const nums = { ...s.nums }
  for (const r of refs) {
    if ('flag' in r) {
      setFlagWithChain(flags, r.flag, value)
    } else {
      const cur = nums[r.num] ?? 0
      if (value) nums[r.num] = Math.max(cur, r.min)
      else nums[r.num] = Math.min(cur, r.floor ?? r.min - 1)
    }
  }
  return { flags, nums }
}

// ---------- roadmap ----------

export function taskRefs(task: RoadmapTask): CheckRef[] {
  if (task.refs) return task.refs
  if (task.subtasks) return task.subtasks.flatMap((st) => st.refs)
  return [{ flag: task.id }]
}

export const isTaskDone = (s: CheckState, task: RoadmapTask) => allDone(s, taskRefs(task))

export function phaseProgress(s: CheckState, phase: Phase) {
  const done = phase.tasks.filter((t) => isTaskDone(s, t)).length
  return { done, total: phase.tasks.length }
}

// ---------- champions ----------

export function championProgress(s: CheckState, c: Champion) {
  const done = c.steps.filter((st) => isRefDone(s, stepRef(c.id, st))).length
  return { done, total: c.steps.length }
}

/** Furthest completed rank milestone, e.g. "R6 · Lv 60". */
export function championStatus(s: CheckState, c: Champion): string {
  let status: string | null = null
  for (const st of c.steps) {
    if (st.status && !st.tome && s.flags[stepFlag(c.id, st.key)]) status = st.status
  }
  if (status) return status
  if (c.rarity === 'Mythical') return 'R6 · Lv 1'
  return 'Not started'
}

export function isRankSix(s: CheckState, c: Champion): boolean {
  if (c.rarity === 'Mythical') return true
  return c.steps.some((st) => st.status?.startsWith('R6') && !st.tome && s.flags[stepFlag(c.id, st.key)])
}

export function isMaxLevel(s: CheckState, c: Champion): boolean {
  const last = [...c.steps].reverse().find((st) => st.status === 'R6 · Lv 60')
  return !!last && !!s.flags[stepFlag(c.id, last.key)]
}

export const getChampion = (id: string) => championById[id as ChampionId]
