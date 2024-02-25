import { Home } from "./modules/home";
import { Grid, ScrollArea } from "@radix-ui/themes";
import { HashRouter, Routes, Route } from "react-router-dom";
import { appConfig } from "@/config";
import { css } from "./styles/css";
import { AudioPlayer } from "./modules/player/AudioPlayer";
import { AppHeader } from "./modules/layout/AppHeader";
import { Sidebar } from "./modules/layout/Sidebar";
import { Profile } from "./modules/profile";

function App() {
  return (
    <HashRouter>
      <Grid rows="1fr min-content" style={css({ height: "100%" })}>
        <Grid columns="fit-content(420px) 1fr">
          <Sidebar />
          <Grid rows="auto 1fr" style={css({ paddingBlockEnd: appConfig.playerMaxHeight })}>
            <ScrollArea
              scrollbars="vertical"
              style={css({
                height: `calc(100dvh - calc(${appConfig.playerMaxHeight})`,
              })}
            >
              <AppHeader />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </ScrollArea>
          </Grid>
        </Grid>
        <AudioPlayer />
      </Grid>
    </HashRouter>
  );
}

export default App;
