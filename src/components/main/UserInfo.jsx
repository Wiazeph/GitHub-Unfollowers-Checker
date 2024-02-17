import { useState } from 'react'
import axios from 'axios'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useUnfollowersContext } from '../context/UnfollowersContext'

export const UserInfo = () => {
  const [username, setUsername] = useState('')

  const { getUnfollowers } = useUnfollowersContext()

  const handleGetUnfollowers = async () => {
    try {
      const fetchAllUsers = async (url) => {
        let allUsers = []
        let page = 1

        while (true) {
          const response = await axios.get(`${url}?page=${page}`)
          if (response.data.length === 0) {
            break
          }
          allUsers = allUsers.concat(response.data)
          page++
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
    }
  }

  return (
    <div className="UserInfo flex flex-col sm:flex-row gap-4 items-center justify-center text-gray-950">
      <Input
        placeholder="Enter Your Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <Button onClick={handleGetUnfollowers}>Get Unfollowers</Button>
    </div>
  )
}
