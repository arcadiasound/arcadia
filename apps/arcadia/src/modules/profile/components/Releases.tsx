import { useGetUserProfile } from "@/hooks/appData";
import { getTracks } from "@/lib/track/getTracks";
import { TrackCard } from "@/modules/track/TrackCard";
import { abbreviateAddress } from "@/utils";
import {
  Box,
  Grid,
  Heading,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { useQuery } from "@tanstack/react-query";

const StyledTabsRoot = styled(TabsRoot, {
  ".rt-TabsList": {
    boxShadow: "none",
    backgroundColor: "var(--gray-3)",
    width: "max-content",
    height: 36,
    borderRadius: `max(var(--radius-1), var(--radius-full))`,
  },

  ".rt-TabsTrigger": {
    paddingInline: "var(--space-1)",
  },

  ".rt-TabsTrigger:where([data-state='active'])::before": {
    height: 0,
  },

  ".rt-TabsTrigger:where([data-state='active'])": {
    ".rt-TabsTriggerInner": {
      backgroundColor: "var(--gray-12)",
      color: "var(--gray-1)",
    },
  },

  ".rt-TabsTriggerInner, .rt-TabsTriggerInnerHidden": {
    paddingInline: "var(--space-3)",
    borderRadius: `max(var(--radius-1), var(--radius-full))`,
  },
});

interface ReleasesProps {
  address: string;
}

export const Releases = (props: ReleasesProps) => {
  // update to query users releases
  const { data: tracks } = useQuery({
    queryKey: [`tracks`],
    refetchOnWindowFocus: false,
    queryFn: () => getTracks({ txids: undefined }),
  });

  const { data } = useGetUserProfile({ address: props.address });

  const profile = data?.profiles.length ? data.profiles[0] : undefined;

  return (
    <Box mt="5">
      <Heading as="h3" size="5" weight="medium">
        {profile?.name || abbreviateAddress({ address: props.address })}'s Discography
      </Heading>
      <StyledTabsRoot defaultValue="all" mt="4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="singles">Singles </TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
        </TabsList>

        <Box mt="3" pb="2">
          <TabsContent value="all">
            <Grid mt="4" columns="6" gapX="2" gapY="7" width="auto" asChild>
              <ul>
                {tracks?.length &&
                  tracks.map((track, idx) => (
                    <TrackCard key={track.txid} track={track} tracks={tracks} trackIndex={idx} />
                  ))}
              </ul>
            </Grid>
          </TabsContent>
          <TabsContent value="singles">Singles</TabsContent>
          <TabsContent value="albums">Albums</TabsContent>
        </Box>
      </StyledTabsRoot>
    </Box>
  );
};
