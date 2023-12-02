import { Box } from "@/ui/Box";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Typography } from "@/ui/Typography";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/getProfile";
import { abbreviateAddress } from "@/utils";
import { appConfig } from "@/appConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/Tabs";
import { getTrackByOwners } from "@/lib/getTrackByOwner";
import { TrackCard } from "../track/TrackCard";
import { styled } from "@/stitches.config";
import { useEffect, useState } from "react";
import { useConnect } from "@/hooks/useConnect";
import { Skeleton } from "@/ui/Skeleton";
import { getLikedTracks } from "@/lib/getLikedTracks";

const TrackSkeleton = styled(Skeleton, {
  width: 250,
  height: 250,
});

const StyledTabsTrigger = styled(TabsTrigger, {
  br: "$1",

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

const StyledTabsContent = styled(TabsContent, {
  pt: "$10",
});

type TrackTab = "tracks" | "likes";

export const Profile = () => {
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const { walletAddress } = useConnect();
  const [activeTab, setActiveTab] = useState<TrackTab>("tracks");

  const addr = urlParams.get("addr");

  const { data: account, isError } = useQuery({
    queryKey: [`profile-${addr}`],
    queryFn: () => {
      if (!addr) {
        if (walletAddress) {
          return getProfile(walletAddress);
        } else {
          throw new Error("No profile has been found");
        }
      }

      return getProfile(addr);
    },
  });

  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: [`tracks-by=${addr}`],
    refetchOnWindowFocus: false,
    enabled: activeTab === "tracks",
    queryFn: () => {
      const address = addr || walletAddress;
      if (address) {
        return getTrackByOwners(address);
      } else {
        return;
      }
    },
  });

  const { data: likedTracks, isLoading: likedTracksLoading } = useQuery({
    queryKey: [`liked-tracks-${addr}`],
    refetchOnWindowFocus: false,
    enabled: activeTab === "likes",
    queryFn: () => {
      const address = addr || walletAddress;
      if (address) {
        return getLikedTracks(address);
      } else {
        return;
      }
    },
  });

  const bannerUrl = account?.profile.bannerURL;
  const avatarUrl = account?.profile.avatarURL;

  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY) {
      window.scroll(0, 0);
    }
  }, []);

  return (
    <Flex direction="column">
      <Box
        css={{
          width: "100%",
          height: 300,
          aspectRatio: 16 / 9,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage: `url(${
            bannerUrl === appConfig.accountBannerDefault
              ? `https://source.boringavatars.com/marble/1000/${account?.txid}?square=true`
              : bannerUrl
          })`,
          "@bp5": {
            height: 280,
          },
        }}
      />
      <Box
        css={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 120,
        }}
      >
        <Flex
          css={{
            mt: -60,
            alignSelf: "start",
            ml: 80,
          }}
          direction="column"
          gap="5"
        >
          <Image
            css={{
              width: 120,
              height: 120,
              br: 9999,
              outline: "4px solid $colors$whiteA5",
              outlineOffset: -4,
            }}
            src={
              avatarUrl === appConfig.accountAvatarDefault
                ? `https://source.boringavatars.com/marble/100/${account?.txid}?square=true`
                : avatarUrl
            }
          />
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Typography size="6" weight="5" contrast="hi">
                {account?.profile.name ||
                  abbreviateAddress({
                    address: account?.addr,
                    options: { startChars: 6, endChars: 6 },
                  })}
              </Typography>
              {account && account.profile.handleName && (
                <Typography size="1">@{account.profile.handleName}</Typography>
              )}
            </Flex>
            <Typography>{account?.profile.bio || "No bio."}</Typography>
          </Flex>
        </Flex>
        <Tabs
          css={{ mt: 40 }}
          onValueChange={(e) => setActiveTab(e as TrackTab)}
          defaultValue="tracks"
        >
          <TabsList
            css={{
              br: "$2",
              width: "max-content",
              gap: "$1",
              backgroundColor: "$slate1",
              boxShadow: "0 0 0 1px $colors$slate5",
              p: "$1",
            }}
          >
            <StyledTabsTrigger value="tracks">releases</StyledTabsTrigger>
            <StyledTabsTrigger value="likes">likes</StyledTabsTrigger>
          </TabsList>
          <StyledTabsContent value="tracks">
            {tracksLoading && (
              <Flex wrap="wrap" gap="10">
                <TrackSkeleton />
                <TrackSkeleton />
                <TrackSkeleton />
                <TrackSkeleton />
                <TrackSkeleton />
              </Flex>
            )}
            {tracks && tracks.length > 0 && (
              <Flex wrap="wrap" gap="10">
                {tracks.map((track, idx) => (
                  <TrackCard
                    key={track.txid}
                    track={track}
                    trackIndex={idx}
                    tracks={tracks}
                  />
                ))}
              </Flex>
            )}
          </StyledTabsContent>
          <StyledTabsContent value="likes">
            {likedTracksLoading && (
              <Flex wrap="wrap" gap="10">
                <TrackSkeleton />
                <TrackSkeleton />
                <TrackSkeleton />
                <TrackSkeleton />
                <TrackSkeleton />
              </Flex>
            )}
            {likedTracks && likedTracks.length > 0 && (
              <Flex wrap="wrap" gap="10">
                {likedTracks.map((track, idx) => (
                  <TrackCard
                    key={track.txid}
                    track={track}
                    trackIndex={idx}
                    tracks={likedTracks}
                  />
                ))}
              </Flex>
            )}
          </StyledTabsContent>
        </Tabs>
      </Box>
    </Flex>
  );
};
