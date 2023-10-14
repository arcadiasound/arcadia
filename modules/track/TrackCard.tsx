import { Track, Tracklist } from "@/types";
import { abbreviateAddress } from "@/utils";
import { useEffect, useState } from "react";
import { IconButton } from "@/ui/IconButton";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { IoPauseSharp, IoPlaySharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Box } from "@/ui/Box";
import { Image } from "@/ui/Image";
import { getProfile } from "@/lib/getProfile";
import { useQuery } from "@tanstack/react-query";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";

export const TrackCard = ({
  track,
  trackIndex,
  tracks,
}: {
  track: Track;
  trackIndex: number;
  tracks: Tracklist;
}) => {
  const {
    audioRef,
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
  } = useAudioPlayer();

  const { data: account, isError } = useQuery({
    queryKey: [`profile-${track.creator}`],
    queryFn: () => getProfile(track.creator),
  });

  const handleClick = () => {
    if (currentTrackId === track.txid) {
      togglePlaying?.();
      handlePlayPause();
    } else {
      // run function that takes index of current track within tracklist array, and creates tracklist of remaining tracks
      if (trackIndex >= 0) {
        // create a new tracklist starting from the selected track index
        const newTracklist = tracks.slice(trackIndex);

        console.log({ newTracklist });

        setTracklist?.(newTracklist);
        setCurrentTrackId?.(track.txid);
        setCurrentTrackIndex?.(0);

        // audioRef.current?.load();
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const isPlaying = playing && currentTrackId === track.txid;

  useEffect(() => {
    if (currentTrackId === track.txid) {
      console.log(currentTrackId);
      console.log(isPlaying);
    }
  }, [currentTrackId]);

  return (
    <Flex direction="column" gap="2">
      <Box
        css={{
          position: "relative",
          "& [data-overlay]": {
            display: "none",
          },

          "& button": {
            display: "none",
          },

          "&:hover": {
            "& [data-overlay]": {
              display: "block",
            },

            "& button": {
              display: "inline-flex",
            },
          },
        }}
      >
        <Link
          to={{
            pathname: "/track",
            search: `?tx=${track.txid}`,
          }}
        >
          <Box
            css={{
              width: 200,
              height: 200,
              position: "relative",
            }}
          >
            <Box
              data-overlay
              css={{
                width: "100%",
                height: "100%",
                position: "absolute",
                background: `linear-gradient(
                to top,
                hsl(0, 0%, 0%) 0%,
                hsla(0, 0%, 0%, 0.738) 19%,
                hsla(0, 0%, 0%, 0.541) 34%,
                hsla(0, 0%, 0%, 0.382) 47%,
                hsla(0, 0%, 0%, 0.278) 56.5%,
                hsla(0, 0%, 0%, 0.194) 65%,
                hsla(0, 0%, 0%, 0.126) 73%,
                hsla(0, 0%, 0%, 0.075) 80.2%,
                hsla(0, 0%, 0%, 0.042) 86.1%,
                hsla(0, 0%, 0%, 0.021) 91%,
                hsla(0, 0%, 0%, 0.008) 95.2%,
                hsla(0, 0%, 0%, 0.002) 98.2%,
                hsla(0, 0%, 0%, 0) 100%
              )`,
                opacity: 0.7,
              }}
            />
            <Image
              css={{
                width: 200,
                height: 200,
              }}
              src={
                track.artworkId
                  ? `https://arweave.net/${track.artworkId}`
                  : `https://source.boringavatars.com/marble/200/${track.txid}?square=true`
              }
            />
          </Box>
        </Link>
        <IconButton
          css={{
            br: 9999,
            color: "$whiteA12",
            backgroundColor: "$blackA12",
            opacity: 0.9,
            position: "absolute",
            width: 64,
            height: 64,
            left: 0,
            right: 0,
            ml: "auto",
            mr: "auto",
            top: 0,
            bottom: 0,
            mt: "auto",
            mb: "auto",
            zindex: 999,

            "& svg": {
              fontSize: 28,
              transform: isPlaying ? "translateX(0)" : "translateX(1px)",
            },

            "&:hover": {
              backgroundColor: "#000",
              opacity: 0.9,
            },

            "&:active": {
              transform: "scale(0.95)",
            },
          }}
          size="3"
          data-playing={isPlaying}
          aria-checked={isPlaying}
          role="switch"
          onClick={handleClick}
        >
          {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
        </IconButton>
      </Box>
      <Box>
        <Link
          to={{
            pathname: "/track",
            search: `?tx=${track.txid}`,
          }}
        >
          <Typography size="1" contrast="hi">
            {track?.title}
          </Typography>
        </Link>
        <Link
          to={{
            pathname: "/profile",
            search: `?addr=${track.creator}`,
          }}
        >
          <Typography size="1" title={track.creator}>
            {account?.profile.name ||
              abbreviateAddress({
                address: track.creator,
                options: { endChars: 5, noOfEllipsis: 3 },
              })}
          </Typography>
        </Link>
      </Box>
    </Flex>
  );
};
