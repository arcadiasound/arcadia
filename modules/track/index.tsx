import { Track as TrackType } from "@/types";
import { Flex } from "@/ui/Flex";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getTrack } from "@/lib/getTrack";
import { Image } from "@/ui/Image";
import { Box } from "@/ui/Box";
import { useEffect, useState } from "react";
import { IoPauseSharp, IoPlaySharp } from "react-icons/io5";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { IconButton } from "@/ui/IconButton";
import { Typography } from "@/ui/Typography";
import {
  abbreviateAddress,
  timestampToDate,
  userPreferredGateway,
} from "@/utils";
import { Button } from "@/ui/Button";
import { getProfile } from "@/lib/getProfile";
import { appConfig } from "@/appConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/Accordion";
import { styled } from "@/stitches.config";
import { RxCheck, RxClipboardCopy, RxCopy } from "react-icons/rx";
import { getStampCount, hasStampedTx, stamp } from "@/lib/stamps";
import { BsHeart, BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { useConnect } from "arweave-wallet-ui-test";

const AccordionContentItem = styled(Flex, {
  mt: "$2",

  "& p": {
    color: "$slate12",
  },
});

export const Track = () => {
  const [isCopied, setIsCopied] = useState(false);
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const { walletAddress } = useConnect();

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

  const queryClient = useQueryClient();

  const { data: track, isError } = useQuery({
    queryKey: [`track-${id}`],
    queryFn: () => {
      if (!id) {
        throw new Error("No track ID has been found");
      }

      return getTrack(id);
    },
  });

  const { data: account } = useQuery({
    queryKey: [`profile-${track?.creator}`],
    queryFn: () => {
      if (!track?.creator) {
        throw new Error("No profile has been found");
      }

      return getProfile(track.creator);
    },
  });

  const { data: stamps } = useQuery({
    queryKey: [`stampCount-${id}`],
    queryFn: () => {
      if (!id) {
        throw new Error("No track ID has been found");
      }

      return getStampCount(id);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { data: stamped } = useQuery({
    queryKey: [`stamped-${id}`],
    queryFn: () => {
      if (!walletAddress || !id) {
        throw new Error("No wallet address found");
      }

      return hasStampedTx(id, walletAddress);
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
        queryKey: [`stampCount-${id}`, `stamped-${id}`],
      });
    },
    onError: (error: any) => {
      console.error(error);
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

  const handleCopy = (tx: string | undefined) => {
    if (!tx) {
      return;
    }
    navigator.clipboard.writeText(tx).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  const isPlaying = playing && currentTrackId === track?.txid;

  const avatarUrl = account?.profile.avatarURL;

  return (
    <Flex
      direction={{
        "@initial": "column",
        "@bp4": "row",
      }}
      gap="10"
      align={{
        "@initial": "center",
        "@bp4": "start",
      }}
    >
      <Box
        css={{
          backgroundColor: "$slate2",

          width: 200,
          height: 200,

          "@bp2": {
            width: 400,
            height: 400,
          },

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
      <Flex
        direction="column"
        gap="10"
        css={{ flex: 1, "@bp4": { maxWidth: 500 } }}
      >
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
              {account?.profile.name ||
                abbreviateAddress({
                  address: track?.creator,
                  options: { startChars: 6, endChars: 6 },
                })}
            </Typography>
          </Flex>
        </Flex>
        <Flex css={{ alignSelf: "start" }} direction="column" gap="7">
          <Link
            to={{
              pathname: "/profile",
              search: `?addr=${track?.creator}`,
            }}
          >
            <Flex gap="3" align="center">
              {account ? (
                <Image
                  css={{
                    width: 40,
                    height: 40,
                    br: 9999,
                  }}
                  src={
                    avatarUrl === appConfig.accountAvatarDefault
                      ? `https://source.boringavatars.com/marble/100/${account?.txid}?square=true`
                      : avatarUrl
                  }
                />
              ) : (
                <Box
                  css={{
                    width: 40,
                    height: 40,
                    backgroundColor: "$slate3",
                    br: 9999,
                  }}
                />
              )}
              <Typography size="4">
                {account?.profile.name ||
                  abbreviateAddress({
                    address: track?.creator,
                    options: { startChars: 6, endChars: 6 },
                  })}
              </Typography>
            </Flex>
          </Link>
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
        <Flex gap="5" align="center">
          <Button
            as="a"
            href={`https://bazar.arweave.dev/#/asset/${track?.txid}`}
            css={{ alignSelf: "start", br: "$2", cursor: "pointer" }}
            variant="solid"
          >
            View on Bazar
          </Button>
          <Flex align="center">
            <IconButton
              disabled={!stamp || !stamped}
              css={{
                "& svg": {
                  color: stamped ? "$red9" : "$slate11",
                },
              }}
              onClick={() => {
                if (!track?.txid || stamped) {
                  return;
                }

                mutation.mutate(track.txid);
              }}
              size="3"
              variant="transparent"
            >
              {stamped ? <BsSuitHeartFill /> : <BsSuitHeart />}
            </IconButton>
            {stamps && <Typography>{stamps.total}</Typography>}
          </Flex>
        </Flex>
        {track && (
          <Accordion type="multiple">
            <AccordionItem value="details">
              <AccordionTrigger>Provenance Details</AccordionTrigger>
              <AccordionContent>
                <AccordionContentItem justify="between">
                  <Typography>Transaction ID</Typography>
                  <Flex align="center" gap="1">
                    <Typography>
                      {abbreviateAddress({
                        address: track.txid,
                        options: { startChars: 6, endChars: 6 },
                      })}
                    </Typography>
                    <IconButton
                      onClick={() => handleCopy(track.txid)}
                      variant="transparent"
                      css={{
                        pointerEvents: isCopied ? "none" : "auto",
                        color: isCopied ? "$green11" : "$slate11",
                      }}
                      size="1"
                    >
                      {isCopied ? <RxCheck /> : <RxCopy />}
                    </IconButton>
                  </Flex>
                </AccordionContentItem>
                <AccordionContentItem justify="between">
                  <Typography>Date Created</Typography>
                  <Typography>{timestampToDate(track.dateCreated)}</Typography>
                </AccordionContentItem>
              </AccordionContent>
            </AccordionItem>
            {track.license?.tx && (
              <>
                <Box
                  css={{ height: 1, backgroundColor: "$slate6", my: "$2" }}
                />
                <AccordionItem value="license">
                  <AccordionTrigger>License Information</AccordionTrigger>
                  <AccordionContent>
                    <AccordionContentItem justify="between">
                      <Typography
                        css={{
                          color: "$slate12",
                          boxShadow: "0 1px 0 0 $colors$slate12",
                          mb: "$3",

                          "&:hover": {
                            color: "$blue11",
                            boxShadow: "0 1px 0 0 $colors$blue11",
                          },
                        }}
                        as="a"
                        href={`${
                          userPreferredGateway() || appConfig.defaultGateway
                        }/${track.license?.tx}`}
                      >
                        License Text
                      </Typography>
                    </AccordionContentItem>

                    {track?.license?.commercial && (
                      <AccordionContentItem justify="between">
                        <Typography>Commercial Use</Typography>
                        <Typography>{track.license.commercial}</Typography>
                      </AccordionContentItem>
                    )}
                    {track?.license?.derivative && (
                      <AccordionContentItem justify="between">
                        <Typography>Derivative</Typography>
                        <Typography>{track.license.derivative}</Typography>
                      </AccordionContentItem>
                    )}
                    {track?.license?.licenseFee && (
                      <AccordionContentItem justify="between">
                        <Typography>License Fee</Typography>
                        <Typography>{track.license.licenseFee}</Typography>
                      </AccordionContentItem>
                    )}
                    {track?.license?.paymentMode && (
                      <AccordionContentItem justify="between">
                        <Typography>Payment Mode</Typography>
                        <Typography>{track.license.paymentMode}</Typography>
                      </AccordionContentItem>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        )}
      </Flex>
    </Flex>
  );
};
