import { useGetUserProfile } from "@/hooks/appData";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getAlbumsByOwner } from "@/lib/track/getAlbumsByOwner";
import { getTracksByOwner } from "@/lib/track/getTracksByOwner";
import { TrackCard } from "@/modules/track/TrackCard";
import { css } from "@/styles/css";
import { Album, Track } from "@/types";
import { abbreviateAddress, compareArrays, formatReleaseDate, isAlbum } from "@/utils";
import {
  Box,
  Flex,
  Heading,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AlbumCard } from "./AlbumCard";

const StyledTabsRoot = styled(TabsRoot, {
  ".rt-TabsList": {
    boxShadow: "none",
    backgroundColor: "var(--gray-3)",
    width: "max-content",
    height: 36,
    borderRadius: `max(var(--radius-1), var(--radius-full))`,
  },

  ".rt-TabsTrigger": {
    paddingInline: "var(--space-1)",
  },

  ".rt-TabsTrigger:where([data-state='active'])::before": {
    height: 0,
  },

  ".rt-TabsTrigger:where([data-state='active'])": {
    ".rt-TabsTriggerInner": {
      backgroundColor: "var(--gray-12)",
      color: "var(--gray-1)",
    },
  },

  ".rt-TabsTriggerInner, .rt-TabsTriggerInnerHidden": {
    paddingInline: "var(--space-3)",
    borderRadius: `max(var(--radius-1), var(--radius-full))`,
  },
});

interface ReleasesProps {
  address: string;
}

