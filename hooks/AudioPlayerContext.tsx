import { Tracklist } from "@/types";
import { shuffleArray } from "@/utils";
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

type AudioPlayerState = {
  audioRef: MutableRefObject<HTMLMediaElement | null>["current"];
  audioCtx: MutableRefObject<AudioContext | null>["current"];
  gainRef: MutableRefObject<GainNode | null>["current"];
  duration: number;
  currentTime: number;
  playing: boolean;
  shuffle: boolean;
  loop: boolean;
  tracklist: Tracklist;
  originalTracklist: Tracklist;
  currentTrackIndex: number;
  currentTrackId: string;
};

type AudioPlayerActionType =
  | "SET_AUDIO_CONTEXT"
  | "SET_AUDIO_ELEMENT"
  | "SET_GAIN_REF"
  | "SET_TRACKLIST"
  | "SET_ORIGINAL_TRACKLIST"
  | "SET_CURRENT_TRACK_INDEX"
  | "SET_CURRENT_TRACK_ID"
  | "PLAYING"
  | "SHUFFLE"
  | "LOOP";

type AudioPlayerAction = {
  type: AudioPlayerActionType;
  payload: any;
};

const initialState: AudioPlayerState = {
  audioRef: null,
  audioCtx: null,
  gainRef: null,
  duration: 0,
  currentTime: 0,
  playing: false,
  shuffle: false,
  loop: false,
  tracklist: [],
  originalTracklist: [],
  currentTrackIndex: 0,
  currentTrackId: "",
};

export const AudioPlayerContext = createContext<{
  audioRef: MutableRefObject<HTMLMediaElement | null>;
  audioCtxRef: MutableRefObject<AudioContext | null>;
  gainRef: MutableRefObject<GainNode | null>;
  //   sourceRef: MediaElementAudioSourceNode | null;
  setAudioContext?: () => void;
  setAudioRef?: () => void;
  setGainRef?: () => void;
  tracklist: Tracklist;
  setTracklist?: (tracklist: Tracklist, index: number) => void;
  ready?: boolean;
  playing: boolean;
  shuffle: boolean;
  loop: boolean;
  currentTrackIndex: number;
  currentTrackId: string;
  setCurrentTrackIndex?: (index: number) => void;
  setCurrentTrackId?: (id: string) => void;
  togglePlaying?: (playAction?: "play" | "pause") => void;
  toggleShuffle?: () => void;
  toggleLoop?: () => void;
  seeking?: boolean | undefined;
  seekedValue?: number | undefined;
  setSeeking?: Dispatch<SetStateAction<boolean | undefined>>;
  setSeekedValue?: Dispatch<SetStateAction<number | undefined>>;
  duration?: number | undefined;
  currentTime?: number;
  setCurrentTime?: Dispatch<SetStateAction<number>>;
  handlePrevTrack?: (index?: number) => void;
  handleNextTrack?: (index?: number) => void;
  handleTrackEnd?: () => void;
  handlePlayPause?: () => void;
}>({
  audioRef: null as any,
  audioCtxRef: null as any,
  //   sourceRef: null as any,
  tracklist: [],
  gainRef: null as any,
  playing: false,
  shuffle: false,
  loop: false,
  currentTrackIndex: 0,
  currentTrackId: "",
});

const audioPlayerReducer = (
  state: AudioPlayerState,
  action: AudioPlayerAction
): AudioPlayerState => {
  switch (action.type) {
    case "SET_AUDIO_CONTEXT":
      return {
        ...state,
        audioCtx: action.payload,
      };
    case "SET_AUDIO_ELEMENT":
      return {
        ...state,
        audioRef: action.payload,
      };
    case "SET_GAIN_REF":
      return {
        ...state,
        gainRef: action.payload,
      };
    case "SET_TRACKLIST":
      return {
        ...state,
        tracklist: action.payload,
      };
    case "SET_ORIGINAL_TRACKLIST":
      return { ...state, originalTracklist: action.payload };
    case "SET_CURRENT_TRACK_INDEX":
      return {
        ...state,
        currentTrackIndex: action.payload,
        playing: true,
      };
    case "SET_CURRENT_TRACK_ID":
      return {
        ...state,
        currentTrackId: action.payload,
      };
    case "PLAYING":
      return {
        ...state,
        playing: action.payload,
      };
    case "SHUFFLE":
      return {
        ...state,
        shuffle: action.payload,
      };
    case "LOOP":
      return {
        ...state,
        loop: action.payload,
      };
    default:
      return state;
  }
};

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

