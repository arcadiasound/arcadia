import { Flex, Grid } from "@radix-ui/themes";
import { TrackCard } from "@/modules/track/TrackCard";
// import { TrackItem } from "./TrackItem";
import { useEffect, useState } from "react";
// import { getTrack } from "@/lib/track/getTrack";
import { Track } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getTracks } from "@/lib/track/getTracks";

export const Home = () => {
  const { data: tracks } = useQuery({
    queryKey: [`tracks`],
    refetchOnWindowFocus: false,
    queryFn: () => getTracks({ txids: undefined }),
  });

  return (
    <Flex direction="column" gap="5" pb="5">
      <Grid p="5" asChild columns="6" gapX="2" gapY="7" width="auto">
        <ul>
          {tracks?.length &&
            tracks.map((track, idx) => (
              <TrackCard key={track.txid} track={track} tracks={tracks} trackIndex={idx} />
            ))}
        </ul>
      </Grid>
      {/* <Grid p="3" gap="2" asChild>
        <ul>
          {tracks?.length &&
            tracks.map((track, idx) => (
              <TrackItem
                key={track.txid}
                track={track}
                tracks={tracks}
                trackIndex={idx}
              />
            ))}
        </ul>
      </Grid> */}
    </Flex>
  );
};
