import { abbreviateAddress, userPreferredGateway } from "../../utils";
import { RxChevronDown, RxChevronLeft, RxDotFilled } from "react-icons/rx";
import { BsPlug } from "react-icons/bs";
import { useState } from "react";
import { appConfig } from "../../appConfig";
import { ArAccount } from "arweave-account";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSubContent,
  DropdownMenuSubRoot,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/Dropdown";
import { Button } from "@/ui/Button";
import { Avatar, AvatarImage } from "@/ui/Avatar";
import { Flex } from "@/ui/Flex";
import { Link } from "react-router-dom";
import { styled } from "@/stitches.config";
import { useConnect } from "@/hooks/useConnect";

const StyledLink = styled(Link);

interface HeaderDropdownProps {
  account: ArAccount | undefined;
  walletAddress: string;
}

export const HeaderDropdown = ({
  account,
  walletAddress,
}: HeaderDropdownProps) => {
  const { setState } = useConnect();
  const [currentGateway, setCurrentGateway] = useState(
    userPreferredGateway || appConfig.defaultGateway
  );

  const handleGatewaySwitch = (gateway: string) => {
    const url = `https://${gateway}`;
    localStorage.setItem("gateway", url);
    setCurrentGateway(url);
  };

  const name =
    account && account.profile.name
      ? account.profile.name
      : abbreviateAddress({ address: account?.addr || walletAddress });
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <Button
          css={{
            fontWeight: 400,
            color: "$neutralInvertedA11",

            "&:hover": {
              backgroundColor: "$neutralInvertedA2",
              color: "$neutralInvertedA12",
            },
            "&:active": { backgroundColor: "transparent" },
          }}
          variant="ghost"
        >
          <Avatar size="1">
            <AvatarImage
              src={
                account &&
                account?.profile.avatarURL !== appConfig.accountAvatarDefault
                  ? account.profile.avatarURL
                  : `https://source.boringavatars.com/marble/40/${
                      account?.addr || walletAddress
                    }`
              }
            />
          </Avatar>
          {name}
          <RxChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          css={{
            minWidth: 200,

            '[role="menuitem"]': {
              py: "$3",
            },
          }}
          sideOffset={8}
          collisionPadding={8}
        >
          <DropdownMenuItem asChild>
            <StyledLink
              css={{
                cursor: "pointer",
              }}
              role="menuitem"
              to={{
                pathname: "profile",
                search: `?addr=${walletAddress}`,
              }}
            >
              <Flex align="center" gap="2">
                View Profile
              </Flex>
            </StyledLink>
          </DropdownMenuItem>
          <DropdownMenuSubRoot>
            <DropdownMenuSubTrigger>
              <Flex align="center" gap="2">
                <RxChevronLeft />
                Switch gateway
              </Flex>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                css={{
                  minWidth: 200,

                  '[role="menuitem"]': {
                    py: "$3",
                  },
                }}
                // variant="compact"
                sideOffset={8}
              >
                <DropdownMenuItem
                  css={{
                    color:
                      currentGateway === "https://arweave.net"
                        ? "$green11"
                        : "$slate12",
                  }}
                  onClick={() => handleGatewaySwitch("arweave.net")}
                >
                  arweave.net
                  {currentGateway === "https://arweave.net" && <RxDotFilled />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  css={{
                    color:
                      currentGateway === "https://g8way.io"
                        ? "$green11"
                        : "$slate12",
                  }}
                  onClick={() => handleGatewaySwitch("g8way.io")}
                >
                  g8way.io
                  {currentGateway === "https://g8way.io" && <RxDotFilled />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  css={{
                    color:
                      currentGateway === "https://ar-io.dev"
                        ? "$green11"
                        : "$slate",
                  }}
                  onClick={() => handleGatewaySwitch("ar-io.dev")}
                >
                  ar-io.dev
                  {currentGateway === "https://ar-io.dev" && <RxDotFilled />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSubRoot>

          <DropdownMenuItem
            onClick={() => {
              window.arweaveWallet.disconnect().then(() => {
                setState({ walletAddress: "" });
              });
            }}
          >
            <Flex align="center" gap="2">
              <BsPlug />
              Disconnect
            </Flex>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
