import { appConfig } from "@/config";
import { useGetUserProfile, useIsUserMe } from "@/hooks/appData";
import { css } from "@/styles/css";
import { abbreviateAddress, gateway } from "@/utils";
import {
  AspectRatio,
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Separator,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useActiveAddress } from "arweave-wallet-kit";
import BoringAvatar from "boring-avatars";
import { useEffect, useState } from "react";
import { BsCopy, BsPatchCheckFill } from "react-icons/bs";
import { EditProfileDialog } from "./components/EditProfileDialog";
import Avvvatars from "avvvatars-react";
import { Releases } from "./components/Releases";
import { Collection } from "./components/Collection";
import { Likes } from "./components/Likes";
import { useLocation } from "react-router-dom";

const StyledAvatar = styled(Avatar);

const BANNER_RADIUS = `max(var(--radius-1), var(--radius-4) * 0.8)`;
const AVATAR_RADIUS = `max(var(--radius-3), var(--radius-full) * 0.8)`;
const AVATAR_SIZE = 120;
const OUTLINE_OFFSET = 2;
const BANNER_HEIGHT = 280;
const VOUCHED_ICON_SIZE = 12;

const AlphaIconButton = styled(IconButton, {
  color: "var(--white-a8)",

  "& svg": {
    width: 12,
    height: 12,
  },

  "&:hover": {
    color: "var(--white-a12)",
  },
});

export const Profile = () => {
  const address = useActiveAddress();
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const addressFromParams = urlParams.get("addr");
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);

  const addr = addressFromParams || address;

  if (!addr) {
    // temp
    return (
      <Grid>
        <Text>No wallet found</Text>
      </Grid>
    );
  }

  const isUserMe = useIsUserMe(addr);

  const { data } = useGetUserProfile({ address: addr });
  const profile = data?.profiles.length ? data.profiles[0] : undefined;

  const bannerUrl = gateway() + "/" + profile?.bannerId;
  const avatarUrl = gateway() + "/" + profile?.avatarId;

  return (
    <Flex direction="column">
      <Box
        style={css({
          width: "100%",
          height: BANNER_HEIGHT,
          position: "relative",
        })}
      >
        <Avatar
          src={bannerUrl}
          fallback={
            <Box
              position="absolute"
              inset="0"
              style={css({ backgroundColor: "var(--accent-9)" })}
            />
          }
          style={css({
            width: "100%",
            height: "100%",
            aspectRatio: 3 / 1,
            borderRadius: 0,
          })}
        />
        <Box
          style={css({
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              to top,
              var(--black-a9) 0%,
              var(--black-a3) 50%,
              var(--black-a1) 65%,
              var(--black-a1) 75.5%,
              var(--black-a1) 82.85%,
              var(--black-a1) 88%,
              var(--black-a1) 100%
                )`,
          })}
        />

        <Flex
          gap="3"
          mx="4"
          pb="4"
          align="end"
          style={css({
            position: "absolute",
            inset: 0,
          })}
        >
          <StyledAvatar
            src={avatarUrl}
            fallback={<Avvvatars style="shape" value={addr} size={AVATAR_SIZE} radius={0} />}
            style={css({
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_RADIUS,
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
            style={css({
              color: "var(--white-a12)",
            })}
          >
            <Flex align="center" gap="1">
              <Text size="1" weight="medium">
                Verified
              </Text>
              <BsPatchCheckFill
                style={css({
                  width: VOUCHED_ICON_SIZE,
                  height: VOUCHED_ICON_SIZE,
                })}
              />
            </Flex>
            <Flex
              align="center"
              gap="3"
              style={css({
                backdropFilter: "blur(4px)",
                borderRadius: BANNER_RADIUS,
              })}
            >
              <Text
                size="9"
                weight="medium"
                style={css({
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "15ch",
                  // solves issue of overflow cutting off text
                  lineHeight: 1.15,
                })}
              >
                {profile?.name || abbreviateAddress({ address: addr })}
              </Text>
            </Flex>
            {profile?.name && (
              <Flex
                align="center"
                gap="2"
                mt="1"
                pl="1"
                style={css({
                  color: "var(--white-a10)",
                })}
              >
                {profile?.handle && (
                  <>
                    <Text size="2">
                      {profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`}
                    </Text>
                    <Separator orientation="vertical" />
                  </>
                )}
                <Text
                  size="2"
                  style={css({
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "20ch",
                  })}
                >
                  {abbreviateAddress({ address: addr })}
                </Text>
                <AlphaIconButton size="1" color="gray" variant="ghost">
                  <BsCopy />
                </AlphaIconButton>
              </Flex>
            )}
          </Flex>
        </Flex>

        {isUserMe && (
          <EditProfileDialog address={addr} hasProfile={data?.hasProfile} profile={profile}>
            <Button
              variant="solid"
              style={css({
                position: "absolute",
                bottom: "var(--space-3)",
                right: "var(--space-3)",
                backgroundColor: "var(--white-a3)",
                color: "var(--white-a12)",
                "&:hover": { backgroundColor: "var(--white-a4)" },
              })}
            >
              Edit profile
            </Button>
          </EditProfileDialog>
        )}
      </Box>

      <TabsRoot defaultValue="releases">
        <TabsList>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="collection">Collection </TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <Box px="4" pt="3" pb="2">
          <TabsContent value="releases">
            <Releases address={addr} />
          </TabsContent>

          <TabsContent value="collection">
            <Collection address={addr} />
          </TabsContent>

          <TabsContent value="likes">
            <Likes address={addr} />
          </TabsContent>
        </Box>
      </TabsRoot>
    </Flex>
  );
};
