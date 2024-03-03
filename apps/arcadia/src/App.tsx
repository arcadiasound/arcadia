import { Home } from "./modules/home";
import { Flex, Grid, ScrollArea } from "@radix-ui/themes";
import { HashRouter, Routes, Route } from "react-router-dom";
import { appConfig } from "@/config";
import { css } from "./styles/css";
import { AudioPlayer } from "./modules/player/AudioPlayer";
import { AppHeader } from "./modules/layout/AppHeader";
import { Sidebar } from "./modules/layout/Sidebar";
import { Profile } from "./modules/profile";
import { Track } from "./modules/track";

function App() {
  return (
    <HashRouter>
      <Flex
        direction="column"
        justify="between"
        style={css({
          height: "100vh",
        })}
      >
        <Grid columns="fit-content(420px) 1fr" style={css({ flex: 1, overflow: "hidden" })}>
          <Sidebar />
          <Grid rows="auto 1fr">
            <AppHeader />
            <ScrollArea
              scrollbars="vertical"
              style={css({
                height: `calc(100dvh - ${appConfig.playerMaxHeight + appConfig.headerMaxHeight}px)`,
              })}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/track" element={<Track />} />
              </Routes>
            </ScrollArea>
          </Grid>
        </Grid>
        <AudioPlayer />
      </Flex>
    </HashRouter>
  );
}

export default App;
