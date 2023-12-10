import { appConfig } from "@/appConfig";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { getDuration } from "@/lib/getDuration";
import { getProfile } from "@/lib/getProfile";
import { LikeButton } from "@/modules/track/components/LikeButton";
import { PlayButton } from "@/modules/track/components/PlayButton";
import { keyframes, styled } from "@/stitches.config";
import { Track } from "@/types";
import { Box } from "@/ui/Box";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Typography } from "@/ui/Typography";
import { abbreviateAddress } from "@/utils";
import { formatDuration } from "@/utils/audio";
import { useQuery } from "@tanstack/react-query";
import { BsDiscFill } from "react-icons/bs";
import { IoPauseSharp, IoPlaySharp } from "react-icons/io5";
import { RxDotFilled } from "react-icons/rx";
import { Link } from "react-router-dom";

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

const SpinWrapper = styled("span", {
  display: "grid",
  placeItems: "center",
  color: "$neutralInvertedA12",
  "& svg": {
    animation: `${spin} 1s linear infinite`,
  },
});

interface TrackItemProps {
  track: Track;
  tracks: Track[];
  trackIndex: number;
}

export const TrackItem = ({ track, tracks, trackIndex }: TrackItemProps) => {
  const {
    tracklist,
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    handlePlayPause,
  } = useAudioPlayer();

  const { data: duration, isLoading: durationLoading } = useQuery({
    queryKey: [`track-${track.txid}`],
    queryFn: () => getDuration(track.txid),
  });

  const { data: account } = useQuery({
    queryKey: [`profile-${track.creator}`],
    refetchOnWindowFocus: false,
    queryFn: () => getProfile(track.creator),
  });

  const handleClick = () => {
    handlePlayPause?.();

    if (track.txid === currentTrackId && tracks === tracklist) {
      togglePlaying?.();
    } else {
      setTracklist?.(tracks, trackIndex);
      setCurrentTrackId?.(track.txid);
      setCurrentTrackIndex?.(trackIndex);
    }
  };

  const isPlaying =
    playing && tracks === tracklist && track.txid === currentTrackId;

  return (
    <Flex
      as="li"
      css={{
        py: "$3",
        px: "$5",
        pl: "$10",
        position: "relative",
        br: "$2",

        backgroundColor: isPlaying ? "$neutralInvertedA4" : "transparent",

        "& [data-play-button], [data-like-button]": {
          opacity: 0,

          "&:focus": {
            opacity: 1,
          },

          // override un-muting button when item is liked
          "&:disabled": {
            opacity: 0,
          },

          '&[aria-disabled="true"]': {
            opacity: 0,
          },
        },

        "&:hover": {
          backgroundColor: "$neutralInvertedA3",

          "& [data-play-button], [data-like-button]": {
            opacity: 1,
          },
        },
      }}
      justify="between"
      align="center"
    >
      <Flex align="center" gap="3">
        <Box
          css={{
            position: "absolute",
            left: "$3",
          }}
        >
          {isPlaying ? (
            <SpinWrapper as="span">
              <BsDiscFill />
            </SpinWrapper>
          ) : (
            <Typography css={{ userSelect: "none" }} size="1">
              {trackIndex + 1}
            </Typography>
          )}
        </Box>
        <Box
          css={{
            position: "relative",
          }}
        >
          <Image
            css={{
              boxSize: "$10",
              outline: ".5px solid $neutralInvertedA3",
              outlineOffset: "-.5px",
            }}
            src={`${appConfig.defaultGateway}/${track.artworkId}`}
          />
          <PlayButton
            onClick={handleClick}
            playing={isPlaying}
            size="1"
            data-play-button
            css={{
              position: "absolute",
              left: 0,
              right: 0,
              ml: "auto",
              mr: "auto",
              top: 0,
              bottom: 0,
              mt: "auto",
              mb: "auto",

              color: "$whiteA12",
              backgroundColor: "$blackA12",

              "&:hover": {
                backgroundColor: "#000",
              },
            }}
          >
            {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
          </PlayButton>
        </Box>
        <Flex align="center" gap="2">
          <Link
            to={{
              pathname: "/track",
              search: `?tx=${track.txid}`,
            }}
          >
            <Typography size="2" contrast="hi">
              {track.title}
            </Typography>
          </Link>
          <RxDotFilled />
          <Link
            to={{
              pathname: "/profile",
              search: `?addr=${track.creator}`,
            }}
          >
            <Typography size="1" css={{ color: "$neutralInvertedA11" }}>
              {account?.profile.name ||
                abbreviateAddress({
                  address: track.creator,
                  options: { endChars: 5, noOfEllipsis: 3 },
                })}
            </Typography>
          </Link>
        </Flex>
      </Flex>
      <Flex align="center" gap="3">
        <LikeButton data-like-button txid={track.txid} />
        <Typography
          css={{
            maxWidth: 80,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
          size="1"
        >
          {duration ? `${formatDuration({ duration })}` : "-"}
        </Typography>
      </Flex>
    </Flex>
  );
};
