import { css } from "@/styles/css";
import { Box, Flex, IconButton, Link, Text } from "@radix-ui/themes";
import { keyframes, styled } from "@stitches/react";
import { useState } from "react";
import { MdPause, MdPlayArrow, MdRemoveCircleOutline } from "react-icons/md";
import { RxDotsHorizontal } from "react-icons/rx";
import { PiVinylRecordLight } from "react-icons/pi";
import { ActionsDropdown } from "./components/ActionsDropdown";
import { Track } from "@/types";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useGetProcessId, useGetUserProfile } from "@/hooks/appData";
import { Link as RouterLink } from "react-router-dom";
import { abbreviateAddress, formatTime } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAudioData } from "@/lib/getAudioData";
import { removeTrack } from "@/lib/library/likedTracks";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
});

const TrackIndexWrapper = styled("span", {
  "& svg": {
    display: "none",
    width: 20,
    height: 20,
  },

  variants: {
    playing: {
      true: {
        "& svg": {
          display: "block",
          animation: `${spin} 1s linear infinite`,
          color: "var(--accent-11)",
        },

        "[data-track-index]": {
          opacity: 0,
          clip: "rect(0 0 0 0)",
          width: 1,
          height: 1,
          overflow: "hidden",
          position: "absolute",
          whiteSpace: "nowrap",
        },
      },
    },
  },
});

const StyledFlex = styled(Flex, {
  "&:not(:hover, :focus-within)": {
    "[data-play-button]": {
      opacity: 0,
      clip: "rect(0 0 0 0)",
      width: 1,
      height: 1,
      overflow: "hidden",
      position: "absolute",
      whiteSpace: "nowrap",
    },
  },

  "&:hover, &:focus-within": {
    "[data-track-index-wrapper]": {
      opacity: 0,
      clip: "rect(0 0 0 0)",
      width: 1,
      height: 1,
      overflow: "hidden",
      position: "absolute",
      whiteSpace: "nowrap",
    },
  },
});

const PlayIconButton = styled(IconButton, {
  backgroundColor: "transparent",
  color: "var(--gray-10)",

  "&:hover": {
    color: "var(--gray-12)",
  },
});

const TRACK_ITEM_SIZE = 32;
const OUTLINE_OFFSET = 0.5;
const TRACK_ITEM_RADIUS = `max(var(--radius-1), var(--radius-4) * 0.6)`;

interface TrackCardProps {
  track: Track;
  tracks: Track[];
  trackIndex: number;
}

export const TrackItem = ({ track, tracks, trackIndex }: TrackCardProps) => {
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const {
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    handlePlayPause,
    audioCtxRef,
  } = useAudioPlayer();
  const address = useActiveAddress();
  const queryClient = useQueryClient();

  const { data } = useGetUserProfile({ address: track.creator });
  const profile = data?.profiles.length ? data.profiles[0] : undefined;

  const { data: audioData } = useQuery({
    queryKey: [`peaks-${track.txid}`],
    refetchOnWindowFocus: false,
    queryFn: () => {
      if (!audioCtxRef.current) {
        return;
      }

      return getAudioData({ txid: track.txid, audioContext: audioCtxRef.current });
    },
  });

  const { id: processId } = useGetProcessId(address);

  const unlike = useMutation({
    mutationFn: removeTrack,
    onSuccess: (data) => {
      queryClient.invalidateQueries([`likedTracksTxs`, address]);
      queryClient.invalidateQueries([`likedTracks`, address]);
      toast.success("Removed from liked tracks");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isPlaying = playing && currentTrackId === track.txid;

  const handleClick = () => {
    handlePlayPause?.();

    if (currentTrackId === track.txid) {
      togglePlaying?.();
    } else {
      if (trackIndex >= 0) {
        setTracklist?.(tracks, trackIndex);
        setCurrentTrackId?.(track.txid);
        setCurrentTrackIndex?.(trackIndex);
      }
    }
  };

  if (unlike.isSuccess) {
    return null;
  }

  return (
    <StyledFlex
      style={css({
        padding: "var(--space-2)",
        paddingRight: "var(--space-3)",
        opacity: unlike.isLoading ? 0.5 : 1,
        borderRadius: TRACK_ITEM_RADIUS,
        backgroundColor: actionsDropdownOpen ? "var(--gray-5)" : "transparent",
        "&:hover": { backgroundColor: "var(--gray-3)" },
      })}
      align="center"
      justify="between"
      gap="9"
    >
      <Flex gap="3" align="center">
        <TrackIndexWrapper
          data-track-index-wrapper
          playing={isPlaying}
          style={css({
            width: 24,
            height: 24,
            display: "grid",
            placeItems: "center",
          })}
        >
          <Text data-track-index size="1">
            {trackIndex + 1}
          </Text>
          <PiVinylRecordLight />
        </TrackIndexWrapper>
        <PlayIconButton size="1" data-play-button onClick={handleClick}>
          {isPlaying ? <MdPause /> : <MdPlayArrow />}
        </PlayIconButton>
        <Box
          style={css({
            width: `calc(${TRACK_ITEM_SIZE}px * var(--scaling))`,
            height: `calc(${TRACK_ITEM_SIZE}px * var(--scaling))`,
            outline: `${OUTLINE_OFFSET}px solid var(--white-a3)`,
            outlineOffset: -OUTLINE_OFFSET,
            borderRadius: TRACK_ITEM_RADIUS,
            position: "relative",
            overflow: "hidden",
          })}
        >
          <img
            src={track.thumbnailSrc}
            alt={`Cover artwork for ${track.title}`}
            style={css({
              objectFit: "cover",
              width: "100%",
              height: "100%",
            })}
          />
        </Box>
        <Flex direction="column" justify="between">
          <Link
            size="1"
            weight="medium"
            style={css({
              color: isPlaying ? "var(--accent-11)" : "var(--gray-12)",
            })}
            asChild
          >
            <RouterLink to={`/track?id=${track.txid}`}>{track.title}</RouterLink>
          </Link>
          <Link
            size="1"
            color="gray"
            style={css({
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: "24ch",
            })}
            asChild
          >
            <RouterLink to={`/profile?addr=${track.creator}`}>
              {profile?.name || abbreviateAddress({ address: track.creator })}
            </RouterLink>
          </Link>
        </Flex>
      </Flex>
      <Flex gap="4" align="center">
        <Text size="1">
          {audioData && !isNaN(audioData.duration) ? formatTime(audioData.duration) : `0:00`}
        </Text>
        <Flex align="center" gap="3">
          <IconButton
            onClick={() => unlike.mutate({ txid: track.txid, processId, owner: address })}
            variant="ghost"
            size="1"
            color="gray"
          >
            <MdRemoveCircleOutline />
          </IconButton>
          <ActionsDropdown
            track={track}
            open={actionsDropdownOpen}
            setOpen={setActionsDropdownOpen}
          >
            <IconButton variant="ghost" size="1" color="gray">
              <RxDotsHorizontal />
            </IconButton>
          </ActionsDropdown>
        </Flex>
      </Flex>
    </StyledFlex>
  );
};
