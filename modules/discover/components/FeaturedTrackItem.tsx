import { getProfile } from "@/lib/getProfile";
import { Track } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { BsSuitHeart } from "react-icons/bs";
import { IoPauseSharp, IoPlay, IoPlaySharp } from "react-icons/io5";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { Image } from "@/ui/Image";
import { Box } from "@/ui/Box";
import { appConfig } from "@/appConfig";
import { IconButton } from "@/ui/IconButton";
import { RxDotsHorizontal } from "react-icons/rx";
import { abbreviateAddress } from "@/utils";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { PlayButton } from "@/modules/track/components/PlayButton";

interface FeaturedTrackItemProps {
  track: Track;
  trackIndex: number;
  tracklist: Track[];
}

export const FeaturedTrackItem = ({
  track,
  trackIndex,
  tracklist,
}: FeaturedTrackItemProps) => {
  const {
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    audioRef,
    audioCtxRef,
  } = useAudioPlayer();

  const { data: creator } = useQuery({
    queryKey: [`profile-${track.creator}`],
    enabled: !!track.creator,
    queryFn: () => {
      if (!track.creator) {
        return;
      }

      return getProfile(track.creator);
    },
  });

  const handleClick = () => {
    handlePlayPause();

    if (currentTrackId === track.txid) {
      togglePlaying?.();
    } else {
      if (trackIndex >= 0) {
        setTracklist?.(tracklist, trackIndex);
        setCurrentTrackId?.(track.txid);
        setCurrentTrackIndex?.(trackIndex);
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioCtxRef.current) return;

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (playing) {
      audioRef.current.pause();
    }

    if (!playing && audioRef.current.readyState >= 2) {
      audioRef.current.play();
    }
  };

  const isPlaying = playing && currentTrackId === track.txid;

  return (
    <Flex
      key={track.txid}
      css={{
        width: "100%",
        maxHeight: "52dvh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Image
        css={{
          width: "100%",
          height: "100%",
          aspectRatio: 4 / 3,
          objectFit: "cover",
          objectPosition: "bottom",
        }}
        src={`${appConfig.defaultGateway}/${track.artworkId}`}
      />
      <Box
        css={{
          position: "absolute",
          inset: 0,
          backgroundColor: "$blackA10",
          backdropFilter: "blur(8px)",
          "-webkit-backdrop-filter": "blur(8px)",
          backfaceVisibility: "hidden",
          "-webkit-backface-visibility": "hidden",
          transform: "translate3d(0,0,0)",
          "-webkit-transform": "translate3d(0,0,0)",
        }}
      />
      <Flex
        css={{
          zIndex: 0,
          position: "absolute",
          inset: 0,
        }}
        align="center"
        gap="10"
        justify="center"
      >
        <Link
          to={{
            pathname: "/track",
            search: `?tx=${track.txid}`,
          }}
        >
          <Image
            css={{
              width: 300,
              height: 300,
              outline: "4px solid $whiteA4",
              outlineOffset: -4,
            }}
            src={`${appConfig.defaultGateway}/${track.artworkId}`}
          />
        </Link>
        <Flex css={{ zIndex: 1 }} direction="column" gap="7">
          <Box>
            <Link
              to={{
                pathname: "/track",
                search: `?tx=${track.txid}`,
              }}
            >
              <Typography size="6" weight="5" css={{ color: "$whiteA12" }}>
                {track.title}
              </Typography>
            </Link>
            <Link
              to={{
                pathname: "/profile",
                search: `?addr=${track.creator}`,
              }}
            >
              <Typography weight="5" css={{ color: "$whiteA11" }}>
                {creator
                  ? creator.profile.name
                  : abbreviateAddress({
                      address: track.creator,
                    })}
              </Typography>
            </Link>
          </Box>
          <Typography css={{ maxWidth: "40ch", color: "$whiteA11" }} size="2">
            {track.description || "-"}
          </Typography>
          <Flex gap="5">
            <PlayButton
              css={{
                backgroundColor: "$whiteA11",
                color: "$blackA12",

                "&:hover": {
                  backgroundColor: "$whiteA12",
                },
              }}
              size="3"
              playing={isPlaying}
              data-playing={isPlaying}
              aria-checked={isPlaying}
              role="switch"
              onClick={handleClick}
            >
              {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
            </PlayButton>
            {/* <IconButton size="3" variant="translucent" rounded>
              <BsSuitHeart />
            </IconButton> */}
            {/* <IconButton size="3" variant="translucent" rounded>
              <RxDotsHorizontal />
            </IconButton> */}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
