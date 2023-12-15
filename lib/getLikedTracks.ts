import { appConfig } from "@/appConfig";
import { GQLQuery, Track } from "@/types";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, {
  GetTransactionsQuery,
  SortOrder,
  Transaction,
  TransactionEdge,
} from "arweave-graphql";
import { gql } from "./helpers";

export const getLikedTracks = async (address: string, gateway?: string) => {
  try {
    const res = await queryLikedTracks(address);

    return res;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};

const getStampedIds = async (address: string, cursor?: string) => {
  console.log("cursor", cursor);
  const res = await gqlStampedIds(address, cursor);

  const stampTxs = res.transactions.edges
    .filter(
      (edge) => edge.node.tags.find((tag) => tag.name === "Data-Source")?.value
    )
    .map((edge) => {
      const cursor = edge.cursor;
      const id = edge.node.tags.find((tag) => tag.name === "Data-Source")
        ?.value as string;

      return {
        id,
        cursor,
      };
    });

  console.log("stampTxs: ", stampTxs);

  return stampTxs;
};

const queryLikedTracks = async (
  address: string,
  cursor?: string,
  timesRefetched: number = 0
): Promise<Track[]> => {
  let tracks: Track[] = [];
  let refetchLimit = 3;

  const stampTxs = await getStampedIds(address, cursor);
  const stampIds = stampTxs.map((stampTx) => stampTx.id);

  // if no stamps txs found, no need to continue queries
  if (!stampTxs.length) {
    return [];
  }

  if (cursor) {
    console.log(cursor);
  }

  const variables: GQLQuery["variables"] = {
    ids: stampIds,
    tags: [
      {
        name: "Content-Type",
        values: ["audio/mpeg", "audio/wav", "audio/x-m4a"],
      },
      {
        name: "App-Name",
        values: ["SmartWeaveContract"],
      },
    ],
  };

  const res = await gql({
    variables,
  });

  const data = filterQueryResults(res);

  tracks = tracks.concat(data);

  console.log(tracks);

  if (tracks.length) {
    return removeDuplicatesByCreator(removeDuplicatesByTxid(tracks));
  } else {
    timesRefetched++;
    if (timesRefetched > refetchLimit) {
      return [];
    }
    const stampCursors = stampTxs.map((stampTx) => stampTx.cursor);
    const lastStampId = stampCursors[stampCursors.length - 1];

    return await queryLikedTracks(address, lastStampId, timesRefetched);
  }
};

const filterQueryResults = (res: GetTransactionsQuery) => {
  const data = res.transactions.edges
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

  console.log({ dedupedData });

  return dedupedData;
};

const gqlStampedIds = async (
  address: string,
  cursor?: string
): Promise<GetTransactionsQuery> => {
  const query = {
    query: `
    query {
      transactions(
        first: 50,
        after: "${cursor}",
        owners: ["${address}"],
        tags: [
          {
            name: "Protocol-Name",
            values: ["Stamp"],
          },
        ]
      ){
      edges {
        cursor
        node {
          id
          tags {
            name
            value
          }
        }
      }
    }
  }
    `,
  };

  const response = await fetch(`${appConfig.goldskyUrl}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  const resObj = await response.json();

  return resObj.data;
};
