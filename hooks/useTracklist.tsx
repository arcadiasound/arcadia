import { Tracklist } from "@/types";
import { useState } from "react";

export const useTracklist = (initialTracklist?: Tracklist) => {
  const [tracklist, setTracklist] = useState(initialTracklist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const handlePrevTrack = () => {
    // Logic for changing to the previous track
  };

  const handleNextTrack = () => {
    // Logic for changing to the next track
  };

  return {
    tracklist,
    currentTrackIndex,
    handlePrevTrack,
    handleNextTrack,
  };
};
