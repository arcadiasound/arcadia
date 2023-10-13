import { Tracklist } from "@/types";
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
  currentTrackIndex: number;
  currentTrackId: string;
};

type AudioPlayerActionType =
  | "SET_AUDIO_CONTEXT"
  | "SET_AUDIO_ELEMENT"
  | "SET_GAIN_REF"
  | "SET_TRACKLIST"
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
  setTracklist?: (tracklist: Tracklist) => void;
  ready?: boolean;
  playing: boolean;
  shuffle: boolean;
  loop: boolean;
  currentTrackIndex: number;
  currentTrackId: string;
  setCurrentTrackIndex?: (index: number) => void;
  setCurrentTrackId?: (id: string) => void;
  togglePlaying?: () => void;
  toggleShuffle?: (shuffle: boolean) => void;
  toggleLoop?: (loop: boolean) => void;
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

  const setCurrentTrackIndex = (index: number) => {
    dispatch({ type: "SET_CURRENT_TRACK_INDEX", payload: index });
    audioRef.current?.load();
  };

  const setCurrentTrackId = (id: string) => {
    dispatch({ type: "SET_CURRENT_TRACK_ID", payload: id });
  };

  const setTracklist = (tracklist: Tracklist) => {
    dispatch({ type: "SET_TRACKLIST", payload: tracklist });
    dispatch({ type: "SET_CURRENT_TRACK_INDEX", payload: 0 });
  };

  const handlePrevTrack = (index?: number) => {
    if (index) {
      return dispatch({
        type: "SET_CURRENT_TRACK_INDEX",
        payload: state.currentTrackIndex + 1,
      });
    }
    console.log("skipping back");
    if (state.currentTrackIndex == 0) {
      setCurrentTrackIndex(state.tracklist.length - 1);
    } else {
      setCurrentTrackIndex(state.currentTrackIndex - 1);
    }
  };

  const togglePlaying = () => {
    dispatch({ type: "PLAYING", payload: state.playing ? false : true });
  };

  const toggleShuffle = (shuffle?: boolean) => {
    if (shuffle) {
      dispatch({ type: "SHUFFLE", payload: shuffle });
    } else {
      dispatch({ type: "SHUFFLE", payload: !state.shuffle });
    }
  };

  const toggleLoop = (loop?: boolean) => {
    if (loop) {
      dispatch({ type: "LOOP", payload: loop });
    } else {
      dispatch({ type: "LOOP", payload: !state.loop });
    }
  };

  const handleNextTrack = (index?: number) => {
    if (index) {
      return dispatch({
        type: "SET_CURRENT_TRACK_INDEX",
        payload: index,
      });
    }
    if (state.currentTrackIndex == state.tracklist.length - 1) {
      setCurrentTrackIndex(0);
    } else {
      setCurrentTrackIndex(state.currentTrackIndex + 1);
    }
  };

  const handleTrackEnd = () => {
    if (state.shuffle) {
      return dispatch({
        type: "SET_CURRENT_TRACK_INDEX",
        payload: Math.floor(Math.random() * state.tracklist.length),
      });
    } else {
      if (state.loop) {
        handleNextTrack(state.currentTrackIndex);
      } else if (state.currentTrackIndex === state.tracklist.length - 1) {
        return dispatch({
          type: "PLAYING",
          payload: false,
        });
      } else {
        handleNextTrack();
      }
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
