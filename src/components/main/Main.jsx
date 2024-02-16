import { UnfollowersList } from "./UnfollowersList";
import { UserInfo } from "./UserInfo";
import { UnfollowersProvider } from "../context/UnfollowersContext";

export const Main = () => {
  return (
    <main className="Main">
      <div className="container mx-auto overflow-hidden h-full flex flex-col gap-y-6">
        <UnfollowersProvider>
          <UserInfo />
          <UnfollowersList />
        </UnfollowersProvider>
      </div>
    </main>
  );
};
