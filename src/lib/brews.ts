import { xpToCap } from '../data/rankUp.ts'
import type { ChampionId } from '../data/types'

export const XP_PER_BREW = 12_500
export const XP_PER_BREW_MATCHED = 18_750

/** Ranks each champion levels through, per the guide's 6★ plan (Feasts skip to R6). */
export const brewPaths: Record<ChampionId, { ranks: number[]; path: string }> = {
  gizmak: { ranks: [], path: 'Already R6 → XP Barrel (no brews)' },
  galleus: { ranks: [6], path: 'Already R6 → 60' },
  maneater: { ranks: [4, 6], path: '4★ L40 → Feast → 60' },
  deacon: { ranks: [4, 6], path: '4★ L40 → Feast → 60' },
  painkeeper: { ranks: [3, 6], path: '3★ L30 → Feast → 60' },
  ninja: { ranks: [5, 6], path: '5★ L50 → R6 → 60' },
  artak: { ranks: [5, 6], path: '5★ L50 → R6 → 60' },
  rathalos: { ranks: [5, 6], path: '5★ L50 → R6 → 60' },
  kymar: { ranks: [5, 6], path: '5★ L50 → R6 → 60' },
  udk: { ranks: [5, 6], path: '5★ L50 → R6 → 60' },
  seer: { ranks: [4, 5, 6], path: '4★ L40 → 5★ → L50 → R6 → 60' },
  ruella: { ranks: [4, 5, 6], path: '4★ L40 → 5★ → L50 → R6 → 60' },
  skullcrusher: { ranks: [4, 5, 6], path: '5★ L50 in week 1, then 6★ last' },
}

export interface BrewPlan {
  xp: number
  brews: number
  parts: { rank: number; xp: number; brews: number }[]
}

/** Brews to take a champion from Lv 1 to the level cap of each listed rank, rounded up per rank. */
export function brewPlan(ranks: number[], perBrew: number): BrewPlan {
  const parts = [...new Set(ranks)]
    .sort((a, b) => a - b)
    .map((rank) => ({ rank, xp: xpToCap[rank], brews: Math.ceil(xpToCap[rank] / perBrew) }))
  return {
    xp: parts.reduce((a, p) => a + p.xp, 0),
    brews: parts.reduce((a, p) => a + p.brews, 0),
    parts,
  }
}

/** A skipped rank is only possible with a Feast, which always lands on R6 L1. */
export function pathProblem(ranks: number[]): string | null {
  const s = [...new Set(ranks)].sort((a, b) => a - b)
  for (let i = 1; i < s.length; i++) {
    if (s[i] - s[i - 1] > 1 && s[i] !== 6) return 'Only a Feast skips ranks, and a Feast always lands on R6 L1.'
  }
  return null
}
