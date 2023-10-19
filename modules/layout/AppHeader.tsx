import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { styled } from "@/stitches.config";
import { ConnectWallet, useConnect } from "arweave-wallet-ui-test";
import { Link, useLocation } from "react-router-dom";
import { Image } from "@/ui/Image";
import { SearchBar } from "../search/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/getProfile";
import { HeaderDropdown } from "./HeaderDropdown";
import { useTheme } from "next-themes";

const NavLink = styled(Link, {
  display: "flex",
  gap: "$2",
  fontSize: "$3",
  alignItems: "center",
  p: "$2",
  color: "$slate11",

  "&:hover": {
    color: "$slate12",
  },

  variants: {
    selected: {
      true: {
        color: "$slate12",
      },
    },
  },
});

export const AppHeader = () => {
  const { walletAddress } = useConnect();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const { data: account, isError } = useQuery({
    queryKey: [`profile-${walletAddress}`],
    queryFn: () => {
      if (!walletAddress) {
        throw new Error("No profile has been found");
      }

      return getProfile(walletAddress);
    },
  });

  const toggleTheme = () => {
    resolvedTheme === "dark" ? setTheme("light") : setTheme("dark");
  };

  let src;

  switch (resolvedTheme) {
    case "dark":
      src = "arcadia_logo_text_white.svg";
      break;
    default:
      src = "arcadia_logo_text_black.svg";
      break;
  }

  return (
    <Flex
      as="header"
      css={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        py: "$3",
        px: "$10",
        mb: location.pathname === "/profile" ? 0 : "$20",
      }}
      justify="between"
      align="center"
    >
      <Flex gap="10" align="center">
        <Link
          to={{
            pathname: "/",
          }}
        >
          <Image
            src="arcadia_logo_text_white.svg"
            css={{
              width: 94,
              height: 17,
            }}
          />
        </Link>
        <SearchBar />
      </Flex>
      <Flex as="nav" gap="5" justify="center">
        <NavLink selected={location.pathname === "/"} to={"/"}>
          discover
        </NavLink>
        {/* <NavLink selected={location.pathname === "/upload"} to={"/upload"}>
          upload
        </NavLink> */}
        <NavLink selected={location.pathname === "/profile"} to={"/profile"}>
          profile
        </NavLink>
      </Flex>
      <Flex align="center" justify="end" gap="2">
        {/* <IconButton
          css={{
            backgroundColor: "transparent",

            "&:hover": {
              backgroundColor: "transparent",
              color: "$slate12",
            },
            "&:active": {
              backgroundColor: "transparent",
            },
          }}
          onClick={toggleTheme}
        >
          <BsSun />
        </IconButton> */}
        {walletAddress ? (
          <HeaderDropdown walletAddress={walletAddress} account={account} />
        ) : (
          <ConnectWallet
            permissions={[
              "ACCESS_ADDRESS",
              "DISPATCH",
              "SIGN_TRANSACTION",
              "ACCESS_ARWEAVE_CONFIG",
              "ACCESS_PUBLIC_KEY",
            ]}
            options={{
              connectButtonVariant: "ghost",
              connectButtonLabel: "connect wallet",
              connectButtonStyles: {
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "$slate12",
                },
              },
            }}
            appName="Arcadia"
          >
            <Button
              css={{
                fontWeight: 400,
                fontSize: "$3",
              }}
              variant="transparent"
            >
              connect wallet
            </Button>
          </ConnectWallet>
        )}
      </Flex>
    </Flex>
  );
};
