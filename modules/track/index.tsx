import {
  ProfileOwnershipProps,
  ProfileWithOwnership,
  SaleOrder,
  Track as TrackType,
} from "@/types";
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
  mapKeys,
  mapValues,
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
import {
  RxCheck,
  RxChevronDown,
  RxChevronRight,
  RxCopy,
  RxSize,
} from "react-icons/rx";
import { TrackComments } from "./TrackComments";
import { LikeButton } from "./components/LikeButton";
import { ArAccount } from "arweave-account";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/Tabs";
import { useMotionAnimate } from "motion-hooks";
import { stagger } from "motion";
import { getRecentActivity } from "@/lib/getRecentActivity";
import { Skeleton } from "@/ui/Skeleton";
import { LoadingSpinner } from "@/ui/Loader";
import { useConnect } from "@/hooks/useConnect";
import { getAssetOwners } from "@/lib/getAssetOwners";

import { getUCMAsset } from "@/lib/getUCMAsset";
import { getTrackDescription } from "@/lib/getTrackDescription";
import { HoverCard } from "@radix-ui/react-hover-card";
import { HoverCardContent, HoverCardTrigger } from "@/ui/HoverCard";
import { OwnershipChartDialog } from "./components/OwnershipChartDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/Avatar";
import { ListAssetDialog } from "./components/ListAssetDialog";
import { getActiveSaleOrders } from "@/lib/asset/getActiveSaleOrders";

const StyledTabsTrigger = styled(TabsTrigger, {
  br: "$1",
  flex: 1,
  textAlign: "center",

  "&:hover": {
    backgroundColor: "$slate3",
    color: "$slate12",
  },

  '&[data-state="active"]': {
    backgroundColor: "$slate4",
    color: "$slate12",
    boxShadow: "none",
    fontWeight: 400,
  },

  variants: {
    size: {
      1: {
        fontSize: "$2",
        px: "$5",
        py: "$2",
      },
      2: {
        fontSize: "$3",
        px: "$5",
        py: "$2",
      },
    },
  },
});

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
        <Creator account={account} contrast="hi" size="2" />
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

