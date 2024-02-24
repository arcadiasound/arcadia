import { Button, Flex, IconButton } from "@radix-ui/themes";
import { css } from "../../styles/css";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import { HeaderDropdown } from "./HeaderDropdown";
import { useEffect, useState } from "react";

export const AppHeader = () => {
  const { connected, connect, disconnect } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const address = useActiveAddress();

  useEffect(() => {
    console.log(location);
  }, [location]);

  return (
    <Flex
      style={css({
        width: "100%",
      })}
      align="center"
      justify="between"
      p="4"
      asChild
    >
      <header>
        <Flex gap="2">
          <IconButton
            disabled={!location.state?.prevPage}
            variant="soft"
            color="gray"
            size="1"
            onClick={() => navigate(-1)}
          >
            <RxChevronLeft />
          </IconButton>
          <IconButton
            disabled={!location.state?.prevPage}
            variant="soft"
            color="gray"
            size="1"
            onClick={() => navigate(1)}
          >
            <RxChevronRight />
          </IconButton>
        </Flex>
        {connected ? (
          <HeaderDropdown address={address} />
        ) : (
          // we still check in case of unlikely scenario that we are connected but no active address
          <Button variant="ghost" onClick={connected ? disconnect : connect} color="gray">
            {connected ? "Disconnect" : "Connect"}
          </Button>
        )}
      </header>
    </Flex>
  );
};
