import { Track as TrackType } from "@/types";
import { Flex } from "@/ui/Flex";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getTrack } from "@/lib/getTrack";
import { Image } from "@/ui/Image";
import { Box } from "@/ui/Box";
import { useEffect } from "react";
import { IoPauseSharp, IoPlaySharp } from "react-icons/io5";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { IconButton } from "@/ui/IconButton";
import { Typography } from "@/ui/Typography";
import { abbreviateAddress } from "@/utils";
import { Button } from "@/ui/Button";

export const Track = () => {
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const {
    audioRef,
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
  } = useAudioPlayer();

  const id = urlParams.get("tx");

  if (!id) {
    // return no track view
    // return;
  }

  const { data: track, isError } = useQuery({
    queryKey: [`track-${id}`],
    queryFn: () => {
      if (!id) {
        throw new Error("No track ID has been found");
      }

      return getTrack(id);
    },
  });

  if (!track && isError) {
    // return error view
  }

  if (!track) {
    // return;
  }

  const handleClick = () => {
    if (!track) {
      return;
    }
    if (currentTrackId === track?.txid) {
      togglePlaying?.();
      handlePlayPause();
    } else {
      setTracklist?.([track]);
      setCurrentTrackId?.(track.txid);
      setCurrentTrackIndex?.(0);
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

  const isPlaying = playing && currentTrackId === track?.txid;

  return (
    <Flex gap="10">
      <Box
        css={{
          backgroundColor: "$slate2",

          width: 200,
          height: 200,

          "@bp3": {
            width: 500,
            height: 500,
          },

          "@bp5": {
            width: 600,
            height: 600,
          },
        }}
      >
        {track && (
          <Image
            css={{
              aspectRatio: 1 / 1,
              width: "100%",
              height: "100%",
            }}
            src={
              track.artworkId
                ? `https://arweave.net/${track.artworkId}`
                : `https://source.boringavatars.com/marble/200/${track.txid}?square=true`
            }
          />
        )}
      </Box>
      <Flex direction="column" gap="10">
        <Flex gap="3" align="center">
          <IconButton
            css={{
              br: 9999,
              color: "$slate1",
              backgroundColor: "$slate12",
              opacity: 0.9,
              width: 64,
              height: 64,

              "& svg": {
                fontSize: 28,
                transform: isPlaying ? "translateX(0)" : "translateX(1px)",
              },

              "&:hover": {
                backgroundColor: "$slate11",
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
          <Flex direction="column">
            <Typography contrast="hi" size="6">
              {track?.title}
            </Typography>
            <Typography size="4">
              {abbreviateAddress({
                address: track?.creator,
              })}
            </Typography>
          </Flex>
        </Flex>
        <Flex direction="column" gap="7">
          <Flex gap="3" align="center">
            <Box
              css={{
                width: 48,
                height: 48,
                backgroundColor: "$slate3",
                br: 9999,
              }}
            />
            <Typography size="4">
              {abbreviateAddress({ address: track?.creator })}
            </Typography>
          </Flex>
          <Typography
            css={{
              // fix needed: webkit-box removes space between this section and button
              display: "-webkit-box",
              "-webkit-line-clamp": 2,
              "-webkit-box-orient": "vertical",
              overflow: "hidden",
              maxWidth: "60ch",
            }}
          >
            {track?.description || "No track description."}
          </Typography>
        </Flex>
        <Button
          as="a"
          href={`https://bazar.arweave.dev/#/asset/${track?.txid}`}
          css={{ alignSelf: "start", br: "$2", cursor: "pointer" }}
          variant="solid"
        >
          View on Bazar
        </Button>
      </Flex>
    </Flex>
  );
};
