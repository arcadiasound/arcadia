import AppLogo from "@/assets/icons/AppLogo";
import { css } from "@/styles/css";
import { Box, Flex, Link, ScrollArea } from "@radix-ui/themes";
import { GoHome, GoHomeFill } from "react-icons/go";
import { RiSearchLine, RiSearchFill } from "react-icons/ri";
import { appConfig } from "@/config";
import { styled } from "@stitches/react";
import { Link as HashLink, useLocation } from "react-router-dom";
import { MdLibraryMusic, MdOutlineLibraryMusic } from "react-icons/md";
import { useActiveAddress } from "arweave-wallet-kit";

const StyledList = styled("ul", {
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

export const Sidebar = () => {
  const { pathname } = useLocation();
  const address = useActiveAddress();

  return (
    <Box
      py="3"
      pr="5"
      style={css({
        minWidth: 240,
        backgroundColor: "var(--side-panel-background)",
      })}
    >
      <ScrollArea
        scrollbars="vertical"
        style={css({
          padding: "var(--space-1)",
        })}
      >
        <Flex
          style={css({
            height: "100%",
          })}
          direction="column"
          align="start"
        >
          <Link
            ml="3"
            style={css({
              color: "var(--slate-12)",
              display: "grid",
              placeItems: "center",
            })}
            asChild
          >
            <HashLink to={"/"}>
              <AppLogo />
            </HashLink>
          </Link>

          <Flex direction="column" gap="3" mt="7" asChild>
            <nav style={css({ width: "100%" })}>
              <StyledList>
                <NavItem path="/" active={pathname === "/"}>
                  {pathname === "/" ? <GoHomeFill /> : <GoHome />}
                  Home
                </NavItem>
                <NavItem path="/search" active={pathname === "/search"}>
                  {pathname === "/search" ? <RiSearchFill /> : <RiSearchLine />}
                  Search
                </NavItem>
                {address && (
                  <NavItem path="/library" active={pathname === "/library"}>
                    {pathname === "/library" ? <MdLibraryMusic /> : <MdOutlineLibraryMusic />}
                    Library
                  </NavItem>
                )}
              </StyledList>
            </nav>
          </Flex>
        </Flex>
      </ScrollArea>
    </Box>
  );
};
