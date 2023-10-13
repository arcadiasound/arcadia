import { Box } from "@/ui/Box";
import { Flex } from "@/ui/Flex";
import { Image } from "@/ui/Image";
import { Typography } from "@/ui/Typography";
import { getRecentAlbums } from "@/lib/getRecentAlbums";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { Track, Tracklist } from "@/types";
import { abbreviateAddress } from "@/utils";
import { useEffect, useState } from "react";
import { IconButton } from "@/ui/IconButton";
import { useAudioPlayer } from "@/hooks/AudioPlayerContext";
import { IoPauseSharp, IoPlaySharp } from "react-icons/io5";

const TrackCard = ({
  track,
  trackIndex,
  tracks,
}: {
  track: Track;
  trackIndex: number;
  tracks: Tracklist;
}) => {
  const {
    audioCtxRef,
    playing,
    audioRef,
    togglePlaying,
    tracklist,
    setTracklist,
    setCurrentTrackIndex,
  } = useAudioPlayer();

  // useEffect(() => {
  //   console.log({ track });
  //   console.log({ trackIndex });
  // }, []);

  const handleClick = () => {
    // run function that takes index of current track within tracklist array, and creates tracklist of remaining tracks
    if (trackIndex >= 0) {
      // create a new tracklist starting from the selected track index
      const newTracklist = tracks.slice(trackIndex);

      console.log({ newTracklist });

      setTracklist?.(newTracklist);
      setCurrentTrackIndex?.(0);

      // audioRef.current?.load();
    }
  };

  return (
    <Flex direction="column" gap="2">
      <Box
        css={{
          width: 200,
          height: 200,
          position: "relative",

          "& [data-overlay]": {
            display: "none",
          },

          "& button": {
            display: "none",
          },

          "&:hover": {
            "& [data-overlay]": {
              display: "block",
            },

            "& button": {
              display: "inline-flex",
            },
          },
        }}
      >
        <Box
          data-overlay
          css={{
            width: "100%",
            height: "100%",
            position: "absolute",
            background: `linear-gradient(
              to top,
              hsl(0, 0%, 0%) 0%,
              hsla(0, 0%, 0%, 0.738) 19%,
              hsla(0, 0%, 0%, 0.541) 34%,
              hsla(0, 0%, 0%, 0.382) 47%,
              hsla(0, 0%, 0%, 0.278) 56.5%,
              hsla(0, 0%, 0%, 0.194) 65%,
              hsla(0, 0%, 0%, 0.126) 73%,
              hsla(0, 0%, 0%, 0.075) 80.2%,
              hsla(0, 0%, 0%, 0.042) 86.1%,
              hsla(0, 0%, 0%, 0.021) 91%,
              hsla(0, 0%, 0%, 0.008) 95.2%,
              hsla(0, 0%, 0%, 0.002) 98.2%,
              hsla(0, 0%, 0%, 0) 100%
            )`,
            opacity: 0.7,
          }}
        ></Box>
        <Image
          src={
            track.artworkId
              ? `https://arweave.net/${track.artworkId}`
              : `https://source.boringavatars.com/marble/200/${track.creator}?square=true`
          }
        />
        <IconButton
          css={{
            br: 9999,
            color: "$whiteA12",
            backgroundColor: "$blackA12",
            opacity: 0.9,
            position: "absolute",
            width: 64,
            height: 64,
            left: 0,
            right: 0,
            ml: "auto",
            mr: "auto",
            top: 0,
            bottom: 0,
            mt: "auto",
            mb: "auto",

            "& svg": {
              fontSize: 28,
              transform: playing ? "translateX(0)" : "translateX(1px)",
            },

            "&:hover": {
              backgroundColor: "#000",
              opacity: 0.9,
            },

            "&:active": {
              transform: "scale(0.95)",
            },
          }}
          size="3"
          data-playing={playing}
          aria-checked={playing}
          role="switch"
          onClick={handleClick}
        >
          {playing ? <IoPauseSharp /> : <IoPlaySharp />}
        </IconButton>
      </Box>
      <Box>
        <Typography contrast="hi">{track?.title || "Undefined"}</Typography>
        <Typography>
          {abbreviateAddress({
            address: track.creator,
            options: { endChars: 5, noOfEllipsis: 3 },
          })}
        </Typography>
      </Box>
    </Flex>
  );
};

export const Discover = () => {
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Track[]>([]);

  useEffect(() => {
    fetchTracks();
    // fetchAlbums();
  }, []);

  const fetchTracks = async () => {
    const tracks = await getRecentTracks("https://arweave.net");
    setRecentTracks(tracks);
  };

  // const fetchAlbums = async () => {
  //   const albums = await getRecentAlbums("https://arweave.net");
  //   setRecentAlbums(albums);
  // };

  return (
    <Flex direction="column" gap="20">
      <Flex direction="column">
        <Typography
          css={{ mb: "$3" }}
          as="h2"
          size="6"
          weight="4"
          contrast="hi"
        >
          latest tracks
        </Typography>
        {recentTracks && recentTracks.length > 0 && (
          <Flex wrap="wrap" gap="10">
            {recentTracks.map((track, idx) => (
              <TrackCard
                key={track.txid}
                track={track}
                trackIndex={idx}
                tracks={recentTracks}
              />
            ))}
          </Flex>
        )}
      </Flex>{" "}
      <Flex direction="column">
        <Typography
          css={{ mb: "$3" }}
          as="h2"
          size="6"
          weight="4"
          contrast="hi"
        >
          latest albums
        </Typography>
        {/* {recentAlbums && recentAlbums.length > 0 && (
          <Flex wrap="wrap" gap="10">
            {recentAlbums.map((track) => (
              <TrackCard key={track.txid} track={track} />
            ))}
          </Flex>
        )} */}
      </Flex>
    </Flex>
  );
};
