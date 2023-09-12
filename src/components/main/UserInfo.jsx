import { useState } from "react";
import axios from "axios";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useUnfollowersContext } from "../context/UnfollowersContext";

export const UserInfo = () => {
  const [username, setUsername] = useState("");
  const [userToken, setUserToken] = useState("");

  const { getUnfollowers } = useUnfollowersContext();

  const handleGetUnfollowers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      };

      const fetchAllUsers = async (url, config) => {
        let allUsers = [];
        let page = 1;

        while (true) {
          const response = await axios.get(`${url}?page=${page}`, config);
          if (response.data.length === 0) {
            break;
          }
          allUsers = allUsers.concat(response.data);
          page++;
        }

        return allUsers;
      };

      const followersData = await fetchAllUsers(
        `https://api.github.com/users/${username}/followers`,
        config
      );

      const followingData = await fetchAllUsers(
        `https://api.github.com/users/${username}/following`,
        config
      );

      const following = followingData.map((user) => user.login);
      const followers = followersData.map((user) => user.login);
      const notFollowing = following.filter(
        (follow) => !followers.includes(follow)
      );

      getUnfollowers(notFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-gray-950">
      <Input
        placeholder="Enter Your Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        placeholder="Enter Your Token"
        onChange={(e) => setUserToken(e.target.value)}
      />
      <Button onClick={handleGetUnfollowers}>Get Unfollowers</Button>
    </div>
  );
};
