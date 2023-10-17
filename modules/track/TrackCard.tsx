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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { getStampCount, hasStamped, hasStampedTx, stamp } from "@/lib/stamps";
import { BsHeart, BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { useConnect } from "arweave-wallet-ui-test";

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
    audioCtxRef,
    audioRef,
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
  } = useAudioPlayer();
  const { walletAddress } = useConnect();

  const { data: account, isError } = useQuery({
    queryKey: [`profile-${track.creator}`],
    queryFn: () => getProfile(track.creator),
  });

  const queryClient = useQueryClient();

  const { data: stamps } = useQuery({
    queryKey: [`stampCount-${track.txid}`],
    queryFn: () => getStampCount(track.txid),
    onError: (error) => {
      console.error(error);
    },
  });

  const { data: stamped } = useQuery({
    queryKey: [`stamped-${track.txid}`],
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!walletAddress) {
        throw new Error("No wallet address found");
      }

      // return hasStamped([track.txid]);
      return hasStampedTx(track.txid, walletAddress);
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const mutation = useMutation({
    mutationFn: stamp,
    //@ts-ignore
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: [`stampCount-${track.txid}`, `stamped-${track.txid}`],
      });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });

  const handleClick = () => {
    handlePlayPause();

    if (currentTrackId === track.txid) {
      togglePlaying?.();
    } else {
      if (trackIndex >= 0) {
        setTracklist?.(tracks);
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
        <Flex
          justify="end"
          css={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            p: "$2",
          }}
        >
          <IconButton
            disabled={!stamp || stamped}
            css={{
              "& svg": {
                color: stamped ? "$red9" : "$whiteA11",
              },

              "&:hover": {
                "& svg": {
                  color: stamped ? "$red9" : "$whiteA12",
                },
              },
            }}
            onClick={() => {
              if (stamped) {
                console.log("stamped");
                return;
              }

              console.log("stamp attempted");

              mutation.mutate(track.txid);
            }}
            size="1"
            variant="transparent"
          >
            <BsSuitHeartFill />
          </IconButton>
        </Flex>
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
