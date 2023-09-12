import { UnfollowersList } from "./UnfollowersList";
import { UserInfo } from "./UserInfo";
import { UnfollowersProvider } from "../context/UnfollowersContext";

export const Main = () => {
  return (
    <main className="Main">
      <div className="container mx-auto flex flex-col gap-4 sm:gap-6 md:gap-8 overflow-hidden h-full">
        <UnfollowersProvider>
          <UserInfo />
          <UnfollowersList />
        </UnfollowersProvider>
      </div>
    </main>
  );
};
