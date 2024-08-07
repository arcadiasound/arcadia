import { Box, Button, Flex, Grid, Link } from "@radix-ui/themes";
import { css } from "../../styles/css";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
import { Link as HashLink, useLocation } from "react-router-dom";
import { HeaderDropdown } from "./HeaderDropdown";
import { styled } from "@stitches/react";
import AppLogo from "@/assets/icons/AppLogo";

const StyledList = styled("ul", {
  display: "flex",

  "& svg": {
    fontSize: "var(--font-size-5)",
  },
});

interface NavItemProps {
  path: string;
  active: boolean;
  children: React.ReactNode;
}

const NavItem = (props: NavItemProps) => (
  <li>
    <Link asChild>
      <HashLink to={props.path}>
        <Flex
          gap="2"
          align="center"
          py="2"
          px="3"
          style={css({
            alignSelf: "stretch",
            color: props.active ? "var(--slate-12)" : "var(--slate-11)",

            "&:hover": {
              // backgroundColor: "var(--slate-3)",
              color: "var(--slate-12)",
            },
          })}
        >
          {props.children}
        </Flex>
      </HashLink>
    </Link>
  </li>
);

export const AppHeader = () => {
  const { connected, connect, disconnect } = useConnection();
  const { pathname } = useLocation();
  const address = useActiveAddress();

  return (
    <Grid
      columns="1fr 1fr 1fr"
      align="center"
      p="3"
      asChild
      style={css({
        backgroundColor: "var(--gray-2)",
        width: "100%",
        // height: appConfig.headerMaxHeight,
      })}
    >
      <header>
        <Link
          ml="3"
          style={css({
            color: "var(--slate-12)",
            display: "grid",
            placeItems: "center",
            justifySelf: "start",
          })}
          asChild
        >
          <HashLink to={"/"}>
            <AppLogo />
          </HashLink>
        </Link>
        <Flex justify="center" gap="3" asChild>
          <nav style={css({ width: "100%" })}>
            <StyledList>
              <NavItem path="/" active={pathname === "/"}>
                Home
              </NavItem>
              {/* <NavItem path="/search" active={pathname === "/search"}>
                  {pathname === "/search" ? <RiSearchFill /> : <RiSearchLine />}
                  Search
                </NavItem> */}
              {address && (
                <NavItem path="/library" active={pathname === "/library"}>
                  Library
                </NavItem>
              )}
            </StyledList>
          </nav>
        </Flex>
        <Box style={{ justifySelf: "end" }}>
          {connected && address ? (
            <HeaderDropdown address={address} />
          ) : (
            // we still check in case of unlikely scenario that we are connected but no active address
            <Button variant="ghost" onClick={connected ? disconnect : connect} color="gray">
              {connected ? "Sign out" : "Sign in"}
            </Button>
          )}
        </Box>
      </header>
    </Grid>
  );
};
