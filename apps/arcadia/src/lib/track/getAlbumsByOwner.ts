import { GetTracksByOwner } from "@/types/query";
import { gql } from "../helpers/gql";
import { TransactionEdge } from "arweave-graphql";
import { GQLQuery, Track } from "@/types";
import { setAlbumInfo } from "../helpers/setAlbumInfo";

export const getAlbumsByOwner = async ({ limit = 10, ...props }: GetTracksByOwner) => {
  const variables: GQLQuery["variables"] = {
    first: limit,
    owners: [props.owner],
    tags: [
      {
        name: "Content-Type",
        values: ["application/json"],
      },
      {
        name: "Collection-Type",
        values: ["audio"],
      },
    ],
  };

  if (props.cursor) {
    variables.after = props.cursor;
  }

  try {
    const res = await gql({ variables });
    console.log("albums: ", { res });

    const filteredRes = res.transactions.edges
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      .filter((edge) => edge.node.tags.find((x) => x.name === "Thumbnail"))
      .filter((edge) => edge.node.tags.find((x) => x.name === "Artwork"))
      .map((edge) => setAlbumInfo(edge as TransactionEdge));

    const data = await Promise.all(filteredRes);
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
