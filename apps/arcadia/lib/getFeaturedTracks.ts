import { setTrackInfo } from "../utils/setTrackInfo";
import arweaveGql, { Transaction, TransactionEdge } from "arweave-graphql";
import { appConfig } from "@/apps/arcadia/appConfig";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";

export const getFeaturedTracks = async () => {
  try {
    const res = await arweaveGql(
      `${appConfig.defaultGateway}/graphql`
    ).getTransactions({
      ids: appConfig.featuredIds,
    });

    const data = res.transactions.edges.map((edge) =>
      setTrackInfo(edge as TransactionEdge, "https://arweave.net")
    );

    // console.log("featured:", { data });
    const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

    return dedupedData;
    // return data;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
