import { Link as RouterLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { keyframes, styled } from "@stitches/react";
import { useGetUserProfile, useIsUserMe } from "@/hooks/appData";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Link,
  Separator,
  TabsRoot,
  TabsList,
  TabsContent,
  TabsTrigger,
  Text,
  Container,
} from "@radix-ui/themes";
import { getTrack } from "@/lib/track/getTrack";
import { css } from "@/styles/css";
import { abbreviateAddress, compareArrays, formatISOToCustomDate, gateway, timeAgo } from "@/utils";
import { MdLink, MdPause, MdPlayArrow, MdRepeat, MdRepeatOn, MdShare } from "react-icons/md";
import { IoShareOutline } from "react-icons/io5";
import { TrackWaveform } from "./TrackWaveform";
import { appConfig } from "@/config";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useState } from "react";
import { ShareDialog } from "./components/ShareDialog";
import Avvvatars from "avvvatars-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { RxClock, RxDotsHorizontal } from "react-icons/rx";
import { gql } from "@/lib/helpers/gql";
import { arweave } from "@/lib/arweave";
import { useActiveAddress } from "arweave-wallet-kit";
import { TrackComments } from "./TrackComments";
import { OwnersChart } from "./components/OwnersChart";
import { getOwners } from "@/lib/track/getOwners";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { toast } from "sonner";
import { PiPlantFill, PiUsersFill } from "react-icons/pi";

const ASSET_TEST_TX = "pORcqZ_b-HEqv7Xjz0i1QzA3q5OpkCI1bX2ZcFMF6DI";

const ARTWORK_RADIUS = `max(var(--radius-3), var(--radius-4) * 0.8)`;
const ARTWORK_SIZE = 220;
const AVATAR_SIZE = 120;
const AVATAR_SIZE_SMALL = 40;
const OUTLINE_OFFSET = 2;
const OUTLINE_OFFSET_SMALL = 1;
const BANNER_HEIGHT = 280;
const VOUCHED_ICON_SIZE = 12;

const pulse = keyframes({
  "0%": {
    transform: "rotate(0deg)",
    filter: "blur(8px)",
    borderRadius: 5,
  },
  "33%": {
    transform: "rotate(-0.5deg) translate(1px,-1px) scale(1.01)",
    filter: "blur(10px)",
    borderRadius: 3,
  },
  "67%": {
    transform: "rotate(1deg) translate(-1px,-1px) scale(0.99)",
    filter: "blur(14px)",
    borderRadius: 7,
  },
  "100%": {
    transform: "rotate(0deg)",
    filter: "blur(8px)",
    borderRadius: 5,
  },
});

const Gradient = styled("div", {
  filter: "blur(1px)",
  borderRadius: "8px",
  position: "absolute",
  top: "0px",
  left: "0px",
  width: "100%",
  height: "100%",
  transition: "opacity 1.5s ease",
  background: "linear-gradient(91.83deg, rgb(208, 60, 74) 2.26%, rgb(172, 74, 218) 95.81%)",
  animation: `10s ease-in-out 0s infinite normal both running ${pulse}`,
  opacity: "0.75",
});

const MagicButton = styled(Button, {
  position: "relative",
  padding: "1px",

  "&:hover": {
    [`& ${Gradient}`]: {
      transitionDuration: "0.25s",
      opacity: 1,
    },
  },
});

const MagicButtonText = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "var(--space-2)",
  // padding: "12px 24px",
  backgroundColor: "var(--gray-12)",
  position: "absolute",
  color: "var(--gray-1)",
  borderRadius: "inherit",
  cursor: "pointer",
  transition: "transform 250ms cubic-bezier(.2,.8,.4,1)",
});

const AlphaButton = styled(Button, {
  backgroundColor: "transparent",
  color: "var(--white-a11)",

  "& svg": {
    width: 16,
    height: 16,
  },

  "&:hover": {
    backgroundColor: "var(--white-a4)",
    color: "var(--white-a12)",
  },

  variants: {
    highlighted: {
      true: {
        color: "var(--white-a12)",
        "&:hover": {
          backgroundColor: "var(--white-a4)",
          color: "var(--white-a11)",
        },
      },
    },
  },
});

const StyledAvatarSmall = styled(Avatar, {
  width: AVATAR_SIZE_SMALL,
  height: AVATAR_SIZE_SMALL,
  outline: `${OUTLINE_OFFSET_SMALL}px solid var(--white-a3)`,
  outlineOffset: -OUTLINE_OFFSET_SMALL,
  overflow: "hidden",

  ".rt-AvatarFallback > div": {
    borderRadius: 0,
  },
});
const StyledAvatar = styled(Avatar);
const CreatorInfo = Flex;

