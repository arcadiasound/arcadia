import { useFollowUser, useGetUserProfile, useIsUserMe } from "@/hooks/appData";
import { getProfileProcess } from "@/lib/user/profile";
import { css } from "@/styles/css";
import { AOProfile } from "@/types";
import { abbreviateAddress, gateway } from "@/utils";
import {
  Avatar,
  Box,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Flex,
  Grid,
  IconButton,
  Inset,
  Link,
  Separator,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import Avvvatars from "avvvatars-react";
import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Link as RouterLink, useLocation } from "react-router-dom";

const FollowCount = styled(Box, {
  display: "grid",
  placeItems: "center",
  borderRadius: "9999px",
  marginLeft: "var(--space-1)",
  padding: "0 var(--space-1)",
  backgroundColor: "var(--gray-5)",
  color: "var(--gray-12)",
  minWidth: 20,
  fontSize: "var(--font-size-1)",
  fontWeight: "500",
});

const StyledTabsRoot = styled(TabsRoot, {
  ".rt-TabsList": {
    marginLeft: "var(--space-4)",
    boxShadow: "none",
    // backgroundColor: "var(--gray-3)",
    width: "max-content",
    height: 36,
    borderRadius: `max(var(--radius-1), var(--radius-full))`,
  },

  ".rt-TabsContent": {
    padding: "var(--space-4)",
  },

  ".rt-TabsTrigger": {
    paddingInline: "var(--space-1)",
  },

  ".rt-TabsTrigger:where([data-state='active'])::before": {
    height: 0,
  },

  ".rt-TabsTrigger:where([data-state='active'])": {
    ".rt-TabsTriggerInner": {
      backgroundColor: "var(--gray-3)",
      color: "var(--gray-12)",
      fontWeight: "medium",
    },
  },

  ".rt-TabsTriggerInner, .rt-TabsTriggerInnerHidden": {
    paddingLeft: "var(--space-3)",
    paddingRight: "var(--space-1)",
    borderRadius: `max(var(--radius-1), var(--radius-full))`,
  },
});

type FollowerTab = "followers" | "following";

interface FollowerDialogProps {
  profile: AOProfile | undefined;
  children: React.ReactNode;
  followerTab: FollowerTab;
}

export const FollowerDialog = (props: FollowerDialogProps) => {
  const { profile } = props;
  const [open, setOpen] = useState(false);
  const [followerTab, setFollowerTab] = useState<FollowerTab>(props.followerTab);
  const connectedAddress = useActiveAddress();

  if (!profile) {
    return null;
  }

  const { data: profileMeProcess, isSuccess: profileMeProcessSuccess } = useQuery({
    queryKey: ["process", connectedAddress, { type: "profile" }],
    queryFn: () => getProfileProcess(connectedAddress),
    enabled: !!connectedAddress,
  });

  const processIdMe =
    profileMeProcess && profileMeProcess[0]?.node.id ? profileMeProcess[0].node.id : undefined;

  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent
        style={css({
          position: "relative",
          minHeight: 500,
          maxWidth: 500,
          overflow: "hidden",
          padding: "var(--space-4)",
        })}
        aria-describedby={undefined} // - a11y
      >
        <VisuallyHidden>
          <DialogTitle>{followerTab === "followers" ? "Followers" : "Following"}</DialogTitle>
        </VisuallyHidden>

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

        <TabsRoot
          mx="-4"
          defaultValue={props.followerTab}
          onValueChange={(e) => setFollowerTab(e as FollowerTab)}
        >
          <TabsList>
            <TabsTrigger
              style={css({
                marginLeft: "var(--space-3)",
              })}
              value="followers"
            >
              Followers
              <FollowCount>{profile.Followers.length || 0}</FollowCount>
            </TabsTrigger>
            <TabsTrigger value="following">
              Following
              <FollowCount>{profile.Following.length || 0}</FollowCount>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            {profile.Followers.length > 0 ? (
              <Flex mt="2" p="3" direction="column" gap="4" asChild>
                <ul>
                  {profile.Followers.map((processId, idx) => (
                    <>
                      <Follower
                        address={profile.Owner}
                        processId={processId}
                        key={processId}
                        setOpen={setOpen}
                      />
                    </>
                  ))}
                </ul>
              </Flex>
            ) : (
              <Grid mt="5" style={css({ textAlign: "center" })}>
                No followers
              </Grid>
            )}
          </TabsContent>

          <TabsContent value="following">
            {profile.Following.length > 0 ? (
              <Flex mt="2" p="3" direction="column" gap="4" asChild>
                <ul>
                  {profile.Following.map((processId, idx) => (
                    <>
                      <Follower
                        address={profile.Owner}
                        processId={processId}
                        key={processId}
                        setOpen={setOpen}
                      />
                    </>
                  ))}
                </ul>
              </Flex>
            ) : (
              <Grid mt="5" style={css({ textAlign: "center" })}>
                No following
              </Grid>
            )}
          </TabsContent>
        </TabsRoot>
      </DialogContent>
    </DialogRoot>
  );
};

