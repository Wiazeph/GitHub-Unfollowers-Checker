import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Unfollowers } from './components/features/unfollowers/Unfollowers'
import { useTheme } from './hooks/useTheme'

function App() {
  const { theme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
        <Unfollowers />
      </main>
      <Footer />
      <Toaster richColors theme={theme} position="bottom-right" />
      <Analytics />
    </div>
  )
}

export default App
