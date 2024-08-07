import { useGetUserProfile } from "@/hooks/appData";
import { getTracks } from "@/lib/track/getTracks";
import { abbreviateAddress } from "@/utils";
import { Box, Grid, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";

interface CollectionProps {
  address: string;
}

export const Collection = (props: CollectionProps) => {
  // update to query users collection
  // const { data: tracks } = useQuery({
  //   queryKey: [`tracks`],
  //   refetchOnWindowFocus: false,
  //   queryFn: () => getTracks({ txids: undefined }),
  // });
  const { address } = props;

  const { data: profile } = useGetUserProfile({ address });

  return (
    <Box mt="3">
      <Grid asChild columns="6" gapX="2" gapY="7" width="auto">
        <ul>
          <Text weight="medium">
            {profile?.Info?.name || abbreviateAddress({ address: props.address })}'s Collection
          </Text>
        </ul>
      </Grid>
    </Box>
  );
};
