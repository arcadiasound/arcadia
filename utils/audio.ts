import { Tracklist } from "@/types";
import { shuffleArray } from ".";

export const shuffleTracklist = (
  tracklist: Tracklist,
  currentTrackIndex: number
): Tracklist => {
  // Clone the tracklist array to avoid mutations
  const tracksToShuffle = [...tracklist];
  const currentTrack = tracksToShuffle.splice(currentTrackIndex, 1)[0];
  const shuffledTracks = shuffleArray(tracksToShuffle);

  // Reinsert the current track at the original index
  shuffledTracks.splice(currentTrackIndex, 0, currentTrack);
  return shuffledTracks;
};
