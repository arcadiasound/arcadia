import { useActiveAddress } from "arweave-wallet-kit";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, TabsContent, TabsList, TabsRoot, TabsTrigger, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { getLikedTracks } from "@/lib/library/likedTracks";

type CurrentTab = "liked-songs" | "liked-albums" | "playlists";

export const Library = () => {
  const [currentTab, setCurrentTab] = useState<CurrentTab>("liked-songs");
  const address = useActiveAddress();
  const navigate = useNavigate();

  // const { data: likedSongs } = useQuery({
  //   queryKey: [`getLikedTracks`],
  //   queryFn: getLikedTracks,
  //   enabled: currentTab === "liked-songs",
  //   onSuccess: (data) => console.log(data),
  //   onError: (error) => console.error(error),
  // });

  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address]);

  return (
    <>
      {address ? (
        <Flex direction="column">
          <TabsRoot
            defaultValue="liked-songs"
            onValueChange={(e) => setCurrentTab(e as CurrentTab)}
          >
            <TabsList>
              <TabsTrigger value="liked-songs">Liked songs</TabsTrigger>
              <TabsTrigger value="liked-albums">Liked albums </TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
            </TabsList>

            <Box px="4" pt="3" pb="2">
              <TabsContent value="liked-songs">
                <Text>Liked songs</Text>
              </TabsContent>

              <TabsContent value="liked-albums">
                <Text>Liked albums</Text>
              </TabsContent>

              <TabsContent value="playlists">
                <Text>Playlists</Text>
              </TabsContent>
            </Box>
          </TabsRoot>
        </Flex>
      ) : null}
    </>
  );
};
