import { chimera, hydra, starterTeam, ukTeam } from '../data/clanBoss'
import { arena, dungeons } from '../data/dungeons'
import type { ChampionId } from '../data/types'

export interface Appearance {
  area: string
  context: string
  slot: string
  cell: string
  role: string
  to: string
}

/** Every team table in the guide that lists this champion. */
export function teamAppearances(id: ChampionId): Appearance[] {
  const out: Appearance[] = []
  for (const s of starterTeam.slots)
    if (s.ids.includes(id))
      out.push({ area: 'Demon Lord', context: 'Step 1 — Starter team', slot: s.slot, cell: s.champ, role: [s.role, s.notes].filter(Boolean).join(' · '), to: '/clan-boss/demon-lord#starter-team' })
  for (const s of ukTeam.slots)
    if (s.ids.includes(id))
      out.push({
        area: 'Demon Lord',
        context: 'Step 2 — Budget Maneater Unkillable',
        slot: s.slot,
        cell: s.champ,
        role: `True speed ${s.speed} · Books: ${s.books} · Gear: ${s.gear} · Masteries: ${s.masteries}`,
        to: '/clan-boss/demon-lord#uk-team',
      })
  for (const k of hydra.keys)
    if (k.ids.includes(id)) out.push({ area: 'Hydra', context: k.key, slot: k.key, cell: k.team, role: k.roles, to: '/clan-boss/hydra' })
  for (const s of chimera.team)
    if (s.ids.includes(id)) out.push({ area: 'Chimera', context: 'Chimera team', slot: s.slot, cell: s.champ, role: s.why, to: '/clan-boss/chimera' })
  for (const d of dungeons) {
    for (const s of d.team) {
      const w1 = s.w1Ids?.includes(id)
      const w2 = s.w2Ids.includes(id)
      if (!w1 && !w2) continue
      const waves = d.hasWave1 ? (w1 && w2 ? 'Wave 1 & 2' : w1 ? 'Wave 1' : 'Wave 2') : 'Wave 2'
      const cell = w1 && !w2 ? s.w1! : s.w2
      out.push({
        area: d.short,
        context: waves,
        slot: s.slot,
        cell,
        role: [s.role, s.targets ? `Targets: ${s.targets}` : ''].filter(Boolean).join(' · '),
        to: `/dungeons/${d.id}`,
      })
    }
  }
  for (const a of arena.week1)
    if (a.ids.includes(id)) out.push({ area: 'Arena', context: 'Week-1 offense', slot: 'Offense', cell: a.name, role: a.note, to: '/dungeons/arena' })
  for (const a of arena.wave2)
    if (a.ids.includes(id)) out.push({ area: 'Arena', context: 'Wave-2 offense', slot: 'Offense', cell: a.name, role: a.note, to: '/dungeons/arena' })
  return out
}
