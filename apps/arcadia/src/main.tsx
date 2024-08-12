import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import { AudioPlayerProvider } from "@/hooks/useAudioPlayer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Theme, ThemeOptions, ThemePanel } from "@radix-ui/themes";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import App from "./App";
import { css, hooks } from "./styles/css";
import { ThemeProvider } from "next-themes";
import { appConfig } from "./config";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <AudioPlayerProvider>
      <ThemeProvider attribute="class">
        <Theme
          appearance="inherit"
          radius={(localStorage.getItem("rt-radius") as ThemeOptions["radius"]) || "medium"}
          grayColor={(localStorage.getItem("rt-grayColor") as ThemeOptions["grayColor"]) || "slate"}
          accentColor={
            (localStorage.getItem("rt-accentColor") as ThemeOptions["accentColor"]) || "indigo"
          }
          panelBackground={
            (localStorage.getItem("rt-panelBackground") as ThemeOptions["panelBackground"]) ||
            "solid"
          }
          scaling={(localStorage.getItem("rt-scaling") as ThemeOptions["scaling"]) || "100%"}
        >
          <style dangerouslySetInnerHTML={{ __html: hooks }} />
          <ArweaveWalletKit
            config={{
              permissions: [
                "ACCESS_ADDRESS",
                "DISPATCH",
                "SIGN_TRANSACTION",
                "ACCESS_PUBLIC_KEY",
                "SIGNATURE",
              ],
            }}
          >
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: css({
                  // left: "40%",
                  padding: "var(--space-3)",
                  width: "max-content",
                  borderRadius: "max(var(--radius-2), var(--radius-full))",
                  bottom: appConfig.playerMaxHeight,
                }),
              }}
            />
            <App />
          </ArweaveWalletKit>
          <ThemePanel defaultOpen={false} />
        </Theme>
      </ThemeProvider>
    </AudioPlayerProvider>
  </QueryClientProvider>
);
