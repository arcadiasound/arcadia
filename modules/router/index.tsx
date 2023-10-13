import { HashRouter, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { Discover } from "../discover";
import { Library } from "../library";
import { Upload } from "../upload";
import { Box } from "@/ui/Box";

export const AppRouter = () => (
  <HashRouter>
    <AppHeader />
    <Box
      css={{
        // backgroundColor: "$green3",
        maxWidth: "100%",
        px: "$5",
        mx: "auto",

        "@bp3": {
          px: 0,
          // backgroundColor: "$yellow3",
          maxWidth: 920,
        },
        "@bp4": {
          // backgroundColor: "$blue3",
          maxWidth: 1200,
        },
        "@bp5": {
          // backgroundColor: "$red3",
          maxWidth: 1400,
        },
      }}
    >
      <Routes>
        <Route path={"/"} element={<Discover />} />
        <Route path={"/library"} element={<Library />} />
        <Route path={"/upload"} element={<Upload />} />
      </Routes>
    </Box>
  </HashRouter>
);
