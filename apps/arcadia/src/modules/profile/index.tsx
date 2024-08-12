import { useGetUserProfile, useIsUserMe } from "@/hooks/appData";
import { css } from "@/styles/css";
import { abbreviateAddress, gateway } from "@/utils";
import {
  Avatar,
  Box,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTrigger,
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
import { BsCheck, BsCopy, BsPatchCheckFill } from "react-icons/bs";
import { EditProfileDialog } from "./components/EditProfileDialog";
import Avvvatars from "avvvatars-react";
import { Releases } from "./components/Releases";
import { Collection } from "./components/Collection";
import { Likes } from "./components/Likes";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { RxCross2, RxDotFilled } from "react-icons/rx";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileProcess } from "@/lib/user/profile";
import { followUser, unfollowUser } from "@/lib/user/follow";
import { AOProfile, ProfileInfo } from "@/types";
import { useState } from "react";
import { FollowerDialog } from "./components/FollowerDialog";

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

const AlphaButton = styled(Button, {
  color: "var(--white-a11)",

  "&:hover": {
    background: "var(--white-a2)",
    color: "var(--white-a12)",
  },
});

const StyledSeparator = styled(Separator, {
  "--separator-size": "40px",
});

export const Profile = () => {
  const connectedAddress = useActiveAddress();
  const location = useLocation();
  const query = location.search;
  const urlParams = new URLSearchParams(query);
  const addressFromParams = urlParams.get("addr");
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const queryClient = useQueryClient();
  const [followingText, setFollowingText] = useState<"Following" | "Unfollow">("Following");

  const address = addressFromParams || connectedAddress;

  if (!address) {
    // temp
    return (
      <Grid>
        <Text>No wallet found</Text>
      </Grid>
    );
  }

  const isUserMe = useIsUserMe(address);

  const { data: profile } = useGetUserProfile({ address });

  const { data: profileProcess, isSuccess: profileProcessSuccess } = useQuery({
    queryKey: ["process", address, { type: "profile" }],
    queryFn: () => getProfileProcess(address),
    enabled: !!address,
  });

  const processId =
    profileProcess && profileProcess[0]?.node.id ? profileProcess[0].node.id : undefined;

  const { data: profileMeProcess, isSuccess: profileMeProcessSuccess } = useQuery({
    queryKey: ["process", connectedAddress, { type: "profile" }],
    queryFn: () => getProfileProcess(connectedAddress),
    enabled: !!connectedAddress && !isUserMe,
  });

  const processIdMe =
    profileMeProcess && profileMeProcess[0]?.node.id ? profileMeProcess[0].node.id : undefined;

  const noProfileMe = profileMeProcessSuccess && !profileMeProcess?.length;
  const noProfile = profileProcessSuccess && !profileProcess?.length;

  const followMutation = useMutation({
    mutationFn: followUser,
    onMutate: async (data) => {
      // prevent overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ["profile", address],
      });

      // snapshot prev value
      const prevProfile = queryClient.getQueryData<AOProfile>(["profile", address]);

      // optimistically update
      queryClient.setQueryData<AOProfile>(["profile", address], (oldProfile) => {
        return {
          Owner: oldProfile?.Owner || address,
          Info: oldProfile?.Info || { name: "", handle: "", bio: "", avatar: "", banner: "" },
          Followers: oldProfile?.Followers ? [...oldProfile.Followers, data.sender] : [data.sender],
          Following: oldProfile?.Following || [],
        };
      });

      // return ctx obj with snapshot
      return { prevProfile };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", address],
      });
    },
    onError: (error, data, ctx: any) => {
      queryClient.setQueryData(["profile", address], ctx.prevProfile);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["profile", address],
      });

      const prevProfile = queryClient.getQueryData<AOProfile>(["profile", address]);

      queryClient.setQueryData<AOProfile>(["profile", address], (oldProfile) => {
        return {
          Owner: oldProfile?.Owner || address,
          Info: oldProfile?.Info || { name: "", handle: "", bio: "", avatar: "", banner: "" },
          Followers: oldProfile?.Followers?.filter((follower) => follower !== data.sender) || [],
          Following: oldProfile?.Following || [],
        };
      });

      return { prevProfile };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", address],
      });
    },
    onError: (error, data, ctx: any) => {
      queryClient.setQueryData(["profile", address], ctx.prevProfile);
    },
  });

  const isFollowing = () => {
    if (isUserMe) return false;
    if (!profile?.Followers) return false;
    if (!connectedAddress) return false;

    if (processIdMe && profile.Followers.includes(processIdMe)) {
      return true;
    } else {
      return false;
    }
  };

  const bannerUrl = profile ? gateway() + "/" + profile.Info?.banner : undefined;
  const avatarUrl = profile ? gateway() + "/" + profile.Info?.avatar : undefined;

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
          align="center"
          style={css({
            position: "absolute",
            inset: 0,
            alignSelf: "end",
          })}
        >
          <StyledAvatar
            src={avatarUrl}
            fallback={<Avvvatars style="shape" value={address} size={AVATAR_SIZE} radius={0} />}
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
            {/* <Flex align="center" gap="1">
              <Text size="1" weight="medium">
                Verified
              </Text>
              <BsPatchCheckFill
                style={css({
                  width: VOUCHED_ICON_SIZE,
                  height: VOUCHED_ICON_SIZE,
                })}
              />
            </Flex> */}
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
              {profile?.Info?.name || abbreviateAddress({ address: address })}
            </Text>

            <Flex
              align="center"
              gap="2"
              mt="1"
              pl="1"
              style={css({
                color: "var(--white-a10)",
              })}
            >
              {profile?.Info?.handle && (
                <>
                  <Text size="2">
                    {profile.Info.handle.startsWith("@")
                      ? profile.Info.handle
                      : `@${profile.Info.handle}`}
                  </Text>
                  <RxDotFilled style={css({ color: "var(--white-a8)" })} />
                </>
              )}
              {profile?.Info?.name && (
                <>
                  <Text
                    size="2"
                    style={css({
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      maxWidth: "20ch",
                    })}
                  >
                    {abbreviateAddress({ address: address })}
                  </Text>
                  <AlphaIconButton
                    onClick={() => copyToClipboard(address)}
                    size="1"
                    color="gray"
                    variant="ghost"
                  >
                    {isCopied ? <BsCheck /> : <BsCopy />}
                  </AlphaIconButton>
                  {/* <RxDotFilled style={css({ color: "var(--white-a8)" })} /> */}
                </>
              )}
              <Flex ml={profile ? "3" : "0"} align="center" gap="3">
                {isUserMe ? (
                  <EditProfileDialog
                    address={address}
                    noProfile={noProfile}
                    profile={profile ? profile.Info : undefined}
                  >
                    <Button
                      size="1"
                      variant="solid"
                      style={css({
                        backgroundColor: "var(--white-a3)",
                        color: "var(--white-a12)",
                        "&:hover": { backgroundColor: "var(--white-a4)" },
                      })}
                    >
                      {noProfile ? "Create" : "Edit"} profile
                    </Button>
                  </EditProfileDialog>
                ) : (
                  <>
                    {processId && processIdMe ? (
                      <Button
                        size="1"
                        onClick={() => {
                          if (!processId) return;
                          if (!processIdMe) return;

                          const sender = processIdMe;
                          const target = processId;

                          if (isFollowing()) {
                            unfollowMutation.mutate({ sender, target });
                          } else {
                            followMutation.mutate({ sender, target });
                          }
                        }}
                        onMouseOver={() => setFollowingText("Unfollow")}
                        onMouseLeave={() => setFollowingText("Following")}
                        variant={isFollowing() ? "outline" : "solid"}
                        color="gray"
                        style={css({
                          minWidth: 64,
                          backgroundColor: isFollowing() ? "transparent" : "var(--white-a12)",
                          color: isFollowing() ? "var(--white-a12)" : "var(--black-a12)",
                          boxShadow: isFollowing() ? "0 0 0 1px var(--white-a7)" : "none",
                          "&:hover": {
                            backgroundColor: isFollowing() ? "var(--white-a4)" : "var(--white-a11)",
                          },
                        })}
                      >
                        {isFollowing() ? followingText : "Follow"}
                      </Button>
                    ) : (
                      <DialogRoot>
                        <DialogTrigger>
                          <Button
                            size="1"
                            style={css({
                              minWidth: 64,
                              backgroundColor: "var(--white-a12)",
                              color: "var(--black-a12)",
                              "&:hover": {
                                backgroundColor: "var(--white-a11)",
                              },
                            })}
                          >
                            Follow
                          </Button>
                        </DialogTrigger>

                        <DialogContent
                          style={css({
                            position: "relative",
                            maxWidth: 450,
                            overflow: "hidden",
                          })}
                        >
                          <DialogClose>
                            <IconButton
                              size="1"
                              color="gray"
                              variant="soft"
                              style={css({
                                position: "absolute",
                                right: "var(--space-4)",
                                top: "var(--space-4)",
                              })}
                            >
                              <RxCross2 style={css({ width: 14, height: 14 })} />
                            </IconButton>
                          </DialogClose>

                          <Flex mt="3" direction="column" gap="5" justify="between" align="center">
                            <Text weight="medium">You need to create a profile to follow:</Text>
                            <Flex align="center" gap="3">
                              <StyledAvatar
                                src={avatarUrl}
                                fallback={
                                  <Avvvatars
                                    style="shape"
                                    value={address}
                                    size={AVATAR_SIZE / 2}
                                    radius={0}
                                  />
                                }
                                style={css({
                                  width: AVATAR_SIZE / 2,
                                  height: AVATAR_SIZE / 2,
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
                              <Flex direction="column">
                                <Text weight="medium" size="5">
                                  {profile?.Info?.name || abbreviateAddress({ address })}
                                </Text>
                                {profile?.Info?.handle && (
                                  <Text color="gray">@{profile?.Info?.handle}</Text>
                                )}
                              </Flex>
                            </Flex>
                            <Button variant="solid" asChild>
                              <RouterLink to={"/profile"}>Go to profile</RouterLink>
                            </Button>
                          </Flex>
                        </DialogContent>
                      </DialogRoot>
                    )}
                  </>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {profile && (
          <Flex
            style={css({
              position: "absolute",
              bottom: "var(--space-3)",
              right: "var(--space-5)",
              height: "max-content",
              color: "var(--white-a10)",
            })}
            align="center"
            gap="5"
          >
            <Flex direction="column" align="start" gap="1">
              <FollowerDialog profile={profile} followerTab="followers">
                <AlphaButton variant="ghost" color="gray" size="1">
                  Followers
                </AlphaButton>
              </FollowerDialog>
              <Text size="6" style={css({ color: "var(--white-a12)" })}>
                {profile ? profile.Followers?.length : 0}
              </Text>{" "}
            </Flex>
            <StyledSeparator
              orientation="vertical"
              size="2"
              style={css({
                backgroundColor: "var(--white-a5)",
              })}
            />
            <Flex direction="column" align="start" gap="1">
              <FollowerDialog profile={profile} followerTab="following">
                <AlphaButton variant="ghost" color="gray" size="1">
                  Following
                </AlphaButton>
              </FollowerDialog>
              <Text size="6" weight="medium" style={css({ color: "var(--white-a12)" })}>
                {profile ? profile.Following?.length : 0}
              </Text>{" "}
            </Flex>
          </Flex>
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
            <Releases address={address} />
          </TabsContent>

          <TabsContent value="collection">
            <Collection address={address} />
          </TabsContent>

          <TabsContent value="likes">
            <Likes address={address} />
          </TabsContent>
        </Box>
      </TabsRoot>
    </Flex>
  );
};
