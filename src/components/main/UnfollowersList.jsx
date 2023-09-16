import { useUnfollowersContext } from "../context/UnfollowersContext";

export const UnfollowersList = () => {
  const { unfollowers } = useUnfollowersContext();

  return (
    <>
      {unfollowers.length === 0 ? (
        <div className="text-center text-xl">
          Enter your username to find out who doesn't follow you!
        </div>
      ) : (
        <>
          <div className="text-center text-xl">{`${unfollowers.length} Users`}</div>

          <ul className="UnfollowersList no-scrollbar overflow-y-scroll items-center flex flex-col sm:flex-row sm:flex-wrap gap-y-6">
            {unfollowers.map((unfollower) => (
              <li key={unfollower.id} className="w-fit sm:w-1/2 md:w-1/3">
                <a
                  href={unfollower.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit flex gap-4 items-center"
                >
                  <img
                    src={unfollower.avatar_url}
                    alt="avatar"
                    className="object-cover rounded-full w-10 h-10"
                  />
                  <div className="font-semibold">{unfollower.login}</div>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};
