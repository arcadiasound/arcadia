import { gateway } from "@/utils";
import { calculateAudioPeaks } from "@/utils/audio";
import Decoder from "@/utils/decoder";

interface GetAudioPeaksProps {
  txid: string;
  audioContext: AudioContext;
}

export const getAudioData = async ({ audioContext, ...props }: GetAudioPeaksProps) => {
  try {
    const url = `${gateway()}/${props.txid}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Error occurred fetching audio data: ");
    }

    const arrayBuffer = await res.arrayBuffer();
    const decodedData = await Decoder.decode(arrayBuffer, 8000);
    const peaks = await calculateAudioPeaks({ decodedData });
    const duration = decodedData.duration;
    return {
      duration,
      peaks,
    };
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
