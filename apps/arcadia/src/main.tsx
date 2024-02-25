import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import { AudioPlayerProvider } from "@/hooks/useAudioPlayer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Theme, ThemePanel } from "@radix-ui/themes";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import App from "./App";
import { hooks } from "./styles/css";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <AudioPlayerProvider>
      <ThemeProvider enableSystem attribute="class">
        <Theme
          appearance="inherit"
          radius="medium"
          grayColor="slate"
          accentColor="indigo"
          panelBackground="translucent"
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
            <Toaster position="bottom-center" />
            <App />
          </ArweaveWalletKit>
          <ThemePanel />
        </Theme>
      </ThemeProvider>
    </AudioPlayerProvider>
  </QueryClientProvider>
);
