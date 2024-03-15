import { Button, Flex, IconButton } from "@radix-ui/themes";
import { css } from "../../styles/css";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import { HeaderDropdown } from "./HeaderDropdown";
import { useEffect, useState } from "react";
import { styled } from "@stitches/react";
import { appConfig } from "@/config";

const AlphaIconButton = styled(IconButton, {
  backgroundColor: "var(--black-a5)",
  color: "var(--white-a11)",

  "&:hover:not(:disabled)": {
    backgroundColor: "var(--black-a6)",
  },

  "&:active": {
    backgroundColor: "var(--black-a7)",
  },

  "&:disabled": {
    backgroundColor: "var(--black-a2)",
    color: "var(--white-a9)",
  },
});

export const AppHeader = () => {
  const { connected, connect, disconnect } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const address = useActiveAddress();

  return (
    <Flex
      style={css({
        width: "100%",
        height: appConfig.headerMaxHeight,
      })}
      align="center"
      justify="between"
      p="4"
      asChild
    >
      <header style={css({ backgroundColor: connected ? "var(--gray-2)" : "var(--gray-2)" })}>
        <Flex gap="2">
          <AlphaIconButton
            disabled={!location.state?.prevPage}
            variant="soft"
            size="1"
            onClick={() => navigate(-1)}
          >
            <RxChevronLeft />
          </AlphaIconButton>
          <AlphaIconButton
            disabled={!location.state?.prevPage}
            variant="soft"
            size="1"
            onClick={() => navigate(1)}
          >
            <RxChevronRight />
          </AlphaIconButton>
        </Flex>
        {connected && address ? (
          <HeaderDropdown address={address} />
        ) : (
          // we still check in case of unlikely scenario that we are connected but no active address
          <Button variant="ghost" onClick={connected ? disconnect : connect} color="gray">
            {connected ? "Sign out" : "Sign in"}
          </Button>
        )}
      </header>
    </Flex>
  );
};
