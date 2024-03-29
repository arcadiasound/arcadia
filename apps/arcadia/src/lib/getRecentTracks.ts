import { appConfig } from "@/apps/arcadia/appConfig";
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
// import { gql } from "./helpers";

export const getRecentTracks = async () => {
  try {
    const res = await queryRecentTracks([]);

    return res;
  } catch (error: any) {
    throw error;
  }
};

// maximum number of recursive calls
const MAX_RECURSION_DEPTH = 10;
const MAX_ITEMS = 15;

const queryRecentTracks = async (
  tracks: Track[],
  cursor?: string,
  depth: number = 0
): Promise<Track[]> => {
  if (tracks.length >= MAX_ITEMS || depth >= MAX_RECURSION_DEPTH) {
    return removeDuplicatesByCreator(removeDuplicatesByTxid(tracks)).slice(
      0,
      MAX_ITEMS
    );
  }

  const variables: GQLQuery["variables"] = {
    tags: [
      {
        name: "Content-Type",
        values: ["audio/mpeg", "audio/wav", "audio/aac"],
      },
      {
        name: "Indexed-By",
        values: ["ucm"],
      },
      {
        name: "App-Name",
        values: ["SmartWeaveContract"],
      },
      {
        name: "App-Version",
        values: ["0.3.0"],
      },
      {
        name: "Contract-Src",
        values: ["Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ"],
      },
    ],
  };

  if (cursor) {
    variables.after = cursor;
  }

  const res: GetTransactionsQuery = await gql({
    variables,
  });

  console.log(res);

  const resultsArray = res.transactions.edges;

  if (resultsArray.length === 0) {
    return removeDuplicatesByCreator(removeDuplicatesByTxid(tracks)).slice(
      0,
      MAX_ITEMS
    );
  }

  const data = filterQueryResults(res);

  console.log(data);

  tracks = tracks.concat(data);
  const lastItem = resultsArray[resultsArray.length - 1];

  return await queryRecentTracks(tracks, lastItem?.cursor, depth + 1);
};

const filterQueryResults = (res: GetTransactionsQuery) => {
  const data = res.transactions.edges
    .filter((edge) => !appConfig.featuredIds.includes(edge.node.id))
    .filter((edge) => !appConfig.hiddenIds.includes(edge.node.id))
    .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
    .filter(
      (edge) => edge.node.tags.find((x) => x.name === "Env")?.value !== "Test"
    )
    .filter(
      (edge) =>
        edge.node.tags.find((x) => x.name === "Intent")?.value !== "Test"
    )
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

const gql = async ({ variables }: GQLQuery): Promise<GetTransactionsQuery> => {
  const query = {
    query: `
    query {
      transactions(
        first: 20,
        after: "${variables.after}",
        tags: [
          {
            name: "Content-Type",
            values: ["audio/mpeg", "audio/wav", "audio/aac"],
            },
            {
            name: "Indexed-By",
            values: ["ucm"],
            },
            {
            name: "App-Name",
            values: ["SmartWeaveContract"],
            },
            {
            name: "App-Version",
            values: ["0.3.0"],
            },
            {
            name: "Contract-Src",
            values: ["Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ"],
            }
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
