import { useGetUserProfile } from "@/hooks/appData";
import { getTracks } from "@/lib/track/getTracks";
import { TrackCard } from "@/modules/track/TrackCard";
import { abbreviateAddress } from "@/utils";
import { Box, Grid, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";

interface LikesProps {
  address: string;
}

export const Likes = (props: LikesProps) => {
  // update to query users releases
  const { data: tracks } = useQuery({
    queryKey: [`tracks`],
    refetchOnWindowFocus: false,
    queryFn: () => getTracks({ txids: undefined }),
  });

  const { data } = useGetUserProfile({ address: props.address });

  const profile = data?.profiles.length ? data.profiles[0] : undefined;

  return (
    <Box mt="3">
      <Grid asChild columns="6" gapX="2" gapY="7" width="auto">
        <ul>
          <Text weight="medium">
            {profile?.name || abbreviateAddress({ address: props.address })}'s Likes
          </Text>
        </ul>
      </Grid>
    </Box>
  );
};
