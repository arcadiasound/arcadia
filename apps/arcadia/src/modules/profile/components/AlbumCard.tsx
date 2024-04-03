import { useGetUserProfile } from "@/hooks/appData";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTracks } from "@/lib/track/getTracks";
import { css } from "@/styles/css";
import { Album } from "@/types";
import { abbreviateAddress, compareArrayLengths, compareArrays } from "@/utils";
import { Box, Flex, IconButton, Link, Text } from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { MdPause, MdPlayArrow } from "react-icons/md";

const StyledWrapperDiv = styled(Box);

const TRACK_ITEM_SIZE = 180;
const OUTLINE_OFFSET = 1;
const TRACK_ITEM_RADIUS = `max(var(--radius-1), var(--radius-4) * 0.5)`;

interface AlbumCardProps {
  album: Album;
  albumIndex: number;
  children?: React.ReactNode;
}

export const AlbumCard = (props: AlbumCardProps) => {
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [liked, setLiked] = useState(false);
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

  const { data: albumTracks } = useQuery({
    queryKey: [`tracks-${props.album.txid}`],
    queryFn: () => getTracks({ txids: props.album.trackIds }),
    refetchOnWindowFocus: false,
  });

  const { data: profile } = useGetUserProfile({ address: props.album.creator });

  const isPlaying =
    playing &&
    albumTracks &&
    // temp solution
    compareArrayLengths(albumTracks, tracklist) &&
    props.album.trackIds.includes(currentTrackId);

  useEffect(() => {
    if (currentTrackId) {
      console.log({ currentTrackId });
      console.log(props.album.trackIds);
    }
  }, [currentTrackId]);

  const handleClick = () => {
    if (!albumTracks?.length) {
      return;
    }

    handlePlayPause?.();

    if (
      props.album.trackIds &&
      props.album.trackIds.includes(currentTrackId) &&
      /* temp solution
      - need more effective way to have album cards activate uniquely
      */
      compareArrayLengths(albumTracks, tracklist)
    ) {
      togglePlaying?.();
    } else {
      if (props.albumIndex >= 0) {
        // temp
        setTracklist?.(albumTracks, props.albumIndex);
        setCurrentTrackId?.(albumTracks[0].txid);
        setCurrentTrackIndex?.(0);
      }
    }
  };

  return (
    <Box
      key={props.album.txid}
      asChild
      style={css({
        width: `calc(${TRACK_ITEM_SIZE}px * var(--scaling))`,
      })}
    >
      <li>
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
            <ActionsOverlay justify="between" align="end" gap="3" showOverlay={isPlaying}>
              <IconButton disabled={!albumTracks?.length} onClick={handleClick} size="3">
                {isPlaying ? <MdPause /> : <MdPlayArrow />}
              </IconButton>
              <Flex align="center" gap="3">
                <AlphaIconButton
                  onClick={() => setLiked(!liked)}
                  liked={liked}
                  size="2"
                  variant="ghost"
                  highContrast
                >
                  {liked ? <IoMdHeart /> : <IoMdHeartEmpty />}
                </AlphaIconButton>
                {/* <ActionsDropdown
                  track={track}
                  open={actionsDropdownOpen}
                  setOpen={setActionsDropdownOpen}
                >
                  <AlphaIconButton variant="ghost" size="1" color="gray">
                    <RxDotsHorizontal />
                  </AlphaIconButton>
                </ActionsDropdown> */}
              </Flex>
            </ActionsOverlay>
            <img
              src={props.album.thumbnailSrc}
              alt={`Cover artwork for ${props.album.title}`}
              style={css({
                objectFit: "cover",
                width: "100%",
                height: "100%",
              })}
            />
          </Box>
          <StyledWrapperDiv
            css={{
              "[data-album-card-title]": {
                color:
                  playing &&
                  albumTracks &&
                  compareArrayLengths(albumTracks, tracklist) &&
                  props.album.trackIds.includes(currentTrackId)
                    ? "var(--accent-11)"
                    : "var(--gray-12)",
              },
            }}
          >
            {props.children || (
              <Flex direction="column">
                <Link
                  data-album-card-title
                  size="2"
                  weight="medium"
                  style={css({
                    color: isPlaying ? "var(--accent-11)" : "var(--gray-12)",
                  })}
                >
                  {props.album.title}
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
                >
                  {profile?.name || abbreviateAddress({ address: props.album.creator })}
                </Link>
              </Flex>
            )}
          </StyledWrapperDiv>
        </Flex>
      </li>
    </Box>
  );
};

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
