import { useUnfollowersContext } from "../context/UnfollowersContext";

export const UnfollowersList = () => {
  const { unfollowers } = useUnfollowersContext();

  return (
    <>
      <div>
        {unfollowers.length === 0
          ? "Enter Your Informations"
          : `Unfollowers: ${unfollowers.length} Users`}
      </div>
      <ul className="UnfollowersList no-scrollbar flex flex-col gap-3 overflow-y-scroll">
        {unfollowers.map((unfollower) => (
          <li key={unfollower.id}>{unfollower}</li>
        ))}
      </ul>
    </>
  );
};
