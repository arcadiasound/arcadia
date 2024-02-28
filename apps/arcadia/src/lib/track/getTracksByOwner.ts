import { GetTracksByOwner } from "@/types/query";
import { gql } from "../helpers/gql";
import { appConfig } from "@/config";
import { setTrackInfo } from "../helpers/setTrackInfo";
import { TransactionEdge } from "arweave-graphql";
import { GQLQuery, Track } from "@/types";

export const getTracksByOwner = async ({ limit = 10, ...props }: GetTracksByOwner) => {
  const variables: GQLQuery["variables"] = {
    first: limit,
    owners: [props.owner],
    tags: [
      {
        name: "Content-Type",
        values: appConfig.acceptedFileTypes.streamableAudio,
      },
    ],
  };

  try {
    const res = await gql({ variables });
    console.log({ res });

    const filteredRes = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter((edge) => edge.node.tags.find((x) => x.name === "Thumbnail"))
      .filter((edge) => edge.node.tags.find((x) => x.name === "Artwork"))
      .filter((edge) => {
        // don't show album items
        // will need to revise as we may not always want to filter by this
        const CollectionCode = edge.node.tags.find((x) => x.name === "Collection-Code")?.value;

        if (CollectionCode) {
          return false;
        } else {
          return true;
        }
      })
      .map((edge) => setTrackInfo(edge as TransactionEdge));

    const data = filteredRes;
    // bc we are filtering, we need additional check to be sure there is actually more data
    // easiest way is to check whether or not results match the limit, if set (default is 10)
    const maxItems = filteredRes.length === limit;
    const hasNextPage = res.transactions.pageInfo.hasNextPage && maxItems;

    return {
      data,
      hasNextPage,
    };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};
