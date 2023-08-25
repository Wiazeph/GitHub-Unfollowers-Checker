import { UnfollowersList } from "./UnfollowersList";
import { UserInfo } from "./UserInfo";

export const Main = () => {
  return (
    <main className="Main">
      <div className="container mx-auto flex flex-col gap-8 sm:gap-10 overflow-hidden h-full">
        <UserInfo />
        <UnfollowersList />
      </div>
    </main>
  );
};
