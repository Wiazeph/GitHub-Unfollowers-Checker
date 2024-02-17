import { useUnfollowersContext } from '../context/UnfollowersContext'

export const UnfollowersList = () => {
  const { unfollowers } = useUnfollowersContext()

  return (
    <>
      {unfollowers.length === 0 ? (
        <div className="text-center text-xl">
          Enter your username to find out who doesn't follow you!
        </div>
      ) : (
        <>
          <div className="text-center text-xl">{`${unfollowers.length} Users`}</div>

          <ul className="UnfollowersList no-scrollbar overflow-y-scroll flex flex-wrap justify-center sm:justify-start">
            {unfollowers.length === 0
              ? [...Array(9)].map((_, index) => (
                  <UnfollowersList.Loader key={index} />
                ))
              : unfollowers.map((unfollower) => (
                  <li
                    key={unfollower.id}
                    className="w-full sm:w-1/2 md:w-1/3 max-w-xs sm:max-w-none"
                  >
                    <a
                      href={unfollower.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="h-16 px-3 rounded-md flex gap-x-4 items-center hover:bg-neutral-800 transition-colors"
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
  )
}

UnfollowersList.Loader = function UnfollowersListLoader() {
  return (
    <div className="w-full sm:w-1/2 md:w-1/3 max-w-xs sm:max-w-none h-16 animate-pulse rounded-md" />
  )
}
