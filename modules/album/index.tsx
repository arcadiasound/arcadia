import { appConfig } from "@/appConfig";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { useConnect } from "@/hooks/useConnect";
import { getAlbum } from "@/lib/getAlbum";
import { getTotalDuration } from "@/lib/getDuration";
import { getProfile } from "@/lib/getProfile";
import { getTracks } from "@/lib/getTracks";
import { styled } from "@/stitches.config";
import { Box } from "@/ui/Box";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Skeleton } from "@/ui/Skeleton";
import { Typography } from "@/ui/Typography";
import { abbreviateAddress } from "@/utils";
import { formatDuration } from "@/utils/audio";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { IoPauseSharp, IoPlaySharp } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { PlayButton } from "../track/components/PlayButton";
import { TrackItem } from "./components/TrackItem";

const TrackSkeleton = styled(Skeleton, {
  width: "100%",
  height: 68,
});

const StyledLink = styled(Link, Flex);

const StyledTypography = styled(Typography, {
  variants: {
    contrast: {
      hi: {
        color: "$whiteA12",
      },
      lo: {
        color: "$whiteA11",
      },
    },
  },
});

export const Album = () => {
  const { walletAddress } = useConnect();
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);

  const {
    audioRef,
    playing,
    tracklist,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    audioCtxRef,
  } = useAudioPlayer();

  const id = urlParams.get("tx");

  const {
    data: album,
    isLoading: albumLoading,
    isError: albumError,
  } = useQuery({
    queryKey: [`album-${id}`],
    enabled: !!id,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!id) {
        return;
      }

      return getAlbum(id);
    },
  });

  const {
    data: albumTracks,
    isLoading: albumTracksLoading,
    isError: albumTracksError,
  } = useQuery({
    queryKey: [`album-tracks-${album?.id}`],
    enabled: !!album,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!album?.items) {
        return;
      }

      return getTracks(album.items, audioCtxRef);
    },
  });

  const { data: account } = useQuery({
    queryKey: [`profile-${album?.creator}`],
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!album?.creator) {
        return;
      }

      return getProfile(album?.creator);
    },
  });

  const { data: totalDuration } = useQuery({
    queryKey: ["totalDuration"],
    enabled: !!albumTracks,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!albumTracks || !albumTracks.length) {
        return;
      }

      return getTotalDuration(albumTracks);
    },
  });

  const handleClick = () => {
    if (!albumTracks) {
      return;
    }

    if (tracklist === albumTracks) {
      togglePlaying?.();
    } else {
      setTracklist?.(albumTracks, 0);
      setCurrentTrackId?.(albumTracks[0].txid);
      setCurrentTrackIndex?.(0);
    }
  };

  const trackInAlbumPlaying =
    albumTracks && albumTracks.some((track) => track.txid === currentTrackId);

  const isPlaying = playing && trackInAlbumPlaying;

  return (
    <Flex direction="column">
      <Flex
        css={{
          pt: 100,
          pb: "$10",
          px: "$10",
          width: "100%",
          maxHeight: "52dvh",
          overflow: "hidden",
          position: "relative",

          background: album?.artworkId
            ? `url(${appConfig.defaultGateway}/${album.artworkId})`
            : "$slate3",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        gap="5"
      >
        {album?.artworkId && (
          <Box
            css={{
              position: "absolute",
              inset: 0,
              backgroundColor: "$blackA11",
              backdropFilter: "blur(20px)",
              "-webkit-backdrop-filter": "blur(8px)",
              backfaceVisibility: "hidden",
              "-webkit-backface-visibility": "hidden",
              transform: "translate3d(0,0,0)",
              "-webkit-transform": "translate3d(0,0,0)",
            }}
          />
        )}
        {albumLoading && (
          <Box
            css={{
              width: "100%",
              minHeight: 250,
            }}
          />
        )}
        {album && (
          <Flex
            gap="5"
            css={{
              width: "100%",
              zIndex: 1,
            }}
          >
            <Image
              css={{
                width: 250,
                height: 250,
                maxWidth: 250,
                maxHeight: 250,
                flex: 1,
                outline: "2px solid $neutralInvertedA3",
                outlineOffset: "-2px",
              }}
              src={`${appConfig.defaultGateway}/${album.artworkId}`}
            />
            <Flex
              css={{
                width: "100%",
                p: "$5",
                flex: 1,
              }}
              gap="20"
              align="center"
              justify="between"
            >
              <Flex
                css={{ height: "100%" }}
                direction="column"
                justify="between"
                gap="10"
              >
                <Flex align="center" gap="3">
                  <PlayButton
                    css={{
                      backgroundColor: "$whiteA12",
                      color: "$blackA12",

                      "&:hover": {
                        backgroundColor: "$whiteA11",
                      },
                    }}
                    disabled={!albumTracks || !albumTracks.length}
                    onClick={handleClick}
                    playing={isPlaying}
                    size="3"
                  >
                    {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
                  </PlayButton>
                  <Box>
                    <StyledTypography size="1">
                      {album.releaseType}
                    </StyledTypography>
                    <StyledTypography size="6" weight="5" contrast="hi">
                      {album.title}
                    </StyledTypography>
                  </Box>
                </Flex>

                <Flex gap="3" align="center">
                  {album.creator && (
                    <StyledLink
                      gap="3"
                      align="center"
                      to={{
                        pathname: "/profile",
                        search: `?addr=${album.creator}`,
                      }}
                    >
                      <Image
                        css={{
                          boxSize: "$5",
                          br: "$round",
                        }}
                        src={
                          account?.profile && account?.profile.avatarURL
                            ? account?.profile.avatarURL
                            : `https://source.boringavatars.com/marble/20/${album.creator}`
                        }
                      />
                      <StyledTypography contrast="hi" size="2" weight="5">
                        {account?.profile?.name ||
                          abbreviateAddress({
                            address: walletAddress,
                          })}
                      </StyledTypography>
                    </StyledLink>
                  )}
                  {albumTracks && albumTracks.length && (
                    <>
                      <StyledTypography contrast="hi" size="2">
                        •
                      </StyledTypography>
                      <StyledTypography contrast="hi" size="2">
                        {albumTracks.length} tracks
                      </StyledTypography>
                    </>
                  )}
                  {totalDuration && (
                    <>
                      <StyledTypography contrast="hi" size="2">
                        •
                      </StyledTypography>
                      <StyledTypography size="2">
                        {formatDuration({
                          duration: totalDuration,
                          options: { suffix: true },
                        })}
                      </StyledTypography>
                    </>
                  )}
                </Flex>
              </Flex>
              {album.genre ||
                (album.topics && (
                  <Flex direction="column" gap="3" align="end">
                    {album.genre && (
                      <StyledTypography size="1">electronic</StyledTypography>
                    )}
                    {album.topics && (
                      <Flex
                        as="ul"
                        wrap="wrap"
                        gap="2"
                        css={{
                          listStyleType: "none",
                        }}
                      >
                        {album.topics.map((topic) => (
                          <StyledTypography
                            as="li"
                            css={{
                              px: "$3",
                              py: "$1",
                              br: "$pill",
                              backgroundColor: "$slate3",
                            }}
                            size="1"
                          >
                            {topic}
                          </StyledTypography>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                ))}
            </Flex>
          </Flex>
        )}
      </Flex>
      {albumTracks?.length && (
        <Flex
          as="ol"
          css={{
            px: "$10",
            pt: "$10",
            listStyleType: "none",
          }}
          direction="column"
          gap="1"
        >
          {albumTracks.map((track, trackIndex) => (
            <TrackItem
              key={track.txid}
              track={track}
              tracks={albumTracks}
              trackIndex={trackIndex}
            />
          ))}
        </Flex>
      )}
      {albumTracksLoading && (
        <Flex
          as="ol"
          css={{
            px: "$10",
            pt: "$10",
          }}
          direction="column"
          gap="1"
        >
          <TrackSkeleton />
          <TrackSkeleton />
          <TrackSkeleton />
        </Flex>
      )}
    </Flex>
  );
};
