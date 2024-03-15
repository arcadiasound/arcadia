import { useActiveAddress } from "arweave-wallet-kit";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heading, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@radix-ui/themes";
import { BsGear, BsPersonBoundingBox } from "react-icons/bs";

type CurrentTab = "general" | "profile";

export const Settings = () => {
  const address = useActiveAddress();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<CurrentTab>("general");

  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address]);

  return (
    <>
      {address ? (
        <TabsRoot defaultValue="general" onValueChange={(e) => setCurrentTab(e as CurrentTab)}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <ul>
              TODO
              <li>preferred gateway</li>
              <li>theme</li>
              <li></li>
            </ul>
          </TabsContent>

          <TabsContent value="profile">Edit profile</TabsContent>
        </TabsRoot>
      ) : null}
    </>
  );
};
