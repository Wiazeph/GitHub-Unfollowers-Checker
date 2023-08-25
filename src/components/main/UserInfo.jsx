import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export const UserInfo = () => {
  return (
    <div className="flex flex-col md:flex-row gap-5 items-center justify-center text-gray-950">
      <Input placeholder="Enter Your Username" />
      <Input placeholder="Enter Your Token" />
      <Button>Get Unfollowers</Button>
    </div>
  );
};
