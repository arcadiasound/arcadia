import { Track } from "@/types";
import { gateway } from "@/utils";

export const getDuration = async (id: string) => {
  try {
    const url = gateway() + "/" + id;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Error fetching audio data with status: " + res.status);
    }

    const buffer = await res.arrayBuffer();

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

    const totalDuration = durations.reduce((acc, duration) => acc + duration, 0);

    return totalDuration;
  } catch (error) {
    console.error("Error getting total duration:", error);
    throw error;
  }
};
