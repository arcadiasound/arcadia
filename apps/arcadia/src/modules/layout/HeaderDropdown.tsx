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
import { Link } from "react-router-dom";
import { BsCheck, BsCopy, BsPlugFill, BsQuestionCircleFill } from "react-icons/bs";
import Avvvatars from "avvvatars-react";
import { abbreviateAddress, gateway } from "@/utils";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { IoMdSettings } from "react-icons/io";

const StyledAvatar = styled(Avatar);
const AVATAR_SIZE = 28;
const AVATAR_RADIUS = `max(var(--radius-1), var(--radius-full) * 0.8)`;

const StyledDropdownMenuItem = styled(DropdownMenuItem, {
  justifyContent: "start",
  gap: "var(--space-2)",
});

interface HeaderDropdownProps {
  address: string;
}

export const HeaderDropdown = (props: HeaderDropdownProps) => {
  const { disconnect } = useConnection();
  const { data } = useGetUserProfile({ address: props.address });
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  if (!props.address) {
    return null;
  }

  const profile = data?.profiles.length ? data.profiles[0] : undefined;
  const avatarUrl = gateway() + "/" + profile?.avatarId;

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <IconButton variant="ghost" color="gray" size="1">
          <StyledAvatar
            size="1"
            src={avatarUrl}
            fallback={
              <Avvvatars style="shape" value={props.address} size={AVATAR_SIZE} radius={0} />
            }
            style={css({
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_RADIUS,
              overflow: "hidden",
            })}
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
      <DropdownMenuContent sideOffset={4} loop style={css({ minWidth: 200 })}>
        <StyledDropdownMenuItem
          css={{
            cursor: "pointer",
            height: "max-content",
            paddingBlock: "var(--space-2)",
            marginBlockEnd: "var(--space-1)",
            "&[data-highlighted]": {
              backgroundColor: "var(--gray-4)",
              color: "var(--gray-12)",
            },
          }}
          asChild
        >
          <Link to={"/profile"} state={{ prevPage: location.pathname }}>
            <StyledAvatar
              size="2"
              src={avatarUrl}
              fallback={
                <Avvvatars style="shape" value={props.address} size={AVATAR_SIZE} radius={0} />
              }
              style={css({
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_RADIUS,
                overflow: "hidden",
              })}
              css={{
                ".rt-AvatarFallback > div": {
                  borderRadius: 0,
                },
              }}
            />
            <Flex direction="column">
              <Text
                size="3"
                weight="medium"
                style={css({
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "15ch",
                })}
              >
                {profile?.name || abbreviateAddress({ address: props.address })}
              </Text>
            </Flex>
          </Link>
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            copyToClipboard(props.address);
          }}
        >
          {isCopied ? <BsCheck /> : <BsCopy />}
          {isCopied ? "Copied!" : "Copy Address"}
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem>
          <IoMdSettings />
          Settings
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem>
          <BsQuestionCircleFill />
          Help
        </StyledDropdownMenuItem>
        <DropdownMenuSeparator style={css({ marginInline: 0 })} />
        <StyledDropdownMenuItem onSelect={disconnect}>
          <BsPlugFill />
          Disconnect
        </StyledDropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
