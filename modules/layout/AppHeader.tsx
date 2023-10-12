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
  const { profile, walletAddress } = useConnect();
  const location = useLocation();

  // useEffect(() => {
  //   if (location) {
  //     console.log(location);
  //   }
  // }, [location]);

  return (
    <Flex
      as="header"
      css={{
        py: "$3",
        px: "$10",
        mb: "$20",
      }}
      justify="between"
      align="center"
    >
      <Image
        src="arcadia_logo_text_white.svg"
        css={{
          width: 94,
          height: 17,
        }}
      />
      <Flex as="nav" gap="5">
        <NavLink selected={location.pathname === "/"} to={"/"}>
          discover
        </NavLink>
        {/* <NavLink selected={location.pathname === "/upload"} to={"/upload"}>
          upload
        </NavLink> */}
        <NavLink selected={location.pathname === "/profile"} to={"/library"}>
          profile
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
