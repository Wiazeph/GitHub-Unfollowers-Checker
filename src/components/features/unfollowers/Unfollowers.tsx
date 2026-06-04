import { useState } from 'react'
import { useUnfollowers } from '../../../hooks/useUnfollowers'
import { UnfollowersSearch } from './UnfollowersSearch'
import { UnfollowersResults } from './UnfollowersResults'

export const Unfollowers = () => {
  const [searchedUsername, setSearchedUsername] = useState('')
  const mutation = useUnfollowers()

  const handleSearch = (username: string) => {
    setSearchedUsername(username)
    mutation.mutate(username)
  }

  return (
    <div className="flex flex-col gap-10">
      <UnfollowersSearch
        onSearch={handleSearch}
        isPending={mutation.isPending}
      />
      <UnfollowersResults
        username={searchedUsername}
        isPending={mutation.isPending}
        isError={mutation.isError}
        data={mutation.data}
      />
    </div>
  )
}
