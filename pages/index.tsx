import { AudioPlayer } from "@/modules/audioPlayer/AudioPlayer";
import { AppRouter as StaticRouter } from "../modules/router";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { useEffect } from "react";

const Router = dynamic<React.ComponentProps<typeof StaticRouter>>(
  () => import("../modules/router").then((mod) => mod.AppRouter),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <Router />
      <AudioPlayer />
    </>
  );
}
