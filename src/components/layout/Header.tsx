import { AuthStatus } from './AuthStatus'

export const Header = () => {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div className="flex justify-end pt-4">
        <AuthStatus />
      </div>
      <div className="pt-8 pb-10 text-center sm:pt-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Unfollowers Checker
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-fg-muted sm:text-lg">
          Find out who you follow that doesn&apos;t follow you back — across
          GitHub, Bluesky, X, and Instagram.
        </p>
      </div>
    </header>
  )
}
