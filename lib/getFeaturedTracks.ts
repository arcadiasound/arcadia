import { setTrackInfo } from "../utils/setTrackInfo";
import arweaveGql, { Transaction } from "arweave-graphql";
import { appConfig } from "@/appConfig";

export const getFeaturedTracks = async () => {
  try {
    const res = await arweaveGql(
      `${"https://arweave.net"}/graphql`
    ).getTransactions({
      ids: appConfig.featuredIds,
    });

    const data = res.transactions.edges.map((edge) =>
      setTrackInfo(edge.node as Transaction, "https://arweave.net")
    );

    // const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

    // return dedupedData;
    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
