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
import { ConnectPrompt } from "../layout/ConnectPrompt";
import { Button } from "@/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { useConnect } from "@/hooks/useConnect";

export const TrackCard = ({
  track,
  trackIndex,
  tracks,
  size,
}: {
  track: Track;
  trackIndex: number;
  tracks: Tracklist;
  size?: number;
}) => {
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  // local stamped state for instant visual feedback
  const [localStamped, setLocalStamped] = useState(false);
  // temp solution, connect method from sdk should prob return a promise
  const [userConnect, setUserConnect] = useState(false);
  const {
    audioCtxRef,
    audioRef,
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    handlePlayPause,
  } = useAudioPlayer();
  const { walletAddress, connect } = useConnect();

  const handleShowConnectPrompt = () => setShowConnectPrompt(true);
  const handleCancelConnectPrompt = () => setShowConnectPrompt(false);

  const { data: account } = useQuery({
    queryKey: [`profile-${track.creator}`],
    queryFn: () => getProfile(track.creator),
  });

  const { data: stamped, refetch } = useQuery({
    queryKey: [`stamped-${track.txid}`],
    refetchOnWindowFocus: false,
    enabled: !!walletAddress,
    queryFn: () => {
      if (!walletAddress) {
        return false;
      }

      // return hasStamped([track.txid]);
      return hasStampedTx(track.txid, walletAddress);
    },
    onSuccess: (data) => {
      console.log(data);
      setLocalStamped(false);
    },
    onError: (error) => {
      console.error(error);
      setLocalStamped(false);
    },
  });

  useEffect(() => {
    if (!walletAddress) {
      refetch();
      if (localStamped) {
        setLocalStamped(false);
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress && userConnect) {
      setUserConnect(false);
      handleCancelConnectPrompt();
      mutation.mutate(track.txid);
      setLocalStamped(true);
    }
  }, [walletAddress]);

  const debounceRequest = useDebounce(() => {
    refetch();
  }, 450);

  const mutation = useMutation({
    mutationFn: stamp,
    //@ts-ignore
    onSuccess: () => {
      debounceRequest();
    },
    onError: (error: any) => {
      console.error(error);
      setLocalStamped(false);
    },
  });

  const handleClick = () => {
    handlePlayPause?.();

    if (currentTrackId === track.txid) {
      togglePlaying?.();
    } else {
      if (trackIndex >= 0) {
        setTracklist?.(tracks, trackIndex);
        setCurrentTrackId?.(track.txid);
        setCurrentTrackIndex?.(trackIndex);
      }
    }
  };

  const handleStamp = () => {
    if (!track?.txid || stamped || localStamped) {
      return;
    }

    if (walletAddress) {
      setLocalStamped(true);
      mutation.mutate(track.txid);
    } else {
      handleShowConnectPrompt();
    }
  };

  const handleConnectAndStamp = async () => {
    if (!track?.txid || stamped) {
      return;
    }

    /* as we can't await below connect method we need to check
      if user tried to connect and use presence of this state var and walletAddress to initiate like
      and close dialog
    */

    connect({ appName: "Arcadia", walletProvider: "arweave.app" });

    setUserConnect(true);
  };

  const isPlaying = playing && currentTrackId === track.txid;

  const isStamped = stamped || localStamped;

  return (
    <Flex className="trackItem" direction="column" gap="2">
      <Box
        css={{
          position: "relative",

          "&:focus-within": {
            outline: "2px solid $focus",
            outlineOffset: "$1",
          },

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
              width: size || 200,
              height: size || 200,
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
                width: size || 200,
                height: size || 200,
                outline: "1px solid $whiteA3",
                outlineOffset: -1,
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
            p: "$1",
          }}
        >
          <IconButton
            disabled={!stamp || stamped || localStamped}
            css={{
              "& svg": {
                color: isStamped ? "$red9" : "$whiteA11",
              },

              "&:hover": {
                "& svg": {
                  color: isStamped ? "$red9" : "$whiteA12",
                },
              },

              "&:disabled": {
                opacity: 1,
              },

              '&[aria-disabled="true"]': {
                opacity: 1,
              },
            }}
            onClick={handleStamp}
            variant="transparent"
          >
            <BsSuitHeartFill />
          </IconButton>

          <ConnectPrompt
            open={showConnectPrompt}
            onClose={handleCancelConnectPrompt}
            title="Connect your wallet to proceed"
            description="In order to perform this action, you need to connect an Arweave
              wallet."
          >
            <Button
              onClick={handleConnectAndStamp}
              css={{
                mt: "$5",
              }}
              variant="solid"
            >
              Connect and Like
              <BsSuitHeartFill />
            </Button>
          </ConnectPrompt>
        </Flex>
      </Box>
      <Box
        css={{
          pl: 6,
          "&:focus-within": {
            outline: "2px solid $focus",
            outlineOffset: "$1",
          },
        }}
      >
        <Link
          to={{
            pathname: "/track",
            search: `?tx=${track.txid}`,
          }}
        >
          <Typography size="2" contrast="hi">
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
