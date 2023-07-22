import { HashRouter, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { Discover } from "../discover";
import { Library } from "../library";
import { Upload } from "../upload";
import { Box } from "@/components/Box";

export const AppRouter = () => (
  <HashRouter>
    <AppHeader />
    <Box
      css={{
        maxWidth: "100%",
        px: "$5",
        mx: "auto",

        "@bp3": {
          maxWidth: 800,
        },
        "@bp4": {
          maxWidth: 1000,
        },
        "@bp5": {
          maxWidth: 1320,
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
