import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { getRecentAlbums } from "@/lib/getRecentAlbums";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { useQuery } from "@tanstack/react-query";
import { TrackCard } from "../track/TrackCard";

export const Discover = () => {
  const { data: recentTracks, isError } = useQuery({
    queryKey: [`recentTracks`],
    refetchOnWindowFocus: false,
    queryFn: () => getRecentTracks(),
  });

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
      </Flex>
    </Flex>
  );
};
