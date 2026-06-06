import { useEffect, useRef, useState } from 'react'
import { useUnfollowers } from '../../../hooks/useUnfollowers'
import { useAuth } from '../../../hooks/useAuth'
import { UnfollowersSearch } from './UnfollowersSearch'
import { UnfollowersResults } from './UnfollowersResults'
import { PlatformSelector } from '../PlatformSelector'
import { InstagramGuide } from '../instagram/InstagramGuide'
import { TwitterArchiveGuide } from '../twitter/TwitterArchiveGuide'
import type { PlatformId } from '../../../types/platform'
import type { SelectorTab } from '../../../platforms'

export const Unfollowers = () => {
  const { data: auth, isLoading: authLoading } = useAuth()
  const [tab, setTab] = useState<SelectorTab>('github')
  const [inputValue, setInputValue] = useState('')
  const [searchedHandle, setSearchedHandle] = useState('')
  const mutation = useUnfollowers()

  // Instagram (bookmarklet) and X (archive upload) are browser-only tabs with no
  // server provider, so they don't drive the search/results flow below.
  const isInstagram = tab === 'instagram'
  const isTwitter = tab === 'twitter'
  const isStandaloneTab = isInstagram || isTwitter
  const platform = (isStandaloneTab ? 'github' : tab) as PlatformId

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

  // On first load, land on the platform the user is signed in to (so a Bluesky
  // login returns to the Bluesky tab, not GitHub). Only runs once; manual tab
  // switches afterwards are respected.
  const tabInitialized = useRef(false)
  useEffect(() => {
    if (tabInitialized.current || authLoading) return
    tabInitialized.current = true
    if (auth?.authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab(auth.platform)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  // When signed in (on the active platform), auto-load the user's own list once.
  const autoLoaded = useRef(false)
  useEffect(() => {
    if (autoLoaded.current || isStandaloneTab) return
    if (isAuthed && ownHandle) {
      autoLoaded.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSearch(ownHandle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, ownHandle, isStandaloneTab])

  const isOwnList =
    isAuthed &&
    searchedHandle.toLowerCase() === ownHandle.toLowerCase() &&
    searchedHandle !== ''

  return (
    <div className="flex flex-col gap-8">
      <PlatformSelector value={tab} onChange={handleTabChange} />

      {isInstagram ? (
        <InstagramGuide />
      ) : isTwitter ? (
        <TwitterArchiveGuide />
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
