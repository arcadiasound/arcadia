import { appConfig } from "@/appConfig";
import { GQLQuery, Track } from "@/types";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import {
  GetTransactionsQuery,
  Transaction,
  TransactionEdge,
} from "arweave-graphql";
import { gql } from "./helpers";

export const getRecentTracks = async () => {
  try {
    const res = await queryRecentTracks([]);

    return res;
  } catch (error: any) {
    throw error;
  }
};

const queryRecentTracks = async (
  tracks: Track[],
  cursor?: string
): Promise<Track[]> => {
  console.log({ tracks });

  if (tracks.length >= 5) {
    return tracks.slice(0, 5);
  }

  const variables: GQLQuery["variables"] = {
    tags: [
      {
        name: "Content-Type",
        values: ["audio/mpeg", "audio/wav"],
      },
      {
        name: "App-Name",
        values: ["SmartWeaveContract"],
      },
    ],
  };

  if (cursor) {
    // variables.first = tracks.length * 2;
    variables.after = cursor;
  }

  const res = await gql({
    variables: {
      ...variables,
    },
  });

  const data = filterQueryResults(res);

  tracks = tracks.concat(data);

  if (tracks.length >= 5) {
    return tracks.slice(0, 5);
  } else {
    const lastItem = data[data.length - 1];

    // double what we need to account for post-query filtering
    return await queryRecentTracks(tracks, lastItem?.cursor);
  }
};

const filterQueryResults = (res: GetTransactionsQuery) => {
  const data = res.transactions.edges
    .filter((edge) => !appConfig.featuredIds.includes(edge.node.id))
    .filter((edge) => Number(edge.node.data.size) < 1e8)
    .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
    .filter(
      (edge) =>
        edge.node.tags.find((x) => x.name === "Indexed-By")?.value === "ucm"
    )
    .filter(
      (edge) =>
        edge.node.tags.find((x) => x.name === "Contract-Src")?.value ===
        appConfig.atomicAssetSrc
    )
    .filter((edge) => edge.node.tags.find((x) => x.name === "Thumbnail")?.value)
    .map((edge) =>
      setTrackInfo(edge as TransactionEdge, appConfig.defaultGateway)
    );

  const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

  return dedupedData;
};
