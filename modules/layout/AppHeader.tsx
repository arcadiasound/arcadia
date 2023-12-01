import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { styled } from "@/stitches.config";
import { Link, useLocation } from "react-router-dom";
import { Image } from "@/ui/Image";
import { SearchBar } from "../search/SearchBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/lib/getProfile";
import { HeaderDropdown } from "./HeaderDropdown";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ConnectWallet } from "./components/ConnectWallet";
import { useConnect } from "@/hooks/useConnect";
import { IconButton } from "@/ui/IconButton";
import { BsSun } from "react-icons/bs";

const NavLink = styled(Link, {
  display: "flex",
  gap: "$2",
  fontSize: "$3",
  alignItems: "center",
  p: "$2",
  px: "$3",
  color: "$neutralInvertedA11",
  br: "$pill",

  "&:hover": {
    backgroundColor: "$neutralInvertedA3",
    color: "$neutralInvertedA12",
  },

  variants: {
    selected: {
      true: {
        color: "$neutralInvertedA12",
      },
    },
  },
});

export const AppHeader = () => {
  const { walletAddress } = useConnect();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (walletAddress) {
      queryClient.invalidateQueries([`profile-${walletAddress}`]);
    }
  }, [walletAddress]);

  const { data: account, isError } = useQuery({
    queryKey: [`profile-${walletAddress}`],
    enabled: !!walletAddress,
    queryFn: () => {
      if (!walletAddress) {
        return;
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
        zIndex: 1,
        position: "fixed",
        top: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        py: "$3",
        px: "$10",
        backgroundColor: "$neutralA11",
        backdropFilter: "blur(12px)",
        backfaceVisibility: "hidden",
        "-webkit-backface-visibility": "hidden",
        "-webkit-transform": "translate3d(0,0,0)",
        width: "100%",
        borderBottom: "1px solid $colors$neutralInvertedA3",
        // mb: location.pathname === "/profile" ? 0 : "$20",
      }}
      align="center"
    >
      <Flex gap="10" align="center">
        <Link
          to={{
            pathname: "/",
          }}
        >
          <Image
            src={src}
            css={{
              width: 94,
              height: 17,
            }}
          />
        </Link>
      </Flex>
      <SearchBar />
      {/* <Flex as="nav" gap="5" justify="center">
        <NavLink selected={location.pathname === "/"} to={"/"}>
          discover
        </NavLink>
        <NavLink selected={location.pathname === "/profile"} to={"/profile"}>
          profile
        </NavLink>
      </Flex> */}
      <Flex align="center" justify="end" gap="2">
        <IconButton
          css={{
            backgroundColor: "transparent",
            color: "$neutralInvertedA11",

            "&:hover": {
              backgroundColor: "transparent",
              color: "$neutralInvertedA12",
            },
            "&:active": {
              backgroundColor: "transparent",
            },
          }}
          onClick={toggleTheme}
        >
          <BsSun />
        </IconButton>
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
            appName="Arcadia"
          >
            <Button
              css={{
                fontWeight: 400,
                fontSize: "$3",
                color: "$neutralInvertedA11",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "$neutralInvertedA12",
                },
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
