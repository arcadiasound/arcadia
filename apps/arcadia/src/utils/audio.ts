import { Tracklist } from "@/types";
import { shuffleArray } from ".";

export const shuffleTracklist = (tracklist: Tracklist, currentTrackIndex: number): Tracklist => {
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

export const formatDuration = ({ duration, options = {} }: FormatTime): string => {
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

export const calculateAudioPeaks = ({
  decodedData,
  channels = 2,
  maxLength = 8000,
  precision = 10_000,
}: {
  decodedData: AudioBuffer;
  channels?: number;
  maxLength?: number;
  precision?: number;
}): Array<number[]> => {
  const maxChannels = Math.min(channels, decodedData.numberOfChannels);
  const peaks: any = [];
  for (let i = 0; i < maxChannels; i++) {
    const channel = decodedData.getChannelData(i);
    const data: any = [];
    const sampleSize = Math.round(channel.length / maxLength);
    for (let i = 0; i < maxLength; i++) {
      const sample = channel.slice(i * sampleSize, (i + 1) * sampleSize);
      let max = 0;
      for (let x = 0; x < sample.length; x++) {
        const n = sample[x];
        if (Math.abs(n) > Math.abs(max)) max = n;
      }
      data.push(Math.round(max * precision) / precision);
    }
    peaks.push(data);
  }
  return peaks;
};
