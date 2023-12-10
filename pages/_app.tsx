import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { darkTheme, globalCss } from "@/stitches.config";
import { AudioPlayerProvider } from "@/hooks/AudioPlayerContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArweaveWebWallet } from "arweave-wallet-connector";
import { ConnectProvider } from "@/hooks/useConnect";

const globalStyles = globalCss({
  // "@dark": {
  //   // notice the `media` definition on the stitches.config.ts file
  //   ":root:not(.light)": {
  //     ...Object.keys(darkTheme.colors).reduce((varSet, currentColorKey) => {
  //       //@ts-ignore
  //       const currentColor = darkTheme.colors[currentColorKey];
  //       const currentColorValue =
  //         currentColor.value.substring(0, 1) === "$"
  //           ? `$colors${currentColor.value}`
  //           : currentColor.value;

  //       return {
  //         [currentColor.variable]: currentColorValue,
  //         ...varSet,
  //       };
  //     }, {}),
  //   },
  // },

  "*, *::before, *::after": {
    boxSizing: "border-box",
  },
  "*": {
    "*:focus:not(.focus-visible)": {
      outline: "none",
    },
  },
  "html, body, #root, #__next": {
    minHeight: "100vh",
    fontFamily: "$body",
    margin: 0,
    backgroundColor: "$slate1",
    color: "$slate11",
  },
  "& a": {
    "&:hover": {
      textDecoration: "underline",
      textDecorationThickness: "1px",
    },
    "&:focus-visible": {
      boxShadow: "0 0 0 2px $colors$blue8",
    },
  },
});

globalStyles();

const queryClient = new QueryClient();

const webWallet = new ArweaveWebWallet({
  name: "Arcadia",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioPlayerProvider>
        <ThemeProvider
          disableTransitionOnChange
          attribute="class"
          value={{ light: "light-theme", dark: darkTheme.className }}
          enableSystem
        >
          <ConnectProvider
            webWallet={webWallet}
            includeProfile
            detectWalletSwitch
          >
            <Component {...pageProps} />
          </ConnectProvider>
        </ThemeProvider>
      </AudioPlayerProvider>
    </QueryClientProvider>
  );
}