export const Releases = (props: ReleasesProps) => {
  const { playing, currentTrackId, tracklist } = useAudioPlayer();
  const { address } = props;

  const {
    data: tracksData,
    fetchNextPage: fetchNextTracksPage,
    hasNextPage: hasMoreTracks,
  } = useInfiniteQuery(
    [`tracks-${props.address}`],
    ({ pageParam }) => getTracksByOwner({ owner: props.address, cursor: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.hasNextPage,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: albumsData,
    fetchNextPage: fetchNextAlbumsPage,
    hasNextPage: hasMoreAlbums,
  } = useInfiniteQuery(
    [`albums-${props.address}`],
    ({ pageParam }) => getAlbumsByOwner({ owner: props.address, cursor: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.hasNextPage,
      refetchOnWindowFocus: false,
    }
  );

  const combinedData = useMemo(() => {
    // Flatten and combine the data from tracks and albums
    const tracks = tracksData ? tracksData.pages.flatMap((page) => page.data) : [];
    const albums = albumsData ? albumsData.pages.flatMap((page) => page.data) : [];
    const combined = [...tracks, ...albums];

    // Sort the combined array by releaseDate, considering undefined values
    return combined.sort((a, b) => {
      // Ensure releaseDate is treated as a number explicitly
      const dateA = Number(a.releaseDate);
      const dateB = Number(b.releaseDate);

      if (a.releaseDate && b.releaseDate) {
        // Both have releaseDate, sort by date
        return dateA - dateB;
      } else if (a.releaseDate) {
        // Only a has a releaseDate, it goes first
        return -1;
      } else if (b.releaseDate) {
        // Only b has a releaseDate, it goes first
        return 1;
      } else {
        // Neither have a releaseDate, keep their current order
        return 0;
      }
    });
  }, [tracksData, albumsData]);

  const singles = useMemo(
    () => combinedData.filter((item) => item.releaseType === "single") as Track[],
    [combinedData]
  );
  const albums = useMemo(
    () => combinedData.filter((item) => item.releaseType === "album") as Album[],
    [combinedData]
  );

  const { data: profile } = useGetUserProfile({ address });

  return (
    <Box mt="5">
      <Heading as="h3" size="5" weight="medium">
        {profile?.Info?.name || abbreviateAddress({ address: props.address })}'s Discography
      </Heading>
      <StyledTabsRoot defaultValue="all" mt="4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="singles">Singles </TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
        </TabsList>

        <Box mt="3" pb="2">
          <TabsContent value="all">
            <Flex wrap="wrap" mt="4" gap="7" asChild>
              <ul>
                {combinedData.map((data, idx) => (
                  <>
                    {data.releaseType === "album" ? (
                      <>
                        {albums.map((album, idx) => (
                          <AlbumCard key={album.txid} album={album} albumIndex={idx}>
                            <Flex direction="column">
                              <Text data-album-card-title size="2" weight="medium">
                                {album.title}
                              </Text>
                              <Flex gap="2">
                                <Text
                                  size="1"
                                  color="gray"
                                  style={css({
                                    textTransform: "capitalize",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    maxWidth: "20ch",
                                  })}
                                >
                                  {album.releaseType}
                                </Text>
                                {album.releaseDate && (
                                  <Text size="1" color="gray">
                                    • {formatReleaseDate(album.releaseDate)}
                                  </Text>
                                )}
                              </Flex>
                            </Flex>
                          </AlbumCard>
                        ))}
                      </>
                    ) : (
                      <TrackCard track={data as Track} tracks={[data as Track]} trackIndex={0}>
                        <Flex direction="column">
                          <Text
                            size="2"
                            weight="medium"
                            style={css({
                              color:
                                playing &&
                                currentTrackId === data.txid &&
                                compareArrays(singles, tracklist)
                                  ? "var(--accent-11)"
                                  : "var(--gray-12)",
                            })}
                          >
                            {data.title}
                          </Text>
                          <Flex gap="2">
                            <Text
                              size="1"
                              color="gray"
                              style={css({
                                textTransform: "capitalize",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                maxWidth: "20ch",
                              })}
                            >
                              {data.releaseType}
                            </Text>
                            {data.releaseDate && (
                              <Text size="1" color="gray">
                                • {formatReleaseDate(data.releaseDate)}
                              </Text>
                            )}
                          </Flex>
                        </Flex>
                      </TrackCard>
                    )}
                  </>
                ))}
              </ul>
            </Flex>
          </TabsContent>
          <TabsContent value="singles">
            <Flex mt="4" gap="7" asChild>
              <ul>
                {singles.map((track, idx) => (
                  <TrackCard track={track as Track} tracks={singles} trackIndex={idx}>
                    <Flex direction="column">
                      <Text
                        size="2"
                        weight="medium"
                        style={css({
                          color:
                            playing &&
                            currentTrackId === track.txid &&
                            compareArrays(singles, tracklist)
                              ? "var(--accent-11)"
                              : "var(--gray-12)",
                        })}
                      >
                        {track.title}
                      </Text>
                      <Flex gap="2">
                        <Text
                          size="1"
                          color="gray"
                          style={css({
                            textTransform: "capitalize",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            maxWidth: "20ch",
                          })}
                        >
                          {track.releaseType}
                        </Text>
                        {track.releaseDate && (
                          <Text size="1" color="gray">
                            • {formatReleaseDate(track.releaseDate)}
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  </TrackCard>
                ))}
              </ul>
            </Flex>
          </TabsContent>
          <TabsContent value="albums">
            <ul>
              {albums.map((album, idx) => (
                <>
                  <AlbumCard key={album.txid} album={album} albumIndex={idx}>
                    <Flex direction="column">
                      <Text data-album-card-title size="2" weight="medium">
                        {album.title}
                      </Text>
                      <Flex gap="2">
                        <Text
                          size="1"
                          color="gray"
                          style={css({
                            textTransform: "capitalize",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            maxWidth: "20ch",
                          })}
                        >
                          {album.releaseType}
                        </Text>
                        {album.releaseDate && (
                          <Text size="1" color="gray">
                            • {formatReleaseDate(album.releaseDate)}
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  </AlbumCard>
                </>
              ))}
            </ul>
          </TabsContent>
        </Box>
      </StyledTabsRoot>
    </Box>
  );
};
