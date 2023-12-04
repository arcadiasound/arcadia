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
import { RxCheck, RxCopy } from "react-icons/rx";
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
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getAssetListedStatus } from "@/lib/getAssetListedStatus";

ChartJS.register(ArcElement, Tooltip, Legend);

const testData = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "% ownership",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderWidth: 0,
    },
  ],
};

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
      <Flex gap="1" align="center">
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

type TrackTab = "details" | "comments" | "activity" | "sponsors";

export const Track = () => {
  const [isCopied, setIsCopied] = useState(false);
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const [activeTab, setActiveTab] = useState<TrackTab>("details");
  const [owners, setOwners] = useState<string[]>();
  const [ownershipAmount, setOwnershipAmount] = useState<number[]>();

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

  // const { data: assetListed } = useQuery({
  //   queryKey: [`listedStatus-${track?.txid}`],
  //   refetchOnWindowFocus: false,
  //   queryFn: () => {
  //     if (!track?.txid) {
  //       throw new Error("No txid found");
  //     }

  //     return getAssetListedStatus(track.txid);
  //   },
  // });

  const { data: sponsors } = useQuery({
    queryKey: [`sponsors-${track?.txid}`],
    refetchOnWindowFocus: false,
    // enabled: activeTab === "sponsors",
    queryFn: () => {
      if (!track?.txid) {
        throw new Error("No txid found");
      }

      return getAssetOwners(track.txid);
    },
  });

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
    if (currentTrackId === track?.txid) {
      togglePlaying?.();
    } else {
      setTracklist?.([track], 0);
      setCurrentTrackId?.(track.txid);
      setCurrentTrackIndex?.(0);
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
    if (sponsors) {
      const balances = Object.keys(sponsors.balances);
      const ownership = Object.values(sponsors.balances) as number[];

      const getProfiles = async () => {
        // const profiles: { name: string; imageUrl: string }[] = [];
        const profiles: string[] = [];

        for (let i = 0; i < balances.length; i++) {
          const address = balances[i];

          console.log("here");

          const account = await getProfile(address);
          const profileName = account.profile.handleName || account.handle;
          const profileImage =
            account.profile.avatarURL !== appConfig.accountAvatarDefault
              ? account.profile.avatarURL
              : `https://source.boringavatars.com/marble/20/${account.addr}`;
          // profiles.push({ name: profileImage, imageUrl: profileImage });
          profiles.push(profileName);
        }

        setOwners(profiles);
      };

      getProfiles();

      setOwnershipAmount(ownership);
    }
  }, [sponsors]);

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

            {sponsors && (
              <Button
                as="a"
                href={`https://bazar.arweave.dev/#/asset/${track.txid}`}
                css={{ alignSelf: "start", br: "$2", cursor: "pointer" }}
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
            <StyledTabsTrigger disabled={!sponsors} value="sponsors">
              sponsors
            </StyledTabsTrigger>
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
                      "-webkit-line-clamp": 2,
                      "-webkit-box-orient": "vertical",
                      overflow: "hidden",
                      maxWidth: "60ch",
                    }}
                  >
                    {track.description || "No track description."}
                  </Typography>
                </Flex>
                <Flex justify="between" gap="5">
                  <Flex direction="column" gap="3">
                    <DetailHeading>Creators</DetailHeading>
                    {/* creators ready to be mapped over */}
                    <Flex wrap="wrap" gap="5">
                      <Creator
                        account={account}
                        address={track.creator}
                        avatarUrl={avatarUrl}
                      />
                    </Flex>
                  </Flex>
                </Flex>
                {/* <Flex direction="column" gap="1">
                  <Typography size="5" contrast="hi">
                    Supporters
                  </Typography>
                </Flex> */}
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
          <StyledTabsContent value="sponsors">
            {sponsors && (
              <Doughnut
                data={{
                  labels: owners || mapKeys(sponsors.balances),
                  datasets: [
                    {
                      label: "% ownership",
                      data: Object.values(sponsors.balances),
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.9)",
                        "rgba(54, 162, 235, 0.9)",
                        "rgba(255, 206, 86, 0.9)",
                        "rgba(75, 192, 192, 0.9)",
                        "rgba(153, 102, 255, 0.9)",
                        "rgba(255, 159, 64, 0.9)",
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
              />
            )}
          </StyledTabsContent>
        </Tabs>
      </Flex>
    </Flex>
  );
};
