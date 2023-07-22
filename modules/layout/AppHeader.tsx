import { Box } from "@/components/Box";
import { Button } from "@/components/Button";
import { Flex } from "@/components/Flex";
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
import { Image } from "@/components/Image";

const NavLink = styled(Link, {
  display: "flex",
  gap: "$2",
  fontSize: "$3",
  alignItems: "center",
  py: "$3",
  px: "$5",
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
  const { profile, walletAddress } = useConnect();
  const location = useLocation();

  useEffect(() => {
    if (location) {
      console.log(location);
    }
  }, [location]);

  return (
    <Flex
      as="header"
      css={{
        p: "$5",
        mb: "$10",
      }}
      justify="between"
      align="center"
    >
      <Image
        src="arcade-logo-text.svg"
        css={{
          width: 160,
          height: 24,
        }}
      />
      <Flex as="nav" gap="10">
        <NavLink selected={location.pathname === "/"} to={"/"}>
          {location.pathname === "/" ? <BsDiscFill /> : <BsDisc />}
          Discover
        </NavLink>
        <NavLink selected={location.pathname === "/library"} to={"/library"}>
          {location.pathname === "/library" ? (
            <BsCollectionFill />
          ) : (
            <BsCollection />
          )}
          Library
        </NavLink>
        <NavLink selected={location.pathname === "/upload"} to={"/upload"}>
          {location.pathname === "/upload" ? (
            <BsCloudUploadFill />
          ) : (
            <BsCloudUpload />
          )}
          Upload
        </NavLink>
      </Flex>
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
  );
};
