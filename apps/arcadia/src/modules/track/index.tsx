import {
  // ProfileOwnershipProps,
  // ProfileWithOwnership,
  SaleOrder,
  Track as TrackType,
} from "@/types";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { styled } from "@stitches/react";
import { useGetUserProfile, useIsUserMe } from "@/hooks/appData";
import { Avatar, Box, Flex, Grid, Heading, IconButton, Link, Text } from "@radix-ui/themes";
import { getTrack } from "@/lib/track/getTrack";
import { css } from "@/styles/css";
import { abbreviateAddress, compareArrays, timeAgo } from "@/utils";
import { MdPause, MdPlayArrow, MdShare } from "react-icons/md";
import { TrackWaveform } from "./TrackWaveform";
import { appConfig } from "@/config";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useState } from "react";
import { ShareDialog } from "./components/ShareDialog";

// const StyledTabsTrigger = styled(TabsTrigger, {
//   br: "$1",
//   flex: 1,
//   textAlign: "center",

//   "&:hover": {
//     backgroundColor: "$slate3",
//     color: "$slate12",
//   },

//   '&[data-state="active"]': {
//     backgroundColor: "$slate4",
//     color: "$slate12",
//     boxShadow: "none",
//     fontWeight: 400,
//   },

//   variants: {
//     size: {
//       1: {
//         fontSize: "$2",
//         px: "$5",
//         py: "$2",
//       },
//       2: {
//         fontSize: "$3",
//         px: "$5",
//         py: "$2",
//       },
//     },
//   },
// });

// interface ActivityProps {
//   activity: {
//     timestamp: number;
//     owner: string;
//     txid: string;
//     type: "liked" | "commented";
//   };
// }

// const Activity = ({ activity }: ActivityProps) => {
//   const { data: account } = useQuery({
//     queryKey: [`profile-${activity.owner}`],
//     queryFn: () => {
//       if (!activity.owner) {
//         return;
//       }

//       return getProfile(activity.owner);
//     },
//   });

//   return (
//     <Flex align="center" justify="between">
//       <Flex align="center" gap="2">
//         <Creator account={account} contrast="hi" size="2" />
//         <Typography size="2">
//           {activity.type} {activity.type === "commented" && "on "}
//           this track
//         </Typography>
//       </Flex>
//       <Typography size="1">{timeAgo(activity.timestamp * 1000)}</Typography>
//     </Flex>
//   );
// };

// const DetailHeading = styled("h3", {
//   color: "$slate12",
//   fontSize: "$3",
//   lineHeight: 1,
//   fontWeight: 400,
// });

// const StyledTabsContent = styled(TabsContent, {
//   '&[data-state="active"]': {
//     pt: "$5",
//   },
// });

// const ProfileWithOwnership = ({ profileWithOwnership, songTitle }: ProfileOwnershipProps) => {
//   return (
//     <HoverCard openDelay={570}>
//       <HoverCardTrigger asChild>
//         <Link
//           to={{
//             pathname: "/profile",
//             search: `?addr=${profileWithOwnership.account?.addr}`,
//           }}
//         >
//           <Flex gap="1" align="center">
//             <Avatar>
//               <AvatarImage
//                 css={{
//                   br: "$1",
//                   boxSize: "$10",
//                   mb: "$1",
//                 }}
//                 src={
//                   profileWithOwnership.account?.profile?.avatarURL ===
//                   appConfig.accountAvatarDefault
//                     ? `https://source.boringavatars.com/marble/100/${profileWithOwnership.account?.txid}?square=true`
//                     : profileWithOwnership.account?.profile.avatarURL
//                 }
//               />
//               <AvatarFallback
//                 css={{
//                   br: "$1",
//                 }}
//               >
//                 {profileWithOwnership.account?.profile.name.slice(0, 2) ||
//                   profileWithOwnership.account?.addr.slice(0, 2)}
//               </AvatarFallback>
//             </Avatar>
//           </Flex>
//         </Link>
//       </HoverCardTrigger>
//       <HoverCardContent
//         side="top"
//         sideOffset={12}
//         css={{
//           backgroundColor: "$neutralA11",
//           backdropFilter: "blur(20px)",
//           boxShadow: "0 0 0 1px $colors$neutralInvertedA5",
//         }}
//       >
//         <Avatar>
//           <AvatarImage
//             css={{
//               br: "$1",
//               boxSize: "$10",
//               mb: "$1",
//             }}
//             src={
//               profileWithOwnership.account?.profile?.avatarURL === appConfig.accountAvatarDefault
//                 ? `https://source.boringavatars.com/marble/100/${profileWithOwnership.account?.txid}?square=true`
//                 : profileWithOwnership.account?.profile.avatarURL
//             }
//           />
//           <AvatarFallback
//             css={{
//               br: "$1",
//             }}
//           >
//             {profileWithOwnership.account?.profile.name.slice(0, 2) ||
//               profileWithOwnership.account?.addr.slice(0, 2)}
//           </AvatarFallback>
//         </Avatar>
//         <Typography size="1" contrast="hi">
//           {profileWithOwnership.account?.profile.name ||
//             abbreviateAddress({
//               address: profileWithOwnership.account?.addr,
//             })}
//         </Typography>
//         <Typography css={{ mt: "$2" }} size="3" contrast="hi" weight="5">
//           Owns {profileWithOwnership.ownershipAmount}% of {songTitle}
//         </Typography>
//       </HoverCardContent>
//     </HoverCard>
//   );
// };

