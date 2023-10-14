import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { styled } from "@/stitches.config";
import { abbreviateAddress } from "@/utils";
import { ConnectWallet, useConnect } from "arweave-wallet-ui-test";
import { Link, useLocation } from "react-router-dom";
import {
  BsDisc,
  BsDiscFill,
  BsCollection,
  BsCollectionFill,
  BsCloudUpload,
  BsCloudUploadFill,
} from "react-icons/bs";
import { useEffect } from "react";
import { Image } from "@/ui/Image";
import { SearchBar } from "../search/SearchBar";
import { Box } from "@/ui/Box";

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
        <Image
          src="arcadia_logo_text_white.svg"
          css={{
            width: 94,
            height: 17,
          }}
        />
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
      <Flex justify="end">
        {walletAddress ? (
          <Button>{abbreviateAddress({ address: walletAddress })}</Button>
        ) : (
          <ConnectWallet
            permissions={[
              "ACCESS_ADDRESS",
              "DISPATCH",
              "SIGN_TRANSACTION",
              "ACCESS_ARWEAVE_CONFIG",
            ]}
            appName="Arcade"
          />
        )}
      </Flex>
    </Flex>
  );
};
