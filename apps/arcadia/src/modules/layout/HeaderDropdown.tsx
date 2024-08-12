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
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  Switch,
  Text,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useConnection } from "arweave-wallet-kit";
import { Link as RouterLink } from "react-router-dom";
import { BsCheck, BsCopy, BsPlugFill } from "react-icons/bs";
import Avvvatars from "avvvatars-react";
import { abbreviateAddress, gateway } from "@/utils";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useQuery } from "@tanstack/react-query";
import { getArBalance } from "@/lib/user/getArBalance";
import { useState } from "react";
import { useTheme } from "next-themes";
import { getUBalance } from "@/lib/user/getUBalance";
import { MdDarkMode } from "react-icons/md";
import { stampsBalance } from "@/lib/stamps";
import BigNumber from "bignumber.js";

const StyledSwitch = styled(Switch);

const StyledAvatar = styled(Avatar);
const AVATAR_SIZE = 28;
const AVATAR_RADIUS = `max(var(--radius-1), var(--radius-full) * 0.8)`;

const StyledDropdownMenuItem = styled(DropdownMenuItem, {
  justifyContent: "start",
  gap: "var(--space-2)",
});

type Token = "ar" | "u" | "stamp";

interface HeaderDropdownProps {
  address: string;
}

export const HeaderDropdown = (props: HeaderDropdownProps) => {
  const { disconnect } = useConnection();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { theme, setTheme } = useTheme();
  const [token, setToken] = useState<Token>("ar");
  const { address } = props;

  const { data: profile } = useGetUserProfile({ address });

  if (!props.address) {
    return null;
  }

  const avatarUrl = gateway() + "/" + profile?.Info?.avatar;

  const { data: arBalance } = useQuery({
    queryKey: ["arBalance", props.address],
    queryFn: () => getArBalance(props.address),
    enabled: token === "ar",
  });

  const { data: uBalance } = useQuery({
    queryKey: ["uBalance", props.address],
    queryFn: () => getUBalance(props.address),
    enabled: token === "u",
  });

  const { data: stampBalance } = useQuery({
    queryKey: ["stampBalance", props.address],
    queryFn: async () => {
      const balance = (await stampsBalance(props.address)) / 1e12;
      return BigNumber(balance);
    },
    enabled: token === "stamp",
  });

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <IconButton m="2" variant="ghost" color="gray" size="1">
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
      <DropdownMenuContent sideOffset={4} loop style={css({ minWidth: 220 })}>
        <StyledDropdownMenuItem
          css={{
            cursor: "pointer",
            height: "max-content",
            paddingBlock: "var(--space-2)",
            marginBlockEnd: "var(--space-1)",
            "&[data-highlighted]": {
              backgroundColor: "var(--gray-a4)",
              color: "var(--gray-12)",
            },
          }}
          asChild
        >
          <RouterLink to={"/profile"} state={{ prevPage: location.pathname }}>
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
                {profile?.Info?.name || abbreviateAddress({ address: props.address })}
              </Text>
            </Flex>
          </RouterLink>
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem
          css={{
            height: "max-content",
            paddingBlock: "var(--space-2)",
            boxShadow: "0 0 0 1px var(--gray-a6)",
            marginBlockEnd: "var(--space-2)",
            alignItems: "start",
            justifyContent: "space-between",
            gap: "var(--space-5)",

            "&[data-highlighted]": {
              boxShadow: "none",
            },
          }}
        >
          <Flex direction="column">
            <Text size="1">Wallet balance</Text>
            {token === "ar" && (
              <Text size="4" weight="medium">
                {arBalance && Number(arBalance.toFixed(3)) > 0 ? arBalance.toFixed(3) : "0"} AR
              </Text>
            )}
            {token === "u" && (
              <Text size="4" weight="medium">
                {uBalance && Number(uBalance.toFixed(3)) > 0 ? uBalance.toFixed(3) : "0"} U
              </Text>
            )}
            {token === "stamp" && (
              <Text size="4" weight="medium">
                {stampBalance && Number(stampBalance.toFixed(3)) > 0
                  ? stampBalance.toFixed(3)
                  : "0"}{" "}
                STAMP
              </Text>
            )}
          </Flex>
          <SelectRoot
            size="1"
            defaultValue={token}
            onValueChange={(value) => setToken(value as Token)}
          >
            <SelectTrigger variant="classic" />
            <SelectContent>
              <SelectItem value="ar">AR</SelectItem>
              <SelectItem value="u">U</SelectItem>
              <SelectItem value="stamp">STAMP</SelectItem>
            </SelectContent>
          </SelectRoot>
        </StyledDropdownMenuItem>
        {/* <StyledDropdownMenuItem asChild style={css({ cursor: "pointer" })}>
          <RouterLink to={"/settings"}>
            <IoMdSettings />
            Settings
          </RouterLink>
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem asChild style={css({ cursor: "pointer" })}>
          <a href={appConfig.links.discord}>
            <BsQuestionCircleFill />
            Help
          </a>
        </StyledDropdownMenuItem>
        <DropdownMenuSeparator style={css({ marginInline: 0 })} /> */}
        <StyledDropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            copyToClipboard(props.address);
          }}
        >
          {isCopied ? <BsCheck /> : <BsCopy />}
          {isCopied ? "Copied!" : "Copy Address"}
        </StyledDropdownMenuItem>
        <StyledDropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setTheme(theme === "light" ? "dark" : "light");
          }}
          style={css({ justifyContent: "space-between" })}
          css={{
            "&[data-highlighted]": {
              backgroundColor: "var(--gray-a4)",
              color: "var(--gray-a12)",
            },
          }}
        >
          <Flex align="center" gap="2">
            <MdDarkMode />
            Dark mode
          </Flex>
          <StyledSwitch
            checked={theme === "dark"}
            css={{
              '&[data-state="checked"]': {
                backgroundColor: theme === "dark" ? "var(--gray-1)" : undefined,
              },
            }}
          />
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
