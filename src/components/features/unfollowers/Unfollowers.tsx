import { useEffect, useRef, useState } from 'react'
import { useUnfollowers } from '../../../hooks/useUnfollowers'
import { useAuth } from '../../../hooks/useAuth'
import { UnfollowersSearch } from './UnfollowersSearch'
import { UnfollowersResults } from './UnfollowersResults'
import { PlatformSelector } from '../PlatformSelector'
import { InstagramGuide } from '../instagram/InstagramGuide'
import type { PlatformId } from '../../../types/platform'
import type { SelectorTab } from '../../../platforms'

export const Unfollowers = () => {
  const { data: auth, isLoading: authLoading } = useAuth()
  const [tab, setTab] = useState<SelectorTab>('github')
  const [inputValue, setInputValue] = useState('')
  const [searchedHandle, setSearchedHandle] = useState('')
  const mutation = useUnfollowers()

  const isInstagram = tab === 'instagram'
  const platform = (isInstagram ? 'github' : tab) as PlatformId

  // Auth is GitHub-only today; only treat the user as authed on their platform.
  const isAuthed = auth?.authenticated === true && auth.platform === platform
  const ownHandle = isAuthed ? auth.handle : ''

  const handleSearch = (handle: string) => {
    setInputValue(handle)
    setSearchedHandle(handle)
    mutation.mutate({ platform, handle })
  }

  const handleTabChange = (next: SelectorTab) => {
    if (next === tab) return
    setTab(next)
    setInputValue('')
    setSearchedHandle('')
    mutation.reset()
    autoLoaded.current = false
  }

  // When signed in (on the active platform), auto-load the user's own list once.
  const autoLoaded = useRef(false)
  useEffect(() => {
    if (autoLoaded.current || isInstagram) return
    if (isAuthed && ownHandle) {
      autoLoaded.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearch(ownHandle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, ownHandle, isInstagram])

  const isOwnList =
    isAuthed &&
    searchedHandle.toLowerCase() === ownHandle.toLowerCase() &&
    searchedHandle !== ''

  return (
    <div className="flex flex-col gap-8">
      <PlatformSelector value={tab} onChange={handleTabChange} />

      {isInstagram ? (
        <InstagramGuide />
      ) : (
        <div className="flex flex-col gap-8">
          <UnfollowersSearch
            platform={platform}
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            isPending={mutation.isPending}
            isAuthed={isAuthed}
          />
          <UnfollowersResults
            platform={platform}
            handle={searchedHandle}
            isPending={mutation.isPending || authLoading}
            isError={mutation.isError}
            data={mutation.data}
            isAuthed={isAuthed}
            isOwnList={isOwnList}
            onBackToMyList={() => handleSearch(ownHandle)}
          />
        </div>
      )}
    </div>
  )
}
