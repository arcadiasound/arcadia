import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "@/ui/Slider";
import { abbreviateAddress, formatTime } from "@/utils";
import { Box } from "@/ui/Box";
import { Flex } from "@/ui/Flex";
import { IconButton } from "@/ui/IconButton";
import { Typography } from "@/ui/Typography";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  IoPauseSharp,
  IoPlaySharp,
  IoPlaySkipForwardSharp,
  IoPlaySkipBackSharp,
} from "react-icons/io5";
import { MdVolumeDown, MdVolumeUp } from "react-icons/md";
import { styled } from "@/stitches.config";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { appConfig } from "@/appConfig";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/getProfile";
import { Link } from "react-router-dom";

const PlayPauseButton = styled(IconButton, {
  br: 9999,
});

const SkipButton = styled(IconButton, {
  "& svg": {
    color: "$neutralInvertedA11",
  },

  "&:hover": {
    "& svg": {
      color: "$neutralInvertedA12",
    },
  },
});

const Slider = styled(SliderRoot, {
  width: "100%",

  '[data-slider-thumb="true"]': {
    opacity: 0,
  },

  "&:hover": {
    '[data-slider-thumb="true"]': {
      opacity: 1,
    },
  },

  "&:focus-within": {
    '[data-slider-thumb="true"]': {
      "&:focus-visible": {
        opacity: 1,
      },
    },
  },
});

const AudioContainer = styled(Box, {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr",
  width: "100%",
  height: "max-content",
  py: "$1",
  px: "$5",
  overflow: "hidden",
  position: "fixed",
  bottom: 0,
  backgroundColor: "$neutralA11",
  backdropFilter: "blur(30px)",
  maxHeight: appConfig.playerMaxHeight,
  borderTop: "1px solid $colors$neutralInvertedA3",
});

const VolumeSlider = styled(Slider);
const VolumeContainer = styled("form");
const ControlsContainer = styled(Flex);
const ProgressSlider = styled(Slider);
const ProgressContainer = styled("form");
const CoverArtwork = styled("img", {
  height: "100%",
  width: "100%",
  objectFit: "cover",
  objectPosition: "center",
  position: "absolute",
  zIndex: -1,
});

