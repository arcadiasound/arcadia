import { css } from "@/styles/css";
import { Box, Flex, IconButton, Link, Text } from "@radix-ui/themes";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { styled } from "@stitches/react";
import { useEffect, useState } from "react";
import { ActionsDropdown } from "./components/ActionsDropdown";
import { RxDotsHorizontal } from "react-icons/rx";
import { Track } from "@/types";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { abbreviateAddress, compareArrays } from "@/utils";
import { useGetProcessId, useGetUserProfile } from "@/hooks/appData";
import { Link as RouterLink } from "react-router-dom";
import { UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikedTracksIds, getTrackProcess, saveTrack } from "@/lib/library/likedTracks";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";

const ActionsOverlay = styled(Flex, {
  width: "100%",
  height: "100%",
  position: "absolute",
  padding: "var(--space-3)",
  opacity: 0,
  background: `linear-gradient(
    to top,
    var(--black-a12) 0%,
    var(--black-a3) 50%,
    var(--black-a2) 65%,
    var(--black-a1) 75.5%,
    var(--black-a1) 82.85%,
    var(--black-a1) 88%,
    var(--black-a1) 100%
      )`,

  "&:hover, &:has(:focus-visible)": {
    opacity: 1,
  },

  variants: {
    showOverlay: {
      true: {
        opacity: 1,
      },
    },
  },
});

const AlphaIconButton = styled(IconButton, {
  color: "var(--white-a10)",

  "&:hover": {
    backgroundColor: "var(--white-a4)",
    color: "var(--white-a12)",
  },

  variants: {
    liked: {
      true: {
        color: "var(--accent-9)",
        "&:hover": {
          backgroundColor: "var(--white-a4)",
          color: "var(--accent-10)",
        },
      },
    },
  },
});

const TRACK_ITEM_SIZE = 180;
const OUTLINE_OFFSET = 1;
const TRACK_ITEM_RADIUS = `max(var(--radius-1), var(--radius-4) * 0.5)`;

interface TrackCardProps {
  track: Track;
  tracks: Track[];
  trackIndex: number;
  children?: React.ReactNode;
}

export const TrackCard = ({ track, tracks, trackIndex, children }: TrackCardProps) => {
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  // const [liked, setLiked] = useState(false);
  const {
    playing,
    togglePlaying,
    currentTrackId,
    setTracklist,
    setCurrentTrackId,
    setCurrentTrackIndex,
    handlePlayPause,
    tracklist,
  } = useAudioPlayer();
  const queryClient = useQueryClient();
  const address = useActiveAddress();

  const { data } = useGetUserProfile({ address: track.creator });
  const profile = data?.profiles.length ? data.profiles[0] : undefined;

  const isPlaying = playing && currentTrackId === track.txid && compareArrays(tracks, tracklist);

  const { id: processId } = useGetProcessId(address);

  const { data: likedTrackTxs, isSuccess: likedTrackTxsSuccess } = useQuery({
    queryKey: [`likedTracksTxs`, address],
    queryFn: async () => getLikedTracksIds(processId),
    enabled: !!processId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
  });

  const like = useMutation({
    mutationFn: saveTrack,
    onSuccess: (data) => {
      console.log("success!", data);
      queryClient.invalidateQueries([`likedTracksTxs`]);
      toast.success("Added to liked tracks");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleClick = () => {
    handlePlayPause?.();

    if (currentTrackId === track.txid && compareArrays(tracks, tracklist)) {
      togglePlaying?.();
    } else {
      if (trackIndex >= 0) {
        setTracklist?.(tracks, trackIndex);
        setCurrentTrackId?.(track.txid);
        setCurrentTrackIndex?.(trackIndex);
      }
    }
  };

  const liked = likedTrackTxs?.includes(track.txid) || like.isSuccess;

  return (
    <Box
      asChild
      style={css({
        width: `calc(${TRACK_ITEM_SIZE}px * var(--scaling))`,
      })}
    >
      <li key={track.txid}>
        <Flex
          direction="column"
          gap="2"
          style={css({
            position: "relative",
          })}
        >
          <Box
            style={css({
              width: `calc(${TRACK_ITEM_SIZE}px * var(--scaling))`,
              height: `calc(${TRACK_ITEM_SIZE}px * var(--scaling))`,
              outline: `${OUTLINE_OFFSET}px solid var(--track-outline)`,
              outlineOffset: -OUTLINE_OFFSET,
              borderRadius: TRACK_ITEM_RADIUS,
              overflow: "hidden",
              position: "relative",
            })}
          >
            <ActionsOverlay
              justify="between"
              align="end"
              gap="3"
              showOverlay={actionsDropdownOpen || isPlaying}
            >
              <IconButton onClick={handleClick} size="3">
                {isPlaying ? <MdPause /> : <MdPlayArrow />}
              </IconButton>
              <Flex align="center" gap="3">
                <AlphaIconButton
                  disabled={!processId}
                  onClick={() => {
                    like.mutate({
                      txid: track.txid,
                      processId: processId,
                      owner: address,
                    });
                  }}
                  liked={liked}
                  size="2"
                  variant="ghost"
                  highContrast
                >
                  {liked ? <IoMdHeart /> : <IoMdHeartEmpty />}
                </AlphaIconButton>
                <ActionsDropdown
                  track={track}
                  open={actionsDropdownOpen}
                  setOpen={setActionsDropdownOpen}
                >
                  <AlphaIconButton variant="ghost" size="1" color="gray">
                    <RxDotsHorizontal />
                  </AlphaIconButton>
                </ActionsDropdown>
              </Flex>
            </ActionsOverlay>
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
          {children || (
            <Flex direction="column">
              <Link
                size="2"
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
                  maxWidth: "20ch",
                })}
                asChild
              >
                <RouterLink to={`/profile?addr=${track.creator}`}>
                  {profile?.name || abbreviateAddress({ address: track.creator })}
                </RouterLink>
              </Link>
            </Flex>
          )}
        </Flex>
      </li>
    </Box>
  );
};
