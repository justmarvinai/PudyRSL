// Run with: npm test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { brewPaths, brewPlan, pathProblem, XP_PER_BREW, XP_PER_BREW_MATCHED } from '../src/lib/brews.ts'

// "Brews are XP" table in rsl_data.md section 6: [matched, mismatched].
const guideTable: [keyof typeof brewPaths, number, number][] = [
  ['galleus', 108, 161],
  ['kymar', 160, 239],
  ['maneater', 132, 197],
  ['deacon', 132, 197],
  ['painkeeper', 119, 178],
  ['ninja', 160, 239],
  ['artak', 160, 239],
  ['rathalos', 160, 239],
  ['udk', 160, 239],
]

test('calculator reproduces the guide brew table', () => {
  for (const [id, matched, mismatched] of guideTable) {
    const ranks = brewPaths[id].ranks
    assert.equal(brewPlan(ranks, XP_PER_BREW_MATCHED).brews, matched, `${id} matched`)
    assert.equal(brewPlan(ranks, XP_PER_BREW).brews, mismatched, `${id} mismatched`)
  }
})

test('Skullcrusher to 5★ L50 is 76 / 114, plus 108 later for R6', () => {
  assert.equal(brewPlan([4, 5], XP_PER_BREW_MATCHED).brews, 76)
  assert.equal(brewPlan([4, 5], XP_PER_BREW).brews, 114)
  assert.equal(brewPlan([6], XP_PER_BREW_MATCHED).brews, 108)
  assert.equal(brewPlan([4, 5], XP_PER_BREW_MATCHED).xp, 1_412_888)
})

test('Seer/Ruella: 184 matched; per-rank rounding gives 275 mismatched (guide lists 276)', () => {
  assert.equal(brewPlan(brewPaths.seer.ranks, XP_PER_BREW_MATCHED).brews, 184)
  assert.equal(brewPlan(brewPaths.seer.ranks, XP_PER_BREW).brews, 275)
})

test('Gizmak needs no brews', () => {
  assert.equal(brewPlan(brewPaths.gizmak.ranks, XP_PER_BREW_MATCHED).brews, 0)
})

test('only a Feast (to R6) may skip ranks', () => {
  assert.equal(pathProblem([4, 6]), null)
  assert.equal(pathProblem([3, 4, 5, 6]), null)
  assert.notEqual(pathProblem([3, 5]), null)
})
