import { appConfig } from "@/config";
import { useGetUserProfile } from "@/hooks/appData";
import { css } from "@/styles/css";
import { abbreviateAddress } from "@/utils";
import {
  AspectRatio,
  Avatar,
  Box,
  Flex,
  Grid,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useActiveAddress } from "arweave-wallet-kit";
import BoringAvatar from "boring-avatars";
import { BsCopy, BsPatchCheckFill } from "react-icons/bs";

const StyledBoringAvatar = styled(BoringAvatar);

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
    // backgroundColor: "var(--white-a4)",
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

export const Profile = () => {
  const address = useActiveAddress();
  const query = typeof window !== "undefined" ? window.location.search : "";
  const urlParams = new URLSearchParams(query);
  const addressFromParams = urlParams.get("addr");

  const addr = addressFromParams || address;

  const { data } = useGetUserProfile({ address: addr });
  const profile = data?.length ? data[0] : undefined;

  const bannerUrl = profile?.bannerSrc
    ? profile.bannerSrc
    : `${appConfig.boringAvatarsUrl}/marble/${AVATAR_SIZE}/${addr}?square=true`;

  const avatarUrl = profile?.avatarSrc
    ? profile.avatarSrc
    : `${appConfig.boringAvatarsUrl}/marble/${AVATAR_SIZE}/${addr}?square=true`;

  if (!addr) {
    // temp
    return (
      <Grid>
        <Text>No wallet found</Text>
      </Grid>
    );
  }

  return (
    <Box
      style={css({
        width: "100%",
        height: BANNER_HEIGHT,
        position: "relative",
      })}
    >
      <Avatar
        src={bannerUrl}
        fallback={<StyledBoringAvatar name={addr} variant="marble" />}
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
        <Avatar
          src={avatarUrl}
          fallback={<BoringAvatar size={AVATAR_RADIUS} name={addr} variant="marble" />}
          style={css({
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_RADIUS,
            outline: `${OUTLINE_OFFSET}px solid var(--white-a3)`,
            outlineOffset: -OUTLINE_OFFSET,
          })}
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
    </Box>
  );
};
