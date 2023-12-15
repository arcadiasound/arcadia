import { AudioPlayer } from "@/modules/audioPlayer/AudioPlayer";
import { AppRouter as StaticRouter } from "../modules/router";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { useEffect } from "react";
import Head from "next/head";

const Router = dynamic<React.ComponentProps<typeof StaticRouter>>(
  () => import("../modules/router").then((mod) => mod.AppRouter),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Arcadia</title>
        <meta
          name="description"
          content="A music discovery platform built on Arweave."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#151718" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Router />
    </>
  );
}