// interface ProfileProps {
//   account: ArAccount | undefined;
//   contrast?: "hi" | "lo";
//   size?: "1" | "2" | "3";
// }

// const Creator = ({ account, size = "2", contrast = "lo" }: ProfileProps) => {
//   return (
//     <Link
//       to={{
//         pathname: "/profile",
//         search: `?addr=${account?.addr}`,
//       }}
//     >
//       <Flex gap="1" align="center">
//         <Image
//           size={size}
//           css={{
//             br: "9999px",
//           }}
//           src={
//             account?.profile?.avatarURL === appConfig.accountAvatarDefault
//               ? `https://source.boringavatars.com/marble/100/${account?.txid}?square=true`
//               : account?.profile.avatarURL
//           }
//         />
//         <Typography size={size} contrast={contrast}>
//           {account?.profile.name ||
//             abbreviateAddress({
//               address: account?.addr,
//             })}
//         </Typography>
//       </Flex>
//     </Link>
//   );
// };

// interface ListingItemProps {
//   listing: SaleOrder;
//   isOrderCreator: boolean;
//   userAddress: string | undefined;
//   track: TrackType;
// }

// const ListingItem = ({ listing, isOrderCreator, userAddress, track }: ListingItemProps) => {
//   const [showBuyAssetDialog, setShowBuyAssetDialog] = useState(false);
//   const queryClient = useQueryClient();

//   const { data: account } = useQuery({
//     queryKey: [`profile-${listing.creator}`],
//     queryFn: () => {
//       if (!listing.creator) {
//         return;
//       }

//       return getProfile(listing.creator);
//     },
//   });

//   const cancelOrderMutation = useMutation({
//     mutationFn: cancelOrder,
//     mutationKey: [`cancelOrder-${listing.id}`],
//     onSuccess: (data) => {
//       setTimeout(
//         () =>
//           queryClient.invalidateQueries([
//             `activeSaleOrders-${track.txid}`,
//             `uBalance-${userAddress}`,
//             `ucmAsset-${track.txid}`,
//           ]),
//         500
//       );
//     },
//   });