const AudioPlayerProvider = ({ children }: AudioPlayerProviderProps) => {
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [state, dispatch] = useReducer(audioPlayerReducer, initialState);

  const setAudioContext = () => {
    dispatch({ type: "SET_AUDIO_CONTEXT", payload: audioCtxRef });
  };

  const setAudioRef = () =>
    dispatch({ type: "SET_AUDIO_ELEMENT", payload: audioRef });

  const setGainRef = () => {
    dispatch({ type: "SET_GAIN_REF", payload: gainRef });
  };

  useEffect(() => {
    setAudioRef();
  }, []);

  // state handlers
  const setCurrentTrackIndex = (index: number) => {
    dispatch({ type: "SET_CURRENT_TRACK_INDEX", payload: index });
    audioRef.current?.load();
  };

  const setCurrentTrackId = (id: string) => {
    dispatch({ type: "SET_CURRENT_TRACK_ID", payload: id });
  };

  const setTracklist = (tracklist: Tracklist, trackIndex: number) => {
    // Update original tracklist
    dispatch({ type: "SET_ORIGINAL_TRACKLIST", payload: tracklist });

    let updatedTracklist = tracklist;

    // If shuffle is active, shuffle the new tracklist but keep the selected track in place
    if (state.shuffle) {
      updatedTracklist = shuffleTracklist(tracklist, trackIndex);
    }

    dispatch({ type: "SET_TRACKLIST", payload: updatedTracklist });
  };

  const handlePrevTrack = (index?: number) => {
    if (index) {
      setCurrentTrackIndex(index);
      setNextTrackId(index);
    } else {
      if (state.currentTrackIndex == 0) {
        setCurrentTrackIndex(state.tracklist.length - 1);
        setNextTrackId(state.tracklist.length - 1);
      } else {
        setCurrentTrackIndex(state.currentTrackIndex - 1);
        setNextTrackId(state.currentTrackIndex - 1);
      }
    }
  };

  const setNextTrackId = (indexMatcher: number) => {
    const nextTrack = state.tracklist.find(
      (track, index) => index === indexMatcher
    );
    const nextTx = nextTrack?.txid;
    if (nextTx) {
      setCurrentTrackId(nextTx);
    }
  };

  const togglePlaying = (playAction?: "play" | "pause") => {
    if (playAction) {
      if (playAction === "play") {
        dispatch({ type: "PLAYING", payload: true });
      } else {
        dispatch({ type: "PLAYING", payload: false });
      }
    } else {
      if (!audioRef.current || !audioCtxRef.current) return;

      const isPlaying = !state.playing;

      if (isPlaying) {
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().then(() => {
            //@ts-ignore
            audioRef.current.play();
          });
        } else {
          audioRef.current.play();
        }
      } else {
        audioRef.current.pause(); // Pause the audio
      }

      dispatch({ type: "PLAYING", payload: isPlaying });
    }
  };

  const toggleShuffle = () => {
    dispatch({ type: "SHUFFLE", payload: !state.shuffle });
    if (!state.shuffle) {
      // shuffle is being turned on
      dispatch({ type: "SET_ORIGINAL_TRACKLIST", payload: state.tracklist });
      const shuffledTracklist = shuffleTracklist(
        state.tracklist,
        state.currentTrackIndex
      );
      dispatch({ type: "SET_TRACKLIST", payload: shuffledTracklist });
    } else {
      // shuffle is being turned off
      dispatch({ type: "SET_TRACKLIST", payload: state.originalTracklist });
    }
  };

  const shuffleTracklist = (
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

  const toggleLoop = () => dispatch({ type: "LOOP", payload: !state.loop });

  const handleNextTrack = (index?: number) => {
    if (index) {
      setCurrentTrackIndex(index);
      setNextTrackId(index);
    } else {
      if (state.loop) {
        setCurrentTrackIndex(state.currentTrackIndex);
        setNextTrackId(state.currentTrackIndex);
      } else {
        if (state.currentTrackIndex == state.tracklist.length - 1) {
          setCurrentTrackIndex(0);
          setNextTrackId(0);
        } else {
          setCurrentTrackIndex(state.currentTrackIndex + 1);
          setNextTrackId(state.currentTrackIndex + 1);
        }
      }
    }
  };

  const handleTrackEnd = () => handleNextTrack();

  const handlePlayPause = () => {
    if (!audioRef.current || !audioCtxRef.current) return;

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (state.playing) {
      audioRef.current.pause();
    }

    if (!state.playing && audioRef.current.readyState >= 2) {
      audioRef.current.play();
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        audioRef,
        audioCtxRef,
        gainRef,
        // sourceRef,
        setAudioContext,
        setAudioRef,
        setGainRef,
        tracklist: state.tracklist,
        setTracklist,
        playing: state.playing,
        shuffle: state.shuffle,
        loop: state.loop,
        currentTrackIndex: state.currentTrackIndex,
        currentTrackId: state.currentTrackId,
        setCurrentTrackIndex,
        setCurrentTrackId,
        handleNextTrack,
        handlePrevTrack,
        handleTrackEnd,
        handlePlayPause,
        togglePlaying,
        toggleShuffle,
        toggleLoop,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

const useAudioPlayer = () => useContext(AudioPlayerContext);

export { AudioPlayerProvider, useAudioPlayer };
