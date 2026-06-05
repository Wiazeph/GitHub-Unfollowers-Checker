import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Unfollowers } from './components/features/unfollowers/Unfollowers'

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
        <Unfollowers />
      </main>
      <Footer />
      <Toaster richColors theme="dark" position="bottom-right" />
      <Analytics />
    </div>
  )
}

export default App