//   return (
//     <>
//       {cancelOrderMutation.isSuccess ? null : (
//         <>
//           <Flex
//             css={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr 1fr 1fr",
//               p: "$3",
//               "& p": { fontSize: "$2", color: "$slate12" },
//             }}
//             align="center"
//           >
//             <Typography>{(listing.price / 1e6).toFixed(2)}</Typography>
//             <Typography>{listing.quantity}</Typography>
//             <Typography>
//               {account?.profile?.name || abbreviateAddress({ address: listing.creator })}
//             </Typography>
//             {isOrderCreator ? (
//               <AlertDialog>
//                 <AlertDialogTrigger asChild>
//                   <Button
//                     disabled={cancelOrderMutation.isLoading}
//                     variant="ghost"
//                     size="1"
//                     css={{ width: "max-content", ml: "auto" }}
//                     colorScheme="danger"
//                   >
//                     {cancelOrderMutation.isLoading ? "Removing..." : "Cancel"}
//                   </Button>
//                 </AlertDialogTrigger>
//                 <AlertDialogContent css={{ width: 480 }}>
//                   <AlertDialogTitle asChild>
//                     <Typography size="4" weight="6" contrast="hi" css={{ mb: "$3" }}>
//                       Remove listing
//                     </Typography>
//                   </AlertDialogTitle>
//                   <AlertDialogDescription asChild>
//                     <Typography contrast="hi" css={{ width: "40ch", lineHeight: 1.5 }}>
//                       Are you sure? This will remove your listing from the marketplace.
//                     </Typography>
//                   </AlertDialogDescription>
//                   <Flex align="center" justify="end" gap="3" css={{ mt: "$5" }}>
//                     <AlertDialogCancel asChild>
//                       <Button>Cancel</Button>
//                     </AlertDialogCancel>
//                     <AlertDialogAction asChild>
//                       <Button
//                         colorScheme="danger"
//                         variant="solid"
//                         onClick={() =>
//                           cancelOrderMutation.mutate({
//                             orderId: listing.id,
//                             address: listing.creator,
//                           })
//                         }
//                       >
//                         Remove listing
//                       </Button>
//                     </AlertDialogAction>
//                   </Flex>
//                 </AlertDialogContent>
//               </AlertDialog>
//             ) : (
//               <>
//                 {userAddress ? (
//                   <>
//                     <Button
//                       variant="solid"
//                       size="1"
//                       onClick={() => setShowBuyAssetDialog(true)}
//                       css={{ width: "max-content", ml: "auto" }}
//                     >
//                       Buy
//                     </Button>
//                     <BuyAssetDialog
//                       open={showBuyAssetDialog}
//                       onClose={() => setShowBuyAssetDialog(false)}
//                       address={userAddress}
//                       track={track}
//                     />
//                   </>
//                 ) : null}
//               </>
//             )}
//           </Flex>
//           <Box
//             css={{
//               height: 1,
//               backgroundColor: "$slate3",
//             }}
//           />
//         </>
//       )}
//     </>
//   );
// };

// const AccordionContentItem = styled(Flex, {
//   mt: "$2",

//   "& p": {
//     color: "$slate12",
//   },

//   "& p:first-child": {
//     color: "$slate11",

//     "&[data-txid-detail]": {
//       color: "$slate12",
//     },
//   },
// });

// const Description = styled(Typography, {
//   display: "-webkit-box",
//   "-webkit-line-clamp": 1,
//   "-webkit-box-orient": "vertical",
//   overflow: "hidden",
//   maxWidth: "25ch",
// });

// type TrackTab = "details" | "comments" | "activity" | "sponsors";

const AlphaIconButton = styled(IconButton, {
  color: "var(--white-a10)",

  "& svg": {
    width: 20,
    height: 20,
  },

  "&:hover": {
    backgroundColor: "var(--white-a4)",
    color: "var(--white-a12)",
  },

  variants: {
    liked: {
      true: {
        color: "var(--accent-9)",
        "&:hover": {
          backgroundColor: "var(--white-a4)",
          color: "var(--accent-10)",
        },
      },
    },
  },
});

const StyledAvatar = styled(Avatar);

const AVATAR_RADIUS = `max(var(--radius-3), var(--radius-4) * 0.8)`;
const AVATAR_SIZE = 220;
const OUTLINE_OFFSET = 2;
const BANNER_HEIGHT = 280;
const VOUCHED_ICON_SIZE = 12;