const ProfileWithOwnership = ({
  profileWithOwnership,
  songTitle,
}: ProfileOwnershipProps) => {
  return (
    <HoverCard openDelay={570}>
      <HoverCardTrigger asChild>
        <Link
          to={{
            pathname: "/profile",
            search: `?addr=${profileWithOwnership.account?.addr}`,
          }}
        >
          <Flex gap="1" align="center">
            <Avatar>
              <AvatarImage
                css={{
                  br: "$1",
                  boxSize: "$10",
                  mb: "$1",
                }}
                src={
                  profileWithOwnership.account?.profile?.avatarURL ===
                  appConfig.accountAvatarDefault
                    ? `https://source.boringavatars.com/marble/100/${profileWithOwnership.account?.txid}?square=true`
                    : profileWithOwnership.account?.profile.avatarURL
                }
              />
              <AvatarFallback
                css={{
                  br: "$1",
                }}
              >
                {profileWithOwnership.account?.profile.name.slice(0, 2) ||
                  profileWithOwnership.account?.addr.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </Flex>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        sideOffset={12}
        css={{
          backgroundColor: "$neutralA11",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 0 1px $colors$neutralInvertedA5",
        }}
      >
        <Avatar>
          <AvatarImage
            css={{
              br: "$1",
              boxSize: "$10",
              mb: "$1",
            }}
            src={
              profileWithOwnership.account?.profile?.avatarURL ===
              appConfig.accountAvatarDefault
                ? `https://source.boringavatars.com/marble/100/${profileWithOwnership.account?.txid}?square=true`
                : profileWithOwnership.account?.profile.avatarURL
            }
          />
          <AvatarFallback
            css={{
              br: "$1",
            }}
          >
            {profileWithOwnership.account?.profile.name.slice(0, 2) ||
              profileWithOwnership.account?.addr.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <Typography size="1" contrast="hi">
          {profileWithOwnership.account?.profile.name ||
            abbreviateAddress({
              address: profileWithOwnership.account?.addr,
            })}
        </Typography>
        <Typography css={{ mt: "$2" }} size="3" contrast="hi" weight="5">
          Owns {profileWithOwnership.ownershipAmount}% of {songTitle}
        </Typography>
      </HoverCardContent>
    </HoverCard>
  );
};

interface ProfileProps {
  account: ArAccount | undefined;
  contrast?: "hi" | "lo";
  size?: "1" | "2" | "3";
}

const Creator = ({ account, size = "2", contrast = "lo" }: ProfileProps) => {
  return (
    <Link
      to={{
        pathname: "/profile",
        search: `?addr=${account?.addr}`,
      }}
    >
      <Flex gap="1" align="center">
        <Image
          size={size}
          css={{
            br: "9999px",
          }}
          src={
            account?.profile?.avatarURL === appConfig.accountAvatarDefault
              ? `https://source.boringavatars.com/marble/100/${account?.txid}?square=true`
              : account?.profile.avatarURL
          }
        />
        <Typography size={size} contrast={contrast}>
          {account?.profile.name ||
            abbreviateAddress({
              address: account?.addr,
            })}
        </Typography>
      </Flex>
    </Link>
  );
};

interface ListingTableProps {
  listings: SaleOrder[];
}

const ListingTable = ({ listings }: ListingTableProps) => {
  return (
    <Flex direction="column">
      <Box
        css={{
          height: 1,
          backgroundColor: "$slate3",
        }}
      />
      <Flex
        css={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          backgroundColor: "$slate2",
          p: "$3",
          "& p": { fontSize: "$2" },
        }}
      >
        <Typography>Price (U)</Typography>
        <Typography>Quantity</Typography>
        <Typography>Seller</Typography>
      </Flex>
      <Box
        css={{
          height: 1,
          backgroundColor: "$slate3",
        }}
      />
      {listings.map((listing) => (
        <ListingItem key={listing.id} listing={listing} />
      ))}
    </Flex>
  );
};

interface ListingItemProps {
  listing: SaleOrder;
}

const ListingItem = ({ listing }: ListingItemProps) => {
  const { data: account } = useQuery({
    queryKey: [`profile-${listing.creator}`],
    queryFn: () => {
      if (!listing.creator) {
        return;
      }

      return getProfile(listing.creator);
    },
  });

  return (
    <>
      <Flex
        css={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          p: "$3",
          "& p": { fontSize: "$2", color: "$slate12" },
        }}
        align="center"
      >
        <Typography>{(listing.price / 1e6).toFixed(2)}</Typography>
        <Typography>{listing.quantity}</Typography>
        <Typography>
          {account?.profile?.name ||
            abbreviateAddress({ address: listing.creator })}
        </Typography>
        <Button
          variant="solid"
          size="1"
          css={{ width: "max-content", ml: "auto" }}
        >
          Buy
        </Button>
      </Flex>
      <Box
        css={{
          height: 1,
          backgroundColor: "$slate3",
        }}
      />
    </>
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

type TrackTab = "details" | "comments" | "activity" | "sponsors";

export const Track = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const [activeTab, setActiveTab] = useState<TrackTab>("details");
  const [owners, setOwners] = useState<ProfileWithOwnership[]>();
  const [showOwnershipChart, setShowOwnershipChart] = useState(false);
  const [showListAssetDialog, setShowListAssetDialog] = useState(false);
  const { walletAddress } = useConnect();

  const handleShowOwnershipChart = () => setShowOwnershipChart(true);
  const handleCancelOwnershipChart = () => setShowOwnershipChart(false);

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

  const {
    data: track,
    isLoading: trackLoading,
    isError,
  } = useQuery({
    queryKey: [`track-${id}`],
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!id) {
        throw new Error("No track ID has been found");
      }

      return getTrack(id, audioCtxRef);
    },
    onSuccess: (data) => {
      // console.log({ data });
    },
  });

  const {
    data: trackDescription,
    isLoading: trackDescriptionLoading,
    isError: trackDescriptionError,
  } = useQuery({
    queryKey: [`description-${id}`],
    enabled: !!track,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!track) {
        return;
      }

      return getTrackDescription(track.txid);
    },
    onSuccess: (data) => {
      console.log({ data });
    },
  });

  const { data: account } = useQuery({
    queryKey: [`profile-${track?.creator}`],
    enabled: !!track,
    queryFn: () => {
      if (!track?.creator) {
        throw new Error("No profile has been found");
      }

      return getProfile(track.creator);
    },
  });

  const { data: ucmAsset, isLoading: ucmAssetLoading } = useQuery({
    queryKey: [`ucmAsset-${track?.txid}`],
    enabled: !!track,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!track?.txid) {
        throw new Error("No txid found");
      }

      return getUCMAsset(track.txid);
    },
  });

  const { data: activeSaleOrder, isLoading: activeSaleOrderLoading } = useQuery(
    {
      queryKey: [`activeSaleOrder-${track?.txid}`],
      enabled: !!track,
      refetchOnWindowFocus: false,
      queryFn: () => {
        if (!track?.txid) {
          return;
        }

        return getActiveSaleOrders({ assetId: track.txid });
      },
    }
  );

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
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

  if (!track && isError) {
    // return error view
  }

  const handleClick = () => {
    if (!track) {
      return;
    }

    handlePlayPause();

    if (currentTrackId === track?.txid) {
      togglePlaying?.();
    } else {
      setTracklist?.([track], 0);
      setCurrentTrackId?.(track.txid);
      setCurrentTrackIndex?.(0);
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

  useEffect(() => {
    if (ucmAsset) {
      const balances = Object.keys(ucmAsset.state.balances);
      const ownership = Object.values(ucmAsset.state.balances) as number[];

      const getProfiles = async () => {
        const profiles: ProfileWithOwnership[] = [];

        for (let i = 0; i < balances.length; i++) {
          const address = balances[i];
          const amount = ownership[i];

          // catch edge case where user with 0% can show up
          if (amount === 0) {
            continue;
          }

          const account = await getProfile(address);
          profiles.push({
            account: account,
            ownershipAmount: amount,
          });
        }

        // Sort the profiles array based on ownershipAmount in descending order
        profiles.sort((a, b) => b.ownershipAmount - a.ownershipAmount);

        setOwners(profiles);
      };

      getProfiles();
    }
  }, [ucmAsset]);

  const toggleShowDescription = () => setShowDescription(!showDescription);

  const isAssetOwner =
    ucmAsset && walletAddress && walletAddress in ucmAsset.state.balances
      ? true
      : false;

  return (
    <Flex
      css={{
        pt: 60 + appConfig.headerMaxHeight,
        height: "100%",
      }}
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
            position: "relative",
            width: 200,
            height: 200,
            outline: "1px solid $colors$neutralInvertedA3",
            outlineOffset: "-1px",
            maxHeight: "max-content",

            "& [data-play-button]": {
              opacity: 0,
            },

            "&:hover": {
              "& [data-play-button]": {
                opacity: 1,
              },
            },

            "@bp2": {
              width: 400,
              height: 400,
            },

            "@bp3": {
              width: 540,
              height: 540,
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
                data-play-button
                css={{
                  boxShadow: "0 0 0 1px $colors$neutralInvertedA5",
                  position: "absolute",
                  br: 9999,
                  color: "$whiteA12",
                  backgroundColor: "$blackA12",
                  opacity: 0.9,
                  width: 80,
                  height: 80,
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  m: "auto",

                  "& svg": {
                    fontSize: 40,
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
                data-playing={isPlaying}
                aria-checked={isPlaying}
                role="switch"
                onClick={handleClick}
              >
                {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
              </IconButton>
            </>
          )}
          {trackLoading && (
            <Skeleton
              css={{
                width: 200,
                height: 200,

                "@bp2": {
                  width: 400,
                  height: 400,
                },

                "@bp3": {
                  width: 540,
                  height: 540,
                },

                "@bp5": {
                  width: 600,
                  height: 600,
                },
              }}
            />
          )}
        </Box>

        {track && (
          <Flex justify="between" align="center" css={{ px: "$2" }}>
            <LikeButton txid={id} size="3" />

            {!!ucmAsset && (
              <Button
                as="a"
                href={`https://bazar.arweave.dev/#/asset/${track.txid}`}
                css={{
                  alignSelf: "start",
                  br: "$2",
                  cursor: "pointer",

                  "&:hover": {
                    textDecoration: "none",
                  },
                }}
                variant="solid"
              >
                View on Marketplace
              </Button>
            )}
          </Flex>
        )}

        {trackLoading && (
          <Skeleton
            css={{
              width: "100%",
              height: 52,
            }}
          />
        )}
      </Flex>
      <Flex
        direction="column"
        gap="10"
        css={{ flex: 1, "@bp4": { maxWidth: 500, alignSelf: "start" } }}
      >
        {track && (
          <Flex justify="between" align="center">
            <Flex css={{ pt: "$5" }} direction="column" gap="1">
              <Typography contrast="hi" size="5">
                {track.title}
              </Typography>
              <Link
                to={{
                  pathname: "/profile",
                  search: `?addr=${track.creator}`,
                }}
              >
                <Typography>
                  {account?.profile.name ||
                    abbreviateAddress({
                      address: track.creator,
                      options: { startChars: 6, endChars: 6 },
                    })}
                </Typography>
              </Link>
            </Flex>
            {isAssetOwner && (
              <>
                <Button
                  variant="solid"
                  size="1"
                  onClick={() => setShowListAssetDialog(true)}
                >
                  Sell
                </Button>
                <ListAssetDialog
                  open={showListAssetDialog}
                  onClose={() => setShowListAssetDialog(false)}
                  address={walletAddress!!}
                  track={track}
                  ucmAsset={ucmAsset!!}
                  creatorName={
                    account?.profile.name ||
                    abbreviateAddress({
                      address: track.creator,
                      options: { startChars: 6, endChars: 6 },
                    })
                  }
                />
              </>
            )}
          </Flex>
        )}
        {trackLoading && (
          <Skeleton css={{ height: 72, width: "100%", pt: "$5" }} />
        )}
        <Tabs
          onValueChange={(e) => setActiveTab(e as TrackTab)}
          defaultValue="details"
        >
          <TabsList
            css={{
              br: "$2",
              gap: "$1",
              backgroundColor: "$slate1",
              boxShadow: "0 0 0 1px $colors$slate5",
              p: "$1",
            }}
          >
            <StyledTabsTrigger value="details">details</StyledTabsTrigger>
            <StyledTabsTrigger value="comments">comments</StyledTabsTrigger>
            <StyledTabsTrigger value="activity">activity</StyledTabsTrigger>
            {/* <StyledTabsTrigger disabled={!sponsors} value="sponsors">
              sponsors
            </StyledTabsTrigger> */}
          </TabsList>
          <StyledTabsContent
            css={{
              display: "flex",
              flexDirection: "column",
              gap: "$10",
            }}
            value="details"
          >
            {track && (
              <>
                <Flex css={{ alignSelf: "start" }} direction="column" gap="2">
                  <DetailHeading>About this track</DetailHeading>
                  <Typography
                    size="2"
                    css={{
                      // fix needed: webkit-box removes space between this section and button
                      display: "-webkit-box",
                      "-webkit-line-clamp": showDescription ? "none" : 2,
                      "-webkit-box-orient": "vertical",
                      overflow: "hidden",
                      maxWidth: "60ch",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {trackDescription ||
                      track.description ||
                      "No track description."}
                  </Typography>
                  {((trackDescription && trackDescription.length > 120) ||
                    (track.description && track.description.length > 120)) && (
                    <Button
                      onClick={toggleShowDescription}
                      css={{
                        alignSelf: "start",
                        pl: 0,
                        color: "$slate12",

                        "& svg": {
                          transform: showDescription
                            ? "rotate(-90deg)"
                            : "none",
                        },
                      }}
                      variant="transparent"
                      size="1"
                    >
                      Show {showDescription ? "less" : "more"}{" "}
                      <RxChevronRight />
                    </Button>
                  )}
                </Flex>
                <Flex justify="between" gap="5">
                  <Flex direction="column" gap="3">
                    <Flex gap="1" align="center">
                      <DetailHeading>Owners</DetailHeading>
                      <IconButton
                        onClick={handleShowOwnershipChart}
                        size="2"
                        aria-label="Maximize owner view"
                        variant="transparent"
                      >
                        <RxSize />
                      </IconButton>
                    </Flex>
                    {(ucmAssetLoading || (ucmAsset && !owners)) && (
                      <Skeleton
                        css={{ height: "$10", minWidth: 300, width: "100%" }}
                      />
                    )}
                    {owners && (
                      <>
                        <Flex
                          css={{ listStyleType: "none" }}
                          as="ul"
                          wrap="wrap"
                          gap="2"
                        >
                          {owners.length &&
                            owners.map((owner) => (
                              <Box key={owner.account.addr} as="li">
                                <ProfileWithOwnership
                                  profileWithOwnership={owner}
                                  songTitle={track.title}
                                />
                              </Box>
                            ))}
                        </Flex>
                        <OwnershipChartDialog
                          profilesWithOwnership={owners}
                          open={showOwnershipChart}
                          onClose={handleCancelOwnershipChart}
                          title={track.title}
                        />
                      </>
                    )}
                  </Flex>
                </Flex>

                <Accordion
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "$7",
                  }}
                  type="multiple"
                  defaultValue={["listings"]}
                  // defaultValue={
                  //   activeSaleOrder && activeSaleOrder.length > 0
                  //     ? ["listings"]
                  //     : []
                  // }
                >
                  {activeSaleOrderLoading && (
                    <Skeleton css={{ width: "100%", height: 48 }} />
                  )}
                  {activeSaleOrder && activeSaleOrder.length > 0 && (
                    <AccordionItem value="listings">
                      <AccordionTrigger>
                        Active Listings ({activeSaleOrder.length})
                      </AccordionTrigger>
                      <AccordionContent
                        css={{
                          "& div:first-child": {
                            p: 0,
                          },
                        }}
                      >
                        <ListingTable listings={activeSaleOrder} />
                      </AccordionContent>
                    </AccordionItem>
                  )}
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

                        {track.license?.commercial && (
                          <AccordionContentItem justify="between">
                            <Typography>Commercial Use</Typography>
                            <Typography>{track.license.commercial}</Typography>
                          </AccordionContentItem>
                        )}
                        {track.license?.derivative && (
                          <AccordionContentItem justify="between">
                            <Typography>Derivative</Typography>
                            <Typography>{track.license.derivative}</Typography>
                          </AccordionContentItem>
                        )}
                        {track.license?.licenseFee && (
                          <AccordionContentItem justify="between">
                            <Typography>License Fee</Typography>
                            <Typography>{track.license.licenseFee}</Typography>
                          </AccordionContentItem>
                        )}
                        {track.license?.paymentMode && (
                          <AccordionContentItem justify="between">
                            <Typography>Payment Mode</Typography>
                            <Typography>{track.license.paymentMode}</Typography>
                          </AccordionContentItem>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </>
            )}
            {trackLoading && (
              <Flex direction="column" gap="7">
                <Skeleton css={{ width: "100%", height: 20 }} />
                <Skeleton css={{ width: "100%", height: 40 }} />
                <Skeleton css={{ width: "100%", height: 40 }} />
              </Flex>
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
            {activityLoading && (
              <Flex
                css={{
                  my: "$10",
                  width: "100%",
                  min: 80,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LoadingSpinner />
              </Flex>
            )}
          </StyledTabsContent>
        </Tabs>
      </Flex>
    </Flex>
  );
};
