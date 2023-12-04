import { appConfig } from "@/appConfig";
import { Track } from "@/types";
import { arweave } from "./arweave";

export const getDuration = async (id: string) => {
  try {
    const response = await fetch(`${appConfig.defaultGateway}/${id}`);
    console.log({ response });

    const buffer = await response.arrayBuffer();

    const audioContext = new window.AudioContext();

    const audioBuffer = await audioContext.decodeAudioData(buffer);

    const duration = audioBuffer.duration;

    return duration;
  } catch (error) {
    console.error("Error fetching or processing audio:", error);
    throw error;
  }
};

export const getTotalDuration = async (tracklist: Track[]) => {
  try {
    const durations = await Promise.all(
      tracklist.map(async (track) => await getDuration(track.txid))
    );

    const totalDuration = durations.reduce(
      (acc, duration) => acc + duration,
      0
    );

    return totalDuration;
  } catch (error) {
    console.error("Error getting total duration:", error);
    throw error;
  }
};
