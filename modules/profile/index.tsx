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
import { useConnect } from "arweave-wallet-ui-test";

const StyledTabsContent = styled(TabsContent, {
  pt: "$5",
});

export const Profile = () => {
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const { walletAddress } = useConnect();

  const addr = urlParams.get("addr");

  if (!addr) {
    // no profile found view
  }

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

  const { data: tracks } = useQuery({
    queryKey: [`tracks-by=${addr}`],
    queryFn: () => {
      if (!addr) {
        if (walletAddress) {
          return getTrackByOwners(walletAddress);
        } else {
          throw new Error("No profile has been found");
        }
      }

      return getTrackByOwners(addr);
    },
  });

  const bannerUrl = account?.profile.bannerURL;
  const avatarUrl = account?.profile.avatarURL;

  return (
    <Flex direction="column" gap="5">
      <Box
        css={{
          width: "100%",
          height: 220,
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
      ></Box>
      <Flex gap="5" align="center">
        <Image
          css={{
            width: 150,
            height: 150,
            br: 9999,
          }}
          src={
            avatarUrl === appConfig.accountAvatarDefault
              ? `https://source.boringavatars.com/marble/100/${account?.txid}?square=true`
              : avatarUrl
          }
        />
        <Flex direction="column" gap="3">
          <Box>
            <Typography size="5" contrast="hi">
              {account?.profile.name ||
                abbreviateAddress({
                  address: account?.addr,
                  options: { startChars: 6, endChars: 6 },
                })}
            </Typography>
            {account && account.profile.handleName && (
              <Typography size="2">@{account.profile.handleName}</Typography>
            )}
          </Box>
          <Typography>{account?.profile.bio || "No bio."}</Typography>
        </Flex>
      </Flex>
      <Tabs defaultValue="tracks">
        <TabsList>
          <TabsTrigger value="tracks">tracks</TabsTrigger>
          <TabsTrigger value="albums">albums</TabsTrigger>
          <TabsTrigger value="likes">likes</TabsTrigger>
        </TabsList>
        <StyledTabsContent value="tracks">
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
      </Tabs>
    </Flex>
  );
};
