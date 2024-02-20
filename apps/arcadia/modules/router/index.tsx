import { HashRouter, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { AppHeader } from "../layout/AppHeader";
import { Discover } from "../discover";
import { Profile } from "../profile";
import { Box } from "@/ui/Box";
import { Track } from "../track";
import { appConfig } from "@/apps/arcadia/appConfig";
import { Search } from "../search";
import { AudioPlayer } from "../audioPlayer/AudioPlayer";
import { Album } from "../album";

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
          // maxWidth: 920,
        },
        "@bp4": {
          // backgroundColor: "$blue3",
          // maxWidth: 1200,
        },
        "@bp5": {
          // backgroundColor: "$red3",
          // maxWidth: 1400,
        },

        pb: appConfig.playerMaxHeight + 20,
      }}
    >
      <Routes>
        <Route path={"/"} element={<Discover />} />
        <Route path={"/profile"} element={<Profile />} />
        <Route path={"/track"} element={<Track />} />
        <Route path={"/album"} element={<Album />} />
        <Route path={"/search"} element={<Search />} />
      </Routes>
      <AudioPlayer />
    </Box>
  </HashRouter>
);