export const Track = () => {
  const [liked, setLiked] = useState(false);
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const txidFromParams = urlParams.get("id");
  const {
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    handlePlayPause,
    tracklist,
  } = useAudioPlayer();

  if (!txidFromParams || (txidFromParams && txidFromParams.length !== 43)) {
    // temp
    return (
      <Grid>
        <Text>No track found. Please search again.</Text>
      </Grid>
    );
  }

  const { data: tracks } = useQuery({
    queryKey: [`track-${txidFromParams}`],
    refetchOnWindowFocus: false,
    queryFn: () => getTrack({ txid: txidFromParams }),
  });

  const { data } = useGetUserProfile({ address: tracks ? tracks[0].creator : undefined });
  const profile = data?.profiles.length ? data.profiles[0] : undefined;

  const isUserMe = useIsUserMe(tracks ? tracks[0].creator : undefined);

  if (!tracks?.length) {
    return null;
  }

  const track = tracks[0];
  const artworkUrl = track.artworkSrc;

  const isPlaying = playing && currentTrackId === track.txid;

  const handleClick = () => {
    handlePlayPause?.();

    if (currentTrackId === track.txid && compareArrays(tracks, tracklist)) {
      togglePlaying?.();
    } else {
      setTracklist?.([track], 0);
      setCurrentTrackId?.(track.txid);
      setCurrentTrackIndex?.(0);
    }
  };

  return (
    <Flex direction="column">
      <Box
        style={css({
          width: "100%",
          height: BANNER_HEIGHT,
          position: "relative",
        })}
      >
        <Flex
          gap="6"
          p="3"
          m="3"
          style={css({
            borderRadius: "max(var(--radius-3), var(--radius-4) * 0.8)",
            position: "relative",
            overflow: "hidden",
          })}
        >
          <Avatar
            src={track.artworkSrc}
            fallback={
              <img src={`${appConfig.boringAvatarsUrl}/marble/1000/${track.txid}?square=true`} />
            }
            style={css({
              width: "100%",
              height: "100%",
              aspectRatio: 3 / 1,
              borderRadius: 0,
              position: "absolute",
              inset: 0,
              zIndex: -1,
            })}
          />
          <Box
            style={css({
              position: "absolute",
              inset: 0,
              backdropFilter: "blur(4px)",
              background: `var(--black-a6)`,
              zIndex: -1,
            })}
          />
          <StyledAvatar
            src={artworkUrl}
            fallback={<Box />}
            style={css({
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_RADIUS,
              outline: `${OUTLINE_OFFSET}px solid var(--gray-a3)`,
              outlineOffset: -OUTLINE_OFFSET,
              overflow: "hidden",
            })}
            css={{
              ".rt-AvatarFallback > div": {
                borderRadius: 0,
              },
            }}
          />
          <Flex
            direction="column"
            my="3"
            style={css({
              flex: 1,
            })}
          >
            <Flex justify="between">
              <Flex gap="2" align="center">
                <IconButton onClick={handleClick} size="4">
                  {isPlaying ? <MdPause /> : <MdPlayArrow />}
                </IconButton>
                <Box>
                  <Heading
                    as="h2"
                    size="6"
                    weight="medium"
                    style={css({ color: "var(--white-a12)" })}
                  >
                    {track.title}
                  </Heading>
                  <Link
                    style={css({
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      maxWidth: "20ch",

                      color: "var(--white-a10)",
                      textDecorationColor: "var(--white-a5)",
                    })}
                    asChild
                  >
                    <RouterLink to={`/profile?addr=${track.creator}`}>
                      {profile?.name || abbreviateAddress({ address: track.creator })}
                    </RouterLink>
                  </Link>
                </Box>
              </Flex>
              <Flex p="3" align="center" gap="5" style={css({ alignSelf: "start" })}>
                <AlphaIconButton
                  onClick={() => setLiked(!liked)}
                  liked={liked}
                  size="3"
                  variant="ghost"
                  highContrast
                >
                  {liked ? <IoMdHeart /> : <IoMdHeartEmpty />}
                </AlphaIconButton>
                <ShareDialog track={track}>
                  <AlphaIconButton size="3" variant="ghost" highContrast>
                    <MdShare />
                  </AlphaIconButton>
                </ShareDialog>
              </Flex>
              {/* {track.releaseDate && (
                <Text size="2" color="gray">
                  {timeAgo(track.releaseDate * 1000)}
                </Text>
              )} */}
            </Flex>
            <Box mt="auto">
              <TrackWaveform track={track} src={track.audioSrc} height={80} />
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};
