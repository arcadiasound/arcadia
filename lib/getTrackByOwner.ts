import {
  removeDuplicatesByCreator,
  removeDuplicatesByTxid,
} from "@/utils/query";
import { setTrackInfo } from "@/utils/setTrackInfo";
import arweaveGql, {
  SortOrder,
  Transaction,
  TransactionEdge,
} from "arweave-graphql";

export const getTrackByOwners = async (address: string, gateway?: string) => {
  try {
    const res = await arweaveGql(
      `${gateway || "https://arweave.net"}/graphql`
    ).getTransactions({
      owners: [address],
      tags: [
        {
          name: "Content-Type",
          values: ["audio/mpeg", "audio/wav", "audio/aac"],
        },
        {
          name: "App-Name",
          values: ["SmartWeaveContract"],
        },
      ],
    });

    const data = res.transactions.edges
      // .filter((edge) => Number(edge.node.data.size) < 1e8)
      .filter((edge) => edge.node.tags.find((x) => x.name === "Title"))
      // .filter((edge) => {
      //   const initStateTag = edge.node.tags.find(
      //     (x) => x.name === "Init-State"
      //   )?.value;

      //   console.log(initStateTag);

      //   const initState = initStateTag ? JSON.parse(initStateTag) : undefined;

      //   const isOwner = Object.keys(initState.balances).includes(address);

      //   if (isOwner) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // })
      .map((edge) =>
        setTrackInfo(edge as TransactionEdge, gateway || "https://arweave.net")
      );

    console.log(data);

    const dedupedData = removeDuplicatesByCreator(removeDuplicatesByTxid(data));

    return dedupedData;
  } catch (error: any) {
    console.error(error);
    throw new Error("Error occured whilst fetching data:", error.message);
  }
};
