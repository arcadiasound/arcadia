import { AudioPlayer } from "@/modules/audioPlayer/AudioPlayer";
import { AppRouter as StaticRouter } from "../modules/router";
import dynamic from "next/dynamic";

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
