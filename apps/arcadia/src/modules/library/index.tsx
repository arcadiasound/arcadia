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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTracksProcess, getLikedTracksIds } from "@/lib/library/likedTracks";
import { getTracks } from "@/lib/track/getTracks";
import { css } from "@/styles/css";
import { IoMdHeart } from "react-icons/io";
import { Link as RouterLink } from "react-router-dom";
import { useGetProcessId } from "@/hooks/appData";
import { saveProcessId } from "@/utils";
import { TrackItem } from "../track/TrackItem";

const BANNER_HEIGHT = 200;

type CurrentTab = "liked-tracks" | "liked-albums" | "playlists";

export const Library = () => {
  const [currentTab, setCurrentTab] = useState<CurrentTab>("liked-tracks");
  const address = useActiveAddress();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useGetProcessId(address);
  const processId = data?.id;
  const processExists = data?.exists;

  const createProcess = useMutation({
    mutationFn: createTracksProcess,
    onSuccess: (data) => {
      saveProcessId({ type: `likedTracks-${address}`, id: data || "" });
      queryClient.invalidateQueries([`likedTracksProcess`, address]);
    },
    onError: (error) => console.error(error),
  });

  const { data: likedTrackTxs, isSuccess: likedTrackTxsSuccess } = useQuery({
    queryKey: [`likedTracksTxs`, address],
    queryFn: async () => {
      if (!processId) return;

      return getLikedTracksIds(processId);
    },
    enabled: currentTab === "liked-tracks" && !!processId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
  });

  const { data: likedTracks } = useQuery({
    queryKey: [`likedTracks`, address],
    queryFn: () => {
      if (!likedTrackTxs?.length) return [];

      return getTracks({ txids: likedTrackTxs });
    },
    enabled: currentTab === "liked-tracks",
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log("likedTracks: ", data);
    },
  });

  useEffect(() => {
    if (likedTrackTxs) {
      console.log({ likedTrackTxs });
    }
  }, [likedTrackTxs]);

  useEffect(() => {
    if (likedTracks) {
      console.log({ likedTracks });
    }
  }, [likedTracks]);

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
            defaultValue="liked-tracks"
            onValueChange={(e) => setCurrentTab(e as CurrentTab)}
          >
            <TabsList>
              <TabsTrigger value="liked-tracks">Liked tracks</TabsTrigger>
              <TabsTrigger value="liked-albums">Liked albums </TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
            </TabsList>

            <Box>
              <TabsContent value="liked-tracks">
                {processExists && (
                  <>
                    {likedTracks && likedTracks.length > 0 ? (
                      <>
                        <Box
                          style={css({
                            width: "100%",
                            height: BANNER_HEIGHT,
                            position: "relative",
                          })}
                        >
                          <Box
                            position="absolute"
                            inset="0"
                            style={css({ backgroundColor: "var(--gray-3)" })}
                          />
                          <Box
                            style={css({
                              position: "absolute",
                              inset: 0,
                              background: `linear-gradient(
                                to top,
                                var(--black-a9) 0%,
                                var(--black-a3) 50%,
                                var(--black-a1) 65%,
                                var(--black-a1) 75.5%,
                                var(--black-a1) 82.85%,
                                var(--black-a1) 88%,
                                var(--black-a1) 100%
                                  )`,
                            })}
                          />
                          <Heading
                            as="h2"
                            size="8"
                            weight="medium"
                            style={css({
                              position: "absolute",
                              left: "var(--space-3)",
                              bottom: "var(--space-3)",
                            })}
                          >
                            Liked tracks
                          </Heading>
                        </Box>
                        <Grid p="3" gap="2" asChild>
                          <ul>
                            {likedTracks.map((track, idx) => (
                              <TrackItem
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
                      <Grid position="relative" style={css({ placeItems: "center", top: "30dvh" })}>
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
                  <Grid position="relative" style={css({ placeItems: "center", top: "30dvh" })}>
                    <Flex direction="column" gap="3" style={css({ textAlign: "center" })}>
                      <Heading as="h3" weight="medium" align="center">
                        Complete profile to unlock
                      </Heading>
                      <Text>To start saving tracks, you need to first complete set up.</Text>
                      <Button
                        onClick={() => createProcess.mutate({ owner: address })}
                        mt="5"
                        style={css({ alignSelf: "center" })}
                      >
                        {createProcess.isLoading ? "Activating..." : "Activate"}
                      </Button>
                      {/* <Button mt="5" style={css({ alignSelf: "center" })}>
                        Go to settings
                      </Button> */}
                    </Flex>
                  </Grid>
                )}
              </TabsContent>

              <TabsContent value="liked-albums">
                <Text>Coming soon.</Text>
              </TabsContent>

              <TabsContent value="playlists">
                <Text>Coming soon.</Text>
              </TabsContent>
            </Box>
          </TabsRoot>
        </Flex>
      ) : null}
    </>
  );
};
