import { useState } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Unfollowers } from './components/features/unfollowers/Unfollowers'
import { useTheme } from './hooks/useTheme'
import { ActiveTabContext } from './hooks/activeTab'
import type { SelectorTab } from './platforms'

function App() {
  const { theme } = useTheme()
  // Active platform tab lives here so the header (AuthStatus) and the main view
  // share it — the header reflects the platform you're currently on.
  const [tab, setTab] = useState<SelectorTab>('github')

  return (
    <ActiveTabContext value={{ tab, setTab }}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
          <Unfollowers />
        </main>
        <Footer />
        <Toaster richColors theme={theme} position="bottom-right" />
      </div>
    </ActiveTabContext>
  )
}

export default App
