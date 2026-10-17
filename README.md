# PudyRSL

Your private, interactive Raid: Shadow Legends progression companion. Everything on the site comes from
[`rsl_data.md`](./rsl_data.md) (“RAID Starter Account Progression Guide”, Oct 17, 2026). The original document
is also shown word for word on the **Full Guide** page.

Dark mode only, desktop-first (it also works on a phone), password-locked, and your progress is saved in your browser.

**Design:** set in [Mona Sans](https://github.com/github/mona-sans) with wide, heavy display headlines. The interface itself is
monochrome; colour only appears where it means something in Raid — rarity (Rare blue, Epic purple, Legendary orange, Mythical red),
affinity, buffs (blue) and debuffs (red) with their game icons, content areas (Demon Lord, Hydra, Chimera, each dungeon, Arena),
Clan Boss difficulty, and done/warning states. Champion names, skills (A1–A3), effects, stats and gear sets in the guide text are
colour-coded automatically, and hovering a champion, a skill or a [Sourced]/[My call] label shows a tooltip.

## What's inside

| Page | What you can do |
| --- | --- |
| **Dashboard** | Day counter and current phase, next roadmap tasks, next step for each champion, daily loops (resets daily), weekly Hydra/Chimera keys, your own reminders, notes, account-level unlocks, key numbers at a glance |
| **Roadmap** | The Day 1 / Week 1 / Weeks 2–4 / Month 2+ checklists with sub-steps. Ticks are linked to champion steps, tomes, dungeon stages and gems, so a box you tick anywhere updates everywhere |
| **Clan Boss** | Demon Lord rules and requirements, the starter team, the Budget Maneater tune with openers, a **speed tune checker** (true speeds plus the stun-target HP/DEF rules), the difficulty timeline, a **key planner** for your 133 stored keys, Hydra heads/teams, Chimera form cycle/team |
| **Dungeons & Arena** | Mechanics, stage affinities, Wave 1 ↔ Wave 2 teams, stage trackers with the roadmap milestones, Arena offense |
| **Champions** | All 13 core champions as cards or a coverage matrix, filters, and a page per champion: build journey, every team they appear in, tracker (affinity, ascension, speed, HP/DEF, notes), gear/masteries/brews. Also the bench and alternatives |
| **6★ Plan** | Wave 1 and Wave 2 tables with done ticks, crafted-fodder counters, the chicken supply math, and a tracker for the safe-to-sacrifice Epics (plus the keep list) |
| **Resources** | Brew table plus a **brew calculator**, tome planner with remaining tomes, masteries, and energy/gems/silver budgets you log spending against, Great Hall, unlocks, gear sets |
| **Rules & Checks** | “What not to do” and the open questions to verify in-game, with space for what you find |
| **Full Guide** | The original document with a table of contents, find-in-page and a download button |

Keyboard: `Ctrl/⌘ K` or `/` search · `1`–`9` sections · `,` settings · `[` sidebar · `←/→` previous/next champion · `?` all shortcuts.

## Deploy on Vercel (free Hobby plan)

1. On [vercel.com](https://vercel.com) choose **Add New → Project** and import this GitHub repository.
   Vercel detects **Vite** automatically; keep the defaults (build `npm run build`, output `dist`).
2. Before (or right after) the first deploy, open **Settings → Environment Variables** and add
   - `PUDY_PASSWORD` = the password you want (tick Production, and Preview if you use previews).
3. Deploy, or redeploy if the site was already deployed, so the variable takes effect.

Open your `*.vercel.app` URL and you'll see the PudyRSL lock screen. Tick “Remember this device” to stay signed in for a year.
**Lock** in the sidebar signs this device out. Changing `PUDY_PASSWORD` signs out every device.

If `PUDY_PASSWORD` is missing, the site stays locked and shows setup instructions instead (it never opens without a password).

### How the lock works

`middleware.ts` is Vercel Routing Middleware. It runs before every request, including JS/CSS files, and lets a request through only with a valid
`HttpOnly`, `Secure` session cookie (an HMAC of your password). Pages without the cookie get the lock screen; files get `401`.
`robots.txt` and the lock screen's own font (`/fonts/`, Mona Sans) are the only public files, and every response asks search engines not to index the site.

## Your progress

- Saved automatically in this browser (`localStorage`); nothing is sent anywhere.
- **Settings → Download backup** saves a `.json` file; **Restore from file** (or drag & drop) loads it on another browser or device.
- The top bar reminds you to back up if you haven't in 14 days.
- **Settings** also sets your Day 1 date (defaults to the guide's date, Oct 17, 2026), when the daily checklist resets,
  and the weekday the weekly keys reset.

## Develop locally

```bash
npm install
npm run dev        # http://localhost:5173 (no lock in local dev)
npm test           # lock middleware + brew calculator tests
npm run build      # type-check + production build
```

To try the lock locally, copy `.env.example` to `.env`, set a password, and run `npx vercel dev` (Vercel CLI).

Stack: Vite 8, React 19, TypeScript, Tailwind CSS 4, Motion, Zustand, React Router 7, react-markdown, Mona Sans (self-hosted via Fontsource).

## Game data (raid-data)

There is no official Raid: Shadow Legends API. Portraits, buff/debuff icons, affinity/tome/gem/silver icons, the Demon Lord art,
and the skill tooltips, base stats, factions and roles of six core champions come from
[raid-data](https://github.com/McRadane/raid-data) 4.10.1 (MIT; Léo Maradan, originally Goctionni; data from the game and Ayumilove),
a free static dataset. A small subset is bundled into the site (`src/data/raid-data.json`, `public/rsl/`), so nothing is fetched at runtime.

It is an **April 2021 snapshot** (skill text from game v3.30.2), so:

- Gizmak, Galleus, Ninja, Rathalos, Artak, Ultimate Deathknight and Ruella aren't in it — they show a monogram tile instead of art.
- Skill text and base stats don't include later reworks; everything from it is labelled, and your guide wins where they differ.
- Affinities from raid-data are shown as suggestions (“Void · data”) next to the guide's “check in-game”; confirm before relying on them.

To refresh the subset: `npm pack raid-data@4.10.1`, extract it into its own folder, `npm i --no-save sharp`, then
`node scripts/sync-raid-data.mjs <extracted-package-folder>`.

## About the data

All guide content lives in `src/data/`, transcribed from `rsl_data.md`. The guide's own labels are kept:
**[Sourced]** = a cited fact or published tune, **[My call]** = the guide author's recommendation.
Calculators only use the guide's own numbers and formulas: the XP table, 12,500 / 18,750 XP per brew, the chest thresholds and
“keys needed = threshold ÷ damage per key, minus free keys”.

Things in the guide worth knowing:

- **Seer/Ruella mismatched brews:** the table lists 276. Rounding per rank, as every other row does, gives 36 + 78 + 161 = **275**.
- **Deacon and Ultimate Deathknight** are marked “Starter” for Demon Lord in the 13-champion table, but the Step 1 starter team doesn't include them
  (Deacon is on the “keep out of the Budget Maneater team” list; UDK is a Wave 2 Decrease ATK option).
- **Ruella** shows “–” for Hydra in the table, while Hydra keys 2–3 list “Skullcrusher/Ruella”.
- **Stun target speed “111–118 (121 on NM)”:** the speed checker reads this as an upper limit of 121 on Nightmare.
- The guide's own open questions (unconfirmed affinities, 2022 chest thresholds, stored-key behaviour, etc.) are on **Rules & Checks**.
  Chest thresholds in the key planner can be overwritten if they've been retuned.
