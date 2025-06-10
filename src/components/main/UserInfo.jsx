import { useState } from 'react'
import axios from 'axios'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useUnfollowersContext } from '../context/UnfollowersContext'

export const UserInfo = () => {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { getUnfollowers } = useUnfollowersContext()

  const handleGetUnfollowers = async () => {
    if (isLoading || !username.trim()) return // Prevent multiple clicks during loading and empty username

    setIsLoading(true)
    try {
      const fetchAllUsers = async (url) => {
        let allUsers = []
        let page = 1
        let hasMoreData = true

        while (hasMoreData) {
          const response = await axios.get(`${url}?page=${page}`)
          if (response.data.length === 0) {
            hasMoreData = false
          } else {
            allUsers = allUsers.concat(response.data)
            page++
          }
        }

        return allUsers
      }

      const followersData = await fetchAllUsers(
        `https://api.github.com/users/${username}/followers`
      )

      const followingData = await fetchAllUsers(
        `https://api.github.com/users/${username}/following`
      )

      const notFollowing = followingData.filter((follow) => {
        return !followersData.some(
          (follower) => follower.login === follow.login
        )
      })

      getUnfollowers(notFollowing)
    } catch (error) {
      alert('Something went wrong. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGetUnfollowers()
    }
  }

  return (
    <div className="UserInfo flex flex-col sm:flex-row gap-4 items-center justify-center text-gray-950">
      <Input
        placeholder="Enter Your Username"
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <Button onClick={handleGetUnfollowers} disabled={isLoading}>
        {isLoading ? (
          <div className="mx-auto h-5 w-5 rounded-full border-2 border-t-white border-black animate-spin"></div>
        ) : (
          'Get Unfollowers'
        )}
      </Button>
    </div>
  )
}