export const Track = () => {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showMore, setShowMore] = useState(false);
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
  const connectedAddress = useActiveAddress();

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

  const { data: description } = useQuery({
    queryKey: [`description-${txidFromParams}`],
    refetchOnWindowFocus: false,
    enabled: !!tracks,
    queryFn: async () => {
      console.log(track.owner);

      const res = await gql({
        variables: {
          owners: [track.owner],
          tags: [
            {
              name: "Content-Type",
              values: ["text/plain"],
            },
            {
              name: "Description-For",
              values: [txidFromParams],
            },
          ],
        },
      });

      const data = res.transactions.edges.filter((edge) => Number(edge.node.data.size) < 3000);

      const dataItem = data[0];

      if (dataItem) {
        const descriptionRes = await arweave.api.get(dataItem.node.id);
        const data: string = await descriptionRes.data;

        return data;
      }
    },
  });

  const { data: owners } = useQuery({
    queryKey: [`trackOwners-${txidFromParams}`],
    queryFn: () => getOwners(ASSET_TEST_TX),
  });

  const { data: profile } = useGetUserProfile({
    address: tracks?.length ? tracks[0].creator : undefined,
  });

  const avatarUrl = gateway() + "/" + profile?.Info?.avatar;

  const isUserMe = useIsUserMe(tracks ? tracks[0].creator : undefined);

  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const origin = window.location.origin;

  if (!tracks?.length) {
    return null;
  }

  const track = tracks[0];
  const artworkUrl = track.artworkSrc;

  const isPlaying = playing && currentTrackId === track.txid;

  const handleClick = () => {
    handlePlayPause?.();

    if (currentTrackId === track.txid) {
      togglePlaying?.();
    } else {
      setTracklist?.([track], 0);
      setCurrentTrackId?.(track.txid);
      setCurrentTrackIndex?.(0);
    }
  };

  return (
    // <Grid columns="3fr 1fr" height="100%">
    <Container>
      <Flex direction="column" style={css({ height: "100%" })}>
        <Box
          style={css({
            width: "100%",
            // height: BANNER_HEIGHT,
            position: "relative",
          })}
        >
          <Flex
            gap="6"
            p="3"
            // m="2"
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
                backdropFilter: "blur(1px)",
                background: `var(--black-a8)`,
                zIndex: -1,
              })}
            />
            <StyledAvatar
              src={artworkUrl}
              fallback={<Box />}
              style={css({
                width: ARTWORK_SIZE,
                height: ARTWORK_SIZE,
                borderRadius: ARTWORK_RADIUS,
                outline: `${OUTLINE_OFFSET}px solid var(--white-a3)`,
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
                        {profile?.Info?.name || abbreviateAddress({ address: track.creator })}
                      </RouterLink>
                    </Link>
                  </Box>
                </Flex>
                <Flex>
                  <AlphaButton onClick={() => setLiked(!liked)} highlighted={liked} size="2">
                    {liked ? "Liked" : "Like"}
                    {liked ? <IoMdHeart /> : <IoMdHeartEmpty />}
                  </AlphaButton>
                  <AlphaButton
                    size="2"
                    onClick={() => setReposted(!reposted)}
                    highlighted={reposted}
                  >
                    {reposted ? "Reposted" : "Repost"}
                    {reposted ? <MdRepeatOn /> : <MdRepeat />}
                  </AlphaButton>
                  <ShareDialog track={track}>
                    <AlphaButton size="2">
                      Share
                      <IoShareOutline />
                    </AlphaButton>
                  </ShareDialog>
                  <AlphaButton
                    onClick={async () => {
                      await copyToClipboard(`${origin}/track?tx=${track.txid}`);
                      toast.success("Link copied to clipboard");
                    }}
                    size="2"
                  >
                    Copy link
                    <MdLink />
                  </AlphaButton>
                  <AlphaButton size="2">
                    More
                    <RxDotsHorizontal />
                  </AlphaButton>
                </Flex>
              </Flex>
              <Box mt="auto">
                <TrackWaveform track={track} src={track.audioSrc} height={80} />
              </Box>
            </Flex>
          </Flex>
        </Box>
        <Grid pt="6" columns="3fr 1fr" gap="7">
          <Flex gap="9">
            <Flex direction="column" style={{ alignSelf: "start" }}>
              <CreatorInfo direction="column" mb="7" gap="2">
                <RouterLink to={`/profile?addr=${track.creator}`}>
                  <StyledAvatar
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE}
                        radius={0}
                      />
                    }
                    style={css({
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      outline: `${OUTLINE_OFFSET}px solid var(--white-a3)`,
                      outlineOffset: -OUTLINE_OFFSET,
                      overflow: "hidden",
                    })}
                    css={{
                      ".rt-AvatarFallback > div": {
                        borderRadius: 0,
                      },
                    }}
                  />
                </RouterLink>
                <Flex direction="column" align="center">
                  <Link color="gray" highContrast size="4" weight="medium" asChild>
                    <RouterLink to={`/profile?addr=${track.creator}`}>
                      {profile?.Info?.name || abbreviateAddress({ address: track.creator })}
                    </RouterLink>
                  </Link>
                </Flex>
                <Flex align="center" gap="3" style={{ alignSelf: "center" }}>
                  <Flex gap="1">
                    <PiUsersFill />
                    <Text size="1" color="gray">
                      {following ? 420 : 419}
                    </Text>
                  </Flex>
                  <Button
                    size="1"
                    variant={following ? "outline" : "solid"}
                    color={following ? undefined : "gray"}
                    highContrast={following ? false : true}
                    onClick={() => setFollowing(!following)}
                    style={{ alignSelf: "center" }}
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                </Flex>
              </CreatorInfo>
            </Flex>

            <TabsRoot defaultValue="details" style={{ minWidth: "60ch" }}>
              <TabsList style={{ marginBlockEnd: "var(--space-5)" }}>
                <TabsTrigger value="details">DETAILS</TabsTrigger>
                <TabsTrigger value="comments">COMMENTS</TabsTrigger>
                <TabsTrigger value="downloads">ACTIVITY</TabsTrigger>
                <TabsTrigger value="credits">CREDITS</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Flex direction="column" gap="3">
                  <Flex direction="column">
                    {/* <Heading as="h2" weight="medium" size="4">
                      Description
                    </Heading> */}
                    <Text color="gray" mt="1" style={{ maxWidth: "60ch" }}>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis ratione
                      quasi consequatur excepturi nobis, ipsum at repellendus laboriosam cupiditate
                      maxime corporis quibusdam deserunt expedita. Praesentium.
                    </Text>
                  </Flex>
                  <Flex gap="5">
                    <Link>#beats</Link>
                    <Link>#permanence</Link>
                    <Link>#UK</Link>
                  </Flex>
                  {track.releaseDate && (
                    <Text>Released on {formatISOToCustomDate(track.releaseDate)}</Text>
                  )}
                </Flex>
              </TabsContent>

              <TabsContent value="comments">
                <TrackComments track={track} />
              </TabsContent>

              <TabsContent value="credits">
                <Flex direction="column">
                  <Flex
                    justify="between"
                    p="3"
                    align="center"
                    style={{
                      borderBottom: "1px solid var(--gray-5)",
                    }}
                  >
                    <Flex direction="column">
                      <Link size="4" weight="medium">
                        {profile?.Info?.name || abbreviateAddress({ address: track.creator })}
                      </Link>
                      <Text color="gray">Main Artist, Writer, Producer</Text>
                    </Flex>
                    <Button variant="outline">Follow</Button>
                  </Flex>
                  <Flex
                    justify="between"
                    p="3"
                    align="center"
                    style={{
                      borderBottom: "1px solid var(--gray-5)",
                    }}
                  >
                    <Flex direction="column">
                      <Link size="4" weight="medium">
                        John Doe
                      </Link>
                      <Text color="gray">Writer</Text>
                    </Flex>
                    <Button variant="outline">Follow</Button>
                  </Flex>
                </Flex>
              </TabsContent>

              <TabsContent value="downloads"></TabsContent>
            </TabsRoot>
          </Flex>
          <Flex direction="column" gap="5">
            <Flex direction="column" gap="2" mb="3" style={{ maxWidth: "60ch" }}>
              <Button size="3" variant="solid">
                Buy digital track for 1 USDA
              </Button>
              {/* <MagicButton size="3">
                <Gradient />
                <MagicButtonText>
                  Invest
                  <PiPlantFill />
                </MagicButtonText>
              </MagicButton> */}
              <Button size="3" color="gray" highContrast>
                Invest
                <PiPlantFill />
              </Button>
            </Flex>
            <Flex direction="column" gap="2">
              <Heading size="3" weight="medium">
                Supporters
              </Heading>
              <Flex wrap="wrap" gap="2" asChild>
                <ul>
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                  <StyledAvatarSmall
                    src={avatarUrl}
                    fallback={
                      <Avvvatars
                        style="shape"
                        value={track.creator}
                        size={AVATAR_SIZE_SMALL}
                        radius={0}
                      />
                    }
                  />
                </ul>
              </Flex>
            </Flex>
          </Flex>
        </Grid>
      </Flex>
      {/* <TrackComments
        track={track}
        css={{
          padding: "var(--space-5)",
          backgroundColor: "var(--side-panel-background)",
        }}
      /> */}
    </Container>
    // </Grid>
  );
};
