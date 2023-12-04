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

interface FormatTime {
  duration: number;
  options?: {
    suffix?: boolean;
  };
}

export const formatDuration = ({
  duration,
  options = {},
}: FormatTime): string => {
  const { suffix } = options;
  const minutes: number = Math.floor(duration / 60) % 60;
  const seconds: number = Math.floor(duration % 60);
  const hours: number = Math.floor(duration / 3600);

  const hoursText = hours === 1 ? "hour" : "hours";
  const minutesText = minutes === 1 ? "min" : "mins";

  const formattedSeconds: string = suffix
    ? `${seconds} ${seconds === 1 ? "sec" : "secs"}`
    : `${seconds < 10 ? "0" : ""}${seconds}`;

  if (hours > 0) {
    if (suffix) {
      return `${hours} ${hoursText} ${minutes} ${minutesText} ${formattedSeconds}`;
    } else {
      return `${hours}:${minutes}:${formattedSeconds}`;
    }
  }

  if (suffix) {
    return `${minutes} ${minutesText} ${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
};
