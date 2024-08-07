import { Home } from "./modules/home";
import { Flex, Grid, ScrollArea, useThemeContext } from "@radix-ui/themes";
import { HashRouter, Routes, Route } from "react-router-dom";
import { appConfig } from "@/config";
import { css } from "./styles/css";
import { AudioPlayer } from "./modules/player/AudioPlayer";
import { AppHeader } from "./modules/layout/AppHeader";
import { Sidebar } from "./modules/layout/Sidebar";
import { Profile } from "./modules/profile";
import { Track } from "./modules/track";
import { Library } from "./modules/library";
import { useEffect } from "react";
import { Settings } from "./modules/settings";

function App() {
  const { accentColor, grayColor, radius, scaling, panelBackground } = useThemeContext();

  useEffect(() => {
    if (accentColor) {
      localStorage.setItem("rt-accentColor", accentColor);
    }
  }, [accentColor]);

  useEffect(() => {
    if (grayColor) {
      localStorage.setItem("rt-grayColor", grayColor);
    }
  }, [grayColor]);

  useEffect(() => {
    if (radius) {
      localStorage.setItem("rt-radius", radius);
    }
  }, [radius]);

  useEffect(() => {
    if (panelBackground) {
      localStorage.setItem("rt-panelBackground", panelBackground);
    }
  }, [panelBackground]);

  useEffect(() => {
    if (scaling) {
      localStorage.setItem("rt-scaling", scaling);
    }
  }, [scaling]);

  return (
    <HashRouter>
      <Flex
        direction="column"
        justify="between"
        style={css({
          height: "100vh",
        })}
      >
        <Grid columns="1fr" style={css({ flex: 1, overflow: "hidden" })}>
          {/* <Sidebar /> */}
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
                <Route path="/library" element={<Library />} />
                <Route path="/settings" element={<Settings />} />
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
