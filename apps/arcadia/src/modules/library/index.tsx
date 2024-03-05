import { useActiveAddress } from "arweave-wallet-kit";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { getLikedTracksIds, getTrackProcess } from "@/lib/library/likedTracks";
import { getTracks } from "@/lib/track/getTracks";
import { TrackCard } from "../track/TrackCard";
import { css } from "@/styles/css";
import { IoMdHeart, IoMdPodium } from "react-icons/io";
import { Link as RouterLink } from "react-router-dom";
import { useGetProcessId } from "@/hooks/appData";

type CurrentTab = "liked-songs" | "liked-albums" | "playlists";

export const Library = () => {
  const [currentTab, setCurrentTab] = useState<CurrentTab>("liked-songs");
  const address = useActiveAddress();
  const navigate = useNavigate();

  const { id: processId, exists: processExists } = useGetProcessId(address);

  const { data: likedTrackTxs, isSuccess: likedTrackTxsSuccess } = useQuery({
    queryKey: [`likedTracksTxs`, address],
    queryFn: async () => getLikedTracksIds(processId),
    enabled: currentTab === "liked-songs" && !!processId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
  });

  const { data: likedTracks } = useQuery({
    queryKey: [`likedTracks`, address],
    queryFn: () => {
      if (!likedTrackTxs?.length) return;

      return getTracks({ txids: likedTrackTxs });
    },
    enabled: likedTrackTxsSuccess,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address]);

  return (
    <>
      {address ? (
        <Flex direction="column" height="100%" position="relative">
          <TabsRoot
            defaultValue="liked-songs"
            onValueChange={(e) => setCurrentTab(e as CurrentTab)}
            style={css({ height: "100%" })}
          >
            <TabsList>
              <TabsTrigger value="liked-songs">Liked songs</TabsTrigger>
              <TabsTrigger value="liked-albums">Liked albums </TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
            </TabsList>

            <Box pb="2" style={css({ height: "100%" })}>
              <TabsContent
                value="liked-songs"
                style={css({ height: "100%", padding: "var(--space-3)" })}
              >
                {processExists && (
                  <>
                    {likedTracks && likedTracks.length > 0 ? (
                      <>
                        <Heading as="h2">Liked tracks</Heading>
                        <Grid p="3" gap="2" asChild>
                          <ul>
                            {likedTracks.map((track, idx) => (
                              <TrackCard
                                key={track.txid}
                                track={track}
                                tracks={likedTracks}
                                trackIndex={idx}
                              />
                            ))}
                          </ul>
                        </Grid>
                      </>
                    ) : (
                      <Grid mt="-7" style={css({ placeItems: "center", height: "100%" })}>
                        <Flex direction="column" gap="3" style={css({ textAlign: "center" })}>
                          <Heading as="h3" weight="medium" align="center">
                            Tracks you save will appear here
                          </Heading>
                          <Text>
                            Save a track by clicking the{" "}
                            <IoMdHeart
                              aria-label="heart"
                              style={css({
                                verticalAlign: "middle",
                                marginBlockEnd: "var(--space-1)",
                              })}
                            />{" "}
                            icon.
                          </Text>
                          <Button mt="5" style={css({ alignSelf: "center" })} asChild>
                            <RouterLink to={"/"}>Discover tracks</RouterLink>
                          </Button>
                        </Flex>
                      </Grid>
                    )}
                  </>
                )}
                {!processExists && (
                  <Grid mt="-7" style={css({ placeItems: "center", height: "100%" })}>
                    <Flex direction="column" gap="3" style={css({ textAlign: "center" })}>
                      <Heading as="h3" weight="medium" align="center">
                        Complete profile to unlock
                      </Heading>
                      <Text>To start saving tracks, you need to first complete set up.</Text>
                      <Button mt="5" style={css({ alignSelf: "center" })}>
                        Go to settings
                      </Button>
                    </Flex>
                  </Grid>
                )}
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
