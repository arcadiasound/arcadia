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
  timeAgo,
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
import { BsChat, BsHeart, BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { useConnect } from "arweave-wallet-ui-test";
import { ConnectPrompt } from "../layout/ConnectPrompt";
import { useDebounce } from "@/hooks/useDebounce";
import { TrackComments } from "./TrackComments";
import { getCommentCount } from "@/lib/comments";
import { LikeButton } from "./components/LikeButton";
import { ArAccount } from "arweave-account";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/Tabs";
import { useMotionAnimate } from "motion-hooks";
import { stagger } from "motion";
import { getRecentActivity } from "@/lib/getRecentActivity";

interface ActivityProps {
  activity: {
    timestamp: number;
    owner: string;
    txid: string;
    type: "liked" | "commented";
  };
}

const Activity = ({ activity }: ActivityProps) => {
  const { data: account } = useQuery({
    queryKey: [`profile-${activity.owner}`],
    queryFn: () => {
      if (!activity.owner) {
        return;
      }

      return getProfile(activity.owner);
    },
  });

  return (
    <Flex align="center" justify="between">
      <Flex align="center" gap="2">
        <Creator
          account={account}
          address={activity.owner}
          avatarUrl={account?.profile.avatarURL}
          contrast="hi"
          size="2"
        />
        <Typography size="2">
          {activity.type} {activity.type === "commented" && "on "}
          this track
        </Typography>
      </Flex>
      <Typography size="1">{timeAgo(activity.timestamp * 1000)}</Typography>
    </Flex>
  );
};

const DetailHeading = styled("h3", {
  color: "$slate12",
  fontSize: "$3",
  lineHeight: 1,
  fontWeight: 400,
});

const StyledTabsContent = styled(TabsContent, {
  '&[data-state="active"]': {
    pt: "$5",
  },
});

interface CreatorProps {
  address: string;
  account: ArAccount | undefined;
  avatarUrl: string | undefined;
  contrast?: "hi" | "lo";
  size?: "1" | "2" | "3";
}

const Creator = ({
  address,
  account,
  avatarUrl,
  size = "2",
  contrast = "lo",
}: CreatorProps) => {
  return (
    <Link
      to={{
        pathname: "/profile",
        search: `?addr=${address}`,
      }}
    >
      <Flex gap="2" align="center">
        <Image
          size={size}
          css={{
            br: 9999,
          }}
          src={
            avatarUrl === appConfig.accountAvatarDefault
              ? `https://source.boringavatars.com/marble/100/${account?.txid}?square=true`
              : avatarUrl
          }
        />
        <Typography size={size} contrast={contrast}>
          {account?.profile.name ||
            abbreviateAddress({
              address: address,
              options: { startChars: 6, endChars: 6 },
            })}
        </Typography>
      </Flex>
    </Link>
  );
};

const AccordionContentItem = styled(Flex, {
  mt: "$2",

  "& p": {
    color: "$slate12",
  },

  "& p:first-child": {
    color: "$slate11",

    "&[data-txid-detail]": {
      color: "$slate12",
    },
  },
});

const Description = styled(Typography, {
  display: "-webkit-box",
  "-webkit-line-clamp": 1,
  "-webkit-box-orient": "vertical",
  overflow: "hidden",
  maxWidth: "25ch",
});

type TrackTab = "details" | "comments" | "activity";

export const Track = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  // local state for instant visual feedback
  const [localStamped, setLocalStamped] = useState(false);
  // local stamp count for instant visual feedback
  const [localStampCount, setLocalStampCount] = useState(0);
  // temp solution, connect method from sdk should prob return a promise
  const [userConnect, setUserConnect] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const { walletAddress, connect } = useConnect();
  const [activeTab, setActiveTab] = useState<TrackTab>("details");
  const handleShowConnectPrompt = () => setShowConnectPrompt(true);
  const handleCancelConnectPrompt = () => setShowConnectPrompt(false);

  const { play } = useMotionAnimate(
    ".comment",
    { opacity: 1 },
    {
      delay: stagger(0.075),
      duration: 0.75,
      easing: "ease-in-out",
    }
  );

  const {
    audioRef,
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    audioCtxRef,
  } = useAudioPlayer();

  const id = urlParams.get("tx");

  if (!id) {
    // return no track view
    // return;
  }

  const { data: track, isError } = useQuery({
    queryKey: [`track-${id}`],
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!id) {
        throw new Error("No track ID has been found");
      }

      return getTrack(id, audioCtxRef);
    },
    onSuccess: (data) => {
      console.log({ data });
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

  const { data: recentActivity } = useQuery({
    queryKey: [`activity-${track?.txid}`],
    refetchOnWindowFocus: false,
    enabled: activeTab === "activity",
    queryFn: () => {
      if (!track?.txid) {
        throw new Error("No txid found");
      }

      return getRecentActivity(track.txid);
    },
  });

  // const { data: commentCount } = useQuery({
  //   queryKey: [`comment-count-${track?.txid}`],
  //   refetchOnWindowFocus: false,
  //   queryFn: () => {
  //     if (!track?.txid) {
  //       throw new Error("No txid found");
  //     }

  //     return getCommentCount(track.txid);
  //   },
  // });

  const { data: stamps } = useQuery({
    queryKey: [`stampCount-${id}`],
    refetchOnWindowFocus: false,
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

  const { data: stamped, refetch } = useQuery({
    queryKey: [`stamped-${id}`],
    enabled: !!walletAddress,
    queryFn: () => {
      if (!id) {
        throw new Error("No track ID has been found");
      }

      if (!walletAddress) {
        throw new Error("No wallet address found");
      }

      return hasStampedTx(id, walletAddress);
    },
    onSuccess: (data) => {
      console.log(data);
      setLocalStamped(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (walletAddress && userConnect && id) {
      setUserConnect(false);
      handleCancelConnectPrompt();
      mutation.mutate(id);
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
      if (stamps) {
        setLocalStampCount(stamps.total + 1);
      }
    },
    onError: (error: any) => {
      console.error(error);
      setLocalStamped(false);
    },
  });

  if (!track && isError) {
    // return error view
  }

  // if (!track) {
  //   return <Typography>No Track ID found.</Typography>;
  // }

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

  const handleStamp = () => {
    if (!id || stamped || localStamped) {
      return;
    }

    if (walletAddress) {
      setLocalStamped(true);
      mutation.mutate(id);
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

  const isPlaying = playing && currentTrackId === track?.txid;

  const avatarUrl = account?.profile.avatarURL;

  const isCreator = track && track.creator === walletAddress;

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
      justify="center"
    >
      <Flex direction="column" gap="5">
        <Box
          css={{
            backgroundColor: "$slate2",
            position: "relative",

            width: 200,
            height: 200,

            "@bp2": {
              width: 400,
              height: 400,
            },

            "@bp3": {
              width: 450,
              height: 450,
            },

            "@bp5": {
              width: 600,
              height: 600,
            },
          }}
        >
          {track && (
            <>
              <Image
                css={{
                  aspectRatio: 1 / 1,
                  width: "100%",
                  height: "100%",
                }}
                src={
                  track.artworkId
                    ? `https://arweave.net/${track.artworkId}`
                    : `https://source.boringavatars.com/marble/500/${track.txid}?square=true`
                }
              />
              <IconButton
                css={{
                  position: "absolute",
                  br: 9999,
                  color: "$whiteA12",
                  backgroundColor: "$blackA12",
                  opacity: 0.9,
                  width: 64,
                  height: 64,
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  m: "auto",

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
            </>
          )}
        </Box>
        <Flex justify="between" align="center">
          <Flex align="center">
            <Flex direction="column">
              <Typography contrast="hi" size="5">
                {track?.title}
              </Typography>
              <Link
                to={{
                  pathname: "/profile",
                  search: `?addr=${track?.creator}`,
                }}
              >
                <Flex gap="2" align="center">
                  {account ? (
                    <Image
                      css={{
                        width: 20,
                        height: 20,
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
                        width: 20,
                        height: 20,
                        backgroundColor: "$slate3",
                        br: 9999,
                      }}
                    />
                  )}
                  <Typography>
                    {account?.profile.name ||
                      abbreviateAddress({
                        address: track?.creator,
                        options: { startChars: 6, endChars: 6 },
                      })}
                  </Typography>
                </Flex>
              </Link>
            </Flex>
          </Flex>

          {track && (
            <Flex gap="5" align="center">
              <Flex align="center" gap="5">
                <LikeButton txid={id} size="3" />

                <Button
                  as="a"
                  href={`https://bazar.arweave.dev/#/asset/${track?.txid}`}
                  css={{ alignSelf: "start", br: "$2", cursor: "pointer" }}
                  variant="solid"
                >
                  Buy
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        gap="10"
        css={{ flex: 1, "@bp4": { maxWidth: 500 } }}
      >
        <Tabs
          onValueChange={(e) => setActiveTab(e as TrackTab)}
          defaultValue="details"
        >
          <TabsList>
            <TabsTrigger value="details">details</TabsTrigger>
            <TabsTrigger value="comments">comments</TabsTrigger>
            <TabsTrigger value="activity">activity</TabsTrigger>
          </TabsList>
          <StyledTabsContent
            css={{
              display: "flex",
              flexDirection: "column",
              gap: "$10",
            }}
            value="details"
          >
            <Typography contrast="hi" size="4">
              {track?.title}
              <Box css={{ color: "$slate11" }} as="span">
                {" "}
                by{" "}
                {account?.profile.name ||
                  abbreviateAddress({
                    address: track?.creator,
                    options: { startChars: 6, endChars: 6 },
                  })}
              </Box>
            </Typography>
            <Flex css={{ alignSelf: "start" }} direction="column" gap="2">
              <DetailHeading>About this track</DetailHeading>
              <Typography
                size="2"
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
            <Flex direction="column" gap="3">
              <DetailHeading>Creators</DetailHeading>
              {/* creators ready to be mapped over */}
              {track && (
                <Flex wrap="wrap" gap="5">
                  <Creator
                    account={account}
                    address={track?.creator}
                    avatarUrl={avatarUrl}
                  />
                </Flex>
              )}
            </Flex>
            {/* <Flex direction="column" gap="1">
          <Typography size="5" contrast="hi">
            Supporters
          </Typography>
        </Flex> */}
            {track && (
              <Accordion
                css={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "$7",
                }}
                type="multiple"
              >
                <AccordionItem value="provenance_details">
                  <AccordionTrigger>Provenance Details</AccordionTrigger>
                  <AccordionContent>
                    <AccordionContentItem justify="between">
                      <Typography>Transaction ID</Typography>
                      <Flex align="center" gap="1">
                        <Typography data-txid-detail>
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
                      <Typography>Date Published</Typography>
                      <Typography>
                        {timestampToDate(track.dateCreated)}
                      </Typography>
                    </AccordionContentItem>
                  </AccordionContent>
                </AccordionItem>

                {track.license?.tx && (
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
                )}
              </Accordion>
            )}
          </StyledTabsContent>
          <StyledTabsContent value="comments">
            <TrackComments txid={track?.txid} />
          </StyledTabsContent>
          <StyledTabsContent value="activity">
            {recentActivity && recentActivity.length > 0 && (
              <Flex direction="column" gap="3">
                {recentActivity.map((activity) => (
                  <Activity activity={activity} key={activity.txid} />
                ))}
              </Flex>
            )}
          </StyledTabsContent>
        </Tabs>
      </Flex>
    </Flex>
  );
};
