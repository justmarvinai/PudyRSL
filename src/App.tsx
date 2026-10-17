import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { ChampionDetail } from './pages/ChampionDetail'
import { Champions } from './pages/Champions'
import { ClanBoss } from './pages/ClanBoss'
import { Dashboard } from './pages/Dashboard'
import { Dungeons } from './pages/Dungeons'
import { NotFound } from './pages/NotFound'
import { RankUp } from './pages/RankUp'
import { Resources } from './pages/Resources'
import { Roadmap } from './pages/Roadmap'
import { Rules } from './pages/Rules'
import { Settings } from './pages/Settings'

// The full guide pulls in the markdown renderer, so it loads on demand.
const Guide = lazy(() => import('./pages/Guide'))

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="t-label py-24 text-center text-low">Loading the guide…</div>}>{children}</Suspense>
)

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="champions" element={<Champions />} />
        <Route path="champions/:id" element={<ChampionDetail />} />
        <Route path="clan-boss/:tab?" element={<ClanBoss />} />
        <Route path="dungeons/:tab?" element={<Dungeons />} />
        <Route path="rank-up" element={<RankUp />} />
        <Route path="resources/:tab?" element={<Resources />} />
        <Route path="rules" element={<Rules />} />
        <Route
          path="guide"
          element={
            <Lazy>
              <Guide />
            </Lazy>
          }
        />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
