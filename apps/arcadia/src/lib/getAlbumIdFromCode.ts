import { setTrackInfo } from "../utils/setTrackInfo";
import arweaveGql, { Transaction, TransactionEdge } from "arweave-graphql";
import { appConfig } from "@/apps/arcadia/appConfig";
import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";

export const getAlbumIdFromCode = async (collectionCode: string) => {
  try {
    const res = await arweaveGql(
      `${appConfig.defaultGateway}/graphql`
    ).getTransactions({
      tags: [
        {
          name: "Type",
          values: ["Document"],
        },
        {
          name: "Collection-Code",
          values: [collectionCode],
        },
      ],
    });

    const data = res.transactions.edges[0].node.id;

    console.log("albumIdFromCode", data);

    return data;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