const StyledAvatar = styled(Avatar);

const AVATAR_RADIUS = `max(var(--radius-3), var(--radius-full) * 0.8)`;
const AVATAR_SIZE = 32;
const OUTLINE_OFFSET = 2;

interface FollowProps {
  address: string;
  processId: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Follower = (props: FollowProps) => {
  const { processId, address, setOpen } = props;
  const [followingText, setFollowingText] = useState<"Following" | "Unfollow">("Following");
  const connectedAddress = useActiveAddress();

  const { data: profile } = useGetUserProfile({ processId });

  const isUserMe = useIsUserMe(profile?.Owner);

  const { data: profileMeProcess, isSuccess: profileMeProcessSuccess } = useQuery({
    queryKey: ["process", connectedAddress, { type: "profile" }],
    queryFn: () => getProfileProcess(connectedAddress),
    enabled: !!connectedAddress,
  });

  const processIdMe =
    profileMeProcess && profileMeProcess[0]?.node.id ? profileMeProcess[0].node.id : undefined;

  const { data: profileMe } = useGetUserProfile({
    processId: processIdMe,
    address: connectedAddress || "",
  });

  const { follow, unfollow, isLoading } = useFollowUser({ address: profile?.Owner || "" });

  if (!profile) {
    return <Text>No profile found</Text>;
  }

  const isFollowing = () => {
    // if (isUserMe) return false;
    console.log({ profileMe });

    if (!profileMe) return false;
    if (!connectedAddress) return false;

    if (profileMe.Following.includes(processId)) {
      return true;
    } else {
      return false;
    }
  };

  const isFollower = () => {
    if (isUserMe) return false;
    if (!profile?.Following) return false;
    if (!connectedAddress) return false;

    if (profile.Following.includes(processId)) {
      return true;
    } else {
      return false;
    }
  };

  const avatarUrl = profile ? gateway() + "/" + profile.Info?.avatar : undefined;

  return (
    <Flex justify="between" align="center" asChild>
      <li>
        <Flex align="center" gap="3">
          <StyledAvatar
            src={avatarUrl}
            fallback={
              <Avvvatars style="shape" value={profile.Owner} size={AVATAR_SIZE} radius={0} />
            }
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
          <Flex direction="column">
            <Link
              onClick={() => setOpen(false)}
              size="2"
              weight="medium"
              color="gray"
              highContrast
              asChild
            >
              <RouterLink to={`/profile?addr=${profile.Owner}`}>
                {profile.Info?.name
                  ? profile.Info.name
                  : abbreviateAddress({ address: profile.Owner })}
              </RouterLink>
            </Link>
            {profile.Info?.handle && (
              <Text weight="medium" size="1" color="gray">
                @{profile.Info.handle}
              </Text>
            )}
          </Flex>
        </Flex>

        {!isUserMe && profileMe && (
          <Button
            disabled={isLoading}
            onClick={() => {
              if (!processIdMe) return;

              if (isFollowing()) {
                unfollow.mutate({ sender: processIdMe, target: processId });
              } else {
                follow.mutate({ sender: processIdMe, target: processId });
              }
            }}
            color="gray"
            highContrast
            onMouseOver={() => setFollowingText("Unfollow")}
            onMouseLeave={() => setFollowingText("Following")}
            variant={isFollowing() ? "outline" : "solid"}
            style={css({
              width: 86,
            })}
          >
            {isFollowing() ? followingText : "Follow"}
          </Button>
        )}
      </li>
    </Flex>
  );
};
