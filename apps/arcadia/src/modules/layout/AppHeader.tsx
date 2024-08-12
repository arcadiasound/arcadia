import { Box, Button, Flex, Grid, Link, Separator } from "@radix-ui/themes";
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

const StyledNavItem = styled(Flex, {
  alignSelf: "stretch",
  borderInlineStart: "1px solid var(--gray-4)",
  height: "100%",

  "&:hover": {
    color: "var(--gray-11)",
  },

  variants: {
    active: {
      true: {
        backgroundColor: "var(--gray-3)",
        color: "var(--gray-12)",
      },
    },
  },
});

interface NavItemProps {
  path: string;
  active: boolean;
  children: React.ReactNode;
  // temp
  isLast?: boolean;
}

const NavItem = (props: NavItemProps) => (
  <li>
    <Link asChild>
      <HashLink to={props.path}>
        <StyledNavItem
          gap="2"
          align="center"
          justify="center"
          px="3"
          active={props.active}
          css={{
            color: props.active ? "var(--slate-12)" : "var(--slate-11)",
            borderInlineEnd: props.isLast ? "1px solid var(--gray-4)" : undefined,
          }}
        >
          {props.children}
        </StyledNavItem>
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
      asChild
      style={css({
        backgroundColor: "var(--gray-2)",
        width: "100%",
        // height: appConfig.headerMaxHeight,
      })}
    >
      <header>
        <Link
          m="3"
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
        <Flex justify="center" gap="3" width="100%" height="100%" asChild>
          <nav>
            <StyledList>
              <NavItem path="/" active={pathname === "/"}>
                Discover
              </NavItem>
              {/* <NavItem path="/search" active={pathname === "/search"}>
                  {pathname === "/search" ? <RiSearchFill /> : <RiSearchLine />}
                  Search
                </NavItem> */}
              {address && (
                <NavItem path="/library" active={pathname === "/library"} isLast>
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
