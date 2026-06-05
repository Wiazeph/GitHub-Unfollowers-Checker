import { useEffect, useRef, useState } from 'react'
import { useUnfollowers } from '../../../hooks/useUnfollowers'
import { useAuth } from '../../../hooks/useAuth'
import { UnfollowersSearch } from './UnfollowersSearch'
import { UnfollowersResults } from './UnfollowersResults'

export const Unfollowers = () => {
  const { data: auth, isLoading: authLoading } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const [searchedUsername, setSearchedUsername] = useState('')
  const mutation = useUnfollowers()

  const isAuthed = auth?.authenticated ?? false
  const ownLogin = auth?.authenticated ? auth.login : ''

  const handleSearch = (username: string) => {
    setInputValue(username)
    setSearchedUsername(username)
    mutation.mutate(username)
  }

  // When signed in, auto-load the user's own unfollowers once — no need to type.
  // (Auth resolves asynchronously, so this kicks off the first search.)
  const autoLoaded = useRef(false)
  useEffect(() => {
    if (autoLoaded.current) return
    if (isAuthed && ownLogin) {
      autoLoaded.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearch(ownLogin)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, ownLogin])

  const isOwnList =
    isAuthed &&
    searchedUsername.toLowerCase() === ownLogin.toLowerCase() &&
    searchedUsername !== ''

  return (
    <div className="flex flex-col gap-8">
      <UnfollowersSearch
        value={inputValue}
        onChange={setInputValue}
        onSearch={handleSearch}
        isPending={mutation.isPending}
        isAuthed={isAuthed}
      />
      <UnfollowersResults
        username={searchedUsername}
        isPending={mutation.isPending || authLoading}
        isError={mutation.isError}
        data={mutation.data}
        isAuthed={isAuthed}
        isOwnList={isOwnList}
        onBackToMyList={() => handleSearch(ownLogin)}
      />
    </div>
  )
}
