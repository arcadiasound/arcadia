import { appConfig } from "@/appConfig";
import { gql } from "@/lib/helpers";
import { AssetCollectionResponse } from "@/types";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import { GetTransactionsQuery, TransactionEdge } from "arweave-graphql";

export const getAssetCollection = async (address: string) => {
  try {
    const assetRes = await fetch(
      `${appConfig.dreU}/balances?walletAddress=${address}&indexes=ucm&limit=100`
    );

    const data: AssetCollectionResponse = await assetRes.json();

    console.log("all assets: ", { data });

    const assetIds = data.balances.map((asset) => asset.contract_tx_id);

    const tracksRes = await gql({
      variables: {
        ids: assetIds,
        tags: [
          {
            name: "Content-Type",
            values: ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/ogg"],
          },
        ],
      },
    });

    console.log("tracks ", { tracksRes });

    const tracks = filterQueryResults(tracksRes);
    return tracks;
  } catch (error) {
    throw error;
  }
};

const filterQueryResults = (res: GetTransactionsQuery) => {
  const data = res.transactions.edges
    .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
    .filter((edge) => edge.node.tags.find((x) => x.name === "Thumbnail")?.value)
    .map((edge) =>
      setTrackInfo(edge as TransactionEdge, appConfig.defaultGateway)
    );

  const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

  return dedupedData;
};
