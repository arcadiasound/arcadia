import { Box } from "@/components/Box";
import { Flex } from "@/components/Flex";
import { Image } from "@/components/Image";
import { Typography } from "@/components/Typography";
import { getRecentAlbums } from "@/lib/getRecentAlbums";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { abbreviateAddress } from "@/utils";
import { useEffect, useState } from "react";

interface Track {
  title: string | undefined;
  creator: string;
  artworkId: string | undefined;
  src: string;
  hasLicense: boolean;
  txid: string;
  accessFee: string | undefined;
}

const TrackCard = ({ track }: { track: Track }) => {
  return (
    <Flex direction="column" gap="2">
      <Box
        css={{
          width: 200,
          height: 200,
        }}
      >
        <Image
          src={
            track.artworkId
              ? `https://arweave.net/${track.artworkId}`
              : `https://source.boringavatars.com/marble/200/${track.creator}?square=true`
          }
        />
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
            {recentTracks.map((track) => (
              <TrackCard key={track.txid} track={track} />
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
