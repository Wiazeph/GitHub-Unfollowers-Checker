import { useEffect, useRef, useState } from 'react'
import { useUnfollowers } from '../../../hooks/useUnfollowers'
import { useAuth } from '../../../hooks/useAuth'
import { useActiveTab } from '../../../hooks/activeTab'
import { UnfollowersSearch } from './UnfollowersSearch'
import { UnfollowersResults } from './UnfollowersResults'
import { PlatformSelector } from '../PlatformSelector'
import { InstagramGuide } from '../instagram/InstagramGuide'
import { TwitterArchiveGuide } from '../twitter/TwitterArchiveGuide'
import type { PlatformId } from '../../../types/platform'
import type { SelectorTab } from '../../../platforms'

export const Unfollowers = () => {
  const { data: auth, isLoading: authLoading } = useAuth()
  const { tab, setTab } = useActiveTab()
  const [inputValue, setInputValue] = useState('')
  const [searchedHandle, setSearchedHandle] = useState('')
  const mutation = useUnfollowers()

  // Instagram (bookmarklet) and X (archive upload) are browser-only tabs with no
  // server provider, so they don't drive the search/results flow below.
  const isInstagram = tab === 'instagram'
  const isTwitter = tab === 'twitter'
  const isStandaloneTab = isInstagram || isTwitter
  const platform = (isStandaloneTab ? 'github' : tab) as PlatformId

  // Each platform has its own session, so the user can be signed in to several
  // at once. "Authed" here means: signed in to the platform of the active tab.
  const activeSession = auth?.[platform] ?? null
  const isAuthed = activeSession !== null
  const ownHandle = activeSession?.handle ?? ''

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

  // On first load, land on a platform the user is signed in to (so a Bluesky
  // login returns to the Bluesky tab, not GitHub). Only runs once; manual tab
  // switches afterwards are respected.
  const tabInitialized = useRef(false)
  useEffect(() => {
    if (tabInitialized.current || authLoading) return
    tabInitialized.current = true
    const signedIn = auth?.github ? 'github' : auth?.bluesky ? 'bluesky' : null
    if (signedIn) {
      setTab(signedIn)
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
            isPending={mutation.isPending}
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
