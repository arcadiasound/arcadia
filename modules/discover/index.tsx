import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { getRecentAlbums } from "@/lib/getRecentAlbums";
import { getRecentTracks } from "@/lib/getRecentTracks";
import { useQuery } from "@tanstack/react-query";
import { TrackCard } from "../track/TrackCard";
import { styled } from "@/stitches.config";
import { Skeleton } from "@/ui/Skeleton";
import { useMotionAnimate } from "motion-hooks";
import { stagger } from "motion";
import { useEffect } from "react";
import { getFeaturedTracks } from "@/lib/getFeaturedTracks";
import Carousel from "nuka-carousel";

const TrackSkeleton = styled(Skeleton, {
  width: 200,
  height: 200,
});

export const Discover = () => {
  const { play } = useMotionAnimate(
    ".trackItem",
    { opacity: 1 },
    {
      delay: stagger(0.03),
      duration: 0.3,
      easing: "ease-in-out",
    }
  );

  const {
    data: recentTracks,
    isError,
    isLoading,
  } = useQuery({
    queryKey: [`recentTracks`],
    queryFn: () => getRecentTracks(),
  });

  useEffect(() => {
    console.log(recentTracks);
    if (recentTracks && recentTracks.length > 0) {
      play();
    }
  }, [recentTracks]);

  return (
    <Flex
      css={{
        ".trackItem": {
          opacity: 0,
        },
      }}
      direction="column"
      gap="20"
    >
      <Flex direction="column">
        <Typography
          css={{ mb: "$3" }}
          as="h2"
          size="4"
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
        {isLoading && (
          <Flex wrap="wrap" gap="10">
            <TrackSkeleton />
            <TrackSkeleton />
            <TrackSkeleton />
            <TrackSkeleton />
            <TrackSkeleton />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
