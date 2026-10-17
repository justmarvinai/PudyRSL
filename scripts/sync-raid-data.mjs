// Builds the bundled raid-data subset used for portraits, icons and tooltips.
//
//   npm pack raid-data@4.10.1 && tar -xzf raid-data-4.10.1.tgz
//   npm i --no-save sharp
//   node scripts/sync-raid-data.mjs ./package
//
// raid-data (MIT) by Léo Maradan, originally by Goctionni — sourced from the
// game and Ayumilove. It is an April 2021 snapshot, so newer champions are missing.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const src = path.resolve(process.argv[2] ?? 'package')
const root = path.resolve(import.meta.dirname, '..')
const outJson = path.join(root, 'src/data/raid-data.json')
const outImg = path.join(root, 'public/rsl')

const read = (p) => JSON.parse(fs.readFileSync(path.join(src, p), 'utf8'))
const base = read('champions-base-info.json')
const pkg = read('package.json')

// Every champion the guide names, with raid-data's spelling where it differs.
const aliases = {
  Graal: 'Crypt-King Graal',
  Fodbor: 'Fodbor the Bard',
  Toragi: 'Toragi the Frog',
  Ursala: 'Ursala the Mourner',
  Visix: 'Visix the Unbowed',
  Melga: 'Melga Steelgirdle',
}
const core = ['Maneater', 'Pain Keeper', 'Deacon Armstrong', 'Skullcrusher', 'Prince Kymar', 'Seer']
const others = [
  'Frozen Banshee', 'Graal', 'Fenax', 'Fenshi', 'Alure', 'Fodbor', 'Toragi', 'Ursala', 'Jareg', 'Rearguard Sergeant',
  'Apothecary', 'High Khatun', 'Bellower', 'Paragon', 'Bulwark', 'Visix', 'Terrorbeast', 'Masked Fearmonger',
  'Snorting Thug', 'Ursine Icecrusher', 'Yaga the Insatiable', 'Bushi', 'Deathless', 'Bergoth the Malformed',
  'Flesh-Tearer', 'Kytis', 'Maeve', 'Baerdal Fellhammer', 'Dark Athel', 'Hope', 'Jinglehunter', 'Jizoh', 'Marksman',
  'Romero', 'Shaman', 'Tainix Hateflower', 'Lordly Legionary', 'Bonekeeper', 'Kaiden', 'Melga', 'Tayrel',
  'Old Hermit Jorrg', 'Runekeeper Dazdurk', 'Lightsworn', 'Jotun', 'Dark Elhain', 'Oathbound', 'Skytouched Shaman',
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const fileId = (name) => name.replace(/ /g, '_')

fs.mkdirSync(path.join(outImg, 'portraits'), { recursive: true })
fs.mkdirSync(path.join(outImg, 'icons'), { recursive: true })

async function portrait(name) {
  const file = path.join(src, 'images/avatar', `${fileId(name)}.png`)
  if (!fs.existsSync(file)) return null
  const out = `portraits/${slug(name)}.webp`
  await sharp(file).resize(120, 156).webp({ quality: 80 }).toFile(path.join(outImg, out))
  return `/rsl/${out}`
}

const champions = {}
for (const guideName of [...core, ...others]) {
  const name = aliases[guideName] ?? guideName
  const b = base[name]
  if (!b) throw new Error(`raid-data has no ${name}`)
  const entry = {
    name,
    rarity: b.rarity,
    affinity: b.affinity,
    faction: b.faction,
    role: b.role,
    aura: b.aura ?? null,
    portrait: await portrait(name),
  }
  if (core.includes(guideName)) {
    const det = read(`champion-details/${fileId(name)}.json`)
    entry.gameVersion = det.version
    entry.auraText = det.aura ?? null
    entry.stats = det.stats
    entry.skills = det.skills.map((s, i) => ({
      slot: `A${i + 1}`,
      name: s.abilityname,
      description: s.description,
      cooldown: s.cd || null,
      minCooldown: s.mincd || null,
      passive: !!s.passive,
      books: s.books ?? [],
    }))
  }
  champions[guideName] = entry
}

// Status effect icons (game file name → term used in the guide).
const effects = {
  Unkillable: ['Unkillable', 'buff'],
  BlockDebuff: ['Block Debuffs', 'buff'],
  BlockDamage: ['Block Damage', 'buff'],
  ProtectAlly: ['Ally Protection', 'buff'],
  StatusCounterAttack: ['Counterattack', 'buff'],
  Shield: ['Shield', 'buff'],
  ReviveOnDeath: ['Revive on Death', 'buff'],
  ReflectDamage: ['Reflect Damage', 'buff'],
  StatusIncreaseSpeed: ['Increase SPD', 'buff'],
  Invisible: ['Veil', 'buff'],
  Invisible2: ['Perfect Veil', 'buff'],
  BlockBuffs: ['Block Buffs', 'debuff'],
  BlockRevive: ['Block Revive', 'debuff'],
  BlockSkill: ['Block Active Skills', 'debuff'],
  Provoke: ['Provoke', 'debuff'],
  Stun: ['Stun', 'debuff'],
  Freeze: ['Freeze', 'debuff'],
  Sleep: ['Sleep', 'debuff'],
  Fear: ['Fear', 'debuff'],
  StatusReduceAttack: ['Decrease ATK', 'debuff'],
  StatusReduceDefence: ['Decrease DEF', 'debuff'],
  StatusReduceSpeed: ['Decrease SPD', 'debuff'],
  IncreaseDamageTaken: ['Weaken', 'debuff'],
  ContinuousDamage: ['Poison', 'debuff'],
  AoEContinuousDamage: ['HP Burn', 'debuff'],
}
const icons = {}
for (const [file, [term, kind]] of Object.entries(effects)) {
  const out = `icons/${slug(term)}.png`
  fs.copyFileSync(path.join(src, 'images/Buffs', `${file}.png`), path.join(outImg, out))
  icons[term] = { src: `/rsl/${out}`, kind }
}

const extra = [
  ['images/Affinity/magic.png', 'affinity-magic.png', null],
  ['images/Affinity/force.png', 'affinity-force.png', null],
  ['images/Affinity/spirit.png', 'affinity-spirit.png', null],
  ['images/Affinity/void.png', 'affinity-void.png', null],
  ['images/Books/SkillUpgradeItemRare.png', 'tome-rare.webp', 64],
  ['images/Books/SkillUpgradeItemEpic.png', 'tome-epic.webp', 64],
  ['images/Books/SkillUpgradeItemLegendary.png', 'tome-legendary.webp', 64],
  ['images/Misc/Gems.png', 'gems.webp', 48],
  ['images/Misc/Silver.png', 'silver.webp', 48],
]
for (const [from, to, size] of extra) {
  const dest = path.join(outImg, 'icons', to)
  if (size) await sharp(path.join(src, from)).resize(size, size, { fit: 'inside' }).webp({ quality: 82 }).toFile(dest)
  else fs.copyFileSync(path.join(src, from), dest)
}
await sharp(path.join(src, 'images/boss_avatar/Clan_Boss.png')).resize(280, 364).webp({ quality: 80 }).toFile(path.join(outImg, 'demon-lord.webp'))

const data = {
  source: {
    name: 'raid-data',
    version: pkg.version,
    license: pkg.license,
    url: 'https://github.com/McRadane/raid-data',
    credits: 'Léo Maradan (raid-data), original author Goctionni. Data from the game and Ayumilove.',
  },
  champions,
  icons,
}
fs.writeFileSync(outJson, JSON.stringify(data, null, 2) + '\n')
console.log(`champions: ${Object.keys(champions).length}, portraits: ${Object.values(champions).filter((c) => c.portrait).length}, icons: ${Object.keys(icons).length}`)
