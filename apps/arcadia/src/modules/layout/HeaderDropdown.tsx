import { appConfig } from "@/config";
import { useGetUserProfile } from "@/hooks/appData";
import { css } from "@/styles/css";
import {
  Avatar,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  IconButton,
  Text,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useConnection } from "arweave-wallet-kit";
import { Link, useLocation } from "react-router-dom";
import { BsPersonBoundingBox, BsPlugFill, BsQuestionCircleFill } from "react-icons/bs";
import Avvvatars from "avvvatars-react";

const StyledAvatar = styled(Avatar);
const AVATAR_SIZE = 24;
const AVATAR_RADIUS = `max(var(--radius-1), var(--radius-full) * 0.8)`;

const StyledDropdownMenuItem = styled(DropdownMenuItem, {
  justifyContent: "start",
  gap: "var(--space-2)",
});

interface HeaderDropdownProps {
  address: string | undefined;
}

export const HeaderDropdown = (props: HeaderDropdownProps) => {
  const { pathname } = useLocation();
  const { disconnect } = useConnection();
  const { data } = useGetUserProfile({ address: props.address });

  if (!props.address) {
    return null;
  }

  const profile = data?.profiles.length ? data[0] : undefined;

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <IconButton variant="ghost" color="gray" size="1">
          <StyledAvatar
            size="1"
            src={profile?.thumbnailSrc || ``}
            fallback={
              <Avvvatars style="shape" value={props.address} size={AVATAR_SIZE} radius={0} />
            }
            css={{
              borderRadius: AVATAR_RADIUS,
              overflow: "hidden",
              ".rt-AvatarFallback > div": {
                borderRadius: 0,
              },
            }}
          />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={6}>
        <Flex p="1" pr="7" align="center" gap="2">
          <StyledAvatar
            size="1"
            src={profile?.thumbnailSrc || ``}
            fallback={
              <Avvvatars style="shape" value={props.address} size={AVATAR_SIZE} radius={0} />
            }
            css={{
              borderRadius: AVATAR_RADIUS,
              overflow: "hidden",
              ".rt-AvatarFallback > div": {
                borderRadius: 0,
              },
            }}
          />
          <Flex direction="column">
            <Text
              size="2"
              weight="medium"
              style={css({
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                maxWidth: "16ch",
              })}
            >
              {profile?.name || props.address}
            </Text>
            {profile?.name && (
              <Text
                size="1"
                color="gray"
                style={css({
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "16ch",
                })}
              >
                {props.address}
              </Text>
            )}
          </Flex>
        </Flex>
        <DropdownMenuSeparator style={css({ marginInline: 0 })} />
        <StyledDropdownMenuItem asChild>
          <Link to={"/profile"} state={{ prevPage: location.pathname }}>
            <BsPersonBoundingBox />
            Profile
          </Link>
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem>
          <BsQuestionCircleFill />
          Help
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem onSelect={disconnect}>
          <BsPlugFill />
          Disconnect
        </StyledDropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