export const AudioPlayer = () => {
  const [progressStep, setProgressStep] = useState<number>(0.01);
  const [scrubbedValue, setScrubbedValue] = useState<number | undefined>(
    undefined
  );
  const [scrubbing, setScrubbing] = useState<boolean>();
  const [duration, setDuration] = useState<number>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const {
    audioRef,
    gainRef,
    audioCtxRef,
    setAudioContext,
    setAudioRef,
    setGainRef,
    tracklist,
    playing,
    togglePlaying,
    toggleLoop,
    toggleShuffle,
    handleTrackEnd,
    currentTrackIndex,
    handleNextTrack,
    handlePrevTrack,
  } = useAudioPlayer();

  const currentTrack =
    tracklist.length > 0 ? tracklist[currentTrackIndex] : null;

  const { data: account, isError } = useQuery({
    queryKey: [`profile-${currentTrack?.creator}`],
    queryFn: () => {
      if (!currentTrack) {
        return;
      }

      return getProfile(currentTrack.creator);
    },
    enabled: !!currentTrack,
  });

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      console.log("setting audio context");
    }

    console.log("audioCtx", audioCtxRef);

    // set gain node
    if (!gainRef.current) {
      gainRef.current = audioCtxRef.current.createGain();
    }

    // set media element source
    if (!sourceRef.current) {
      sourceRef.current = audioCtxRef.current.createMediaElementSource(
        audioRef.current as HTMLMediaElement
      );
      sourceRef.current
        .connect(gainRef.current)
        .connect(audioCtxRef.current.destination);
    }

    if (audioRef.current) {
      // allow audio to be played from gateways
      audioRef.current.crossOrigin = "anonymous";
    }
  }, []);

  /* EVENT HANDLERS */

  const handleValueChange = (e: number[]) => {
    if (!gainRef.current) return;

    gainRef.current.gain.value = e[0] / 100;
  };

  const handleProgressChange = (e: number[]) => {
    if (!audioRef.current) return;

    console.log("dragging");

    setScrubbing(true);
    setScrubbedValue(e[0]);
  };

  const handleProgressCommit = (e: number[]) => {
    if (!audioRef.current) return;

    console.log("dragging stopped");

    setScrubbing(false);
    audioRef.current.currentTime = e[0];
    setCurrentTime(e[0]);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      setProgressStep(5);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioCtxRef.current) return;

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    console.log(currentTrackIndex);
    if (currentTrackIndex >= 0) {
      console.log(currentTrackIndex);
    }
  }, [currentTrackIndex]);

  // set duration
  useEffect(() => {
    if (!audioRef.current) return;

    const seconds = Math.floor(audioRef.current?.duration || 0);
    setDuration(seconds);
    const current = Math.floor(audioRef.current?.currentTime || 0);
    setCurrentTime(current);

    // setReady(audioRef.current.readyState > 2);
  }, [audioRef.current?.onloadeddata, audioRef.current?.readyState]);

  // listeners
  useEffect(() => {
    if (audioRef.current) {
      // if audio has ended
      audioRef.current.addEventListener("ended", handleEnded);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadeddata", handleLoadedData);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("loadeddata", handleLoadedData);
      }
    };
  }, []);

  const handleEnded = () => handleTrackEnd?.();

  const handleTimeUpdate = () => {
    // check for current runs in useffect
    setCurrentTime(audioRef.current?.currentTime as number);
  };

  const handleLoadedData = () => {
    console.log("track loaded");
    if (audioRef.current?.readyState && audioRef.current?.readyState >= 2) {
      audioRef.current?.play();
    }
  };

  return (
    <AudioContainer id="audio-container">
      <audio ref={audioRef}>
        <source src={currentTrack?.src} type="audio/ogg" />
        <source src={currentTrack?.src} type="audio/wav" />
        <source src={currentTrack?.src} type="audio/mpeg" />
        <source src={currentTrack?.src} type="audio/aac" />
        <Typography>Audio file type not supported.</Typography>
      </audio>

      <Flex
        gap="3"
        align="center"
        css={{
          flex: 1,
        }}
      >
        <Box
          css={{
            position: "relative",
            width: 48,
            height: 48,
            overflow: "hidden",
          }}
        >
          <CoverArtwork
            src={
              currentTrack?.artworkId
                ? `https://arweave.net/${currentTrack?.artworkId}`
                : `https://source.boringavatars.com/marble/200/${currentTrack?.txid}?square=true`
            }
          />
        </Box>

        {currentTrack && (
          <Flex direction="column">
            <Link
              to={{
                pathname: "/track",
                search: `?tx=${currentTrack.txid}`,
              }}
            >
              <Typography css={{ color: "$neutralInvertedA12" }} weight="6">
                {currentTrack.title ? currentTrack.title : "-"}
              </Typography>
            </Link>
            <Link
              to={{
                pathname: "/profile",
                search: `?addr=${currentTrack.creator}`,
              }}
            >
              <Typography size="2" css={{ color: "$neutralInvertedA11" }}>
                {account?.profile.name ||
                  abbreviateAddress({
                    address: currentTrack.creator,
                    options: { endChars: 5, noOfEllipsis: 3 },
                  })}
              </Typography>
            </Link>
          </Flex>
        )}
      </Flex>

      <Flex
        gap="10"
        css={{
          flex: 1,
        }}
        align="center"
      >
        <ControlsContainer
          css={{
            mx: "auto",
            my: "$3",
          }}
          align="center"
          gap="3"
        >
          <SkipButton
            onClick={() => {
              handlePrevTrack?.();
            }}
            css={{
              backgroundColor: "transparent",
              svg: {
                size: "$6",
              },
            }}
            variant="translucent"
            disabled={tracklist.length < 2}
          >
            <IoPlaySkipBackSharp />
          </SkipButton>
          <PlayPauseButton
            css={{
              color: "$slate1",
              backgroundColor: "$slate12",
              opacity: 0.9,

              "& svg": {
                transform: playing ? "translateX(0)" : "translateX(1px)",
              },

              "&:hover": {
                backgroundColor: "$slateSolidHover",
                opacity: 0.9,
              },

              "&:active": {
                transform: "scale(0.95)",
              },
            }}
            size="2"
            data-playing={playing}
            aria-checked={playing}
            role="switch"
            onClick={() => {
              togglePlaying?.();
              handlePlayPause();
            }}
          >
            {playing ? <IoPauseSharp /> : <IoPlaySharp />}
          </PlayPauseButton>
          <SkipButton
            onClick={() => {
              handleNextTrack?.();
            }}
            css={{
              backgroundColor: "transparent",

              svg: {
                size: "$6",
              },
            }}
            variant="translucent"
            disabled={tracklist.length < 2}
          >
            <IoPlaySkipForwardSharp />
          </SkipButton>
        </ControlsContainer>

        <Flex
          css={{
            flex: 1,
          }}
          align="center"
          gap="2"
        >
          <Typography
            css={{
              color: "$neutralInvertedA11",
              fontSize: 11,
            }}
          >
            {scrubbing
              ? formatTime(scrubbedValue as number)
              : formatTime(currentTime)}
          </Typography>
          <ProgressContainer
            css={{
              flex: 1,
            }}
          >
            <ProgressSlider
              onKeyDown={handleKeyDown}
              defaultValue={[
                audioCtxRef?.current ? audioCtxRef.current.currentTime : 0,
              ]}
              value={scrubbing ? [scrubbedValue as number] : [currentTime]}
              max={duration}
              step={progressStep}
              aria-label="Track Progress"
              onValueChange={(e) => handleProgressChange(e)}
              onValueCommit={handleProgressCommit}
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb data-slider-thumb />
            </ProgressSlider>
          </ProgressContainer>
          <Typography
            css={{
              color: "$neutralInvertedA11",
              fontSize: 11,
            }}
          >
            {duration && !isNaN(duration) ? formatTime(duration) : `0:00`}
          </Typography>
        </Flex>
      </Flex>

      <Flex
        css={{
          flex: 1,
          "& svg": {
            size: "$5",
            color: "$neutralInvertedA12",
          },
        }}
        align="center"
        justify="end"
        gap="3"
      >
        {/* <IconButton>
              <BsThreeDots />
            </IconButton> */}
        <Flex css={{ flex: 1, maxWidth: 150 }} align="center" gap="3">
          <MdVolumeDown />
          <VolumeContainer
            css={{
              maxWidth: "$40",
              minWidth: "$30",
              flex: 1,
            }}
          >
            <VolumeSlider
              defaultValue={[50]}
              max={100}
              step={progressStep}
              aria-label="Volume"
              onValueChange={(e) => handleValueChange(e)}
              onKeyDown={handleKeyDown}
            >
              <SliderTrack>
                <SliderRange />
              </SliderTrack>
              <SliderThumb data-slider-thumb />
            </VolumeSlider>
          </VolumeContainer>
        </Flex>
      </Flex>
    </AudioContainer>
  );
};
