import { accountSnapshot } from '../data/guide'
import { energy, epicTomes, gems, legendaryTomes, rareTomes, silver } from '../data/resources'

type Nums = Record<string, number>
type Flags = Record<string, boolean>

const n = (nums: Nums, key: string) => nums[key] ?? 0

export function tomesUsed(nums: Nums) {
  const legendary = legendaryTomes.rows.reduce((a, r) => a + n(nums, `tome.${r.counter}`), 0) + n(nums, 'tome.leg.other')
  const epic = epicTomes.plans.reduce((a, p) => a + n(nums, `tome.${p.counter}`), 0) + n(nums, 'tome.epic.other')
  const rare = n(nums, `tome.${rareTomes.counter}`) + n(nums, 'tome.rare.other')
  const mythic = n(nums, 'tome.mythic.used')
  return { legendary, epic, rare, mythic }
}

export function tomeStock(nums: Nums) {
  return {
    legendary: nums['stock.tomes.legendary'] ?? accountSnapshot.tomes.legendary,
    epic: nums['stock.tomes.epic'] ?? accountSnapshot.tomes.epic,
    rare: nums['stock.tomes.rare'] ?? accountSnapshot.tomes.rare,
    mythic: nums['stock.tomes.mythic'] ?? accountSnapshot.tomes.mythic,
  }
}

export function tomesLeft(nums: Nums) {
  const used = tomesUsed(nums)
  const stock = tomeStock(nums)
  return {
    legendary: stock.legendary - used.legendary,
    epic: stock.epic - used.epic,
    rare: stock.rare - used.rare,
    mythic: stock.mythic - used.mythic,
  }
}

export const energySpent = (nums: Nums) => energy.rows.reduce((a, r) => a + n(nums, `spent.energy.${r.id}`), 0)
export const silverSpent = (nums: Nums) => silver.rows.reduce((a, r) => a + n(nums, `spent.silver.${r.id}`), 0)
export const gemsSpent = (flags: Flags, nums: Nums) =>
  gems.spend.reduce((a, g) => a + (flags[g.id] ? g.cost : 0), 0) + n(nums, 'spent.gems.other')
export const brewsUsed = (nums: Nums) => n(nums, 'spent.brews')

export const stageOf = (nums: Nums, key: string) => n(nums, `stage.${key}`)
export const accountLevel = (nums: Nums) => nums['accountLevel'] ?? 0
